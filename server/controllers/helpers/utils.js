'use strict';

//DATABASE MODELS
var Groups = require('../../models/groups').Groups,
    CTypes = require('../../models/content_types').CTypes;

//NODE MODULES
var tungus = require('tungus'),
    mongoose = require('mongoose');

//HEPLERS
var config = require('../../config/config');

//DB CONNECT
var Db = require('../../db');
    Db.db();

exports.output = function(params) {
  var userSession = this.checkPermission(params);
  userSession ? params.psOutReply.logged = true : params.psOutReply.logged = false;

  if(typeof params.psOut  !== 'undefined' && params.psOut == 'reply'){
    params.rep(params.psOutReply);
  }else{
    return params.psOutReply;
  }
}

exports.checkPermission = function(params) {
  if(typeof params.req.session != 'undefined' && typeof params.req.session.get == 'function'){
      return (params.req.session.get('user')) ? params.req.session.get('user') : false;
  }else{
      return false;
  }
}

exports.checkGroups = function(params, callback) {
  var groupsHelper = require('./groups_helper'),
      userSes = this.checkPermission(params),
      groupQuery = {},
      userGroups = [];

  if (userSes) {
    userSes.groups.forEach(function(el, i) {
      userGroups.push(el.group);
    });
  }

  userSes ? groupQuery.group = {$in: userGroups} : groupQuery.group = {$in: ['guest']};

  groupsHelper.helper.getGroup(params, groupQuery, function(data) {
    if (data.status == 'ok') {
      //ROUTE REQUEST PATH
      var requestedpath = params.req.path,
          trigger = false,
          repObj = {
            status: 'nok',
            message: '',
            data: ''
          };

      if (requestedpath == '/') {
        requestedpath = '/index';
      }

      for (var i = 0; i < data.data[0].paths.length; i++) {
        if (typeof requestedpath != 'undefined') {
          var path = data.data[0].paths[i],
              //path = '/api'+path,
              regex = new RegExp(path.replace('*', '.+'), 'g');

          if (requestedpath.match(regex)) {
            trigger = true;
            repObj.status = 'ok';
          }

          if (data.data[0].paths.length == i+1) {
            callback(repObj);
          }
        }
      }

    } else {
      callback(repObj);
    }
  });
}


