const wdio = require('./wdio');
const assert = require('chai').assert;

describe('Web search engines', function () {
  this.timeout(60000);

  // Initialize browser
  var browser = wdio.getBrowser({
    desiredCapabilities: {
      browserName: 'firefox'
    }
  });

  // It's possible to define custom commands
  browser.addCommand('getUrlAndTitle', function (customVar) {
    return {
      url: this.getUrl(),
      title: this.getTitle(),
      customVar: customVar
    };
  });

  // Ensure that selenium server is run locally
  before(wdio.initSelenium);

  before(wdio.wrap(function () {
    browser.init();
  }));

  after(wdio.wrap(function () {
    browser.end();
  }));

  describe('Smoke test', function () {
    it('Should return \'Google\' when asked about page title', wdio.wrap(function () {
      browser.url('http://www.google.com');
      assert.equal('Google', browser.getTitle());
    }));
  });

  describe('Add command', function () {
    it('Should call previously defined custom command', wdio.wrap(function () {
      browser.url('https://www.example.com/');
      var urlAndTitle = browser.getUrlAndTitle('TestValue');

      assert.equal('https://www.example.com/', urlAndTitle.url);
      assert.equal('Example Domain', urlAndTitle.title);
      assert.equal('TestValue', urlAndTitle.customVar);
    }));
  });

  describe('Run syntax', function () {
    it('Should successfully run test with the \'run\' syntax', function (done) {
      wdio.run(function () {
        browser.url('http://www.google.com');
        assert.equal('Google', browser.getTitle());
      }, done)
    });
  });
});