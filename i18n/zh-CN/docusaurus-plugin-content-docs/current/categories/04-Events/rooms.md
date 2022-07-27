---
title: 房间
sidebar_position: 4
slug: /rooms/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

sockets可以`join` 和 `leave`*房间*。它可用于向一部分客户端广播事件：

<ThemedImage
  alt="Broadcasting to all clients in a room"
  sources={{
    light: useBaseUrl('/images/rooms.png'),
    dark: useBaseUrl('/images/rooms-dark.png'),
  }}
/>

:::info 信息

请注意，房间是一个**仅限服务器**的概念（即客户端无权访问它已加入的房间列表）。

:::

## 加入和离开 {#joining-and-leaving}

您可以调用`join`以将socket订阅到给定的频道：

```js
io.on("connection", (socket) => {
  socket.join("some room");
});
```

然后在广播或发射时简单地使用`to` 或 `in`（它们是相同的）：

```js
io.to("some room").emit("some event");
```

您可以同时发射到多个房间：

```js
io.to("room1").to("room2").to("room3").emit("some event");
```

在这种情况下，将执行<a href="https://en.wikipedia.org/wiki/Union_(set_theory)">联合</a>：至少在其中一个房间中的每个socket都将获得**一次**事件（即使socket在两个或更多房间中）。

您还可以从给定的socket广播到房间：

```js
io.on("connection", (socket) => {
  socket.to("some room").emit("some event");
});
```

在这种情况下，房间中**除**发送者之外的每个socket都会收到该事件。

<ThemedImage
  alt="Broadcasting to all clients in a room excepting the sender"
  sources={{
    light: useBaseUrl('/images/rooms2.png'),
    dark: useBaseUrl('/images/rooms2-dark.png'),
  }}
/>

要离开频道，您调用`leave`的方式与`join`相同。

## 默认房间 {#default-room}

Socket.IO 中的每一个`socket`都由一个随机的、不可猜测的、唯一的标识符[Socket#id](../02-Server/server-socket-instance.md#socketid)。为了您的方便，每个socket都会自动加入一个由其自己的 id 标识的房间。

这使得实现私人消息变得容易：

```js
io.on("connection", (socket) => {
  socket.on("private message", (anotherSocketId, msg) => {
    socket.to(anotherSocketId).emit("private message", socket.id, msg);
  });
});
```

## 示例用例 {#sample-use-cases}

- 向给定用户的每个设备/选项卡广播数据

```js
io.on("connection", async (socket) => {
  const userId = await fetchUserId(socket);

  socket.join(userId);

  // and then later
  io.to(userId).emit("hi");
});
```

- 发送有关给定实体的通知

```js
io.on("connection", async (socket) => {
  const projects = await fetchProjects(socket);

  projects.forEach(project => socket.join("project:" + project.id));

  // and then later
  io.to("project:4321").emit("project updated");
});
```

## 断开 {#disconnection}

断开连接后，`leave`会自动将它们所属的所有通道连接起来，您不需要进行特殊的拆卸。

您可以通过监听`disconnecting`事件来获取 Socket 所在的房间：

```js
io.on("connection", socket => {
  socket.on("disconnecting", () => {
    console.log(socket.rooms); // the Set contains at least the socket ID
  });

  socket.on("disconnect", () => {
    // socket.rooms.size === 0
  });
});
```

## 使用多个 Socket.IO 服务器 {#with-multiple-socketio-servers}

与[全局广播](broadcasting-events.md#with-multiple-socketio-servers)一样，向房间广播也适用于多个 Socket.IO 服务器。

您只需要将默认的[Adapter](../08-Miscellaneous/glossary.md#adapter)替换为 Redis Adapter。更多关于它的信息在[这里](../05-Adapters/adapter-redis.md)。

<ThemedImage
  alt="Broadcasting to all clients in a room with Redis"
  sources={{
    light: useBaseUrl('/images/rooms-redis.png'),
    dark: useBaseUrl('/images/rooms-redis-dark.png'),
  }}
/>

## 实施细节 {#implementation-details}

“房间”功能由我们称为适配器的东西实现。该适配器是一个服务器端组件，负责：

- 存储 Socket 实例和房间之间的关系
- 向所有（或部分）客户端广播事件

您可以在[此处](https://github.com/socketio/socket.io-adapter)找到默认内存适配器的代码。

基本上，它包含两个[ES6 Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map):

- `sids`: `Map<SocketId, Set<Room>>`
- `rooms`: `Map<Room, Set<SocketId>>`

调用`socket.join("the-room")`将导致：

- 在`sids` Map中，将“the-room”添加到由Socket ID 标识的 Set
- 在`rooms` Map 中，将Socket ID 添加到由字符串“the-room”标识的 Set 中

然后在广播时使用这两个地图：

- 对所有套接字的广播（`io.emit()`）循环通过`sids`Map，并将数据包发送到所有sockets
- 对给定房间的广播 ( `io.to("room21").emit()`）循环通过`rooms`Map 中的 Set，并将数据包发送到所有匹配的sockets

您可以通过以下方式访问这些对象：

```js
// main namespace
const rooms = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

// custom namespace
const rooms = io.of("/my-namespace").adapter.rooms;
const sids = io.of("/my-namespace").adapter.sids;
```

笔记：

- 这些对象并不意味着直接修改，您应该始终使用[`socket.join(...)`](../../server-api.md#socketjoinroom) 和 [`socket.leave(...)`](../../server-api.md#socketleaveroom)来代替。
- 在[多服务器](../02-Server/using-multiple-nodes.md)设置中，`rooms` 和 `sids`对象不会在 Socket.IO 服务器之间共享（房间可能只“存在”在一个服务器上而不是另一个服务器上）。

## 房间事件 {#room-events}

从`socket.io@3.1.0`开始，底层适配器将发出以下事件：

- `create-room` (argument: room)
- `delete-room` (argument: room)
- `join-room` (argument: room, id)
- `leave-room` (argument: room, id)

例子：

```js
io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
```
