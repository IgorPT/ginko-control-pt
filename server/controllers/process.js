'use strict';
var request = require('request'),
    globals = require('./globals').controller;

if (typeof globals.get('processList') == 'undefined')
    globals.set('processList', {});

var testing = exports.controller = {
    process: function (event, params) {
        var processList = globals.get('processList');
        // RUN A PROCESS || event (sting), params (object|array|stirng|int)
        if (typeof processList[event] == 'undefined')
            return false;
        var patt = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-\?&]*)*\/?\S/g;
        for (var process in processList[event]) {
            ///call process with the params
            if (typeof processList[event][process] == 'function') {

                processList[event][process](params);

            } else if (patt.exec(processList[event][process])) {
                //SEND VARS TO URL
                request.post(processList[event][process], params);
            }
        }
    },
    addProcess: function (event, process) {
        // ADD A PROCESSO THE LIST || event (sting), process (function | route)
        var processList = globals.get('processList');

        if (typeof processList[event] === 'undefined') {
            processList[event] = new Array();
        }

        processList[event].push(process);
    }
};

/*/////

 //SET LIST OFF PROCESS
 processes = require('./controllers/process');
 processes.controller.process('paymentdone','1223342')
 processes.controller.addProcess('start',function(aa){console.log(aa)})
 console.log(globals.get('processList'))
 processes.controller.process('pa','http://google.com')
 console.log(globals.get('processList'))
 processes.controller.process('start','http://google.com')

 ////*/
