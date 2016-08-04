'use strict';

//DATABASE MODELS
var CTypes = require('../../models/content_types').CTypes,
    Groups = require('../../models/groups').Groups;

//NODE MODULES
var tungus = require('tungus'),
    mongoose = require('mongoose'),
    fs = require('fs-extra'),
    path = require('path');

//HELPERS
var config = require('../../config/config'),
    media = require('./media_helper').helper,
    utils = require('./utils'),
    ctypesHelper;

//DB CONNECT
var Db = require('../../db');
    Db.db();

// GET GLOBALS
let globals = require ('../globals').controller;

ctypesHelper = exports.helper = {
    getTemplate: function(params) {

      /*  var homeParams,
            query = {};

        if (typeof params.req.params.params === 'undefined') {
            params.req.params.params = 'index';
        } else {
            homeParams = params.req.params.params.split('/');
            if (homeParams.length > 1) {
                query.permalink = '/'+params.req.params.params;
            }
            params.req.params.params = homeParams[0];
        }
        query.type = params.req.params.params;

        utils.checkGroups(params, function(data) {
            if (data.status == 'ok') {
                utils.templateGenerator(params, null);
            }
        });*/
    },
    getContent: (query, count, sort) =>{
      if(!count)count=1;
      if(!sort)sort='';
      return new Promise((resolve, reject) => {
        let dbName;
          /*
        let currentDBs = globals.get('ctypesDbs');
        if(Object.keys(query).indexOf('db')>=0 && query.db!=='default'){
            dbName=(currentDBs.hasOwnProperty(currentDBs))?currentDBs[query.db]:CTypes;
        }
        */
        dbName = ctypesHelper.getDB(query.db);
        dbName.find(query.q, function(err, curr) {
          if (err) reject(new Error(err.message))
          //if (curr.length==0) {reject(new Error('no content'));}
          resolve(curr);
        }).sort(sort)
          .limit(count);
      })
    },
    getFile: (path) =>{
      return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function (err, contents) {
          if (err) reject(new Error(err.message))
          resolve(contents)
        })
      })
    },
    setFile: (path) =>{
      return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function (err, contents) {
          if (err) reject(new Error(err.message))
          resolve(contents)
        })
      })
    },
    getDB: (type) =>{
      let globalobj = globals.get('ctypesDbs');
      return (type !== 'default' && globalobj.hasOwnProperty(type)) ? globalobj[type] : CTypes;
    },
    getCType: function(params, callback) {
        try {
            //check if logged in
            var userSession = utils.checkPermission(params),
                userGroups = [];

            if (userSession) {
                userSession.groups.forEach(function(el, i) {
                    userGroups.push(el.group);
                })
            } else {
                userGroups = ['guest'];
            }
            if (typeof params.req.params.type !== 'undefined') {
                var query = {author: {$ne: 'system'}, type: params.req.params.type};
                if(typeof params.req.params.id !=='undefined')query._id = params.req.params.id;

                if (params.req.params.type == 'groups') {
                    Groups.find(function(err, curr) {
                        if (err) throw err.message;

                        params.psOut = 'reply';
                        params.psOutReply = {
                            status: 'ok',
                            message: '',
                            data: curr
                        };
                        utils.output(params);
                    });
                }else if (params.req.params.type == 'media') {


                  let backDir = path.resolve(__dirname, '../../../')+'/server/uploads/';
                  media.readDir(backDir).then((items)=>{
                    params.psOut = 'reply';
                     params.psOutReply = {
                      status: 'ok',
                      message: '',
                      data: items
                    };
                    utils.output(params);
                  })



                } else {



                    CTypes.find({name: params.req.params.type, type: 'contenttypes'}, function(err, curr) {
                        if (err) throw err.message;

                        let dbObjs = CTypes,
                            dataParent,
                            ctDb='default',
                            categories = [];
                        if (curr.length > 0) {
                            categories = curr[0].category;
                            /// GET CONTENT FROM CTYPE PARENT
                            dataParent = (typeof curr[0].content !== 'undefined')?curr[0].content:[];
                            ctDb=curr[0].source[0].db;
                        }
                        ctypesHelper.getDB(ctDb).find(query, '-source -__v', function(err, curr) {
                            if (err) throw err.message;
                            params.psOut = 'reply';
                            params.psOutReply = {
                                status: 'ok',
                                message: '',
                                ctypeCont: dataParent,
                                data: curr,
                                categories: categories
                            };

                            if(curr.length>0) {
                              if(/\/api\/ctype\/contenttypes/.test(params.rep.request.path)) {
                                var backDir = path.resolve(__dirname, '../../')+'/views/admin/'+curr[0].name+'/'+curr[0].name+'.json';
                                fs.readJson(backDir, function (err, packageObj) {
                                  // WRITE NEW JSON IF NOT CREATED
                                  if(!packageObj){

                                    let frontFull = path.resolve(__dirname, '../../../')+'/template/src/'+curr[0].name+'.html',
                                        summFull = path.resolve(__dirname, '../../../')+'/template/src/'+curr[0].name+'_summ.html',
                                        backFull = path.resolve(__dirname, '../../')+'/views/admin/'+curr[0].name+'/'+curr[0].name+'.html';

                                    Promise.all([
                                      ctypesHelper.getFile(frontFull),
                                      ctypesHelper.getFile(summFull),
                                      ctypesHelper.getFile(backFull)
                                    ]).then((files) => {
                                      packageObj = {
                                        htmlFront:JSON.stringify(files[0]),
                                        htmlSumm:JSON.stringify(files[1]),
                                        htmlBack:JSON.stringify(files[2])
                                      }
                                      params.psOutReply.template=packageObj;
                                      utils.output(params);
                                    }).catch((err)=>{
                                      console.log('could not open file',err)
                                      params.psOutReply.template=packageObj;
                                      utils.output(params);
                                    })
                                  }else{
                                    params.psOutReply.template=packageObj;
                                    utils.output(params);
                                  }
                                })
                              }else{
                                utils.output(params);
                              }
                            } else {
                                utils.output(params);
                            }
                        });
                    });
                }

            } else {
                //GET MENUS
                utils.checkGroups(params, function(data) {
                    if (data.status == 'ok') {

                        var query = {type: 'menus'};

                        if (userGroups.indexOf('admin') < 0) {
                            query['groups.group'] = {$in: userGroups};
                        }

                        //get user group content
                        CTypes.find(query, function(err, curr) {
                            if (err) throw err.message;

                            callback({
                                status: 'ok',
                                message: '',
                                data: curr,
                                groups: userGroups
                            });
                        });
                    }
                });
            }
        } catch(err) {
            if (typeof callback !== 'undefined') {
                callback({
                    status: 'nok',
                    message: err,
                    data: ''
                });
            } else {
                params.psOut = 'reply';
                params.psOutReply = {
                    status: 'nok',
                    message: err,
                    data: ''
                };
                utils.output(params);
            }
        }
    },
    editCType: function(params) {
        try {
            //check if logged in
            var userSession = utils.checkPermission(params);

            if (userSession) {
                if (typeof params.req.params.type !== 'undefined') {
                    var userGroups = userSession.groups;
                    var query = {};

                    if (params.req.params.type == 'groups') {
                        if(typeof params.req.params.id !=='undefined')query._id = params.req.params.id;

                        Groups.find(query, function(err, curr) {
                            if (err) throw err.message;

                            params.psOut = 'reply';
                            params.psOutReply = {
                                status: 'ok',
                                message: '',
                                data: curr
                            };
                            utils.output(params);
                        });
                    } else {

                        CTypes.find({name: params.req.params.type, type: 'contenttypes'}, function(err, curr) {
                            if (err) throw err.message;


                            query = {author: {$ne: 'system'}, type: params.req.params.type};
                            if (typeof params.req.params.id !== 'undefined')query._id = params.req.params.id;
                            let ctDb = (curr.length > 0)?curr[0].source[0].db:'default'
                            ctypesHelper.getDB(ctDb).find(query, function (err, curr) {
                                if (err) throw err.message;

                                params.psOut = 'reply';
                                params.psOutReply = {
                                    status: 'ok',
                                    message: '',
                                    data: curr
                                };
                                utils.output(params);
                            });
                        });
                    }

                } else {
                    throw 'invalid request';
                }
            } else {
                throw 'loggedout';
            }
        } catch(err) {
            params.psOut = 'reply';
            params.psOutReply = {
                status: 'nok',
                message: err,
                data: ''
            };
            utils.output(params);
        }
    },
    editMenu: function(params) {
        try {
            //check if logged in
            var userSession = utils.checkPermission(params);

            if (userSession) {

                var payload = params.req.payload,
                    idArr = [],
                    weightArr = [],
                    dataLen = Object.keys(payload.data).length,
                    i = 1;

                for (var key in payload.data) {
                    idArr.push(key);
                    weightArr.push(payload.data[key]);

                    CTypes.findByIdAndUpdate({_id: key}, {$set: {'content.0.weight': payload.data[key]}}, function(err, curr) {
                        if (err) throw err.message;

                        if (i == dataLen) {
                            params.psOut = 'reply';
                            params.psOutReply = {
                                status: 'ok',
                                message: '',
                                data: ''
                            };
                            utils.output(params);
                        }
                        i++;
                    });
                }
            } else {
                throw 'loggedout';
            }
        } catch(err) {
            params.psOut = 'reply';
            params.psOutReply = {
                status: 'nok',
                message: err,
                data: ''
            };
            utils.output(params);
        }
    },
    setCType: function(params) {
        try {
            var userSession = utils.checkPermission(params);

            //check if logged in
            if (userSession) {
                var defaults = require('./defaults');

                var userGroups = userSession.groups,
                    payload = params.req.payload,
                    typename = payload.title.replace(/\W/gim,""),
                    typename = typename.toLowerCase(),
                    groups = userSession.groups;

                if (payload.groups.length > 0) {
                    groups = payload.groups
                }

                var adminFlag = true;
                groups.forEach(function(el, i) {
                    if (el.group == 'admin') {
                        adminFlag = false;
                    }
                });

                if (adminFlag) {
                    groups.push({
                        group: 'admin',
                        name: 'Admin'
                    })
                }

                if (typename == 'category') {
                    params.psOutReply = {
                        status: 'nok',
                        message: 'reserved_name',
                        data: ''
                    };
                    params.psOut = 'reply';
                    utils.output(params);
                } else {
                    CTypes.find({name: typename, type: payload.type}, function(err, curr) {
                        if (err) throw err.message;
                        if (curr.length > 0) {

                            var dbtype = new defaults.emptyCType();

                            payload.data.icon = payload.icon;

                            //DB ITEM FOR NEW CONTENT TYPE
                            dbtype.name = typename;
                            dbtype.type = 'contenttypes';

                            if (Object.keys(payload.data).length > 0) {
                                dbtype.content.push(payload.data);
                            }

                            dbtype.author = userSession.name;
                            dbtype.groups = groups;

                            CTypes.update({_id: curr[0]._id}, { content: payload.data, groups: dbtype.groups }, function(err, ctypecurr) {
                                if(err) throw err.message;

                                CTypes.update({name: payload.title, type: 'menus'}, { groups: dbtype.groups }, function(err, curr) {
                                  if(err) throw err.message;

                                  if (Object.keys(payload).indexOf('htmlFront, htmlBack, htmlFront, htmlSumm')) {
                                    writeContents(function() {
                                      params.psOutReply = {
                                        status: 'ok',
                                        message: 'updated',
                                        data: ctypecurr
                                      };
                                      params.psOut = 'reply';
                                      utils.output(params);
                                    });
                                  } else {
                                    params.psOutReply = {
                                      status: 'ok',
                                      message: 'updated',
                                      data: ctypecurr
                                    };
                                    params.psOut = 'reply';
                                    utils.output(params);
                                  }

                                });
                            });
                        } else {

                            var menutype = new defaults.emptyCType();
                            var dbtype = new defaults.emptyCType();

                            payload.data.icon = payload.icon;

                            //MENU ITEM FOR NEW CONTENT TYPE
                            menutype.name = typename;
                            menutype.type = 'menus';
                            menutype.content.push({
                                name: payload.title,
                                path: '#/'+typename,
                                weight: 0,
                                childs: {
                                    add: {name: 'Add', path: '/add'},
                                    dit: {name: 'Edit', path: '/edit'}
                                },
                                icon:payload.icon
                            });
                            menutype.author = userSession.name;
                            menutype.groups = groups;


                            //DB ITEM FOR NEW CONTENT TYPE
                            dbtype.name = typename;
                            dbtype.type = 'contenttypes';

                            if (Object.keys(payload.data).length > 0) {
                                dbtype.content.push(payload.data);
                            }

                            dbtype.author = userSession.name;
                            dbtype.groups = groups;

                            CTypes.count({type: 'menus'}, function(err, curr) {
                                var menuWeight = curr;

                                menutype.content[0].weight = menuWeight;

                                CTypes.collection.insert([menutype, dbtype], function (err, curr) {
                                    if(err) throw err.message

                                    if (Object.keys(payload).indexOf('htmlFront, htmlBack, htmlFront, htmlSumm')) {
                                        writeContents(function() {
                                            params.psOutReply = {
                                                status: 'ok',
                                                message: 'item set',
                                                data: curr
                                            };
                                            params.psOut = 'reply';
                                            utils.output(params);
                                        });
                                    } else {
                                        params.psOutReply = {
                                            status: 'ok',
                                            message: 'item set',
                                            data: curr
                                        };
                                        params.psOut = 'reply';
                                        utils.output(params);
                                    }
                                });
                            });

                        }

                        //FILE WRITE FUNCTION
                        function writeContents(callback) {
                            var backDir = path.resolve(__dirname, '../../')+'/views/admin/',
                            frontDir = path.resolve(__dirname, '../../../')+'/template/src/',
                            summDir = path.resolve(__dirname, '../../../')+'/template/src/'

                            fs.ensureDir(backDir+'/'+typename, function(err) {
                                if(err) throw err.message;

                                //CREATE BACKEND FILE
                                fs.writeFile(backDir+'/'+typename+'/'+typename+'.json', JSON.stringify(payload.htmlBackAll), function(err) {
                                    if(err) throw err.message;

                                    //CREATE BACKEND FILE
                                    fs.writeFile(backDir+'/'+typename+'/'+typename+'.html', JSON.parse(payload.htmlBack), function(err) {
                                        if(err) throw err.message;

                                        //CREATE FRONTEND FILE
                                        fs.writeFile(frontDir+'/'+typename+'.html', JSON.parse(payload.htmlFront), function(err) {
                                            if(err) throw err.message;

                                            //CREATE SUMMARY FILE
                                            fs.writeFile(summDir+'/'+typename+'_summ.html', JSON.parse(payload.htmlSumm), function(err) {
                                                if(err) throw err.message;

                                                callback();
                                            });
                                        });
                                    });
                                });
                            });
                        }
                    });
                }

            } else {
                throw 'loggedout';
            }
        } catch(err) {
            return {
                status: 'nok',
                message: err,
                data: ''
            };
        }
    },
    updateChild: (dbtype, payload) => {
      return new Promise((resolve, reject) => {
        if (!payload.id || payload.id.length==0){reject(new Error('invalid'));}
        let cDB = ctypesHelper.getDB(payload.type);
        cDB.findByIdAndUpdate({_id: payload.id}, dbtype, {new: true}, function (err, curr) {
            if(err)reject(new Error(err.message));
            resolve(curr)
        });
      })
    },
    insertChild: (dbtype, payload) => {
      return new Promise((resolve, reject) => {
        if (payload.type == 'menus') {
            var checkSub = false;
            if (typeof payload.data.content.sub !== 'undefined' && payload.data.content.sub == 'true') {
                checkSub = true;
            }
            dbtype.permalink = '';
            dbtype.content = [{
                sub: checkSub,
                name: payload.title,
                path: payload.permalink,
                weight: 0,
                icon : payload.data.content.icon,
                childs: {}
            }];
        }
        let cDB = ctypesHelper.getDB(payload.type);
        cDB.collection.insert(dbtype, function (err, curr) {
            if(err) throw err.message;
            // ADD NEW CAT TO GLOBALS
            if(payload.type=='category')globals.set('category', globals.get('category').push({id:0,permalink:permalink,db:payload.source}))
            resolve(curr)
        });
      })
    },
    setChild: function(params, bol) {
      return new Promise((resolve, reject) => {
          let userSession;
          if (typeof params.req.payload.from !== 'undefined' && params.req.payload.from == 'phc') {
              userSession = {
                  groups: [{group:"admin",name:"Admin"}],
                  name: 'PHC'
              }
          } else {
              userSession = utils.checkPermission(params);
          }
        // LOAD AND SET DEFAULTS
        let defaults = require('./defaults'),
            userGroups = userSession.groups,
            payload = params.req.payload,
            query = {permalink: payload.permalink},
            dbtype = new defaults.emptyCType(),
            fetchQuery = ctypesHelper.getContent,
            updateChild = ctypesHelper.updateChild,
            insertChild = ctypesHelper.insertChild;


            query.type = (payload.type != 'menus')?{$nin: ['menus']}:{$in: ['menus']};

            fetchQuery({db: payload.type, q: query})
              .then((curr)=>{
                if (curr.length > 0 && payload.saveType == 'new'){
                  reject(new Error('existing'));
                }else{
                  dbtype.name = payload.title;
                  dbtype.type = payload.type;
                  if (Object.keys(payload.data).length > 0) {
                      dbtype.content.push(payload.data);
                  }
                  if (typeof payload.source !== 'undefined') {
                      dbtype.source = payload.source;
                  }
                  dbtype.permalink = payload.permalink;
                  dbtype.author = userSession.name;
                  dbtype.groups = payload.groups;
                  dbtype.category = (payload.category);
                  //INSERT OR UPDATE CONTENT TYPE
                  if (payload.saveType == 'edit') {
                    //REJECT IF WE HAVE THE ID
                    updateChild(dbtype,payload)
                      .then((curr)=>{
                        resolve(curr)
                      }).catch(error => {
                          //EXISTING PERMALINK
                          reject('existing')
                      })
                  }else{
                    insertChild(dbtype, payload)
                      .then((curr)=>{
                        resolve(curr)
                      }).catch(error => {
                          //EXISTING PERMALINK
                          reject('existing')
                      })
                  }
                }
            })
            .catch(error => {
              console.log(error,'err')
              //EXISTING PERMALINK
              resolve('existing')
            })
      });
    },
    setSettings: function(params){
      try{
        var userSession = utils.checkPermission(params);
        //check if logged in
        if (userSession) {
          let payload = params.req.payload,
              dbtype={content:[]};
          dbtype.content.push(payload.data);

          CTypes.findOneAndUpdate({type: 'contenttypes', name:'settings'}, dbtype, {new: true}, function (err, curr) {
              if(err) throw err.message;
              params.psOutReply = {
                  status: 'ok',
                  message: 'item set',
                  data: curr
              };
              // update global with settings
              let globals = require('../globals').controller;
              globals.set('settings', payload.data);


              //output reply
              params.psOut = 'reply';
              utils.output(params);
          });


        }else {
            throw 'loggedout';
        }
      } catch(err) {
          return {
              status: 'nok',
              message: err,
              data: ''
          };
      }
    },
    deleteCType: function(params) {
        try {
            //check if logged in
            var userSession = utils.checkPermission(params);

            if (userSession) {

          //  }else if (params.req.params.type == 'media') {
                if (typeof params.req.params.id !== 'undefined') {

                    var userGroups = userSession.groups;

                    CTypes.find({_id: params.req.params.id}, function(err, curr) {
                        if (err) throw err.message;

                        if (curr.length > 0) {
                            var typename = curr[0].name,
                            backDir = path.resolve(__dirname, '../../')+'/views/admin/',
                            frontDir = path.resolve(__dirname, '../../../')+'/template/src/';

                            //REMOVE FILES AND MENU ITEM FOR MAIN CONTENT TYPE
                            if (curr[0].type == 'contenttypes') {
                                var IDArray = [];
                                IDArray.push(params.req.params.id);

                                CTypes.find({name: curr[0].name, type: 'menus'}, function(err, menus) {
                                    if (err) throw err.message;

                                    CTypes.find({type: typename}, function(err, content) {
                                        if (err) throw err.message;

                                        if (menus.length > 0) {
                                            IDArray.push(menus[0]._id);
                                        }

                                        if (content.length > 0) {
                                            for (var cont in content) {
                                                IDArray.push(content[cont]._id);
                                            }
                                        }

                                        CTypes.remove({_id: {$in: IDArray}}, function(err, curr) {
                                            if (err) throw err.message;

                                            //REMOVE BACKEND FOLDER
                                            fs.remove(backDir+'/'+typename, function(err) {
                                                if(err) throw err.message;

                                                //REMOVE FRONTEND FILE
                                                fs.remove(frontDir+'/'+typename+'.html', function(err) {
                                                    if(err) throw err.message;

                                                    //REMOVE SUMMARY FILE
                                                    fs.remove(frontDir+'/'+typename+'_summ.html', function(err) {
                                                        if(err) throw err.message;

                                                        params.psOut = 'reply';
                                                        params.psOutReply = {
                                                            status: 'ok',
                                                            message: '',
                                                            data: curr
                                                        };
                                                        utils.output(params);
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            } else {
                                //REMOVE CONTENT TYPE
                                CTypes.remove({_id: params.req.params.id}, function(err, curr) {
                                    if (err) throw err.message;

                                    params.psOut = 'reply';
                                    params.psOutReply = {
                                        status: 'ok',
                                        message: '',
                                        data: curr
                                    };
                                    utils.output(params);
                                });
                            }
                        } else {
                            params.psOut = 'reply';
                            params.psOutReply = {
                                status: 'nok',
                                message: 'wrong id',
                                data: ''
                            };
                            utils.output(params);
                        }
                    });



                } else {
                    throw 'wrong id';
                }
            } else {
                throw 'loggedout';
            }
        } catch(err) {
            params.psOut = 'reply';
            params.psOutReply = {
                status: 'nok',
                message: err,
                data: ''
            };
            utils.output(params);
        }
    }
}
