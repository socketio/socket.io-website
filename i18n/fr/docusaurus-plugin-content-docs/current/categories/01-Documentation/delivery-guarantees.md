---
title: Delivery guarantees
sidebar_position: 2
slug: /delivery-guarantees
toc_max_heading_level: 4
---

## Message ordering

Socket.IO does guarantee message ordering, no matter which low-level transport is used (even during an upgrade from HTTP long-polling to WebSocket).

This is achieved thanks to:

- the guarantees provided by the underlying TCP connection
- the careful design of the [upgrade mechanism](how-it-works.md#upgrade-mechanism)

Example:

```js
socket.emit("event1");
socket.emit("event2");
socket.emit("event3");
```

In the example above, the events will always be received in the same order by the other side (provided that they actually arrive, see [below](#message-arrival)).

## Message arrival

### At most once

By default, Socket.IO provides an **at most once** guarantee of delivery:

- if the connection is broken while an event is being sent, then there is no guarantee that the other side has received it and there will be no retry upon reconnection
- a disconnected client will [buffer events until reconnection](../03-Client/client-offline-behavior.md) (though the previous point still applies)
- there is no such buffer on the server, which means that any event that was missed by a disconnected client will not be transmitted to that client upon reconnection

:::info

As of now, additional delivery guarantees must be implemented in your application.

:::

### At least once

#### From client to server

From the client side, you can achieve an **at least once** guarantee with [acknowledgements and timeouts](../04-Events/emitting-events.md#with-timeout):

```js
function emit(socket, event, arg) {
  socket.timeout(2000).emit(event, arg, (err) => {
    if (err) {
      // no ack from the server, let's retry
      emit(socket, event, arg);
    }
  });
}

emit(socket, "foo", "bar");
```

In the example above, the client will retry to send the event after a given delay, so the server might receive the same event several times.

:::caution

Even in that case, any pending event will be lost if the user refreshes its tab.

:::

#### From server to client

For events sent by the server, additional delivery guarantees can be implemented by:

- assigning a unique ID to each event
- persisting the events in a database
- storing the offset of the last received event on the client side, and send it upon reconnection

Example:

*Client*

```js
const socket = io({
  auth: {
    offset: undefined
  }
});

socket.on("my-event", ({ id, data }) => {
  // do something with the data, and then update the offset
  socket.auth.offset = id;
});
```

*Server*

```js
io.on("connection", async (socket) => {
  const offset = socket.handshake.auth.offset;
  if (offset) {
    // this is a reconnection
    for (const event of await fetchMissedEventsFromDatabase(offset)) {
      socket.emit("my-event", event);
    }
  } else {
    // this is a first connection
  }
});

setInterval(async () => {
  const event = {
    id: generateUniqueId(),
    data: new Date().toISOString()
  }

  await persistEventToDatabase(event);
  io.emit("my-event", event);
}, 1000);
```

Implementing the missing methods (`fetchMissedEventsFromDatabase()`, `generateUniqueId()` and `persistEventToDatabase()`) is database-specific and is left as an exercise for the reader.

References:

- [`socket.auth`](../../client-options.md#socket-options) (client)
- [`socket.handshake`](../../server-api.md#sockethandshake) (server)
