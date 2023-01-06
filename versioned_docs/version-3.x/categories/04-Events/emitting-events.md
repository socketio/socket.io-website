---
title: Emitting events
sidebar_position: 1
slug: /emitting-events/
---

There are several ways to send events between the server and the client.

## Basic emit

The Socket.IO API is inspired from the Node.js [EventEmitter](https://nodejs.org/docs/latest/api/events.html#events_events), which means you can emit events on one side and register listeners on the other:

```js
// server-side
io.on("connection", (socket) => {
  socket.emit("hello", "world");
});

// client-side
socket.on("hello", (arg) => {
  console.log(arg); // world
});
```

This also works in the other direction:

```js
// server-side
io.on("connection", (socket) => {
  socket.on("hello", (arg) => {
    console.log(arg); // world
  });
});

// client-side
socket.emit("hello", "world");
```

You can send any number of arguments, and all serializable data structures are supported, including binary objects like [Buffer](https://nodejs.org/docs/latest/api/buffer.html#buffer_buffer) or [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).

```js
// server-side
io.on("connection", (socket) => {
  socket.emit("hello", 1, "2", { 3: '4', 5: Buffer.from([6]) });
});

// client-side
socket.on("hello", (arg1, arg2, arg3) => {
  console.log(arg1); // 1
  console.log(arg2); // "2"
  console.log(arg3); // { 3: '4', 5: ArrayBuffer (1) [ 6 ] }
});
```

There is no need to run `JSON.stringify()` on objects as it will be done for you.

```js
// BAD
socket.emit("hello", JSON.stringify({ name: "John" }));

// GOOD
socket.emit("hello", { name: "John" });
```

Note: [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) are not serializable and must be manually serialized:

```js
const serializedMap = [...myMap.entries()];
const serializedSet = [...mySet.keys()];
```

## Acknowledgements

Events are great, but in some cases you may want a more classic request-response API. In Socket.IO, this feature is named acknowledgements.

You can add a callback as the last argument of the `emit()`, and this callback will be called once the other side acknowledges the event:

```js
// server-side
io.on("connection", (socket) => {
  socket.on("update item", (arg1, arg2, callback) => {
    console.log(arg1); // 1
    console.log(arg2); // { name: "updated" }
    callback({
      status: "ok"
    });
  });
});

// client-side
socket.emit("update item", "1", { name: "updated" }, (response) => {
  console.log(response.status); // ok
});
```

Timeout are not supported by default, but it is quite straightforward to implement:

```js
const withTimeout = (onSuccess, onTimeout, timeout) => {
  let called = false;

  const timer = setTimeout(() => {
    if (called) return;
    called = true;
    onTimeout();
  }, timeout);

  return (...args) => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    onSuccess.apply(this, args);
  }
}

socket.emit("hello", 1, 2, withTimeout(() => {
  console.log("success!");
}, () => {
  console.log("timeout!");
}, 1000));
```

## Volatile events

Volatile events are events that will not be sent if the underlying connection is not ready (a bit like [UDP](https://fr.wikipedia.org/wiki/User_Datagram_Protocol), in terms of reliability).

This can be interesting for example if you need to send the position of the characters in an online game (as only the latest values are useful).

```js
socket.volatile.emit("hello", "might or might not be received");
```

Another use case is to discard events when the client is not connected (by default, the events are buffered until reconnection).

Example:

```js
// server-side
io.on("connection", (socket) => {
  console.log("connect");

  socket.on("ping", (count) => {
    console.log(count);
  });
});

// client-side
let count = 0;
setInterval(() => {
  socket.volatile.emit("ping", ++count);
}, 1000);
```

If you restart the server, you will see in the console:

```
connect
1
2
3
4
# the server is restarted, the client automatically reconnects
connect
9
10
11
```

Without the `volatile` flag, you would see:

```
connect
1
2
3
4
# the server is restarted, the client automatically reconnects and sends its buffered events
connect
5
6
7
8
9
10
11
```
