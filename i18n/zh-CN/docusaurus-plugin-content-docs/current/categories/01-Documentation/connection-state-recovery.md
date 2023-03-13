---
title: 连接状态恢复
sidebar_position: 4
slug: /connection-state-recovery
---

连接状态恢复是一项功能，允许在临时断开连接后恢复客户端的状态，包括任何丢失的数据包。

## 免责声明 {#disclaimer}

在实际情况下，无论连接质量如何，Socket.IO客户端将不可避免地经历暂时的断开连接。

这个功能可以帮助你应对这种断开连接的情况，但除非你想永远存储数据包和会话（通过设置 `maxDisconnectionDuration ` 为 `Infinity`），否则你不能保证恢复总是会成功的。

这就是为什么你仍然需要处理客户端和服务器端的状态必须同步的情况。

## 用法 {#usage}

连接状态恢复功能必须由服务器端启用:

```js
const io = new Server(httpServer, {
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  }
});
```

在意外断开连接时（即没有用socket.disconnect()手动断开连接），服务器端将存储socket的`id`、房间和`数据`属性。

然后在重新连接时，服务器端将尝试恢复客户端的状态。`recovered`属性表明这个恢复是否成功:

*服务端*

```js
io.on("connection", (socket) => {
  if (socket.recovered) {
    // recovery was successful: socket.id, socket.rooms and socket.data were restored
  } else {
    // new or unrecoverable session
  }
});
```

*客户端*

```js
socket.on("connect", () => {
  if (socket.recovered) {
    // any missed packets will be received
  } else {
    // new or unrecoverable session
  }
});
```

你可以通过强行关闭底层引擎来检查恢复是否有效:

```js
import { io } from "socket.io-client";

const socket = io({
  reconnectionDelay: 10000, // defaults to 1000
  reconnectionDelayMax: 10000 // defaults to 5000
});

socket.on("connect", () => {
  console.log("recovered?", socket.recovered);

  setTimeout(() => {
    if (socket.io.engine) {
      // close the low-level connection and trigger a reconnection
      socket.io.engine.close();
    }
  }, 10000);
});
```

## 它的工作原理是什么 {#how-it-works-under-the-hood}

- 服务器端在[握手过程中](../08-Miscellaneous/sio-protocol.md#connection-to-a-namespace-1)发送一个会话ID（这与当前的id属性不同，后者是公开的，可以自由分享）。

示例:

```
40{"sid":"GNpWD7LbGCBNCr8GAAAB","pid":"YHcX2sdAF1z452-HAAAW"}

where

4         => the Engine.IO message type
0         => the Socket.IO CONNECT type
GN...AB   => the public id of the session
YH...AW   => the private id of the session
```

- 服务器在[每个数据包](../08-Miscellaneous/sio-protocol.md#sending-and-receiving-data-1) 中还包括一个偏移量（为了向后兼容，在数据阵列的末尾添加）。

示例:

```
42["foo","MzUPkW0"]

where

4         => the Engine.IO message type
2         => the Socket.IO EVENT type
foo       => the event name (socket.emit("foo"))
MzUPkW0   => the offset
```

- 在临时断开连接时，服务器端会在给定的延迟内存储客户端状态（在适配器级别实现）

- 在重新连接时，客户端发送会话ID和它所处理的最后一个偏移量，而服务器端试图恢复状态

示例:

```
40{"pid":"YHcX2sdAF1z452-HAAAW","offset":"MzUPkW0"}

where

4         => the Engine.IO message type
0         => the Socket.IO CONNECT type
YH...AW   => the private id of the session
MzUPkW0   => the last processed offset
```

## 与现有适配器的兼容性 {#compatibility-with-existing-adapters}

| 适配器                                                  |                                                         是否支持?                                                         |
|--------------------------------------------------------|:------------------------------------------------------------------ -----------------------------------------------------:|
| 内置适配器 (内存中)                                       |                                                  是  :white_check_mark:                                                  |
| [Redis 适配器](../05-Adapters/adapter-redis.md)         |                                                      不<sup>1</sup>                                                      |
| [MongoDB 适配器](../05-Adapters/adapter-mongo.md)       | 是 :white_check_mark: (since version [`0.3.0`](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.3.0)) |
| [Postgres 适配器](../05-Adapters/adapter-postgres.md)   |                                                           开发中                                                            |
| [Cluster 适配器](../05-Adapters/adapter-cluster.md)     |                                                           开发中                                                            |

[1] 持久数据包与Redis PUB/SUB机制不兼容，所以我们将在[Redis Streams](https://redis.io/docs/data-types/streams/)的基础上创建一个新的适配器，它将支持这一功能。
