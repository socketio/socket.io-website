---
title: Client API
sidebar_label: API
sidebar_position: 1
slug: /client-api/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## IO

The `io` method is bound to the global scope in the standalone build:

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

An ESM bundle is also available since version [4.3.0](/blog/socket-io-4-3-0/):

```html
<script type="module">
  import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

  const socket = io();
</script>
```

With an [import map](https://caniuse.com/import-maps):

```html
<script type="importmap">
  {
    "imports": {
      "socket.io-client": "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"
    }
  }
</script>

<script type="module">
  import { io } from "socket.io-client";

  const socket = io();
</script>
```

Else, in all other cases (with some build tools, in Node.js or React Native), it can be imported from the `socket.io-client` package:

```js
// ES modules
import { io } from "socket.io-client";

// CommonJS
const { io } = require("socket.io-client");
```

### io.protocol

  * [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

The protocol revision number (currently: 5).

The protocol defines the format of the packets exchanged between the client and the server. Both the client and the server must use the same revision in order to understand each other.

You can find more information [here](https://github.com/socketio/socket.io-protocol).

### io([url][, options])

  - `url` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) (defaults to `window.location`)
  - `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
    - `forceNew` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) whether to create a new connection
  - **Returns** [`<Socket>`](#socket)

Creates a new `Manager` for the given URL, and attempts to reuse an existing `Manager` for subsequent calls, unless the `multiplex` option is passed with `false`. Passing this option is the equivalent of passing `"force new connection": true` or `forceNew: true`.

A new `Socket` instance is returned for the namespace specified by the pathname in the URL, defaulting to `/`. For example, if the `url` is `http://localhost/users`, a transport connection will be established to `http://localhost` and a Socket.IO connection will be established to `/users`.

Query parameters can also be provided, either with the `query` option or directly in the url (example: `http://localhost/users?token=abc`).

To understand what happens under the hood, the following example:

```js
import { io } from "socket.io-client";

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
import { Manager } from "socket.io-client";

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

## Manager

<ThemedImage
  alt="Manager in the class diagram for the client"
  sources={{
    light: useBaseUrl('/images/client-class-diagram-manager.png'),
    dark: useBaseUrl('/images/client-class-diagram-manager-dark.png'),
  }}
/>

The `Manager` *manages* the Engine.IO [client](https://github.com/socketio/engine.io-client/) instance, which is the low-level engine that establishes the connection to the server (by using transports like WebSocket or HTTP long-polling).

The `Manager` handles the reconnection logic.

A single `Manager` can be used by several [Sockets](#socket). You can find more information about this multiplexing feature [here](categories/06-Advanced/namespaces.md).

Please note that, in most cases, you won't use the Manager directly but use the [Socket](#socket) instance instead.

### new Manager(url[, options])

  - `url` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - **Returns** [`<Manager>`](#manager)

The complete list of available options can be found [here](client-options.md).

```js
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com");

const socket = manager.socket("/"); // main namespace
const adminSocket = manager.socket("/admin"); // admin namespace
```

### manager.reconnection([value])

  - `value` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)
  - **Returns** [`<Manager>`](#manager) | [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

Sets the `reconnection` option, or returns it if no parameters are passed.

### manager.reconnectionAttempts([value])

  - `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
  - **Returns** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

Sets the `reconnectionAttempts` option, or returns it if no parameters are passed.

### manager.reconnectionDelay([value])

  - `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
  - **Returns** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

Sets the `reconnectionDelay` option, or returns it if no parameters are passed.

### manager.reconnectionDelayMax([value])

  - `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
  - **Returns** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

Sets the `reconnectionDelayMax` option, or returns it if no parameters are passed.

### manager.timeout([value])

  - `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
  - **Returns** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

Sets the `timeout` option, or returns it if no parameters are passed.

### manager.open([callback])

  - `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Returns** [`<Manager>`](#manager)

If the manager was initiated with `autoConnect` to `false`, launch a new connection attempt.

The `callback` argument is optional and will be called once the attempt fails/succeeds.

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

### manager.connect([callback])

Synonym of [manager.open([callback])](#manageropencallback).

### manager.socket(nsp, options)

  - `nsp` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - **Returns** [`<Socket>`](#socket)

Creates a new `Socket` for the given namespace. Only `auth` (`{ auth: {key: "value"} }`) is read from the `options` object. Other keys will be ignored and should be passed when instancing a `new Manager(nsp, options)`.

### Event: 'error'

  - `error` [`<Error>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) error object

Fired upon a connection error.

```js
socket.io.on("error", (error) => {
  // ...
});
```

### Event: 'reconnect'

  - `attempt` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type) reconnection attempt number

Fired upon a successful reconnection.

```js
socket.io.on("reconnect", (attempt) => {
  // ...
});
```

### Event: 'reconnect_attempt'

  - `attempt` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type) reconnection attempt number

Fired upon an attempt to reconnect.

```js
socket.io.on("reconnect_attempt", (attempt) => {
  // ...
});
```

### Event: 'reconnect_error'

  - `error` [`<Error>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) error object

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

<ThemedImage
  alt="Socket in the class diagram for the client"
  sources={{
    light: useBaseUrl('/images/client-class-diagram-socket.png'),
    dark: useBaseUrl('/images/client-class-diagram-socket-dark.png'),
  }}
/>

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

  - [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)

An unique identifier for the socket session. Set after the `connect` event is triggered, and updated after the `reconnect` event.

```js
const socket = io("http://localhost");

console.log(socket.id); // undefined

socket.on("connect", () => {
  console.log(socket.id); // "G5p5..."
});
```

### socket.connected

  - [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

Whether or not the socket is connected to the server.

```js
const socket = io("http://localhost");

socket.on("connect", () => {
  console.log(socket.connected); // true
});
```

### socket.disconnected

  - [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

Whether or not the socket is disconnected from the server.

```js
const socket = io("http://localhost");

socket.on("connect", () => {
  console.log(socket.disconnected); // false
});
```

### socket.io

  - [`<Manager>`](#manager)

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

  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Returns** [`<Socket>`](#socket)

Sends a `message` event. See [socket.emit(eventName[, ...args][, ack])](#socketemiteventname-args).

### socket.emit(eventName[, ...args][, ack])

  - `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Returns** `true`

Emits an event to the socket identified by the string name. Any other parameters can be included. All serializable datastructures are supported, including `Buffer`.

```js
socket.emit("hello", "world");
socket.emit("with-binary", 1, "2", { 3: "4", 5: Buffer.from([6, 7, 8]) });
```

The `ack` argument is optional and will be called with the server answer.

*Client*

```js
socket.emit("hello", "world", (response) => {
  console.log(response); // "got it"
});
```

*Server*

```js
io.on("connection", (socket) => {
  socket.on("hello", (arg, callback) => {
    console.log(arg); // "world"
    callback("got it");
  });
});
```

### socket.on(eventName, callback)

*Inherited from the [EventEmitter class](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **Returns** [`<Socket>`](#socket)

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

### socket.once(eventName, callback)

*Inherited from the [EventEmitter class](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **Returns** [`<Socket>`](#socket)

Adds a one-time `listener` function for the event named `eventName`. The next time `eventName` is triggered, this listener is removed and then invoked.

```js
socket.once("my-event", () => {
  // ...
});
```

### socket.off([eventName][, listener])

*Inherited from the [EventEmitter class](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **Returns** [`<Socket>`](#socket)

Removes the specified `listener` from the listener array for the event named `eventName`.

```js
const myListener = () => {
  // ...
}

socket.on("my-event", myListener);

// then later
socket.off("my-event", myListener);
```

The `listener` argument can also be omitted:

```js
// remove all listeners for that event
socket.off("my-event");

// remove all listeners for all events
socket.off();
```

### socket.listeners(eventName)

*Inherited from the [EventEmitter class](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- **Returns** [`<Function[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Returns the array of listeners for the event named `eventName`.

```js
socket.on("my-event", () => {
  // ...
});

console.log(socket.listeners("my-event")); // prints [ [Function] ]
```

### socket.onAny(callback)

*Added in v3.0.0*

  - `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Register a new catch-all listener.

```js
socket.onAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.prependAny(callback)

*Added in v3.0.0*

  - `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Register a new catch-all listener. The listener is added to the beginning of the listeners array.

```js
socket.prependAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.offAny([listener])

*Added in v3.0.0*

  - `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Removes the previously registered listener. If no listener is provided, all catch-all listeners are removed. 

```js
const myListener = () => { /* ... */ };

socket.onAny(myListener);

// then, later
socket.offAny(myListener);

socket.offAny();
```

### socket.listenersAny()

*Added in v3.0.0*

  - **Returns** [`<Function[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Returns the list of registered catch-all listeners.

```js
const listeners = socket.listenersAny();
```

### socket.onAnyOutgoing(callback)

*Added in v4.5.0*

- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Register a new catch-all listener for outgoing packets.

```js
socket.onAnyOutgoing((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.prependAnyOutgoing(callback)

*Added in v4.5.0*

- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Register a new catch-all listener for outgoing packets. The listener is added to the beginning of the listeners array.

```js
socket.prependAnyOutgoing((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.offAnyOutgoing([listener])

*Added in v4.5.0*

- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Removes the previously registered listener. If no listener is provided, all catch-all listeners are removed.

```js
const myListener = () => { /* ... */ };

socket.onAnyOutgoing(myListener);

// remove a single listener
socket.offAnyOutgoing(myListener);

// remove all listeners
socket.offAnyOutgoing();
```

### socket.listenersAnyOutgoing()

*Added in v4.5.0*

- **Returns** [`<Function[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Returns the list of registered catch-all listeners for outgoing packets.

```js
const listeners = socket.listenersAnyOutgoing();
```

### socket.compress(value)

  - `value` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)
  - **Returns** [`<Socket>`](#socket)

Sets a modifier for a subsequent event emission that the event data will only be _compressed_ if the value is `true`. Defaults to `true` when you don't call the method.

```js
socket.compress(false).emit("an event", { some: "data" });
```

### socket.timeout(value)

*Added in v4.4.0*

- `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
- **Returns** [`<Socket>`](#socket)

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

  - **Returns** [`<Socket>`](#socket)

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
```

:::caution

Please note that you shouldn't register event handlers in the `connect` handler itself, as a new handler will be registered every time the Socket reconnects:

```js
// BAD
socket.on("connect", () => {
  socket.on("data", () => { /* ... */ });
});

// GOOD
socket.on("connect", () => { /* ... */ });
socket.on("data", () => { /* ... */ });
```

:::

### Event: 'disconnect'

  - `reason` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - `details` `<DisconnectDetails>`

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

  - `connect_error` [`<Error>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) error object

Fired when a namespace middleware error occurs.

```js
socket.on("connect_error", (error) => {
  // ...
});
```
