'use strict';

//DATABASE MODELS
var Groups = require('../../models/groups').Groups;
var ctypes = require('../../models/content_types').CTypes;

//NODE MODULES
var tungus = require('tungus'),
    mongoose = require('mongoose'),
    Q = require('q');

//HEPLERS
var config = require('../../config/config'),
    utils = require('./utils');

//DB CONNECT
var Db = require('../../db');
    Db.db();

exports.helper = {
    setGroup: function(params) {
        try {
            var userSession = utils.checkPermission(params);

            //check if logged in
            if (userSession) {
                var userGroup = userSession.groups,
                    payload = params.req.payload,
                    groupname = payload.data.name.replace(/\W/gim,""),
                    groupname = groupname.toLowerCase();

                Groups.find({group: groupname}, function(err, curr) {
                    if (err) throw err.message;
                    if (curr.length > 0) {
                        params.psOut = 'reply';
                        params.psOutReply = {
                            status: 'nok',
                            message: 'existing',
                            data: ''
                        };
                        utils.output(params);
                    } else {
                        var defaults = require('./defaults'),
                            group = new defaults.emptyGroup();

                        group.name = payload.data.name;
                        group.group = groupname;
                        group.login = payload.data.login;
                        group.paths = payload.data.paths;

                        var dbGroup = new Groups(group);
                        dbGroup.save(function (err, curr) {
                            if(err) throw err.message;

                            params.psOutReply = {
                                status: 'ok',
                                message: '',
                                data: curr
                            };
                            utils.output(params);
                        });
                    }
                });

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
    getGroup: function(params, query, callback) {
        Groups.find(query, function(err, curr) {
            if (!err && curr) {
                callback({
                    status: 'ok',
                    message: '',
                    data: curr
                });
            } else {
                callback({
                    status: 'nok',
                    message: '',
                    data: err
                });
            }
        });
    },
    deleteGroup: function(params) {
        try {
            //check if logged in
            var userSession = utils.checkPermission(params);

            if (userSession) {
                if (typeof params.req.params.id !== 'undefined') {
                    var userGroup = userSession.groups;

                    Groups.remove({_id: params.req.params.id}, function(err, curr) {
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
