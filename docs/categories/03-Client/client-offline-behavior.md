---
title: Offline behavior
sidebar_position: 4
slug: /client-offline-behavior/
---

## Buffered events

By default, any event emitted while the Socket is not connected will be buffered until reconnection.

While useful in most cases (when the reconnection delay is short), it could result in a huge spike of events when the connection is restored.  

There are several solutions to prevent this behavior, depending on your use case:

- use the [connected](client-socket-instance.md#socketconnected) attribute of the Socket instance

```js
if (socket.connected) {
  socket.emit( /* ... */ );
} else {
  // ...
}
```

- use [volatile events](../04-Events/emitting-events.md#volatile-events)

```js
socket.volatile.emit( /* ... */ );
```
