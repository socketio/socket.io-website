---
title: Client API
sidebar_label: API
sidebar_position: 1
slug: /client-api/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## IO

Exposed as the `io` namespace in the standalone build, or the result of calling `require("socket.io-client")`.

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io("http://localhost");
</script>
```

```js
const io = require("socket.io-client");
// or with import syntax
import { io } from "socket.io-client";
```

### io.protocol

  * _(Number)_

The protocol revision number (currently: 5).

The protocol defines the format of the packets exchanged between the client and the server. Both the client and the server must use the same revision in order to understand each other.

You can find more information [here](https://github.com/socketio/socket.io-protocol).

### io([url][, options])

  - `url` _(String)_ (defaults to `window.location`)
  - `options` _(Object)_
    - `forceNew` _(Boolean)_ whether to reuse an existing connection
  - **Returns** `Socket`

Creates a new `Manager` for the given URL, and attempts to reuse an existing `Manager` for subsequent calls, unless the `multiplex` option is passed with `false`. Passing this option is the equivalent of passing `"force new connection": true` or `forceNew: true`.

A new `Socket` instance is returned for the namespace specified by the pathname in the URL, defaulting to `/`. For example, if the `url` is `http://localhost/users`, a transport connection will be established to `http://localhost` and a Socket.IO connection will be established to `/users`.

Query parameters can also be provided, either with the `query` option or directly in the url (example: `http://localhost/users?token=abc`).

```js
const io = require("socket.io-client");

const socket = io("ws://example.com/my-namespace", {
  reconnectionDelayMax: 10000,
  auth: {
    token: "123"
  },
  query: {
    "my-key": "my-value"
  }
});
```

is the short version of:

```js
const { Manager } = require("socket.io-client");

const manager = new Manager("ws://example.com", {
  reconnectionDelayMax: 10000,
  query: {
    "my-key": "my-value"
  }
});

const socket = manager.socket("/my-namespace", {
  auth: {
    token: "123"
  }
});
```

The complete list of available options can be found [here](client-options.md).

Please note: `manager.socket("/my-namespace", options )` will only read the `auth` key in the `options` object.
`query: {…}` and other optional values are only used when passed via a `new Manager(uri, options)` instance.

