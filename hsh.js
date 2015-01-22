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
   * onhashchange detection
   */

  var hashChangeDetect = 'onhashchange' in window &&
    !(/MSIE.\d+\./gi.test(navigator.userAgent) &&
    parseInt(navigator.userAgent.replace(/.*MSIE.(\d+)\..*/gi, "$1")) < 8);

  /**
   * Hash expression
   * @param  {String} path
   * @return {String}
   * @api private
   */

  function exp(path) {

    var pathExp = '^';
    path = path === '*' ? '/' + path : path;
    path = path.split('/').splice(1);

    for (var i = 0; i < path.length; i++) {
      pathExp += '/' + (path[i] === '*' ? '.*' : path[i]);
    }

    pathExp += '$';
    return new RegExp(pathExp);

  }

  /**
   * Get current route
   * @return {String}
   * @api private
   */

  function getCurrentRoute() {
    return window.location.hash.replace(new RegExp([
      '^',
      options.pref,
      '(.*)$'
    ].join('')), "$1");
  }

  /**
   * Hash change event callback
   * @api private
   */

  function hashChangeListener() {

    var current = getCurrentRoute();

    if (hsh.route === current) {
      return;
    }

    hsh.route = current;

    for (var i = 0; i < routes.length; i++) {
      if (routes[i].exp.test(current)) {
        routes[i].fn(current);
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

    if (hash !== window.location.hash) {
      hashChangeListener();
      hash = window.location.hash;
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

    if (window.location.hash.length <= options.pref.length) {
      window.location.hash = options.pref + options.index;
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
      route.exp = exp(path);
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
      window.location.hash = options.pref + route;
    }
  };

  /**
   * External redirect /index -> /index
   * @param {String} route
   * @api public
   */

  hsh.redirectExternal = function(route) {
    if (!route) {
      window.location = route;
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
