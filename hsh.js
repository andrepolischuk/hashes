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
   * Route
   * @param {String} path
   * @param {Function} fn
   * @api private
   */

  function Route(path, fn) {
    this.path = path;
    this.exp = this.pathRegExp();
    this.params = this.pathParams();
    this.fn = fn;
  }

  /**
   * Path expression
   * @param  {String} path
   * @return {String}
   * @api private
   */

  Route.prototype.pathRegExp = function() {

    if (this.path === '*') {
      return new RegExp('^.*$');
    }

    var pathExp = '^';
    var path = this.path.split('/').splice(1, this.path.length);

    for (var i = 0; i < path.length; i++) {
      pathExp += '/' + path[i].replace(/([*])/g, ".*")
        .replace(/(:[A-Za-z0-9]+)/g, "(.+)");
    }

    pathExp += '$';
    return new RegExp(pathExp);

  };

  /**
   * Path parameters
   * @param  {String} path
   * @return {Array}
   * @api private
   */

  Route.prototype.pathParams = function() {

    var params = this.path.match(/:([A-Za-z0-9]+)/g) || [];

    for (var i = 0; i < params.length; i++) {
      params[i] = params[i].substr(1);
    }

    return params;

  };

  /**
   * Context
   * @param  {Object} route
   * @return {Object}
   * @api private
   */

  function Context(route) {

    var values = hsh.current.match(route.exp);

    if (!values) {
      return;
    }

    this.route = hsh.current;
    this.params = {};

    for (var i = 0; i < route.params.length; i++) {
      this.params[route.params[i]] = values[i + 1];
    }

  }

  /**
   * Hash change handler
   * @api private
   */

  function hashChange() {

    hsh.current = location.hash.substr(options.pref.length);

    for (var i = 0, ctx; i < routes.length; i++) {
      ctx = new Context(routes[i]);
      if ('route' in ctx) {
        routes[i].fn.call(ctx);
        break;
      }
    }

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
      routes.push(new Route(path, fn));
    } else {
      start();
    }

  }

  /**
   * Current path
   * @return {String}
   * @api public
   */

  hsh.current = null;

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
   * @param {String} path
   * @api public
   */

  hsh.redirectInternal = function(path) {
    if (!path) {
      location.hash = options.pref + path;
    }
  };

  /**
   * External redirect /index -> /index
   * @param {String} path
   * @api public
   */

  hsh.redirectExternal = function(path) {
    if (!path) {
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
