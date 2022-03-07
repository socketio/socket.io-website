---
title: Client options
sidebar_label: Options
sidebar_position: 2
slug: /client-options/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## IO factory options

### `forceNew`

Default value: `false`

Whether to create a new Manager instance.

A Manager instance is in charge of the low-level connection to the server (established with HTTP long-polling or WebSocket). It handles the reconnection logic.

A Socket instance is the interface which is used to sends events to — and receive events from — the server. It belongs to a given [namespace](categories/06-Advanced/namespaces.md).

A single Manager can be attached to several Socket instances.

The following example will reuse the same Manager instance for the 3 Socket instances (one single WebSocket connection):

```js
const socket = io("https://example.com"); // the main namespace
const productSocket = io("https://example.com/product"); // the "product" namespace
const orderSocket = io("https://example.com/order"); // the "order" namespace
```

The following example will create 3 different Manager instances (and thus 3 distinct WebSocket connections):

```js
const socket = io("https://example.com"); // the main namespace
const productSocket = io("https://example.com/product", { forceNew: true }); // the "product" namespace
const orderSocket = io("https://example.com/order", { forceNew: true }); // the "order" namespace
```

Reusing an existing namespace will also create a new Manager each time:

```js
const socket1 = io(); // 1st manager
const socket2 = io(); // 2nd manager
const socket3 = io("/admin"); // reuse the 1st manager
const socket4 = io("/admin"); // 3rd manager
```

### `multiplex`

Default value: `true`

The opposite of `forceNew`: whether to reuse an existing Manager instance.

```js
const socket = io(); // 1st manager
const adminSocket = io("/admin", { multiplex: false }); // 2nd manager
```

## Low-level engine options

:::info

These settings will be shared by all Socket instances attached to the same Manager.

:::

### `transports`

Default value: `["polling", "websocket"]`

The low-level connection to the Socket.IO server can either be established with:

- HTTP long-polling: successive HTTP requests (`POST` for writing, `GET` for reading)
- [WebSocket](https://en.wikipedia.org/wiki/WebSocket)

The following example disables the HTTP long-polling transport:

```js
const socket = io("https://example.com", { transports: ["websocket"] });
```

Note: in that case, sticky sessions are not required on the server side (more information [here](categories/02-Server/using-multiple-nodes.md)).

By default, the HTTP long-polling connection is established first, and then an upgrade to WebSocket is attempted (explanation [here](categories/01-Documentation/how-it-works.md#upgrade-mechanism)). You can use WebSocket first with:

```js
const socket = io("https://example.com", {
  transports: ["websocket", "polling"] // use WebSocket first, if available
});

socket.on("connect_error", () => {
  // revert to classic upgrade
  socket.io.opts.transports = ["polling", "websocket"];
});
```

One possible downside is that the validity of your [CORS configuration](categories/02-Server/handling-cors.md) will only be checked if the WebSocket connection fails to be established.

### `upgrade`

Default value: `true`

Whether the client should try to upgrade the transport from HTTP long-polling to something better.

### `rememberUpgrade`

Default value: `false`

If true and if the previous WebSocket connection to the server succeeded, the connection attempt will bypass the normal upgrade process and will initially try WebSocket. A connection attempt following a transport error will use the normal upgrade process. It is recommended you turn this on only when using SSL/TLS connections, or if you know that your network does not block websockets.

### `path`

Default value: `/socket.io/`

It is the name of the path that is captured on the server side.

:::caution

The server and the client values must match (unless you are using a path-rewriting proxy in between).

:::

*Client*

```js
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  path: "/my-custom-path/"
});
```

*Server*

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/my-custom-path/"
});
```

Please note that this is different from the path in the URI, which represents the [Namespace](categories/06-Advanced/namespaces.md).

Example:

```js
import { io } from "socket.io-client";

const socket = io("https://example.com/order", {
  path: "/my-custom-path/"
});
```

- the Socket instance is attached to the "order" Namespace
- the HTTP requests will look like: `GET https://example.com/my-custom-path/?EIO=4&transport=polling&t=ML4jUwU`

### `query`

Default value: -

Additional query parameters (then found in `socket.handshake.query` object on the server-side).

Example:

*Client*

```js
import { io } from "socket.io-client";

const socket = io({
  query: {
    x: 42
  }
});
```

*Server*

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.query); // prints { x: "42", EIO: "4", transport: "polling" }
});
```

The query parameters cannot be updated for the duration of the session, so changing the `query` on the client-side will only be effective when the current session gets closed and a new one is created:

```js
socket.io.on("reconnect_attempt", () => {
  socket.io.opts.query.x++;
});
```

Note: the following query parameters are reserved and can't be used in your application:

- `EIO`: the version of the protocol (currently, "4")
- `transport`: the transport name ("polling" or "websocket")
- `sid`: the session ID
- `j`: if the transport is polling but a JSONP response is required
- `t`: a hashed-timestamp used for cache-busting

### `extraHeaders`

Default value: -

Additional headers (then found in `socket.handshake.headers` object on the server-side).

Example:

*Client*

```js
import { io } from "socket.io-client";

