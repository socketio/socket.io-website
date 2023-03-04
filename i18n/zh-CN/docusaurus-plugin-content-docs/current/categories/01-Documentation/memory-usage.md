---
title: 内存占用
sidebar_position: 9
slug: /memory-usage/
---

Socket.IO服务器消耗的资源主要取决于：

- 连接的客户端的数量
- 每秒接收和发送的信息（[基础emit](../04-Events/emitting-events.md#basic-emit)、[有确认的emit](../04-Events/emitting-events.md#acknowledgements)和[广播](../04-Events/broadcasting-events.md)）的数量

:::info

Socket.IO服务器的内存使用量应与连接的客户端数量成**线性关系**。

:::

在[这里](https://github.com/socketio/socket.io-benchmarks)可以找到重现本页所展示的结果的源代码。

另请参见:

- [负载测试](../06-Advanced/load-testing.md)
- [性能调整](../06-Advanced/performance-tuning.md)

## 每个WebSocket服务器实现的内存使用情况 {#memory-usage-per-webSocket-server-implementation}

Socket.IO服务器的内存使用严重依赖于底层WebSocket服务器实现的内存使用。

下图显示了Socket.IO服务器的内存使用情况，从0到10000个连接的客户端，包括：

- 基于[`ws`](https://github.com/websockets/ws) 包的Socket.IO服务器（默认使用）
- 基于[`eiows`](https://github.com/mmdevries/eiows) 包的Socket.IO服务器，一个C++的WebSocket服务器实现（见[安装步骤](../02-Server/server-installation.md#other-websocket-server-implementations)）
- 基于[`µWebSockets.js`](https://github.com/uNetworking/uWebSockets.js)包的Socket.IO服务器，是Node.js本地HTTP服务器的C++替代方案(见[安装步骤](../02-Server/server-installation.md#usage-with-uwebsockets))
- 基于[`ws`](https://github.com/websockets/ws)包的普通WebSocket服务器

![Chart of the memory usage per WebSocket server implementation](/images/memory-usage-per-impl.png)

使用`Node.js v16.18.1`在`Ubuntu 20.04.5 LTS`上测试，软件包版本如下：

- `socket.io@4.5.4`
- `eiows@3.8.0`
- `uWebSockets.js@20.4.0`
- `ws@8.2.3`

## 随时间变化的内存使用情况 {#memory-usage-over-time}

下图显示了Socket.IO服务器在一段时间内的内存使用情况，从0到10000个连接的客户端。

![Chart of the memory usage over time](/images/memory-usage-over-time.png)

:::note

出于演示目的，我们在每一波客户端结束时手动调用垃圾收集器：

```js
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    const lastToDisconnect = io.of("/").sockets.size === 0;
    if (lastToDisconnect) {
      gc();
    }
  });
});
```

这解释了当最后一个客户端断开连接时，内存使用率的下降。这在您的应用程序中是不需要的，垃圾收集将在必要时自动触发。

:::
