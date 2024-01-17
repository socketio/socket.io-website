---
title: 客户端安装
sidebar_label: 安装
sidebar_position: 1
slug: /client-installation/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 版本兼容性 {#version-compatibility}

下面是服务端和JS客户端的兼容性表：

<table>
    <tr>
        <th rowspan="2">JS 客户端版本</th>
        <th colspan="4">Socket.IO 服务器版本</th>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>YES</b></td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">3.x</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b></td>
    </tr>
    <tr>
        <td align="center">4.x</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b></td>
    </tr>
</table>

[1] 使用 [allowEIO3: true](../../server-options.md#alloweio3)

请查看相关的迁移指南：

- [v2 to v3](../07-Migrations/migrating-from-2-to-3.md)
- [v3 to v4](../07-Migrations/migrating-from-3-to-4.md)

## 浏览器支持 {#browser-support}

Socket.IO 确实支持 IE9 及更高版本。不再支持 IE 6/7/8。

由于很棒的 Sauce Labs 平台，对浏览器的兼容性进行了测试：

![Browser support](/images/saucelabs.svg)

## 最新版本 {#latest-releases}

- [4.5.0](/blog/socket-io-4-5-0/) (2022/04/23): [GitHub release](https://github.com/socketio/socket.io-client/releases/tag/4.5.0) / [diff](https://github.com/socketio/socket.io-client/compare/4.4.1...4.5.0) / [npm](https://www.npmjs.com/package/socket.io-client/v/4.5.0)
- 4.4.1 (2022/01/06): [GitHub release](https://github.com/socketio/socket.io-client/releases/tag/4.4.1) / [diff](https://github.com/socketio/socket.io-client/compare/4.4.0...4.4.1) / [npm](https://www.npmjs.com/package/socket.io-client/v/4.4.1)
- [4.4.0](/blog/socket-io-4-4-0/) (2021/11/18): [GitHub release](https://github.com/socketio/socket.io-client/releases/tag/4.4.0) / [diff](https://github.com/socketio/socket.io-client/compare/4.3.2...4.4.0) / [npm](https://www.npmjs.com/package/socket.io-client/v/4.4.0)
- 4.3.2 (2021/11/08): [GitHub release](https://github.com/socketio/socket.io-client/releases/tag/4.3.2) / [diff](https://github.com/socketio/socket.io-client/compare/4.3.1...4.3.2) / [npm](https://www.npmjs.com/package/socket.io-client/v/4.3.2)
- 4.3.1 (2021/10/17): [GitHub release](https://github.com/socketio/socket.io-client/releases/tag/4.3.1) / [diff](https://github.com/socketio/socket.io-client/compare/4.3.0...4.3.1) / [npm](https://www.npmjs.com/package/socket.io-client/v/4.3.1)
- [4.3.0](/blog/socket-io-4-3-0/) (2021/10/15): [GitHub release](https://github.com/socketio/socket.io-client/releases/tag/4.3.0) / [diff](https://github.com/socketio/socket.io-client/compare/4.2.0...4.3.0) / [npm](https://www.npmjs.com/package/socket.io-client/v/4.3.0)
- 4.2.0 (2021/08/30): [GitHub release](https://github.com/socketio/socket.io-client/releases/tag/4.2.0) / [diff](https://github.com/socketio/socket.io-client/compare/4.1.3...4.2.0) / [npm](https://www.npmjs.com/package/socket.io-client/v/4.2.0)

## 安装 {#installation}

### 独立构建 {#standalone-build}

默认情况下，Socket.IO 服务器在`/socket.io/socket.io.js`.

`io`将注册为全局变量：

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

如果您不需要此功能（请参阅下面的其他选项），您可以禁用服务器端的功能：

```js
const { Server } = require("socket.io");

const io = new Server({
  serveClient: false
});
```

### 使用CDN {#from-a-cdn}

您还可以包含来自 CDN 的客户端捆绑包：

```html
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js" integrity="sha384-Gr6Lu2Ajx28mzwyVR8CFkULdCU7kMlZ9UthllibdOSo6qAiN+yXNHqtgdTvFXMT4" crossorigin="anonymous"></script>
```

Socket.IO 也可从其他 CDN 获得：

- cdnjs: https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.4/socket.io.min.js
- jsDelivr: https://cdn.jsdelivr.net/npm/socket.io-client@4.7.4/dist/socket.io.min.js
- unpkg: https://unpkg.com/socket.io-client@4.7.4/dist/socket.io.min.js

有几个可用的捆绑包：

| Name              | Size             | Description |
|:------------------|:-----------------|:------------|
| socket.io.js               | 34.7 kB gzip     | 未压缩版，带 [debug](https://www.npmjs.com/package/debug)    |
| socket.io.min.js           | 14.7 kB min+gzip | 生产版，无[debug](https://www.npmjs.com/package/debug) |
| socket.io.msgpack.min.js   | 15.3 kB min+gzip | 生产版，无[debug](https://www.npmjs.com/package/debug) 带有 [msgpack 解析器](https://github.com/socketio/socket.io-msgpack-parser)    |

[debug](https://www.npmjs.com/package/debug)允许将调试信息打印到控制台。可以在[此处](../01-Documentation/logging-and-debugging.md)找到更多信息。

在开发过程中，我们建议使用`socket.io.js`捆绑包。通过设置`localStorage.debug = 'socket.io-client:socket'`，客户端收到的任何事件都将打印到控制台。

对于生产，请使用`socket.io.min.js`捆绑包，这是一个优化的版本，不包括调试包。

### 使用 NPM {#from-npm}

Socket.IO 客户端与[webpack](https://webpack.js.org/)和[browserify](http://browserify.org/)等捆绑程序兼容。

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install socket.io-client
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add socket.io-client
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add socket.io-client
```

  </TabItem>
</Tabs>

客户端也可以从 Node.js 运行。

注意：由于上述原因，您可能希望从浏览器包中排除调试。使用 webpack，您可以使用[webpack-remove-debug](https://github.com/johngodley/webpack-remove-debug).

TypeScript 用户注意：这些类型现在包含在`socket.io-client`包中，因此不再需要来自`@types/socket.io-client`的类型，实际上可能会导致错误：

```
Object literal may only specify known properties, and 'extraHeaders' does not exist in type 'ConnectOpts'
```

## 杂项 {#miscellaneous}

### 依赖树 {#dependency-tree}

客户端的基本安装包括 10 个软件包：

```
└─┬ socket.io-client@4.4.1 https://github.com/socketio/socket.io-client
  ├── @socket.io/component-emitter@3.0.0
  ├── backo2@1.0.2
  ├─┬ debug@4.3.3
  │ └── ms@2.1.2
  ├─┬ engine.io-client@6.1.1
  │ ├── @socket.io/component-emitter@3.0.0 deduped
  │ ├── debug@4.3.3 deduped
  │ ├─┬ engine.io-parser@5.0.2
  │ │ └── base64-arraybuffer@1.0.1
  │ ├── has-cors@1.1.0
  │ ├── parseqs@0.0.6
  │ ├── parseuri@0.0.6 deduped
  │ ├─┬ ws@8.2.3
  │ │ ├── UNMET OPTIONAL DEPENDENCY bufferutil@^4.0.1
  │ │ └── UNMET OPTIONAL DEPENDENCY utf-8-validate@^5.0.2
  │ ├── xmlhttprequest-ssl@2.0.0
  │ └── yeast@0.1.2
  ├── parseuri@0.0.6
  └─┬ socket.io-parser@4.1.1
    ├── @socket.io/component-emitter@3.0.0 deduped
    └── debug@4.3.3 deduped
```

### 对应版本 {#transitive-versions}

The `engine.io-client`软件包带来了负责管理低级连接（HTTP 长轮询或 WebSocket）的引擎。另请参阅：[运作原理](../01-Documentation/how-it-works.md)

| `socket.io-client` version | `engine.io-client` version | `ws` version<sup>1</sup> |
|----------------------------|----------------------------|--------------------------|
| `4.4.x`                    | `6.1.x`                    | `8.2.x`                  |
| `4.3.x`                    | `6.0.x`                    | `8.2.x`                  |
| `4.2.x`                    | `5.2.x`                    | `7.4.x`                  |
| `4.1.x`                    | `5.1.x`                    | `7.4.x`                  |
| `4.0.x`                    | `5.0.x`                    | `7.4.x`                  |
| `3.1.x`                    | `4.1.x`                    | `7.4.x`                  |
| `3.0.x`                    | `4.0.x`                    | `7.4.x`                  |
| `2.4.x`                    | `3.5.x`                    | `7.4.x`                  |

[1] 仅适用于 Node.js 用户。在浏览器中，使用了本机 WebSocket API。
