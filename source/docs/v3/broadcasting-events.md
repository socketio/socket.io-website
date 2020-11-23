title: Broadcasting events
permalink: /docs/v3/broadcasting-events/
release: v3
type: docs
order: 353
---

Socket.IO makes it easy to send events to all the connected clients.

Please note that broadcasting is a **server-only** feature.

## To all connected clients

![Broadcasting to all connected clients](/images/broadcasting.png)

```js
io.on("connection", (socket) => {
  io.emit("hello", "world");
});
```

## To all connected clients excepting the sender

![Broadcasting to all connected clients excepting the sender](/images/broadcasting2.png)

```js
// server-side
io.on("connection", (socket) => {
  socket.broadcast.emit("hello", "world");
});
```


In order to target specific clients when broadcasting, please see the documentation about [Rooms](/docs/v3/rooms).
