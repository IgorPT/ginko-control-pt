'use strict';

//NODE MODULES
var Joi = require('joi'),
    Boom = require('boom'),
    Q = require('q');

//HELPERS
var gettersHelper = require('./helpers/getters_helper');

exports.controller = {
    infoupdate: function(params) {
        gettersHelper.helper.getInfo(params);
    },
    blocks: function(params) {
        //set content types
        gettersHelper.helper.getBlocks(params);
    },
    generalInfo: function(params) {
        //set content types
        gettersHelper.helper.generalInfo(params);
    }
}

exports.blocks = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.blocks(params);
    }
};

exports.infoupdate = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.infoupdate(params);
    }
};

exports.general = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.generalInfo(params);
    }
};
