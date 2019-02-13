const selenium = require('selenium-standalone');
const webdriverio = require('webdriverio');
const Future = require('fibers/future');
const Fiber = require('fibers');
const tcpPortUsed = require('tcp-port-used');

function getAsyncCommandWrapper(fn) {
  return function (arg1, arg2, arg3, arg4, arg5) {
    if (!Fiber.current) {
      throw new Error('It seems you\'ve forgotten to wrap a call to webdriver.io method into w wdio.wrap. For details see\n' +
        'https://github.com/ziolko/wdio#errors-description');
    }

    return Future.fromPromise(fn.call(this, arg1, arg2, arg3, arg4, arg5)).wait();
  }
}

function getWaitUntilCommandWrapper(fn) {
  return getAsyncCommandWrapper(function (condition, ms, interval) {
    return fn.call(this, function () {
      return new Promise(function (resolve, reject) {
        Fiber(function () {
          try {
            resolve(condition());
          } catch (error) {
            reject(error)
          }
        }).run();
      });
    }, ms, interval);
  });
}

exports.getBrowser = function getBrowser(options) {
  const instance = webdriverio.remote(options);

  const SYNC_COMMANDS = ['domain', '_events', '_maxListeners', 'setMaxListeners', 'emit',
    'addListener', 'on', 'once', 'removeListener', 'removeAllListeners', 'listeners',
    'getMaxListeners', 'listenerCount'];

  const SPECIAL_COMMANDS = ['waitUntil'];

  Object.keys(Object.getPrototypeOf(instance)).forEach(function (commandName) {
    if (SYNC_COMMANDS.indexOf(commandName) === -1 && SPECIAL_COMMANDS.indexOf(commandName) === -1) {
      instance[commandName] = getAsyncCommandWrapper(instance[commandName]);
    }
  });

  instance.waitUntil = getWaitUntilCommandWrapper(instance.waitUntil);
  instance.addCommand = function (name, code) {
    instance[name] = code;
  };

  return instance;
};

exports.wrap = function wrap(code) {
  return function (callback) {
    if (!callback) {
      const message = 'No callback for the wdio.wrap provided. For details see\n' +
        'https://github.com/ziolko/wdio#errors-description';
      throw new Error(message)
    }

    const self = this;
    Fiber(function () {
      try {
        code.call(self);
        callback();
      } catch (error) {
        if (callback.fail) {
          callback.fail(error)
        } else {
          callback(error);
        }
      }
    }).run();
  }
};

exports.run = function (code, callback) {
  if (!callback) {
    const message = 'No callback for the wdio.run provided. For details see\n' +
      'https://github.com/ziolko/wdio#errors-description';
    throw new Error(message)
  }

  exports.wrap(code)(callback);
};

exports.initSelenium = function (options, done) {
  const SELENIUM_PORT = 4444;

  if (typeof options === 'function') {
    done = options;
    options = {};
  }

  // Don't create another selenium instance if one is already running
  // Developer can run selenium on his own so that tests run slightly faster
  tcpPortUsed.check(SELENIUM_PORT)
    .then(function (isPortInUse) {
      if (isPortInUse) {
        done();
      } else {
        installAndStartSelenium();
      }
    });

  function installAndStartSelenium() {
    const installOptions = Object.assign({ version: '3.4.0' }, options.install);
    const startOptions = Object.assign({ version: '3.4.0' }, options.start);

    selenium.install(installOptions, function (err) {
      if (err) return done(err);

      selenium.start(startOptions, function (err, process) {
        done(err, process);
      });
    })
  }
};

exports.endSelenium = function (process) {
  if (process) process.kill();
};