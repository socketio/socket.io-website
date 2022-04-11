---
title: Server options
sidebar_label: Options
sidebar_position: 2
slug: /server-options/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Socket.IO server options

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

### `parser`

Default value: `socket.io-parser`

The parser to use. Please see the documentation [here](categories/06-Advanced/custom-parser.md).

### `connectTimeout`

Default value: `45000`

The number of ms before disconnecting a client that has not successfully joined a namespace.

## Low-level engine options

### `pingTimeout`

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
const io = new Server(httpServer, {
  pingTimeout: 30000
});
```

### `pingInterval`

Default value: `25000`

See [above](#pingtimeout).

### `upgradeTimeout`

Default value: `10000`

This is the delay in milliseconds before an uncompleted transport upgrade is cancelled.

### `maxHttpBufferSize`

Default value: `1e6` (1 MB)

This defines how many bytes a single message can be, before closing the socket. You may increase or decrease this value depending on your needs.

```js
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e8
});
```

It matches the [maxPayload](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback) option of the ws package.

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

This can also be used in conjunction with the [`initial_headers`](./server-api.md#event-initial_headers) event, to send a cookie to the client:

```js
import { serialize } from "cookie";

const io = new Server(httpServer, {
  allowRequest: async (req, callback) => {
    const session = await fetchSession(req);
    req.session = session;
    callback(null, true);
  }
});

io.engine.on("initial_headers", (headers, req) => {
  if (req.session) {
    headers["set-cookie"] = serialize("sid", req.session.id, { sameSite: "strict" });
  }
});
```

See also:

- [how to use with `express-session`](/how-to/use-with-express-session)
- [how to deal with cookies](/how-to/deal-with-cookies)

### `transports`

Default value: `["polling", "websocket"]`

The low-level transports that are allowed on the server-side.

See also: client-side [`transports`](client-options.md#transports)

### `allowUpgrades`

Default value: `true`

Whether to allow transport upgrades.

### `perMessageDeflate`

<details className="changelog">
    <summary>History</summary>

| Version | Changes |
| ------- | ------- |
| v3.0.0 | The permessage-deflate extension is now disabled by default.
| v1.4.0 | First implementation.

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

### `wsEngine`

Default value: `require("ws").Server` (source code can be found [here](https://github.com/websockets/ws))

The WebSocket server implementation to use. Please see the documentation [here](categories/02-Server/server-installation.md#other-websocket-server-implementations).

Example:

```js
const io = new Server(httpServer, {
  wsEngine: require("eiows").Server
});
```

### `cors`

Default value: `-`

The list of options that will be forwarded to the [`cors`](https://www.npmjs.com/package/cors) module. More information can be found [here](categories/02-Server/handling-cors.md).

Example:

```js
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com", "https://dev.example.com"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
```

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
