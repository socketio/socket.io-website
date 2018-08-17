title: Socket.IO  —  Internals
permalink: /docs/internals/
type: docs
---

# Dependency graph

The Socket.IO codebase is split accross several repositories:

- https://github.com/socketio/socket.io
- https://github.com/socketio/socket.io-client
- https://github.com/socketio/socket.io-parser
- https://github.com/socketio/socket.io-adapter
- https://github.com/socketio/socket.io-redis
- https://github.com/socketio/engine.io
- https://github.com/socketio/engine.io-client
- https://github.com/socketio/engine.io-parser

The following diagram displays the relationships between each project:

<img src="/images/dependencies.jpg" alt="Socket.IO dependency graph">

Each project brings its own set of features:

## engine.io-parser

This is the JavaScript parser for the engine.io protocol encoding, shared by both [engine.io-client](https://github.com/socketio/engine.io-client) and [engine.io](https://github.com/socketio/engine.io).

The specification for the protocol can be found here: https://github.com/socketio/engine.io-protocol

## engine.io

Engine.IO is the implementation of transport-based cross-browser/cross-device bi-directional communication layer for Socket.IO.

Its main feature is the ability to swap transports on the fly. A connection (initiated by an [engine.io-client](https://github.com/socketio/engine.io-client) counterpart) starts with XHR polling, but can then switch to WebSocket if possible.

It uses the [engine.io-parser](https://github.com/socketio/engine.io-parser) to encode/decode packets.

## engine.io-client

This is the client for [Engine.IO](https://github.com/socketio/engine.io), the implementation of transport-based cross-browser/cross-device bi-directional communication layer for [Socket.IO](https://github.com/socketio/socket.io).

It runs in both the browser (including HTML5 [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)) and Node.js.

It uses the [engine.io-parser](https://github.com/socketio/engine.io-parser) to encode/decode packets.

## socket.io-adapter

This is the default Socket.IO in-memory adapter class.

This module is not intended for end-user usage, but can be used as an interface to inherit from from other adapters you might want to build, like [socket.io-redis](https://github.com/socketio/socket.io-redis).

## socket.io-redis

This is the adapter using the Redis [Pub/Sub](https://redis.io/topics/pubsub) mechanism to broadcast messages between multiple nodes.

## socket.io-parser

A socket.io encoder and decoder written in JavaScript complying with version 3 of [socket.io-protocol](). Used by [socket.io](https://github.com/socketio/socket.io) and [socket.io-client](https://github.com/socketio/socket.io-client).

## socket.io

Socket.IO brings some *syntactic sugar* over the Engine.IO "raw" API. It also brings two new concepts, `Rooms` and `Namespaces`, which introduce a separation of concern between communication channels. Please see the associated documentation [there](https://socket.io/docs/rooms-and-namespaces/).

By default, it exposes a browser build of the client at `/socket.io/socket.io.js`.

It uses the [socket.io-parser](https://github.com/socketio/socket.io-parser) to encode/decode packets.

## socket.io-client

This is the client for [Socket.IO](https://github.com/socketio/socket.io). It relies on [engine.io-client](https://github.com/socketio/engine.io-client), which manages the transport swapping and the disconnection detection.

It handles reconnection automatically, in case the underlying connection is severed.

It uses the [socket.io-parser](https://github.com/socketio/socket.io-parser) to encode/decode packets.


# Under the hood

## Connection

```js
const client = io('https://myhost.com');
```

The following steps take place:

- on the client-side, a new `engine.io-client` instance is created

- the `engine.io-client` instance tries to establish a `polling` transport

```sh
GET https://myhost.com/socket.io/?EIO=3&transport=polling&t=ML4jUwU&b64=1

with:

  "EIO=3"               # the current version of the Engine.IO protocol
  "transport=polling"   # the transport being established
  "t=ML4jUwU&b64=1"     # a hashed timestamp for cache-busting

```

- the `engine.io` server responds with:

```js
{
  "type": "open",
  "data": {
    "sid": "36Yib8-rSutGQYLfAAAD",  // the unique session id
    "upgrades": ["websocket"],      // the list of possible transport upgrades
    "pingInterval": 25000,          // the 1st parameter for the heartbeat mechanism
    "pingTimeout": 5000             // the 2nd parameter for the heartbeat mechanism
  }
}
```

- the content is encoded by the `engine.io-parser` as:

```sh
'96:0{"sid":"hLOEJXN07AE0GQCNAAAB","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":5000}2:40'

with:

  "96"  # the length of the first message
  ":"   # a separator between length and content
  "0"   # the "open" message type
  '{"sid":"hLOEJXN07AE0GQCNAAAB","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":5000}' # the JSON-encoded handshake data
  "2"   # the length of the second message
  ":"   # a separator between length and content
  "4"   # the "message" message type
  "0"   # the "open" message type in Socket.IO protocol

```

- the content is then decoded by the `engine.io-parser` on the client-side

- an `open` event is emitted at the `engine.io-client` level

- a `connect` event is emitted at the `socket.io-client` level

## Upgrade

Once all the buffers of the existing transport (XHR polling) are flushed, an upgrade gets tested on the side by sending a probe.

```sh
GET wss://myhost.com/socket.io/?EIO=3&transport=websocket&sid=36Yib8-rSutGQYLfAAAD

with:

  "EIO=3"                     # again, the current version of the Engine.IO protocol
  "transport=websocket"       # the new transport being probed
  "sid=36Yib8-rSutGQYLfAAAD"  # the unique session id

```

- a "ping" packet is sent by the client in a WebSocket frame, encoded as `2probe` by the `engine.io-parser`, with `2` being the "ping" message type.

- the server responds with a "pong" packet, encoded as `3probe`, with `3` being the "pong" message type.

- upon receiving the "pong" packet, the upgrade is considered complete and all following messages go through the new transport.

