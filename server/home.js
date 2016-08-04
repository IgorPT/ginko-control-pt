'use strict';

var Home = require('./controllers/home');

exports.get = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
        controller = Home.controller;
        controller.get(params);
    }
};
exports.serveAmin = {
    handler: function(request, reply) {
        var params = {
                req: request,
                rep: reply
            },
        controller = Home.controller;
        controller.serveAmin(params);
    }
};
exports.assets = {
  handler: {
    directory: {
      path: 'template/assets',
      listing: true
    }
  }
};
exports.uploadsFolder = {
  handler: function(request, reply) {
      var params = {
              req: request,
              rep: reply
          },
      controller = Home.controller;
      controller.uploadsFolder(params);
  }
};
