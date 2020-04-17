title: Socket.IO  —  Docs
type: docs
---

## What Socket.IO is

Socket.IO is a library that enables real-time, bidirectional and event-based communication between the browser and the server. It consists of:

- a Node.js server: [Source](https://github.com/socketio/socket.io) | [API](/docs/server-api/)
- a Javascript client library for the browser (which can be also run from Node.js): [Source](https://github.com/socketio/socket.io-client) | [API](/docs/client-api/)

Its main features are:

### Reliability

Connections are established even in the presence of:

- proxies and load balancers.
- personal firewall and antivirus software.

For this purpose, it relies on [Engine.IO](https://github.com/socketio/engine.io), which first establishes a long-polling connection, then tries to upgrade to better transports that are "tested" on the side, like WebSocket. Please see the [Goals](https://github.com/socketio/engine.io#goals) section for more information.

### Auto-reconnection support

Unless instructed otherwise a disconnected client will try to reconnect forever, until the server is available again. Please see the available reconnection options [here](https://socket.io/docs/client-api/#new-Manager-url-options).

### Disconnection detection

A heartbeat mechanism is implemented at the Engine.IO level, allowing both the server and the client to know when the other one is not responding anymore.

That functionality is achieved with timers set on both the server and the client, with timeout values (the pingInterval and pingTimeout parameters) shared during the connection handshake. Those timers require any subsequent client calls to be directed to the same server, hence the sticky-session requirement when using multiples nodes.

### Binary support

Any serializable data structures can be emitted, including:

- [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) and [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) in the browser
- [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) and [Buffer](https://nodejs.org/api/buffer.html) in Node.js

### Multiplexing support

In order to create separation of concerns within your application (for example per module, or based on permissions), Socket.IO allows you to create several [Namespaces](/docs/rooms-and-namespaces/#Namespaces), which will act as separate communication channels but will share the same underlying connection.

### Room support

Within each [Namespace](/docs/rooms-and-namespaces/#Namespaces), you can define arbitrary channels, called [Rooms](/docs/rooms-and-namespaces/#Rooms), that sockets can join and leave. You can then broadcast to any given room, reaching every socket that has joined it.

This is a useful feature to send notifications to a group of users, or to a given user connected on several devices for example.


Those features come with a simple and convenient API, which looks like the following:

```js
io.on('connection', function(socket){
  socket.emit('request', /* */); // emit an event to the socket
  io.emit('broadcast', /* */); // emit an event to all connected sockets
  socket.on('reply', function(){ /* */ }); // listen to the event
});
```


## What Socket.IO is not

Socket.IO is **NOT** a WebSocket implementation. Although Socket.IO indeed uses WebSocket as a transport when possible, it adds some metadata to each packet: the packet type, the namespace and the packet id when a message acknowledgement is needed. That is why a WebSocket client will not be able to successfully connect to a Socket.IO server, and a Socket.IO client will not be able to connect to a WebSocket server either. Please see the protocol specification [here](https://github.com/socketio/socket.io-protocol).

```js
// WARNING: the client will NOT be able to connect!
const client = io('ws://echo.websocket.org');
```


## Installing

### Server

```
npm install --save socket.io
```

[Source](https://github.com/socketio/socket.io)

### Javascript Client

A standalone build of the client is exposed by default by the server at `/socket.io/socket.io.js`.

It can also be served from a CDN, like [cdnjs](https://cdnjs.com/libraries/socket.io).

To use it from Node.js, or with a bundler like [webpack](https://webpack.js.org/) or [browserify](http://browserify.org/), you can also install the package from npm:

```
npm install --save socket.io-client
```

[Source](https://github.com/socketio/socket.io-client)

### Other client implementations

There are several client implementations in other languages, which are maintained by the community:

- Java: https://github.com/socketio/socket.io-client-java
- C++: https://github.com/socketio/socket.io-client-cpp
- Swift: https://github.com/socketio/socket.io-client-swift
- Dart: https://github.com/rikulo/socket.io-client-dart
- Python: https://github.com/miguelgrinberg/python-socketio
- .Net: https://github.com/Quobject/SocketIoClientDotNet

## Using with Node http server

### Server (app.js)

```js
const app = require('http').createServer(handler)
const io = require('socket.io')(app);
const fs = require('fs');

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', (data) => {
    console.log(data);
  });
});
```

### Client (index.html)

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io('http://localhost');
  socket.on('news', (data) => {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
</script>
```

## Using with Express

### Server (app.js)

```js
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(80);
// WARNING: app.listen(80) will NOT work here!

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', (data) => {
    console.log(data);
  });
});
```

### Client (index.html)

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io.connect('http://localhost');
  socket.on('news', (data) => {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
</script>
```

## Sending and receiving events

Socket.IO allows you to emit and receive custom events. Besides `connect`, `message` and `disconnect`, you can emit custom events:

### Server

```js
// note, io(<port>) will create a http server for you
const io = require('socket.io')(80);

io.on('connection', (socket) => {
  io.emit('this', { will: 'be received by everyone'});

  socket.on('private message', (from, msg) => {
    console.log('I received a private message by ', from, ' saying ', msg);
  });

  socket.on('disconnect', () => {
    io.emit('user disconnected');
  });
});
```

## Restricting yourself to a namespace

If you have control over all the messages and events emitted for a particular application, using the default / namespace works. If you want to leverage 3rd-party code, or produce code to share with others, socket.io provides a way of namespacing a socket.

This has the benefit of `multiplexing` a single connection. Instead of socket.io using two `WebSocket` connections, it’ll use one.

### Server (app.js)

```js
const io = require('socket.io')(80);
const chat = io
  .of('/chat')
  .on('connection', (socket) => {
    socket.emit('a message', {
        that: 'only'
      , '/chat': 'will get'
    });
    chat.emit('a message', {
        everyone: 'in'
      , '/chat': 'will get'
    });
  });

const news = io
  .of('/news')
  .on('connection', (socket) => {
    socket.emit('item', { news: 'item' });
  });
```

### Client (index.html)

```html
<script>
  const chat = io.connect('http://localhost/chat')
    , news = io.connect('http://localhost/news');
  
  chat.on('connect', () => {
    chat.emit('hi!');
  });
  
  news.on('news', () => {
    news.emit('woot');
  });
</script>
```

## Sending volatile messages

Sometimes certain messages can be dropped. Let’s say you have an app that shows realtime tweets for the keyword `bieber`.

If a certain client is not ready to receive messages (because of network slowness or other issues, or because they’re connected through long polling and is in the middle of a request-response cycle), if it doesn’t receive ALL the tweets related to bieber your application won’t suffer.

In that case, you might want to send those messages as volatile messages.

### Server

```js
const io = require('socket.io')(80);

io.on('connection', (socket) => {
  const tweets = setInterval(() => {
    getBieberTweet((tweet) => {
      socket.volatile.emit('bieber tweet', tweet);
    });
  }, 100);

  socket.on('disconnect', () => {
    clearInterval(tweets);
  });
});
```

## Sending and getting data (acknowledgements)

Sometimes, you might want to get a callback when the client confirmed the message reception.

To do this, simply pass a function as the last parameter of `.send` or `.emit`. What’s more, when you use `.emit`, the acknowledgement is done by you, which means you can also pass data along:

### Server (app.js)

```js
const io = require('socket.io')(80);

io.on('connection', (socket) => {
  socket.on('ferret', (name, word, fn) => {
    fn(name + ' says ' + word);
  });
});
```

### Client (index.html)

```html
<script>
  const socket = io(); // TIP: io() with no args does auto-discovery
  socket.on('connect', () => { // TIP: you can avoid listening on `connect` and listen on events directly too!
    socket.emit('ferret', 'tobi', 'woot', (data) => { // args are sent in order to acknowledgement function
      console.log(data); // data will be 'tobi says woot'
    });
  });
</script>
```

## Broadcasting messages

To broadcast, simply add a `broadcast` flag to `emit` and `send` method calls. Broadcasting means sending a message to everyone else except for the socket that starts it.

### Server

```js
const io = require('socket.io')(80);

io.on('connection', (socket) => {
  socket.broadcast.emit('user connected');
});
```

## Using it just as a cross-browser WebSocket

If you just want the WebSocket semantics, you can do that too. Simply leverage `send` and listen on the `message` event:

### Server (app.js)

```js
const io = require('socket.io')(80);

io.on('connection', (socket) => {
  socket.on('message', () => { });
  socket.on('disconnect', () => { });
});
```

### Client (index.html)

```html
<script>
  const socket = io('http://localhost/');
  socket.on('connect', () => {
    socket.send('hi');

    socket.on('message', (msg) => {
      // my msg
    });
  });
</script>
```

If you don’t care about reconnection logic and such, take a look at <a href="https://github.com/socketio/engine.io">Engine.IO</a>, which is the WebSocket semantics transport layer Socket.IO uses.
