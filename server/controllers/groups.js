'use strict';

//NODE MODULES
var Joi = require('joi'),
    Boom = require('boom');

//HELPERS
var groupsHelper = require('./helpers/groups_helper');

exports.controller = {
    set: function(params) {
        //chek user auth status
        params.psOut = 'reply';
        groupsHelper.helper.setGroup(params);
    },
    get: function(params) {
        //chek user auth status
        params.psOut = 'reply';
        groupsHelper.helper.getGroup(params, {});
    },
    delete: function(params) {
        //chek user auth status
        params.psOut = 'reply';
        groupsHelper.helper.deleteGroup(params, {});
    }
}

exports.set = {
  validate: {
      payload: {
          data: Joi.object().keys({
              name: Joi.string().required(),
              login: Joi.boolean().required(),
              paths: Joi.string().required()
          }),
          category: Joi.array(),
          groups: Joi.array(),
          id: Joi.number().allow(''),
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

exports.get = {
  handler: function(request, reply) {
      var params = {
              req: request,
              rep: reply
          },
          controller = exports.controller;

      return controller.get(params);
  }
};

exports.delete = {
  handler: function(request, reply) {
      var params = {
              req: request,
              rep: reply
          },
          controller = exports.controller;

      return controller.delete(params);
  }
};
