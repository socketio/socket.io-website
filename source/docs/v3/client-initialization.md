title: Client Initialization
short_title: Initialization
permalink: /docs/v3/client-initialization/
alias: /docs/client-initialization/
release: v3
type: docs
order: 302
---

Once you have [installed](/docs/v3/client-installation/) the Socket.IO client library, you can now init the client. The complete list of options can be found [below](#Options).

In the examples below, the `io` object comes either from:

- the `<script>` import

```html
<script src="/socket.io/socket.io.js"></script>
```

- NPM

```js
// ES6 import or TypeScript
import { io } from "socket.io-client";
// CommonJS
const io = require("socket.io-client");
```

## From the same domain

If your front is served on the same domain as your server, you can simply use:

```js
const socket = io();
```

The server URL will be deduced from the [window.location](https://developer.mozilla.org/en-US/docs/Web/API/Window/location) object.

## From a different domain

In case your front is not served from the same domain as your server, you have to pass the URL of your server.

```js
const socket = io("https://server-domain.com");
```

In that case, please make sure to enable [Cross-Origin Resource Sharing (CORS)](/docs/v3/handling-cors/) on the server.

Note: You can use either `https` or `wss` (respectively, `http` or `ws`).

```js
// the following forms are similar
const socket = io("https://server-domain.com");
const socket = io("wss://server-domain.com");
const socket = io("server-domain.com"); // only in the browser when the page is served over https (will not work in Node.js)
```

## Custom namespace

In the examples above, the client will connect to the main namespace. Using only the main namespace should be sufficient for most use cases, but you can specify the namespace with:

```js
// same origin version
const socket = io("/admin");
// cross origin version
const socket = io("https://server-domain.com/admin");
```

You can find more details about namespaces [here](/docs/v3/namespaces/).

## Options

- [IO factory options](#IO-factory-options)
  - [forceNew](#forceNew)
  - [multiplex](#multiplex)
- [Low-level engine options](#Low-level-engine-options)
  - [transports](#transports)
  - [upgrade](#upgrade)
  - [rememberUpgrade](#rememberUpgrade)
  - [path](#path)
  - [query](#query)
  - [extraHeaders](#extraHeaders)
  - [withCredentials](#withCredentials)
  - [forceBase64](#forceBase64)
  - [timestampRequests](#timestampRequests)
  - [timestampParam](#timestampParam)
  - [Node.js-specific options](#Node-js-specific-options) (like `agent`, `cert` or `rejectUnauthorized`)
- [Manager options](#Manager-options)
  - [reconnection](#reconnection)
  - [reconnectionAttempts](#reconnectionAttempts)
  - [reconnectionDelay](#reconnectionDelay)
  - [reconnectionDelayMax](#reconnectionDelayMax)
  - [randomizationFactor](#randomizationFactor)
  - [timeout](#timeout)
  - [autoConnect](#autoConnect)
  - [parser](#parser)
- [Socket options](#Socket-options)
  - [auth](#auth)

### IO factory options

#### `forceNew`

Default value: `false`

Whether to create a new Manager instance.

A Manager instance is in charge of the low-level connection to the server (established with HTTP long-polling or WebSocket). It handles the reconnection logic.

A Socket instance is the interface which is used to sends events to — and receive events from — the server. It belongs to a given [namespace](/docs/v3/namespaces/).

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

#### `multiplex`

Default value: `true`

The opposite of `forceNew`: whether to reuse an existing Manager instance.

### Low-level engine options

Note: These settings will be shared by all Socket instances attached to the same Manager.

#### `transports`

Default value: `["polling", "websocket"]`

The low-level connection to the Socket.IO server can either be established with:

- HTTP long-polling: successive HTTP requests (`POST` for writing, `GET` for reading)
- [WebSocket](https://en.wikipedia.org/wiki/WebSocket)

The following example disables the HTTP long-polling transport:

```js
const socket = io("https://example.com", { transports: ["websocket"] });
```

Note: in that case, sticky sessions are not required on the server side (more information [here](/docs/v3/using-multiple-nodes/)).

By default, the HTTP long-polling connection is established first, and then an upgrade to WebSocket is attempted (explanation [here](/docs/v3/how-it-works/#Upgrade-mechanism)). You can use WebSocket first with:

```js
const socket = io("https://example.com", {
  transports: ["websocket", "polling"] // use WebSocket first, if available
});

socket.on("connect_error", () => {
  // revert to classic upgrade
  socket.io.opts.transports = ["polling", "websocket"];
});
```

One possible downside is that the validity of your [CORS configuration](/docs/v3/handling-cors/) will only be checked if the WebSocket connection fails to be established.

#### `upgrade`

Default value: `true`

Whether the client should try to upgrade the transport from HTTP long-polling to something better.

#### `rememberUpgrade`

Default value: `false`

If true and if the previous WebSocket connection to the server succeeded, the connection attempt will bypass the normal upgrade process and will initially try WebSocket. A connection attempt following a transport error will use the normal upgrade process. It is recommended you turn this on only when using SSL/TLS connections, or if you know that your network does not block websockets.

#### `path`

Default value: `/socket.io/`

It is the name of the path that is captured on the server side.

The server and the client values must match (unless you are using a path-rewriting proxy in between):

*Client*

```js
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  path: "/my-custom-path/"
});
```

*Server*

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  path: "/my-custom-path/"
});
```

Please note that this is different from the path in the URI, which represents the [Namespace](https://socket.io/docs/v3/namespaces/).

Example:

```js
import { io } from "socket.io-client";

const socket = io("https://example.com/order", {
  path: "/my-custom-path/"
});
```

- the Socket instance is attached to the "order" Namespace
- the HTTP requests will look like: `GET https://example.com/my-custom-path/?EIO=4&transport=polling&t=ML4jUwU`

#### `query`

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

#### `extraHeaders`

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

A few notes:

- this will not work when using only WebSocket in a browser

```js
import { io } from "socket.io-client";

const socket = io({
  transports: ["websocket"],
  extraHeaders: {
    "my-custom-header": "1234" // WARN: this will be ignored in a browser
  }
});
```

This will work in Node.js or in React-Native though.

- you can update the headers during a session, but it will not be reflected on the server-side (as the `socket.handshake.headers` object contains the headers that were sent during the Socket.IO handshake).

```js
const socket = io({
  extraHeaders: {
    count: 0
  }
});

setInterval(() => {
  socket.io.opts.extraHeaders.count++;
}, 1000);
```

#### `withCredentials`

Default value: `false`

Whether or not cross-site requests should made using credentials such as cookies, authorization headers or TLS client certificates. Setting `withCredentials` has no effect on same-site requests.

```js
import { io } from "socket.io-client";

const socket = io({
  withCredentials: true
});
```

Documentation:

- [XMLHttpRequest.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)
- [Handling CORS](/docs/v3/handling-cors/)

#### `forceBase64`

Default value: `false`

Whether to force base64 encoding for binary content sent over WebSocket (always enabled for HTTP long-polling).

#### `timestampRequests`

Default value: `true`

Whether to add the timestamp query param to each request (for cache busting).

#### `timestampParam`

Default value: `"t"`

The name of the query parameter to use as our timestamp key.

#### Node.js-specific options

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

* Client

```js
const fs = require("fs");
const socket = require("socket.io-client")("https://example.com", {
  ca: fs.readFileSync("./cert.pem")
});
```

* Server

```js
const fs = require("fs");
const server = require("https").createServer({
  cert: fs.readFileSync("./cert.pem"),
  key: fs.readFileSync("./key.pem")
});
const io = require("socket.io")(server);
```

Example with client-certificate authentication:

* Client

```js
const fs = require("fs");
const socket = require("socket.io-client")("https://example.com", {
  ca: fs.readFileSync("./server-cert.pem"),
  cert: fs.readFileSync("./client-cert.pem"),
  key: fs.readFileSync("./client-key.pem"),
});
```

* Server

```js
const fs = require("fs");
const server = require("https").createServer({
  cert: fs.readFileSync("./server-cert.pem"),
  key: fs.readFileSync("./server-key.pem"),
  requestCert: true,
  ca: [
    fs.readFileSync('client-cert.pem')
  ]
});
const io = require("socket.io")(server);
```

**Import note:** `rejectUnauthorized` is a Node.js-only option, it will not bypass the security check in the browser:

![Security warning in the browser](/images/self-signed-certificate.png)

### Manager options

Note: These settings will be shared by all Socket instances attached to the same Manager.

#### reconnection

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

#### reconnectionAttempts

Default value: `Infinity`

The number of reconnection attempts before giving up.

#### reconnectionDelay

Default value: `1000`

The initial delay before reconnection in milliseconds (affected by the [randomizationFactor](#randomizationFactor) value).

#### reconnectionDelayMax

Default value: `5000`

The maximum delay between two reconnection attempts. Each attempt increases the reconnection delay by 2x.

#### randomizationFactor

Default value: `0.5`

The randomization factor used when reconnecting (so that the clients do not reconnect at the exact same time after a server crash, for example).

Example with the default values:

- 1st reconnection attempt happens between 500 and 1500 ms (`1000 * 2^0 * (<something between -0.5 and 1.5>)`)
- 2nd reconnection attempt happens between 1000 and 3000 ms (`1000 * 2^1 * (<something between -0.5 and 1.5>)`)
- 3rd reconnection attempt happens between 2000 and 5000 ms (`1000 * 2^2 * (<something between -0.5 and 1.5>)`)
- next reconnection attempts happen after 5000 ms

#### timeout

Default value: `20000`

The timeout in milliseconds for each connection attempt.

#### autoConnect

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

#### `parser`

<span class="changelog">Added in v2.2.0</span>

Default value: `require("socket.io-parser")`

The parser used to marshall/unmarshall packets. Please see [here](/docs/v3/custom-parser) for more information.

### Socket options

Note: These settings are specific to the given Socket instance.

#### `auth`

<span class="changelog">Added in v3.0.0</span>

Default value: -

Credentials that are sent when accessing a namespace (see also [here](/docs/v3/middlewares/#Sending-credentials)).

Example:

*Client*

```js
import { io } from "socket.io-client";

const socket = io({
  auth: {
    token: "abcd"
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
