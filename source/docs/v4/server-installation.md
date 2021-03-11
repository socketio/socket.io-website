title: Server Installation
short_title: Installation
permalink: /docs/v4/server-installation/
release: v4
type: docs
order: 201
---

## Prerequisites

Please make sure that [Node.js](https://nodejs.org/en/) is installed on your system. The current Long Term Support (LTS) release is an ideal starting point.

At least Node.js 10 is needed, older versions are not supported anymore.

## Installation

The latest Socket.IO release is:

[![NPM version](https://img.shields.io/npm/v/socket.io.svg?logo=npm)](https://www.npmjs.com/package/socket.io)

To install the latest release:

```
$ npm install socket.io
```

To install a specific version:

```
$ npm install socket.io@<version>
```

## Additional packages

By default, Socket.IO use the WebSocket server provided by the [ws](https://www.npmjs.com/package/ws) package.

There are 2 optional packages that can be installed alongside this package. These packages are binary add-ons which improve certain operations. Prebuilt binaries are available for the most popular platforms so you don't necessarily need to have a C++ compiler installed on your machine.

- [bufferutil](https://www.npmjs.com/package/bufferutil): Allows to efficiently perform operations such as masking and unmasking the data payload of the WebSocket frames.
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate): Allows to efficiently check if a message contains valid UTF-8 as required by the spec.

To install those packages:

```
$ npm install --save-optional bufferutil utf-8-validate
```

Please note that these packages are optional, the WebSocket server will fallback to the Javascript implementation if they are not available. More information can be found [here](https://github.com/websockets/ws/#opt-in-for-performance-and-spec-compliance).

## Other WebSocket server implementations

Any Websocket server implementation which exposes the same API as ws (notably the [handleUpgrade](https://github.com/websockets/ws/blob/master/doc/ws.md#serverhandleupgraderequest-socket-head-callback) method) can be used.

For example, you can use the [eiows](https://www.npmjs.com/package/eiows) package, which is a fork of the (now deprecated) [uws](https://www.npmjs.com/package/uws) package:

```
$ npm install eiows
```

And then use the `wsEngine` option:

```js
const io = require("socket.io")(3000, {
  wsEngine: require("eiows").Server
});
```

This implementation "allows, but doesn't guarantee" significant performance and memory-usage improvements over the default implementation. As usual, please benchmark it against your own usage.
