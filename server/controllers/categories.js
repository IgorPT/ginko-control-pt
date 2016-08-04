'use strict';

//NODE MODULES
var Joi = require('joi'),
    Boom = require('boom'),
    Q = require('q');

//HELPERS
var categoryHelper = require('./helpers/category_helper'),
    utils = require('./helpers/utils');

exports.controller = {
    setCategory: function(params) {
        var userSession = utils.checkPermission(params);
        //get content types
        if (userSession) {
            categoryHelper.helper.setCategory(params);
        } else {
            params.psOut = 'reply';
            params.psOutReply = {
                status: 'nok',
                message: 'loggedout',
                data: ''
            };
            utils.output(params);
        }
    },
    deleteCategory: function(params) {
        //get content types
        categoryHelper.helper.deleteCategory(params);
    }
}

exports.setCategory = {
    validate: {
        payload: {
            new: Joi.boolean().required(),
            items: Joi.array().required(),
            category: Joi.array().required()
        }
    },
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.setCategory(params);
    }
};
exports.deleteCategory = {
    validate: {
        payload: {
            category: Joi.array().required(),
            id: Joi.array().required()
        }
    },
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.deleteCategory(params);
    }
};
