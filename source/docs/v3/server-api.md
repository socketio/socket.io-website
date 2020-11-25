title: Server API
permalink: /docs/v3/server-api/
alias: /docs/server-api/
release: v3
type: api
---

<div class="tip warning">
  You're browsing the documentation for v3.x. For v2.x, click <a href="/docs/v2/server-api/">here</a>.
</div>

## Server

Exposed by `require('socket.io')`.

### new Server(httpServer[, options])

  - `httpServer` _(http.Server)_ the server to bind to.
  - `options` _(Object)_

Works with and without `new`:

```js
const io = require('socket.io')();
// or
const { Server } = require('socket.io');
const io = new Server();
```

Available options:

Option | Default value | Description
------ | ------------- | -----------
`path` | `/socket.io` | name of the path to capture
`serveClient` | `true` | whether to serve the client files
`adapter` | - | the adapter to use. Defaults to an instance of the `Adapter` that ships with socket.io which is memory based. See [socket.io-adapter](https://github.com/socketio/socket.io-adapter)
`parser` | - | the parser to use. Defaults to an instance of the `Parser` that ships with socket.io. See [socket.io-parser](https://github.com/socketio/socket.io-parser).

Available options for the underlying Engine.IO server:

Option | Default value | Description
------ | ------------- | -----------
`pingTimeout` | `5000` | how many ms without a pong packet to consider the connection closed
`pingInterval` | `25000` | how many ms before sending a new ping packet
`upgradeTimeout` | `10000` | how many ms before an uncompleted transport upgrade is cancelled
`maxHttpBufferSize` | `1e6` | how many bytes or characters a message can be, before closing the session (to avoid DoS).
`allowRequest` | | A function that receives a given handshake or upgrade request as its first parameter, and can decide whether to continue or not. The second argument is a function that needs to be called with the decided information: `fn(err, success)`, where `success` is a boolean value where false means that the request is rejected, and err is an error code.
`transports` | `['polling', 'websocket']` | transports to allow connections to
`allowUpgrades` | `true` | whether to allow transport upgrades
`perMessageDeflate` | `false` | parameters of the WebSocket permessage-deflate extension (see [ws module](https://github.com/einaros/ws) api docs). Set to `true` to enable.
`httpCompression` | `true` | parameters of the http compression for the polling transports (see [zlib](http://nodejs.org/api/zlib.html#zlib_options) api docs). Set to `false` to disable.
`wsEngine` | `ws` | what WebSocket server implementation to use. Specified module must conform to the `ws` interface (see [ws module api docs](https://github.com/websockets/ws/blob/master/doc/ws.md)). Default value is `ws`. An alternative c++ addon is also available by installing the [eiows](https://www.npmjs.com/package/eiows) module.
`cors` | | the list of options that will be forwarded to the [cors](https://www.npmjs.com/package/cors) module
`cookie` | | the list of options that will be forwarded to the [cookie](https://github.com/jshttp/cookie/) module

Among those options:

- The `pingTimeout` and `pingInterval` parameters will impact the delay before a client knows the server is not available anymore. For example, if the underlying TCP connection is not closed properly due to a network issue, a client may have to wait up to `pingTimeout + pingInterval` ms before getting a `disconnect` event.

- The order of the `transports` array is important. By default, a long-polling connection is established first, and then upgraded to WebSocket if possible. Using `['websocket']` means there will be no fallback if a WebSocket connection cannot be opened.

```js
const server = require('http').createServer();

const io = require('socket.io')(server, {
  path: '/test',
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

server.listen(3000);
```

### new Server(port[, options])

  - `port` _(Number)_ a port to listen to (a new `http.Server` will be created)
  - `options` _(Object)_

See [above](#new-Server-httpServer-options) for the list of available `options`.

```js
const io = require('socket.io')(3000, {
  path: '/test',
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
```

### new Server(options)

  - `options` _(Object)_

See [above](#new-Server-httpServer-options) for the list of available `options`.

```js
const io = require('socket.io')({
  path: '/test',
  serveClient: false,
});

// either
const server = require('http').createServer();

io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

server.listen(3000);

// or
io.attach(3000, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
```

### server.sockets

  * _(Namespace)_

An alias for the default (`/`) namespace.

```js
io.sockets.emit('hi', 'everyone');
// is equivalent to
io.of('/').emit('hi', 'everyone');
```

### server.serveClient([value])

  - `value` _(Boolean)_
  - **Returns** `Server|Boolean`

If `value` is `true` the attached server (see `Server#attach`) will serve the client files. Defaults to `true`. This method has no effect after `attach` is called. If no arguments are supplied this method returns the current value.

```js
// pass a server and the `serveClient` option
const io = require('socket.io')(http, { serveClient: false });

// or pass no server and then you can call the method
const io = require('socket.io')();
io.serveClient(false);
io.attach(http);
```

### server.path([value])

  - `value` _(String)_
  - **Returns** `Server|String`

Sets the path `value` under which `engine.io` and the static files will be served. Defaults to `/socket.io`. If no arguments are supplied this method returns the current value.

```js
const io = require('socket.io')();
io.path('/myownpath');

// client-side
const socket = io({
  path: '/myownpath'
});
```

### server.adapter([value])

  - `value` _(Adapter)_
  - **Returns** `Server|Adapter`

Sets the adapter `value`. Defaults to an instance of the `Adapter` that ships with socket.io which is memory based. See [socket.io-adapter](https://github.com/socketio/socket.io-adapter). If no arguments are supplied this method returns the current value.

```js
const io = require('socket.io')(3000);
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));
```

### server.attach(httpServer[, options])

  - `httpServer` _(http.Server)_ the server to attach to
  - `options` _(Object)_

Attaches the `Server` to an engine.io instance on `httpServer` with the supplied `options` (optionally).

### server.attach(port[, options])

  - `port` _(Number)_ the port to listen on
  - `options` _(Object)_

Attaches the `Server` to an engine.io instance on a new http.Server with the supplied `options` (optionally).

### server.listen(httpServer[, options])

Synonym of [server.attach(httpServer[, options])](#server-attach-httpServer-options).

### server.listen(port[, options])

Synonym of [server.attach(port[, options])](#server-attach-port-options).

### server.bind(engine)

  - `engine` _(engine.Server)_
  - **Returns** `Server`

Advanced use only. Binds the server to a specific engine.io `Server` (or compatible API) instance.

### server.onconnection(socket)

  - `socket` _(engine.Socket)_
  - **Returns** `Server`

Advanced use only. Creates a new `socket.io` client from the incoming engine.io (or compatible API) `Socket`.

### server.of(nsp)

  - `nsp` _(String|RegExp|Function)_
  - **Returns** `Namespace`

Initializes and retrieves the given `Namespace` by its pathname identifier `nsp`. If the namespace was already initialized it returns it immediately.

```js
const adminNamespace = io.of('/admin');
```

A regex or a function can also be provided, in order to create namespace in a dynamic way:

```js
const dynamicNsp = io.of(/^\/dynamic-\d+$/).on('connection', (socket) => {
  const newNamespace = socket.nsp; // newNamespace.name === '/dynamic-101'

  // broadcast to all clients in the given sub-namespace
  newNamespace.emit('hello');
});

// client-side
const socket = io('/dynamic-101');

// broadcast to all clients in each sub-namespace
dynamicNsp.emit('hello');

// use a middleware for each sub-namespace
dynamicNsp.use((socket, next) => { /* ... */ });
```

With a function:

```js
io.of((name, query, next) => {
  // the checkToken method must return a boolean, indicating whether the client is able to connect or not.
  next(null, checkToken(query.token));
}).on('connection', (socket) => { /* ... */ });
```

### server.close([callback])

  - `callback` _(Function)_

Closes the socket.io server. The `callback` argument is optional and will be called when all connections are closed.

```js
const Server = require('socket.io');
const PORT   = 3030;
const server = require('http').Server();

const io = Server(PORT);

io.close(); // Close current server

server.listen(PORT); // PORT is free to use

io = Server(server);
```

### server.engine.generateId

Overwrites the default method to generate your custom socket id.

The function is called with a node request object (`http.IncomingMessage`) as first parameter.

```js
io.engine.generateId = (req) => {
  return "custom:id:" + custom_id++; // custom id must be unique
}
```

## Namespace

Represents a pool of sockets connected under a given scope identified by a pathname (eg: `/chat`).

A client always connects to `/` (the main namespace), then potentially connect to other namespaces (while using the same underlying connection).

For the how and why, please take a look at: [Rooms and Namespaces](/docs/v3/namespaces/).

### namespace.name

  * _(String)_

The namespace identifier property.

### namespace.sockets

  * _(Map<SocketId, Socket>)_

A map of [Socket](#Socket) instances that are connected to this namespace.

```js
// number of sockets in this namespace (on this node)
const socketCount = io.of("/admin").sockets.size;
```

### namespace.adapter

  * _(Adapter)_

The `Adapter` used for the namespace. Useful when using the `Adapter` based on [Redis](https://github.com/socketio/socket.io-redis), as it exposes methods to manage sockets and rooms across your cluster.

**Note:** the adapter of the main namespace can be accessed with `io.of('/').adapter`.

### namespace.to(room)

  - `room` _(String)_
  - **Returns** `Namespace` for chaining

Sets a modifier for a subsequent event emission that the event will only be _broadcasted_ to clients that have joined the given `room`.

To emit to multiple rooms, you can call `to` several times.

```js
const io = require('socket.io')();
const adminNamespace = io.of('/admin');

adminNamespace.to('level1').emit('an event', { some: 'data' });
```

### namespace.in(room)

Synonym of [namespace.to(room)](#namespace-to-room).

### namespace.emit(eventName[, ...args])

  - `eventName` _(String)_
  - `args`

Emits an event to all connected clients. The following two are equivalent:

```js
const io = require('socket.io')();
io.emit('an event sent to all connected clients'); // main namespace

const chat = io.of('/chat');
chat.emit('an event sent to all connected clients in chat namespace');
```

**Note:** acknowledgements are not supported when emitting from namespace.

### namespace.allSockets()

  - **Returns** `Promise<Set<SocketId>>`

Gets a list of socket IDs connected to this namespace (across all nodes if applicable).

```js
// all sockets in the main namespace
const ids = await io.allSockets();

// all sockets in the "chat" namespace
const ids = await io.of("/chat").allSockets();

// all sockets in the "chat" namespace and in the "general" room
const ids = await io.of("/chat").in("general").allSockets();
```

### namespace.use(fn)

  - `fn` _(Function)_

Registers a middleware, which is a function that gets executed for every incoming `Socket`, and receives as parameters the socket and a function to optionally defer execution to the next registered middleware.

Errors passed to middleware callbacks are sent as special `connect_error` packets to clients.

```js
// server-side
io.use((socket, next) => {
  const err = new Error("not authorized");
  err.data = { content: "Please retry later" }; // additional details
  next(err);
});

// client-side
socket.on("connect_error", err => {
  console.log(err instanceof Error); // true
  console.log(err.message); // not authorized
  console.log(err.data); // { content: "Please retry later" }
});
```

### Event: 'connect'

  - `socket` _(Socket)_ socket connection with client

Fired upon a connection from client.

```js
io.on('connection', (socket) => {
  // ...
});

io.of('/admin').on('connection', (socket) => {
  // ...
});
```

### Event: 'connection'

Synonym of [Event: 'connect'](#Event-‘connect’).

### Flag: 'volatile'

Sets a modifier for a subsequent event emission that the event data may be lost if the clients are not ready to receive messages (because of network slowness or other issues, or because they’re connected through long polling and is in the middle of a request-response cycle).

```js
io.volatile.emit('an event', { some: 'data' }); // the clients may or may not receive it
```

### Flag: 'local'

Sets a modifier for a subsequent event emission that the event data will only be _broadcast_ to the current node (when the [Redis adapter](https://github.com/socketio/socket.io-redis) is used).

```js
io.local.emit('an event', { some: 'data' });
```

## Socket

A `Socket` is the fundamental class for interacting with browser clients. A `Socket` belongs to a certain `Namespace` (by default `/`) and uses an underlying `Client` to communicate.

It should be noted the `Socket` doesn't relate directly to the actual underlying TCP/IP `socket` and it is only the name of the class.

Within each `Namespace`, you can also define arbitrary channels (called `room`) that the `Socket` can join and leave. That provides a convenient way to broadcast to a group of `Socket`s (see `Socket#to` below).

The `Socket` class inherits from [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter). The `Socket` class overrides the `emit` method, and does not modify any other `EventEmitter` method. All methods documented here which also appear as `EventEmitter` methods (apart from `emit`) are implemented by `EventEmitter`, and documentation for `EventEmitter` applies.

### socket.id

  * _(String)_

A unique identifier for the session, that comes from the underlying `Client`.

### socket.rooms

  * _(Set)_

A Set of strings identifying the rooms this client is in.

```js
io.on("connection", (socket) => {

  console.log(socket.rooms); // Set { <socket.id> }

  socket.join("room1");

  console.log(socket.rooms); // Set { <socket.id>, "room1" }

});
```

### socket.client

  * _(Client)_

A reference to the underlying `Client` object.

### socket.conn

  * _(engine.Socket)_

A reference to the underlying `Client` transport connection (engine.io `Socket` object). This allows access to the IO transport layer, which still (mostly) abstracts the actual TCP/IP socket.

### socket.request

  * _(Request)_

A getter proxy that returns the reference to the `request` that originated the underlying engine.io `Client`. Useful for accessing request headers such as `Cookie` or `User-Agent`.

```js
const cookie = require('cookie');

io.on('connection', (socket) => {
  const cookies = cookie.parse(socket.request.headers.cookie || '');
});
```

### socket.handshake

  * _(Object)_

The handshake details:

```js
{
  headers: /* the headers sent as part of the handshake */,
  time: /* the date of creation (as string) */,
  address: /* the ip of the client */,
  xdomain: /* whether the connection is cross-domain */,
  secure: /* whether the connection is secure */,
  issued: /* the date of creation (as unix timestamp) */,
  url: /* the request URL string */,
  query: /* the query params of the first request */,
  auth: /* the authentication payload */
}
```

Usage:

```js
io.use((socket, next) => {
  let handshake = socket.handshake;
  // ...
});

io.on('connection', (socket) => {
  let handshake = socket.handshake;
  // ...
});
```

### socket.send([...args][, ack])

  - `args`
  - `ack` _(Function)_
  - **Returns** `Socket`

Sends a `message` event. See [socket.emit(eventName[, ...args][, ack])](#socketemiteventname-args-ack).

### socket.emit(eventName[, ...args][, ack])

*(overrides `EventEmitter.emit`)*
  - `eventName` _(String)_
  - `args`
  - `ack` _(Function)_
  - **Returns** `Socket`

Emits an event to the socket identified by the string name. Any other parameters can be included. All serializable datastructures are supported, including `Buffer`.

```js
socket.emit('hello', 'world');
socket.emit('with-binary', 1, '2', { 3: '4', 5: Buffer.from([6]) });
```

The `ack` argument is optional and will be called with the client's answer.

```js
io.on('connection', (socket) => {
  socket.emit('an event', { some: 'data' });

  socket.emit('ferret', 'tobi', (data) => {
    console.log(data); // data will be 'woot'
  });

  // the client code
  // client.on('ferret', (name, fn) => {
  //   fn('woot');
  // });

});
```

### socket.on(eventName, callback)

*(inherited from `EventEmitter`)*
  - `eventName` _(String)_
  - `callback` _(Function)_
  - **Returns** `Socket`

Register a new handler for the given event.

```js
socket.on('news', (data) => {
  console.log(data);
});
// with several arguments
socket.on('news', (arg1, arg2, arg3) => {
  // ...
});
// or with acknowledgement
socket.on('news', (data, callback) => {
  callback(0);
});
```

### socket.once(eventName, listener)
### socket.removeListener(eventName, listener)
### socket.removeAllListeners([eventName])
### socket.eventNames()

Inherited from `EventEmitter` (along with other methods not mentioned here). See the Node.js documentation for the [events](https://nodejs.org/docs/latest/api/events.html) module.

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

### socket.join(room)

  - `room` _(string)_ | _(string[])_
  - **Returns** `void` | `Promise`

Adds the socket to the given `room` or to the list of rooms.

```js
io.on('connection', (socket) => {
  socket.join('room 237');
  
  console.log(socket.rooms); // Set { <socket.id>, 'room 237' }

  socket.join(['room 237', 'room 238']);

  io.to('room 237').emit('a new user has joined the room'); // broadcast to everyone in the room
});
```

The mechanics of joining rooms are handled by the `Adapter` that has been configured (see `Server#adapter` above), defaulting to [socket.io-adapter](https://github.com/socketio/socket.io-adapter).

For your convenience, each socket automatically joins a room identified by its id (see `Socket#id`). This makes it easy to broadcast messages to other sockets:

```js
io.on('connection', (socket) => {
  socket.on('say to someone', (id, msg) => {
    // send a private message to the socket with the given id
    socket.to(id).emit('my message', msg);
  });
});
```

### socket.leave(room)

  - `room` _(String)_
  - **Returns** `void` | `Promise`

Removes the socket from the given `room`.

```js
io.on('connection', (socket) => {
  socket.leave('room 237');

  io.to('room 237').emit(`user ${socket.id} has left the room`);
});
```

**Rooms are left automatically upon disconnection**.

### socket.to(room)

  - `room` _(String)_
  - **Returns** `Socket` for chaining

Sets a modifier for a subsequent event emission that the event will only be _broadcasted_ to clients that have joined the given `room` (the socket itself being excluded).

To emit to multiple rooms, you can call `to` several times.

```js
io.on('connection', (socket) => {

  // to one room
  socket.to('others').emit('an event', { some: 'data' });

  // to multiple rooms
  socket.to('room1').to('room2').emit('hello');

  // a private message to another socket
  socket.to(/* another socket id */).emit('hey');

  // WARNING: `socket.to(socket.id).emit()` will NOT work, as it will send to everyone in the room
  // named `socket.id` but the sender. Please use the classic `socket.emit()` instead.
});
```

**Note:** acknowledgements are not supported when broadcasting.

### socket.in(room)

Synonym of [socket.to(room)](#socket-to-room).

### socket.compress(value)

  - `value` _(Boolean)_ whether to following packet will be compressed
  - **Returns** `Socket` for chaining

Sets a modifier for a subsequent event emission that the event data will only be _compressed_ if the value is `true`. Defaults to `true` when you don't call the method.

```js
io.on('connection', (socket) => {
  socket.compress(false).emit('uncompressed', "that's rough");
});
```

### socket.disconnect(close)

  - `close` _(Boolean)_ whether to close the underlying connection
  - **Returns** `Socket`

Disconnects this socket. If value of close is `true`, closes the underlying connection. Otherwise, it just disconnects the namespace.

```js
io.on('connection', (socket) => {
  setTimeout(() => socket.disconnect(true), 5000);
});
```

### Flag: 'broadcast'

Sets a modifier for a subsequent event emission that the event data will only be _broadcast_ to every sockets but the sender.

```js
io.on('connection', (socket) => {
  socket.broadcast.emit('an event', { some: 'data' }); // everyone gets it but the sender
});
```

### Flag: 'volatile'

Sets a modifier for a subsequent event emission that the event data may be lost if the client is not ready to receive messages (because of network slowness or other issues, or because they’re connected through long polling and is in the middle of a request-response cycle).

```js
io.on('connection', (socket) => {
  socket.volatile.emit('an event', { some: 'data' }); // the client may or may not receive it
});
```

### Event: 'disconnect'

  - `reason` _(String)_ the reason of the disconnection (either client or server-side)

Fired upon disconnection.

```js
io.on('connection', (socket) => {
  socket.on('disconnect', (reason) => {
    // ...
  });
});
```

Possible reasons:

Reason | Description
------ | -----------
`io server disconnect` | The socket was forcefully disconnected with [socket.disconnect()](/docs/v3/server-api/#socket-disconnect-close)
`io client disconnect` | The client has manually disconnected the socket using [socket.disconnect()](/docs/v3/client-api/#socket-disconnect)
`ping timeout` | The client did not respond in the `pingTimeout` range
`transport close` | The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)
`transport error` | The connection has encountered an error

### Event: 'disconnecting'

  - `reason` _(String)_ the reason of the disconnection (either client or server-side)

Fired when the client is going to be disconnected (but hasn't left its `rooms` yet).

```js
io.on('connection', (socket) => {
  socket.on('disconnecting', (reason) => {
    console.log(socket.rooms); // Set { ... }
  });
});
```

Note: those events, along with `connect`, `connect_error`, `newListener` and `removeListener`, are special events that shouldn't be used in your application:

```js
// BAD, will throw an error
socket.emit("disconnect");
```

## Client

The `Client` class represents an incoming transport (engine.io) connection. A `Client` can be associated with many multiplexed `Socket`s that belong to different `Namespace`s.

### client.conn

  * _(engine.Socket)_

A reference to the underlying `engine.io` `Socket` connection.

### client.request

  * _(Request)_

A getter proxy that returns the reference to the `request` that originated the engine.io connection. Useful for accessing request headers such as `Cookie` or `User-Agent`.
