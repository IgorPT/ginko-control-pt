'use strict';

var Config = require('./config/config');

exports.db = function() {
  if (Config.db === 'tingo') {
    //tingo connection
    var mongoose = require('mongoose'),
        tungus = require('tungus');

    mongoose.connect('tingodb://server/tingo/cms');

    return true;

  } else if (Config.db === 'mongo') {
    //mongodb connection
    /*
    var mongoose = require('mongoose');

    return db;
    */
  }
}
