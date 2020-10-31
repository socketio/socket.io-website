title: Migrating from 2.x to 3.0
permalink: /docs/migrating-from-2-x-to-3-0/
type: docs
order: 502
---

**Disclaimer**: This is a work in progress. You can track the progress and submit feedback [here](https://github.com/socketio/socket.io/issues/3250).

This release should fix most of the inconsistencies of the Socket.IO library and provide a more intuitive behavior for
the end users. It is the result of the feedback of the community over the years. A big thanks to everyone!

Here is the complete list of changes:

- [Miscellaneous](#miscellaneous)
  - [The Socket.IO codebase has been rewritten to TypeScript](#The-Socket-IO-codebase-has-been-rewritten-to-TypeScript)
  - [Support for IE8 and Node.js 8 is officially dropped](#Support-for-IE8-and-Node-js-8-is-officially-dropped)
- [Configuration](#Configuration)
  - [Saner default values](#Saner-default-values)
  - [CORS handling](#CORS-handling)
- [API change](#API-change)
  - [io.set() is removed](#io-set-is-removed)
  - [No more implicit connection to the default namespace](#No-more-implicit-connection-to-the-default-namespace)
  - [Namespace.connected is renamed to Namespace.sockets and is now a Map](#Namespace-connected-is-renamed-to-Namespace-sockets-and-is-now-a-Map)
  - [Socket.rooms is now a Set](#Socket-rooms-is-now-a-Set)
  - [Socket.binary() is removed](#Socket-binary-is-removed)
  - [Socket.join() and Socket.leave() are now synchronous](#Socket-join-and-Socket-leave-are-now-synchronous)
  - [Socket.use() is removed](#Socket-use-is-removed)
  - [A middleware error will now emit an Error object](#A-middleware-error-will-now-emit-an-Error-object)
- [New features](#New-features)
  - [Catch-all listeners](#Catch-all-listeners)
  - [Volatile events (client)](#Volatile-events-client)
  - [Official bundle with the msgpack parser](#Official-bundle-with-the-msgpack-parser)


## Miscellaneous

### The Socket.IO codebase has been rewritten to TypeScript

Which means `npm i -D @types/socket.io` should not be needed anymore.

Server:

```ts
import { Server, Socket } from "socket.io";

const io = new Server(8080);

io.on("connect", (socket: Socket) => {
    console.log(`connect ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`disconnect ${socket.id}`);
    });
});
```

Client:

```ts
import { Manager } from "socket.io-client";

const manager = new Manager("ws://localhost:8080");
const socket = manager.socket("/");

socket.on("connect", () => {
    console.log(`connect ${socket.id}`);
});
```

Plain javascript is obviously still fully supported.


### Support for IE8 and Node.js 8 is officially dropped

IE8 is no longer testable on the Sauce Labs platform, and requires a lot of efforts for very few users (if any?), so we are dropping support for it.

Besides, Node.js 8 is now [EOL](https://github.com/nodejs/Release). Please upgrade as soon as possible!  

## Configuration

### Saner default values

- the default value of `maxHttpBufferSize` was decreased from `100MB` to `1MB`.
- the WebSocket [permessage-deflate extension](https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression-19) is now disabled by default
- you must now explicitly list the domains that are allowed (for CORS, see [below](#cors-handling))

### CORS handling

The `origins` option (used to provide a list of authorized domains) and the `handlePreflightRequest` option (used to edit the `Access-Control-Allow-xxx` headers) are replaced by the `cors` option, which will be forwarded to the [cors](https://www.npmjs.com/package/cors) package.

The complete list of options can be found [here](https://github.com/expressjs/cors#configuration-options).

Before:

```js
const io = require("socket.io")(httpServer, {
  origins: ["https://example.com"],

  // optional, useful for custom headers
  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "https://example.com",
      "Access-Control-Allow-Methods": "GET,POST",
      "Access-Control-Allow-Headers": "my-custom-header",
      "Access-Control-Allow-Credentials": true
    });
    res.end();
  }
});
```

After:

```js
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "https://example.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
```

## API change

Below are listed the non backward-compatible changes. 

### io.set() is removed

This method was deprecated in the 1.0 release and kept for backward-compatibility. It is now removed.

It was replaced by middlewares.

Before:

```js
io.set("authorization", (handshakeData, callback) => {
  // make sure the handshake data looks good
  callback(null, true); // error first, "authorized" boolean second 
});
```

After:

```js
io.use((socket, next) => {
  var handshakeData = socket.request;
  // make sure the handshake data looks good as before
  // if error do this:
    // next(new Error("not authorized"));
  // else just call next
  next();
});
```

### No more implicit connection to the default namespace

This change impacts the users of the multiplexing feature (what we call Namespace in Socket.IO).

In previous versions, a client would always connect to the default namespace (`/`), even if it requested access to another namespace. This meant that the middlewares registered for the default namespace were triggered, which may be quite surprising.

```js
// client-side
const socket = io("/admin");

// server-side
io.use((socket, next) => {
  // not triggered anymore
});

io.on("connect", socket => {
  // not triggered anymore
})

io.of("/admin").use((socket, next) => {
  // triggered
});
```

Besides, we will now refer to the "main" namespace instead of the "default" namespace.


### Namespace.connected is renamed to Namespace.sockets and is now a Map

The `connected` object (used to store all the Socket connected to the given Namespace) could be used to retrieve a Socket object from its id. It is now an ES6 [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

Before:

```js
const socket = io.sockets.connected[socketId]; // main namespace

const socket = io.of("/admin").connected[socketId];
```

After:

```js
const socket = io.sockets.sockets.get(socketId); // main namespace

const socket = io.of("/admin").sockets.get(socketId);
```

### Socket.rooms is now a Set

The `rooms` property contains the list of rooms the Socket is currently in. It was an object, it is now an ES6 [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

Before:

```js
io.on("connect", (socket) => {

  console.log(Object.keys(socket.rooms)); // [ <socket.id> ]

  socket.join("room1");

  console.log(Object.keys(socket.rooms)); // [ <socket.id>, "room1" ]

});
```

After:

```js
io.on("connect", (socket) => {

  console.log(socket.rooms); // Set { <socket.id> }

  socket.join("room1");

  console.log(socket.rooms); // Set { <socket.id>, "room1" }

});
```

### Socket.binary() is removed

The `binary`  method could be used to indicate that a given event did not contain any binary data (in order to skip the lookup done by the library and improve performance in certain conditions).

It was replaced by the ability to provide your own parser, which was added in Socket.IO 2.0.

Before:

```js
socket.binary(false).emit("hello", "no binary");
```

After:

```js
const io = require("socket.io")(httpServer, {
  parser: myCustomParser
});
```

Please see [socket.io-msgpack-parser](https://github.com/darrachequesne/socket.io-msgpack-parser) for example.


### Socket.join() and Socket.leave() are now synchronous

The asynchronicity was needed for the first versions of the Redis adapter, but this is not the case anymore.

For reference, an Adapter is an object that stores the relationships between Sockets and [Rooms](/docs/rooms). There are two official adapters: the in-memory adapter (built-in) and the [Redis adapter](https://github.com/socketio/socket.io-redis) based on Redis [pub-sub mechanism](https://redis.io/topics/pubsub).

Before:
    
```js
socket.join("room1", () => {
 io.to("room1").emit("hello");
});

socket.leave("room2", () => {
  io.to("room2").emit("bye");
});
```

After:

```js
socket.join("room1");
io.to("room1").emit("hello");

socket.leave("room2");
io.to("room2").emit("bye");
```

Note: custom adapters may return a Promise, so the previous example becomes:

```js
await socket.join("room1");
io.to("room1").emit("hello");
```


### Socket.use() is removed

`socket.use()` could be used as a catch-all listener. But its API was not intuitive. It is replaced by [socket.onAny()](#Catch-all-listeners).

Before:

```js
socket.use((packet, next) => {
  console.log(packet.data);
  next();
});
```

After:

```js
socket.onAny((event, ...args) => {
  console.log(event);
});
```


### A middleware error will now emit an Error object

Instead of a plain string.

```js
// server-side
io.use((socket, next) => {
  const err = new Error("not authorized");
  err.data = { content: "Please retry later" }; // additional details
  next(err);
});

// client-side
socket.on("connect_error", err => {
  console.log(err instanceof Error); // true
  console.log(err.message); // not authorized
  console.log(err.data.content); // Please retry later
});
```


## New features

Some of those new features may be back-ported to the `2.4.x` branch, depending on the feedback of the users.


### Catch-all listeners

This feature is inspired from the [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) library (which is not used directly in order not to increase the browser bundle size).

It is available for both the server and the client sides:

```js
// server
io.on("connect", (socket) => {
  socket.onAny((event, ...args) => {});
  socket.prependAny((event, ...args) => {});
  socket.offAny(); // remove all listeners
  socket.offAny(listener);
  const listeners = socket.listenersAny();
});

// client
const socket = io();
socket.onAny((event, ...args) => {});
socket.prependAny((event, ...args) => {});
socket.offAny(); // remove all listeners
socket.offAny(listener);
const listeners = socket.listenersAny();
```


### Volatile events (client)

A volatile event is an event that is allowed to be dropped if the low-level transport is not ready yet (for example when an HTTP POST request is already pending).

This feature was already available on the server-side. It might be useful on the client-side as well, for example when the socket is not connected (by default, packets are buffered until reconnection).

```js
socket.volatile.emit("volatile event", "might or might not be sent");
```


### Official bundle with the msgpack parser

A bundle with the [socket.io-msgpack-parser](https://github.com/darrachequesne/socket.io-msgpack-parser) will now be provided (either on the CDN or served by the server at `/socket.io/socket.io.msgpack.min.js`).

Pros:

- events with binary content are sent as 1 WebSocket frame (instead of 2+ with the default parser)
- payloads with lots of numbers should be smaller

Cons:

- no IE9 support (https://caniuse.com/mdn-javascript_builtins_arraybuffer)
- a slightly bigger bundle size

```js
// server-side
const io = require("socket.io")(httpServer, {
  parser: require("socket.io-msgpack-parser")
});
```

No additional configuration is needed on the client-side.
