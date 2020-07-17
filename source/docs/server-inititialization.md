title: Initialization
permalink: /docs/server-initialization/
type: docs
order: 202
---

Once you have [installed](/docs/server-installation/) the Socket.IO server library, you can now init the server. The complete list of options can be found [here](/docs/server-api/#new-Server-httpServer-options).

## Standalone

```js
const options = { /* ... */ };
const io = require('socket.io')(options);

io.on('connection', socket => { /* ... */ });

io.listen(3000);
```

You can also pass the port as the first argument:

```js
const options = { /* ... */ };
const io = require('socket.io')(3000, options);

io.on('connection', socket => { /* ... */ });
```

This implicitly starts a Node.js [HTTP server](https://nodejs.org/docs/latest/api/http.html#http_class_http_server), which can be accessed through `io.httpServer`.

## Attached to an existing HTTP server

```js
const server = require('http').createServer();
const options = { /* ... */ };
const io = require('socket.io')(server, options);

io.on('connection', socket => { /* ... */ });

server.listen(3000);
```

With HTTPS:

```js
const fs = require('fs');
const server = require('https').createServer({
  key: fs.readFileSync('/tmp/key.pem'),
  cert: fs.readFileSync('/tmp/cert.pem')
});
const options = { /* ... */ };
const io = require('socket.io')(server, options);

io.on('connection', socket => { /* ... */ });

server.listen(3000);
```

## With Express

```js
const app = require('express')();
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

io.on('connection', socket => { /* ... */ });

server.listen(3000);
```

More information [here](http://expressjs.com/).

## With Koa

```js
const app = require('koa')();
const server = require('http').createServer(app.callback());
const options = { /* ... */ };
const io = require('socket.io')(server, options);

io.on('connection', socket => { /* ... */ });

server.listen(3000);
```

More information [here](https://koajs.com/).

## Notable options

The complete list of options can be found [here](/docs/server-api/#new-Server-httpServer-options). Here are those which you will most likely use:

### `perMessageDeflate` option

Default value: `true`

The WebSocket server provided by the [ws](https://www.npmjs.com/package/ws) package supports the [permessage-deflate extension](https://tools.ietf.org/html/rfc7692), which enables the client and server to negotiate a compression algorithm and its parameters, and then selectively apply it to the data payloads of each WebSocket message.

As of Socket.IO v2, it is **enabled** by default, though it adds a significant overhead in terms of performance and memory consumption (and the ws maintainers [suggest](https://github.com/websockets/ws#websocket-compression) to only enable it if it is really needed).

So you can disable it with:

```js
const io = require('socket.io')({
  perMessageDeflate: false
});
```

Please note that it will be disabled by default in Socket.IO v3.

### `maxHttpBufferSize` option

Default value: `10e7`

This defines how many bytes a message can be, before closing the socket. It defaults to `10e7` (100MB). You may increase or decrement this value depending on your needs.

```js
const io = require('socket.io')({
  maxHttpBufferSize: 1e5
});
```

It matches the [maxPayload](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback) option of the ws package.
