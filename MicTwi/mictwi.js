/*
 * MicTwi is a client-side javascript module that allows your script to 
 * make ajax requests to twitter's REST APIs.
 * MicTwi is equiped with following methods and attributes:
 * MicTwi
 *   oauthProxy: "http://proxy-url"
 *   callbackUrl: "http://where.to/come/back/after/oauth"
 *   generateGetAPI: function (api) { //returns a function to access to the twitter api specified by the argument.
 *   generatePostAPI: function (api) { //same as above but with POST method. 
 *   oauth: function (callback) { //redirect users to twitter's OAuth prompt only when they are not authorized.
 *   ifAuthorized: function (whent, whenf) { //call whent if authorized, otherwise whenf will be called.
 *   
 * Example:
 * MicTwi.oauth(function () {
 *  var foo = MicTwi.generateGetAPI('users/show.json');
 *  foo({screen_name: 'ympbyc'},function(obj){
 *    alert(obj.name + ' : ' + obj.description);
 *  });
 * });
 */

var MicTwi = (function (){
  var generateGetAPI = function (api) {
    api = ((api.search(/\.json$/) > -1) ? api : api + '.json');
    return (arguments[1] == false) ?
      function (param, callback){ //oauth NOT required
        jsonp({
          url: 'https://api.twitter.com/1/' + api,
          jsonp: 'callback',
          data: param || {},
          success: function (json) { (callback || function(){}) (json); }
        });
      }
    :
      function (param, callback) { //oauth required
        jsonp({
          url: MicTwi.oauthProxy + '/get/twitter',
          jsonp: "callback",
          data: {api : api,
                 param : JSON.stringify((param || {}))},
          success: function (json) { (callback || function(){}) (json); }
        });
      };
  }
  
  var generatePostAPI = function (api) {
    api = ((api.search(/\.json$/) > -1) ? api : api + '.json');
    return function (param, callback) {
      param = param || {};
      jsonp({
        url: MicTwi.oauthProxy + '/post/twitter',
        jsonp: "callback",
        data: {api : api,
               param : JSON.stringify((param || {}))},
        success: function (json) { (callback || function(){}) (json); }
      });
    };
  }
  
  var makeQueryString = function (obj) {
    var param_str = '?';
    for (var i in obj) {
      param_str += i + '=' + obj[i] + '&';
    }
    return (param_str.length > 1) ? param_str.slice(0,-1) : '?dummy';
  }

  var jsonp = function (o) {
    var callbackName = 'MicTwi' + (new Date).getTime();
    window[callbackName] = o.success;
    var s = document.createElement('script');
    s.src = o.url + makeQueryString(o.data) + '&' + o.jsonp + '=' + callbackName;
    s.id = callbackName;
    document.body.appendChild(s);
    setTimeout(function () {
      delete window[callbackName];
      document.body.removeChild(document.getElementById(callbackName))
    }, 5000);
  }

  var MicTwi = {
    oauthProxy: "http://tofuchaproxy-ympbyc.dotcloud.com/", // Proxy server that handles OAuth requests.
    callbackUrl: location.origin + location.pathname, // Page to return after OAuth Authorization.
        
    /* call whent if authorized, otherwise whenf will be called */
    ifAuthorized: function(whent, whenf) {
      whenf = whenf || function(){};
      jsonp({
        url: 'http://tofuchaproxy-ympbyc.dotcloud.com/is/authorized',
        data: {dummy: 'dummy'}, jsonp: 'callback', 
        success: function (bool) { bool? whent() : whenf(); }
      });
    },
    
    oauth: function (callback) {
      MicTwi.ifAuthorized(
        callback || function(){},
        function(){
          location.href = MicTwi.oauthProxy + '/auth/twitter?callback=' + MicTwi.callbackUrl;
        });
    },
  }
  
  /* For APIs which take variables (often they are user-ids or status-ids), 
   * you ought to generate an API function on the fly with MicTwi.generateGetAPI() / MicTwi.generatePostAPI.
   * eg: MicTwi.favorites.create = MicTwi.generatePostAPI('favorites/create/' + 123456 + '.json'); */
  MicTwi.generateGetAPI = generateGetAPI;
  MicTwi.generatePostAPI = generatePostAPI; 
  
  return MicTwi;
})();
