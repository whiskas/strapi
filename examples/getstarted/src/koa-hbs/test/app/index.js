var hbs = require('../../index');
var koa = require('koa');
var router = require('koa-router')();

var create = function(opts) {
  var app = koa();
  var _hbs = hbs.create();

  app.on('error', function(err) {
    console.error(err.stack);
  });

  app.use(_hbs.middleware(opts));
  app
    .use(router.routes())
    .use(router.allowedMethods());

  router.get('/', function*() {
    yield this.entryServer('main', {title: 'test'});
  });

  router.get('/partials', function*() {
    yield this.entryServer('mainWithPartials', {
      title: 'test',
      anchorList:[
        {url: 'https://google.com', name: 'google'},
        {url: 'https://github.com', name: 'github'}
      ]
    });
  });

  router.get('/nestedPartials', function*() {
    yield this.entryServer('nestedPartials' );
  });

  router.get('/layout', function *() {
    yield this.entryServer('useDefaultLayout');
  });

  router.get('/altLayout', function *() {
    yield this.entryServer('useAlternativeLayout');
  });

  router.get('/overrideLayout', function *() {
    yield this.entryServer('useOverrideLayout', {
      layout: 'override'
    });
  });

  router.get('/noLayout', function *() {
    yield this.entryServer('useNoLayout', {
      layout: false
    });
  });

  router.get('/block', function *() {
    yield this.entryServer('usesBlockLayout');
  });

  router.get('/blockNoReplace', function *() {
    yield this.entryServer('usesBlockLayoutNoBlock');
  });

  router.get('/empty', function *() {
    yield this.entryServer('empty');
  });

  router.get('/locals', function *() {
    yield this.entryServer('locals');
  });

  router.get('/localsOverride', function *() {
    yield this.entryServer('locals', {
      title: 'Bar'
    });
  });

  router.get('/localsRecursive', function *() {
    var obj = {};
    obj.title = 'Bar';
    obj.recursive = obj;
    yield this.entryServer('locals', obj);
  });

  router.get('/localsState', function *() {
    this.state = { title: 'Foo', article: 'State' };
    yield this.entryServer('locals', {
      title: 'Bar'
    });
  });

  router.get('/tplInOtherDir', function *() {
    yield this.entryServer('tplInOtherDir');
  });

  router.get('/missingTemplate', function *() {
    yield this.entryServer('missingTemplate');
  });

  return app;
};

exports.create = create;
