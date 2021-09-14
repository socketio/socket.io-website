---
title: Offline behavior
sidebar_position: 4
slug: /client-offline-behavior/
---

## Buffered events

By default, any event emitted while the Socket is not connected will be buffered until reconnection.

While useful in most cases (when the reconnection delay is short), it could result in a huge spike of events when the connection is restored.  

There are several solutions to prevent this behavior, depending on your use case:

- use the [connected](/docs/v3/client-socket-instance/#Socket-connected) attribute of the Socket instance

```js
if (socket.connected) {
  socket.emit( /* ... */ );
} else {
  // ...
}
```

- use [volatile events](/docs/v3/emitting-events/#Volatile-events)

```js
socket.volatile.emit( /* ... */ );
```

- empty the internal buffer upon reconnection

```js
socket.on("connect", () => {
  socket.sendBuffer = [];
});
```
