title: Socket.IO  —  Apache Cordova
permalink: /socket-io-with-apache-cordova/
---

Since Apache Cordova apps are written mostly in JS, it is actually really easy to use Socket.IO! Let&#8217;s walk through a small example.

First we prepare a simple server:

```js
var server = require('http').createServer();
var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {
    console.log('socket connected');

    socket.on('disconnect', function () {
        console.log('socket disconnected');
    });

    socket.emit('text', 'wow. such event. very real time.');
});

server.listen(3000);
```

This server will simply listen to Socket.IO client connections, and will emit some text to them via a `text` event.

Now let&#8217;s get get down to the point. We want to start off by creating a new Cordova project to start modifying. Let&#8217;s start from scratch.

Running

```
npm install -g cordova
```

will install the actual Cordova cli tool we use to create projects, install/remove dependencies, and launch our emulator among other things.

```
cordova create socket.io-example socket.io.example socket.io-example
```

will make a new project template for us to start modifying. Feel free to poke around the newly created folder, called `socket.io-example` and take a look at some of the created files.

You should now be in the project folder. If you didn&#8217;t navigate there yet in command line, do it now with `cd socket.io-example`.

Since I&#8217;m developing this example on OS X, I&#8217;m going to build for iOS. You could do it similarly for Android. To add the build target, run the following:

```
cordova platform add ios
```

Next we want to build all the native components. We can do this by running

```
cordova build ios
```

Now let&#8217;s actually run the template application to see that everything is working. If you are on OS X, you can install the iOS emulator like so

```
brew install ios-sim
```

You should see the emulator open up with something like this when running `cordova emulate ios`:

<img src="https://cloudup.com/cKoYEzCeKKY+" alt="null" />

Now that you see everything working with the actual setup, let&#8217;s start write some code. Open up `www/index.html` in your project directory. It should look something like this:

```html
<!DOCTYPE html>
<!--
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
-->
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="format-detection" content="telephone=no" />
        <!-- WARNING: for iOS 7, remove the width=device-width and height=device-height attributes. See https://issues.apache.org/jira/browse/CB-4323 -->
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" />
        <link rel="stylesheet" type="text/css" href="css/index.css" />
        <meta name="msapplication-tap-highlight" content="no" />
        <title>Hello World</title>
    </head>
    <body>
        <div class="app">
            <h1>Apache Cordova</h1>
            <div id="deviceready" class="blink">
                <p class="event listening">Connecting to Device</p>
                <p class="event received">Device is Ready</p>
            </div>
        </div>
        <script type="text/javascript" src="cordova.js"></script>
        <script type="text/javascript" src="js/index.js"></script>
        <script type="text/javascript">
            app.initialize();
        </script>
    </body>
</html>
```

To begin, we need to get the Socket.IO-client script. We can take it from the CDN like so:

```html
<script type="text/javascript" src="cordova.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
<script type="text/javascript" src="js/index.js"></script>
```

Now to add actual logic, let&#8217;s write things below the `app.initialize` call. We might want to make sure that the device has loaded the application before running any of our code. We can do this like so:

```html
<script type="text/javascript">
  app.initialize();

  document.addEventListener('deviceready', function() {
    // code goes here
  });
</script>
```

This event will fire when the application has fully loaded. To add some actual logic, we just need to fill in that function. Let&#8217;s make something that receives the data emitted by our server on socket connection, and bring a notification box to show that text. Here&#8217;s what you could do:

```html
<script type="text/javascript">
  app.initialize();

  document.addEventListener('deviceready', function() {
    socket.on('connect', function() {
      socket.on('text', function(text) {
        alert(text);
       });
     });
  });
</script>
```

Let&#8217;s run the emulator again with `cordova emulate ios`, and here&#8217;s what you should see:

<img src="https://cloudup.com/cuIaVMrmcyP+" alt="null" />

That&#8217;s it! I hope this will help to get you started! Have fun hacking!
