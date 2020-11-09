title: Initialization
permalink: /docs/v2/client-initialization/
release: v2
type: docs
order: 302
---

Once you have [installed](/docs/client-installation/) the Socket.IO client library, you can now init the client. The complete list of options can be found [here](/docs/client-api/#new-Manager-url-options).

In the examples below, the `io` object comes either from:

- the `<script>` import

```html
<script src="/socket.io/socket.io.js"></script>
```

- NPM

```js
// ES6 import
import io from 'socket.io-client';
// CommonJS
const io = require('socket.io-client');
```

## From the same domain

If your front is served on the same domain as your server, you can simply use:

```js
const socket = io();
```

The server URL will be deduced from the [window.location](https://developer.mozilla.org/en-US/docs/Web/API/Window/location) object.

Additional options can be passed:

```js
// default values
const socket = io({
  path: '/socket.io',
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 20000,
  autoConnect: true,
  query: {},
  // options of the Engine.IO client
  upgrade: true,
  forceJSONP: false,
  jsonp: true,
  forceBase64: false,
  enablesXDR: false,
  timestampRequests: true,
  timestampParam: 't',
  policyPort: 843,
  transports: ['polling', 'websocket'],
  transportOptions: {},
  rememberUpgrade: false,
  onlyBinaryUpgrades: false,
  requestTimeout: 0,
  protocols: [],
  // options for Node.js
  agent: false,
  pfx: null,
  key: null,
  passphrase: null,
  cert: null,
  ca: null,
  ciphers: [],
  rejectUnauthorized: true,
  perMessageDeflate: true,
  forceNode: false,
  localAddress: null,
  // options for Node.js / React Native
  extraHeaders: {},
});
```

## From a different domain

In case your front is not served from the same domain as your server, you have to pass the URL of your server.

```js
const socket = io('https://server-domain.com');
```

## Custom namespace

In the examples above, the client will connect to the default namespace. Using only the default namespace should be sufficient for most use cases, but you can specify the namespace with:

```js
// same origin version
const socket = io('/admin');
// cross origin version
const socket = io('https://server-domain.com/admin');
```

You can find more details about namespaces [here](/docs/namespaces/).

## Notable options

### `transports` option

By default, the client will try to establish a WebSocket connection, and fall back to XHR/JSONP polling.

If you are sure the WebSocket connection will succeed, you can disable the polling transport:

```js
const socket = io({
  transports: ['websocket']
});
```

In that case, due to the nature of the WebSocket connection, you can have several server instances without sticky sessions. More information [here](/docs/using-multiple-nodes/).
