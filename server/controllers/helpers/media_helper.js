'use strict';

//DATABASE MODELS
var CTypes = require('../../models/content_types').CTypes,
    Groups = require('../../models/groups').Groups;

//NODE MODULES
var tungus = require('tungus'),
    mongoose = require('mongoose'),
    fs = require('fs-extra'),
    path = require('path');

//HELPERS
var config = require('../../config/config'),
    utils = require('./utils');

//DB CONNECT
var Db = require('../../db');
    Db.db();

exports.helper = {
    readDir: (folder) => {
      return new Promise((resolve, reject) => {
        if(!folder)reject(new Error('no path'))
          var items = [] // files, directories, symlinks, etc
          fs.walk(folder)
            .on('data', function (item) {
              let itemNameArr = item.path.split('/'),
                  itemName    = itemNameArr[itemNameArr.length-1],
                  baseDir     = path.resolve(__dirname, '../../../'),
                  itemid      = item.path.replace(baseDir,''),
                  itemType    = 'folder';
              if(itemName.indexOf('.')>0) {
                itemType=itemName.split('.')[1]
                items.push({_id:itemid,name:itemName,filetype:itemType,size:item.stats.size,date:item.stats.ctime})
              }
            })
            .on('end', function () {
              resolve(items)
            })
      })
    },
    deleteFile: (file) => {
      return new Promise((resolve, reject) => {
        let findPath = new RegExp("^\/server\/uploads");
        if(findPath.test(file)){
          //DELETE FROM uploads
          let baseDir     = path.resolve(__dirname, '../../../')
          fs.remove(baseDir+file, function (err) {
            if (err) return console.error(err)

            console.log('success!')
          })
        }
      })
    },
    uploadFile: function(params) {
        try {
            var userSession = utils.checkPermission(params);

            //check if logged in
            if (userSession) {

                var data = params.req.payload;
                if (data.file) {
                    var name = data.file.hapi.filename,
                        d = new Date(),
                        year = d.getFullYear(),
                        month = ((d.getMonth()+1) < 10 ? '0'+(d.getMonth()+1) : (d.getMonth()+1)),
                        folderpath = path.resolve(__dirname, '../../')+'/uploads/' + year + '/' + month + '/',
                        filepath = path.resolve(__dirname, '../../')+'/uploads/' + year + '/' + month + '/' + name,
                        frontfilepath = '/uploads/' + year + '/' + month + '/' + name;

                    fs.ensureDir(folderpath, function(err) {
                        if(err) throw err.message;

                        var file = fs.createWriteStream(filepath);

                        file.on('error', function (err) {
                            console.error(err)
                        });

                        data.file.pipe(file);

                        data.file.on('end', function (err) {
                            var ret = {
                                filename: data.file.hapi.filename,
                                path: frontfilepath
                            }

                            params.psOutReply = {
                                status: 'ok',
                                message: '',
                                data: ret
                            };
                            params.psOut = 'reply';
                            utils.output(params);
                        })
                    });
                }
            } else {
                throw 'loggedout';
            }
        } catch(err) {
            return {
                status: 'nok',
                message: err,
                data: ''
            };
        }
    }
}