const socket = io({
  extraHeaders: {
    "my-custom-header": "1234"
  }
});
```

*Server*

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.headers); // an object containing "my-custom-header": "1234"
});
```

:::caution

In a browser environment, the `extraHeaders` option will be ignored if you only enable the WebSocket transport, since the WebSocket API in the browser does not allow providing custom headers.

```js
import { io } from "socket.io-client";

const socket = io({
  transports: ["websocket"],
  extraHeaders: {
    "my-custom-header": "1234" // ignored
  }
});
```

This will work in Node.js or in React-Native though.

:::

Documentation: [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

### `withCredentials`

Default value: `false`

Whether or not cross-site requests should made using credentials such as cookies, authorization headers or TLS client certificates. Setting `withCredentials` has no effect on same-site requests.

```js
import { io } from "socket.io-client";

const socket = io("https://my-backend.com", {
  withCredentials: true
});
```

The server needs to send the right `Access-Control-Allow-* ` headers to allow the connection:

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://my-frontend.com",
    credentials: true
  }
});
```

:::caution

You cannot use `origin: *` when setting `withCredentials` to `true`. This will trigger the following error:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ‘.../socket.io/?EIO=4&transport=polling&t=NvQfU77’. (Reason: Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’)</i>

:::

Documentation:

- [XMLHttpRequest.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)
- [Handling CORS](categories/02-Server/handling-cors.md)

### `forceBase64`

Default value: `false`

Whether to force base64 encoding for binary content sent over WebSocket (always enabled for HTTP long-polling).

### `timestampRequests`

Default value: `true`

Whether to add the timestamp query param to each request (for cache busting).

### `timestampParam`

Default value: `"t"`

The name of the query parameter to use as our timestamp key.

### `closeOnBeforeunload`

*Added in v4.1.0*

Default value: `true`

Whether to (silently) close the connection when the [`beforeunload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) event is emitted in the browser.

With `closeOnBeforeunload` set to `false`, a `disconnect` event will be emitted by the Socket instance when the user reloads the page on Firefox (but not on Chrome or Safari).

With `closeOnBeforeunload` set to `true`, all browsers will have the same behavior (no `disconnect` event when reloading the page). But this might cause issues if you use the `beforeunload` event in your application.

### `protocols`

*Added in v2.0.0*

Default value: -

Either a single protocol string or an array of protocol strings. These strings are used to indicate sub-protocols, so that a single server can implement multiple WebSocket sub-protocols (for example, you might want one server to be able to handle different types of interactions depending on the specified protocol).

```js
import { io } from "socket.io-client";

const socket = io({
  transports: ["websocket"],
  protocols: ["my-protocol-v1"]
});
```

Server:

```js
io.on("connection", (socket) => {
  const transport = socket.conn.transport;
  console.log(transport.socket.protocol); // prints "my-protocol-v1"
});
```

References:

- https://datatracker.ietf.org/doc/html/rfc6455#section-1.9
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket

### `autoUnref`

*Added in v4.0.0*

Default value: `false`

With `autoUnref` set to `true`, the Socket.IO client will allow the program to exit if there is no other active timer/TCP socket in the event system (even if the client is connected):

```js
import { io } from "socket.io-client";

const socket = io({
  autoUnref: true
});
```

See also: https://nodejs.org/api/timers.html#timeoutunref


### Node.js-specific options

The following options are supported:

- `agent`
- `pfx`
- `key`
- `passphrase`
- `cert`
- `ca`
- `ciphers`
- `rejectUnauthorized`

Please refer to the Node.js documentation:

