// Hsh © 2013-2015 Andrey Polischuk
// github.com/andrepolischuk/hsh

!function() {

  'use strict';

  /**
   * Options
   */

  var options = {};

  /**
   * Hash prefix
   */

  options.pref = '#';

  /**
   * Index route
   */

  options.index = '/';

  /**
   * Routes
   */

  var routes = [];

  /**
   * Window location
   */

  var location = window.location;

  /**
   * onhashchange detection
   */

  var hashChangeDetect = 'onhashchange' in window &&
    !(/MSIE.\d+\./gi.test(navigator.userAgent) &&
    parseInt(navigator.userAgent.replace(/.*MSIE.(\d+)\..*/gi, "$1")) < 8);

  /**
   * Expression
   * @param  {String} path
   * @return {String}
   * @api private
   */

  function pathRegExp(path) {

    if (path === '*') {
      return new RegExp('^.*$');
    }

    var pathExp = '^';
    path = path.split('/').splice(1, path.length);

    for (var i = 0; i < path.length; i++) {
      pathExp += '/' + path[i].replace(/([*])/g, ".*")
        .replace(/(:[A-Za-z0-9]+)/g, "(.+)");
    }

    pathExp += '$';
    return new RegExp(pathExp);

  }

  /**
   * Path parameters
   * @param  {String} path
   * @return {Array}
   * @api private
   */

  function pathParams(path) {
    var params = path.match(/:([A-Za-z0-9]+)/g) || [];
    for (var i = 0; i < params.length; i++) {
      params[i] = params[i].substr(1);
    }
    return params;
  }

  /**
   * Create context
   * @param  {Object} route
   * @return {Object}
   * @api private
   */

  function context(route) {

    var values = hsh.route.match(route.exp);

    if (!values) {
      return;
    }

    var ctx = {};
    ctx.route = hsh.route;
    ctx.params = {};

    for (var i = 0; i < route.params.length; i++) {
      ctx.params[route.params[i]] = values[i + 1];
    }

    return ctx;

  }

  /**
   * Hash change event callback
   * @api private
   */

  function hashChangeListener() {

    hsh.route = location.hash.substr(options.pref.length);

    for (var i = 0, ctx; i < routes.length; i++) {
      ctx = context(routes[i]);
      if (ctx) {
        routes[i].fn.call(ctx);
        break;
      }
    }

  }

  /**
   * Fix hash change event for IE7-
   * @param {String} hash
   * @api private
   */

  function hashChangeListenerFix(hash) {

    if (hash !== location.hash) {
      hashChangeListener();
      hash = location.hash;
    }

    setTimeout(function() {
      hashChangeListenerFix(hash);
    }, 500);

  }

  /**
   * Set options
   * @param {String} name
   * @param {String} value
   * @api private
   */

  function set(name, value) {
    if (name in options) {
      options[name] = value;
    }
  }

  /**
   * Start listener
   * @api private
   */

  function start() {

    if (location.hash.length <= options.pref.length) {
      location.hash = options.pref + options.index;
    }

    hashChangeListener();

    if (!hashChangeDetect) {
      hashChangeListenerFix();
    } else if ('addEventListener' in window) {
      window.addEventListener('hashchange', hashChangeListener, false);
    } else {
      window.attachEvent('onhashchange', hashChangeListener);
    }

  }

  /**
   * Module
   * @param {String} path
   * @param {Function} fn
   * @api public
   */

  function hsh(path, fn) {

    if (typeof path === 'function') {
      return hsh('*', path);
    }

    if (typeof fn === 'function') {
      var route = {};
      route.path = path;
      route.exp = pathRegExp(path);
      route.params = pathParams(path);
      route.fn = fn;
      routes.push(route);
    } else {
      start();
    }

  }

  /**
   * Current route
   * @return {String}
   * @api public
   */

  hsh.route = null;

  /**
   * Set options
   * @param {String|Object} name
   * @param {String} option
   * @api public
   */

  hsh.set = function(name, value) {
    if (typeof name === 'object') {
      for (var i in name) {
        if (name.hasOwnProperty(i)) {
          set(i, name[i]);
        }
      }
    } else {
      set(name, value);
    }
  };

  /**
   * Internal redirect /index -> /#/index
   * @param {String} route
   * @api public
   */

  hsh.redirectInternal = function(route) {
    if (!route) {
      location.hash = options.pref + route;
    }
  };

  /**
   * External redirect /index -> /index
   * @param {String} route
   * @api public
   */

  hsh.redirectExternal = function(route) {
    if (!route) {
      location = route;
    }
  };

  /**
   * Module exports
   */

  if (typeof define === 'function' && define.amd) {
    define([], function() { return hsh; });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = hsh;
  } else {
    this.hsh = hsh;
  }

}.call(this);
