title: Server Initialization
short_title: Initialization
permalink: /docs/v4/server-initialization/
release: v4
type: docs
order: 202
---

Once you have [installed](/docs/v4/server-installation/) the Socket.IO server library, you can now init the server. The complete list of options can be found [below](#Options).

## Syntax

### CommonJS

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  // ...
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

### ES modules

Please see [here](https://nodejs.org/api/esm.html#esm_enabling) for enabling ECMAScript modules in your Node.js project.

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // ...
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

### TypeScript

Socket.IO has now first-class support for TypeScript:

```ts
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // ...
});

io.on("connection", (socket: Socket) => {
  // ...
});

httpServer.listen(3000);
```

## Initialization

### Standalone

```js
const options = { /* ... */ };
const io = require("socket.io")(options);

io.on("connection", socket => { /* ... */ });

io.listen(3000);
```

You can also pass the port as the first argument:

```js
const options = { /* ... */ };
const io = require("socket.io")(3000, options);

io.on("connection", socket => { /* ... */ });
```

This implicitly starts a Node.js [HTTP server](https://nodejs.org/docs/latest/api/http.html#http_class_http_server), which can be accessed through `io.httpServer`.

### Attached to an existing HTTP server

#### With an HTTP server

```js
const httpServer = require("http").createServer();
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", socket => { /* ... */ });

httpServer.listen(3000);
```

#### With an HTTPS server

```js
const fs = require("fs");
const httpServer = require("https").createServer({
  key: fs.readFileSync("/tmp/key.pem"),
  cert: fs.readFileSync("/tmp/cert.pem")
});
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", socket => { /* ... */ });

httpServer.listen(3000);
```

[Node.js documentation](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)

#### With an HTTP/2 server

```js
const fs = require("fs");
const httpServer = require("http2").createSecureServer({
  allowHTTP1: true,
  key: fs.readFileSync("/tmp/key.pem"),
  cert: fs.readFileSync("/tmp/cert.pem")
});
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", socket => { /* ... */ });

httpServer.listen(3000);
```

[Node.js documentation](https://nodejs.org/api/http2.html#http2_http2_createsecureserver_options_onrequesthandler)

### With Express

```js
const app = require("express")();
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", socket => { /* ... */ });

httpServer.listen(3000);
// WARNING !!! app.listen(3000); will not work here, as it creates a new HTTP server
```

More information [here](http://expressjs.com/).

### With Koa

```js
const app = require("koa")();
const httpServer = require("http").createServer(app.callback());
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", socket => { /* ... */ });

httpServer.listen(3000);
```

More information [here](https://koajs.com/).

## Options

- [Socket.IO server options](#Socket-IO-server-options)
  - [path](#path)
  - [serveClient](#serveClient)
  - [adapter](#adapter)
  - [parser](#parser)
  - [connectTimeout](#connectTimeout)
- [Low-level engine options](#Low-level-engine-options)
  - [pingTimeout](#pingTimeout)
  - [pingInterval](#pingInterval)
  - [upgradeTimeout](#upgradeTimeout)
  - [maxHttpBufferSize](#maxHttpBufferSize)
  - [allowRequest](#allowRequest)
  - [transports](#transports)
  - [allowUpgrades](#allowUpgrades)
  - [perMessageDeflate](#perMessageDeflate)
  - [httpCompression](#httpCompression)
  - [wsEngine](#wsEngine)
  - [cors](#cors)
  - [cookie](#cookie)
  - [allowEIO3](#allowEIO3)

### Socket.IO server options

#### `path`

Default value: `/socket.io/`

It is the name of the path that is captured on the server side.

The server and the client values must match (unless you are using a path-rewriting proxy in between):

*Server*

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  path: "/my-custom-path/"
});
```

*Client*

```js
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  path: "/my-custom-path/"
});
```

#### `serveClient`

Default value: `true`

Whether to serve the client files. If `true`, the different bundles will be served at the following location:

- `<url>/socket.io/socket.io.js`
- `<url>/socket.io/socket.io.min.js`
- `<url>/socket.io/socket.io.msgpack.min.js`

(including their associated source maps)

See also [here](/docs/v4/client-installation/#Standalone-build).

#### `adapter`

Default value: `socket.io-adapter` (in-memory adapter, whose source code can be found [here](https://github.com/socketio/socket.io-adapter/))

The ["Adapter"](/docs/v4/glossary/#Adapter) to use.

Example with the Redis adapter (the `socket.io-redis` package, more information [here](/docs/v4/using-multiple-nodes/#Passing-events-between-nodes)):

```js
const httpServer = require("http").createServer();
const redisClient = require("redis").createClient();
const io = require("socket.io")(httpServer, {
  adapter: require("socket.io-redis")({
    pubClient: redisClient,
    subClient: redisClient.duplicate()
  })
});
```

#### `parser`

Default value: `socket.io-parser`

The parser to use. Please see the documentation [here](/docs/v4/custom-parser/).

#### `connectTimeout`

Default value: `45000`

The number of ms before disconnecting a client that has not successfully joined a namespace.

### Low-level engine options

#### `pingTimeout`

Default value: `20000`

This value is used in the heartbeat mechanism, which periodically checks if the connection is still alive between the server and the client.

The server sends a ping, and if the client does not answer with a pong within `pingTimeout` ms, the server considers that the connection is closed.

Similarly, if the client does not receive a ping from the server within `pingInterval + pingTimeout` ms, the client also considers that the connection is closed.

In both cases, the disconnection reason will be: `ping timeout`

```js
socket.on("disconnect", (reason) => {
  console.log(reason); // "ping timeout"
});
```

Note: the default value might be a bit low if you need to send big files in your application. Please increase it if that's the case:

```js
const io = require("socket.io")(httpServer, {
  pingTimeout: 30000
});
```

#### `pingInterval`

Default value: `25000`

See [above](#pingTimeout).

#### `upgradeTimeout`

Default value: `10000`

This is the delay in milliseconds before an uncompleted transport upgrade is cancelled.

#### `maxHttpBufferSize`

Default value: `1e6` (1 MB)

This defines how many bytes a single message can be, before closing the socket. You may increase or decrease this value depending on your needs.

```js
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: 1e8
});
```

It matches the [maxPayload](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback) option of the ws package.

#### `allowRequest`

Default: `-`

A function that receives a given handshake or upgrade request as its first parameter, and can decide whether to continue or not.

Example:

```js
const io = require("socket.io")(httpServer, {
  allowRequest: (req, callback) => {
    const isOriginValid = check(req);
    callback(null, isOriginValid);
  }
});
```

#### `transports`

Default value: `["polling", "websocket"]`

The low-level transports that are allowed on the server-side.

See also: client-side [`transports`](/docs/v4/client-initialization/#transports)

#### `allowUpgrades`

Default value: `true`

Whether to allow transport upgrades.

#### `perMessageDeflate`

Default value: `false`

Whether to enable the [permessage-deflate extension](https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression-19) for the WebSocket transport. This extension is known to add a significant overhead in terms of performance and memory consumption, so we suggest to only enable it if it is really needed.

Please note that if `perMessageDeflate` is set to `false` (which is the default), the compress flag used when emitting (`socket.compress(true).emit(...)`) will be ignored when the connection is established with WebSockets, as the permessage-deflate extension cannot be enabled on a per-message basis.

Example:

```js
const io = require("socket.io")(httpServer, {
  perMessageDeflate: {
    threshold: 1024
  }
});
```

#### `httpCompression`

Default value: `true`

Whether to enable the compression for the HTTP long-polling transport.

Please note that if `httpCompression` is set to `false`, the compress flag used when emitting (`socket.compress(true).emit(...)`) will be ignored when the connection is established with HTTP long-polling requests.

Example:

```js
const io = require("socket.io")(httpServer, {
  httpCompression: {
    threshold: 1024
  }
});
```

#### `wsEngine`

Default value: `"ws"` (source code can be found [here](https://github.com/websockets/ws))

The WebSocket server implementation to use. Please see the documentation [here](/docs/v4/server-installation/#Other-WebSocket-server-implementations).

Example:

```js
const io = require("socket.io")(httpServer, {
  wsEngine: require("eiows").Server
});
```

#### `cors`

Default value: `-`

The list of options that will be forwarded to the [`cors`](https://www.npmjs.com/package/cors) module. More information can be found [here](/docs/v4/handling-cors/).

Example:

```js
const io = require("socket.io")(httpServer, {
  cors: {
    origin: ["https://example.com", "https://dev.example.com"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
```

#### `cookie`

Default value: `-`

The list of options that will be forwarded to the [`cookie`](https://github.com/jshttp/cookie/) module.

Please note that since Socket.IO v3, there is no cookie sent by default anymore ([reference](/docs/v4/migrating-from-2-x-to-3-0/#No-more-cookie-by-default)).

Example:

```js
const io = require("socket.io")(httpServer, {
  cookie: {
    name: "my-cookie",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400
  }
});
```

#### `allowEIO3`

Default value: `false`

Whether to enable compatibility with Socket.IO v2 clients.

See also: [Migrating from 2.x to 3.0](/docs/v4/migrating-from-2-x-to-3-0/#How-to-upgrade-an-existing-production-deployment)

Example:

```js
const io = require("socket.io")(httpServer, {
  allowEIO3: true // false by default
});
```
