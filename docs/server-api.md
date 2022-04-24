---
title: Server API
sidebar_label: API
sidebar_position: 1
slug: /server-api/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## Server

<ThemedImage
  alt="Server in the class diagram for the server"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-server.png'),
    dark: useBaseUrl('/images/server-class-diagram-server-dark.png'),
  }}
/>

Related documentation pages:

- [installation](categories/02-Server/server-installation.md)
- [initialization](categories/02-Server/server-initialization.md)
- [details of the server instance](categories/02-Server/server-instance.md)

### new Server(httpServer[, options])

- `httpServer` [`<http.Server>`](https://nodejs.org/api/http.html#class-httpserver) | [`<https.Server>`](https://nodejs.org/api/https.html#class-httpsserver)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

The complete list of available options can be found [here](server-options.md).

### new Server(port[, options])

- `port` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

```js
import { Server } from "socket.io";

const io = new Server(3000, {
  // options
});

io.on("connection", (socket) => {
  // ...
});
```

The complete list of available options can be found [here](server-options.md).

### new Server(options)

  - `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

```js
import { Server } from "socket.io";

const io = new Server({
  // options
});

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

The complete list of available options can be found [here](server-options.md).

### server.sockets

  * [`<Namespace>`](#namespace)

An alias for the main namespace (`/`).

```js
io.sockets.emit("hi", "everyone");
// is equivalent to
io.of("/").emit("hi", "everyone");
```

### server.serveClient([value])

  - `value` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)
  - **Returns** [`<Server>`](#server) | [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

If `value` is `true` the attached server will serve the client files. Defaults to `true`. This method has no effect after `listen` is called. If no arguments are supplied this method returns the current value.

```js
import { Server } from "socket.io";

const io = new Server();

io.serveClient(false);

io.listen(3000);
```

### server.path([value])

  - `value` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - **Returns** [`<Server>`](#server) | [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)

Sets the path `value` under which `engine.io` and the static files will be served. Defaults to `/socket.io/`. If no arguments are supplied this method returns the current value.

```js
import { Server } from "socket.io";

const io = new Server();

io.path("/myownpath/");
```

:::warning

The `path` value must match the one on the client side:

```js
import { io } from "socket.io-client";

const socket = io({
  path: "/myownpath/"
});
```

:::

### server.adapter([value])

  - `value` [`<Adapter>`](categories/05-Adapters/adapter.md)
  - **Returns** [`<Server>`](#server) | [`<Adapter>`](categories/05-Adapters/adapter.md)

Sets the adapter `value`. Defaults to an instance of the `Adapter` that ships with socket.io which is memory based. See [socket.io-adapter](https://github.com/socketio/socket.io-adapter). If no arguments are supplied this method returns the current value.

```js
import { Server } from "socket.io"; 
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const io = new Server();

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// redis@3
io.listen(3000);

// redis@4
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.listen(3000);
});
```

### server.attach(httpServer[, options])

- `httpServer` [`<http.Server>`](https://nodejs.org/api/http.html#class-httpserver) | [`<https.Server>`](https://nodejs.org/api/https.html#class-httpsserver)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

Attaches the `Server` to an `httpServer` with the supplied `options`.

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server();

io.attach(httpServer);

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

### server.attach(port[, options])

- `port` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

Attaches the `Server` on the given `port` with the supplied `options`.

```js
import { Server } from "socket.io";

const io = new Server();

io.attach(3000);

io.on("connection", (socket) => {
  // ...
});
```

### server.attachApp(app[, options])

- `app` [`<uws.App>`](https://unetworking.github.io/uWebSockets.js/generated/interfaces/TemplatedApp.html)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

Attaches the Socket.IO server to an [µWebSockets.js](https://github.com/uNetworking/uWebSockets.js) app:

```js
import { App } from "uWebSockets.js";
import { Server } from "socket.io";

const app = new App();
const io = new Server();

io.attachApp(app);

io.on("connection", (socket) => {
  // ...
});

app.listen(3000, (token) => {
  if (!token) {
    console.warn("port already in use");
  }
});
```

### server.listen(httpServer[, options])

Synonym of [server.attach(httpServer[, options])](#serverattachhttpserver-options).

### server.listen(port[, options])

Synonym of [server.attach(port[, options])](#serverattachport-options).

### server.on(eventName, listener)

*Inherited from the [EventEmitter class](https://nodejs.org/api/events.html#class-eventemitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **Returns** [`<Server>`](#server)

Adds the `listener` function to the end of the listeners array for the event named `eventName`.

Available events:

- [`connection`](#event-connection)
- [`new_namespace`](#event-new_namespace)
- any custom event from the [`serverSideEmit`](#namespaceserversideemiteventname-args) method

```js
io.on("connection", (socket) => {
  // ...
});
```

### server.bind(engine)

- `engine` `<engine.Server>`
- **Returns** [`<Server>`](#server)

Advanced use only. Binds the server to a specific engine.io `Server` (or compatible API) instance.

```js
import { Server } from "socket.io";
import { Server as Engine } from "engine.io";

const engine = new Engine();
const io = new Server();

io.bind(engine);

engine.listen(3000);
```

### server.onconnection(socket)

- `socket` `<engine.Socket>`
- **Returns** [`<Server>`](#server)

Advanced use only. Creates a new `socket.io` client from the incoming engine.io (or compatible API) `Socket`.

```js
import { Server } from "socket.io";
import { Server as Engine } from "engine.io";

const engine = new Engine();
const io = new Server();

engine.on("connection", (socket) => {
  io.onconnection(socket);
});

engine.listen(3000);
```

### server.of(nsp)

  - `nsp` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) | [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Returns** [`<Namespace>`](#namespace)

Initializes and retrieves the given `Namespace` by its pathname identifier `nsp`. If the namespace was already initialized it returns it immediately.

```js
const adminNamespace = io.of("/admin");
```

A regex or a function can also be provided, in order to create namespace in a dynamic way:

```js
const dynamicNsp = io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
  const newNamespace = socket.nsp; // newNamespace.name === "/dynamic-101"

  // broadcast to all clients in the given sub-namespace
  newNamespace.emit("hello");
});

// client-side
const socket = io("/dynamic-101");

// broadcast to all clients in each sub-namespace
dynamicNsp.emit("hello");

// use a middleware for each sub-namespace
dynamicNsp.use((socket, next) => { /* ... */ });
```

With a function:

```js
io.of((name, query, next) => {
  // the checkToken method must return a boolean, indicating whether the client is able to connect or not.
  next(null, checkToken(query.token));
}).on("connection", (socket) => { /* ... */ });
```

### server.close([callback])

  - `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Closes the Socket.IO server and disconnect all clients. The `callback` argument is optional and will be called when all connections are closed.

:::info

This also closes the underlying HTTP server.

:::

```js
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3030;
const io = new Server(PORT);

io.close();

const httpServer = createServer();

httpServer.listen(PORT); // PORT is free to use

io.attach(httpServer);
```

:::note

Only closing the underlying HTTP server is not sufficient, as it will only prevent the server from accepting new connections but clients connected with WebSocket will not be disconnected right away.

Reference: https://nodejs.org/api/http.html#serverclosecallback

:::

### server.engine

A reference to the underlying Engine.IO server. See [here](#engine).

### server.socketsJoin(rooms)

*Added in v4.0.0*

Alias for [`io.of("/").socketsJoin(rooms)`](#namespacesocketsjoinrooms).

```js
// make all Socket instances join the "room1" room
io.socketsJoin("room1");

// make all Socket instances in the "room1" room join the "room2" and "room3" rooms
io.in("room1").socketsJoin(["room2", "room3"]);

// this also works with a single socket ID
io.in(theSocketId).socketsJoin("room1");
```

See [here](categories/02-Server/server-instance.md#utility-methods).

### server.socketsLeave(rooms)

*Added in v4.0.0*

Alias for [`io.of("/").socketsLeave(rooms)`](#namespacesocketsleaverooms).

```js
// make all Socket instances leave the "room1" room
io.socketsLeave("room1");

// make all Socket instances in the "room1" room leave the "room2" and "room3" rooms
io.in("room1").socketsLeave(["room2", "room3"]);

// this also works with a single socket ID
io.in(theSocketId).socketsLeave("room1");
```

See [here](categories/02-Server/server-instance.md#utility-methods).

### server.disconnectSockets([close])

*Added in v4.0.0*

Alias for [`io.of("/").disconnectSockets(close)`](#namespacedisconnectsocketsclose).

```js
// make all Socket instances disconnect
io.disconnectSockets();

// make all Socket instances in the "room1" room disconnect (and close the low-level connection)
io.in("room1").disconnectSockets(true);
```

See [here](categories/02-Server/server-instance.md#utility-methods).

### server.fetchSockets()

*Added in v4.0.0*

Alias for [`io.of("/").fetchSocket()`](#namespacefetchsockets).

```js
// return all Socket instances of the main namespace
const sockets = await io.fetchSockets();

// return all Socket instances in the "room1" room of the main namespace
const sockets = await io.in("room1").fetchSockets();
```

Sample usage:

```js
io.on("connection", (socket) => {
  const userId = computeUserId(socket);

  socket.join(userId);

  socket.on("disconnect", async () => {
    const sockets = await io.in(userId).fetchSockets();
    if (socket.length === 0) {
      // no more active connections for the given user
    }
  });
});
```

See [here](categories/02-Server/server-instance.md#utility-methods).

### server.serverSideEmit(eventName[, ...args][, ack])

*Added in v4.1.0*

Alias for: [`io.of("/").serverSideEmit(/* ... */);`](#namespaceserversideemiteventname-args)

### Event: `connection`

  - `socket` _(Socket)_ socket connection with client

Fired upon a connection from client.

```js
io.on("connection", (socket) => {
  // ...
});
```

### Event: `connect`

Synonym of [Event: "connection"](#event-connection).

### Event: `new_namespace`

  - `namespace` [`Namespace`](#namespace)

Fired when a new namespace is created:

```js
io.on("new_namespace", (namespace) => {
  // ...
});
```

This can be useful for example:

- to attach a shared middleware to each namespace

```js
io.on("new_namespace", (namespace) => {
  namespace.use(myMiddleware);
});
```

- to track the [dynamically created](categories/06-Advanced/namespaces.md#dynamic-namespaces) namespaces

```js
io.of(/\/nsp-\w+/);

io.on("new_namespace", (namespace) => {
  console.log(namespace.name);
});
```

## Namespace

<ThemedImage
  alt="Namespace in the class diagram for the server"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-namespace.png'),
    dark: useBaseUrl('/images/server-class-diagram-namespace-dark.png'),
  }}
/>

Represents a pool of sockets connected under a given scope identified by a pathname (eg: `/chat`).

More information can be found [here](categories/06-Advanced/namespaces.md).

### namespace.name

  * [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)

The namespace identifier property.

### namespace.sockets

  * [`Map<SocketId, Socket>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

A map of [Socket](#socket) instances that are connected to this namespace.

```js
// number of sockets in this namespace (on this node)
const socketCount = io.of("/admin").sockets.size;
```

### namespace.adapter

  * [`<Adapter>`](categories/05-Adapters/adapter.md)

The ["Adapter"](categories/08-Miscellaneous/glossary.md#adapter) used for the namespace.

**Note:** the adapter of the main namespace can be accessed with `io.of("/").adapter`.

More information about it [here](categories/05-Adapters/adapter.md).

```js
const adapter = io.of("/my-namespace").adapter;
```

### namespace.to(room)

<details className="changelog">
    <summary>History</summary>

| Version | Changes |
| ------- | ------- |
| v4.0.0 | Allow to pass an array of rooms.
| v1.0.0 | Initial implementation.

</details>

  - `room` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - **Returns** `BroadcastOperator` for chaining

Sets a modifier for a subsequent event emission that the event will only be _broadcast_ to clients that have joined the given `room`.

To emit to multiple rooms, you can call `to` several times.

```js
const io = require("socket.io")();
const adminNamespace = io.of("/admin");

adminNamespace.to("level1").emit("an event", { some: "data" });

// multiple rooms
io.to("room1").to("room2").emit(/* ... */);

// or with an array
io.to(["room1", "room2"]).emit(/* ... */);
```

### namespace.in(room)

*Added in v1.0.0*

Synonym of [namespace.to(room)](#namespacetoroom).

### namespace.except(rooms)

*Added in v4.0.0*

  - `rooms` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - **Returns** `BroadcastOperator`

Sets a modifier for a subsequent event emission that the event will only be _broadcast_ to clients that have not joined the given `rooms`.

```js
// to all clients except the ones in "room1"
io.except("room1").emit(/* ... */);

// to all clients in "room2" except the ones in "room3"
io.to("room2").except("room3").emit(/* ... */);
```

### namespace.emit(eventName[, ...args])

  - `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
  - `args` `any[]`
  - **Returns** `true`

Emits an event to all connected clients in the given namespace.

```js
io.emit("an event sent to all connected clients"); // main namespace

const chat = io.of("/chat");
chat.emit("an event sent to all connected clients in chat namespace");
```

:::info

Starting with version `4.5.0`, it is now possible to use acknowledgements when broadcasting:

```js
io.of("/chat").timeout(10000).emit("some-event", (err, responses) => {
  if (err) {
    // some clients did not acknowledge the event in the given delay
  } else {
    console.log(responses); // one response per client
  }
});
```

:::

### namespace.timeout(value)

*Added in v4.5.0*

  - `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
  - **Returns** `BroadcastOperator`

Sets a modifier for a subsequent event emission that the callback will be called with an error when the
given number of milliseconds have elapsed without an acknowledgement from the client:

```js
io.of("/chat").timeout(10000).emit("some-event", (err, responses) => {
  if (err) {
    // some clients did not acknowledge the event in the given delay
  } else {
    console.log(responses); // one response per client
  }
});
```

### namespace.allSockets()

  - **Returns** `Promise<Set<SocketId>>`

Gets a list of socket IDs connected to this namespace (across all nodes if applicable).

```js
// all sockets in the main namespace
const ids = await io.allSockets();

// all sockets in the main namespace and in the "user:1234" room
const ids = await io.in("user:1234").allSockets();

// all sockets in the "chat" namespace
const ids = await io.of("/chat").allSockets();

// all sockets in the "chat" namespace and in the "general" room
const ids = await io.of("/chat").in("general").allSockets();
```

### namespace.use(fn)

  - `fn` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Registers a middleware, which is a function that gets executed for every incoming `Socket`, and receives as parameters the socket and a function to optionally defer execution to the next registered middleware.

Errors passed to middleware callbacks are sent as special `connect_error` packets to clients.

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

More information can be found [here](categories/02-Server/middlewares.md).

### namespace.socketsJoin(rooms)

*Added in v4.0.0*

  - `rooms` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - **Returns** `void`

Makes the matching Socket instances join the specified rooms:

```js
// make all Socket instances join the "room1" room
io.socketsJoin("room1");

// make all Socket instances in the "room1" room join the "room2" and "room3" rooms
io.in("room1").socketsJoin(["room2", "room3"]);

// make all Socket instances in the "room1" room of the "admin" namespace join the "room2" room
io.of("/admin").in("room1").socketsJoin("room2");

// this also works with a single socket ID
io.in(theSocketId).socketsJoin("room1");
```

More information can be found [here](categories/02-Server/server-instance.md#utility-methods).

### namespace.socketsLeave(rooms)

*Added in v4.0.0*

  - `rooms` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - **Returns** `void`

Makes the matching Socket instances leave the specified rooms:

```js
// make all Socket instances leave the "room1" room
io.socketsLeave("room1");

// make all Socket instances in the "room1" room leave the "room2" and "room3" rooms
io.in("room1").socketsLeave(["room2", "room3"]);

// make all Socket instances in the "room1" room of the "admin" namespace leave the "room2" room
io.of("/admin").in("room1").socketsLeave("room2");

// this also works with a single socket ID
io.in(theSocketId).socketsLeave("room1");
```

### namespace.disconnectSockets([close])

*Added in v4.0.0*

  - `close` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) whether to close the underlying connection
  - **Returns** `void`

Makes the matching Socket instances disconnect.

```js
// make all Socket instances disconnect
io.disconnectSockets();

// make all Socket instances in the "room1" room disconnect (and discard the low-level connection)
io.in("room1").disconnectSockets(true);

// make all Socket instances in the "room1" room of the "admin" namespace disconnect
io.of("/admin").in("room1").disconnectSockets();

// this also works with a single socket ID
io.of("/admin").in(theSocketId).disconnectSockets();
```

### namespace.fetchSockets()

*Added in v4.0.0*

- **Returns** [`Socket[]`](#socket) | `RemoteSocket[]`

Returns the matching Socket instances:

```js
// return all Socket instances in the main namespace
const sockets = await io.fetchSockets();

// return all Socket instances in the "room1" room of the main namespace
const sockets = await io.in("room1").fetchSockets();

// return all Socket instances in the "room1" room of the "admin" namespace
const sockets = await io.of("/admin").in("room1").fetchSockets();

// this also works with a single socket ID
const sockets = await io.in(theSocketId).fetchSockets();
```

The `sockets` variable in the example above is an array of objects exposing a subset of the usual Socket class:

```js
for (const socket of sockets) {
  console.log(socket.id);
  console.log(socket.handshake);
  console.log(socket.rooms);
  console.log(socket.data);
  socket.emit(/* ... */);
  socket.join(/* ... */);
  socket.leave(/* ... */);
  socket.disconnect(/* ... */);
}
```

The `data` attribute is an arbitrary object that can be used to share information between Socket.IO servers:

```js
// server A
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

// server B
const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

**Important note**: this method (and `socketsJoin`, `socketsLeave` and `disconnectSockets` too) is compatible with the Redis adapter (starting with `socket.io-redis@6.1.0`), which means that they will work across Socket.IO servers.


### namespace.serverSideEmit(eventName[, ...args][, ack])

*Added in v4.1.0*

  - `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Returns** `true`

Sends a message to the other Socket.IO servers of the [cluster](categories/02-Server/using-multiple-nodes.md).

Syntax:

```js
io.serverSideEmit("hello", "world");
```

And on the receiving side:

```js
io.on("hello", (arg1) => {
  console.log(arg1); // prints "world"
});
```

Acknowledgements are supported too:

```js
// server A
io.serverSideEmit("ping", (err, responses) => {
  console.log(responses[0]); // prints "pong"
});

// server B
io.on("ping", (cb) => {
  cb("pong");
});
```

Notes:

- the `connection`, `connect` and `new_namespace` strings are reserved and cannot be used in your application.

- you can send any number of arguments, but binary structures are currently not supported (the array of arguments will be `JSON.stringify`-ed)

Example:

```js
io.serverSideEmit("hello", "world", 1, "2", { 3: "4" });
```

- the acknowledgement callback might be called with an error, if the other Socket.IO servers do not respond after a given delay

```js
io.serverSideEmit("ping", (err, responses) => {
  if (err) {
    // at least one Socket.IO server has not responded
    // the 'responses' array contains all the responses already received though
  } else {
    // success! the 'responses' array contains one object per other Socket.IO server in the cluster
  }
});
```

### Event: 'connection'

  - `socket` [`<Socket>`](#socket)

Fired upon a connection from client.

```js
// main namespace
io.on("connection", (socket) => {
  // ...
});

// custom namespace
io.of("/admin").on("connection", (socket) => {
  // ...
});
```

### Event: 'connect'

Synonym of [Event: "connection"](#event-connection-1).

### Flag: 'volatile'

Sets a modifier for a subsequent event emission that the event data may be lost if the clients are not ready to receive messages (because of network slowness or other issues, or because they’re connected through long polling and is in the middle of a request-response cycle).

```js
io.volatile.emit("an event", { some: "data" }); // the clients may or may not receive it
```

### Flag: 'local'

Sets a modifier for a subsequent event emission that the event data will only be _broadcast_ to the current node (when [scaling to multiple nodes](categories/02-Server/using-multiple-nodes.md)).

```js
io.local.emit("an event", { some: "data" });
```

## Socket

<ThemedImage
  alt="Socket in the class diagram for the server"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-socket.png'),
    dark: useBaseUrl('/images/server-class-diagram-socket-dark.png'),
  }}
/>

A `Socket` is the fundamental class for interacting with browser clients. A `Socket` belongs to a certain `Namespace` (by default `/`) and uses an underlying `Client` to communicate.

It should be noted the `Socket` doesn't relate directly to the actual underlying TCP/IP `socket` and it is only the name of the class.

Within each `Namespace`, you can also define arbitrary channels (called `room`) that the `Socket` can join and leave. That provides a convenient way to broadcast to a group of `Socket`s (see `Socket#to` below).

The `Socket` class inherits from [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter). The `Socket` class overrides the `emit` method, and does not modify any other `EventEmitter` method. All methods documented here which also appear as `EventEmitter` methods (apart from `emit`) are implemented by `EventEmitter`, and documentation for `EventEmitter` applies.

More information can be found [here](categories/02-Server/server-socket-instance.md).

### socket.id

  * [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)

A unique identifier for the session, that comes from the underlying `Client`.

### socket.rooms

  * [`Set<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

A Set of strings identifying the rooms this client is in.

```js
io.on("connection", (socket) => {

  console.log(socket.rooms); // Set { <socket.id> }

  socket.join("room1");

  console.log(socket.rooms); // Set { <socket.id>, "room1" }

});
```

### socket.client

  * [`<Client>`](#client)

A reference to the underlying `Client` object.

### socket.conn

  * `<engine.Socket>`

A reference to the underlying `Client` transport connection (engine.io `Socket` object). This allows access to the IO transport layer, which still (mostly) abstracts the actual TCP/IP socket.

```js
io.on("connection", (socket) => {
  console.log("initial transport", socket.conn.transport.name); // prints "polling"

  socket.conn.once("upgrade", () => {
    // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    console.log("upgraded transport", socket.conn.transport.name); // prints "websocket"
  });

  socket.conn.on("packet", ({ type, data }) => {
    // called for each packet received
  });

  socket.conn.on("packetCreate", ({ type, data }) => {
    // called for each packet sent
  });

  socket.conn.on("drain", () => {
    // called when the write buffer is drained
  });

  socket.conn.on("close", (reason) => {
    // called when the underlying connection is closed
  });
});
```

### socket.request

  * [`<http.IncomingMessage>`](https://nodejs.org/api/http.html#class-httpincomingmessage)

A getter proxy that returns the reference to the `request` that originated the underlying engine.io `Client`. Useful for accessing request headers such as `Cookie` or `User-Agent`.

```js
import { parse } from "cookie";

io.on("connection", (socket) => {
  const cookies = parse(socket.request.headers.cookie || "");
});
```

### socket.handshake

  * [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

The handshake details:

```js
{
  headers: /* the headers sent as part of the handshake */,
  time: /* the date of creation (as string) */,
  address: /* the ip of the client */,
  xdomain: /* whether the connection is cross-domain */,
  secure: /* whether the connection is secure */,
  issued: /* the date of creation (as unix timestamp) */,
  url: /* the request URL string */,
  query: /* the query parameters of the first request */,
  auth: /* the authentication payload */
}
```

Usage:

```js
io.use((socket, next) => {
  let handshake = socket.handshake;
  // ...
});

io.on("connection", (socket) => {
  let handshake = socket.handshake;
  // ...
});
```

### socket.data

*Added in v4.0.0*

An arbitrary object that can be used in conjunction with the [`fetchSockets()`](#namespacefetchsockets) utility method:

```js
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

:::tip

This also works within a Socket.IO cluster, with a compatible adapter like the [Postgres adapter](./categories/05-Adapters/adapter-postgres.md).

:::

### socket.use(fn)

<details className="changelog">
    <summary>History</summary>

| Version | Changes |
| ------- | ------- |
| v3.0.5 | Restoration of the first implementation.
| v3.0.0 | Removal in favor of `socket.onAny()`.
| v1.7.2 | The `error` event is sent directly to the client.
| v1.6.0 | First implementation.

</details>

  - `fn` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Registers a middleware, which is a function that gets executed for every incoming `Packet` and receives as parameter the packet and a function to optionally defer execution to the next registered middleware.

Errors passed to the middleware callback are then emitted as `error` events on the server-side:

```js
io.on("connection", (socket) => {
  socket.use(([event, ...args], next) => {
    if (isUnauthorized(event)) {
      return next(new Error("unauthorized event"));
    }
    // do not forget to call next
    next();
  });

  socket.on("error", (err) => {
    if (err && err.message === "unauthorized event") {
      socket.disconnect();
    }
  });
});
```

### socket.send([...args][, ack])

  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Returns** [`Socket`](#socket)

Sends a `message` event. See [socket.emit(eventName[, ...args][, ack])](#socketemiteventname-args-ack).

### socket.emit(eventName[, ...args][, ack])

*(overrides `EventEmitter.emit`)*
  - `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Returns** `true`

Emits an event to the socket identified by the string name. Any other parameters can be included. All serializable datastructures are supported, including `Buffer`.

```js
socket.emit("hello", "world");
socket.emit("with-binary", 1, "2", { 3: "4", 5: Buffer.from([6]) });
```

The `ack` argument is optional and will be called with the client's answer.

*Server*

```js
io.on("connection", (socket) => {
  socket.emit("hello", "world", (response) => {
    console.log(response); // "got it"
  });
});
```

*Client*

```js
socket.on("hello", (arg, callback) => {
  console.log(arg); // "world"
  callback("got it");
});
```

### socket.on(eventName, callback)

*Inherited from the [EventEmitter class](https://nodejs.org/api/events.html#class-eventemitter).*

  - `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
  - `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Returns** [`<Socket>`](#socket)

Register a new handler for the given event.

```js
socket.on("news", (data) => {
  console.log(data);
});
// with several arguments
socket.on("news", (arg1, arg2, arg3) => {
  // ...
});
// or with acknowledgement
socket.on("news", (data, callback) => {
  callback(0);
});
```

### socket.once(eventName, listener)
### socket.removeListener(eventName, listener)
### socket.removeAllListeners([eventName])
### socket.eventNames()

Inherited from `EventEmitter` (along with other methods not mentioned here). See the Node.js documentation for the [events](https://nodejs.org/docs/latest/api/events.html) module.

### socket.onAny(callback)

  - `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Register a new catch-all listener.

```js
socket.onAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.prependAny(callback)

  - `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Register a new catch-all listener. The listener is added to the beginning of the listeners array.

```js
socket.prependAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.offAny([listener])

  - `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Removes the previously registered listener. If no listener is provided, all catch-all listeners are removed. 

```js
const myListener = () => { /* ... */ };

socket.onAny(myListener);

// then, later
socket.offAny(myListener);

socket.offAny();
```

### socket.listenersAny()

  - **Returns** [`<Function[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Returns the list of registered catch-all listeners.

```js
const listeners = socket.listenersAny();
```

### socket.onAnyOutgoing(callback)

*Added in v4.5.0*

- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Register a new catch-all listener for outgoing packets.

```js
socket.onAnyOutgoing((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.prependAnyOutgoing(callback)

*Added in v4.5.0*

- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Register a new catch-all listener for outgoing packets. The listener is added to the beginning of the listeners array.

```js
socket.prependAnyOutgoing((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.offAnyOutgoing([listener])

*Added in v4.5.0*

- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Removes the previously registered listener. If no listener is provided, all catch-all listeners are removed.

```js
const myListener = () => { /* ... */ };

socket.onAnyOutgoing(myListener);

// remove a single listener
socket.offAnyOutgoing(myListener);

// remove all listeners
socket.offAnyOutgoing();
```

### socket.listenersAnyOutgoing()

*Added in v4.5.0*

- **Returns** [`<Function[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Returns the list of registered catch-all listeners for outgoing packets.

```js
const listeners = socket.listenersAnyOutgoing();
```

### socket.join(room)

  - `room` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - **Returns** `void` | `Promise`

Adds the socket to the given `room` or to the list of rooms.

```js
io.on("connection", (socket) => {
  socket.join("room 237");
  
  console.log(socket.rooms); // Set { <socket.id>, "room 237" }

  socket.join(["room 237", "room 238"]);

  io.to("room 237").emit("a new user has joined the room"); // broadcast to everyone in the room
});
```

The mechanics of joining rooms are handled by the `Adapter` that has been configured (see `Server#adapter` above), defaulting to [socket.io-adapter](https://github.com/socketio/socket.io-adapter).

For your convenience, each socket automatically joins a room identified by its id (see `Socket#id`). This makes it easy to broadcast messages to other sockets:

```js
io.on("connection", (socket) => {
  socket.on("say to someone", (id, msg) => {
    // send a private message to the socket with the given id
    socket.to(id).emit("my message", msg);
  });
});
```

### socket.leave(room)

  - `room` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - **Returns** `void` | `Promise`

Removes the socket from the given `room`.

```js
io.on("connection", (socket) => {
  socket.leave("room 237");

  io.to("room 237").emit(`user ${socket.id} has left the room`);
});
```

:::info

Rooms are left automatically upon disconnection.

:::

### socket.to(room)

<details className="changelog">
    <summary>History</summary>

| Version | Changes |
| ------- | ------- |
| v4.0.0 | Allow to pass an array of rooms.
| v1.0.0 | Initial implementation.

</details>

  - `room` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - **Returns** `Socket` for chaining

Sets a modifier for a subsequent event emission that the event will only be _broadcast_ to clients that have joined the given `room` (the socket itself being excluded).

To emit to multiple rooms, you can call `to` several times.

```js
io.on("connection", (socket) => {

  // to one room
  socket.to("others").emit("an event", { some: "data" });

  // to multiple rooms
  socket.to("room1").to("room2").emit("hello");

  // or with an array
  socket.to(["room1", "room2"]).emit("hello");

  // a private message to another socket
  socket.to(/* another socket id */).emit("hey");

  // WARNING: `socket.to(socket.id).emit()` will NOT work, as it will send to everyone in the room
  // named `socket.id` but the sender. Please use the classic `socket.emit()` instead.
});
```

**Note:** acknowledgements are not supported when broadcasting.

### socket.in(room)

*Added in v1.0.0*

Synonym of [socket.to(room)](#sockettoroom).

### socket.except(rooms)

*Added in v4.0.0*

  - `rooms` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - **Returns** `BroadcastOperator`

Sets a modifier for a subsequent event emission that the event will only be _broadcast_ to clients that have not joined the given `rooms` (the socket itself being excluded).

```js
// to all clients except the ones in "room1" and the sender
socket.broadcast.except("room1").emit(/* ... */);

// same as above
socket.except("room1").emit(/* ... */);

// to all clients in "room4" except the ones in "room5" and the sender
socket.to("room4").except("room5").emit(/* ... */);
```

### socket.compress(value)

  - `value` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) whether to following packet will be compressed
  - **Returns** `Socket` for chaining

Sets a modifier for a subsequent event emission that the event data will only be _compressed_ if the value is `true`. Defaults to `true` when you don't call the method.

```js
io.on("connection", (socket) => {
  socket.compress(false).emit("uncompressed", "that's rough");
});
```

### socket.timeout(value)

*Added in v4.4.0*

- `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
- **Returns** [`<Socket>`](#socket)

Sets a modifier for a subsequent event emission that the callback will be called with an error when the
given number of milliseconds have elapsed without an acknowledgement from the client:

```js
socket.timeout(5000).emit("my-event", (err) => {
  if (err) {
    // the client did not acknowledge the event in the given delay
  }
});
```

### socket.disconnect(close)

  - `close` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) whether to close the underlying connection
  - **Returns** [`Socket`](#socket)

Disconnects this socket. If value of close is `true`, closes the underlying connection. Otherwise, it just disconnects the namespace.

```js
io.on("connection", (socket) => {
  setTimeout(() => socket.disconnect(true), 5000);
});
```

### Flag: 'broadcast'

Sets a modifier for a subsequent event emission that the event data will only be _broadcast_ to every sockets but the sender.

```js
io.on("connection", (socket) => {
  socket.broadcast.emit("an event", { some: "data" }); // everyone gets it but the sender
});
```

### Flag: 'volatile'

Sets a modifier for a subsequent event emission that the event data may be lost if the client is not ready to receive messages (because of network slowness or other issues, or because they’re connected through long polling and is in the middle of a request-response cycle).

```js
io.on("connection", (socket) => {
  socket.volatile.emit("an event", { some: "data" }); // the client may or may not receive it
});
```

### Event: 'disconnect'

  - `reason` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) the reason of the disconnection (either client or server-side)

Fired upon disconnection.

```js
io.on("connection", (socket) => {
  socket.on("disconnect", (reason) => {
    // ...
  });
});
```

Possible reasons:

Reason | Description
------ | -----------
`server namespace disconnect` | The socket was forcefully disconnected with [socket.disconnect()](server-api.md#socketdisconnectclose)
`client namespace disconnect` | The client has manually disconnected the socket using [socket.disconnect()](client-api.md#socketdisconnect)
`server shutting down` | The server is, well, shutting down
`ping timeout` | The client did not send a PONG packet in the `pingTimeout` delay
`transport close` | The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)
`transport error` | The connection has encountered an error

### Event: 'disconnecting'

  - `reason` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) the reason of the disconnection (either client or server-side)

Fired when the client is going to be disconnected (but hasn't left its `rooms` yet).

```js
io.on("connection", (socket) => {
  socket.on("disconnecting", (reason) => {
    console.log(socket.rooms); // Set { ... }
  });
});
```

Note: those events, along with `connect`, `connect_error`, `newListener` and `removeListener`, are special events that shouldn't be used in your application:

```js
// BAD, will throw an error
socket.emit("disconnect");
```

## Client

<ThemedImage
  alt="Client in the class diagram for the server"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-client.png'),
    dark: useBaseUrl('/images/server-class-diagram-client-dark.png'),
  }}
/>

The `Client` class represents an incoming transport (engine.io) connection. A `Client` can be associated with many multiplexed `Socket`s that belong to different `Namespace`s.

### client.conn

  * `<engine.Socket>`

A reference to the underlying `engine.io` `Socket` connection.

### client.request

  * [`<http.IncomingMessage>`](https://nodejs.org/api/http.html#class-httpincomingmessage)

A getter proxy that returns the reference to the `request` that originated the engine.io connection. Useful for accessing request headers such as `Cookie` or `User-Agent`.

## Engine

The Engine.IO server, which manages the WebSocket / HTTP long-polling connections. More information [here](categories/01-Documentation/how-it-works.md).

Its source code can be found here: https://github.com/socketio/engine.io

### engine.clientsCount

*Added in v1.0.0*

  - [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

The number of currently connected clients.

```js
const count = io.engine.clientsCount;
// may or may not be similar to the count of Socket instances in the main namespace, depending on your usage
const count2 = io.of("/").sockets.size;
```

### engine.generateId

  - [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

The function used to generate a new session ID. Defaults to [base64id](https://github.com/faeldt/base64id).

```js
const uuid = require("uuid");

io.engine.generateId = () => {
  return uuid.v4(); // must be unique across all Socket.IO servers
}
```

### engine.handleUpgrade(request, socket, head)

*Added in v1.0.0*

  - `request` [`<http.IncomingMessage>`](https://nodejs.org/docs/latest/api/http.html#http_class_http_incomingmessage) the incoming request
  - `socket` [`<stream.Duplex>`](https://nodejs.org/docs/latest/api/stream.html#stream_class_stream_duplex) the network socket between the server and client
  - `head` [`<Buffer>`](https://nodejs.org/docs/latest/api/buffer.html#buffer_class_buffer) the first packet of the upgraded stream (may be empty)

This method can be used to inject an HTTP upgrade:

Example with both a Socket.IO server and a plain WebSocket server:

```js
import { createServer } from "http";
import { Server as WsServer } from "ws";
import { Server } from "socket.io";

const httpServer = createServer();
const wss = new WsServer({ noServer: true });
const io = new Server(httpServer);

httpServer.removeAllListeners("upgrade");

httpServer.on("upgrade", (req, socket, head) => {
  if (req.url === "/") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else if (req.url.startsWith("/socket.io/")) {
    io.engine.handleUpgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

httpServer.listen(3000);
```

### Event: 'initial_headers'

*Added in v4.1.0*

  - `headers` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) a hash of headers, indexed by header name
  - `request` [`<http.IncomingMessage>`](https://nodejs.org/docs/latest/api/http.html#http_class_http_incomingmessage) the incoming request

This event will be emitted just before writing the response headers of **the first** HTTP request of the session (the handshake), allowing you to customize them.

```js
import { serialize } from "cookie";

io.engine.on("initial_headers", (headers, request) => {
  headers["set-cookie"] = serialize("uid", "1234", { sameSite: "strict" });
});
```

If you need to perform some asynchronous operations, you will need to use the [`allowRequest`](./server-options.md#allowrequest) option:

```js
import { serialize } from "cookie";

const io = new Server(httpServer, {
  allowRequest: async (req, callback) => {
    const session = await fetchSession(req);
    req.session = session;
    callback(null, true);
  }
});

io.engine.on("initial_headers", (headers, req) => {
  if (req.session) {
    headers["set-cookie"] = serialize("sid", req.session.id, { sameSite: "strict" });
  }
});
```

See also:

- [how to use with `express-session`](/how-to/use-with-express-session)
- [how to deal with cookies](/how-to/deal-with-cookies)

### Event: 'headers'

*Added in v4.1.0*

  - `headers` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) a hash of headers, indexed by header name
  - `request` [`<http.IncomingMessage>`](https://nodejs.org/docs/latest/api/http.html#http_class_http_incomingmessage) the incoming request

This event will be emitted just before writing the response headers of **each** HTTP request of the session (including the WebSocket upgrade), allowing you to customize them.

```js
import { serialize, parse } from "cookie";

io.engine.on("headers", (headers, request) => {
  if (!request.headers.cookie) return;
  const cookies = parse(request.headers.cookie);
  if (!cookies.randomId) {
    headers["set-cookie"] = serialize("randomId", "abc", { maxAge: 86400 });
  }
});
```

### Event: 'connection_error'

*Added in v4.1.0*

  - `error` [`<Error>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

```js
io.engine.on("connection_error", (err) => {
  console.log(err.req);	     // the request object
  console.log(err.code);     // the error code, for example 1
  console.log(err.message);  // the error message, for example "Session ID unknown"
  console.log(err.context);  // some additional error context
});
```

This event will be emitted when a connection is abnormally closed. Here is the list of possible error codes:

| Code | Message |
|:----:|:-------:|
| 0 | "Transport unknown"
| 1 | "Session ID unknown"
| 2 | "Bad handshake method"
| 3 | "Bad request"
| 4 | "Forbidden"
| 5 | "Unsupported protocol version"
