'use strict';

var tungus = require('tungus'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
  * @module User
  * @description contain the details of Attribute
*/

var GroupsSchema = new Schema({

  /* User ID. Auto-incremented ObjectId. */
  id : Schema.ObjectId,

  /* User name. It can only contain string, is required field. */
  name : { type: String, required: true },

  /* User group. It can only contain string, is required field. */
  group : { type: String, required: true },

  /* If login is needed for permission group or not. */
  login : { type: Boolean, required: true },

  /* Path */
  paths : { type: Array, required: true }

});

var groups = mongoose.model('groups', GroupsSchema);

/* export schema */
module.exports = {
  db : groups,
  Groups : groups
};
