// Hashes © 2013-2014 Andrey Polischuk
// https://github.com/andrepolischuk/hashes

!function(undefined) {

  var Hashes = function(params) {

    var glob = {};

    /**
     * Default hash prefix
     */
    
    glob.pref  = '#!';
    
    /**
     * Default site index route
     */
    
    glob.index = '#!/';

    /**
     * Previous route
     */
    
    var pre  = null;

    /**
     * Current route
     */
    
    var cur  = null;
    
    /**
     * Current location.hash
     */
    
    var hash = null;

    /**
     * Msie 8- detection
     */
    
    var msie = (/MSIE.\d+\./gi.test(navigator.userAgent) && parseInt(navigator.userAgent.replace(/.*MSIE.(\d+)\..*/gi, "$1")) < 8);

    /**
     * Hash fix for msie 8-
     */
    
    if (msie) {
      var hashMsie = window.location.hash;
    }

    /**
     * Hash change event callback
     * @api private
     */
    
    var locationListener = function() {

      hash = window.location.hash;

      if (hash.length < 3) {
        window.location.hash = glob.index;
        return false;
      } else {
        cur = hash.replace(/^#!(.+)$/, "$1");
      }

      // set prevous url
      if (pre !== cur) {
        pre = cur;
      }

      // call global callback
      if ('function' === typeof(glob.callback)) {
        glob.callback(cur);
      }

    };

    /**
     * Internal redirect /index -> /#!/index
     * @param {String} location
     * @api public
     */
    
    this.redirectInternal = function(location) {
      if (location !== undefined) {
        window.location.hash = glob.pref + location;
      }
    };

    /**
     * External redirect /index -> /index
     * @param {String} location
     * @api public
     */
    
    this.redirectExternal = function(location) {
      if (location !== undefined) {
        window.location = location;
      }
    };

    /**
     * Set global params
     */
    
    if (params !== undefined) {

      if ('function' === typeof(params)) {
        
        // only callback
        glob.callback = params;

      } else {

        // multiple parameters
        for (var param in params) {
          if (params.hasOwnProperty(param)) {
            glob[param] = params[param];
          }
        }
      }

    }

    /**
     * Initialize hash change listener
     */
    
    locationListener();

    // when hash updated
    if ('onhashchange' in window && msie === false) {

      if ('addEventListener' in window) {
        window.addEventListener('hashchange', locationListener, false);
      } else if ('attachEvent' in window) {
        window.attachEvent('onhashchange', locationListener);
      }

    } else {

      (function locationListenerIe() {

        if (hashMsie !== window.location.hash) {
          locationListener();
          hashMsie = window.location.hash;
        }

        setTimeout(locationListenerIe, 500);

      })();

    }

  };

  /**
   * Module exports
   */
  
  window.Hashes = Hashes;

}();