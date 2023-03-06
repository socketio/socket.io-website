---
title: 管理界面
sidebar_position: 3
slug: /admin-ui/
---

Socket.IO 管理 UI 可用于概述 Socket.IO 部署的状态。

源代码可以在这里找到：https://github.com/socketio/socket.io-admin-ui/

链接到托管版本：https://admin.socket.io/

## 当前功能 {#current-features}

- 当前连接的服务器和客户端的概述

![dashboard screenshot](/images/admin-ui-dashboard.png)

- 每个socket实例的详细信息（主动传输、握手、房间……）

![socket details screenshot](/images/admin-ui-socket-details.png)

- 每个房间的细节

![room details screenshot](/images/admin-ui-room-details.png)

- 管理操作（加入、离开、断开连接）

如果您有任何反馈/建议，请不要犹豫！

## 安装 {#installation}

### 服务器端 {#server-side}

首先，安装`@socket.io/admin-ui`软件包：

```
npm i @socket.io/admin-ui
```

然后调用Socket.IO 服务器上的方法`instrument`：

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(io, {
  auth: false
});

httpServer.listen(3000);
```

该模块兼容：

- Socket.IO v4 服务器
- Socket.IO v3 服务器 (>= 3.1.0)），但没有对房间的操作（加入、离开、断开连接）

### 客户端 {#client-side}

然后，您可以前往[https://admin.socket.io](https://admin.socket.io)，或托管在[此处](https://github.com/socketio/socket.io-admin-ui/tree/main/ui/dist)`ui/dist`夹中的文件。

**重要提示：** https://admin.socket.io 上的网站是完全静态的（托管在 [Vercel](https://vercel.com)上），我们不会（也永远不会）存储有关您自己或您的浏览器的任何信息（没有跟踪，没有分析，...... ）。话虽如此，自己托管文件完全没问题。

您应该看到以下模式：

![login modal screenshot](/images/admin-ui-login-modal.png)

请输入您的服务器的 URL（例如，`http://localhost:3000/admin` 或 `https://example.com/admin`) ）和凭据（如果适用）（请参阅 [下方](#auth)`auth`的配置）。

### 可用配置 {#available-options}

#### `auth` {#auth}

默认值：`-`

此选项是强制性的。您可以禁用身份验证（请谨慎使用）：

```js
instrument(io, {
  auth: false
});
```

或使用基本身份验证：

```js
instrument(io, {
  auth: {
    type: "basic",
    username: "admin",
    password: "$2b$10$heqvAkYMez.Va6Et2uXInOnkCT6/uQj1brkrbyG3LpopDklcq7ZOS" // "changeit" encrypted with bcrypt
  },
});
```

警告！请注意，该`bcrypt`包目前不支持以`$2y$`前缀开头的哈希，某些 BCrypt 实现使用该前缀（例如[https://bcrypt-generator.com/](https://bcrypt-generator.com/) 或 [https://www.bcrypt.fr/](https://www.bcrypt.fr/)）。您可以使用以下方法检查哈希的有效性：

```
$ node
> require("bcrypt").compareSync("<the password>", "<the hash>")
true
```

您可以使用以下方法生成有效哈希：

```
$ node
> require("bcrypt").hashSync("changeit", 10)
'$2b$10$LQUE...'
```

也可以看看：

- https://github.com/kelektiv/node.bcrypt.js/issues/849
- https://stackoverflow.com/a/36225192/5138796

#### `namespaceName` {#namespacename}

默认值：`/admin`

为处理管理任务而创建的命名空间的名称。

```js
instrument(io, {
  namespaceName: "/custom"
});
```

这个命名空间是一个经典的 Socket.IO 命名空间，你可以通过以下方式访问它：

```js
const adminNamespace = io.of("/admin");
```

更多信息[在这里](namespaces.md).

#### `readonly` {#readonly}

默认值：`false`

是否将管理 UI 置于只读模式（不允许加入、离开或断开连接）。

```js
instrument(io, {
  readonly: true
});
```

#### `serverId` {#serverid}

默认值：`require("os").hostname()`

给定服务器的 ID。如果你在同一台机器上有多个 Socket.IO 服务器，你需要给它们一个不同的 ID：

```js
instrument(io, {
  serverId: `${require("os").hostname()}#${process.pid}`
});
```

#### `store` {#store}

默认值：`new InMemoryStore()`

该存储用于存储会话 ID，因此用户不必在重新连接时重新键入凭据。

如果您在多服务器设置中使用基本身份验证，则应提供自定义存储：

```js
const { instrument, RedisStore } = require("@socket.io/admin-ui");

instrument(io, {
  store: new RedisStore(redisClient)
});
```

#### `mode`

默认值：`development`

在生产模式下，服务器不会发送有关套接字实例和房间的所有详细信息，从而减少检测的内存占用。

```js
instrument(io, {
  mode: "production"
});
```

也可以使用 NODE_ENV 环境变量启用生产模式：

```
NODE_ENV=production node index.js
```

## 这个怎么运作

源代码可以在这里找到：https://github.com/socketio/socket.io-admin-ui/

`instrument`方法很简单：

- 创建[命名空间](namespaces.md)并添加身份验证[中间件](../02-Server/middlewares.md)（如果适用）
- 为每个现有命名空间注册`connection`和`disconnect`事件的侦听器以跟踪socket实例
- 注册一个计时器，它会定期从服务器向 UI 发送统计信息
- `join`，`weaw`和`_disconnect`从 UI 发送的命令注册处理程序

## 最新版本

- `0.4.0` (2022/06/23): [GitHub release](https://github.com/socketio/socket.io-admin-ui/releases/tag/0.4.0) / [diff](https://github.com/socketio/socket.io-admin-ui/compare/0.3.0...0.4.0)
- `0.3.0` (2022/05/03): [GitHub release](https://github.com/socketio/socket.io-admin-ui/releases/tag/0.3.0) / [diff](https://github.com/socketio/socket.io-admin-ui/compare/0.2.0...0.3.0)
- `0.2.0` (2021/06/11): [GitHub release](https://github.com/socketio/socket.io-admin-ui/releases/tag/0.2.0) / [diff](https://github.com/socketio/socket.io-admin-ui/compare/0.1.2...0.2.0)
