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

- [4.5.0](/blog/socket-io-4-5-0/) (2022/04/23): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.5.0) / [diff](https://github.com/socketio/socket.io/compare/4.4.1...4.5.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.5.0)
- 4.4.1 (2022/01/06): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.4.1) / [diff](https://github.com/socketio/socket.io/compare/4.4.0...4.4.1) / [npm](https://www.npmjs.com/package/socket.io/v/4.4.1)
- [4.4.0](/blog/socket-io-4-4-0/) (2021/11/18): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.4.0) / [diff](https://github.com/socketio/socket.io/compare/4.3.2...4.4.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.4.0)
- 4.3.2 (2021/11/08): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.2) / [diff](https://github.com/socketio/socket.io/compare/4.3.1...4.3.2) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.2)
- 4.3.1 (2021/10/17): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.1) / [diff](https://github.com/socketio/socket.io/compare/4.3.0...4.3.1) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.1)
- [4.3.0](/blog/socket-io-4-3-0/) (2021/10/15): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.0) / [diff](https://github.com/socketio/socket.io/compare/4.2.0...4.3.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.0)
- 4.2.0 (2021/08/30): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.2.0) / [diff](https://github.com/socketio/socket.io/compare/4.1.3...4.2.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.2.0)

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

## Usage with `µWebSockets.js` {#usage-with-uwebsockets}

Starting with version [4.4.0](/blog/socket-io-4-4-0/), a Socket.IO server can now bind to a [`µWebSockets.js`](https://github.com/uNetworking/uWebSockets.js) server.

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

## Miscellaneous

### Dependency tree

A basic installation of the server includes 23 packages:

```
└─┬ socket.io@4.5.0
  ├─┬ accepts@1.3.8
  │ ├─┬ mime-types@2.1.35
  │ │ └── mime-db@1.52.0
  │ └── negotiator@0.6.3
  ├── base64id@2.0.0
  ├─┬ debug@4.3.4
  │ └── ms@2.1.2
  ├─┬ engine.io@6.2.0
  │ ├── @types/cookie@0.4.1
  │ ├── @types/cors@2.8.12
  │ ├── @types/node@17.0.26
  │ ├── accepts@1.3.8 deduped
  │ ├── base64id@2.0.0 deduped
  │ ├── cookie@0.4.2
  │ ├─┬ cors@2.8.5
  │ │ ├── object-assign@4.1.1
  │ │ └── vary@1.1.2
  │ ├── debug@4.3.4 deduped
  │ ├─┬ engine.io-parser@5.0.3
  │ │ └── @socket.io/base64-arraybuffer@1.0.2
  │ └─┬ ws@8.2.3
  │   ├── UNMET OPTIONAL DEPENDENCY bufferutil@^4.0.1
  │   └── UNMET OPTIONAL DEPENDENCY utf-8-validate@^5.0.2
  ├── socket.io-adapter@2.4.0
  └─┬ socket.io-parser@4.0.4
    ├── @types/component-emitter@1.2.11
    ├── component-emitter@1.3.0
    └── debug@4.3.4 deduped
```

:::info

The type declarations for 3rd party packages are included, in order to ease the use of the library for TypeScript users (but at the cost of a slightly-larger package). 

See also: https://github.com/microsoft/types-publisher/issues/81#issuecomment-234051345

:::


### Transitive versions

The `engine.io` package brings the engine that is responsible for managing the low-level connections (HTTP long-polling or WebSocket).  See also: [How it works](../01-Documentation/how-it-works.md)

| `socket.io` version | `engine.io` version | `ws` version |
|---------------------|---------------------|--------------|
| `4.5.x`             | `6.2.x`             | `8.2.x`      |
| `4.4.x`             | `6.1.x`             | `8.2.x`      |
| `4.3.x`             | `6.0.x`             | `8.2.x`      |
| `4.2.x`             | `5.2.x`             | `7.4.x`      |
| `4.1.x`             | `5.1.x`             | `7.4.x`      |
| `4.0.x`             | `5.0.x`             | `7.4.x`      |
| `3.1.x`             | `4.1.x`             | `7.4.x`      |
| `3.0.x`             | `4.0.x`             | `7.4.x`      |
| `2.4.x`             | `3.5.x`             | `7.4.x`      |
