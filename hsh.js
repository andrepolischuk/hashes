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
   * Path expression
   * @param  {String} path
   * @return {String}
   * @api private
   */

  function pathRegExp(path) {

    if (path instanceof RegExp) {
      return path;
    }

    if (path === '*') {
      return new RegExp('^.*$');
    }

    var pathExp = '^';
    path = path.split('/').splice(1, path.length);

    for (var i = 0; i < path.length; i++) {
      pathExp += '\\/' + path[i]
        .replace(/(\(|\)|\[|\]|\\|\.|\^|\$|\||\?|\+)/g, "\\$1")
        .replace(/([*])/g, ".*")
        .replace(/(:\w+)/g, "(.+)");
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

    if (path instanceof RegExp) {
      return [];
    }

    var params = path.match(/:(\w+)/g) || [];

    for (var i = 0; i < params.length; i++) {
      params[i] = params[i].substr(1);
    }

    return params;

  }

  /**
   * Route
   * @param {String} path
   * @param {Function} fn
   * @api private
   */

  function Route(path, fn) {
    this.path = path;
    this.exp = pathRegExp(this.path);
    this.params = pathParams(this.path);
    this.fn = fn;
  }

  /**
   * Context
   * @param  {String} path
   * @param  {Object} route
   * @return {Object}
   * @api private
   */

  function Context(path, route) {

    var values = path.match(route.exp);

    if (!values) {
      return;
    }

    this.route = path;
    this.params = {};

    for (var i = 0; i < values.length - 1; i++) {
      this.params[route.params[i] || i] = values[i + 1];
    }

  }

  /**
   * Hash change handler
   * @api private
   */

  function hashChange() {
    hsh.current = location.hash.substr(options.pref.length);
    hsh.show(hsh.current);
  }

  /**
   * Fix hash change for IE7-
   * @param {String} path
   * @api private
   */

  function hashChangeFix(path) {

    if (path !== location.hash) {
      hashChange();
      path = location.hash;
    }

    setTimeout(function() {
      hashChangeFix(path);
    }, 500);

  }

  /**
   * Start listener
   * @api private
   */

  function start() {

    if (location.hash.length <= options.pref.length) {
      location.hash = options.pref + options.index;
    }

    hashChange();

    if (!hashChangeDetect) {
      hashChangeFix();
    } else if ('addEventListener' in window) {
      window.addEventListener('hashchange', hashChange, false);
    } else {
      window.attachEvent('onhashchange', hashChange);
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
      hsh.routes.push(new Route(path, fn));
    } else {
      start();
    }

  }

  /**
   * Current path
   * @api public
   */

  hsh.current = null;

  /**
   * Routes
   * @api public
   */

  hsh.routes = [];

  /**
   * Show defined context
   * @param {String} path
   * @api private
   */

  hsh.show = function(path) {
    for (var i = 0, ctx; i < hsh.routes.length; i++) {
      ctx = new Context(path, hsh.routes[i]);
      if ('route' in ctx) {
        hsh.routes[i].fn.call(ctx);
        break;
      }
    }
  };

  /**
   * Internal redirect /index -> /#/index
   * @param {String} path
   * @api public
   */

  hsh.redirect = function(path) {
    if (path) {
      location.hash = options.pref + path;
    }
  };

  /**
   * External redirect /index -> /index
   * @param {String} path
   * @api public
   */

  hsh.redirectExternal = function(path) {
    if (path) {
      location = path;
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
