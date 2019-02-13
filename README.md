# Synchronous Javascript integration tests
[Webdriver.io](http://webdriver.io/) does a great job providing intuitive Selenium bindings for NodeJS.
 It provides also a [test runner](http://webdriver.io/guide/testrunner/gettingstarted.html) allowing to write
 tests in a synchronous way. The problem with this test runner is that it does not work well with IntelliJ IDEA
 (e.g. you can't set a breakpoint and debug your code).

 With this library you can write tests in a synchronous manner while still using your favourite test runner.

 To preview how this library makes your life easier in IDE like IntelliJ IDEA or Webstorm watch [this video](https://www.youtube.com/watch?v=T3Oq4lpCGTs).
 
 
 > __Important:__ This package supports v4 of Webdriver.io. Version 5 is not supported.
 
# Usage
```javascript
const wdio = require('wdio');
const assert = require('chai').assert;

describe('Google web search engine', function() {
    this.timeout(60000);

    // Create a webdriver.io 'browser' object. Now you can call on this object every
    // method described on http://webdriver.io/api.html
    var browser = wdio.getBrowser({
        desiredCapabilities: {
            browserName: 'firefox'
        }
    });

    // Initialize selenium standalone server if it is not started yet
    before(wdio.initSelenium);

    // Every code using the 'browser' object has to be wrapped by wdio.wrap
    before(wdio.wrap(function() {
        browser.init();
    }));

    after(wdio.wrap(function() {
        browser.end();
    }));

    // If you use Mocha test framework then wrap every single test by wdio.wrap
    // Important: Using wdio.wrap on 'describe' method is invalid.
    // Use it only for: 'it', 'before', 'after', 'beforeEach' and 'afterEach'
    it('Should return "Google" when asked about page title', wdio.wrap(function () {
        browser.url('http://www.google.com');
        assert.equal('Google', browser.getTitle());
    }));
});
```

# API
```javascript

/**
* Run selenium standalone server. If port 4444 is busy it does nothing.
* Otherwise it uses npm package `selenium-standalone` to run selenium
* standalone process. The parameter 'option' is optional. If it exists
* then options.install is passed to the method selenium.install and
* options.start is passed to the method selenium.start.
* Selenium.install and selenium.start are described on:
* https://www.npmjs.com/package/selenium-standalone
*/
wdio.initSelenium = function([options], callback) { ... }

/**
 * Return a webdriver.io browser instance. The options object as described on
 * http://webdriver.io/guide/getstarted/configuration.html
 * Returned object has all methods described on http://webdriver.io/api.html
 */
wdio.getBrowser = function(options) { ... }

/**
 * Wrapper for synchronous webdriver.io code. It returns another function
 * taking a callback as an argument.
 * The provided callback will be called once a test is done.
 * In case of error it will be called with the error as an argument.
 * This API makes wdio compatible with Mocha test framework.
 */
wdio.wrap = function(code) { ... }

/**
 * Runs synchronous webdriver.io code and calls a callbkack when finished
 */
wdio.run = function(code, callback) { ... }
```

# Errors description
### It seems you've forgotten to wrap a call to webdriver.io method into w wdio.wrap
Each call to webdriver.io API has to be wrapped by _wdio.wrap_. If you use Mocha check
 that _it_, _before_, _after_, _beforeEach_ and _afterEach_ calls are wrapped by _wdio.wrap_ like
 on the example above.

### No callback for the wdio.wrap provided.
It basically means you used _wdio.wrap_ in a wrong place (like _describe_ if you use Mocha). For Mocha
ensure that _wdio.wrap_ was used in _it_, _before_, _after_, _beforeEach_ or _afterEach_.

### No callback for the wdio.run provided
If you use _wdio.run_ you have to pass two parameters - the code to run and a callback to
call once finished. Double check if you've passed both parameters.

# License
https://opensource.org/licenses/MIT

