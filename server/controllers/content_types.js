'use strict';

//NODE MODULES
var Joi = require('joi'),
    Boom = require('boom'),
    Q = require('q');

//HELPERS
var ctypesHelper = require('./helpers/ctypes_helper'),
    groupsHelper = require('./helpers/groups_helper'),
    utils = require('./helpers/utils');

exports.controller = {
    view: function(params) {
        //PREVENT GET MENUS FROM ENTERING
        if (params.req.params.params !== 'layout') {
            //get content types
            var out = {};
            params.psOut = 'reply';

            try {
                groupsHelper.helper.getGroup(params, {}, function(data) {
                    if (data.status == 'ok') {
                        out.groups = data.data;
                        ctypesHelper.helper.getCType(params, function(data) {
                            if (data.status == 'ok') {
                                out.ctype = data.data;
                                var curr = [];
                                curr['groups'] = out.groups;
                                curr['ctype'] = out.ctype;

                                utils.templateGenerator(params, curr);
                            } else {
                                utils.templateGenerator(params, ['loggedout']);
                            }
                        });
                    } else {
                        throw data;
                    }
                });
            } catch(err) {
                params.psOutReply = err;
                utils.output(params);
            }
        }
    },
    getTemplate: function(params) {
        ctypesHelper.helper.getTemplate(params);
    },
    setSettings: function(params){
        //set content types
        ctypesHelper.helper.setSettings(params);
    },
    set: function(params) {
        //set content types
        ctypesHelper.helper.setCType(params);
    },
    setChild: function(params) {
        let userSession = utils.checkPermission(params);
        //check if logged in
        if (!userSession) {
            reject(new Error('loggedout'))
        } else {
            // SET REPLY OBJECT
            params.psOutReply = {
                status: 'ok',
                message: 'inserted',
                data: ''
            };
            params.psOut = 'reply';
            //set content types
            ctypesHelper.helper.setChild(params)
            .then((reply)=>{
                params.psOutReply.data = reply;
                utils.output(params);
            })
            .catch((err)=>{
                params.psOutReply.status = 'nok';
                params.psOutReply.message = err;
                utils.output(params);
            });
        }

    },
    get: function(params) {
        //get content types
        ctypesHelper.helper.getCType(params);
    },
    edit: function(params) {
        //get content types
        ctypesHelper.helper.editCType(params);
    },
    editMenu: function(params) {
        //get content types
        ctypesHelper.helper.editMenu(params);
    },
    delete: function(params) {
        //get content types
        ctypesHelper.helper.deleteCType(params);
    },
    install: function(params) {
        //install deafault content types
        ctypesHelper.helper.installCtypes(params);
    }
}

exports.view = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.view(params);
    }
};
exports.getTemplate = {

  handler: {
    directory: {
      path: 'template/src',
      listing: true
    }
  }
};
exports.getBackTemplate = {

  handler: {
    directory: {
      path: 'server/views/admin',
      listing: true
    }
  }
};
exports.setSettings = {
  validate: {
      payload: {
        data: Joi.object().required().allow(null)
      }
  },
  handler: function(request, reply) {
      var params = {
              req: request,
              rep: reply
          },
          controller = exports.controller;

      controller.setSettings(params);
  }
}
exports.set = {
    validate: {
        payload: {
            title: Joi.string().required(),
            icon: Joi.string().required(),
            groups: Joi.array(),
            type: Joi.string(),
            htmlFront: Joi.string().required(),
            htmlBack: Joi.string().required(),
            htmlBackAll: Joi.object(),
            htmlSumm: Joi.string().required(),
            data: Joi.object().required()
        }
    },
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.set(params);
    }
};
exports.setChild = {
    validate: {
        payload: {
            title: Joi.string().required(),
            permalink: Joi.string().required().allow(''),
            type: Joi.string(),
            id: Joi.any(),
            category: Joi.any(),
            groups: Joi.array(),
            saveType: Joi.string(),
            data: Joi.object().required().allow(null)
        }
    },
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.setChild(params);
    }
};
exports.get = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.get(params);
    }
};
exports.edit = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.edit(params);
    }
};
exports.editMenu = {
    validate: {
        payload: {
            data: Joi.object().required()
        }
    },
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.editMenu(params);
    }
};
exports.delete = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.delete(params);
    }
};
exports.install = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.install(params);
    }
};
