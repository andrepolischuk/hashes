
var hsh = require('..');
var assert = require('assert');

before(function() {
  hsh();
});

beforeEach(function() {
  hsh.callbacks = [];
  hsh.redirect('');
});

describe('onhashchange', function() {
  it('should run on matched path string', function(done) {
    hsh('/one', function() {
      done();
    });
    hsh('/one');
  });

  it('should run on matched path string with params', function(done) {
    hsh('/two/:param', function() {
      done();
    });
    hsh('/two/test');
  });

  it('should run on matched path string with *', function(done) {
    hsh('/three/*', function() {
      done();
    });
    hsh('/three/test');
  });

  it('should run on matched path regexp', function(done) {
    hsh(/^\/four$/, function() {
      done();
    });
    hsh('/four');
  });

  it('should run with next()', function(done) {
    hsh('/five/*', function(ctx, next) {
      next();
    });
    hsh('/five/:param', function() {
      done();
    });
    hsh('/five/test');
  });

  it('should run 404', function(done) {
    hsh('/six', function() { });
    hsh(function() {
      done();
    });
    hsh('/one');
  });
});

describe('hsh(path)', function() {
  it('should run without redirect', function(done) {
    hsh('/showshort', function() {
      done();
    });
    hsh('/showshort');
  });
});

describe('hsh.show(path)', function() {
  it('should run without redirect', function(done) {
    hsh('/show', function() {
      done();
    });
    hsh.show('/show');
  });
});

describe('hsh.redirect(path)', function() {
  it('should run with redirect', function(done) {
    hsh('/redirect', function() {
      hsh.redirect('/handler');
    });
    hsh('/handler', function() {
      done();
    });
    hsh('/redirect');
  });
});

describe('ctx.path', function() {
  it('should expose default "/"', function(done) {
    hsh('/', function(ctx) {
      assert(ctx.path === '/');
      done();
    });
    hsh('/');
  });

  it('should expose path', function(done) {
    hsh('/ctxpath', function(ctx) {
      assert(ctx.path === '/ctxpath');
      done();
    });
    hsh('/ctxpath');
  });
});

describe('ctx.params', function() {
  it('should be an object', function(done) {
    hsh('/ctxobject/:param', function(ctx) {
      assert(typeof ctx.params === 'object');
      assert(!('length' in ctx.params));
      done();
    });
    hsh('/ctxobject/object');
  });

  it('should expose params', function(done) {
    hsh('/ctxparams/:one/:two', function(ctx) {
      assert('one' in ctx.params);
      assert(ctx.params.one = 'test');
      assert('two' in ctx.params);
      assert(ctx.params.two = 'test2');
      done();
    });
    hsh('/ctxparams/test/test2');
  });
});
