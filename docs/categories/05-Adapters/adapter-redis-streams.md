---
title: Redis Streams adapter
sidebar_position: 3
slug: /redis-streams-adapter/
---

## How it works

The adapter will use a [Redis stream](https://redis.io/docs/data-types/streams/) to forward packets between the Socket.IO servers.

The main difference with the existing Redis adapter (which use the [Redis Pub/Sub mechanism](https://redis.io/docs/manual/pubsub/)) is that this adapter will properly handle any temporary disconnection to the Redis server and resume the stream without losing any packets.

Notes:

- a single stream is used for all namespaces
- the `maxLen` option allows to limit the size of the stream
- unlike the adapter based on Redis PUB/SUB mechanism, this adapter will properly handle any temporary disconnection to the Redis server and resume the stream
- if [connection state recovery](../01-Documentation/connection-state-recovery.md) is enabled, the sessions will be stored in Redis as a classic key/value pair

Source code: https://github.com/socketio/socket.io-redis-streams-adapter

## Installation

```
npm install @socket.io/redis-streams-adapter redis
```

## Usage

```js
import { createClient } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";

const redisClient = createClient({ host: "localhost", port: 6379 });

await redisClient.connect();

const io = new Server({
  adapter: createAdapter(redisClient)
});

io.listen(3000);
```

## Options

| Name                | Description                                                        | Default value |
|---------------------|--------------------------------------------------------------------|---------------|
| `streamName`        | The name of the Redis stream.                                      | `socket.io`   |
| `maxLen`            | The maximum size of the stream. Almost exact trimming (~) is used. | `10_000`      |
| `readCount`         | The number of elements to fetch per XREAD call.                    | `100`         |
| `heartbeatInterval` | The number of ms between two heartbeats.                           | `5_000`       |
| `heartbeatTimeout`  | The number of ms without heartbeat before we consider a node down. | `10_000`      |

## Common questions

- Do I still need to enable sticky sessions when using the Redis Streams adapter?

Yes. Failing to do so will result in HTTP 400 responses (you are reaching a server that is not aware of the Socket.IO session).

More information can be found [here](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

- What happens when the Redis server is down?

Unlike the classic [Redis adapter](./adapter-redis.md), this adapter will properly handle any temporary disconnection to the Redis server and resume the stream without losing any packets.

## Latest releases

- [0.1.0](https://github.com/socketio/socket.io-redis-streams-adapter/releases/tag/0.1.0) (April 2023)
