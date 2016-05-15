const wdio = require('./wdio');
const assert = require('chai').assert;

describe('Web search engines', function() {
    this.timeout(60000);

    var browser = wdio.getBrowser({
        desiredCapabilities: {
            browserName: 'firefox'
        }
    });

    before(wdio.initSelenium);
    
    before(wdio.wrap(function() {
        browser.init();
    }));

    after(wdio.wrap(function() {
        browser.end();
    }));

    describe('Google', function () {
        it('Should return \'Google\' when asked about page title', wdio.wrap(function () {
            browser.url('http://www.google.com');
            assert.equal('Google', browser.getTitle());
        }));
    });

    describe('Yahoo', function() {
        it('Should return \'Yahoo\' when asked about page title', wdio.wrap(function () {
            browser.url('http://www.yahoo.com');
            assert.equal('Yahoo', browser.getTitle());
        }));
    });
});