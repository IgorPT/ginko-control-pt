'use strict';

//NODE MODULES
var tungus = require('tungus'),
    mongoose = require('mongoose'),
    fs = require('fs-extra'),
    path = require('path'),
    config = require('./config/config'),
    Db = require('./db'),
    CTypes = require('./models/content_types').CTypes,
    Groups = require('./models/groups').Groups,
    defaults = require('./controllers/helpers/defaults'),
    userHelper = require('./controllers/helpers/user_helper'),
    bcrypt = require('bcryptjs');

config.app.appDir = path.resolve(path.dirname(__dirname)); // actual path

var install = function() {

    try {
        // init DB
        Db.db();

        //ENSURE DB DIR EXISTS
        fs.ensureDir(config.app.appDir + '/server/tingo/cms', function (err) {
            if (err) throw err.message;

            fs.ensureDir(config.app.appDir + '/server/uploads', function (err) {
                if (err) throw err.message;

                //Set Groups
                Groups.find({name: {$in: ['admin', 'guest']}}, function(err, curr) {
                    if (err) throw err.message;
                    //load default groups
                    var defaultGroups = defaults.defaultGroups,
                        user = new defaults.emptyCType();

                    Groups.find({group: {$in: ['admin', 'guest']}}, function(err, curr) {
                        if (err > 0) throw err.message;
                        if (curr.length < 1) {
                            user.name = config.admin.user;
                            user.type = 'users';
                            user.author = 'system';
                            user.content.push({
                                name: config.admin.user,
                                email: 'admin@admin.com',
                                username: config.admin.user,
                                password: bcrypt.hashSync(config.admin.pass, 8)
                            });
                            user.groups.push({name: 'Admin', group: 'admin'});

                            // Set init user
                            var dbUser = new CTypes(user);
                            dbUser.save(function (err, curr) {
                                if(err) throw err;

                                // Set init Groups
                                Groups.collection.insert(defaultGroups, function(err, curr) {
                                    if (err) throw err;
                                    CTypes.find({groups: 'admin',type: 'menus'}, function(err, curr) {
                                        if (err) throw err;
                                        //load default menus
                                        var adminmenu = defaults.defaultMenu;
                                        CTypes.collection.insert(adminmenu, function(err, curr) {
                                            if (err) throw err;
                                            console.log({
                                                status: 'installed'
                                            });
                                        });
                                    });
                                });
                            });
                        }
                    });
                });
            })
        })

    } catch (err) {
        console.log({
            type: 'intall',
            error: err
        });
    }
}

install();
