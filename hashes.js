// Hashes © 2013-2014 Andrey Polischuk
// https://github.com/andrepolischuk/hashes

!function(undefined) {

  'use strict';

  /**
   * Hash prefix
   */

  var pref = '#';

  /**
   * Index route
   */

  var index = '/';

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
   * Start hash length check
   */

  if (window.location.hash.length < 2) {
    window.location.hash = index;
  }

  /**
   * Hash expression
   * @return {RegExp}
   * @api private
   */

  var exp = function() {
    return new RegExp('^' + pref + '(.+)$');
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
   * Internal redirect /index -> /#/index
   * @param {String} route
   * @api public
   */

  hashes.redirectInternal = function(route) {
    if (!route) {
      window.location.hash = pref + route;
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

  window.hashes = hashes;

}();
