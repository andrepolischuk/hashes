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

  function exp() {
    return new RegExp('^' + options.pref + '(.+)$');
  }

  /**
   * Get current route
   * @return {String}
   * @api private
   */

  function getCurrentRoute() {
    return window.location.hash.replace(exp(), "$1");
  }

  /**
   * Hash change event callback
   * @api private
   */

  function locationListener() {

    if (window.location.hash.length <= options.pref.length) {
      window.location.hash = options.pref + options.index;
    }

    var current = getCurrentRoute();

    if (previous === current) {
      return;
    }

    previous = hsh.route = current;

    if (typeof callback === 'function') {
      callback(current);
    }

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
   * Module
   * @param {Function} fn
   * @api public
   */

  function hsh(fn) {

    if (typeof callback === 'function') {
      return;
    }

    if (typeof fn === 'function') {

      callback = fn;
      locationListener();

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

    }

  }

  /**
   * Current route
   * @return {String}
   * @api public
   */

  hsh.route = options.index;

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

    define([], function() {
      return hsh;
    });

  } else if (typeof module !== 'undefined' && module.exports) {

    module.exports = hsh;

  } else {

    this.hsh = hsh;

  }

}.call(this);
