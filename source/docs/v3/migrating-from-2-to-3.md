title: Migrating from 2.x to 3.0
permalink: /docs/v3/migrating-from-2-x-to-3-0/
alias: /docs/migrating-from-2-x-to-3-0/
release: v3
type: docs
order: 501
---

This release should fix most of the inconsistencies of the Socket.IO library and provide a more intuitive behavior for
the end users. It is the result of the feedback of the community over the years. A big thanks to everyone involved!

For the low-level details, please see:

- [Engine.IO protocol v4](https://github.com/socketio/engine.io-protocol#difference-between-v3-and-v4)
- [Socket.IO protocol v5](https://github.com/socketio/socket.io-protocol#difference-between-v5-and-v4)

Here is the complete list of changes:

- [Configuration](#Configuration)
  - [Saner default values](#Saner-default-values)
  - [CORS handling](#CORS-handling)
  - [No more cookie by default](#No-more-cookie-by-default)
- [API change](#API-change)
  - [io.set() is removed](#io-set-is-removed)
  - [No more implicit connection to the default namespace](#No-more-implicit-connection-to-the-default-namespace)
  - [Namespace.connected is renamed to Namespace.sockets and is now a Map](#Namespace-connected-is-renamed-to-Namespace-sockets-and-is-now-a-Map)
  - [Socket.rooms is now a Set](#Socket-rooms-is-now-a-Set)
  - [Socket.binary() is removed](#Socket-binary-is-removed)
  - [Socket.join() and Socket.leave() are now synchronous](#Socket-join-and-Socket-leave-are-now-synchronous)
  - [Socket.use() is removed](#Socket-use-is-removed)
  - [A middleware error will now emit an Error object](#A-middleware-error-will-now-emit-an-Error-object)
  - [Add a clear distinction between the Manager query option and the Socket query option](#Add-a-clear-distinction-between-the-Manager-query-option-and-the-Socket-query-option)
  - [The Socket instance will no longer forward the events emitted by its Manager](#The-Socket-instance-will-no-longer-forward-the-events-emitted-by-its-Manager)
  - [Namespace.clients() is renamed to Namespace.allSockets() and now returns a Promise](#Namespace-clients-is-renamed-to-Namespace-allSockets-and-now-returns-a-Promise)
- [New features](#New-features)
  - [Catch-all listeners](#Catch-all-listeners)
  - [Volatile events (client)](#Volatile-events-client)
  - [Official bundle with the msgpack parser](#Official-bundle-with-the-msgpack-parser)
- [Miscellaneous](#miscellaneous)
  - [The Socket.IO codebase has been rewritten to TypeScript](#The-Socket-IO-codebase-has-been-rewritten-to-TypeScript)
  - [Support for IE8 and Node.js 8 is officially dropped](#Support-for-IE8-and-Node-js-8-is-officially-dropped)

- [How to upgrade an existing production deployment](#How-to-upgrade-an-existing-production-deployment)


## Configuration

### Saner default values

- the default value of `maxHttpBufferSize` was decreased from `100MB` to `1MB`.
- the WebSocket [permessage-deflate extension](https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression-19) is now disabled by default
- you must now explicitly list the domains that are allowed (for CORS, see [below](#CORS-handling))

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


### No more cookie by default

In previous versions, an `io` cookie was sent by default. This cookie can be used to enable sticky-session, which is still required when you have several servers and HTTP long-polling enabled (more information [here](/docs/v3/using-multiple-nodes/)).

However, this cookie is not needed in some cases (i.e. single server deployment, sticky-session based on IP) so it must now be explicitly enabled.

Before:

```js
const io = require("socket.io")(httpServer, {
  cookieName: "io",
  cookieHttpOnly: false,
  cookiePath: "/custom"
});
```

After:

```js
const io = require("socket.io")(httpServer, {
  cookie: {
    name: "test",
    httpOnly: false,
    path: "/custom"
  }
});
```

All other options (domain, maxAge, sameSite, ...) are now supported. Please see [here](https://github.com/jshttp/cookie/) for the complete list of options.


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

For reference, an Adapter is an object that stores the relationships between Sockets and [Rooms](/docs/v3/rooms). There are two official adapters: the in-memory adapter (built-in) and the [Redis adapter](https://github.com/socketio/socket.io-redis) based on Redis [pub-sub mechanism](https://redis.io/topics/pubsub).

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

`socket.use()` could be used as a catch-all listener. But its API was not really intuitive. It is replaced by [socket.onAny()](#Catch-all-listeners).

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

The `error` event is renamed to `connect_error` and the object emitted is now an actual Error:

Before:

```js
// server-side
io.use((socket, next) => {
  next(new Error("not authorized"));
});

// client-side
socket.on("error", err => {
  console.log(err); // not authorized
});

// or with an object
// server-side
io.use((socket, next) => {
  const err = new Error("not authorized");
  err.data = { content: "Please retry later" }; // additional details
  next(err);
});

// client-side
socket.on("error", err => {
  console.log(err); // { content: "Please retry later" }
});
```

After:

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
  console.log(err.data); // { content: "Please retry later" }
});
```


### Add a clear distinction between the Manager query option and the Socket query option

In previous versions, the `query` option was used in two distinct places:

- in the query parameters of the HTTP requests (`GET /socket.io/?EIO=3&abc=def`)
- in the `CONNECT` packet

Let's take the following example:

```js
const socket = io({
  query: {
    token: "abc"
  }
});
```

Under the hood, here's what happened in the `io()` method:

```js
const { Manager } = require("socket.io-client");

// a new Manager is created (which will manage the low-level connection)
const manager = new Manager({
  query: { // sent in the query parameters
    token: "abc"
  }
});

// and then a Socket instance is created for the namespace (here, the main namespace, "/")
const socket = manager.socket("/", {
  query: { // sent in the CONNECT packet
    token: "abc"
  }
});
```

This behavior could lead to weird behaviors, for example when the Manager was reused for another namespace (multiplexing):

```js
// client-side
const socket1 = io({
  query: {
    token: "abc"
  }
});

const socket2 = io("/my-namespace", {
  query: {
    token: "def"
  }
});

// server-side
io.on("connect", (socket) => {
  console.log(socket.handshake.query.token); // abc (ok!)
});

io.of("/my-namespace").on("connect", (socket) => {
  console.log(socket.handshake.query.token); // abc (what?)
});
```

That's why the `query` option of the Socket instance is renamed to ̀`auth` in Socket.IO v3:

```js
// plain object
const socket = io({
  auth: {
    token: "abc"
  }
});

// or with a function
const socket = io({
  auth: (cb) => {
    cb({
      token: "abc"
    });
  }
});

// server-side
io.on("connect", (socket) => {
  console.log(socket.handshake.auth.token); // abc
});
```

Note: the `query` option of the Manager can still be used in order to add a specific query parameter to the HTTP requests.


### The Socket instance will no longer forward the events emitted by its Manager

In previous versions, the Socket instance emitted the events related to the state of the underlying connection. This will not be the case anymore.

You can still have access to those events on the Manager instance (the `io` property of the socket) :

Before:

```js
socket.on("reconnect_attempt", () => {});
```

After:

```js
socket.io.on("reconnect_attempt", () => {});
```

Here is the updated list of events emitted by the Manager:

| Name | Description | Previously (if different) |
| ---- | ----------- | ------------------------- |
| open | successful (re)connection | - |
| error | (re)connection failure or error after a successful connection | connect_error |
| close | disconnection | - |
| ping | ping packet | - |
| packet | data packet | - |
| reconnect_attempt | reconnection attempt | reconnect_attempt & reconnecting | - |
| reconnect | successful reconnection | - |
| reconnect_error | reconnection failure | - |
| reconnect_failed | reconnection failure after all attempts | - |

Here is the updated list of events emitted by the Socket:

| Name | Description | Previously (if different) |
| ---- | ----------- | ------------------------- |
| connect | successful connection to a Namespace | - |
| connect_error | connection failure | error |
| disconnect | disconnection | - |


And finally, here's the updated list of reserved events that you cannot use in your application:

- `connect` (used on the client-side)
- `connect_error` (used on the client-side)
- `disconnect` (used on both sides)
- `disconnecting` (used on the server-side)
- `newListener` and `removeListener` (EventEmitter [reserved events](https://nodejs.org/api/events.html#events_event_newlistener))

```js
socket.emit("connect_error"); // will now throw an Error
```


### Namespace.clients() is renamed to Namespace.allSockets() and now returns a Promise

This function returns the list of socket IDs that are connected to this namespace.

Before:

```js
// all sockets in default namespace
io.clients((error, clients) => {
  console.log(clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
});

// all sockets in the "chat" namespace
io.of("/chat").clients((error, clients) => {
  console.log(clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
});

// all sockets in the "chat" namespace and in the "general" room
io.of("/chat").in("general").clients((error, clients) => {
  console.log(clients); // => [Anw2LatarvGVVXEIAAAD]
});
```

After:

```js
// all sockets in default namespace
const ids = await io.allSockets();

// all sockets in the "chat" namespace
const ids = await io.of("/chat").allSockets();

// all sockets in the "chat" namespace and in the "general" room
const ids = await io.of("/chat").in("general").allSockets();
```

Note: this function was (and still is) supported by the Redis adapter, which means that it will return the list of socket IDs across all the Socket.IO servers.


## New features

Some of those new features may be backported to the `2.4.x` branch, depending on the feedback of the users.


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


## How to upgrade an existing production deployment

As detailed above, this release contains several non backward compatible changes, and as such a v2 client will not be able to connect to a v3 server (and vice versa).

In order to upgrade a live production environment, you will need to have both a group of v2 servers and v3 servers in parallel, and route the traffic based on either:

- the `EIO` query parameter (`EIO=3` for Socket.IO v2, `EIO=4` for Socket.IO v3)
- the path (by using a different `path` for the v3 servers)
- or the domain if you use a different domain for the v3 servers

And then you upgrade the version used by the clients.

You could also take advantage of the [package aliases](https://github.com/npm/rfcs/blob/latest/implemented/0001-package-aliases.md) feature of your favorite package manager in order to have both versions running in parallel:

```js
// npm i socket.io@2 socket.io-next@npm:socket.io@3
// or yarn add socket.io@2 socket.io-next@npm:socket.io@3
const httpServer = require("http").createServer();

const io = require("socket.io")(httpServer);
const ioNext = require("socket.io-next")(httpServer, {
  path: "/socket.io-next/"
});
```
