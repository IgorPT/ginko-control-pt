'use strict';

//DATABASE MODELS
let CTypes = require('../models/content_types').CTypes;

//HELPERS
let ctypesHelper = require('./helpers/ctypes_helper'),
    groupsHelper = require('./helpers/groups_helper'),
    utils = require('./helpers/utils'),
    nodepath = require('path'),
    //server = require('../server'),
    globals = require('./globals').controller;

let homeControler = exports.controller = {

    getContent: (query, count, sort) =>{
      if(!count)count=1;
      if(!sort)sort='';
      return new Promise((resolve, reject) => {
        let dbName = CTypes;
        let currentDBs = globals.get('ctypesDbs');
        if(Object.keys(query).indexOf('db')>=0 && query.db!=='default'){
            dbName=(currentDBs.hasOwnProperty(query.db))?currentDBs[query.db]:CTypes;
        }
        dbName.find(query.q, function(err, curr) {
          if (err) reject(new Error(err.message))
          if (curr.length==0) {reject(new Error('no content'));}
          resolve(curr)
        }).sort(sort)
          .limit(count);
      })
    },
    getAlias: () =>{
      return new Promise((resolve, reject) => {
        if (typeof globals.get('ctypesAlias') == 'undefined'){
          let query     = {type: 'contenttypes'},
               queryCat  = {type: 'categories'},
               fetchQuery = homeControler.getContent;
          fetchQuery({db: 'default', q: query})
          .then((curr)=>{
            //return source and add globals to update
            let currCtypes = curr.map((ele)=>{if(ele.name=='settings'){globals.set('settings', ele.content[0]);};return ele.source;});
            globals.set('ctypesAlias', currCtypes);
            //add permalinks to globals
            fetchQuery({db: 'default', q: queryCat})
            .then((currCont)=>{
              let categories = [];
              currCont.map((ele)=>{categories.push({id:ele._id,permalink:ele.permalink,db:ele.source[0].db});return ele.permalink;});
              globals.set('category', categories);
              resolve(currCtypes);
            })
            .catch((err)=>{
              if (err) reject(new Error(err.message))
              resolve(currCtypes);
            })
          }).catch((err)=>{
            if (err) reject(new Error(err.message))
          })
        }else{
          resolve(globals.get('ctypesAlias'));
        }

      })
    },
    getMenus: ()=>{
      return new Promise((resolve, reject) => {
        CTypes.find({type: 'menus', 'groups.group': {$in: ['guest']}}, function(err, menu) {
          if (err) reject(new Error(err.message))
          resolve(menu)
        })
      })
    },
    checkGroups: params =>{
      return new Promise((resolve, reject) => {
        utils.checkGroups(params, function(data) {
          if (data.status == 'ok') {
            resolve(data)
          }else{
            reject(new Error('no permisssions'))
          }
        })
      })
    },
    generateContent: (data, menu, aggregator, params, homeParams, dbQuery) =>{
      if(data[0].type=='categories'){

        // START WITH DEFAULT
        let cQ  = homeParams,
            catQuer = cQ.splice(0,1);
        let settingsContent = ({templateCnt:(globals.get('settings').templateCnt || {})}),
            dbitemtype = data[0].type,
            dbQuery='default',
            count = parseInt((data[0].content[0].count || '')),
            categories = '',
            quer = {
                type: data[0].content[0].ctype,
                'category.slug': {$in: cQ}
            },
            newLoop={},
            fetchQuery = homeControler.getContent;
            newLoop['contentType']=data[0].content[0].ctype;
            newLoop['homeClass']='page-'+homeParams[homeParams.length-1];

            if(!newLoop.hasOwnProperty('templateCnt'))newLoop['templateCnt']={};
            //MERGE AVAILABLE KEYS
            let keysArray = (Object.keys(settingsContent['templateCnt']) || []).concat(Object.keys(newLoop['templateCnt']));
            //LOOP AND ADD THEM ALL TO THE CONTENT
            for(let k in keysArray){newLoop['templateCnt'][keysArray[k]]=(newLoop['templateCnt'][keysArray[k]]||settingsContent['templateCnt'][keysArray[k]]);}


            globals.get('ctypesAlias').forEach((ele)=>{if(ele[0].alias.indexOf(newLoop['contentType'])>=0 || ele[0].db == newLoop['contentType'])dbQuery=newLoop['contentType'];});
            fetchQuery({q:quer,db:dbQuery}, count, {'date': -1}).then((curr)=>{
              var itemName = data[0].content[0].ctype;
              newLoop[itemName] = [];
              for (var i in curr) {
                  for (var x in curr[i].content[0]) {
                      if (/file_/.test(x)) {
                          curr[i].content[0][x] = curr[i].content[0][x].path;
                      }
                  }
                  newLoop[itemName].push(curr[i].content[0]);
              }
              params.req.params.params = dbitemtype;
              utils.templateGenerator(params, newLoop);
            }).catch(error => {
              console.log(error)
            })

      }else if(aggregator.item){
        //{ product_1459983639419: { count: '10' } }
        let rept = aggregator.repeat,
        numQuer = {},
        countre=0;
        for(let e in rept){if(/repeaters/.test(e)){numQuer[e]=rept[e];countre++}}

        //console.log(aggregator.repeat, aggregator.repeat.forEach((e)=> {if(/repeaters/.test(e)){ return e}}))
        var totalQueries = countre,
            newLoop = data[0].content[0],
            thisQ = 0,
            dbitemtype = data[0].type;

        newLoop['homeClass']='page-'+homeParams[homeParams.length-1];
        newLoop['contentType']=data[0].type;
        newLoop['ctype'] = menu;
        //lets set the settings as well
        let settingsContent =({templateCnt:(globals.get('settings').templateCnt || {})});
        for(let k in settingsContent['templateCnt']){
          if(!newLoop.hasOwnProperty('templateCnt'))newLoop['templateCnt']={};
          newLoop['templateCnt'][k] = (newLoop['templateCnt'][k] || settingsContent['templateCnt'][k]);
        }

        if(!newLoop.hasOwnProperty('templateCnt'))newLoop['templateCnt']={};
        //MERGE AVAILABLE KEYS
        let keysArray = (Object.keys(settingsContent['templateCnt']) || []).concat(Object.keys(newLoop['templateCnt']));
        //LOOP AND ADD THEM ALL TO THE CONTENT
        for(let k in keysArray){newLoop['templateCnt'][keysArray[k]]=(newLoop['templateCnt'][keysArray[k]]||settingsContent['templateCnt'][keysArray[k]]);}



        for(var item in numQuer){
          var quer = {
            type: Object.keys(numQuer[item])[0].toLowerCase()
              //type: item.split('_')[0].toLowerCase()
          };
          if(numQuer[item].category)quer['category.slug'] = {$in: numQuer[item].category}
          if(numQuer[item].group)quer['group.name'] = {$in: numQuer[item].group}
          let count = parseInt((numQuer[item].count || '')),
              fetchQuery = homeControler.getContent;
          fetchQuery({db: 'default', q: quer}, count, {'date': -1}).then((curr)=>{
            thisQ ++;
            var itemName = item.toLowerCase();
            newLoop[itemName] = [];

            for (var i in curr) {
                for (var x in curr[i].content[0]) {
                    if (/unique_file_/.test(x)) {
                        curr[i].content[0][x] = curr[i].content[0][x];
                    } else if (/file_/.test(x)) {
                        curr[i].content[0][x] = curr[i].content[0][x].path;
                    }
                }
                newLoop[itemName].push(curr[i].content[0]);
            }
            newLoop['type'] =quer.type;

            if(totalQueries==thisQ) {
                params.req.params.params = dbitemtype;
                utils.templateGenerator(params, newLoop);
            }
          }).catch(error => {
            console.log(error)
          })


        }
      }

      else {
          //let frontData = [];
          // START WITH DEFAULTS
          let frontData=({templateCnt:(globals.get('settings').templateCnt || {})})
          frontData['contentType']=data[0].type;
          frontData['ctype'] = menu;
          if (data.length > 0) {
              var dbitemtype = data[0].type;
              params.req.params.params = dbitemtype;
              for (var key in data[0].content[0]) {
                  if(key=='templateCnt'){
                    //SET DEFAULTS
                    if(!frontData.hasOwnProperty(key))frontData[key]={};
                    //MERGE AVAILABLE KEYS
                    let keysArray = (Object.keys(frontData[key]) || []).concat(Object.keys(data[0].content[0][key]));
                    //LOOP AND ADD THEM ALL TO THE CONTENT
                    for(let k in keysArray){frontData[key][keysArray[k]]=(data[0].content[0][key][keysArray[k]]||frontData[key][keysArray[k]]);}

                  }else{
                    frontData[key] = data[0].content[0][key];
                  }
              }
          }
          let homeClass=(typeof homeParams !== 'undefined')?homeParams[homeParams.length-1]:'home';
          frontData['homeClass']='page-'+homeClass;
          utils.templateGenerator(params, frontData);
      }

    },
    get: params => {
      if(params.req.params.params=='favicon.ico' || params.req.params.params=='[object Object]')return false;
        let homeParams,
            query = {type: {$nin: ['menus', 'contenttypes']}},
            aggregator = {
              item:   false,
              repeat: {},
              type:   'repeaters'
            }

        if (typeof params.req.params.params === 'undefined') {
            params.req.params.params = 'index';
            query.permalink = '/';
        } else {
            homeParams = params.req.params.params.split('/');
            let homeParamsEncode=homeParams.map((ele)=>{return encodeURIComponent(ele)});
            query.permalink = '/'+homeParamsEncode.join('/');
            params.req.params.lastCat = homeParams[homeParams.length-2];
            params.req.params.lastItem = homeParams[homeParams.length-1];
            params.req.params.params = homeParams[0];

        }
        // GET ALL OBJ properties
        let fetchGroups = homeControler.checkGroups,
            fetchQuery = homeControler.getContent,
            fetchMenus = homeControler.getMenus,
            fetchAlias = homeControler.getAlias,
            createContent = homeControler.generateContent;

            // CHECK FOR PERMSSIONS
            fetchGroups(params).then((data) => {
              fetchAlias().then((alias) => {
                let dbQuery = 'default';
                // CHECK IF CTYPE IS IN ANOTHER DBS
                alias.forEach((ele)=>{if (ele[0].alias.indexOf(params.req.params.params)>0 || ele[0].db == params.req.params.params){dbQuery=ele[0].db}});
                // CHECK IF PERMALINK IS IN CAT
                if(globals.get('category'))globals.get('category').forEach((ele)=>{if(ele.permalink==query.permalink)dbQuery='default';})
                fetchQuery({db: dbQuery, q: query}).then((curr) => {
                      fetchMenus().then((menus) => {
                      if(typeof curr[0].content !== 'undefined' && curr[0].content.length>0 ){
                         if (Object.keys(curr[0].content[0]).filter((e)=> /repeaters/.test(e)).length > 0) {
                           aggregator.item = true;
                           aggregator.repeat = curr[0].content[0];
                         }
                       }
                       // GENETRATE CONTENT
                       if (params.req.method) {
                           createContent(curr,menus,aggregator,params,homeParams,dbQuery);
                       } else {
                           console.log('post response');
                       }
                    }).catch(error => {
                      console.log(error)
                    })
                }).catch(error => {
                  console.log(error)
                  utils.templateGenerator(params, '404');
                })
              }).catch(error => {
                console.log(error, 'no alias')
              })
            }).catch(error => {
              console.log(error)
            })

    },
    blocks: params => {
        params.rep();
    },
    serveAmin: params => {
      try {
          //check if logged in
          var userSession = utils.checkPermission(params),
              userGroups;

          if (userSession) {
            params.rep.file('admin/src/assets/js/admin.js');
          } else {
            //params.rep({status: 'no script'});
            params.rep('');
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
    uploadsFolder: params => {
        params.rep.file(nodepath.resolve(__dirname, '../')+'/uploads/'+params.req.params.path);

    }
}
