---
title: 适配器
sidebar_label: 介绍
sidebar_position: 1
slug: /adapter/
---

适配器是一个服务器端组件，负责将事件广播到所有或部分客户端。

当扩展到多个 Socket.IO 服务器时，您需要将默认的内存适配器替换为另一个实现，以便将事件正确路由到所有客户端。

除了内存适配器之外，还有四种官方实现：

- the [Redis 适配器](adapter-redis.md)
- the [MongoDB 适配器](adapter-mongo.md)
- the [Postgres 适配器](adapter-postgres.md)
- the [Cluster 适配器](adapter-cluster.md)
- the [Google Cloud Pub/Sub 适配器](adapter-gcp-pubsub.md)
- the [AWS SQS 适配器](adapter-aws-sqs.md)
- the [Azure Service Bus 适配器](adapter-azure-service-bus.md)

（真棒！）社区还维护了其他几个选项：

- [AMQP](https://github.com/sensibill/socket.io-amqp) (e.g. RabbitMQ)
- [NATS](https://github.com/MickL/socket.io-nats-adapter)
- [NATS](https://github.com/distrue/socket.io-nats-adapter)

请注意，当使用多个 Socket.IO 服务器和 HTTP 长轮询时，仍然需要启用粘性会话。更多信息[在这里](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

## API {#api}

您可以通过以下方式访问适配器实例：

```js
// main namespace
const mainAdapter = io.of("/").adapter; // WARNING! io.adapter() will not work
// custom namespace
const adminAdapter = io.of("/admin").adapter;
```

从`socket.io@3.1.0`开始，每个 Adapter 实例都会发出以下事件：

- `create-room` (argument: room)
- `delete-room` (argument: room)
- `join-room` (argument: room, id)
- `leave-room` (argument: room, id)

例子：

```js
io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
```

## Emitter {#emitter}

大多数适配器实现都带有相关的发射器包，它允许从另一个 Node.js 进程与一组 Socket.IO 服务器进行通信。

![Emitter diagram](/images/emitter.png)

例如，这在微服务设置中可能很有用，其中所有客户端都连接到微服务 M1，而微服务 M2 使用发射器来广播数据包（单向通信）。

## Emitter cheatsheet {#emitter-cheatsheet}

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
