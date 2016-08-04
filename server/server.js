var Hapi = require('hapi'),
        Routes = require('./routes'),
        //Db = require('./config/db'),
        Config = require('./config/config');

var app = {};
app.config = Config;


//For older version of hapi.js
//var server = Hapi.createServer(app.config.server.host, app.config.server.port, {cors: true});

var yarOptions = {
    cookieOptions: {
        password: 'm4rl3n3',
        isSecure: false,
        path: '/'
    }
};

var server = new Hapi.Server();

module.exports = server;
server.app.ctypesDbs = {};
server.connection({port: app.config.server.port});

server.register([
    {
        register: require('yar'),
        options: yarOptions
    }/*,
    {
        register: require('./plugins/managePHC/index')
    },
    {
        register: require('./plugins/paymentPlugin/index')
    },
    {
        register: require('./plugins/ticketsPlugin/index')
    },
    {
        register: require('./plugins/ordersPlugin/index')
    }
    */
],
        function (err) {
            if (err) {
                console.log('Yar: ', err);
            }
        });

server.route(Routes.endpoints);
server.start(function () {

    console.log('Server started ', server.info.uri);

    var processes = require('./controllers/process');

    processes.controller.addProcess('payment_done', function (transaction_id) {
        console.log("process test 1: " + transaction_id);
    });

    processes.controller.addProcess('payment_done', function (transaction_id) {
        console.log("process test 2: " + transaction_id);
    });

    //console.log(server.app.processList)

});
