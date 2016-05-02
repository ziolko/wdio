const webdriverio = require('webdriverio');
const Future = require('fibers/future');
const Fiber = require('fibers');

function getAsyncCommandWrapper(fn) {
    return function(arg1, arg2, arg3, arg4, arg5) {
        if(!Fiber.current) {
            throw new Error('It seems you\'ve forgotten to wrap a call to webdriver.io method into w wdio.wrap.');
        }

        return Future.fromPromise(fn.call(this, arg1, arg2, arg3, arg4, arg5)).wait();
    }
}

exports.getBrowser = function getBrowser(options) {
    var instance = webdriverio.remote(options);

    const SYNC_COMMANDS = ['domain', '_events', '_maxListeners', 'setMaxListeners', 'emit',
        'addListener', 'on', 'once', 'removeListener', 'removeAllListeners', 'listeners',
        'getMaxListeners', 'listenerCount'];

    Object.keys(Object.getPrototypeOf(instance)).forEach(function(commandName) {
        if (SYNC_COMMANDS.indexOf(commandName) === -1) {
            instance[commandName] = getAsyncCommandWrapper(instance[commandName]);
        }
    });

    return instance;
};

exports.wrap = function wrap(code) {
    return function(callback) {
        if(!callback) {
            var message = 'No callback for the wdio.wrap provided.';
            throw new Error(message)
        }

        var self = this;
        Fiber(function(){
            try {
                code.call(self);
                callback();
            } catch(error) {
                callback(error);
            }
        }).run();
    }
};
