title: The Server instance
permalink: /docs/v4/server-instance/
release: v4
type: docs
order: 203
---

The Server instance (often called `io` in the code examples) has a few attributes that may be of use in your application.

It also inherits all the methods of the [main namespace](/docs/v4/namespaces/#Main-namespace), like [`namespace.use()`](/docs/v4/server-api/#namespace-use-fn) (see [here](/docs/v4/middlewares/)) or [`namespace.allSockets()`](/docs/v4/server-api/#namespace-allSockets).

## Server#engine

A reference to the underlying Engine.IO server.

It can be used to fetch the number of currently connected clients:

```js
const count = io.engine.clientsCount;
// may or may not be similar to the count of Socket instances in the main namespace, depending on your usage
const count2 = io.of("/").sockets.size;
```

Or to generate a custom session ID (the `sid` query parameter):

```js
const uuid = require("uuid");

io.engine.generateId = (req) => {
  return uuid.v4(); // must be unique across all Socket.IO servers
}
```

## Utility methods

Some utility methods were added in Socket.IO v4.0.0 to manage the Socket instances and their rooms:

- [`socketsJoin`](#socketsJoin): makes the matching socket instances join the specified rooms
- [̀`socketsLeave`](#socketsLeave): makes the matching socket instances leave the specified rooms
- [`disconnectSockets`](#disconnectSockets): makes the matching socket instances disconnect
- [`fetchSockets`](#fetchSockets): returns the matching socket instances

Those methods share the same semantics as broadcasting, and the same filters apply:

```js
io.of("/admin").in("room1").except("room2").local.disconnectSockets();
```

Which makes all Socket instances of the "admin" namespace

- in the "room1" room (`in("room1")` or `to("room1")`)
- except the ones in "room2" (`except("room2")`)
- and only on the current Socket.IO server (`local`)

disconnect.

Please note that they are also compatible with the Redis adapter (starting with `socket.io-redis@6.1.0`), which means that they will work across Socket.IO servers.

### `socketsJoin`

This method makes the matching Socket instances join the specified rooms:

```js
// make all Socket instances join the "room1" room
io.socketsJoin("room1");

// make all Socket instances in the "room1" room join the "room2" and "room3" rooms
io.in("room1").socketsJoin(["room2", "room3"]);

// make all Socket instances in the "room1" room of the "admin" namespace join the "room2" room
io.of("/admin").in("room1").socketsJoin("room2");
```

### `socketsLeave`

This method makes the matching Socket instances leave the specified rooms:

```js
// make all Socket instances leave the "room1" room
io.socketsLeave("room1");

// make all Socket instances in the "room1" room leave the "room2" and "room3" rooms
io.in("room1").socketsLeave(["room2", "room3"]);

// make all Socket instances in the "room1" room of the "admin" namespace leave the "room2" room
io.of("/admin").in("room1").socketsLeave("room2");
```

### `disconnectSockets`

This method makes the matching Socket instances disconnect:

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

### `fetchSockets`

This method returns the matching Socket instances:

```js
// return all Socket instances
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

## Events

The Server instance emits one single event (well, technically two, but `connect` is an alias for `connection`):

- [`connection`](#connection)

### `connection`

This event is fired upon a new connection. The first argument is a [Socket instance](/docs/v4/server-socket-instance/).

```js
io.on("connection", (socket) => {
  // ...
});
```

## Complete API

The complete API exposed by the Server instance can be found [here](/docs/v4/server-api/#Server).
