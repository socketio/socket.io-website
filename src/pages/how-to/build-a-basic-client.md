---
title: How to build a basic Socket.IO client
---

# How to build a basic Socket.IO client

In this guide, we will implement a basic Socket.IO client in JavaScript, in order to get a better understanding of the Socket.IO protocol.

We will implement the following features:

- creating a WebSocket connection
- managing reconnections
- sending events
- receiving events
- disconnecting manually

The official client obviously contains a lot more features:

- [support for old browsers, down to IE9](/docs/v4/client-installation/#browser-support)
- [fallback to HTTP long-polling](/docs/v4/how-it-works/#upgrade-mechanism)
- [acknowledgements](/docs/v4/emitting-events/#acknowledgements)
- binary payloads
- [multiplexing](/docs/v4/namespaces/)
- [catch-all listeners](/docs/v4/listening-to-events/#catch-all-listeners)
- [connection state recovery](/docs/v4/connection-state-recovery)
- ...

But that should be sufficient to give you a good overview of how the library works under the hood.

Our goal is to achieve something like this:

```js
import { io } from "./basic-client.js";

const socket = io();

// connection
socket.on("connect", () => {
  // ...
});

// receiving an event
socket.on("foo", (value) => {
  // ...
});

// sending an event
socket.emit("bar", "abc");
```

Ready? Let's do this!


## Event emitter

The Socket.IO API is heavily inspired from the Node.js [EventEmitter](https://nodejs.org/api/events.html) class.

```js
import { EventEmitter } from "node:events";

const myEmitter = new EventEmitter();

myEmitter.on("foo", () => {
  console.log("foo!");
});

myEmitter.emit("foo");
```

The library provides a similar API, but between a server and a client:

- server

```js
io.on("connection", (socket) => {
  // send a "foo" event to the client
  socket.emit("foo");

  // receive a "bar" event from the client
  socket.on("bar", () => {
    // ...
  });
});
```

- client

```js
import { io } from "socket.io-client";

const socket = io();

// receive a "foo" event from the server
socket.on("foo", () => {
  // ...
});

// send a "bar" event to the server
socket.emit("bar");
```

The underlying connection between the server and the client ([WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) or HTTP long-polling) is abstracted away and managed by the library.

Let's create a minimalistic `EventEmitter` class:

```js
class EventEmitter {
  #listeners = new Map();

  on(event, listener) {
    let listeners = this.#listeners.get(event);
    if (!listeners) {
      this.#listeners.set(event, listeners = []);
    }
    listeners.push(listener);
  }

  emit(event, ...args) {
    const listeners = this.#listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        listener.apply(null, args);
      }
    }
  }
}
```

Our `Socket` class will then extend this class, in order to expose both the `on()` and the `emit()` methods:

```js
class Socket extends EventEmitter {
  constructor(uri, opts) {
    super();
  }
}
```

In our constructor, the `uri` argument is either:

- provided by the user:

```js
const socket = io("https://example.com");
```

- or inferred from the [`window.location`](https://developer.mozilla.org/en-US/docs/Web/API/Location) object

```js
const socket = io();
```

Let's create an entrypoint:

```js
export function io(uri, opts) {
  if (typeof uri !== "string") {
    opts = uri;
    uri = location.origin;
  }
  return new Socket(uri, opts);
}
```

OK, so that's a good start!

## WebSocket connection

Now, let's create the WebSocket connection to the server:

```diff
class Socket extends EventEmitter {
+ #uri;
+ #opts;
+ #ws;

  constructor(uri, opts) {
    super();
+   this.#uri = uri;
+   this.#opts = Object.assign({
+     path: "/socket.io/"
+   }, opts);
+   this.#open();
  }

+ #open() {
+   this.#ws = new WebSocket(this.#createUrl());
+ }
+
+ #createUrl() {
+   const uri = this.#uri.replace(/^http/, "ws");
+   const queryParams = "?EIO=4&transport=websocket";
+   return `${uri}${this.#opts.path}${queryParams}`;
+ }
}
```

Reference: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

Some explanations about the `createUrl()` method:

- a WebSocket URL starts with `ws://` or `wss://`, so we handle this in the `replace()` call
- a Socket.IO URL always contains a specific request path, which defaults to `/socket.io/`
- there are two mandatory query parameters:
  - `EIO=4`: the version of the Engine.IO protocol
  - `transport=websocket`: the transport used

So the final URL will look like: `wss://example.com/socket.io/?EIO=4&transport=websocket`

## The Engine.IO protocol

The Socket.IO codebase is split into two distinct layers:

- the low-level plumbing: what we call Engine.IO, the engine inside Socket.IO
- the high-level API: Socket.IO itself

See also:

- [How it works](/docs/v4/how-it-works/)
- [The Engine.IO protocol](/docs/v4/engine-io-protocol)

When using WebSocket, the format of the messages sent over the wire is simply: `<packet type><payload>`

Here are the different packet types in the 4th version (hence the `EIO=4` above) of the protocol:

| Name    | Representation | Description                                      |
|---------|:--------------:|--------------------------------------------------|
| OPEN    |       0        | Used during the handshake.                       |
| CLOSE   |       1        | Used to indicate that a transport can be closed. |
| PING    |       2        | Used in the heartbeat mechanism.                 |
| PONG    |       3        | Used in the heartbeat mechanism.                 |
| MESSAGE |       4        | Used to send a payload to the other side.        |
| UPGRADE |       5        | Used during the upgrade process (not used here). |
| NOOP    |       6        | Used during the upgrade process (not used here). |

Example:

```
4hello

with:

4      => MESSAGE packet type
hello  => message payload (UTF-8 encoded)
```

Let's handle the WebSocket messages:

```diff
+const EIOPacketType = {
+  OPEN: "0",
+  CLOSE: "1",
+  PING: "2",
+  PONG: "3",
+  MESSAGE: "4",
+};

+function noop() {}

class Socket extends EventEmitter {
  [...]

  #open() {
    this.#ws = new WebSocket(this.#createUrl());
+   this.#ws.onmessage = ({ data }) => this.#onMessage(data);
+   this.#ws.onclose = () => this.#onClose("transport close");
  }

+ #onMessage(data) {
+   if (typeof data !== "string") {
+     // TODO handle binary payloads
+     return;
+   }
+
+   switch (data[0]) {
+     case EIOPacketType.CLOSE:
+       this.#onClose("transport close");
+       break;
+
+     default:
+       this.#onClose("parse error");
+       break;
+   }
+ }
+
+ #onClose(reason) {
+   if (this.#ws) {
+     this.#ws.onclose = noop;
+     this.#ws.close();
+   }
+ }
+}
```

### Heartbeat

A heartbeat mechanism is implemented to ensure that the connection between the server and the client is healthy.

The server sends two values during the initial handshake: `pingInterval` and `pingTimeout`

It will then send a PING packet every `pingInterval` ms, and expect a PONG packet back from the client. Let's do this:

```diff
class Socket extends EventEmitter {
+ #pingTimeoutTimer;
+ #pingTimeoutDelay;

  [...]

  #onMessage(data) {
    if (typeof data !== "string") {
      // TODO handle binary payloads
      return;
    }

    switch (data[0]) {
+     case EIOPacketType.OPEN:
+       this.#onOpen(data);
+       break;
+
      case EIOPacketType.CLOSE:
        this.#onClose("transport close");
        break;

+     case EIOPacketType.PING:
+       this.#resetPingTimeout();
+       this.#send(EIOPacketType.PONG);
+       break;

      default:
        this.#onClose("parse error");
        break;
    }
  }

+ #onOpen(data) {
+   let handshake;
+   try {
+     handshake = JSON.parse(data.substring(1));
+   } catch (e) {
+     return this.#onClose("parse error");
+   }
+   this.#pingTimeoutDelay = handshake.pingInterval + handshake.pingTimeout;
+   this.#resetPingTimeout();
+ }
+
+ #resetPingTimeout() {
+   clearTimeout(this.#pingTimeoutTimer);
+   this.#pingTimeoutTimer = setTimeout(() => {
+     this.#onClose("ping timeout");
+   }, this.#pingTimeoutDelay);
+ }
+
+ #send(data) {
+   if (this.#ws.readyState === WebSocket.OPEN) {
+     this.#ws.send(data);
+   }
+ }

  #onClose(reason) {
    if (this.#ws) {
      this.#ws.onclose = noop;
      this.#ws.close();
    }

+   clearTimeout(this.#pingTimeoutTimer);
  }
}
```

### Reconnection

While we're at it, we will also handle reconnections. WebSockets are awesome, but they can (and they will, in real-life conditions) get disconnected, so we must take care of that:

```diff
class Socket extends EventEmitter {
  [...]

  constructor(uri, opts) {
    super();
    this.#uri = uri;
    this.#opts = Object.assign(
      {
        path: "/socket.io/",
+       reconnectionDelay: 2000,
      },
      opts
    );
    this.#open();
  }

  #onClose(reason) {
    if (this.#ws) {
      this.#ws.onclose = noop;
      this.#ws.close();
    }

    clearTimeout(this.#pingTimeoutTimer);

+   setTimeout(() => this.#open(), this.#opts.reconnectionDelay);
  }
}
```

:::info

The official Socket.IO client uses a fancy exponential delay with some randomness in order to prevent spikes of load when a lot of clients reconnect at the same time, but we'll keep it simple here and use a constant value.

:::

OK, so let's sum up, we now have a client that can:

- open a WebSocket connection to the server
- honor the heartbeat mechanism by responding to PING packets
- automatically reconnect upon failure

That's it for the Engine.IO protocol! Let's dig into the Socket.IO protocol now.

## The Socket.IO protocol

The Socket.IO protocol is built on top of the Engine.IO protocol described [earlier](#the-engineio-protocol), which means that every Socket.IO packet will be prefixed by "4" (the Engine.IO MESSAGE packet type) when sent over the wire.

Reference: [the Socket.IO protocol](/docs/v4/socket-io-protocol)

Without binary elements, the format is the following:

```
<packet type>[JSON-stringified payload]
```

Here is the list of available packet types:

| Type          | ID  | Usage                                                                             |
|---------------|-----|-----------------------------------------------------------------------------------|
| CONNECT       | 0   | Used during the connection to a namespace.                                        |
| DISCONNECT    | 1   | Used when disconnecting from a namespace.                                         |
| EVENT         | 2   | Used to send data to the other side.                                              |
| ACK           | 3   | Used to acknowledge an event (not used here).                                     |
| CONNECT_ERROR | 4   | Used during the connection to a namespace (not used here).                        |
| BINARY_EVENT  | 5   | Used to send binary data to the other side (not used here).                       |
| BINARY_ACK    | 6   | Used to acknowledge an event (the response includes binary data) (not used here). |

Example:

```
2["hello","world"]

with:

2                   => EVENT packet type
["hello","world"]   => JSON.stringified() payload
```

### Connecting

The client must send a CONNECT packet at the beginning of the Socket.IO session:

```diff
+const SIOPacketType = {
+  CONNECT: 0,
+  DISCONNECT: 1,
+  EVENT: 2,
+};

class Socket extends EventEmitter {
  [...]

  #onOpen(data) {
    let handshake;
    try {
      handshake = JSON.parse(data.substring(1));
    } catch (e) {
      return this.#onClose("parse error");
    }
    this.#pingTimeoutDelay = handshake.pingInterval + handshake.pingTimeout;
    this.#resetPingTimeout();
+   this.#doConnect();
  }

+ #doConnect() {
+   this.#sendPacket({ type: SIOPacketType.CONNECT });
+ }
+
+ #sendPacket(packet) {
+   this.#send(EIOPacketType.MESSAGE + encode(packet));
+ }
}

+function encode(packet) {
+  let output = "" + packet.type;
+
+  return output;
+}
```

If the connection is allowed, then the server will send a CONNECT packet back:

```diff
class Socket extends EventEmitter {
+ id;

  [...]

  #onMessage(data) {
    switch (data[0]) {
      [...]

+     case EIOPacketType.MESSAGE:
+       let packet;
+       try {
+         packet = decode(data);
+       } catch (e) {
+         return this.#onClose("parse error");
+       }
+       this.#onPacket(packet);
+       break;
    }
  }

+ #onPacket(packet) {
+   switch (packet.type) {
+     case SIOPacketType.CONNECT:
+       this.#onConnect(packet);
+       break;
+   }
+ }

+ #onConnect(packet) {
+   this.id = packet.data.sid;
+
+   super.emit("connect");
+ }
}

+function decode(data) {
+  let i = 1; // skip "4" prefix
+
+  const packet = {
+    type: parseInt(data.charAt(i++), 10),
+  };
+
+  if (!isPacketValid(packet)) {
+    throw new Error("invalid format");
+  }
+
+  return packet;
+}
+
+function isPacketValid(packet) {
+  switch (packet.type) {
+    case SIOPacketType.CONNECT:
+      return typeof packet.data === "object";
+    default:
+      return false;
+  }
+}
```

:::note

We are using `super.emit(...)` so that we will be able to override the `emit()` method later to send an event.

:::

### Sending an event

Let's send some data to the server. We need to track the state of the underlying connection and buffer the packets until the connection is ready:

```diff
class Socket extends EventEmitter {
+ connected = false;

+ #sendBuffer = [];

  [...]

+ emit(...args) {
+   const packet = {
+     type: SIOPacketType.EVENT,
+     data: args,
+   };
+
+   if (this.connected) {
+     this.#sendPacket(packet);
+   } else {
+     this.#sendBuffer.push(packet);
+   }
+ }

  #onConnect(packet) {
    this.id = packet.data.sid;
+   this.connected = true;

+   this.#sendBuffer.forEach((packet) => this.#sendPacket(packet));
+   this.#sendBuffer.slice(0);

    super.emit("connect");
  }
}

function encode(packet) {
  let output = "" + packet.type;

+ if (packet.data) {
+   output += JSON.stringify(packet.data);
+ }

  return output;
}
```

### Receiving an event

Conversely, let's handle the EVENT packets sent by the server:

```diff
class Socket extends EventEmitter {
  [...]

  #onPacket(packet) {
    switch (packet.type) {
      case SIOPacketType.CONNECT:
        this.#onConnect(packet);
        break;

+     case SIOPacketType.EVENT:
+       super.emit.apply(this, packet.data);
+       break;
    }
  }
}

function decode(data) {
  let i = 1; // skip "4" prefix

  const packet = {
    type: parseInt(data.charAt(i++), 10),
  };

+ if (data.charAt(i)) {
+   packet.data = JSON.parse(data.substring(i));
+ }

  if (!isPacketValid(packet)) {
    throw new Error("invalid format");
  }

  return packet;
}

function isPacketValid(packet) {
  switch (packet.type) {
    case SIOPacketType.CONNECT:
      return typeof packet.data === "object";
+   case SIOPacketType.EVENT: {
+     const args = packet.data;
+     return (
+       Array.isArray(args) && args.length > 0 && typeof args[0] === "string"
+     );
+   }
    default:
      return false;
  }
}
```

### Disconnecting manually

And finally, let's handle the few cases where the socket shouldn't try to reconnect:

- when the client calls `socket.disconnect()`
- when the server calls `socket.disconnect()`

```diff
class Socket extends EventEmitter {
+ #reconnectTimer;
+ #shouldReconnect = true;

  [...]

  #onPacket(packet) {
    switch (packet.type) {
      case SIOPacketType.CONNECT:
        this.#onConnect(packet);
        break;

+     case SIOPacketType.DISCONNECT:
+       this.#shouldReconnect = false;
+       this.#onClose("io server disconnect");
+       break;

      case SIOPacketType.EVENT:
        super.emit.apply(this, packet.data);
        break;
    }
  }

  #onClose(reason) {
    if (this.#ws) {
      this.#ws.onclose = noop;
      this.#ws.close();
    }

    clearTimeout(this.#pingTimeoutTimer);
+   clearTimeout(this.#reconnectTimer);
+
+   if (this.#shouldReconnect) {
+     this.#reconnectTimer = setTimeout(
+       () => this.#open(),
+       this.#opts.reconnectionDelay
+     );
+   }
-   setTimeout(() => this.#open(), this.#opts.reconnectionDelay);
  }

+ disconnect() {
+   this.#shouldReconnect = false;
+   this.#onClose("io client disconnect");
+ }
}

function isPacketValid(packet) {
  switch (packet.type) {
    case SIOPacketType.CONNECT:
      return typeof packet.data === "object";
+   case SIOPacketType.DISCONNECT:
+     return packet.data === undefined;
    case SIOPacketType.EVENT: {
      const args = packet.data;
      return (
        Array.isArray(args) && args.length > 0 && typeof args[0] === "string"
      );
    }
    default:
      return false;
  }
}
```

## Ending notes

That's it for our basic Socket.IO client! So let's recap.

We have implemented the following features:

- creating a WebSocket connection
- managing reconnections
- sending events
- receiving events
- disconnecting manually

Hopefully, you now have a better understanding of how the library works under the hood.

The complete source code can be found [there](https://github.com/socketio/socket.io/tree/main/examples/basic-websocket-client).

Thanks for reading!
