---
title: Introduction
sidebar_position: 1
slug: /
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## What Socket.IO is

Socket.IO is a library that enables **low-latency**, **bidirectional** and **event-based** communication between a client and a server.

<ThemedImage
  alt="Diagram of a communication between a server and a client"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication2.png'),
    dark: useBaseUrl('/images/bidirectional-communication2-dark.png'),
  }}
/>

It is built on top of the [WebSocket](https://en.wikipedia.org/wiki/WebSocket) protocol and provides additional guarantees like fallback to HTTP long-polling or automatic reconnection.

:::info

WebSocket is a communication protocol which provides a full-duplex and low-latency channel between the server and the browser. More information can be found [here](https://en.wikipedia.org/wiki/WebSocket).

:::

There are several Socket.IO server implementations available:

- JavaScript (whose documentation can be found here on this website)
  - [Installation steps](../02-Server/server-installation.md)
  - [API](../../server-api.md)
  - [Source code](https://github.com/socketio/socket.io)
- Java: https://github.com/mrniko/netty-socketio
- Java: https://github.com/trinopoty/socket.io-server-java
- Python: https://github.com/miguelgrinberg/python-socketio

And client implementations in most major languages:

- JavaScript (which can be run either in the browser, in Node.js or in React Native)
  - [Installation steps](../03-Client/client-installation.md)
  - [API](../../client-api.md)
  - [Source code](https://github.com/socketio/socket.io-client)
- Java: https://github.com/socketio/socket.io-client-java
- C++: https://github.com/socketio/socket.io-client-cpp
- Swift: https://github.com/socketio/socket.io-client-swift
- Dart: https://github.com/rikulo/socket.io-client-dart
- Python: https://github.com/miguelgrinberg/python-socketio
- .Net: https://github.com/doghappy/socket.io-client-csharp
- Golang: https://github.com/googollee/go-socket.io
- Rust: https://github.com/1c3t3a/rust-socketio
- Kotlin: https://github.com/icerockdev/moko-socket-io

Here's a basic example with plain WebSockets:

*Server* (based on [ws](https://github.com/websockets/ws))

```js
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 3000 });

server.on("connection", (socket) => {
  // send a message to the client
  socket.send(JSON.stringify({
    type: "hello from server",
    content: [ 1, "2" ]
  }));

  // receive a message from the client
  socket.on("message", (data) => {
    const packet = JSON.parse(data);

    switch (packet.type) {
      case "hello from client":
        // ...
        break;
    }
  });
});
```

*Client*

```js
const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("open", () => {
  // send a message to the server
  socket.send(JSON.stringify({
    type: "hello from client",
    content: [ 3, "4" ]
  }));
});

// receive a message from the server
socket.addEventListener("message", ({ data }) => {
  const packet = JSON.parse(data);

  switch (packet.type) {
    case "hello from server":
      // ...
      break;
  }
});
```

And here's the same example with Socket.IO:

*Server*

```js
import { Server } from "socket.io";

const io = new Server(3000);

io.on("connection", (socket) => {
  // send a message to the client
  socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });

  // receive a message from the client
  socket.on("hello from client", (...args) => {
    // ...
  });
});
```

*Client*

```js
import { io } from "socket.io-client";

const socket = io("ws://localhost:3000");

// send a message to the server
socket.emit("hello from client", 5, "6", { 7: Uint8Array.from([8]) });

// receive a message from the server
socket.on("hello from server", (...args) => {
  // ...
});
```

Both examples looks really similar, but under the hood Socket.IO provides additional features that hide the complexity of running an application based on WebSockets in production. Those features are listed [below](#features).

But first, let's make it clear what Socket.IO is not.

## What Socket.IO is not

:::caution

Socket.IO is **NOT** a WebSocket implementation.

:::

Although Socket.IO indeed uses WebSocket for transport when possible, it adds additional metadata to each packet. That is why a WebSocket client will not be able to successfully connect to a Socket.IO server, and a Socket.IO client will not be able to connect to a plain WebSocket server either.

```js
// WARNING: the client will NOT be able to connect!
const socket = io("ws://echo.websocket.org");
```

If you are looking for a plain WebSocket server, please take a look at [ws](https://github.com/websockets/ws) or [µWebSockets.js](https://github.com/uNetworking/uWebSockets.js).

There are also [discussions](https://github.com/nodejs/node/issues/19308) for including a WebSocket server in the Node.js core.

On the client-side, you might be interested in the [robust-websocket](https://github.com/nathanboktae/robust-websocket) package.

:::caution

Socket.IO is not meant to be used in a background service for mobile applications.

:::

The Socket.IO library keeps an open TCP connection to the server, which may result in a high battery drain for your users. Please use a dedicated messaging platform like [FCM](https://firebase.google.com/docs/cloud-messaging) for this use case.

## Features

Here are the features provided by Socket.IO over plain WebSockets:

### HTTP long-polling fallback

The connection will fall back to HTTP long-polling in case the WebSocket connection cannot be established.

This feature was the #1 reason people used Socket.IO when the project was created more than ten years ago (!), as the browser support for WebSockets was still in its infancy.

Even if most browsers now support WebSockets (more than [97%](https://caniuse.com/mdn-api_websocket)), it is still a great feature as we still receive reports from users that cannot establish a WebSocket connection because they are behind some misconfigured proxy.

### Automatic reconnection

Under some particular conditions, the WebSocket connection between the server and the client can be interrupted with both sides being unaware of the broken state of the link.

That's why Socket.IO includes a heartbeat mechanism, which periodically checks the status of the connection.

And when the client eventually gets disconnected, it automatically reconnects with an exponential back-off delay, in order not to overwhelm the server.

### Packet buffering

The packets are automatically buffered when the client is disconnected, and will be sent upon reconnection.

More information [here](../03-Client/client-offline-behavior.md#buffered-events).

### Acknowledgements

Socket.IO provides a convenient way to send an event and receive a response:

*Sender*

```js
socket.emit("hello", "world", (response) => {
  console.log(response); // "got it"
});
```

*Receiver*

```js
socket.on("hello", (arg, callback) => {
  console.log(arg); // "world"
  callback("got it");
});
```

You can also add a timeout:

```js
socket.timeout(5000).emit("hello", "world", (err, response) => {
  if (err) {
    // the other side did not acknowledge the event in the given delay
  } else {
    console.log(response); // "got it"
  }
});
```

### Broadcasting

On the server-side, you can send an event to [all connected clients](../04-Events/broadcasting-events.md) or [to a subset of clients](../04-Events/rooms.md):

```js
// to all connected clients
io.emit("hello");

// to all connected clients in the "news" room
io.to("news").emit("hello");
```

This also works when [scaling to multiple nodes](../02-Server/using-multiple-nodes.md).

### Multiplexing

Namespaces allow you to split the logic of your application over a single shared connection. This can be useful for example if you want to create an "admin" channel that only authorized users can join.

```js
io.on("connection", (socket) => {
  // classic users
});

io.of("/admin").on("connection", (socket) => {
  // admin users
});
```

More on that [here](../06-Advanced/namespaces.md).

## Common questions

### Is Socket.IO still needed today?

That's a fair question, since WebSockets are supported [almost everywhere](https://caniuse.com/mdn-api_websocket) now.

That being said, we believe that, if you use plain WebSockets for your application, you will eventually need to implement most of the features that are already included (and battle-tested) in Socket.IO, like [reconnection](#automatic-reconnection), [acknowledgements](#acknowledgements) or [broadcasting](#broadcasting).

### What is the overhead of the Socket.IO protocol?

`socket.emit("hello", "world")` will be sent as a single WebSocket frame containing `42["hello","world"]` with:

- `4` being Engine.IO "message" packet type
- `2` being Socket.IO "message" packet type
- `["hello","world"]` being the `JSON.stringify()`-ed version of the arguments array

So, a few additional bytes for each message, which can be further reduced by the usage of a [custom parser](../06-Advanced/custom-parser.md).

:::info

The size of the browser bundle itself is [`10.4 kB`](https://bundlephobia.com/package/socket.io-client) (minified and gzipped).

:::

### Something does not work properly, please help?

Please check the [Troubleshooting guide](../01-Documentation/troubleshooting.md).

## Next steps

- [Get started example](/get-started/chat)
- [Server installation](../02-Server/server-installation.md)
- [Client installation](../03-Client/client-installation.md)
