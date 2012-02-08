var express = require('express'),
    //ejs = require('ejs'),
    oauth = (new (require('oauth').OAuth)(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        'ConSUmErkeY', //consumer key
        'coNSUm3R534cr37', //consumer secret
        '1.0',
        'http://yourserver/auth/twitter/callback', //callback url
        'HMAC-SHA1')
    );
    
var makeQueryString = function (obj) {
  var param_str = '?';
  for (var i in obj) {
    param_str += i + '=' + obj[i] + '&';
  }
  return param_str.slice(0,-1);
}

var app = express.createServer();
app.configure(function() {
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "tofucha" }));
    app.use(app.router);
    //app.register('.ejs', ejs);
    //app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    //app.use(express.static(__dirname + '/resources'));
});

app.dynamicHelpers({
    session: function(req, res) {
        return req.session;
    }
});

app.get('/', function (req, res) {
    res.send('Usage: http://tofuchaproxy-ympbyc.dotcloud.com/auth/twitter?callback=http://your.app/foo');
});

app.get('/auth/twitter', function (req, res) {
    req.session.callback = req.query.callback;
    oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
        if(error) {
            res.send(error)
        } else {
            req.session.oauth = {};
            req.session.oauth.token = oauth_token;
            req.session.oauth.token_secret = oauth_token_secret;
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token);
        }
    });
});

app.get('/auth/twitter/callback', function(req, res){
  if(req.session.oauth) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        oauth.getOAuthAccessToken(req.session.oauth.token, req.session.oauth.token_secret, req.session.oauth.verifier,
            function(error, oauth_access_token, oauth_access_token_secret, results) {
                if(error) {
                    res.send(error);
                } else {
                  req.session.oauth_access_token = oauth_access_token;
                  req.session.oauth_access_token_secret = oauth_access_token_secret;
                  res.redirect(req.session.callback + '?authorized=yes');
                }
            });
   }
});

app.get('/post/twitter', function (req, res) {
    console.log(req.query.param);
    if (!req.session.oauth_access_token){res.send(401); return;} //unauthorized
    try {
      if (!req.query.api) throw 'no api specified';
      var jsonParam = JSON.parse(req.query.param);
    } catch (e) {
      res.send(400); return;
    }
    
    oauth.post("https://api.twitter.com/1/" + req.query.api,
               req.session.oauth_access_token, 
               req.session.oauth_access_token_secret, 
               jsonParam, //{"status":req.body.status},
               function (error, data) {
                    if (error) {
                        res.send(502);
                    }
                    else {
                        res.send( req.query.callback + '(' + data + ');', {'content-type' : 'text/javascript'}, 200);
                    }
               });
});

app.get('/get/twitter', function (req, res) {
    console.log("https://api.twitter.com/1/" + req.query.api + req.query.param);
    if (!req.session.oauth_access_token){res.send(401); return;} //unauthorized
    try {
      if (!req.query.api) throw 'no api specified';
      var jsonParam = JSON.parse(req.query.param);
    } catch (e) {
      console.log(e);
      res.send(400); return;
    }
    
    oauth.get("http://api.twitter.com/1/" + req.query.api + makeQueryString(jsonParam),
               req.session.oauth_access_token, 
               req.session.oauth_access_token_secret, 
               function (error, data) { 
                    if (error) {
                        res.send(502);
                    }
                    else {
                        res.send( req.query.callback + '(' + data + ');', {'content-type' : 'text/javascript'}, 200);
                    }
               });
});

app.get('/is/authorized', function (req, res) {
  if (!!req.session.oauth_access_token && !!req.session.oauth_access_token_secret)
    res.send(req.query.callback + '(true);', {'content-type' : 'text/javascript'}, 200);
  else
    res.send(req.query.callback + '(false);', {'content-type' : 'text/javascript'}, 200);
});

app.listen(8080);
