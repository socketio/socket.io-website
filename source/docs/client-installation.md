title: Installation
permalink: /docs/client-installation/
type: docs
order: 301
---

## Compatibility

Socket.IO does support IE9 and above. IE 6/7/8 are not supported anymore.

Browser compatibility is tested thanks to the awesome Sauce Labs platform:

![Browser support](/images/saucelabs.svg)

## Release notes

The release notes of each version can be found in [GitHub](https://github.com/socketio/socket.io-client/releases).

## Installation

### Standalone build

By default, the Socket.IO server exposes a client bundle at `/socket.io/socket.io.js`.

`io` will be registered as a global variable:

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

If you don't need this (see other options below), you can disable the functionality on the server side:

```js
const io = require('socket.io')({
  serveClient: false
});
```

### From a CDN

You can also include the client bundle from a CDN:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
```

Socket.IO is also available from other CDN like [jsDelivr](https://cdn.jsdelivr.net/npm/socket.io-client@2.3.0/dist/socket.io.js) and [unpkg](https://unpkg.com/socket.io-client@2.3.0/dist/socket.io.js).

There are several bundles available:

| Name              | Size             | Description |
|:------------------|:-----------------|:------------|
| socket.io.js      | 19.8 kB min+gzip | Production version, with [debug](https://www.npmjs.com/package/debug)    |
| socket.io.slim.js | 15.6 kB min+gzip | Production version, without [debug](https://www.npmjs.com/package/debug) |
| socket.io.dev.js  | 38.5 kB gzip     | Unminified version, with [debug](https://www.npmjs.com/package/debug)    |

The [debug](https://www.npmjs.com/package/debug) package allows to print debug information to the console. You can find more information [here](/docs/logging-and-debugging/).

During development, we recommend to use the `socket.io.dev.js` bundle. By setting `localStorage.debug = 'socket.io-client:socket'`, any event received by the client will be printed to the console.

For production, please use the `socket.io.slim.js` bundle, which is an optimized build excluding the debug package.

### From NPM

The Socket.IO client is compatible with bundler like [webpack](https://webpack.js.org/) or [browserify](http://browserify.org/).

```
$ npm install socket.io-client
```

The client can also be run from Node.js.