- [tls.connect(options[, callback])](https://nodejs.org/dist/latest/docs/api/tls.html#tls_tls_connect_options_callback)
- [tls.createSecureContext([options])](https://nodejs.org/dist/latest/docs/api/tls.html#tls_tls_createsecurecontext_options)

Example with a self-signed certificate:

*Client*

```js
import { readFileSync } from "fs";
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  ca: readFileSync("./cert.pem")
});
```

*Server*

```js
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpServer = createServer({
  cert: readFileSync("./cert.pem"),
  key: readFileSync("./key.pem")
});
const io = new Server(httpServer);
```

Example with client-certificate authentication:

*Client*

```js
import { readFileSync } from "fs";
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  ca: readFileSync("./server-cert.pem"),
  cert: readFileSync("./client-cert.pem"),
  key: readFileSync("./client-key.pem"),
});
```

*Server*

```js
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpServer = createServer({
  cert: readFileSync("./server-cert.pem"),
  key: readFileSync("./server-key.pem"),
  requestCert: true,
  ca: [
    readFileSync("client-cert.pem")
  ]
});
const io = new Server(httpServer);
```

:::caution

`rejectUnauthorized` is a Node.js-only option, it will not bypass the security check in the browser:

![Security warning in the browser](/images/self-signed-certificate.png)

:::

## Manager options

:::info

These settings will be shared by all Socket instances attached to the same Manager.

:::

### `reconnection`

Default value: `true`

Whether reconnection is enabled or not. If set to `false`, you need to manually reconnect:

```js
import { io } from "socket.io-client";

const socket = io({
  reconnection: false
});

const tryReconnect = () => {
  setTimeout(() => {
    socket.io.open((err) => {
      if (err) {
        tryReconnect();
      }
    });
  }, 2000);
}

socket.io.on("close", tryReconnect);
```

### `reconnectionAttempts`

Default value: `Infinity`

The number of reconnection attempts before giving up.

### `reconnectionDelay`

Default value: `1000`

The initial delay before reconnection in milliseconds (affected by the [randomizationFactor](#randomizationfactor) value).

### `reconnectionDelayMax`

Default value: `5000`

The maximum delay between two reconnection attempts. Each attempt increases the reconnection delay by 2x.

### `randomizationFactor`

Default value: `0.5`

The randomization factor used when reconnecting (so that the clients do not reconnect at the exact same time after a server crash, for example).

Example with the default values:

- 1st reconnection attempt happens between 500 and 1500 ms (`1000 * 2^0 * (<something between -0.5 and 1.5>)`)
- 2nd reconnection attempt happens between 1000 and 3000 ms (`1000 * 2^1 * (<something between -0.5 and 1.5>)`)
- 3rd reconnection attempt happens between 2000 and 5000 ms (`1000 * 2^2 * (<something between -0.5 and 1.5>)`)
- next reconnection attempts happen after 5000 ms

### `timeout`

Default value: `20000`

The timeout in milliseconds for each connection attempt.

### `autoConnect`

Default value: `true`

Whether to automatically connect upon creation. If set to `false`, you need to manually connect:

```js
import { io } from "socket.io-client";

const socket = io({
  autoConnect: false
});

socket.connect();
// or
socket.io.open();
```

### `parser`

*Added in v2.2.0*

Default value: `require("socket.io-parser")`

The parser used to marshall/unmarshall packets. Please see [here](categories/06-Advanced/custom-parser.md) for more information.

## Socket options

:::info

These settings are specific to the given Socket instance.

:::

### `auth`

*Added in v3.0.0*

Default value: -

Credentials that are sent when accessing a namespace (see also [here](categories/02-Server/middlewares.md#sending-credentials)).

Example:

*Client*

```js
import { io } from "socket.io-client";

const socket = io({
  auth: {
    token: "abcd"
  }
});

// or with a function
const socket = io({
  auth: (cb) => {
    cb({ token: localStorage.token })
  }
});
```

*Server*

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.auth); // prints { token: "abcd" }
});
```

You can update the `auth` map when the access to the Namespace is denied:

```js
socket.on("connect_error", (err) => {
  if (err.message === "invalid credentials") {
    socket.auth.token = "efgh";
    socket.connect();
  }
});
```

Or manually force the Socket instance to reconnect:

```js
socket.auth.token = "efgh";
socket.disconnect().connect();
```
