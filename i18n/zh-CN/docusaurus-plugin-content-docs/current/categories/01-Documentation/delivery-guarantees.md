---
title: 消息可达性保证
sidebar_position: 3
slug: /delivery-guarantees
toc_max_heading_level: 4
---

## 消息顺序 {#message-ordering}

无论使用哪种底层传输方式（甚至在从HTTP长轮询到WebSocket的升级过程中），Socket.IO都能保证消息的顺序。

这要归功于以下几点:

- 底层TCP连接所提供的保证
- 精心设计的[升级机制](how-it-works.md#upgrade-mechanism)

示例:

```js
socket.emit("event1");
socket.emit("event2");
socket.emit("event3");
```

在上面的例子中，事件将总是以相同的顺序被另一方接收（当然前提是它们确实到达，参考[下面](#message-arrival)）。

## 消息到达 {#message-arrival}

### 最多一次 {#at-most-once}

默认情况下，Socket.IO提供 **最多一次** 的送达保证:

- 如果在事件发送过程中连接中断，那么就不能保证另一方已经收到该事件，重新连接时也不会重试。
- 断开连接的客户端将[缓冲事件，直到重新连接](../03-Client/client-offline-behavior.md)（不过上面的观点仍然适用）。
- 服务器端上没有这样的缓冲区，这意味着任何被断开连接的客户端错过的事件在重新连接时不会被传送到该客户端。

:::info

现在必须在你的应用程序中额外实现的消息送达保证。

:::

### 至少一次 {#at-least-once}

#### 从客户端到服务器端 {#从客户端到服务器端}

在客户端，你可以通过[确认和超时](../04-Events/emitting-events.md#with-timeout)来实现 **至少一次** 的送达保证:

```js
function emit(socket, event, arg) {
  socket.timeout(2000).emit(event, arg, (err) => {
    if (err) {
      // 没有来自服务器的应答，让我们重试吧
      emit(socket, event, arg);
    }
  });
}

emit(socket, "foo", "bar");
```

在上面的例子中，客户端将在给定的延迟后重试发送事件，因此服务器可能会多次收到相同的事件。

:::caution

即使在这种情况下，如果用户刷新其浏览器标签，任何待处理的事件都会丢失。

:::

#### 从服务器端到客户端 {#从服务器端到客户端}

对于由服务器端发送的事件，可以通过以下方式实现额外的送达保证：

- 为每个事件分配一个唯一的ID
- 在数据库中持久保存这些事件
- 在客户端存储最后收到的事件的偏移量，并在重新连接时发送。

示例:

*客户端*

```js
const socket = io({
  auth: {
    offset: undefined
  }
});

socket.on("my-event", ({ id, data }) => {
  // do something with the data, and then update the offset
  socket.auth.offset = id;
});
```

*服务器端*

```js
io.on("connection", async (socket) => {
  const offset = socket.handshake.auth.offset;
  if (offset) {
    // this is a reconnection
    for (const event of await fetchMissedEventsFromDatabase(offset)) {
      socket.emit("my-event", event);
    }
  } else {
    // this is a first connection
  }
});

setInterval(async () => {
  const event = {
    id: generateUniqueId(),
    data: new Date().toISOString()
  }

  await persistEventToDatabase(event);
  io.emit("my-event", event);
}, 1000);
```

作为练习，读者可以自行实现 `fetchMissedEventsFromDatabase()`, `generateUniqueId()` 和 `persistEventToDatabase()`。

参考:

- [`socket.auth`](../../client-options.md#socket-options) (客户端)
- [`socket.handshake`](../../server-api.md#sockethandshake) (服务器端)
