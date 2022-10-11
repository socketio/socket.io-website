---
title: 服务器安装
sidebar_label: 安装
sidebar_position: 1
slug: /server-installation/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 必要条件 {#prerequisites}

请确保[Node.js](https://nodejs.org/en/)已安装在您的系统上。推荐使用长期支持（LTS）版本，请参见[此处](https://github.com/nodejs/Release#release-schedule).

:::info

至少需要 Node.js 10，不再支持旧版本。

:::

## 安装 {#installation}

要安装最新版本：

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

安装特定版本：

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

## 最新版本 {#latest-releases}

- 4.4.1 (2022-01-06): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.4.1) / [diff](https://github.com/socketio/socket.io/compare/4.4.0...4.4.1) / [npm](https://www.npmjs.com/package/socket.io/v/4.4.1)
- [4.4.0](/blog/socket-io-4-4-0/) (2021-11-18): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.4.0) / [diff](https://github.com/socketio/socket.io/compare/4.3.2...4.4.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.4.0)
- 4.3.2 (2021-11-08): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.2) / [diff](https://github.com/socketio/socket.io/compare/4.3.1...4.3.2) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.2)
- 4.3.1 (2021-10-17): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.1) / [diff](https://github.com/socketio/socket.io/compare/4.3.0...4.3.1) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.1)
- [4.3.0](/blog/socket-io-4-3-0/) (2021-10-15): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.3.0) / [diff](https://github.com/socketio/socket.io/compare/4.2.0...4.3.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.3.0)
- 4.2.0 (2021-08-30): [GitHub release](https://github.com/socketio/socket.io/releases/tag/4.2.0) / [diff](https://github.com/socketio/socket.io/compare/4.1.3...4.2.0) / [npm](https://www.npmjs.com/package/socket.io/v/4.2.0)

## 其他软件包 {#additional-packages}

默认情况下，Socket.IO 使用[ws](https://www.npmjs.com/package/ws)包提供的 WebSocket 服务器。

有 2 个可选包可以与此包一起安装。这些软件包是改进某些操作的二进制附加组件。预构建的二进制文件可用于最流行的平台，因此您不一定需要在计算机上安装 C++ 编译器。

- [bufferutil](https://www.npmjs.com/package/bufferutil)：允许有效地执行操作，例如屏蔽和取消屏蔽 WebSocket 帧的数据负载。
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate)：允许有效地检查消息是否包含规范要求的有效 UTF-8。

安装这些软件包：

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

请注意，这些包是可选的，如果它们不可用，WebSocket 服务器将回退到 Javascript 实现。更多信息可以在[这里](https://github.com/websockets/ws/#opt-in-for-performance-and-spec-compliance)找到。

## 其他WebSocket服务器实现 {#other-websocket-server-implementations}

可以使用任何公开与 ws 相同的 API（特别是[handleUpgrade](https://github.com/websockets/ws/blob/master/doc/ws.md#serverhandleupgraderequest-socket-head-callback)方法）的 Websocket 服务器实现。

例如，您可以使用[eiows](https://www.npmjs.com/package/eiows)包，它是（现已弃用的）[uws](https://www.npmjs.com/package/uws)包的一个分支：

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

然后使用`wsEngine`选项：

```js
const { Server } = require("socket.io");
const eiows = require("eiows");

const io = new Server(3000, {
  wsEngine: eiows.Server
});
```

与默认实现相比，此实现“允许但不保证”显着的性能和内存使用改进。像往常一样，请根据您自己的使用情况对其进行基准测试。

## 使用 `µWebSockets.js` {#usage-with-µwebsocketsjs}

从版本[4.4.0](/blog/socket-io-4-4-0/)开始，Socket.IO 服务器现在可以绑定到[`µWebSockets.js`](https://github.com/uNetworking/uWebSockets.js)服务器。

安装：

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

用法：

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

## 杂项 {#miscellaneous}

### 依赖树 {#dependency-tree}

服务器的基本安装包括 23 个软件包：

```
└─┬ socket.io@4.4.1
  ├─┬ accepts@1.3.7
  │ ├─┬ mime-types@2.1.34
  │ │ └── mime-db@1.51.0
  │ └── negotiator@0.6.2
  ├── base64id@2.0.0
  ├─┬ debug@4.3.3
  │ └── ms@2.1.2
  ├─┬ engine.io@6.1.1
  │ ├── @types/cookie@0.4.1
  │ ├── @types/cors@2.8.12
  │ ├── @types/node@17.0.8
  │ ├── accepts@1.3.7 deduped
  │ ├── base64id@2.0.0 deduped
  │ ├── cookie@0.4.1
  │ ├─┬ cors@2.8.5
  │ │ ├── object-assign@4.1.1
  │ │ └── vary@1.1.2
  │ ├── debug@4.3.3 deduped
  │ ├─┬ engine.io-parser@5.0.2
  │ │ └── base64-arraybuffer@1.0.1
  │ └─┬ ws@8.2.3
  │   ├── UNMET OPTIONAL DEPENDENCY bufferutil@^4.0.1
  │   └── UNMET OPTIONAL DEPENDENCY utf-8-validate@^5.0.2
  ├── socket.io-adapter@2.3.3
  └─┬ socket.io-parser@4.0.4
    ├── @types/component-emitter@1.2.11
    ├── component-emitter@1.3.0
    └── debug@4.3.3 deduped
```

:::info

包括第 3 方包的类型声明，以方便 TypeScript 用户使用该库（但代价是包稍大一些）。

另见： https://github.com/microsoft/types-publisher/issues/81#issuecomment-234051345

:::


### 对应版本 {#transitive-versions}

该 `engine.io`软件包带来了负责管理低级连接（HTTP 长轮询或 WebSocket）的引擎。另请参阅：[运作原理](../01-Documentation/how-it-works.md)

| `socket.io` 版本 | `engine.io` 版本 | `ws` 版本 |
|---------------------|---------------------|--------------|
| `4.4.x`             | `6.1.x`             | `8.2.x`      |
| `4.3.x`             | `6.0.x`             | `8.2.x`      |
| `4.2.x`             | `5.2.x`             | `7.4.x`      |
| `4.1.x`             | `5.1.x`             | `7.4.x`      |
| `4.0.x`             | `5.0.x`             | `7.4.x`      |
| `3.1.x`             | `4.1.x`             | `7.4.x`      |
| `3.0.x`             | `4.0.x`             | `7.4.x`      |
| `2.4.x`             | `3.5.x`             | `7.4.x`      |
