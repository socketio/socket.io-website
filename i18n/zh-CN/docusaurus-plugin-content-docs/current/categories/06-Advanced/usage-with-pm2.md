---
title: 与 PM2 一起使用
sidebar_position: 4
slug: /pm2/
---

PM2 是具有内置负载均衡器的 Node.js 应用程序的生产流程管理器。它允许您使应用程序永远保持活动状态，在不停机的情况下重新加载它们，并促进常见的系统管理任务。

你可以在这里找到它的文档：https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/

要使用 PM2 扩展 Socket.IO 服务器，有三种解决方案：

- 在客户端禁用 HTTP 长轮询

```js
const socket = io({
  transports: ["websocket"]
});
```

尽管在这种情况下，如果无法建立 WebSocket 连接，则不会回退到 HTTP 长轮询。

- 为每个工作人员使用不同的端口，并在他们面前使用像 nginx 这样的负载均衡器

- 利用 `@socket.io/pm2`

## 安装 {#installation}

```
npm install -g @socket.io/pm2
```

如果`pm2`已安装，则必须先将其删除：

```
npm remove -g pm2
```

`@socket.io/pm2`可以用作`pm2`的替代品，并支持`pm2`的所有命令。

唯一的区别来自[这个commit](https://github.com/socketio/pm2/commit/8c29a7feb6cbde3c8ef9eb072fee284686f1553f)。

## 用法 {#usage}

`worker.js`

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/cluster-adapter");
const { setupWorker } = require("@socket.io/sticky");

const httpServer = createServer();
const io = new Server(httpServer);

io.adapter(createAdapter());

setupWorker(io);

io.on("connection", (socket) => {
  console.log(`connect ${socket.id}`);
});
```

`ecosystem.config.js`

```js
module.exports = {
  apps : [{
    script    : "worker.js",
    instances : "max",
    exec_mode : "cluster"
  }]
}
```

然后运行`pm2 start ecosystem.config.js` (或 `pm2 start worker.js -i 0`)）。现在！您现在可以在端口 8080 上访问 Socket.IO 集群。

## 这个怎么运作 {#how-it-works}

当[扩展到多个节点](../02-Server/using-multiple-nodes.md)时，有两件事要做：

- 启用粘性会话，以便将 Socket.IO 会话的 HTTP 请求路由到同一个工作线程
- 使用自定义适配器，以便将数据包广播到所有客户端，即使它们连接到另一个工作者

为了实现这一点，`@socket.io/pm2`包括两个额外的包：

- [`@socket.io/sticky`](https://github.com/socketio/socket.io-sticky)
- [`@socket.io/cluster-adapter`](https://github.com/socketio/socket.io-cluster-adapter)

与`pm2`唯一的区别来自[这个 commit](https://github.com/socketio/pm2/commit/8c29a7feb6cbde3c8ef9eb072fee284686f1553f)：

- God 进程现在创建自己的 HTTP 服务器并将 HTTP 请求路由到正确的工作程序
- God进程还在worker之间中继数据包，以便`io.emit()`正确到达所有客户端

请注意，如果您有多个主机，每个主机都运行一个 PM2 集群，您将不得不使用另一个适配器，例如[Redis 适配器](../05-Adapters/adapter-redis.md)。

可以在[此处](https://github.com/socketio/pm2)找到 fork 的源代码。我们将尝试密切关注`pm2`软件包的发布。