See [Migrating from 2.x to 3.0](categories/07-Migrations/migrating-from-2-to-3.md#add-a-clear-distinction-between-the-manager-query-option-and-the-socket-query-option) for more on the difference between the `auth` and `query` options.

## Manager

The `Manager` *manages* the Engine.IO [client](https://github.com/socketio/engine.io-client/) instance, which is the low-level engine that establishes the connection to the server (by using transports like WebSocket or HTTP long-polling).

The `Manager` handles the reconnection logic.

A single `Manager` can be used by several [Sockets](#socket). You can find more information about this multiplexing feature [here](categories/06-Advanced/namespaces.md).

Please note that, in most cases, you won't use the Manager directly but use the [Socket](#socket) instance instead.

### new Manager(url[, options])

  - `url` _(String)_
  - `options` _(Object)_
  - **Returns** `Manager`

The complete list of available options can be found [here](client-options.md).

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Manager } = require("socket.io-client");

const manager = new Manager("https://example.com");

const socket = manager.socket("/"); // main namespace
const adminSocket = manager.socket("/admin"); // admin namespace
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com");

const socket = manager.socket("/"); // main namespace
const adminSocket = manager.socket("/admin"); // admin namespace
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com");

const socket = manager.socket("/"); // main namespace
const adminSocket = manager.socket("/admin"); // admin namespace
```

  </TabItem>
</Tabs>

### manager.reconnection([value])

  - `value` _(Boolean)_
  - **Returns** `Manager|Boolean`

Sets the `reconnection` option, or returns it if no parameters are passed.

### manager.reconnectionAttempts([value])

  - `value` _(Number)_
  - **Returns** `Manager|Number`

Sets the `reconnectionAttempts` option, or returns it if no parameters are passed.

### manager.reconnectionDelay([value])

  - `value` _(Number)_
  - **Returns** `Manager|Number`

Sets the `reconnectionDelay` option, or returns it if no parameters are passed.

### manager.reconnectionDelayMax([value])

  - `value` _(Number)_
  - **Returns** `Manager|Number`

Sets the `reconnectionDelayMax` option, or returns it if no parameters are passed.

### manager.timeout([value])

  - `value` _(Number)_
  - **Returns** `Manager|Number`

Sets the `timeout` option, or returns it if no parameters are passed.

### manager.open([callback])

  - `callback` _(Function)_
  - **Returns** `Manager`

If the manager was initiated with `autoConnect` to `false`, launch a new connection attempt.

The `callback` argument is optional and will be called once the attempt fails/succeeds.

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Manager } = require("socket.io-client");

const manager = new Manager("https://example.com", {
  autoConnect: false
});

const socket = manager.socket("/");

manager.open((err) => {
  if (err) {
    // an error has occurred
  } else {
    // the connection was successfully established
  }
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com", {
  autoConnect: false
});

const socket = manager.socket("/");

manager.open((err) => {
  if (err) {
    // an error has occurred
  } else {
    // the connection was successfully established
  }
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com", {
  autoConnect: false
});

const socket = manager.socket("/");

manager.open((err) => {
  if (err) {
    // an error has occurred
  } else {
    // the connection was successfully established
  }
});
```

  </TabItem>
</Tabs>

### manager.connect([callback])

Synonym of [manager.open([callback])](#manageropencallback).

### manager.socket(nsp, options)

  - `nsp` _(String)_
  - `options` _(Object)_
  - **Returns** `Socket`

Creates a new `Socket` for the given namespace. Only `auth` (`{ auth: {key: "value"} }`) is read from the `options` object. Other keys will be ignored and should be passed when instancing a `new Manager(nsp, options)`.

### Event: 'error'

  - `error` _(Object)_ error object

Fired upon a connection error.

```js
socket.io.on("error", (error) => {
  // ...
});
```

### Event: 'reconnect'

  - `attempt` _(Number)_ reconnection attempt number

Fired upon a successful reconnection.

```js
socket.io.on("reconnect", (attempt) => {
  // ...
});
```

### Event: 'reconnect_attempt'

  - `attempt` _(Number)_ reconnection attempt number

Fired upon an attempt to reconnect.

```js
socket.io.on("reconnect_attempt", (attempt) => {
  // ...
});
```

### Event: 'reconnect_error'

  - `error` _(Object)_ error object

Fired upon a reconnection attempt error.

```js
socket.io.on("reconnect_error", (error) => {
  // ...
});
```

### Event: 'reconnect_failed'

Fired when couldn't reconnect within `reconnectionAttempts`.

```js
socket.io.on("reconnect_failed", () => {
  // ...
});
```

### Event: 'ping'

Fired when a ping packet is received from the server.

```js
socket.io.on("ping", () => {
  // ...
});
```

## Socket

A `Socket` is the fundamental class for interacting with the server. A `Socket` belongs to a certain [Namespace](categories/06-Advanced/namespaces.md) (by default `/`) and uses an underlying [Manager](#manager) to communicate.

A `Socket` is basically an [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) which sends events to — and receive events from — the server over the network.

```js
socket.emit("hello", { a: "b", c: [] });

socket.on("hey", (...args) => {
  // ...
});
```

More information can be found [here](categories/03-Client/client-socket-instance.md).

### socket.id

  - _(String)_

An unique identifier for the socket session. Set after the `connect` event is triggered, and updated after the `reconnect` event.

```js
const socket = io("http://localhost");

console.log(socket.id); // undefined

socket.on("connect", () => {
  console.log(socket.id); // "G5p5..."
});
```

### socket.connected

  - _(Boolean)_

Whether or not the socket is connected to the server.

```js
const socket = io("http://localhost");

socket.on("connect", () => {
  console.log(socket.connected); // true
});
```

### socket.disconnected

  - _(Boolean)_

Whether or not the socket is disconnected from the server.

```js
const socket = io("http://localhost");

socket.on("connect", () => {
  console.log(socket.disconnected); // false
});
```

### socket.io

  - [Manager](#manager)

A reference to the underlying [Manager](#manager).

```js
socket.on("connect", () => {
  const engine = socket.io.engine;
  console.log(engine.transport.name); // in most cases, prints "polling"

  engine.once("upgrade", () => {
    // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    console.log(engine.transport.name); // in most cases, prints "websocket"
  });

  engine.on("packet", ({ type, data }) => {
    // called for each packet received
  });

  engine.on("packetCreate", ({ type, data }) => {
    // called for each packet sent
  });

  engine.on("drain", () => {
    // called when the write buffer is drained
  });

  engine.on("close", (reason) => {
    // called when the underlying connection is closed
  });
});
```

### socket.connect()

*Added in v1.0.0*

  - **Returns** `Socket`

Manually connects the socket.

```js
const socket = io({
  autoConnect: false
});

// ...
socket.connect();
```

It can also be used to manually reconnect:

```js
socket.on("disconnect", () => {
  socket.connect();
});
```

### socket.open()

*Added in v1.0.0*

Synonym of [socket.connect()](#socketconnect).

### socket.send([...args][, ack])

  - `args`
  - `ack` _(Function)_
  - **Returns** `Socket`

Sends a `message` event. See [socket.emit(eventName[, ...args][, ack])](#socketemiteventname-args-ack).

### socket.emit(eventName[, ...args][, ack])

  - `eventName` _(String)_
  - `args`
  - `ack` _(Function)_
  - **Returns** `true`

Emits an event to the socket identified by the string name. Any other parameters can be included. All serializable datastructures are supported, including `Buffer`.

```js
socket.emit("hello", "world");
socket.emit("with-binary", 1, "2", { 3: "4", 5: Buffer.from([6, 7, 8]) });
```

The `ack` argument is optional and will be called with the server answer.

```js
socket.emit("ferret", "tobi", (data) => {
  console.log(data); // data will be "woot"
});

// server:
//  io.on("connection", (socket) => {
//    socket.on("ferret", (name, fn) => {
//      fn("woot");
//    });
//  });
```

### socket.on(eventName, callback)

  - `eventName` _(String)_
  - `callback` _(Function)_
  - **Returns** `Socket`

Register a new handler for the given event.

```js
socket.on("news", (data) => {
  console.log(data);
});

// with multiple arguments
socket.on("news", (arg1, arg2, arg3, arg4) => {
  // ...
});
// with callback
socket.on("news", (cb) => {
  cb(0);
});
```

The socket actually inherits every method of the [Emitter](https://github.com/component/emitter) class, like `hasListeners`, `once` or `off` (to remove an event listener).

### socket.onAny(callback)

  - `callback` _(Function)_

Register a new catch-all listener.

```js
socket.onAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.prependAny(callback)

  - `callback` _(Function)_

Register a new catch-all listener. The listener is added to the beginning of the listeners array.

```js
socket.prependAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.offAny([listener])

  - `listener` _(Function)_

Removes the previously registered listener. If no listener is provided, all catch-all listeners are removed. 

```js
const myListener = () => { /* ... */ };

socket.onAny(myListener);

// then, later
socket.offAny(myListener);

socket.offAny();
```

### socket.listenersAny()

  - **Returns** `Function[]`

Returns the list of registered catch-all listeners.

```js
const listeners = socket.listenersAny();
```

### socket.compress(value)

  - `value` _(Boolean)_
  - **Returns** `Socket`

Sets a modifier for a subsequent event emission that the event data will only be _compressed_ if the value is `true`. Defaults to `true` when you don't call the method.

```js
socket.compress(false).emit("an event", { some: "data" });
```

### socket.timeout(value)

*Added in v4.4.0*

- `value` _(Integer)_
- **Returns** `Socket`

Sets a modifier for a subsequent event emission that the callback will be called with an error when the
given number of milliseconds have elapsed without an acknowledgement from the server:

```js
socket.timeout(5000).emit("my-event", (err) => {
  if (err) {
    // the server did not acknowledge the event in the given delay
  }
});
```

### socket.disconnect()

*Added in v1.0.0*

  - **Returns** `Socket`

Manually disconnects the socket. In that case, the socket will not try to reconnect.

Associated disconnection reason:

- client-side: `"io client disconnect"`
- server-side: `"client namespace disconnect"`

If this is the last active Socket instance of the Manager, the low-level connection will be closed.

### socket.close()

*Added in v1.0.0*

Synonym of [socket.disconnect()](#socketdisconnect).

### Flag: 'volatile'

*Added in v3.0.0*

Sets a modifier for the subsequent event emission indicating that the packet may be dropped if:

- the socket is not connected
- the low-level transport is not writable (for example, when a `POST` request is already running in HTTP long-polling mode)

```js
socket.volatile.emit(/* ... */); // the server may or may not receive it
```

### Event: 'connect'

Fired upon connection to the Namespace (including a successful reconnection).

```js
socket.on("connect", () => {
  // ...
});

// note: you should register event handlers outside of connect,
// so they are not registered again on reconnection
socket.on("myevent", () => {
  // ...
});
```

### Event: 'disconnect'

  - `reason` _(String)_

Fired upon disconnection. The list of possible disconnection reasons:

Reason | Description
------ | -----------
`io server disconnect` | The server has forcefully disconnected the socket with [socket.disconnect()](server-api.md#socketdisconnectclose)
`io client disconnect` | The socket was manually disconnected using [socket.disconnect()](client-api.md#socketdisconnect)
`ping timeout` | The server did not send a PING within the `pingInterval + pingTimeout` range
`transport close` | The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)
`transport error` | The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)

In the first two cases (explicit disconnection), the client will not try to reconnect and you need to manually call `socket.connect()`.

In all other cases, the client will wait for a small [random delay](client-options.md#reconnectiondelay) and then try to reconnect:

```js
socket.on("disconnect", (reason) => {
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
});
```

### Event: 'connect_error'

  - `connect_error` _(Object)_ error object

Fired when an namespace middleware error occurs.

```js
socket.on("connect_error", (error) => {
  // ...
});
```
