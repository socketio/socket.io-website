---
title: Server options
sidebar_label: Options
sidebar_position: 2
slug: /server-options/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Socket.IO server options

The following options affect the behavior of the Socket.IO server.

### `adapter`

Default value: `require("socket.io-adapter")` (in-memory adapter, whose source code can be found [here](https://github.com/socketio/socket.io-adapter/))

The ["Adapter"](categories/08-Miscellaneous/glossary.md#adapter) to use.

Example with the [Redis adapter](categories/05-Adapters/adapter-redis.md):

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

  </TabItem>
</Tabs>


### `cleanupEmptyChildNamespaces`

*Added in v4.6.0*

Default value: `false`

Whether to remove [child namespaces](categories/06-Advanced/namespaces.md#dynamic-namespaces) that have no sockets connected to them.

This option might be useful if you create a lot of dynamic namespaces, since each namespace creates its own adapter instance.

With this option enabled (disabled by default), when a socket disconnects from a dynamic namespace and if there are no other sockets connected to it then the namespace will be cleaned up and its adapter will be closed.

### `connectionStateRecovery`

*Added in v4.6.0*

Default value: `undefined`

The option for the [Connection state recovery](./categories/01-Documentation/connection-state-recovery.md) feature:

```js
const io = new Server(httpServer, {
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  }
});
```

:::caution

The connection state recovery feature is designed for dealing with intermittent disconnections, so please use a sensible value for `maxDisconnectionDuration` (not `Infinity`).

:::

If the `skipMiddlewares` option is set to `true`, then the middlewares will be skipped when the connection is successfully recovered:

```js
function computeUserIdFromHeaders(headers) {
  // to be implemented
}

// this middleware will be skipped if the connection is successfully recovered
io.use(async (socket, next) => {
  socket.data.userId = await computeUserIdFromHeaders(socket.handshake.headers);

  next();
});

io.on("connection", (socket) => {
  // the userId attribute will either come:
  // - from the middleware above (first connection or failed recovery)
  // - from the recovery mechanism
  console.log("userId", socket.data.userId);
});
```

### `connectTimeout`

Default value: `45000`

The number of ms before disconnecting a client that has not successfully joined a namespace.

### `parser`

Default value: `socket.io-parser`

The parser to use. Please see the documentation [here](categories/06-Advanced/custom-parser.md).


### `path`

Default value: `/socket.io/`

It is the name of the path that is captured on the server side.

:::caution

The server and the client values must match (unless you are using a path-rewriting proxy in between).

:::

*Server*

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
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

### `serveClient`

Default value: `true`

Whether to serve the client files. If `true`, the different bundles will be served at the following location:

- `<url>/socket.io/socket.io.js`
- `<url>/socket.io/socket.io.min.js`
- `<url>/socket.io/socket.io.msgpack.min.js`

(including their associated source maps)

See also [here](categories/03-Client/client-installation.md#standalone-build).


## Low-level engine options

The following options affect the behavior of the underlying Engine.IO server.

### `addTrailingSlash`

*Added in v4.6.0*

Default value: `true`

The trailing slash which was added by default can now be disabled:

```js
import { createServer } from "node:http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
addTrailingSlash: false
});
```

In the example above, the clients can omit the trailing slash and use `/socket.io` instead of `/socket.io/`.


### `allowEIO3`

Default value: `false`

Whether to enable compatibility with Socket.IO v2 clients.

See also: [Migrating from 2.x to 3.0](categories/07-Migrations/migrating-from-2-to-3.md#how-to-upgrade-an-existing-production-deployment)

Example:

```js
const io = new Server(httpServer, {
  allowEIO3: true // false by default
});
```


### `allowRequest`

Default: `-`

A function that receives a given handshake or upgrade request as its first parameter, and can decide whether to continue or not.

Example:

```js
const io = new Server(httpServer, {
  allowRequest: (req, callback) => {
    const isOriginValid = check(req);
    callback(null, isOriginValid);
  }
});
```


### `allowUpgrades`

Default value: `true`

Whether to allow transport upgrades.


### `cookie`

Default value: `-`

The list of options that will be forwarded to the [`cookie`](https://github.com/jshttp/cookie/) module. Available options:

- domain
- encode
- expires
- httpOnly
- maxAge
- path
- sameSite
- secure

Example:

```js
import { Server } from "socket.io";

const io = new Server(httpServer, {
  cookie: {
    name: "my-cookie",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400
  }
});
```

:::info

Since Socket.IO v3, there is no cookie sent by default anymore ([reference](categories/07-Migrations/migrating-from-2-to-3.md#no-more-cookie-by-default)).

:::


### `cors`

Default value: `-`

The list of options that will be forwarded to the [`cors`](https://www.npmjs.com/package/cors) module. More information can be found [here](categories/02-Server/handling-cors.md).

Examples:

- allow a given origin

```js
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com"]
  }
});
```

- allow a given origin for local development

```js
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"]
  }
});
```

- allow the given origins, headers and credentials (such as cookies, authorization headers or TLS client certificates)

```js
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com", "https://dev.example.com"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
```

:::note

If you want the browser to send credentials such as cookies, authorization headers or TLS client certificates, you also need to set [`withCredentials`](./client-options.md#withcredentials) option to `true` on the client side:

```js
import { io } from "socket.io-client";

const socket = io("https://my-backend.com", {
  withCredentials: true
});
```

More information [here](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).

:::

- allow any origin

```js
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});
```

:::warning

Please note that in that case, you are basically disabling the security provided by Cross-Origin Resource Sharing (CORS), as any domain will be able to reach your server. Please use with caution.

:::

Available options:

| Option                 | Description                                                                                                                                                                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `origin`               | Configures the **Access-Control-Allow-Origin** CORS header.                                                                                                                                                                                                                                                        |
| `methods`              | Configures the **Access-Control-Allow-Methods** CORS header. Expects a comma-delimited string (ex: 'GET,PUT,POST') or an array (ex: `['GET', 'PUT', 'POST']`).                                                                                                                                                     |
| `allowedHeaders`       | Configures the **Access-Control-Allow-Headers** CORS header. Expects a comma-delimited string (ex: 'Content-Type,Authorization') or an array (ex: `['Content-Type', 'Authorization']`). If not specified, defaults to reflecting the headers specified in the request's **Access-Control-Request-Headers** header. |
| `exposedHeaders`       | Configures the **Access-Control-Expose-Headers** CORS header. Expects a comma-delimited string (ex: 'Content-Range,X-Content-Range') or an array (ex: `['Content-Range', 'X-Content-Range']`). If not specified, no custom headers are exposed.                                                                    |
| `credentials`          | Configures the **Access-Control-Allow-Credentials** CORS header. Set to `true` to pass the header, otherwise it is omitted.                                                                                                                                                                                        |
| `maxAge`               | Configures the **Access-Control-Max-Age** CORS header. Set to an integer to pass the header, otherwise it is omitted.                                                                                                                                                                                              |
| `preflightContinue`    | Pass the CORS preflight response to the next handler.                                                                                                                                                                                                                                                              |
| `optionsSuccessStatus` | Provides a status code to use for successful `OPTIONS` requests, since some legacy browsers (IE11, various SmartTVs) choke on `204`.                                                                                                                                                                               |

Possible values for the `origin` option:

- `Boolean` - set `origin` to `true` to reflect the [request origin](http://tools.ietf.org/html/draft-abarth-origin-09), as defined by `req.header('Origin')`, or set it to `false` to disable CORS.
- `String` - set `origin` to a specific origin. For example if you set it to `"http://example.com"` only requests from "http://example.com" will be allowed.
- `RegExp` - set `origin` to a regular expression pattern which will be used to test the request origin. If it's a match, the request origin will be reflected. For example the pattern `/example\.com$/` will reflect any request that is coming from an origin ending with "example.com".
- `Array` - set `origin` to an array of valid origins. Each origin can be a `String` or a `RegExp`. For example `["http://example1.com", /\.example2\.com$/]` will accept any request from "http://example1.com" or from a subdomain of "example2.com".
- `Function` - set `origin` to a function implementing some custom logic. The function takes the request origin as the first parameter and a callback (which expects the signature `err [object], allow [bool]`) as the second.

:::note

The option is named `origin` (and not `origins`) even with multiple domains:

```js
const io = new Server(httpServer, {
  cors: {
    // BAD
    origins: ["https://example.com"],
    // GOOD
    origin: ["https://example.com"],
  }
});
```

:::

:::caution

You can't use `origin: "*"` when setting `credentials: true`:

```js
// THIS WON'T WORK
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true
  }
});
```

You will see an error like this in the browser console:

> Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ‘.../socket.io/?EIO=4&transport=polling&t=NvQfU77’. (Reason: Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’)

You need to either provide a list of domains (recommended solution) or use the following method:

```js
const io = new Server(httpServer, {
  cors: {
    origin: (_req, callback) => {
      callback(null, true);
    },
    credentials: true
  }
});
```

Please note that in that case, like with `origin: "*"` or `origin: true`, you are basically disabling the security provided by Cross-Origin Resource Sharing (CORS), as any domain will be able to reach your server. Please use with caution.

:::

### `httpCompression`

*Added in v1.4.0*

Default value: `true`

Whether to enable the compression for the HTTP long-polling transport.

Please note that if `httpCompression` is set to `false`, the compress flag used when emitting (`socket.compress(true).emit(...)`) will be ignored when the connection is established with HTTP long-polling requests.

All options from the Node.js [`zlib` module](https://nodejs.org/api/zlib.html#zlib_class_options) are supported.

Example:

```js
const io = new Server(httpServer, {
  httpCompression: {
    // Engine.IO options
    threshold: 2048, // defaults to 1024
    // Node.js zlib options
    chunkSize: 8 * 1024, // defaults to 16 * 1024
    windowBits: 14, // defaults to 15
    memLevel: 7, // defaults to 8
  }
});
```


### `maxHttpBufferSize`

Default value: `1e6` (1 MB)

This defines how many bytes a single message can be, before closing the socket. You may increase or decrease this value depending on your needs.

```js
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e8
});
```

It matches the [maxPayload](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback) option of the ws package.


### `perMessageDeflate`

<details className="changelog">
    <summary>History</summary>

| Version | Changes                                                      |
|---------|--------------------------------------------------------------|
| v3.0.0  | The permessage-deflate extension is now disabled by default. |
| v1.4.0  | First implementation.                                        |

</details>

Default value: `false`

Whether to enable the [permessage-deflate extension](https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression-19) for the WebSocket transport. This extension is known to add a significant overhead in terms of performance and memory consumption, so we suggest to only enable it if it is really needed.

Please note that if `perMessageDeflate` is set to `false` (which is the default), the compress flag used when emitting (`socket.compress(true).emit(...)`) will be ignored when the connection is established with WebSockets, as the permessage-deflate extension cannot be enabled on a per-message basis.

All options from the [`ws` module](https://github.com/websockets/ws/blob/master/README.md#websocket-compression) are supported:

```js
const io = new Server(httpServer, {
  perMessageDeflate: {
    threshold: 2048, // defaults to 1024

    zlibDeflateOptions: {
      chunkSize: 8 * 1024, // defaults to 16 * 1024
    },

    zlibInflateOptions: {
      windowBits: 14, // defaults to 15
      memLevel: 7, // defaults to 8
    },

    clientNoContextTakeover: true, // defaults to negotiated value.
    serverNoContextTakeover: true, // defaults to negotiated value.
    serverMaxWindowBits: 10, // defaults to negotiated value.

    concurrencyLimit: 20, // defaults to 10
  }
});
```


### `pingInterval`

Default value: `25000`

This value is used in the heartbeat mechanism, which periodically checks if the connection is still alive between the server and the client.

The server sends a ping packet every `pingInterval` ms, and if the client does not answer with a pong within `pingTimeout` ms, the server considers that the connection is closed.

Similarly, if the client does not receive a ping packet from the server within `pingInterval + pingTimeout` ms, then the client also considers that the connection is closed.

In both cases, the disconnection reason will be: `ping timeout`

```js
socket.on("disconnect", (reason) => {
  console.log(reason); // "ping timeout"
});
```

:::caution

Using a small value like `1000` (one heartbeat per second) will incur some load on your server, which might become noticeable with a few thousands connected clients.

:::

### `pingTimeout`

<details className="changelog">
    <summary>History</summary>

| Version | Changes                                   |
|---------|-------------------------------------------|
| v4.0.0  | `pingTimeout` now defaults to `20000` ms. |
| v2.1.0  | Defaults to `5000` ms.                    |
| v1.0.0  | Defaults to `60000` ms.                   |

</details>

Default value: `20000`

See [above](#pinginterval).

:::caution

Using a smaller value means that a temporarily unresponsive server might trigger a lot of client reconnections.

On the contrary, using a bigger value means that a broken connection will take longer to get detected (and you might get a warning on React Native if `pingInterval + pingTimeout` is bigger than 60 seconds).

:::

### `transports`

Default value: `["polling", "websocket"]`

The low-level transports that are allowed on the server-side.

Example with WebTransport enabled:

```js
const io = new Server({
  transports: ["polling", "websocket", "webtransport"]
});
```

Please check the WebTransport example [here](/get-started/webtransport).

See also: client-side [`transports`](client-options.md#transports)

### `upgradeTimeout`

Default value: `10000`

This is the delay in milliseconds before an uncompleted transport upgrade is cancelled.


### `wsEngine`

Default value: `require("ws").Server` (source code can be found [here](https://github.com/websockets/ws))

The WebSocket server implementation to use. Please see the documentation [here](categories/02-Server/server-installation.md#other-websocket-server-implementations).

Example:

```js
const io = new Server(httpServer, {
  wsEngine: require("eiows").Server
});
```
