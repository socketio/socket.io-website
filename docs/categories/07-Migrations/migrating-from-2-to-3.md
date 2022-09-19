---
title: Migrating from 2.x to 3.0
sidebar_position: 1
slug: /migrating-from-2-x-to-3-0/
---

This release should fix most of the inconsistencies of the Socket.IO library and provide a more intuitive behavior for
the end users. It is the result of the feedback of the community over the years. A big thanks to everyone involved!

**TL;DR:** ~~due to several breaking changes, a v2 client will not be able to connect to a v3 server (and vice versa)~~

Update: As of [Socket.IO 3.1.0](/blog/socket-io-3-1-0/), the v3 server is now able to communicate with v2 clients. More information [below](#how-to-upgrade-an-existing-production-deployment). A v3 client is still not be able to connect to a v2 server though.

For the low-level details, please see:

- [Engine.IO protocol v4](https://github.com/socketio/engine.io-protocol#difference-between-v3-and-v4)
- [Socket.IO protocol v5](https://github.com/socketio/socket.io-protocol#difference-between-v5-and-v4)

Here is the complete list of changes:

- [Configuration](#configuration)
  - [Saner default values](#saner-default-values)
  - [CORS handling](#cors-handling)
  - [No more cookie by default](#no-more-cookie-by-default)
- [API change](#aPI-change)
  - [io.set() is removed](#ioset-is-removed)
  - [No more implicit connection to the default namespace](#no-more-implicit-connection-to-the-default-namespace)
  - [Namespace.connected is renamed to Namespace.sockets and is now a Map](#namespaceconnected-is-renamed-to-namespacesockets-and-is-now-a-map)
  - [Socket.rooms is now a Set](#socketrooms-is-now-a-set)
  - [Socket.binary() is removed](#socketbinary-is-removed)
  - [Socket.join() and Socket.leave() are now synchronous](#socketjoin-and-socketleave-are-now-synchronous)
  - [Socket.use() is removed](#socketuse-is-removed)
  - [A middleware error will now emit an Error object](#a-middleware-error-will-now-emit-an-error-object)
  - [Add a clear distinction between the Manager query option and the Socket query option](#add-a-clear-distinction-between-the-manager-query-option-and-the-socket-query-option)
  - [The Socket instance will no longer forward the events emitted by its Manager](#the-socket-instance-will-no-longer-forward-the-events-emitted-by-its-manager)
  - [Namespace.clients() is renamed to Namespace.allSockets() and now returns a Promise](#namespaceclients-is-renamed-to-namespaceallsockets-and-now-returns-a-promise)
  - [Client bundles](#client-bundles)
  - [No more "pong" event for retrieving latency](#no-more-pong-event-for-retrieving-latency)
  - [ES modules syntax](#eS-modules-syntax)
  - [`emit()` chains are not possible anymore](#emit-chains-are-not-possible-anymore)
  - [Room names are not coerced to string anymore](#room-names-are-not-coerced-to-string-anymore)
- [New features](#new-features)
  - [Catch-all listeners](#catch-all-listeners)
  - [Volatile events (client)](#volatile-events-client)
  - [Official bundle with the msgpack parser](#official-bundle-with-the-msgpack-parser)
- [Miscellaneous](#miscellaneous)
  - [The Socket.IO codebase has been rewritten to TypeScript](#the-socketio-codebase-has-been-rewritten-to-typescript)
  - [Support for IE8 and Node.js 8 is officially dropped](#support-for-ie8-and-nodejs-8-is-officially-dropped)

- [How to upgrade an existing production deployment](#how-to-upgrade-an-existing-production-deployment)
- [Known migration issues](#known-migration-issues)

### Configuration

#### Saner default values

- the default value of `maxHttpBufferSize` was decreased from `100MB` to `1MB`.
- the WebSocket [permessage-deflate extension](https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression-19) is now disabled by default
- you must now explicitly list the domains that are allowed (for CORS, see [below](#cORS-handling))
- the `withCredentials` option now defaults to `false` on the client side

#### CORS handling

In v2, the Socket.IO server automatically added the necessary headers to allow [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS).

This behavior, while convenient, was not great in terms of security, because it meant that all domains were allowed to reach your Socket.IO server, unless otherwise specified with the `origins` option.

That's why, as of Socket.IO v3:

- CORS is now disabled by default
- the `origins` option (used to provide a list of authorized domains) and the `handlePreflightRequest` option (used to edit the `Access-Control-Allow-xxx` headers) are replaced by the `cors` option, which will be forwarded to the [cors](https://www.npmjs.com/package/cors) package.

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


#### No more cookie by default

In previous versions, an `io` cookie was sent by default. This cookie can be used to enable sticky-session, which is still required when you have several servers and HTTP long-polling enabled (more information [here](../02-Server/using-multiple-nodes.md)).

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


### API change

Below are listed the non backward-compatible changes. 

#### io.set() is removed

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

#### No more implicit connection to the default namespace

This change impacts the users of the multiplexing feature (what we call Namespace in Socket.IO).

In previous versions, a client would always connect to the default namespace (`/`), even if it requested access to another namespace. This meant that the middlewares registered for the default namespace were triggered, which may be quite surprising.

```js
// client-side
const socket = io("/admin");

// server-side
io.use((socket, next) => {
  // not triggered anymore
});

io.on("connection", socket => {
  // not triggered anymore
})

io.of("/admin").use((socket, next) => {
  // triggered
});
```

Besides, we will now refer to the "main" namespace instead of the "default" namespace.


#### Namespace.connected is renamed to Namespace.sockets and is now a Map

The `connected` object (used to store all the Socket connected to the given Namespace) could be used to retrieve a Socket object from its id. It is now an ES6 [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

Before:

```js
// get a socket by ID in the main namespace
const socket = io.of("/").connected[socketId];

// get a socket by ID in the "admin" namespace
const socket = io.of("/admin").connected[socketId];

// loop through all sockets
const sockets = io.of("/").connected;
for (const id in sockets) {
  if (sockets.hasOwnProperty(id)) {
    const socket = sockets[id];
    // ...
  }
}

// get the number of connected sockets
const count = Object.keys(io.of("/").connected).length;
```

After:

```js
// get a socket by ID in the main namespace
const socket = io.of("/").sockets.get(socketId);

// get a socket by ID in the "admin" namespace
const socket = io.of("/admin").sockets.get(socketId);

// loop through all sockets
for (const [_, socket] of io.of("/").sockets) {
  // ...
}

// get the number of connected sockets
const count = io.of("/").sockets.size;
```

#### Socket.rooms is now a Set

The `rooms` property contains the list of rooms the Socket is currently in. It was an object, it is now an ES6 [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

Before:

```js
io.on("connection", (socket) => {

  console.log(Object.keys(socket.rooms)); // [ <socket.id> ]

  socket.join("room1");

  console.log(Object.keys(socket.rooms)); // [ <socket.id>, "room1" ]

});
```

After:

```js
io.on("connection", (socket) => {

  console.log(socket.rooms); // Set { <socket.id> }

  socket.join("room1");

  console.log(socket.rooms); // Set { <socket.id>, "room1" }

});
```

#### Socket.binary() is removed

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

Please see [socket.io-msgpack-parser](https://github.com/socketio/socket.io-msgpack-parser) for example.


#### Socket.join() and Socket.leave() are now synchronous

The asynchronicity was needed for the first versions of the Redis adapter, but this is not the case anymore.

For reference, an Adapter is an object that stores the relationships between Sockets and [Rooms](../04-Events/rooms.md). There are two official adapters: the in-memory adapter (built-in) and the [Redis adapter](https://github.com/socketio/socket.io-redis) based on Redis [pub-sub mechanism](https://redis.io/topics/pubsub).

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


#### ~~Socket.use() is removed~~

`socket.use()` could be used as a catch-all listener. But its API was not really intuitive. It is replaced by [socket.onAny()](#catch-all-listeners).

**UPDATE**: the `Socket.use()` method was restored in [`socket.io@3.0.5`](https://github.com/socketio/socket.io/releases/3.0.5).

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


#### A middleware error will now emit an Error object

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


#### Add a clear distinction between the Manager query option and the Socket query option

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
io.on("connection", (socket) => {
  console.log(socket.handshake.query.token); // abc (ok!)
});

io.of("/my-namespace").on("connection", (socket) => {
  console.log(socket.handshake.query.token); // abc (what?)
});
```

That's why the `query` option of the Socket instance is renamed to `auth` in Socket.IO v3:

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
io.on("connection", (socket) => {
  console.log(socket.handshake.auth.token); // abc
});
```

Note: the `query` option of the Manager can still be used in order to add a specific query parameter to the HTTP requests.


#### The Socket instance will no longer forward the events emitted by its Manager

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


#### Namespace.clients() is renamed to Namespace.allSockets() and now returns a Promise

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

#### Client bundles

There are now 3 distinct bundles:

| Name              | Size             | Description |
|:------------------|:-----------------|:------------|
| socket.io.js               | 34.7 kB gzip     | Unminified version, with [debug](https://www.npmjs.com/package/debug)    |
| socket.io.min.js           | 14.7 kB min+gzip | Production version, without [debug](https://www.npmjs.com/package/debug) |
| socket.io.msgpack.min.js   | 15.3 kB min+gzip | Production version, without [debug](https://www.npmjs.com/package/debug) and with the [msgpack parser](https://github.com/socketio/socket.io-msgpack-parser)    |

By default, all of them are served by the server, at `/socket.io/<name>`.

Before:

```html
<!-- note: this bundle was actually minified but included the debug package -->
<script src="/socket.io/socket.io.js"></script>
```

After:

```html
<!-- during development -->
<script src="/socket.io/socket.io.js"></script>
<!-- for production -->
<script src="/socket.io/socket.io.min.js"></script>
```

#### No more "pong" event for retrieving latency

In Socket.IO v2, you could listen to the `pong` event on the client-side, which included the duration of the last health check round-trip.

Due to the reversal of the heartbeat mechanism (more information [here](/blog/engine-io-4-release/#heartbeat-mechanism-reversal)), this event has been removed.

Before:

```js
socket.on("pong", (latency) => {
  console.log(latency);
});
```

After:

```js
// server-side
io.on("connection", (socket) => {
  socket.on("ping", (cb) => {
    if (typeof cb === "function")
      cb();
  });
});

// client-side
setInterval(() => {
  const start = Date.now();

  // volatile, so the packet will be discarded if the socket is not connected
  socket.volatile.emit("ping", () => {
    const latency = Date.now() - start;
    // ...
  });
}, 5000);
```

#### ES modules syntax

The ECMAScript modules syntax is now similar to the Typescript one (see [below](#the-socketio-codebase-has-been-rewritten-to-typescript)).

Before (using default import):

```js
// server-side
import Server from "socket.io";

const io = new Server(8080);

// client-side
import io from 'socket.io-client';

const socket = io();
```

After (with named import):

```js
// server-side
import { Server } from "socket.io";

const io = new Server(8080);

// client-side
import { io } from 'socket.io-client';

const socket = io();
```

#### `emit()` chains are not possible anymore

The `emit()` method now matches the [`EventEmitter.emit()`](https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_emit_eventname_args) method signature, and returns `true` instead of the current object.

Before:

```js
socket.emit("event1").emit("event2");
```

After:

```js
socket.emit("event1");
socket.emit("event2");
```

#### Room names are not coerced to string anymore

We are now using Maps and Sets internally instead of plain objects, so the room names are not implicitly coerced to string anymore.

Before:

```js
// mixed types were possible
socket.join(42);
io.to("42").emit("hello");
// also worked
socket.join("42");
io.to(42).emit("hello");
```

After:

```js
// one way
socket.join("42");
io.to("42").emit("hello");
// or another
socket.join(42);
io.to(42).emit("hello");
```

### New features

Some of those new features may be backported to the `2.4.x` branch, depending on the feedback of the users.


#### Catch-all listeners

This feature is inspired from the [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) library (which is not used directly in order not to increase the browser bundle size).

It is available for both the server and the client sides:

```js
// server
io.on("connection", (socket) => {
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


#### Volatile events (client)

A volatile event is an event that is allowed to be dropped if the low-level transport is not ready yet (for example when an HTTP POST request is already pending).

This feature was already available on the server-side. It might be useful on the client-side as well, for example when the socket is not connected (by default, packets are buffered until reconnection).

```js
socket.volatile.emit("volatile event", "might or might not be sent");
```


#### Official bundle with the msgpack parser

A bundle with the [socket.io-msgpack-parser](https://github.com/socketio/socket.io-msgpack-parser) will now be provided (either on the CDN or served by the server at `/socket.io/socket.io.msgpack.min.js`).

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


### Miscellaneous

#### The Socket.IO codebase has been rewritten to TypeScript

Which means `npm i -D @types/socket.io` should not be needed anymore.

Server:

```ts
import { Server, Socket } from "socket.io";

const io = new Server(8080);

io.on("connection", (socket: Socket) => {
    console.log(`connect ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`disconnect ${socket.id}`);
    });
});
```

Client:

```ts
import { io } from "socket.io-client";

const socket = io("/");

socket.on("connect", () => {
    console.log(`connect ${socket.id}`);
});
```

Plain javascript is obviously still fully supported.


#### Support for IE8 and Node.js 8 is officially dropped

IE8 is no longer testable on the Sauce Labs platform, and requires a lot of efforts for very few users (if any?), so we are dropping support for it.

Besides, Node.js 8 is now [EOL](https://github.com/nodejs/Release). Please upgrade as soon as possible!


### How to upgrade an existing production deployment

- first, update the servers with `allowEIO3` set to `true` (added in `socket.io@3.1.0`)

```js
const io = require("socket.io")({
  allowEIO3: true // false by default
});
```

Note: If you are using the Redis adapter to [broadcast packets between nodes](../04-Events/broadcasting-events.md#with-multiple-socketio-servers), you must use `socket.io-redis@5` with `socket.io@2` and `socket.io-redis@6` with `socket.io@3`. Please note that both versions are compatible, so you can update each server one by one (no big bang is needed).

- then, update the clients

This step may actually take some time, as some clients may still have a v2 client in cache.

You can check the version of the connection with:

```js
io.on("connection", (socket) => {
  const version = socket.conn.protocol; // either 3 or 4
});
```

This matches the value of the `EIO` query parameter in the HTTP requests.

- and finally, once every client was updated, set `allowEIO3` to `false` (which is the default value)

```js
const io = require("socket.io")({
  allowEIO3: false
});
```

With `allowEIO3` set to `false`, v2 clients will now receive an HTTP 400 error (`Unsupported protocol version`) when connecting.


### Known migration issues

- `stream_1.pipeline is not a function`

```
TypeError: stream_1.pipeline is not a function
    at Function.sendFile (.../node_modules/socket.io/dist/index.js:249:26)
    at Server.serve (.../node_modules/socket.io/dist/index.js:225:16)
    at Server.srv.on (.../node_modules/socket.io/dist/index.js:186:22)
    at emitTwo (events.js:126:13)
    at Server.emit (events.js:214:7)
    at parserOnIncoming (_http_server.js:602:12)
    at HTTPParser.parserOnHeadersComplete (_http_common.js:116:23)
```

This error is probably due to your version of Node.js. The [pipeline](https://nodejs.org/api/stream.html#stream_stream_pipeline_source_transforms_destination_callback) method was introduced in Node.js 10.0.0.


- `error TS2416: Property 'emit' in type 'Namespace' is not assignable to the same property in base type 'EventEmitter'.`

```
node_modules/socket.io/dist/namespace.d.ts(89,5): error TS2416: Property 'emit' in type 'Namespace' is not assignable to the same property in base type 'EventEmitter'.
  Type '(ev: string, ...args: any[]) => Namespace' is not assignable to type '(event: string | symbol, ...args: any[]) => boolean'.
    Type 'Namespace' is not assignable to type 'boolean'.
node_modules/socket.io/dist/socket.d.ts(84,5): error TS2416: Property 'emit' in type 'Socket' is not assignable to the same property in base type 'EventEmitter'.
  Type '(ev: string, ...args: any[]) => this' is not assignable to type '(event: string | symbol, ...args: any[]) => boolean'.
    Type 'this' is not assignable to type 'boolean'.
      Type 'Socket' is not assignable to type 'boolean'.
```

The signature of the `emit()` method was fixed in version `3.0.1` ([commit](https://github.com/socketio/socket.io/commit/50671d984a81535a6a15c704546ca7465e2ea295)).


- the client is disconnected when sending a big payload (> 1MB)

This is probably due to the fact that the default value of `maxHttpBufferSize` is now `1MB`. When receiving a packet that is larger than this, the server disconnects the client, in order to prevent malicious clients from overloading the server.

You can adjust the value when creating the server:

```js
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: 1e8
});
```

- `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at xxx/socket.io/?EIO=4&transport=polling&t=NMnp2WI. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing).`

Since Socket.IO v3, you need to explicitly enable [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS). The documentation can be found [here](../02-Server/handling-cors.md).

- `Uncaught TypeError: packet.data is undefined`

It seems that you are using a v3 client to connect to a v2 server, which is not possible. Please see the [following section](#how-to-upgrade-an-existing-production-deployment).

- `Object literal may only specify known properties, and 'extraHeaders' does not exist in type 'ConnectOpts'`

Since the codebase has been rewritten to TypeScript (more information [here](#the-socketio-codebase-has-been-rewritten-to-typescript)), `@types/socket.io-client` is no longer needed and will actually conflict with the typings coming from the `socket.io-client` package.

- missing cookie in a cross-origin context

You now need to explicitly enable cookies if the front is not served from the same domain as the backend:

*Server*

```js
import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: ["https://front.domain.com"],
    credentials: true
  }
});
```

*Client*

```js
import { io } from "socket.io-client";

const socket = io("https://backend.domain.com", {
  withCredentials: true
});
````

Reference:

- [Handling CORS](../02-Server/handling-cors.md)
- [`cors`](../../server-api.md#cors) option
- [`withCredentials`](../../client-api.md#withcredentials) option
