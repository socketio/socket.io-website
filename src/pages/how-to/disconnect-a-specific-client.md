---
title: How to disconnect a specific client
---

# How to disconnect a specific client

## Standalone

```js
function disconnectSocket(id) {
  io.of("/").sockets.get(id)?.disconnect();
}
```

## Cluster

### Without acknowledgement

```js
function disconnectSocket(id) {
  io.in(id).disconnectSockets();
}
```

Reference: [`server.disconnectSockets([close])`](/docs/v4/server-api/#serverdisconnectsocketsclose)

:::tip

This method can also be used to disconnect a given user:

```js
function computeUserId(socket) {
  // to be implemented
}

io.on("connection", (socket) => {
  const userId = computeUserId(socket);
  socket.join(userId); // use a room named after the user ID
});

function disconnectUser(userId) {
  io.in(userId).disconnectSockets();
}
```

:::

### With acknowledgement

```js
function disconnectLocalSocket(id) {
  return io.of("/").sockets.get(id)?.disconnect() !== undefined;
}

io.on("disconnectSocket", (id, cb) => {
  cb(disconnectLocalSocket(id));
});

async function disconnectSocket(id) {
  if (disconnectLocalSocket(id)) {
    return true;
  }
  try {
    const res = await io.serverSideEmitWithAck("disconnectSocket", id);
    return res.some(v => v);
  } catch (e) {
    // something went wrong
  }
}
```

Reference: [`server.serverSideEmitWithAck(eventName[, ...args]);`](/docs/v4/server-api/#serverserversideemitwithackeventname-args)


[< Back to the list of examples](/get-started/)
