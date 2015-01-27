// Hsh © 2013-2015 Andrey Polischuk
// github.com/andrepolischuk/hsh

!function() {

  'use strict';

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
   * Execute route
   * @param  {String} path
   * @param  {Object} route
   * @return {Function}
   * @api private
   */

  function exec(path, route) {

    if (!route) {
      return;
    }

    var params = path.match(route.exp);
    var next = exec(path, hsh.routes[route.queue + 1]);

    if (!params && next) {
      return function() {
        next();
      };
    }

    return function() {
      route.fn(new Context(path, route, params), next);
    };

  }

  /**
   * Route
   * @param {String} path
   * @param {Function} fn
   * @api private
   */

  function Route(path, fn) {
    this.queue = hsh.routes.length;
    this.path = path;
    this.exp = pathRegExp(this.path);
    this.params = pathParams(this.path);
    this.fn = fn;
  }

  /**
   * Context
   * @param  {String} path
   * @param  {Object} route
   * @param  {Array} params
   * @return {Object}
   * @api private
   */

  function Context(path, route, params) {
    this.path = path;
    this.origin = route.path;
    this.exp = route.exp;
    this.params = {};
    for (var i = 0; i < params.length - 1; i++) {
      this.params[route.params[i] || i] = params[i + 1];
    }
  }

  /**
   * Hash change handler
   * @api private
   */

  function hashChange() {
    hsh.current = location.hash.replace(new RegExp([
      '^#',
      hsh.prefix.replace(/(\(|\)|\[|\]|\\|\.|\^|\$|\||\?|\+)/g, "\\$1"),
      '(.+)$'
    ].join('')), "$1");
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
    } else if (typeof path === 'string') {
      hsh.redirect(path);
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
   * Routes
   * @api public
   */

  hsh.routes = [];

  /**
   * Show defined context
   * @param {String} path
   * @api public
   */

  hsh.show = function(path) {

    var next = exec(path, hsh.routes[0]);

    if (next) {
      next();
    }

  };

  /**
   * Internal redirect /index -> /#/index
   * @param {String} path
   * @api public
   */

  hsh.redirect = function(path) {
    if (path) {
      location.hash = hsh.prefix + path;
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
   * Start listener
   * @api public
   */

  hsh.start = function() {

    if (location.hash.length <= hsh.prefix.length) {
      location.hash = hsh.prefix + '/';
    }

    hashChange();

    if (!hashChangeDetect) {
      hashChangeFix();
    } else if ('addEventListener' in window) {
      window.addEventListener('hashchange', hashChange, false);
    } else {
      window.attachEvent('onhashchange', hashChange);
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
