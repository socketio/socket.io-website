---
title: 发送事件
sidebar_position: 1
slug: /emitting-events/
---

有几种方法可以在服务器和客户端之间发送事件。

:::tip 提示

对于 TypeScript 用户，可以为事件提供类型提示。请查看[这个](../01-Documentation/typescript.md).

:::

## 基本的 emit

Socket.IO API 的灵感来自 Node.js [EventEmitter](https://nodejs.org/docs/latest/api/events.html#events_events)，这意味着您可以在一侧发出事件并在另一侧注册侦听器：

*服务器*

```js
io.on("connection", (socket) => {
  socket.emit("hello", "world");
});
```

*客户端*

```js
socket.on("hello", (arg) => {
  console.log(arg); // world
});
```

这也适用于另一个方向：

*服务器*

```js
io.on("connection", (socket) => {
  socket.on("hello", (arg) => {
    console.log(arg); // world
  });
});
```

*客户端*

```js
socket.emit("hello", "world");
```

您可以发送任意数量的参数，并且支持所有可序列化的数据结构，包括像[Buffer](https://nodejs.org/docs/latest/api/buffer.html#buffer_buffer) 或 [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)这样的二进制对象。

*服务器*

```js
io.on("connection", (socket) => {
  socket.emit("hello", 1, "2", { 3: '4', 5: Buffer.from([6]) });
});
```

*客户端*

```js
// client-side
socket.on("hello", (arg1, arg2, arg3) => {
  console.log(arg1); // 1
  console.log(arg2); // "2"
  console.log(arg3); // { 3: '4', 5: ArrayBuffer (1) [ 6 ] }
});
```

无需`JSON.stringify()`，因为它会为您完成。

```js
// BAD
socket.emit("hello", JSON.stringify({ name: "John" }));

// GOOD
socket.emit("hello", { name: "John" });
```

笔记：

- [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)对象将被转换为（并作为）它们的字符串表示形式，例如`1970-01-01T00:00:00.000Z`

- [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) 和 [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)必须手动序列化：

```js
const serializedMap = [...myMap.entries()];
const serializedSet = [...mySet.keys()];
```

- 您可以使用该[`toJSON()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior)方法自定义对象的序列化

一个类的例子：

```js
class Hero {
  #hp;

  constructor() {
    this.#hp = 42;
  }

  toJSON() {
    return { hp: this.#hp };
  }
}

socket.emit("here's a hero", new Hero());
```

## 回调

事件很棒，但在某些情况下，您可能需要更经典的请求-响应 API。在 Socket.IO 中，此功能称为确认。

您可以添加一个回调作为`emit()`的最后一个参数，一旦对方确认事件，就会调用此回调：

*服务器*

```js
io.on("connection", (socket) => {
  socket.on("update item", (arg1, arg2, callback) => {
    console.log(arg1); // 1
    console.log(arg2); // { name: "updated" }
    callback({
      status: "ok"
    });
  });
});
```

*客户端*

```js
socket.emit("update item", "1", { name: "updated" }, (response) => {
  console.log(response.status); // ok
});
```

## 超时

从 Socket.IO v4.4.0 开始，您现在可以为每个发射分配超时：

```js
socket.timeout(5000).emit("my-event", (err) => {
  if (err) {
    // the other side did not acknowledge the event in the given delay
  }
});
```

You can also use both a timeout and an [acknowledgement](#acknowledgements):

```js
socket.timeout(5000).emit("my-event", (err, response) => {
  if (err) {
    // the other side did not acknowledge the event in the given delay
  } else {
    console.log(response);
  }
});
```

## 易失性事件

易失性事件是在底层连接未准备好时不会发送的事件（有点像[UDP](https://fr.wikipedia.org/wiki/User_Datagram_Protocol)，在可靠性方面）。

例如，如果您需要发送在线游戏中角色的位置（因为只有最新的值才有用），这可能会很有趣。

```js
socket.volatile.emit("hello", "might or might not be received");
```

另一个用例是在客户端未连接时丢弃事件（默认情况下，事件会被缓冲直到重新连接）。

例子：

*服务器*

```js
io.on("connection", (socket) => {
  console.log("connect");

  socket.on("ping", (count) => {
    console.log(count);
  });
});
```

*客户端*

```js
let count = 0;
setInterval(() => {
  socket.volatile.emit("ping", ++count);
}, 1000);
```

如果重新启动服务器，您将在控制台中看到：

```
connect
1
2
3
4
# the server is restarted, the client automatically reconnects
connect
9
10
11
```

如果没有`volatile`标志，您将看到：

```
connect
1
2
3
4
# the server is restarted, the client automatically reconnects and sends its buffered events
connect
5
6
7
8
9
10
11
```
