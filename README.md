# Synchronous Javascript integration tests
[Webdriver.io](http://webdriver.io/) does a great job providing intuitive Selenium bindings for NodeJS.
 It provides also a [test runner](http://webdriver.io/guide/testrunner/gettingstarted.html) allowing to write
 tests in a synchronous way. The problem with this test runner is that it does not work well with IntelliJ IDEA
 (e.g. you can't set a breakpoint and debug your code).

 With this library you can write tests in a synchronous manner while still using your favourite test runner.

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
```

# Errors description
### It seems you've forgotten to wrap a call to webdriver.io method into w wdio.wrap
Each call to webdriver.io API has to be wrapped by _wdio.wrap_. If you use Mocha check
 that _it_, _before_, _after_, _beforeEach_ and _afterEach_ calls are wrapped byt _wdio.wrap_ like
 on the example above.

### No callback for the wdio.wrap provided.
It basically means you used _wdio.wrap_ in a wrong place (like _describe_ if you use Mocha). Ensure
that _wdio.wrap_ was used in _it_, _before_, _after_, _beforeEach_ or _afterEach_.

# License
https://opensource.org/licenses/MIT

