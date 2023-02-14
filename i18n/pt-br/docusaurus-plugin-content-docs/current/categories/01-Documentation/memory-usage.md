---
title: Memory usage
sidebar_position: 9
slug: /memory-usage/
---

The resources consumed by your Socket.IO server will mainly depend on:

- the number of connected clients
- the number of messages ([basic emit](../04-Events/emitting-events.md#basic-emit), [emit with acknowledgement](../04-Events/emitting-events.md#acknowledgements) and [broadcast](../04-Events/broadcasting-events.md)) received and sent per second

:::info

The memory usage of the Socket.IO server should scale **linearly** with the number of connected clients.

:::

The source code to reproduce the results presented in this page can be found [there](https://github.com/socketio/socket.io-benchmarks).

See also:

- [Load testing](../06-Advanced/load-testing.md)
- [Performance tuning](../06-Advanced/performance-tuning.md)

## Memory usage per WebSocket server implementation

The memory usage of the Socket.IO server heavily depends on the memory usage of the underlying WebSocket server implementation.

The chart below displays the memory usage of the Socket.IO server, from 0 up to 10 000 connected clients, with:

- a Socket.IO server based on the [`ws`](https://github.com/websockets/ws) package (used by default)
- a Socket.IO server based on the [`eiows`](https://github.com/mmdevries/eiows) package, a C++ WebSocket server implementation (see [installation steps](../02-Server/server-installation.md#other-websocket-server-implementations))
- a Socket.IO server based on the [`µWebSockets.js`](https://github.com/uNetworking/uWebSockets.js) package, a C++ alternative to the Node.js native HTTP server (see [installation steps](../02-Server/server-installation.md#usage-with-uwebsockets))
- a plain WebSocket server based on the [`ws`](https://github.com/websockets/ws) package

![Chart of the memory usage per WebSocket server implementation](/images/memory-usage-per-impl.png)


Tested on `Ubuntu 20.04.5 LTS` with Node.js `v16.18.1`, with the following package versions:

- `socket.io@4.5.4`
- `eiows@3.8.0`
- `uWebSockets.js@20.4.0`
- `ws@8.2.3`

## Memory usage over time

The chart below displays the memory usage of the Socket.IO server over time, from 0 up to 10 000 connected clients.

![Chart of the memory usage over time](/images/memory-usage-over-time.png)

:::note

For demonstration purposes, we manually call the garbage collector at the end of each wave of clients:

```js
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    const lastToDisconnect = io.of("/").sockets.size === 0;
    if (lastToDisconnect) {
      gc();
    }
  });
});
```

Which explains the clean drop in memory usage when the last client disconnects. This is not needed in your application, the garbage collection will be automatically triggered when necessary.

:::
