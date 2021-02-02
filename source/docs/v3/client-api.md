title: Client API
permalink: /docs/v3/client-api/
alias: /docs/client-api/
release: v3
type: api
---

<div class="tip warning">
  You're browsing the documentation for v3.x. For v2.x, click <a href="/docs/v2/client-api/">here</a>.
</div>

## IO

Exposed as the `io` namespace in the standalone build, or the result of calling `require('socket.io-client')`.

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io('http://localhost');
</script>
```

```js
const io = require('socket.io-client');
// or with import syntax
import { io } from 'socket.io-client';
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

Creates a new `Manager` for the given URL, and attempts to reuse an existing `Manager` for subsequent calls, unless the `multiplex` option is passed with `false`. Passing this option is the equivalent of passing `'force new connection': true` or `forceNew: true`.

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

See [new Manager(url[, options])](#new-Manager-url-options) for the list of available `options`.

Please note: `manager.socket("/my-namespace", options )` will only read the `auth` key in the `options` object.
`query: {…}` and other optional values are only used when passed via a `new Manager(uri, options)` instance.

See [Migrating from 2.x to 3.0](/docs/v3/migrating-from-2-x-to-3-0/#Add-a-clear-distinction-between-the-Manager-query-option-and-the-Socket-query-option) for more on the difference between the `auth` and `query` options.

## Manager

The `Manager` *manages* the Engine.IO [client](https://github.com/socketio/engine.io-client/) instance, which is the low-level engine that establishes the connection to the server (by using transports like WebSocket or HTTP long-polling).

The `Manager` handles the reconnection logic.

A single `Manager` can be used by several [Sockets](#Socket). You can find more information about this multiplexing feature [here](/docs/v3/namespaces/).

Please note that, in most cases, you won't use the Manager directly but use the [Socket](#Socket) instance instead.

### new Manager(url[, options])

  - `url` _(String)_
  - `options` _(Object)_
  - **Returns** `Manager`

Available options:

Option | Default value | Description
------ | ------------- | -----------
`path` | `/socket.io` | name of the path that is captured on the server side
`reconnection` | `true` | whether to reconnect automatically
`reconnectionAttempts` | `Infinity` | number of reconnection attempts before giving up
`reconnectionDelay` | `1000` | how long to initially wait before attempting a new reconnection. Affected by +/- `randomizationFactor`, for example the default initial delay will be between 500 to 1500ms.
`reconnectionDelayMax` | `5000` | maximum amount of time to wait between reconnections. Each attempt increases the reconnection delay by 2x along with a randomization factor.
`randomizationFactor` | `0.5` | 0 <= randomizationFactor <= 1
`timeout` | `20000` | connection timeout before an `error` event is emitted
`autoConnect` | `true` | by setting this false, you have to call `manager.open` whenever you decide it's appropriate
`query` | `{}` | additional query parameters that are sent when connecting a namespace (then found in `socket.handshake.query` object on the server-side)
`parser` | - | the parser to use. Defaults to an instance of the `Parser` that ships with socket.io. See [socket.io-parser](https://github.com/socketio/socket.io-parser).

Available options for the underlying Engine.IO client:

Option | Default value | Description
------ | ------------- | -----------
`upgrade` | `true` | whether the client should try to upgrade the transport from long-polling to something better.
`forceJSONP` | `false` | forces JSONP for polling transport.
`jsonp` | `true` | determines whether to use JSONP when necessary for polling. If disabled (by settings to false) an error will be emitted (saying "No transports available") if no other transports are available. If another transport is available for opening a connection (e.g. WebSocket) that transport will be used instead.
`forceBase64` | `false` | forces base 64 encoding for polling transport even when XHR2 responseType is available and WebSocket even if the used standard supports binary.
`enablesXDR` | `false` | enables XDomainRequest for IE8 to avoid loading bar flashing with click sound. default to `false` because XDomainRequest has a flaw of not sending cookie. |
`timestampRequests` | - | whether to add the timestamp with each transport request. Note: polling requests are always stamped unless this option is explicitly set to `false`
`timestampParam` | `t` | the timestamp parameter
`transports` | `['polling', 'websocket']` | a list of transports to try (in order). `Engine` always attempts to connect directly with the first one, provided the feature detection test for it passes.
`transportOptions` | `{}` | hash of options, indexed by transport name, overriding the common options for the given transport
`rememberUpgrade` | `false` | If true and if the previous websocket connection to the server succeeded, the connection attempt will bypass the normal upgrade process and will initially try websocket. A connection attempt following a transport error will use the normal upgrade process. It is recommended you turn this on only when using SSL/TLS connections, or if you know that your network does not block websockets.
`onlyBinaryUpgrades` | `false` | whether transport upgrades should be restricted to transports supporting binary data
`requestTimeout` | `0` | timeout for xhr-polling requests in milliseconds (`0`) (*only for polling transport*)
`protocols` | - | a list of subprotocols (see [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#Subprotocols)) (*only for websocket transport*)

Node.js-only options for the underlying Engine.IO client:

Option | Default value | Description
------ | ------------- | -----------
`agent` | `false ` | the `http.Agent` to use
`pfx` | - | Certificate, Private key and CA certificates to use for SSL.
`key` | - | Private key to use for SSL.
`passphrase` | - | A string of passphrase for the private key or pfx.
`cert` | - | Public x509 certificate to use.
`ca` | - | An authority certificate or array of authority certificates to check the remote host against.
`ciphers` | - | A string describing the ciphers to use or exclude. Consult the [cipher format list](http://www.openssl.org/docs/apps/ciphers.html#CIPHER_LIST_FORMAT) for details on the format.
`rejectUnauthorized` | `true` | If true, the server certificate is verified against the list of supplied CAs. An 'error' event is emitted if verification fails. Verification happens at the connection level, before the HTTP request is sent.
`perMessageDeflate` | `true` | parameters of the WebSocket permessage-deflate extension (see [ws module](https://github.com/einaros/ws) api docs). Set to `false` to disable.
`extraHeaders` | `{}` | Headers that will be passed for each request to the server (via xhr-polling and via websockets). These values then can be used during handshake or for special proxies.
`forceNode` | `false` | Uses NodeJS implementation for websockets - even if there is a native Browser-Websocket available, which is preferred by default over the NodeJS implementation. (This is useful when using hybrid platforms like nw.js or electron)
`localAddress` | - | the local IP address to connect to


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

### Event: 'reconnect'

  - `attempt` _(Number)_ reconnection attempt number

Fired upon a successful reconnection.

### Event: 'reconnect_attempt'

  - `attempt` _(Number)_ reconnection attempt number

Fired upon an attempt to reconnect.

### Event: 'reconnect_error'

  - `error` _(Object)_ error object

Fired upon a reconnection attempt error.

### Event: 'reconnect_failed'

Fired when couldn't reconnect within `reconnectionAttempts`.

### Event: 'ping'

Fired when a ping packet is received from the server.

## Socket

A `Socket` is the fundamental class for interacting with the server. A `Socket` belongs to a certain [Namespace](/docs/v3/namespaces) (by default `/`) and uses an underlying [Manager](#Manager) to communicate.

A `Socket` is basically an [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) which sends events to — and receive events from — the server over the network.

```js
socket.emit('hello', { a: 'b', c: [] });

socket.on('hey', (...args) => {
  // ...
});
```

### socket.id

  - _(String)_

An unique identifier for the socket session. Set after the `connect` event is triggered, and updated after the `reconnect` event.

```js
const socket = io('http://localhost');

console.log(socket.id); // undefined

socket.on('connect', () => {
  console.log(socket.id); // 'G5p5...'
});
```

### socket.connected

  - _(Boolean)_

Whether or not the socket is connected to the server.

```js
const socket = io('http://localhost');

socket.on('connect', () => {
  console.log(socket.connected); // true
});
```

### socket.disconnected

  - _(Boolean)_

Whether or not the socket is disconnected from the server.

```js
const socket = io('http://localhost');

socket.on('connect', () => {
  console.log(socket.disconnected); // false
});
```

### socket.open()

  - **Returns** `Socket`

Manually opens the socket.

```js
const socket = io({
  autoConnect: false
});

// ...
socket.open();
```

It can also be used to manually reconnect:

```js
socket.on('disconnect', () => {
  socket.open();
});
```

### socket.connect()

Synonym of [socket.open()](#socketopen).

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
socket.emit('hello', 'world');
socket.emit('with-binary', 1, '2', { 3: '4', 5: Buffer.from([6, 7, 8]) });
```

The `ack` argument is optional and will be called with the server answer.

```js
socket.emit('ferret', 'tobi', (data) => {
  console.log(data); // data will be 'woot'
});

// server:
//  io.on('connection', (socket) => {
//    socket.on('ferret', (name, fn) => {
//      fn('woot');
//    });
//  });
```

### socket.on(eventName, callback)

  - `eventName` _(String)_
  - `callback` _(Function)_
  - **Returns** `Socket`

Register a new handler for the given event.

```js
socket.on('news', (data) => {
  console.log(data);
});

// with multiple arguments
socket.on('news', (arg1, arg2, arg3, arg4) => {
  // ...
});
// with callback
socket.on('news', (cb) => {
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
socket.compress(false).emit('an event', { some: 'data' });
```

### socket.close()

  - **Returns** `Socket`

Disconnects the socket manually.

### socket.disconnect()

Synonym of [socket.close()](#socketclose).

### Event: 'connect'

Fired upon connection to the Namespace (including a successful reconnection).

```js
socket.on('connect', () => {
  // ...
});

// note: you should register event handlers outside of connect,
// so they are not registered again on reconnection
socket.on('myevent', () => {
  // ...
});
```

### Event: 'disconnect'

  - `reason` _(String)_

Fired upon disconnection. The list of possible disconnection reasons:

Reason | Description
------ | -----------
`io server disconnect` | The server has forcefully disconnected the socket with [socket.disconnect()](/docs/v3/server-api/#socket-disconnect-close)
`io client disconnect` | The socket was manually disconnected using [socket.disconnect()](/docs/v3/client-api/#socket-disconnect)
`ping timeout` | The server did not respond in the `pingTimeout` range
`transport close` | The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)
`transport error` | The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)

In all cases but the first (disconnection by the server), the client will wait for a small random delay and then reconnect.

```js
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
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
socket.on('connect_error', (error) => {
  // ...
});
```
