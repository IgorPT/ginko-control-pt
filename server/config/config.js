'use strict';

var path = require('path'),
    appDir = path.resolve(path.dirname(__dirname)),
    dbType = 'tingo', //'tingo' or 'mongo'
    dirTingo = path.normalize('/tingo');

module.exports = {
    app: {
        appDir: appDir
    },
    db: dbType,
    server: {
        host: '0.0.0.0',
    port: 3020
    },
    database: {
        host: '127.0.0.1',
        port: 27017,
        db: 'Cronj',
        username: '',
        password: '',
        url: 'mongodb://<user>:<password>@<url>'
    },
    tingo: {
        dirname: dirTingo,
        db: 'cms'
    },
    admin: {
        user: 'admin',
    pass: '#5S$W7s5C2uAx5yG'
    }
};
