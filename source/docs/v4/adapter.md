title: Adapter
short_title: Introduction
permalink: /docs/v4/adapter/
release: v4
type: docs
order: 401
---

An Adapter is a server-side component which is responsible for broadcasting events to all or a subset of clients.

When scaling to multiple Socket.IO servers, you will need to replace the default in-memory adapter by another implementation, so the events are properly routed to all clients.

Besides the in-memory adapter, there are two official implementations:

- the [Redis adapter](https://github.com/socketio/socket.io-redis-adapter)
- the [MongoDB adapter](https://github.com/socketio/socket.io-mongo-adapter)

There are also several other options which are maintained by the (awesome!) community:

- [AMQP](https://github.com/sensibill/socket.io-amqp) (e.g. RabbitMQ)
- [NATS](https://github.com/MickL/socket.io-nats-adapter)

Please note that enabling sticky sessions is still needed when using multiple Socket.IO servers and HTTP long-polling. More information [here](/docs/v4/using-multiple-nodes/#Why-is-sticky-session-required).

## Emitter

Most adapter implementations come with their associated emitter package, which allows communicating to the group of Socket.IO servers from another Node.js process.

![Emitter diagram](/images/emitter.png)

This may be useful for example in a microservice setup, where all clients connect to the microservice M1, while the microservice M2 uses the emitter to broadcast packets (uni-directional communication).

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
