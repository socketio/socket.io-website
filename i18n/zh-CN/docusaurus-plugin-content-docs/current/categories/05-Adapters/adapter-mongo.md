---
title: MongoDB 适配器
sidebar_position: 3
slug: /mongo-adapter/
---

## 这个怎么运作 {#how-it-works}

MongoDB 适配器依赖于 MongoDB 的[变更流](https://docs.mongodb.com/manual/changeStreams/)（因此需要副本集或分片集群）。

每个发送给多个客户的数据包 (例如 `io.to("room1").emit()` 或 `socket.broadcast.emit()`) 是：

- 发送到连接到当前服务器的所有匹配客户端
- 插入到 MongoDB capped 集合中，并由集群的其他 Socket.IO 服务器接收

![Diagram of how the MongoDB adapter works](/images/mongo-adapter.png)

这个适配器的源代码可以在[这里](https://github.com/socketio/socket.io-mongo-adapter)找到。

## 安装 {#installation}

```
npm install @socket.io/mongo-adapter mongodb
```

对于 TypeScript 用户，您可能还需要`@types/mongodb`.

## 用法 {#usage}

有两种方法可以清理适配器创建的 MongoDB 文档：

- [capped collection](https://www.mongodb.com/docs/manual/core/capped-collections/)
- [TTL index](https://www.mongodb.com/docs/manual/core/index-ttl/)

### 使用 capped collection

```js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/mongo-adapter");
const { MongoClient } = require("mongodb");

const DB = "mydb";
const COLLECTION = "socket.io-adapter-events";

const io = new Server();

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0", {
  useUnifiedTopology: true,
});

const main = async () => {
  await mongoClient.connect();

  try {
    await mongoClient.db(DB).createCollection(COLLECTION, {
      capped: true,
      size: 1e6
    });
  } catch (e) {
    // collection already exists
  }
  const mongoCollection = mongoClient.db(DB).collection(COLLECTION);

  io.adapter(createAdapter(mongoCollection));
  io.listen(3000);
}

main();
```

### 使用 TTL index

```js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/mongo-adapter");
const { MongoClient } = require("mongodb");

const DB = "mydb";
const COLLECTION = "socket.io-adapter-events";

const io = new Server();

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0", {
  useUnifiedTopology: true,
});

const main = async () => {
  await mongoClient.connect();

  const mongoCollection = mongoClient.db(DB).collection(COLLECTION);

  await mongoCollection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 3600, background: true }
  );

  io.adapter(createAdapter(mongoCollection, {
    addCreatedAtField: true
  }));
  io.listen(3000);
}

main();
```

## 配置

| 配置项                | 描述                                                                                         |     默认值    |    添加于 |
|---------------------|-----------------------------------------------------------------------------------------------|---------------|----------|
| `uid`               | 此节点的 ID                                                                                    | 一个随机的 id  | `v0.1.0` |
| `requestsTimeout`   | 服务器间请求的超时时间，例如`fetchSockets()` 或 `serverSideEmit()`                               | `5000`        | `v0.1.0` |
| `heartbeatInterval` | 两次心跳之间的毫秒数                                                                            | `5000`        | `v0.1.0` |
| `heartbeatTimeout`  | 在我们考虑节点关闭之前没有心跳的毫秒数                                                            | `10000`       | `v0.1.0` |
| `addCreatedAtField` | 是否为每个 MongoDB 文档添加一个`createdAt`字段                                                   | `false`       | `v0.2.0` |

## 常见问题

- 使用 MongoDB 适配器时是否还需要启用粘性会话？

是的。否则将导致 HTTP 400 响应（您到达的服务器不知道 Socket.IO 会话）。

更多信息可以在[这里](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required)找到。

- 当 MongoDB 集群宕机时会发生什么？

如果与 MongoDB 集群的连接被切断，行为将取决于MongoDB 客户端选项`bufferMaxEntries`的值：

- 如果其值为`-1`（默认），则数据包将被缓冲直到重新连接。
- 如果其值为`0`，则数据包将仅发送到连接到当前服务器的客户端。

文档： http://mongodb.github.io/node-mongodb-native/3.6/api/global.html#MongoClientOptions

## 最新版本

- `0.3.0` (Feb 2023): [GitHub release](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.3.0) / [diff](https://github.com/socketio/socket.io-mongo-adapter/compare/0.2.1...0.3.0)
- `0.2.1` (May 2022): [GitHub release](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.2.1) / [diff](https://github.com/socketio/socket.io-mongo-adapter/compare/0.2.0...0.2.1)
- `0.2.0` (Apr 2022): [GitHub release](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.2.0) / [diff](https://github.com/socketio/socket.io-mongo-adapter/compare/0.1.0...0.2.0)
- `0.1.0` (Jun 2021): [GitHub release](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.1.0)

## Emitter

MongoDB 发射器允许从另一个 Node.js 进程向连接的客户端发送数据包：

![Diagram of how the MongoDB emitter works](/images/mongo-emitter.png)

### 安装

```
npm install @socket.io/mongo-emitter mongodb
```

### 用法

```js
const { Emitter } = require("@socket.io/mongo-emitter");
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0", {
  useUnifiedTopology: true,
});

const main = async () => {
  await mongoClient.connect();

  const mongoCollection = mongoClient.db("mydb").collection("socket.io-adapter-events");
  const emitter = new Emitter(mongoCollection);

  setInterval(() => {
    emitter.emit("ping", new Date());
  }, 1000);
}

main();
```

请参阅[此处](adapter.md#emitter-cheatsheet)的备忘单。
