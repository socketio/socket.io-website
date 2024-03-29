---
title: Adapter
sidebar_label: Introduction
sidebar_position: 1
slug: /adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

An Adapter is a server-side component which is responsible for broadcasting events to all or a subset of clients.

When scaling to multiple Socket.IO servers, you will need to replace the default in-memory adapter by another implementation, so the events are properly routed to all clients.

Here is the list of adapters that are maintained by our team:

- the [Redis adapter](adapter-redis.md)
- the [Redis Streams adapter](adapter-redis-streams.md)
- the [MongoDB adapter](adapter-mongo.md)
- the [Postgres adapter](adapter-postgres.md)
- the [Cluster adapter](adapter-cluster.md)
- the [Google Cloud Pub/Sub adapter](adapter-gcp-pubsub.md)
- the [AWS SQS adapter](adapter-aws-sqs.md)
- the [Azure Service Bus adapter](adapter-azure-service-bus.md)

There are also several other options which are maintained by the (awesome!) community:

- [AMQP](https://github.com/sensibill/socket.io-amqp) (e.g. RabbitMQ)
- [NATS](https://github.com/MickL/socket.io-nats-adapter)
- [NATS](https://github.com/distrue/socket.io-nats-adapter)

Please note that enabling sticky sessions is still needed when using multiple Socket.IO servers and HTTP long-polling. More information [here](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

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

<ThemedImage
  alt="Emitter diagram"
  sources={{
    light: useBaseUrl('/images/emitter.png'),
    dark: useBaseUrl('/images/emitter-dark.png'),
  }}
/>

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
