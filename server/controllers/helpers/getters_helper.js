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
    utils = require('./utils'),
    ctypesHelper = require('./ctypes_helper'),
    gettersHelper;

//DB CONNECT
var Db = require('../../db');
    Db.db();





gettersHelper = exports.helper = {
    getDir: function(dir, done) {
        fs.readdir(dir, function (err, files) {
            if (err) throw err;

            var filesTotal = [],
                filesNames = [],
                a = 0;

            files.map(function (file) {
                if(file.indexOf('.') >= 0) {
                    filesNames.push(file.split('.')[0]);
                }
                return path.join(dir, file);

            }).filter(function (file) {
                return fs.statSync(file).isFile();

            }).forEach(function (file) {
                filesTotal.push({'file': file, 'name': filesNames[a], 'type': path.extname(file)})
                a++;

            });

            done(null, filesTotal);
        });
      },
    getBlocks: function(params) {
        try {
            params.psOut = 'reply';

            gettersHelper.getDir(config.app.appDir + '/template/src/blocks', function(e, res) {
                var resOut = {}
                for(var r in res){
                  var nameSplit = res[r].name.split('_');
                  if(typeof resOut[nameSplit[0]] == 'undefined')resOut[nameSplit[0]]=new Array;
                  resOut[nameSplit[0]].push({name: nameSplit[1], category: nameSplit[0], file: '/admin/blocks/'+res[r].name+'.html'})
                }
                params.psOutReply = resOut;
                params.psOut = 'reply';
                utils.output(params);
            })

        } catch(err) {
            return {
                status: 'nok',
                message: err,
                data: ''
            };
        }
    },
    getInfo: function(params) {
      //get content types
      var groupsHelper = require('./groups_helper');

      var out = {};
      params.psOut = 'reply';

      try {
          ctypesHelper.helper.getCType(params, function(data) {
              if (data.status == 'ok') {
                  var userSession = utils.checkPermission(params);
                  out.ctype = data.data;
                  var curr = [];

                  curr['ctype'] = out.ctype;
                  var templateItems = {};
                  var outItems = {};
                  var totalItem = 0;

                  for(var key in curr) {
                    switch (key) {
                      case 'ctype':
                        for (var item in curr[key]) {
                          curr[key][item].groups.forEach(function(grp) {
                            if (typeof templateItems[grp.group] === 'undefined') templateItems[grp.group] = {};
                            if (typeof templateItems[grp.group][curr[key][item].type] === 'undefined') templateItems[grp.group][curr[key][item].type] = new Array();
                            delete curr[key][item].content[0].childs;
                            curr[key][item].content[0]._id=curr[key][item]._id;
                            templateItems[grp.group][curr[key][item].type].push(curr[key][item].content[0]);
                          })
                          totalItem++;

                        }
                        break;
                    }
                  }
                  outItems.totalItems = totalItem;
                  outItems.menus = templateItems;

                  for (var m in outItems.menus){
                    var menus= outItems.menus[m].menus;
                    outItems.menus[m]=menus.sort(utils.dynamicSort("weight"));
                  }

                  var query = {};

                  if (userSession) {
                      var userGroups = userSession.groups,
                          adminFlag = false,
                          queryCondition = [];

                      userGroups.forEach(function(el, i) {
                          queryCondition.push(el.group)
                          if (el.group == 'admin') {
                              adminFlag = true;
                          }
                      });

                      if (!adminFlag) {
                          query = {
                              'group': {$in: queryCondition}
                          }
                      }
                  }

                  Groups.find(query, '-_id name group', function(err, groups) {
                      if (err) throw err.message;

                      outItems.groups = groups;

                      params.psOutReply = outItems;
                      params.psOut = 'reply';
                      utils.output(params);
                  });

              } else {
                  params.psOutReply = {
                    status: 'nok',
                        message: err,
                        data: ''};

                  params.psOut = 'reply';
                  utils.output(params);
              }
          });
      } catch(err) {
          params.psOutReply = err;
          params.psOut = 'reply';
          utils.output(params);
      }
    },
    generalInfo: function(params) {
        params.psOut = 'reply';

        try {
            //check if logged in
            var userSession = utils.checkPermission(params),
                out = {};

            if (userSession) {
                var type = params.req.params.type;

                CTypes.find({name: type, type: 'contenttypes'}, function(err, categories) {
                    if (err) throw err.message;

                    var userGroups = userSession.groups,
                        adminFlag = false,
                        query = {},
                        queryCondition = [];

                    userGroups.forEach(function(el, i) {
                        queryCondition.push(el.group)
                        if (el.group == 'admin') {
                            adminFlag = true;
                        }
                    });

                    if (!adminFlag) {
                        query = {
                            'group': {$in: queryCondition}
                        }
                    }

                    Groups.find(query, '-_id name group', function(err, groups) {
                        params.psOutReply = {
                            status: 'ok',
                            message: '',
                            data: '',
                            categories: categories[0].category,
                            groups: groups
                        };
                        utils.output(params);
                    });
                });
            } else {
                throw 'loggedout';
            }
        } catch(err) {
            params.psOutReply = {
                status: 'nok',
                message: err,
                data: ''
            };
            utils.output(params);
        }
    }
}
