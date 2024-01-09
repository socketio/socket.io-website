---
title: 服务器实例
sidebar_position: 3
slug: /server-instance/
---

服务器实例（通常`io`在代码示例中调用）具有一些可能在您的应用程序中使用的属性。

它还继承了[主命名空间](../06-Advanced/namespaces.md#main-namespace)的所有方法，例如[`namespace.use()`](../../server-api.md#namespaceusefn)（参见[此处](middlewares.md)）或 [`namespace.allSockets()`](../../server-api.md#namespaceallsockets).

## 服务器#engine {#serverengine}

对底层 Engine.IO 服务器的引用。

它可用于获取当前连接的客户端数量：

```js
const count = io.engine.clientsCount;
// 根据您的用法，可能与主命名空间中的Socket实例计数相似或不相似
const count2 = io.of("/").sockets.size;
```

或者生成自定义会话 ID（`sid`查询参数）：

```js
const uuid = require("uuid");

io.engine.generateId = (req) => {
  return uuid.v4(); // 必须在所有socket.io服务器上都是唯一的
}
```

从`socket.io@4.1.0`开始，Engine.IO 服务器发出三个特殊事件：

- `initial_headers`: 将在编写会话的第一个 HTTP 请求（握手）的响应标头之前发出，允许您自定义它们。

```js
io.engine.on("initial_headers", (headers, req) => {
  headers["test"] = "123";
  headers["set-cookie"] = "mycookie=456";
});
```

- `headers`: 将在编写会话的每个 HTTP 请求的响应头之前发出（包括 WebSocket 升级），允许您自定义它们。

```js
io.engine.on("headers", (headers, req) => {
  headers["test"] = "789";
});
```

- `connection_error`: 当连接异常关闭时发出

```js
io.engine.on("connection_error", (err) => {
  console.log(err.req);	     // the request object
  console.log(err.code);     // the error code, for example 1
  console.log(err.message);  // the error message, for example "Session ID unknown"
  console.log(err.context);  // some additional error context
});
```

以下是可能的错误代码列表：

| Code |            Message             |
|:----:|:------------------------------:|
|  0   |      "Transport unknown"       |
|  1   |      "Session ID unknown"      |
|  2   |     "Bad handshake method"     |
|  3   |         "Bad request"          |
|  4   |          "Forbidden"           |
|  5   | "Unsupported protocol version" |

## 实用方法 {#utility-methods}

Socket.IO v4.0.0 中添加了一些实用方法来管理 Socket 实例及其房间：

- [`socketsJoin`](#socketsjoin)：使匹配的Socket实例加入指定的房间
- [̀`socketsLeave`](#socketsleave)：使匹配的Socket实例离开指定房间
- [`disconnectSockets`](#disconnectsockets): 使匹配的Socket实例断开连接
- [`fetchSockets`](#fetchsockets)：返回匹配的Socket实例

[`serverSideEmit`](#serversideemit)方法是在 Socket.IO v4.1.0 中添加的。

这些方法与广播共享相同的语义，并且应用相同的过滤器：

```js
io.of("/admin").in("room1").except("room2").local.disconnectSockets();
```

这使得“admin”命名空间的所有 Socket 实例

- 在“room1”房间 (`in("room1")` or `to("room1")`)
- 除了 "room2" (`except("room2")`)
- 并且仅在当前的 Socket.IO 服务器上 (`local`)

断开。

请注意，它们还与 Redis 适配器兼容（以`socket.io-redis@6.1.0`开头），这意味着它们可以跨 Socket.IO 服务器工作。

### `socketsJoin` {#socketsjoin}

此方法使匹配的 Socket 实例加入指定的房间：

```js
// make all Socket instances join the "room1" room
io.socketsJoin("room1");

// make all Socket instances in the "room1" room join the "room2" and "room3" rooms
io.in("room1").socketsJoin(["room2", "room3"]);

// make all Socket instances in the "room1" room of the "admin" namespace join the "room2" room
io.of("/admin").in("room1").socketsJoin("room2");

// this also works with a single socket ID
io.in(theSocketId).socketsJoin("room1");
```

### `socketsLeave` {#socketsleave}

该方法使匹配的 Socket 实例离开指定房间：

```js
// make all Socket instances leave the "room1" room
io.socketsLeave("room1");

// make all Socket instances in the "room1" room leave the "room2" and "room3" rooms
io.in("room1").socketsLeave(["room2", "room3"]);

// make all Socket instances in the "room1" room of the "admin" namespace leave the "room2" room
io.of("/admin").in("room1").socketsLeave("room2");

// this also works with a single socket ID
io.in(theSocketId).socketsLeave("room1");
```

### `disconnectSockets` {#disconnectsockets}

此方法使匹配的 Socket 实例断开连接：

```js
// make all Socket instances disconnect
io.disconnectSockets();

// make all Socket instances in the "room1" room disconnect (and discard the low-level connection)
io.in("room1").disconnectSockets(true);

// make all Socket instances in the "room1" room of the "admin" namespace disconnect
io.of("/admin").in("room1").disconnectSockets();

// this also works with a single socket ID
io.of("/admin").in(theSocketId).disconnectSockets();
```

### `fetchSockets` {#fetchsockets}

此方法返回匹配的 Socket 实例：

```js
// return all Socket instances of the main namespace
const sockets = await io.fetchSockets();

// return all Socket instances in the "room1" room of the main namespace
const sockets = await io.in("room1").fetchSockets();

// return all Socket instances in the "room1" room of the "admin" namespace
const sockets = await io.of("/admin").in("room1").fetchSockets();

// this also works with a single socket ID
const sockets = await io.in(theSocketId).fetchSockets();
```

上例中的`sockets`变量是一个对象数组，暴露了通常的 Socket 类的一个子集：

```js
for (const socket of sockets) {
  console.log(socket.id);
  console.log(socket.handshake);
  console.log(socket.rooms);
  console.log(socket.data);
  socket.emit(/* ... */);
  socket.join(/* ... */);
  socket.leave(/* ... */);
  socket.disconnect(/* ... */);
}
```

`data`属性是一个任意对象，可用于在 Socket.IO 服务器之间共享信息：

```js
// server A
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

// server B
const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

### `serverSideEmit` {#serversideemit}

此方法允许在[多服务器设置](using-multiple-nodes.md)中向集群的其他 Socket.IO 服务器发出事件。

语法：

```js
io.serverSideEmit("hello", "world");
```

在接收方：

```js
io.on("hello", (arg1) => {
  console.log(arg1); // prints "world"
});
```

也支持确认：

```js
// server A
io.serverSideEmit("ping", (err, responses) => {
  console.log(responses[0]); // prints "pong"
});

// server B
io.on("ping", (cb) => {
  cb("pong");
});
```

笔记：

- `connection`，`connect` 和 `new_namespace` 字符串是保留的，不能在您的应用程序中使用。

- 您可以发送任意数量的参数，但目前不支持二进制结构（参数数组将被`JSON.stringify`-ed）

例子：

```js
io.serverSideEmit("hello", "world", 1, "2", { 3: "4" });
```

- 如果其他 Socket.IO 服务器在给定延迟后没有响应，则调用确认回调可能会出错

```js
io.serverSideEmit("ping", (err, responses) => {
  if (err) {
    // at least one Socket.IO server has not responded
    // the 'responses' array contains all the responses already received though
  } else {
    // success! the 'responses' array contains one object per other Socket.IO server in the cluster
  }
});
```


## Events {#events}

Server 实例发出一个事件（好吧，从技术上讲是两个，但`connect`它是`connection`的别名）：

- [`connection`](#connection)

### `connection` {#connection}

此事件在新连接时触发。第一个参数是一个[Socket实例](server-socket-instance.md).

```js
io.on("connection", (socket) => {
  // ...
});
```

## 完整API {#complete-api}

可以在[此处](../../server-api.md#server)找到服务器实例公开的完整 API 。
