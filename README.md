#MicTwi.js and its OAuth proxy server


##Use it!
<pre>&lt;script src="https://github.com/ympbyc/MicTwi.js/MicTwi/mictwi.js"&gt;&lt;/script&gt;

&lt;script type="text/javascript"&lt;
MicTwi.oauth(function(){
  var tweet = MicTwi.generatePostAPI('statuses/update');
  tweet({status: "whatever"}, function(j){console.log(j)});
});
&lt;/script&gt;&lt;/pre&gt;

##Installation
* register an application at http://dev.twitter.com/
* replace certain keys in /tofucha/server.js.
* install node and npm to your server, then
<pre>npm install express
  npm install oauth </pre>

* push /tofucha to your server and let it run server.js on node.
* host /MicTwi/mictwi.js wherever you prefer.
* in your html, include a &lt;script&gt; tag pointing your mictwi.js.

##Usage example
<pre>(MicTwi.generatePostAPI('statuses/update.json'))({status: 'Posting via MicTwi'}, function(json){alert(json)});</pre>

##Author
ympbyc

##License
wtfpl

##Simple demo
http://ympbyc.kuronowish.com/akarin/mictwi.html
