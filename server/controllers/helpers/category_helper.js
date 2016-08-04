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
    ctypesHelper = require('./ctypes_helper').helper,
    categoryHelper = require('./category_helper');

//DB CONNECT
var Db = require('../../db');
    Db.db();

// GET GLOBALS
let globals = require ('../globals');

categoryHelper = exports.helper = {
    addCatCtype: (params, type, mainArr)=>{
      params.req.payload.type='categories';
      params.req.payload.title=mainArr.name;
      params.req.payload.permalink='/'+type+'/'+mainArr.slug;
      params.req.payload.source={ db: 'products', alias: [] };
      params.req.payload.data={count:10,ctype:type};
      ctypesHelper.setChild(params, true);
    },
    getDB: (type) =>{
      let globalobj = globals.controller.get('ctypesDbs');
      return (type !== 'default' && globalobj.hasOwnProperty(type)) ? globalobj[type] : CTypes;
    },
    setCategory: function(params) {
        try {
            if (typeof params.req.params.type !== 'undefined') {
                var type = params.req.params.type,
                    mainArr = [],
                    slugArr = [];

                //PREPARE OBJECTS TO INSERT
                params.req.payload.category.forEach(function(el, i) {
                    mainArr[i] = {
                        name: el,
                        slug: el.replace(/\W/gim,"").toLowerCase()
                    }
                    slugArr.push(el.replace(/\W/gim,"").toLowerCase());
                });

                if (params.req.payload.new) {
                    //add new cat
                    CTypes.find({name: type, type: 'contenttypes'}, function(err, curr) {
                        if (err) throw err.message;
                        //FLAG FOR EXISTING CATEGORY
                        var flag = false;

                        if(curr.length > 0){
                            curr[0].category.forEach(function(el, i) {
                                if (mainArr[0].slug.indexOf(el.slug) >= 0) flag = true;
                            });
                        }

                        if (!flag) {
                            CTypes.findOneAndUpdate({_id: curr[0]._id}, {$push: {category: {$each: mainArr}}}, {new: true}, function(err, curr) {
                                if (err) throw err.message;
                                params.psOut = 'reply';
                                params.psOutReply = {
                                    status: 'ok',
                                    message: '',
                                    data: curr
                                };
                                categoryHelper.addCatCtype(params, type, mainArr[0])
                                utils.output(params);
                                //CREATE NEW CTYPE FOR CAT
                            });
                        } else {
                            params.psOut = 'reply';
                            params.psOutReply = {
                                status: 'nok',
                                message: 'existing',
                                data: ''
                            };
                            utils.output(params);
                        }
                    });
                } else {
                    //append cat to items
                    var idArr = params.req.payload.items;
                    let globals = require ('../globals');

                    CTypes.find({name: type, type: 'contenttypes'}, function(err, maintype) {
                        if (err) throw err.message;
                        var parentupdate = true;

                        maintype[0].category.forEach(function(maintypeEL, maintypeI) {
                            mainArr.forEach(function(el, i) {
                                if (maintypeEL.slug == el.slug) parentupdate = false;
                            });
                        });
                        if(!parentupdate) {
                            categoryHelper.getDB(maintype[0].source[0].db).update({_id: {$in: idArr}}, {$set: {category: mainArr}}, {multi: true}, function(err, curr) {
                                if (err) throw err.message;

                                if (typeof params.req.payload.fromPHC === 'undefined') {
                                    params.psOut = 'reply';
                                    params.psOutReply = {
                                        status: 'ok',
                                        message: '',
                                        data: curr
                                    };
                                    utils.output(params);
                                }
                            });
                        } else {
                            categoryHelper.getDB(maintype[0].source[0].db).update({_id: { $in: idArr}}, {$set: {category: mainArr}}, {multi: true}, function(err, curr) {
                                if (err) throw err.message;

                                CTypes.findOneAndUpdate({_id: maintype[0]._id}, {$push: {category: {$each: mainArr}}}, {new: true}, function(err, curr) {
                                    if (err) throw err.message;

                                    categoryHelper.addCatCtype(params, type, mainArr[0])

                                    if (typeof params.req.payload.fromPHC === 'undefined') {
                                        params.psOut = 'reply';
                                        params.psOutReply = {
                                            status: 'ok',
                                            message: '',
                                            data: curr
                                        };

                                        utils.output(params);
                                    }
                                });
                            });
                        }
                    });
                }
            } else {
                throw 'invalid request';
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
    deleteCategory: function(params) {
        try {
            //check if logged in
            var userSession = utils.checkPermission(params);

            if (userSession) {
                if (typeof params.req.params.id !== 'undefined') {
                    var id = params.req.params.id;

                    //append cat to items
                    var idArr = params.req.payload.items;
                    var catArr = params.req.payload.category;
                    var typesArr = [];
                    var slugArr = [];

                    CTypes.find({_id: {$in: idArr}}, function(err, curr) {
                        if (err) throw err.message;
                        var ctype = false;

                        if (curr.length > 0) {
                            curr.forEach(function(el, i) {
                                if (el.type == 'contenttypes') {
                                    ctype = true;
                                    typesArr.push(el.name);
                                }
                            });

                            if (ctype) {
                                CTypes.update({type: { $in: typesArr}}, {$push: {category: {$each: catArr}}}, { multi: true }, function(err, curr) {
                                    if (err) throw err.message;

                                    params.psOut = 'reply';
                                    params.psOutReply = {
                                        status: 'ok',
                                        message: '',
                                        data: ''
                                    };
                                    utils.output(params);
                                });
                            } else {
                                CTypes.update({_id: {$in: idArr}}, {$pull: {category: {$each: catArr}}}, { multi: true }, function(err, curr) {
                                    if (err) throw err.message;

                                    params.psOut = 'reply';
                                    params.psOutReply = {
                                        status: 'ok',
                                        message: '',
                                        data: ''
                                    };
                                    utils.output(params);
                                });
                            }
                        }
                    });


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
    }
}
