---
title: Socket 实例（客户端）
sidebar_label: Socket 实例
sidebar_position: 3
slug: /client-socket-instance/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

`Socket`是与服务器交互的基础类。它继承了 Node.js[EventEmitter](https://nodejs.org/api/events.html#class-eventemitter)的大部分方法，例如 [emit](../../client-api.md#socketemiteventname-args), [on](../../client-api.md#socketoneventname-callback), [once](../../client-api.md#socketonceeventname-callback) 或 [off](../../client-api.md#socketoffeventname)。

<ThemedImage
  alt="Bidirectional communication between server and client"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication-socket.png'),
    dark: useBaseUrl('/images/bidirectional-communication-socket-dark.png'),
  }}
/>

<br />
<br />

除了[emitting](../04-Events/emitting-events.md) 和 [listening to](../04-Events/listening-to-events.md)事件之外，Socket 实例还有一些可能在您的应用程序中使用的属性：

## Socket#id {#socketid}

每个新连接都分配有一个随机的 20 个字符的标识符。

此标识符与服务器端的值同步。

```js
// server-side
io.on("connection", (socket) => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

// client-side
socket.on("connect", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});
```

## Socket#connected {#socketconnected}

该属性描述套接字当前是否连接到服务器。

```js
socket.on("connect", () => {
  console.log(socket.connected); // true
});

socket.on("disconnect", () => {
  console.log(socket.connected); // false
});
```

## Socket#io {#socketio}

对基础[Manager](../../client-api.md#manager)的引用。

```js
socket.on("connect", () => {
  const engine = socket.io.engine;
  console.log(engine.transport.name); // in most cases, prints "polling"

  engine.once("upgrade", () => {
    // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    console.log(engine.transport.name); // in most cases, prints "websocket"
  });

  engine.on("packet", ({ type, data }) => {
    // called for each packet received
  });

  engine.on("packetCreate", ({ type, data }) => {
    // called for each packet sent
  });

  engine.on("drain", () => {
    // called when the write buffer is drained
  });

  engine.on("close", (reason) => {
    // called when the underlying connection is closed
  });
});
```

## 生命周期 {#lifecycle}

<img src="/images/client_socket_events.png" alt="Lifecycle diagram" />

## 事件 {#events}

Socket 实例发出三个特殊事件：

- [`connect`](#connect)
- [`connect_error`](#connect-error)
- [`disconnect`](#disconnect)

请注意，从 Socket.IO v3 开始，Socket 实例不再发出任何与重新连接逻辑相关的事件。您可以直接监听 Manager 实例上的事件：

```js
socket.io.on("reconnect_attempt", () => {
  // ...
});

socket.io.on("reconnect", () => {
  // ...
});
```

更多信息可以在[迁移指南](../07-Migrations/migrating-from-2-to-3.md#the-socket-instance-will-no-longer-forward-the-events-emitted-by-its-manager)中找到。

### `connect` {#connect}

此事件由 Socket 实例在连接**和**重新连接时触发。

```js
socket.on("connect", () => {
  // ...
});
```

请注意，您不应在`connect`处理程序本身中注册事件处理程序，因为每次 Socket 重新连接时都会注册一个新的处理程序：

```js
// BAD
socket.on("connect", () => {
  socket.on("data", () => { /* ... */ });
});

// GOOD
socket.on("connect", () => {
  // ...
});

socket.on("data", () => { /* ... */ });
```

### `connect_error` {#connect_error}

在以下情况下触发此事件：

- 低级连接无法建立
- 服务器在[中间件功能](../02-Server/middlewares.md)中拒绝连接

在第一种情况下，Socket 会在 [给定的延迟](../../client-options.md#reconnectiondelay)之后自动尝试重新连接。

在后一种情况下，您需要手动重新连接。您可能需要更新凭据：

```js
// either by directly modifying the `auth` attribute
socket.on("connect_error", () => {
  socket.auth.token = "abcd";
  socket.connect();
});

// or if the `auth` attribute is a function
const socket = io({
  auth: (cb) => {
    cb(localStorage.getItem("token"));
  }
});

socket.on("connect_error", () => {
  setTimeout(() => {
    socket.connect();
  }, 1000);
});
```

### `disconnect` {#disconnect}

此事件在断开连接时触发。

```js
socket.on("disconnect", (reason) => {
  // ...
});
```

以下是可能的原因列表：

Reason | Description
------ | -----------
`io server disconnect` | 服务器已使用[socket.disconnect()](../../server-api.md#socketdisconnectclose)强制断开socket
`io client disconnect` | 使用[socket.disconnect()](../../client-api.md#socketdisconnect)手动断开socket
`ping timeout` | 服务器未在该`pingInterval + pingTimeout`范围内发送 PING
`transport close` | 连接已关闭（例如：用户失去连接，或网络从 WiFi 更改为 4G）
`transport error` | 连接遇到错误（例如：服务器在 HTTP 长轮询周期中被杀死）

前两种情况（显式断开），客户端不会尝试重新连接，需要手动调用`socket.connect()`.

在所有其他情况下，客户端将等待一个小的[随机延迟](../../client-options.md#reconnectiondelay)，然后尝试重新连接：

```js
socket.on("disconnect", (reason) => {
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
});
```

注意：这些事件以及`disconnecting`, `newListener` 和 `removeListener`是不应在您的应用程序中使用的特殊事件：

```js
// BAD, will throw an error
socket.emit("disconnect");
```

## 完整API {#complete-api}

可以在[此处](../../client-api.md#socket)找到 Socket 实例公开的完整 API 。
