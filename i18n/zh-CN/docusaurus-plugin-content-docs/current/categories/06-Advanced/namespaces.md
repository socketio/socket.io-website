---
title: 命名空间
sidebar_position: 1
slug: /namespaces/
---

命名空间是一种通信通道，允许您通过单个共享连接（也称为“多路复用”）拆分应用程序的逻辑。

![Namespace diagram](/images/namespaces.png)

## 介绍 {#introduction}

每个命名空间都有自己的：

- [事件处理程序](../04-Events/listening-to-events.md)

```js
io.of("/orders").on("connection", (socket) => {
  socket.on("order:list", () => {});
  socket.on("order:create", () => {});
});

io.of("/users").on("connection", (socket) => {
  socket.on("user:list", () => {});
});
```

- [房间](../04-Events/rooms.md)

```js
const orderNamespace = io.of("/orders");

orderNamespace.on("connection", (socket) => {
  socket.join("room1");
  orderNamespace.to("room1").emit("hello");
});

const userNamespace = io.of("/users");

userNamespace.on("connection", (socket) => {
  socket.join("room1"); // distinct from the room in the "orders" namespace
  userNamespace.to("room1").emit("holà");
});
```

- [中间件](../02-Server/middlewares.md)

```js
const orderNamespace = io.of("/orders");

orderNamespace.use((socket, next) => {
  // ensure the socket has access to the "orders" namespace, and then
  next();
});

const userNamespace = io.of("/users");

userNamespace.use((socket, next) => {
  // ensure the socket has access to the "users" namespace, and then
  next();
});
```

可能的用例：

- 您想创建一个只有授权用户才能访问的特殊命名空间，因此与这些用户相关的逻辑与应用程序的其余部分分离

```js
const adminNamespace = io.of("/admin");

adminNamespace.use((socket, next) => {
  // ensure the user has sufficient rights
  next();
});

adminNamespace.on("connection", socket => {
  socket.on("delete user", () => {
    // ...
  });
});
```

- 您的应用程序有多个租户，因此您希望为每个租户动态创建一个命名空间

```js
const workspaces = io.of(/^\/\w+$/);

workspaces.on("connection", socket => {
  const workspace = socket.nsp;

  workspace.emit("hello");
});
```

## 主命名空间 {#main-namespace}

到目前为止，您与称为`/`的主名称空间进行了互动。 `io`实例继承了它的所有方法：

```js
io.on("connection", (socket) => {});
io.use((socket, next) => { next() });
io.emit("hello");
// are actually equivalent to
io.of("/").on("connection", (socket) => {});
io.of("/").use((socket, next) => { next() });
io.of("/").emit("hello");
```

有些教程可能还会提到`io.sockets`，它只是`io.of("/")`.

```js
io.sockets === io.of("/")
```

## 自定义命名空间 {#custom-namespaces}

要设置自定义命名空间，您可以`of`在服务器端调用该函数：

```js
const nsp = io.of("/my-namespace");

nsp.on("connection", socket => {
  console.log("someone connected");
});

nsp.emit("hi", "everyone!");
```

## 客户端初始化 {#client-initialization}

同源版本：

```js
const socket = io(); // or io("/"), the main namespace
const orderSocket = io("/orders"); // the "orders" namespace
const userSocket = io("/users"); // the "users" namespace
```

跨域/Node.js 版本：

```js
const socket = io("https://example.com"); // or io("https://example.com/"), the main namespace
const orderSocket = io("https://example.com/orders"); // the "orders" namespace
const userSocket = io("https://example.com/users"); // the "users" namespace
```

在上面的示例中，只会建立一个 WebSocket 连接，并且数据包会自动路由到正确的命名空间。

请注意，在以下情况下将禁用多路复用：

- 同一命名空间的多次创建

```js
const socket1 = io();
const socket2 = io(); // no multiplexing, two distinct WebSocket connections
```

- 不同的域

```js
const socket1 = io("https://first.example.com");
const socket2 = io("https://second.example.com"); // no multiplexing, two distinct WebSocket connections
```

- [forceNew](../../client-options.md#forcenew)配置的使用

```js
const socket1 = io();
const socket2 = io("/admin", { forceNew: true }); // no multiplexing, two distinct WebSocket connections
```

## 动态命名空间 {#dynamic-namespaces}

也可以使用正则表达式动态创建命名空间：

```js
io.of(/^\/dynamic-\d+$/);
```

或具有功能：

```js
io.of((name, auth, next) => {
  next(null, true); // or false, when the creation is denied
});
```

您可以在事件中访问新的命名空间`connection`：

```js
io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
  const namespace = socket.nsp;
});
```

方法的返回值`of()`就是我们所说的父命名空间，你可以从中：

- 注册 [中间件](../02-Server/middlewares.md)

```js
const parentNamespace = io.of(/^\/dynamic-\d+$/);

parentNamespace.use((socket, next) => { next() });
```

中间件将自动在每个子命名空间上注册。

- [广播](../04-Events/broadcasting-events.md)事件

```js
const parentNamespace = io.of(/^\/dynamic-\d+$/);

parentNamespace.emit("hello"); // will be sent to users in /dynamic-1, /dynamic-2, ...
```

:::caution 警告

现有命名空间优先于动态命名空间。例如：

```js
// register "dynamic-101" namespace
io.of("/dynamic-101");

io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
  // will not be called for a connection on the "dynamic-101" namespace
});
```

:::

## 完整API {#complete-api}

可以在[此处](../../server-api.md#namespace)找到命名空间实例公开的完整 API 。
