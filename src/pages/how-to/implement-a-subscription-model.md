---
title: How to implement a subscription model
---

# How to implement a subscription model

By default, events are sent over the wire even if there is no registered event handler on the other side.

:::note

You can catch those missing event handlers with a catch-all listener:

```js
socket.onAny((event) => {
  if (socket.listeners(event).length === 0) {
    console.log(`missing handler for event ${event}`);
  }
});
```

Reference:  [`onAny()` method](/docs/v4/client-api/#socketonanycallback)

:::

To only receive a list of specific events (for example, if a part of your application only needs a handful of events), you can implement a subscription model:

## Client

```js
const subscriptions = [];

function subscribe(topic) {
  subscriptions.push(topic);
  if (socket.connected) {
    socket.emit("subscribe", [topic]);
  }
}

function unsubscribe(topic) {
  const i = subscriptions.indexOf(topic);
  if (i !== -1) {
    subscriptions.splice(i, 1);
    if (socket.connected) {
      socket.emit("unsubscribe", topic);
    }
  }
}

// restore the subscriptions upon reconnection
socket.on("connect", () => {
  if (subscriptions.length && !socket.recovered) {
    socket.emit("subscribe", subscriptions);
  }
});

subscribe("foo");
```

## Server

```js
io.on("connection", (socket) => {
  socket.on("subscribe", (topics) => {
    socket.join(topics);
  });

  socket.on("unsubscribe", (topic) => {
    socket.leave(topic);
  });

  // send an event only to clients that have shown interest in the "foo" topic
  io.to("foo").emit("foo");
});
```

## Additional notes

### List of subscriptions

We could have used a ES6 Set for the subscriptions on the client side:

```js
const subscriptions = new Set();

function subscribe(topic) {
  subscriptions.add(topic);
  if (socket.connected) {
    socket.emit("subscribe", [topic]);
  }
}

function unsubscribe(topic) {
  const deleted = subscriptions.delete(topic);
  if (deleted && socket.connected) {
    socket.emit("unsubscribe", topic);
  }
}

// restore the subscriptions upon reconnection
socket.on("connect", () => {
  if (subscriptions.size) {
    socket.emit("subscribe", [...subscriptions]);
  }
});
```

Which is cleaner (no need to handle duplicate subscriptions, for example) but would require a polyfill if you need to target [old platforms](https://caniuse.com/mdn-javascript_builtins_set).

### Connection state recovery

In the "connect" handler:

```js
socket.on("connect", () => {
  if (subscriptions.length && !socket.recovered) {
    socket.emit("subscribe", subscriptions);
  }
});
```

The `!socket.recovered` condition is related to the [Connection state recovery feature](/docs/v4/connection-state-recovery).

If the connection state was successfully recovered, then the subscriptions (the rooms on the server side) will be automatically restored.

Reference: [`socket.recovered` attribute](/docs/v4/client-api/#socketrecovered)
