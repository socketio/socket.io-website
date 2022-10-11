---
title: Redis 适配器
sidebar_position: 2
slug: /redis-adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## 这个怎么运作 {#how-it-works}

Redis 适配器依赖于 Redis [Pub/Sub 机制](https://redis.io/topics/pubsub)。

每个发送给多个客户的数据包(例如： `io.to("room1").emit()` 或 `socket.broadcast.emit()`)是：

- 发送到连接到当前服务器的所有匹配客户端
- 在 Redis 通道中发布，并由集群的其他 Socket.IO 服务器接收

<ThemedImage
  alt="Diagram of how the Redis adapter works"
  sources={{
    light: useBaseUrl('/images/broadcasting-redis.png'),
    dark: useBaseUrl('/images/broadcasting-redis-dark.png'),
  }}
/>

这个适配器的源代码可以在[这里](https://github.com/socketio/socket.io-redis-adapter)找到。

## 安装 {#installation}

```
npm install @socket.io/redis-adapter redis
```

对于 TypeScript 用户，`@types/redis`如果您使用的是`redis@3`。

## 用法 {#usage}

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const io = new Server();

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  io.listen(3000);
});
```

注意：使用`redis@3`，不需要`connect()`调用Redis 客户端：

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const io = new Server();

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
io.listen(3000);
```

或与`ioredis`：

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Cluster } from "ioredis";

const io = new Server();

const pubClient = new Cluster([
  {
    host: "localhost",
    port: 6380,
  },
  {
    host: "localhost",
    port: 6381,
  },
]);

const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
io.listen(3000);
```

## 配置 {#options}

| 配置项 | 描述 | Default 默认值 |
| ---- | ----------- | ------------- |
| `key` | Pub/Sub频道名称的前缀 | `socket.io` |
| `requestsTimeout` | 服务器间请求的超时时间，例如`fetchSockets()` 或 `serverSideEmit()` | `5000` |

## 常见问题 {#common-questions}

- 使用 Redis 适配器时是否还需要启用粘性会话？

是的。否则将导致 HTTP 400 响应（您到达的服务器不知道 Socket.IO 会话）。

更多信息可以在[这里](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required)找到。

- Redis 服务器宕机时会发生什么？

如果与 Redis 服务器的连接被切断，数据包将仅发送到连接到当前服务器的客户端。

## 迁移自 `socket.io-redis` {#migrating-from-socketio-redis}

为了匹配 Redis 发射器 (`@socket.io/redis-emitter`)的名称，该包在[v7](https://github.com/socketio/socket.io-redis-adapter/releases/tag/7.0.0)中被重命名从 `socket.io-redis` 变成 `@socket.io/redis-adapter`。

要迁移到新包，您需要确保提供自己的 Redis 客户端，因为该包将不再代表用户创建 Redis 客户端。

之前:

```js
const redisAdapter = require("socket.io-redis");

io.adapter(redisAdapter({ host: "localhost", port: 6379 }));
```

现在：

```js
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

:::tip 笔记

Socket.IO 服务器之间的通信协议尚未更新，因此您可以同时拥有一些服务器`socket.io-redis`和一些其他服务器 `@socket.io/redis-adapter`。

:::

## 最新版本 {#latest-releases}

- [7.1.0](https://github.com/socketio/socket.io-redis-adapter/releases/tag/7.1.0) (2021-11-30)
- [7.0.1](https://github.com/socketio/socket.io-redis-adapter/releases/tag/7.0.1) (2021-11-15)
- [7.0.0](https://github.com/socketio/socket.io-redis-adapter/releases/tag/7.0.0) (2021-05-12)
- [6.1.0](https://github.com/socketio/socket.io-redis-adapter/releases/tag/6.1.0) (2021-03-13)
- [6.0.1](https://github.com/socketio/socket.io-redis-adapter/releases/tag/6.0.1) (2020-11-14)

## Emitter {#emitter}

Redis 发射器允许从另一个 Node.js 进程向连接的客户端发送数据包：

<ThemedImage
  alt="Diagram of how the Redis emitter works"
  sources={{
    light: useBaseUrl('/images/redis-emitter.png'),
    dark: useBaseUrl('/images/redis-emitter-dark.png'),
  }}
/>

此发射器还提供多种语言版本：

- Javascript: https://github.com/socketio/socket.io-redis-emitter
- Java: https://github.com/sunsus/socket.io-java-emitter
- Python: https://pypi.org/project/socket.io-emitter/
- PHP: https://github.com/rase-/socket.io-php-emitter
- Golang: https://github.com/yosuke-furukawa/socket.io-go-emitter
- Perl: https://metacpan.org/pod/SocketIO::Emitter
- Rust: https://github.com/epli2/socketio-rust-emitter

### 安装 {#installation-1}

```
npm install @socket.io/redis-emitter redis
```

### 用法 {#usage-1}

```js
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });

redisClient.connect().then(() => {
  const emitter = new Emitter(redisClient);

  setInterval(() => {
    emitter.emit("time", new Date);
  }, 5000);
});
```

注意：使用`redis@3`，不需要`connect()`调用Redis 客户端：

```js
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });
const emitter = new Emitter(redisClient);

setInterval(() => {
  emitter.emit("time", new Date);
}, 5000);
```

请参阅[此处](adapter.md#emitter-cheatsheet)的备忘单。

### 迁移自 `socket.io-emitter` {#migrating-from-socketio-emitter}

在[v4](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.0.0)中，改包从`socket.io-emitter`重命名为`@socket.io/redis-emitter`以更好地体现与 Redis 的关系。

要迁移到新包，您需要确保提供自己的 Redis 客户端，因为该包将不再代表用户创建 Redis 客户端。

之前：

```js
const io = require("socket.io-emitter")({ host: "127.0.0.1", port: 6379 });
```

现在：

```js
const { Emitter } = require("@socket.io/redis-emitter");
const { createClient } = require("redis");

const redisClient = createClient();
const io = new Emitter(redisClient);
```

### 最新版本 {#latest-releases-1}

- [4.1.1](https://github.com/socketio/socket.io-redis-emitter/releases/4.1.1) (2022-01-04)
- [4.1.0](https://github.com/socketio/socket.io-redis-emitter/releases/4.1.0) (2021-05-12)
- [4.0.0](https://github.com/socketio/socket.io-redis-emitter/releases/4.0.0) (2021-03-17)
- [3.2.0](https://github.com/socketio/socket.io-redis-emitter/releases/3.2.0) (2020-12-29)
- [3.1.1](https://github.com/socketio/socket.io-redis-emitter/releases/3.1.1) (2017-10-12)