//CUSTOM SORT
exports.dynamicSort = function (property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

exports.handleRepeater = function(params, data, callback) {
    var count,
        type,
        category,
        group,
        dataLength = Object.keys(data).length,
        i = 0,
        output = [];

    for (var key in data) {
      //i++;
      var repType = key.split('_')[0];


      if (repType == 'category') {
        count = parseInt(data[key].count);
        type = data[key].contenTypes;

      } else {
        (typeof data[key].count !== 'undefined') ? count = parseInt(data[key].count) : count = null;
        (typeof data[key].category !== 'undefined') ? category = data[key].category : category = null;
        (typeof data[key].group !== 'undefined') ? group = data[key].group : group = null;
        type = repType.toLowerCase();

      }

      //BUILD SEARCH QUERY
      var query = {type: type};
      if (category) query['category.slug'] = category;
      if (group) query['groups.group'] = group;

      try {
        CTypes.find(query).limit(count).sort({_id: -1}).exec(function(err, curr) {
          if (err) throw err;

          i++
          if (curr.length > 0) {
            output[curr[0].type] = [];
            curr.forEach(function(el, i) {
              output[curr[0].type].push(el.content[0]);
            });
          }

          if (i == dataLength) {
            callback(output);
          }
        });
      } catch(err) {
        console.log(err);
      }
    }
}

exports.templateGenerator = function(params, curr) {

    var handlebars = require('handlebars'),
        layouts = require('handlebars-layouts'),
        fs = require('fs'),
        nodePath = require('path'),
        Q = require('q'),
        urlReq = params.req.params.params,
        urlparams = params.req.params.params.match(/[^\/]+/g),
        templateItems = {},
        repeater = false,
        category = false,
        header='',
        footer='',
        sidebar='',
        repeaterTemplate = '';


    //HANDLE REPEATER
    if (curr && curr.hasOwnProperty("repeaters")) {
      repeater = true;
    }
    //PROMISSES
    var fs_stat = Q.denodeify(fs.stat);

    // Register helpers
    handlebars.registerHelper(layouts(handlebars));

    // Register partials
    var templatepath,
        isCat=false,
        render = false;

    if (urlparams[0] && urlparams[0] == 'admin' && (!urlparams[1] || curr[0] == 'loggedout')) {
        handlebars.registerPartial('layout', fs.readFileSync(nodePath.resolve(__dirname, '../../')+'/views/admin/layout.hbs', 'utf8'));
        templatepath = nodePath.resolve(__dirname, '../../')+'/views/admin/index.html';
    } else if (urlparams[0] && urlparams[0] == 'admin') {
        handlebars.registerPartial('layout', fs.readFileSync(nodePath.resolve(__dirname, '../../')+'/views/admin/layout.hbs', 'utf8'));
        templatepath = nodePath.resolve(__dirname, '../../')+'/views/'+urlReq+'.html';
    }else if(curr=='404'){
      // Render partials
      header = fs.readFileSync(nodePath.resolve(__dirname, '../../../')+'/template/src/header.html', 'utf8');
      footer = fs.readFileSync(nodePath.resolve(__dirname, '../../../')+'/template/src/footer.html', 'utf8');
      sidebar = fs.readFileSync(nodePath.resolve(__dirname, '../../../')+'/template/src/sidebar.html', 'utf8');
      handlebars.registerPartial('layout', fs.readFileSync(nodePath.resolve(__dirname, '../../../')+'/template/src/layout.hbs', 'utf8'));
      if (urlparams[0] && urlparams[0] == 'admin') {
        templatepath = nodePath.resolve(__dirname, '../../')+'/views/admin/404.html';
      } else {
        templatepath = nodePath.resolve(__dirname, '../../../')+'/template/src/404.html';
      }
      render = true;
    }else if(urlReq!=='favicon.ico'){
      if(urlReq=='categories'){ isCat=curr['contentType']; urlReq = curr['contentType']+'_summ'; }
      // Render partials
      header = fs.readFileSync(nodePath.resolve(__dirname, '../../../')+'/template/src/header.html', 'utf8');
      footer = fs.readFileSync(nodePath.resolve(__dirname, '../../../')+'/template/src/footer.html', 'utf8');
      sidebar = fs.readFileSync(nodePath.resolve(__dirname, '../../../')+'/template/src/sidebar.html', 'utf8');
      handlebars.registerPartial('layout', fs.readFileSync(nodePath.resolve(__dirname, '../../../')+'/template/src/layout.hbs', 'utf8'));
      templatepath = nodePath.resolve(__dirname, '../../../')+'/template/src/'+urlReq+'.html';
      render = true;
    }


    fs_stat(templatepath).then(
    function(stats) {
        templateOutput(templatepath, render);
    }, function(err) {
      if (params.req.info.referrer.match(/\/admin/g)) {
          params.rep(false);
      } else {
        templateOutput(templatepath, render);
      }
    });

    let addRepeaters = (path) => {
      let output=fs.readFileSync(path, 'utf8'),
          getSum=(typeof params.req.params.lastCat!=='undefined')?'':'_summ';
      if(/###(.*)###/.test(output)){
        let toGet = output.match(/###(.*)###/gmi)
        for(var elem in toGet){
          let thisval = toGet[elem].match(/###(.*)###/)[1];
          let pathTemplate = nodePath.resolve(__dirname, '../../../')+'/template/src/'+thisval+getSum+'.html';
          let elementTemplate=fs.readFileSync(pathTemplate, 'utf8');
          output=output.replace(toGet[elem], elementTemplate)
        }
        return output;
      }
        return output;
    }
    // Compile template
    let templateOutput = (path, render) => {
        // Render template
        let output,
            fileContent = addRepeaters(path),
            initloop=(isCat)?'{{#each '+ isCat +'}}':'',
            endloop=(isCat)?'{{/each}}':'',
            htmlContent = (render)?'{{#extend "layout"}}'+header+'{{#content "content"}}' +initloop + fileContent + endloop+'{{/content}}'+sidebar+footer+'{{/extend}}':fileContent,
            template = handlebars.compile(htmlContent);

          for(var key in curr) {
            switch (true) {
              case (key == 'groups'):
                templateItems[key] = {};
                for (var item in curr[key]) {
                  templateItems[key][curr[key][item].group] = curr[key][item].name;
                }

              break;

              case (key == 'ctype'):

                if(typeof curr[key] !== 'string'){
                curr[key].forEach(function (el, i, arr){

                  if (typeof templateItems[el.type] === 'undefined') {
                    templateItems[el.type] = new Array();
                  }

                  templateItems[el.type].push(el.content[0]);

                  var menukey = urlparams[1];
                  if (typeof templateItems.menus[urlparams[1]] === 'undefined') {
                    menukey = 'dashboard';
                  }

                  templateItems['areatitle'] = (urlparams[0]!='index') ? templateItems.menus[0].name : 'Dashboard';
                });}

              break;

              case (/repeaters/.test(key)):

                  let thisRep = curr['type']+'_'+(key.split('_')[1] || '');
                  if(typeof templateItems[thisRep] === 'undefined')templateItems[thisRep]=[];
                  templateItems[thisRep] = curr[key];
                  templateItems[thisRep].forEach(function(el, i) {
                    let keys = Object.keys(templateItems[thisRep][i]['repeatfront']);
                    templateItems[thisRep][i][keys] = templateItems[thisRep][i]['repeatfront'][keys];
                  })

              break;

              case (key == 'repeatfront'):

                for (var innerkey in curr[key]) {
                  curr[key][innerkey].forEach(function(el, i) {
                    var oddevenclass;
                    (i % 2) ? oddevenclass = true : oddevenclass = false;
                    el.oddeven = oddevenclass;
                  });

                  templateItems[innerkey] = curr[key][innerkey];
                }
              break;

              default:
              if (key.match(/file_/g)) {
                if (key.match(/unique_file_/g)) {
                  templateItems[key] = curr[key];
                } else {
                  templateItems[key] = curr[key].path;
                }
              } else {
                templateItems[key] = curr[key];
              }

              break;
            }
          }
          output = template(templateItems);
        if (render) {
          params.rep(output);
        } else {
            params.rep({
              status: 'ok',
              message: '',
              data: output
            });
        }
    }
}
