---
title: 运作原理
sidebar_position: 2
slug: /how-it-works/
---

Socket.IO 服务器 (Node.js) 和 Socket.IO 客户端（浏览器, Node.js 或 [其他编程语言](index.md#what-socketio-is)）之间的双向通道尽可能使用[WebSocket 连接](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)建立，并将使用 HTTP 长轮询作为后备。

Socket.IO 代码库分为两个不同的层：

- 底层通道：我们称之为Engine.IO，Socket.IO内部的引擎
- 高级 API：Socket.IO 本身

## Engine.IO {#engineio}

Engine.IO 负责建立服务器和客户端之间的低级连接。它处理：

- 各种[传输](#transports)和[升级机制](#upgrade-mechanism)
- [断线检测](#disconnection-detection)

源代码可以在这里找到：

- 服务器：https://github.com/socketio/engine.io
- 客户端：https://github.com/socketio/engine.io-client
- 解析器：https://github.com/socketio/engine.io-parser
- 协议说明：https://github.com/socketio/engine.io-protocol

### 传输 {#transports}

目前有两种实现的传输:

- [HTTP 长轮询](#http-long-polling)
- [WebSocket](#websocket)

#### HTTP 长轮询 {#http-long-polling}

HTTP 长轮询传输（也简称为“轮询”）由连续的 HTTP 请求组成：

- 长时间运行的 `GET` 请求，用于从服务器接收数据
- 短时 `POST` 请求，用于向服务器发送数据

由于传输的性质，可能会在同一个 HTTP 请求中连接并发送连续的请求。

#### WebSocket {#websocket}

WebSocket 传输由[WebSocket 连接](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)组成，它在服务器和客户端之间提供双向和低延迟的通信通道。

由于传输的性质，每个发射都在其自己的 WebSocket 帧中发送（有些发射甚至可能导致两个不同的 WebSocket 帧，更多信息[在这里](../06-Advanced/custom-parser.md#the-default-parser)).

### 握手 {#handshake}

在 Engine.IO 连接开始时，服务器发送一些信息：

```json
{
  "sid": "FSDjX-WRwSA4zTZMALqx",
  "upgrades": ["websocket"],
  "pingInterval": 25000,
  "pingTimeout": 20000
}
```

- `sid` 是会话的ID，它必须包含在sid所有后续HTTP请求的查询参数中
- `upgrades` 数组包含服务器支持的所有“更好”传输的列表
- `pingInterval` 和 `pingTimeout` 值用于心跳

### 升级机制 {#upgrade-mechanism}

默认情况下，客户端使用 HTTP 长轮询传输建立连接。

**为什么呢?**

虽然 WebSocket 显然是建立双向通信的最佳方式，但经验表明，由于企业代理、个人防火墙、防病毒软件...

从用户的角度来看，一个不成功的 WebSocket 连接可以转化为等待实时应用程序开始交换数据的至少 10 秒。 这在**感知**上会损害用户体验。

总而言之，Engine.io首先关注可靠性和用户体验，其次关注潜在的 UX 改进和提高服务器性能。

要升级，客户端将：

- 确保其传出缓冲区为空
- 将当前传输设置为只读模式
- 尝试与其他传输建立连接
- 如果成功，关闭第一个传输

您可以在浏览器的网络监视器中查看：

![Successful upgrade](/images/network-monitor.png)

1. 握手 (包含会话 ID — 此处, `zBjrh...AAAK` — 用于后续请求)
2. 发送数据 (HTTP 长轮询)
3. 接收数据 (HTTP 长轮询)
4. 升级 (WebSocket)
5. 接收数据 (HTTP 长轮询, WebSocket连接建立成功后关闭)

### 断线检测 {#disconnection-detection}

Engine.IO 连接在以下情况下被视为关闭：

- 一个 HTTP 请求（GET 或 POST）失败（例如，当服务器关闭时）
- WebSocket 连接关闭（例如，当用户关闭其浏览器中的选项卡时）
- `socket.disconnect()` 在服务器端或客户端调用

还有一个心跳机制检查服务器和客户端之间的连接是否仍然正常运行：

在给定的时间间隔（ `pingInterval`握手中发送的值），服务器发送一个 PING 数据包，客户端有几秒钟（该`pingTimeout`值）发送一个 PONG 数据包。如果服务器没有收到返回的 PONG 数据包，则认为连接已关闭。反之，如果客户端在 内没有收到 PING 包`pingInterval + pingTimeout`，则认为连接已关闭。

断开连接的原因在[此处](../02-Server/server-socket-instance.md#disconnect) （服务器端）和 [此处](../03-Client/client-socket-instance.md#disconnect) （客户端）列出。


## Socket.IO {#socketio}

Socket.IO 通过 Engine.IO 连接提供了一些附加功能：

- 自动重连
- [数据包缓冲](../03-Client/client-offline-behavior.md#buffered-events)
- [收到后的回调](../04-Events/emitting-events.md#acknowledgements)
- 广播 [到所有客户端](../04-Events/broadcasting-events.md) 或 [客户端的子集](../04-Events/rooms.md)（我们称之为“房间”）
- [多路复用](../06-Advanced/namespaces.md)（我们称之为“命名空间”）

源代码可以在这里找到：

- 服务器：https://github.com/socketio/socket.io
- 客户端：https://github.com/socketio/socket.io-client
- 解析器：https://github.com/socketio/socket.io-parser
- 协议说明：https://github.com/socketio/socket.io-protocol
