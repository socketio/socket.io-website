---
title: Introduction
sidebar_position: 1
slug: /
---

## What Socket.IO is

Socket.IO is a library that enables real-time, bidirectional and event-based communication between the browser and the server. It consists of:

- a Node.js server: [Source](https://github.com/socketio/socket.io) | [API](../../server-api.md)
- a Javascript client library for the browser (which can be also run from Node.js): [Source](https://github.com/socketio/socket.io-client) | [API](../../client-api.md)

<img src="/images/bidirectional-communication.png" alt="Diagram for bidirectional communication" />

There are also several client implementations in other languages, which are maintained by the community:

- Java: https://github.com/socketio/socket.io-client-java
- C++: https://github.com/socketio/socket.io-client-cpp
- Swift: https://github.com/socketio/socket.io-client-swift
- Dart: https://github.com/rikulo/socket.io-client-dart
- Python: https://github.com/miguelgrinberg/python-socketio
- .Net: https://github.com/doghappy/socket.io-client-csharp
- Golang: https://github.com/googollee/go-socket.io
- Rust: https://github.com/1c3t3a/rust-socketio

Other server implementations:

- Java: https://github.com/mrniko/netty-socketio
- Java: https://github.com/trinopoty/socket.io-server-java
- Python: https://github.com/miguelgrinberg/python-socketio

### How does that work?

The client will try to establish a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) connection if possible, and will fall back on HTTP long polling if not.

WebSocket is a communication protocol which provides a full-duplex and low-latency channel between the server and the browser. More information can be found [here](https://en.wikipedia.org/wiki/WebSocket).

So, in the best-case scenario, provided that:

- the browser supports WebSocket ([97%](https://caniuse.com/#search=websocket) of all browsers in 2022)
- there is no element (proxy, firewall, ...) preventing WebSocket connections between the client and the server  

you can consider the Socket.IO client as a "light" wrapper around the WebSocket API. Instead of writing:

```js
const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
  socket.send("Hello!");
};

socket.onmessage = (data) => {
  console.log(data);
};
```

On the client-side, you can write:

```js
const socket = io("ws://localhost:3000");

socket.on("connect", () => {
  // either with send()
  socket.send("Hello!");

  // or with emit() and custom event names
  socket.emit("greetings", "Hello!", { "mr": "john" }, Uint8Array.from([1, 2, 3, 4]));
});

// handle the event sent with socket.send()
socket.on("message", data => {
  console.log(data);
});

// handle the event sent with socket.emit()
socket.on("greetings", (elem1, elem2, elem3) => {
  console.log(elem1, elem2, elem3);
});
```

The API on the server-side is similar, you also get a `socket` object which extends the Node.js [EventEmitter](https://nodejs.org/docs/latest/api/events.html#events_class_eventemitter) class:

```js
const io = require("socket.io")(3000);

io.on("connection", socket => {
  // either with send()
  socket.send("Hello!");

  // or with emit() and custom event names
  socket.emit("greetings", "Hey!", { "ms": "jane" }, Buffer.from([4, 3, 3, 1]));

  // handle the event sent with socket.send()
  socket.on("message", (data) => {
    console.log(data);
  });

  // handle the event sent with socket.emit()
  socket.on("greetings", (elem1, elem2, elem3) => {
    console.log(elem1, elem2, elem3);
  });
});
```

Socket.IO provides additional features over a plain WebSocket object, which are listed [below](#features).

But first, let's detail what the Socket.IO library is not.

## What Socket.IO is not

:::caution

Socket.IO is **NOT** a WebSocket implementation.

:::

Although Socket.IO indeed uses WebSocket for transport when possible, it adds additional metadata to each packet. That is why a WebSocket client will not be able to successfully connect to a Socket.IO server, and a Socket.IO client will not be able to connect to a plain WebSocket server either.

```js
// WARNING: the client will NOT be able to connect!
const socket = io("ws://echo.websocket.org");
```

If you are looking for a plain WebSocket server, please take a look at [ws](https://github.com/websockets/ws) or [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js).

There are also [discussions](https://github.com/nodejs/node/issues/19308) for including a WebSocket server in the Node.js core.

On the client-side, you might be interested in [robust-websocket](https://github.com/nathanboktae/robust-websocket) package.

:::caution

Socket.IO is not meant to be used in a background service for mobile applications.

:::

The Socket.IO library keeps an open TCP connection to the server, which may result in a high battery drain for your users. Please use a dedicated messaging platform like [FCM](https://firebase.google.com/docs/cloud-messaging) for this use case.

## Features

Here are the features provided by Socket.IO over plain WebSockets:

- reliability (fallback to HTTP long-polling in case the WebSocket connection cannot be established)
- automatic reconnection
- [packet buffering](../03-Client/client-offline-behavior.md#buffered-events)
- [acknowledgments](../04-Events/emitting-events.md#acknowledgements)
- broadcasting [to all clients](../04-Events/broadcasting-events.md) or [to a subset of clients](../04-Events/rooms.md) (what we call "Room")
- [multiplexing](../06-Advanced/namespaces.md) (what we call "Namespace")

Please find more details about how it works [here](../01-Documentation/how-it-works.md).
