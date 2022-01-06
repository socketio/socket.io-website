---
title: Server Installation
sidebar_label: Installation
sidebar_position: 1
slug: /server-installation/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Prerequisites

Please make sure that [Node.js](https://nodejs.org/en/) is installed on your system. The current Long Term Support (LTS) release is an ideal starting point, see [here](https://github.com/nodejs/Release#release-schedule).

:::info

At least Node.js 10 is needed, older versions are not supported anymore.

:::

## Installation

To install the latest release:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install socket.io
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add socket.io
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add socket.io
```

  </TabItem>
</Tabs>

To install a specific version:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install socket.io@version
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add socket.io@version
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add socket.io@version
```

  </TabItem>
</Tabs>

## Latest releases

- 4.4.1 (2022-01-06): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.4.1) / [diff](https://github.com/socketio/socket.io/compare/4.4.0...4.4.1) / [npm](https://www.npmjs.com/package/socket.io/v/4.4.1)
- [4.4.0](/blog/socket-io-4-4-0/) (2021-11-18): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.4.0) / [diff](https://github.com/socketio/socket.io/compare/4.3.2...4.4.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.4.0)
- 4.3.2 (2021-11-08): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.2) / [diff](https://github.com/socketio/socket.io/compare/4.3.1...4.3.2) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.2)
- 4.3.1 (2021-10-17): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.1) / [diff](https://github.com/socketio/socket.io/compare/4.3.0...4.3.1) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.1)
- [4.3.0](/blog/socket-io-4-3-0/) (2021-10-15): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.0) / [diff](https://github.com/socketio/socket.io/compare/4.2.0...4.3.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.0)
- 4.2.0 (2021-08-30): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.2.0) / [diff](https://github.com/socketio/socket.io/compare/4.1.3...4.2.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.2.0)

## Additional packages

By default, Socket.IO use the WebSocket server provided by the [ws](https://www.npmjs.com/package/ws) package.

There are 2 optional packages that can be installed alongside this package. These packages are binary add-ons which improve certain operations. Prebuilt binaries are available for the most popular platforms so you don't necessarily need to have a C++ compiler installed on your machine.

- [bufferutil](https://www.npmjs.com/package/bufferutil): Allows to efficiently perform operations such as masking and unmasking the data payload of the WebSocket frames.
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate): Allows to efficiently check if a message contains valid UTF-8 as required by the spec.

To install those packages:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install --save-optional bufferutil utf-8-validate
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add --optional bufferutil utf-8-validate
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add -O bufferutil utf-8-validate
```

  </TabItem>
</Tabs>

Please note that these packages are optional, the WebSocket server will fallback to the Javascript implementation if they are not available. More information can be found [here](https://github.com/websockets/ws/#opt-in-for-performance-and-spec-compliance).

## Other WebSocket server implementations

Any Websocket server implementation which exposes the same API as ws (notably the [handleUpgrade](https://github.com/websockets/ws/blob/master/doc/ws.md#serverhandleupgraderequest-socket-head-callback) method) can be used.

For example, you can use the [eiows](https://www.npmjs.com/package/eiows) package, which is a fork of the (now deprecated) [uws](https://www.npmjs.com/package/uws) package:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install eiows
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add eiows
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add eiows
```

  </TabItem>
</Tabs>

And then use the `wsEngine` option:

```js
const { Server } = require("socket.io");
const eiows = require("eiows");

const io = new Server(3000, {
  wsEngine: eiows.Server
});
```

This implementation "allows, but doesn't guarantee" significant performance and memory-usage improvements over the default implementation. As usual, please benchmark it against your own usage.

## Usage with `uWebSocket.js`

Starting with version [4.4.0](/blog/socket-io-4-4-0/), a Socket.IO server can now bind to a `uWebSocket.js` server.

Installation:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install uWebSockets.js@uNetworking/uWebSockets.js#v20.4.0
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add uWebSockets.js@uNetworking/uWebSockets.js#v20.4.0
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add uWebSockets.js@uNetworking/uWebSockets.js#v20.4.0
```

  </TabItem>
</Tabs>

Usage:

```js
const { App } = require("uWebSockets.js");
const { Server } = require("socket.io");

const app = new App();
const io = new Server();

io.attachApp(app);

io.on("connection", (socket) => {
  // ...
});

app.listen(3000, (token) => {
  if (!token) {
    console.warn("port already in use");
  }
});
```
