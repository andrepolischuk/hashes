(function umd(require){
  if ('object' == typeof exports) {
    module.exports = require('1');
  } else if ('function' == typeof define && (define.amd || define.cmd)) {
    define(function(){ return require('1'); });
  } else {
    this['hsh'] = require('1');
  }
})((function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @param {Boolean} jumped
   * @api public
   */

  function require(name, jumped){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];

    fn.call(m.exports, function(req){
      var dep = modules[id][1][req];
      return require(dep || req);
    }, m, m.exports, outer, modules, cache, entries);

    // store to cache after successful resolve
    cache[id] = m;

    // expose as `name`.
    if (name) cache[name] = cache[id];

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {

'use strict';

/**
 * Module dependencies
 */

var eventhash = require('eventhash');

/**
 * Location ref
 */

var loc = window.location;

/**
 * Running flag
 */

var running;

/**
 * Expose router
 */

module.exports = hsh;

/**
 * Router
 * @param {String} path
 * @param {Function} fn
 * @api public
 */

function hsh(path, fn) {
  if (typeof path === 'function') {
    return hsh('*', path);
  }

  if (typeof fn === 'function') {
    var route = new Route(path, fn);
    hsh.callbacks.push(route.callback());
  } else if (typeof path === 'string') {
    hsh.show(path);
  } else {
    hsh.start();
  }
}

/**
 * Path prefix
 * @api public
 */

hsh.prefix = '';

/**
 * Current path
 * @api public
 */

hsh.current = null;

/**
 * Callbacks
 * @api public
 */

hsh.callbacks = [];

/**
 * Show defined context
 * @param {String} path
 * @api public
 */

hsh.show = function(path) {
  var ctx = new Context(path);
  hsh.current = path;
  execute(ctx);
};

/**
 * Internal redirect /index -> /#/index
 * @param {String} path
 * @api public
 */

hsh.redirect = function(path) {
  if (typeof path === 'string') loc.hash = hsh.prefix + path;
};

/**
 * External redirect /index -> /index
 * @param {String} path
 * @api public
 */

hsh.redirectExternal = function(path) {
  if (typeof path === 'string') loc = path;
};

/**
 * Start listener
 * @api public
 */

hsh.start = function() {
  if (running) return;
  running = true;
  eventhash(onhashchange)();
};

/**
 * Hash change handler
 * @api private
 */

function onhashchange() {
  var path = loc.hash.match(prefixRegExp());
  if (!path) return hsh.redirect(hsh.prefix + '/');
  hsh.show(path[1]);
}

/**
 * Generate RegExp via prefix
 * @return {RegExp}
 * @api private
 */

function prefixRegExp() {
  return new RegExp([
    '^#',
    hsh.prefix.replace(/(\(|\)|\[|\]|\\|\.|\^|\$|\||\?|\+)/g, '\\$1'),
    '(.+)$'
  ].join(''));
}

/**
 * Execute context
 * @param {Object} ctx
 * @api private
 */

function execute(ctx) {
  var i = 0;

  function next() {
    var fn = hsh.callbacks[i++];
    if (!fn) return;
    fn(ctx, next);
  }

  next();
}

/**
 * Context
 * @param  {String} path
 * @return {Object}
 * @api private
 */

function Context(path) {
  this.path = path;
  this.params = {};
}

/**
 * Route
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

function Route(path, fn) {
  this.path = path;
  this.regexp = pathToRegExp(path);
  this.keys = pathToKeys(path);
  this.fn = fn;
}

/**
 * Route callback
 * @return {Function}
 * @api private
 */

Route.prototype.callback = function() {
  var self = this;
  return function(ctx, next) {
    if (self.match(ctx.path, ctx.params)) return self.fn(ctx, next);
    next();
  };
};

/**
 * Route match
 * @param  {String} path
 * @param  {Object} params
 * @return {Boolean}
 * @api private
 */

Route.prototype.match = function(path, params) {
  var pathParams = path.match(this.regexp);
  if (!pathParams) return false;

  for (var i = 0; i < pathParams.length - 1; i++) {
    params[this.keys[i] || i] = pathParams[i + 1];
  }

  return true;
};

/**
 * Convert path to RegExp
 * @param  {String} path
 * @return {String}
 * @api private
 */

function pathToRegExp(path) {
  if (path instanceof RegExp) return path;
  if (path === '*') return new RegExp('^.*$');

  var pathExp = '^';
  path = path.split('/').splice(1, path.length);

  for (var i = 0; i < path.length; i++) {
    pathExp += '\\/' + path[i]
      .replace(/(\(|\)|\[|\]|\\|\.|\^|\$|\||\?|\+)/g, '\\$1')
      .replace(/([*])/g, '.*')
      .replace(/(:\w+)/g, '(.+)');
  }

  pathExp += '$';
  return new RegExp(pathExp);
}

/**
 * Convert path to keys array
 * @param  {String} path
 * @return {Array}
 * @api private
 */

function pathToKeys(path) {
  if (path instanceof RegExp) return [];
  var params = path.match(/:(\w+)/g) || [];

  for (var i = 0; i < params.length; i++) {
    params[i] = params[i].substr(1);
  }

  return params;
}

}, {"eventhash":2}],
2: [function(require, module, exports) {

'use strict';

/**
 * Module dependencies
 */

try {
  var events = require('event');
} catch (err) {
  var events = require('component-event');
}

var ies = require('ies');

/**
 * Window location
 */

var location = window.location;

/**
 * Hashchange support
 */

var support = 'onhashchange' in window && !(ies && ies < 8);

/**
 * Expose onhashchange
 * @param  {Function} fn
 * @return {Function}
 * @api public
 */

module.exports = function(fn) {
  if (typeof fn !== 'function') return;

  if (!support) {
    fix(fn);
  } else {
    events.bind(window, 'hashchange', fn);
  }

  return fn;
};

/**
 * onhashchange fix for IE < 8
 * @param {Function} fn
 * @param {String} path
 * @api private
 */

function fix(fn, path) {
  if (path !== location.hash) {
    fn();
    path = location.hash;
  }

  setTimeout(function() {
    fix(fn, path);
  }, 500);
}

}, {"event":3,"component-event":3,"ies":4}],
3: [function(require, module, exports) {
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
}, {}],
4: [function(require, module, exports) {

'use strict';

/**
 * User agent
 */

var ua = navigator.userAgent;

/**
 * Export version
 */

module.exports = parse();

/**
 * Get IE major version number
 * @return {Number}
 * @api private
 */

function parse() {
  var msie = /MSIE.(\d+)/i.exec(ua);
  var rv = /Trident.+rv:(\d+)/i.exec(ua);
  var version = msie || rv || undefined;
  return version ? +version[1] : version;
}

}, {}]}, {}, {"1":""}));