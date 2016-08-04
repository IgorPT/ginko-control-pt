'use strict';

//NODE MODULES
var Joi = require('joi'),
    Boom = require('boom');

//HELPERS
var userHelper = require('./helpers/user_helper');


exports.controller = {
    authcheck: function(params) {
        //chek user auth status
        params.psOut = 'reply';
        userHelper.helper.authcheck(params);
    },

    auth: function(params) {
        //auth user
        params.psOut = 'reply';
        userHelper.helper.auth(params);
    },

    logout: function(params) {
      params.req.session.clear('user');
      params.rep({
        status: 'ok',
        message: 'success',
        data: ''
      });
    },

    set: function(params) {
        //set user
        params.psOut = 'reply';
        userHelper.helper.setUser(params);
    }
}

exports.authcheck = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        return controller.authcheck(params);
    }
};
exports.auth = {
    validate: {
        payload: {
            email: Joi.string().required(),
            password: Joi.string().required()
        }
    },
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;
        return controller.auth(params);
    }
};
exports.logout = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;
            return controller.logout(params);
    }
};
exports.set = {
    validate: {
        payload: {
            data: Joi.object().keys({
                seo: Joi.object().optional(),
                name: Joi.string().required(),
                username: Joi.string().required(),
                email: Joi.string().required(),
                password: Joi.alternatives().when('id', { is: false, then: Joi.string().required(), otherwise: Joi.string() })
            }),
            category: Joi.array(),
            groups: Joi.array(),
            id: Joi.number().allow(''),
            title: Joi.string().optional().allow(''),
            permalink: Joi.string().optional().allow(''),
            saveType: Joi.string(),
            type: Joi.string()
        }
    },
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;
            return controller.set(params);
    }
};
