---
title: Postgres 适配器
sidebar_position: 4
slug: /postgres-adapter/
---

## 这个怎么运作 {#how-it-works}

Postgres 适配器依赖于[NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)和[LISTEN](https://www.postgresql.org/docs/current/sql-listen.html)命令。

每个发送给多个客户的数据包 (例如 `io.to("room1").emit()` 或 `socket.broadcast.emit()`) 是：

- 发送到连接到当前服务器的所有匹配客户端
- 如果数据包包含二进制数据或超过 8000 字节限制，则数据包为：
  - 用[msgpack](https://msgpack.org/)编码并插入到辅助表中
  - 行 ID 在 NOTIFY 命令中发送
  - 此行 ID 由集群的其他 Socket.IO 服务器接收，它们查询表，解码数据包，然后将其广播到自己的一组连接的客户端
- 否则，数据包只是在 NOTIFY 命令中发送并由集群的其他 Socket.IO 服务器接收

![Diagram of how the Postgres adapter works](/images/postgres-adapter.png)

这个适配器的源代码可以在[这里](https://github.com/socketio/socket.io-postgres-adapter)找到。

## 安装 {#installation}

```
npm install @socket.io/postgres-adapter pg
```

对于 TypeScript 用户，您可能还需要`@types/pg`.

## 用法 {#usage}

```js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/postgres-adapter");
const { Pool } = require("pg");

const io = new Server();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "changeit",
  port: 5432,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS socket_io_attachments (
      id          bigserial UNIQUE,
      created_at  timestamptz DEFAULT NOW(),
      payload     bytea
  );
`);

io.adapter(createAdapter(pool));
io.listen(3000);
```

## 配置 {#options}

| 配置项 | 描述 | 默认值 |
| ---- | ----------- | ------------- |
| `uid` | 节点的 ID | 随机 ID |
| `channelPrefix` | 通知通道的前缀 | `socket.io` |
| `tableName` | 超过 8000 字节限制或包含二进制数据的有效负载表的名称 | `socket_io_attachments` |
| `payloadThreshold` | 有效负载大小的阈值（以字节为单位） | `8000` |
| `requestsTimeout` | 服务器间请求的超时时间，例如`fetchSockets()` 或 `serverSideEmit()` | `5000` |
| `heartbeatInterval` | 两次心跳之间的毫秒数 | `5000` |
| `heartbeatTimeout` | 在我们考虑节点关闭之前没有心跳的毫秒数 | `10000` |
| `cleanupInterval` | 两次清理查询之间的毫秒数 | `30000`

## 常见问题 {#common-questions}

- 使用 Postgres 适配器时是否还需要启用粘性会话？

是的。否则将导致 HTTP 400 响应（您到达的服务器不知道 Socket.IO 会话）。

更多信息可以在[这里](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required)找到。

- 当 Postgres 服务器关闭时会发生什么？

如果与 Postgres 服务器的连接被切断，数据包将仅发送到连接到当前服务器的客户端。

## Emitter {#emitter}

Postgres 发射器允许从另一个 Node.js 进程向连接的客户端发送数据包：

![Diagram of how the Postgres emitter works](/images/postgres-emitter.png)

### 安装 {#installation-1}

```
npm install @socket.io/postgres-emitter pg
```

### 用法 {#usage-1}

```js
const { Emitter } = require("@socket.io/postgres-emitter");
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "changeit",
  port: 5432,
});

const emitter = new Emitter(pool);

setInterval(() => {
  emitter.emit("ping", new Date());
}, 1000);
```

请参阅[此处](adapter.md#emitter-cheatsheet)的备忘单。
