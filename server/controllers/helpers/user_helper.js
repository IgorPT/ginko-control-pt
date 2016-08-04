'use strict';

//DATABASE MODELS
var CTypes = require('../../models/content_types').CTypes;
var utils = require('./utils');

//NODE MODULES
var tungus   = require('tungus'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs');

//HELPERS
var utils = require('./utils');

//DB CONNECT
var Db = require('./../../db');
    Db.db();

exports.helper = {
  authcheck: function(params) {
    try{
      var userSession = utils.checkPermission(params);
      if (!userSession) throw 'user not logedin';

      params.psOutReply = {
        status: 'ok',
        message: 'success',
        data: userSession
      };
      return utils.output(params);

    }catch(err){
      params.psOutReply = {
        status: 'nok',
        message: err,
        data: ''
      };
      return utils.output(params);

    }
  },
  auth: function(params) {
    try{
      var userSession = utils.checkPermission(params),
          user = params.req.payload;

      CTypes.findOne({type: 'users', 'content.email': user.email}, function(err, curr) {
        if (err) throw err.message;
        if (curr) {
          bcrypt.compare(user.password, curr.content[0].password, function(err, res) {
            if (err) throw err.message;

            if (res) {
              delete curr.content[0].password;
              params.req.session.set('user', curr);

              params.psOutReply = {
                status: 'ok',
                message: 'success',
                data: curr
              };
              return utils.output(params);
            } else {
              params.psOutReply = {
                status: 'nok',
                message: 'password',
                data: curr
              };
              return utils.output(params);
            }
          });

        } else {
          params.psOutReply = {
            status: 'nok',
            message: 'invalid user',
            data: userSession
          };
          return utils.output(params);
        }
      });

    }catch(err){
      params.psOutReply = {
        status: 'nok',
        message: err,
        data: userSession
      };
      return utils.output(params);
    }
  },
  setUser: function(params) {
    try{
      //checkPermission();
      var userSession = utils.checkPermission(params),
          browserSession;

      if (typeof params.req.session !== 'undefined') {
        browserSession = params.req.session.get('browser');
      } else {
        browserSession = null;
      }

      if (userSession) {
        var defaults = require('./defaults'),
            user = {
              name: '',
              type: '',
              content: [],
              author: '',
              date: new Date(),
              permalink: '',
              groups: [],
              category: [],
              source: 'default'
            }

            userContent = {
              name: params.req.payload.data.name,
              email: params.req.payload.data.email,
              username: params.req.payload.data.username
            },
            passHash = bcrypt.hashSync(params.req.payload.data.password, 8);

        if (params.req.payload.saveType == 'edit') {
          CTypes.findOne({_id: params.req.payload.id}, function(err, curr) {
            if (params.req.payload.data.password != '') {
              userContent.password = passHash;
            } else {
              //FIND USER TO GET PASSWORD
              userContent.password = curr.content.password;
            }

            user.name = params.req.payload.data.username;
            user.type = 'users';
            user.content.push(userContent);
            user.author = userSession.name;
            user.groups = (params.req.payload.groups.length > 0) ? params.req.payload.groups : [{name: 'Guest', group: 'guest'}];

            CTypes.findByIdAndUpdate(params.req.payload.id, {$set: user}, {new: true}, function(err, curr) {
              if (err) throw err.message;

              params.psOutReply = {
                status: 'ok',
                message: '',
                data: curr
              };
              return utils.output(params);
            });

          });
        } else {
          user.name = params.req.payload.data.username;
          user.type = 'users';

          userContent.password = passHash;
          user.content.push(userContent);

          user.author = userSession.name;
          user.groups = (params.req.payload.groups.length > 0) ? params.req.payload.groups : [{name: 'Guest', group: 'guest'}];

          //check if user exists
          CTypes.find({type: 'users', 'content.email': user.content[0].email}, function(err, curr) {
            if(err)throw err.message;
            if (curr.length > 0) {
              params.psOutReply = {
                status: 'nok',
                message: 'existing',
                data: curr
              };
              return utils.output(params);
            } else {
              //insert if non existing
              var dbUser = new CTypes(user);
              dbUser.save(function (err, curr) {
                if(err) throw err;

                params.psOutReply = {
                  status: 'ok',
                  message: 'success',
                  data: curr
                };
                return utils.output(params);
              });
            }
          });
        }
      } else if (!browserSession) {
        params.req.session.set('browser', {
          attempt: true
        }).ttl(60000);

        var defaults = require('./defaults'),
            user = new defaults.emptyCType(),
            userContent = {
              name: params.req.payload.data.name,
              email: params.req.payload.data.email,
              username: params.req.payload.data.username
            },
            passHash = bcrypt.hashSync(params.req.payload.data.password, 8);

        user.name = params.req.payload.data.username;
        user.type = 'users';

        userContent.password = passHash;
        user.content.push(userContent);

        user.author = userSession.name;
        user.groups = (params.req.payload.groups.length > 0) ? params.req.payload.groups : [{name: 'Guest', group: 'guest'}];

        //check if user exists
        CTypes.find({type: 'users', 'content.email': user.content[0].email}, function(err, curr) {
          if(err)throw err.message;
          if (curr.length > 0) {
            params.psOutReply = {
              status: 'nok',
              message: 'existing',
              data: curr
            };
            return utils.output(params);
          } else {
            //insert if non existing
            var dbUser = new CTypes(user);
            dbUser.save(function (err, curr) {
              if(err) throw err;

              params.psOutReply = {
                status: 'ok',
                message: 'success',
                data: curr
              };
              return utils.output(params);
            });
          }
        });
      } else {
        console.log('time');
        throw 'time'
      }
  } catch(err){
    console.log(err);
      params.psOutReply = {
        status: 'nok',
        message: err,
        data: userSession
      };
      return utils.output(params);
    }

  }
}
