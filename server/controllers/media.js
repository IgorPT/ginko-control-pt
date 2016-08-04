'use strict';

//NODE MODULES
var Joi = require('joi'),
    Boom = require('boom'),
    Q = require('q');

//HELPERS
var filesHelper = require('./helpers/media_helper');

let utils = require('./helpers/utils');

exports.controller = {
    upload: function(params) {
        //install deafault content types
        filesHelper.helper.uploadFile(params);
    },
    delete: (params) => {
        //install deafault content types
        filesHelper.helper.deleteFile(params.req.payload.pathFile).then(()=>{
          console.log('params.req.payload')
          params.psOutReply = {
              status: 'ok',
              message: ''
          };
          params.psOut = 'reply';
          utils.output(params);
        }).catch(error => {
          console.log(error)
          params.psOutReply = {
              status: 'nok',
              message: error
          };
          params.psOut = 'reply';
          utils.output(params);
        })

    }

}
exports.del = {
    validate: {
        payload: {
            pathFile: Joi.string()
        }
    },
    handler: function(request, reply) {
      var params = {
              req: request,
              rep: reply
          },
          controller = exports.controller;

      controller.delete(params);
    }
}

exports.upload = {
    payload: {
        maxBytes:209715200,
        output:'stream',
        parse: true,
        allow: 'multipart/form-data'
    },
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
            controller = exports.controller;

        controller.upload(params);
    }
};
