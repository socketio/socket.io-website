---
title: Socket 实例（服务器端）
sidebar_label: Socket 实例
sidebar_position: 4
slug: /server-socket-instance/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

`Socket`是与客户端交互的基础类。它继承了 Node.js[EventEmitter](https://nodejs.org/api/events.html#class-eventemitter)的所有方法，例如[emit](../../server-api.md#socketemiteventname-args), [on](../../server-api.md#socketoneventname-callback), [once](../../server-api.md#socketonceeventname-listener) 或  [removeListener](../../server-api.md#socketremovelistenereventname-listener).

<ThemedImage
  alt="Bidirectional communication between server and client"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication-socket.png'),
    dark: useBaseUrl('/images/bidirectional-communication-socket-dark.png'),
  }}
/>

<br />
<br />

除了：

- [发出](../04-Events/emitting-events.md#basic-emit) 和 [监听](../04-Events/listening-to-events.md) 事件
- [广播事件](../04-Events/broadcasting-events.md#to-all-connected-clients-except-the-sender)
- [加入和离开房间](../04-Events/rooms.md#joining-and-leaving)

Socket 实例有一些可能在您的应用程序中使用的属性：

## Socket#id {#socketid}

每个新连接都分配有一个随机的 20 个字符的标识符。

此标识符与客户端的值同步。

```js
// server-side
io.on("connection", (socket) => {
  console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
});

// client-side
socket.on("connect", () => {
  console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
});
```

创建后，Socket 会加入由其自己的 id 标识的房间，这意味着您可以将其用于私人消息传递：

```js
io.on("connection", socket => {
  socket.on("private message", (anotherSocketId, msg) => {
    socket.to(anotherSocketId).emit("private message", socket.id, msg);
  });
});
```

注意：您不能覆盖此标识符，因为它在 Socket.IO 代码库的多个部分中使用。

## Socket#handshake {#sockethandshake}

此对象包含有关在 Socket.IO 会话开始时发生的握手的一些详细信息。

```
{
  headers: /* the headers of the initial request */
  query: /* the query params of the initial request */
  auth: /* the authentication payload */
  time: /* the date of creation (as string) */
  issued: /* the date of creation (unix timestamp) */
  url: /* the request URL string */
  address: /* the ip of the client */
  xdomain: /* whether the connection is cross-domain */
  secure: /* whether the connection is secure */
}
```

例子：

```json
{
  "headers": {
    "user-agent": "xxxx",
    "accept": "*/*",
    "host": "example.com",
    "connection": "close"
  },
  "query": {
    "EIO": "4",
    "transport": "polling",
    "t": "NNjNltH"
  },
  "auth": {
    "token": "123"
  },
  "time": "Sun Nov 22 2020 01:33:46 GMT+0100 (Central European Standard Time)",
  "issued": 1606005226969,
  "url": "/socket.io/?EIO=4&transport=polling&t=NNjNltH",
  "address": "::ffff:1.2.3.4",
  "xdomain": false,
  "secure": true
}
```

## Socket#rooms {#socketrooms}

这是对 Socket 当前所在[房间](../04-Events/rooms.md)的引用。

```js
io.on("connection", (socket) => {
  console.log(socket.rooms); // Set { <socket.id> }
  socket.join("room1");
  console.log(socket.rooms); // Set { <socket.id>, "room1" }
});
```

## Socket#data {#socketdata}

可以与`fetchSockets()`实用程序方法结合使用的任意对象：

```js
// server A
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

// server B
const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

更多信息[在这里](server-instance.md#utility-methods).

## Socket#conn {#socketconn}

对底层 Engine.IO 套接字的引用（参见[此处](../01-Documentation/how-it-works.md)）。

```js
io.on("connection", (socket) => {
  console.log("initial transport", socket.conn.transport.name); // prints "polling"

  socket.conn.once("upgrade", () => {
    // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    console.log("upgraded transport", socket.conn.transport.name); // prints "websocket"
  });

  socket.conn.on("packet", ({ type, data }) => {
    // called for each packet received
  });

  socket.conn.on("packetCreate", ({ type, data }) => {
    // called for each packet sent
  });

  socket.conn.on("drain", () => {
    // called when the write buffer is drained
  });

  socket.conn.on("close", (reason) => {
    // called when the underlying connection is closed
  });
});
```

## Additional attributes {#additional-attributes}

只要您不覆盖任何现有属性，您就可以将任何属性附加到 Socket 实例并在以后使用它：

```js
// in a middleware
io.use(async (socket, next) => {
  try {
    const user = await fetchUser(socket);
    socket.user = user;
  } catch (e) {
    next(new Error("unknown user"));
  }
});

io.on("connection", (socket) => {
  console.log(socket.user);

  // in a listener
  socket.on("set username", (username) => {
    socket.username = username;
  });
});

```

## Socket middlewares {#socket-middlewares}

这些中间件看起来很像通常的[中间价](middlewares.md)，除了它们是为每个传入的数据包调用的：

```js
socket.use(([event, ...args], next) => {
  // do something with the packet (logging, authorization, rate limiting...)
  // do not forget to call next() at the end
  next();
});
```

`next`也可以使用错误对象调用该方法。在这种情况下，事件将不会到达注册的事件处理程序，而`error`是会发出一个事件：

```js
io.on("connection", (socket) => {
  socket.use(([event, ...args], next) => {
    if (isUnauthorized(event)) {
      return next(new Error("unauthorized event"));
    }
    next();
  });

  socket.on("error", (err) => {
    if (err && err.message === "unauthorized event") {
      socket.disconnect();
    }
  });
});
```

注意：此功能仅存在于服务器端。对于客户端，您可能对[catch-all listeners](../04-Events/listening-to-events.md#catch-all-listeners)感兴趣。

## Events {#events}

在服务器端，Socket 实例发出两个特殊事件：

- [`disconnect`](#disconnect)
- [`disconnecting`](#disconnecting)

### `disconnect` {#disconnect}

此事件由 Socket 实例在断开连接时触发。

```js
io.on("connection", (socket) => {
  socket.on("disconnect", (reason) => {
    // ...
  });
});
```

以下是可能的原因列表：

Reason | Description
------ | -----------
`server namespace disconnect` | socket被[socket.disconnect](../../server-api.md#socketdisconnectclose)强行断开
`client namespace disconnect` | 客户端使用[socket.disconnect()](../../client-api.md#socketdisconnect)手动断开socket
`server shutting down` | 服务器正在关闭
`ping timeout` | `pingTimeout` 客户端在延迟中没有发送 PONG 数据包
`transport close` | 连接已关闭（例如：用户失去连接，或网络从 WiFi 更改为 4G）
`transport error` | 连接遇到错误

### `disconnecting` {#disconnecting}

当[Socket#rooms](server-socket-instance.md#socketrooms)集不为空时，此事件类似于`disconnect`但更早触发。

```js
io.on("connection", (socket) => {
  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit("user has left", socket.id);
      }
    }
  });
});
```

注意：这些事件以及`connect`, `connect_error`, `newListener` 和 `removeListener`是不应在您的应用程序中使用的特殊事件:

```js
// BAD, will throw an error
socket.emit("disconnect");
```

## 完整API {#complete-api}

可以在[此处](../../server-api.md#socket)找到 Socket 实例公开的完整 API 。
