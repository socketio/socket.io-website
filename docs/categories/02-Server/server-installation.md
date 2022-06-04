---
title: Server Installation
sidebar_label: Installation
sidebar_position: 1
slug: /server-installation/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 先决条件

请确保在操作系统中安装了[Node.js](https://nodejs.org/en/) . 当前的长期支持版本 (LTS) 是一个不错的选择, 见[here](https://github.com/nodejs/Release#release-schedule).

:::info

最低支持Node.js 10, 更早期的版本不再支持.

:::

## 安装

安装最新发布版本:

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

安装指定版本:

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

## 最近发布版本

- [4.5.0](/blog/socket-io-4-5-0/) (2022/04/23): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.5.0) / [diff](https://github.com/socketio/socket.io/compare/4.4.1...4.5.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.5.0)
- 4.4.1 (2022/01/06): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.4.1) / [diff](https://github.com/socketio/socket.io/compare/4.4.0...4.4.1) / [npm](https://www.npmjs.com/package/socket.io/v/4.4.1)
- [4.4.0](/blog/socket-io-4-4-0/) (2021/11/18): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.4.0) / [diff](https://github.com/socketio/socket.io/compare/4.3.2...4.4.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.4.0)
- 4.3.2 (2021/11/08): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.2) / [diff](https://github.com/socketio/socket.io/compare/4.3.1...4.3.2) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.2)
- 4.3.1 (2021/10/17): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.1) / [diff](https://github.com/socketio/socket.io/compare/4.3.0...4.3.1) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.1)
- [4.3.0](/blog/socket-io-4-3-0/) (2021/10/15): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.0) / [diff](https://github.com/socketio/socket.io/compare/4.2.0...4.3.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.0)
- 4.2.0 (2021/08/30): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.2.0) / [diff](https://github.com/socketio/socket.io/compare/4.1.3...4.2.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.2.0)

## 拓展工具包

默认Socket.IO使用[ws](https://www.npmjs.com/package/ws)提供的WebSocket.

有2个可选安装包可以一起安装. 这些包是二进制的插件，可以提升默写操作的性能. 于构建的二进制包支持大多数操作系统，所以你不需要独立安装C++编译器.

- [bufferutil](https://www.npmjs.com/package/bufferutil): Allows to efficiently perform operations such as masking and unmasking the data payload of the WebSocket frames.
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate): Allows to efficiently check if a message contains valid UTF-8 as required by the spec.

安装拓展包:

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

请注意这些包是可选安装的, 如果他们不可用的话WebSocket服务端将会降级为Javascript的实现. 更多信息请参考[here](https://github.com/websockets/ws/#opt-in-for-performance-and-spec-compliance).

## 其他Websocket服务端实现

任何开放了和ws(尤其是[handleUpgrade](https://github.com/websockets/ws/blob/master/doc/ws.md#serverhandleupgraderequest-socket-head-callback)方法)相同API的Websocket服务端实现都可以使用.

例如, 你可以使用[eiows](https://www.npmjs.com/package/eiows)库, 这个库是[uws](https://www.npmjs.com/package/uws)(已经deprecated)的fork版本:

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

然后设置`wsEngine`属性:

```js
const { Server } = require("socket.io");
const eiows = require("eiows");

const io = new Server(3000, {
  wsEngine: eiows.Server
});
```

第三方实现相较于默认实现通常具有更好的性能和更小的内存占用，秉持"允许, 但是不保证"的态度. 通常请根据自己的使用情况进行测试.

## 集成`µWebSockets.js` {#usage-with-uwebsockets}

从[4.4.0](/blog/socket-io-4-4-0/)版本开始, Socket.IO服务端可以绑定到[`µWebSockets.js`](https://github.com/uNetworking/uWebSockets.js)服务端上.

安装:

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

使用:

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

### 依赖树

基础的安装包包括23个依赖:

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

为了方便Typescript用户, 安装包已包含了第三方包的类型声明文件(略微增大安装包的体积). 

另行参考: https://github.com/microsoft/types-publisher/issues/81#issuecomment-234051345

:::


### Transitive versions

`engine.io`依赖包负责底层链接(HTTP轮询或WebSocket).  另行参考: [How it works](../01-Documentation/how-it-works.md)

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
