// Hashes © 2013-2014 Andrey Polischuk
// https://github.com/andrepolischuk/hashes

!function(undefined) {

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
   * Previous route
   */

  var previous;

  /**
   * Callback
   */

  var callback;

  /**
   * MSIE 8- detection
   */

  var msie = /MSIE.\d+\./gi.test(navigator.userAgent) &&
    parseInt(navigator.userAgent.replace(/.*MSIE.(\d+)\..*/gi, "$1")) < 8;

  /**
   * Hash expression
   * @return {RegExp}
   * @api private
   */

  var exp = function() {
    return new RegExp('^' + options.pref + '(.+)$');
  };

  /**
   * Get current route
   * @return {String}
   * @api private
   */

  var getCurrentRoute = function() {
    return window.location.hash.replace(exp(), "$1");
  };

  /**
   * Hash change event callback
   * @api private
   */

  var locationListener = function() {

    if (window.location.hash.length <= options.pref.length) {
      window.location.hash = options.pref + options.index;
    }

    var current = getCurrentRoute();

    if (previous === current) {
      return false;
    }

    previous = current;

    if (typeof callback === 'function') {
      callback(current);
    }

  };

  /**
   * Set options
   * @param {String} name
   * @param {String} value
   */

  var set = function(name, value) {
    if (name in options) {
      options[name] = value;
    }
  };

  /**
   * Hashes
   * @param {Function} fn
   * @api public
   */

  function hashes(fn) {

    if (typeof fn === 'function') {
      callback = fn;
      locationListener();
    }

  }

  /**
   * Set options
   * @param {String|Object} name
   * @param {String} option
   */

  hashes.set = function(name, value) {

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

  hashes.redirectInternal = function(route) {
    if (!route) {
      window.location.hash = options.pref + route;
    }
  };

  /**
   * External redirect /index -> /index
   * @param {String} route
   * @api public
   */

  hashes.redirectExternal = function(route) {
    if (!route) {
      window.location = route;
    }
  };

  /**
   * Current route
   * @return {String}
   * @api public
   */

  hashes.route = getCurrentRoute();

  /**
   * Hash change listener
   */

  if ('onhashchange' in window && !msie) {

    if ('addEventListener' in window) {
      window.addEventListener('hashchange', locationListener, false);
    } else if ('attachEvent' in window) {
      window.attachEvent('onhashchange', locationListener);
    }

  } else {

    (function locationListenerIe(hash) {

      if (hash !== window.location.hash) {
        locationListener();
        hash = window.location.hash;
      }

      setTimeout(function() {
        locationListenerIe(hash);
      }, 500);

    })();

  }

  /**
   * Module exports
   */

  if (typeof define === 'function' && define.amd) {

    define([], function() {
      return hashes;
    });

  } else if (typeof module !== 'undefined' && module.exports) {

    module.exports = hashes;

  } else {

    this.hashes = hashes;

  }

}.call(this);
