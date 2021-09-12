title: Broadcasting events
permalink: /docs/v4/broadcasting-events/
release: v4
type: docs
order: 353
---

Socket.IO makes it easy to send events to all the connected clients.

Please note that broadcasting is a **server-only** feature.

## To each client, when they first connect

![Broadcasting to all connected clients](/images/broadcasting.png)

```js
io.on("connection", (socket) => {
  io.emit("hello", "world");
});
```

## To all connected clients

![Broadcasting to all connected clients](/images/broadcasting.png)

```js
io.sockets.emit("hi", "everyone");
// is equivalent to
io.of("/").emit("hi", "everyone");
```

## To all connected clients except the sender

![Broadcasting to all connected clients excepting the sender](/images/broadcasting2.png)

```js
// server-side
io.on("connection", (socket) => {
  socket.broadcast.emit("hello", "world");
});
```

## With multiple Socket.IO servers

Broadcasting also works with multiple Socket.IO servers.

You just need to replace the default [Adapter](/docs/v4/glossary/#Adapter) by the Redis Adapter. More information about it [here](/docs/v4/using-multiple-nodes/#Passing-events-between-nodes).

![Broadcasting with Redis](/images/broadcasting-redis.png)

In certain cases, you may want to only broadcast to clients that are connected to the current server. You can achieve this with the `local` flag:

```js
io.on("connection", (socket) => {
  io.local.emit("hello", "world");
});
```

![Broadcasting with Redis but local](/images/broadcasting-redis-local.png)


In order to target specific clients when broadcasting, please see the documentation about [Rooms](/docs/v4/rooms/).
