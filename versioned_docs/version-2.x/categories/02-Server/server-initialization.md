---
title: Server Initialization
sidebar_label: Initialization
sidebar_position: 2
slug: /server-initialization/
---

Once you have [installed](/docs/v2/server-installation/) the Socket.IO server library, you can now init the server. The complete list of options can be found [here](/docs/v2/server-api/#new-Server-httpServer-options).

## Syntax

### CommonJS

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  // ...
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

### ES modules

Please see [here](https://nodejs.org/api/esm.html#esm_enabling) for enabling ECMAScript modules in your Node.js project.

```js
import { createServer } from "http";
import Server from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // ...
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

### TypeScript

First, you need to install the types: `npm i --save-dev @types/socket.io`

```ts
import { createServer } from "http";
import Server = require("socket.io");
import { Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // ...
});

io.on("connection", (socket: Socket) => {
  // ...
});

httpServer.listen(3000);
```

## Initialization

### Standalone

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

### Attached to an existing HTTP server

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

### With Express

```js
const app = require('express')();
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

io.on('connection', socket => { /* ... */ });

server.listen(3000);
```

More information [here](http://expressjs.com/).

### With Koa

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

The complete list of options can be found [here](/docs/v2/server-api/#new-Server-httpServer-options). Here are those which you will most likely use:

### `perMessageDeflate` option

Default value: `false`

The WebSocket server provided by the [ws](https://www.npmjs.com/package/ws) package supports the [permessage-deflate extension](https://tools.ietf.org/html/rfc7692), which enables the client and server to negotiate a compression algorithm and its parameters, and then selectively apply it to the data payloads of each WebSocket message.

Starting from Socket.IO v2.4.0 (and in v3), this extension is now disabled by default, because it adds a significant overhead in terms of performance and memory consumption (and the ws maintainers [suggest](https://github.com/websockets/ws#websocket-compression) to only enable it if it is really needed).

For previous versions, you can disable it with:

```js
const io = require('socket.io')({
  perMessageDeflate: false
});
```

### `maxHttpBufferSize` option

Default value: `1e6`

This defines how many bytes a single message can be, before closing the socket. It defaults to `1e6` (1MB). You may increase or decrease this value depending on your needs.

```js
const io = require('socket.io')({
  maxHttpBufferSize: 1e8
});
```

It matches the [maxPayload](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback) option of the ws package.
