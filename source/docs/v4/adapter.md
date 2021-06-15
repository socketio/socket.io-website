title: Adapter
short_title: Introduction
permalink: /docs/v4/adapter/
release: v4
type: docs
order: 401
---

An Adapter is a server-side component which is responsible for broadcasting events to all or a subset of clients.

When scaling to multiple Socket.IO servers, you will need to replace the default in-memory adapter by another implementation, so the events are properly routed to all clients.

Besides the in-memory adapter, there are three official implementations:

- the [Redis adapter](/docs/v4/redis-adapter/)
- the [MongoDB adapter](/docs/v4/mongo-adapter/)
- the [Postgres adapter](/docs/v4/postgres-adapter)

There are also several other options which are maintained by the (awesome!) community:

- [AMQP](https://github.com/sensibill/socket.io-amqp) (e.g. RabbitMQ)
- [NATS](https://github.com/MickL/socket.io-nats-adapter)

Please note that enabling sticky sessions is still needed when using multiple Socket.IO servers and HTTP long-polling. More information [here](/docs/v4/using-multiple-nodes/#Why-is-sticky-session-required).

## API

You can have access to the adapter instance with:

```js
// main namespace
const mainAdapter = io.of("/").adapter; // WARNING! io.adapter() will not work
// custom namespace
const adminAdapter = io.of("/admin").adapter;
```

Starting with `socket.io@3.1.0`, each Adapter instance emits the following events:

- `create-room` (argument: room)
- `delete-room` (argument: room)
- `join-room` (argument: room, id)
- `leave-room` (argument: room, id)

Example:

```js
io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
```

## Emitter

Most adapter implementations come with their associated emitter package, which allows communicating to the group of Socket.IO servers from another Node.js process.

![Emitter diagram](/images/emitter.png)

This may be useful for example in a microservice setup, where all clients connect to the microservice M1, while the microservice M2 uses the emitter to broadcast packets (uni-directional communication).

## Emitter cheatsheet

```js
// to all clients
emitter.emit(/* ... */);

// to all clients in "room1"
emitter.to("room1").emit(/* ... */);

// to all clients in "room1" except those in "room2"
emitter.to("room1").except("room2").emit(/* ... */);

const adminEmitter = emitter.of("/admin");

// to all clients in the "admin" namespace
adminEmitter.emit(/* ... */);

// to all clients in the "admin" namespace and in the "room1" room
adminEmitter.to("room1").emit(/* ... */);
```

The emitter also supports the utility methods that were added in `socket.io@4.0.0`:

- `socketsJoin()`

```js
// make all Socket instances join the "room1" room
emitter.socketsJoin("room1");

// make all Socket instances of the "admin" namespace in the "room1" room join the "room2" room
emitter.of("/admin").in("room1").socketsJoin("room2");
```

- `socketsLeave()`

```js
// make all Socket instances leave the "room1" room
emitter.socketsLeave("room1");

// make all Socket instances in the "room1" room leave the "room2" and "room3" rooms
emitter.in("room1").socketsLeave(["room2", "room3"]);

// make all Socket instances in the "room1" room of the "admin" namespace leave the "room2" room
emitter.of("/admin").in("room1").socketsLeave("room2");
```

- `disconnectSockets()`

```js
// make all Socket instances disconnect
emitter.disconnectSockets();

// make all Socket instances in the "room1" room disconnect (and discard the low-level connection)
emitter.in("room1").disconnectSockets(true);

// make all Socket instances in the "room1" room of the "admin" namespace disconnect
emitter.of("/admin").in("room1").disconnectSockets();

// this also works with a single socket ID
emitter.of("/admin").in(theSocketId).disconnectSockets();
```

- `serverSideEmit()`

```js
// emit an event to all the Socket.IO servers of the cluster
emitter.serverSideEmit("hello", "world");

// Socket.IO server (server-side)
io.on("hello", (arg) => {
  console.log(arg); // prints "world"
});
```
