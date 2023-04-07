---
title: Postgres adapter
sidebar_position: 5
slug: /postgres-adapter/
---

## How it works

The Postgres adapter relies on the [NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html) and [LISTEN](https://www.postgresql.org/docs/current/sql-listen.html) commands.

Every packet that is sent to multiple clients (e.g. `io.to("room1").emit()` or `socket.broadcast.emit()`) is:

- sent to all matching clients connected to the current server
- if the packet contains binary data or is above the 8000 bytes limit, the packet is:
  - encoded with [msgpack](https://msgpack.org/) and inserted in an auxiliary table
  - the row ID is sent within a NOTIFY command
  - this row ID is received by the other Socket.IO servers of the cluster, which query the table, decode the packet and then broadcast it to their own set of connected clients
- else, the packet is simply sent within a NOTIFY command and received by the other Socket.IO servers of the cluster

![Diagram of how the Postgres adapter works](/images/postgres-adapter.png)

The source code of this adapter can be found [here](https://github.com/socketio/socket.io-postgres-adapter).

## Installation

```
npm install @socket.io/postgres-adapter pg
```

For TypeScript users, you might also need `@types/pg`.

## Usage

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

## Options

| Name | Description | Default value |
| ---- | ----------- | ------------- |
| `uid` | the ID of this node | a random ID |
| `channelPrefix` | the prefix of the notification channel | `socket.io` |
| `tableName` | the name of the table for payloads over the 8000 bytes limit or containing binary data | `socket_io_attachments` |
| `payloadThreshold` | the threshold for the payload size in bytes | `8000` |
| `requestsTimeout` | the timeout for inter-server requests such as `fetchSockets()` or `serverSideEmit()` with ack | `5000` |
| `heartbeatInterval` | the number of ms between two heartbeats | `5000` |
| `heartbeatTimeout` | the number of ms without heartbeat before we consider a node down | `10000` |
| `cleanupInterval` | the number of ms between two cleanup queries | `30000`

## Common questions

- Do I still need to enable sticky sessions when using the Postgres adapter?

Yes. Failing to do so will result in HTTP 400 responses (you are reaching a server that is not aware of the Socket.IO session).

More information can be found [here](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

- What happens when the Postgres server is down?

In case the connection to the Postgres server is severed, the packets will only be sent to the clients that are connected to the current server.

## Emitter

The Postgres emitter allows sending packets to the connected clients from another Node.js process:

![Diagram of how the Postgres emitter works](/images/postgres-emitter.png)

### Installation

```
npm install @socket.io/postgres-emitter pg
```

### Usage

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

Please refer to the cheatsheet [here](adapter.md#emitter-cheatsheet).
