'use strict';

var tungus = require('tungus'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    globals = require('../controllers/globals').controller;


/**
  * @module CType
  * @description contain the details of Attribute
*/

var CTypesSchema = new Schema({

  /* ID. Auto-incremented ObjectId. */
  id : Schema.ObjectId,

  /* Content type name. It can only contain string, is required field. */
  name : { type: String, required: true },

  /* Content type type. It can only contain string, is required field. */
  type : { type: String, required: true },

  /* Content type content. It can only contain an array, is required field. */
  content : { type: Array, required: true },

  /* Content type author. It can only contain string, is required field. */
  author : { type: String, required: true },

  /* Content type date. It can only contain date, is required field. */
  date : { type: Date, required: true },

  /* Content type path. It can only contain string, is required field. */
  permalink : { type: String, required: false },

  /* Content type group. It can only contain string, is required field. */
  groups : { type: Array, required: true },

  /* Content type categories. It can only contain an array. */
  category : { type: Array, required: false },

  /* Content type categories. It can only contain an array. */
  template : { type: String, required: false },

  /* Content type group. It can only contain string, is required field. */
  source : { type: Array, required: true }

});

var ctypes = mongoose.model('ctypes', CTypesSchema);

//CHECK IF CTYPES IS VALID
let currCtypesDB = (globals.get('ctypesDbs') || {});
currCtypesDB['default'] = ctypes;
globals.set('ctypesDbs', currCtypesDB);


/** export schema */
module.exports = {
  CTypes : ctypes
};
