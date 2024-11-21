---
title: Redis adapter
sidebar_position: 2
slug: /redis-adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## How it works

The Redis adapter relies on the Redis [Pub/Sub mechanism](https://redis.io/topics/pubsub).

Every packet that is sent to multiple clients (e.g. `io.to("room1").emit()` or `socket.broadcast.emit()`) is:

- sent to all matching clients connected to the current server
- published in a Redis channel, and received by the other Socket.IO servers of the cluster

<ThemedImage
  alt="Diagram of how the Redis adapter works"
  sources={{
    light: useBaseUrl('/images/broadcasting-redis.png'),
    dark: useBaseUrl('/images/broadcasting-redis-dark.png'),
  }}
/>

The source code of this adapter can be found [here](https://github.com/socketio/socket.io-redis-adapter).

## Supported features

| Feature                         | `socket.io` version                 | Support                                        |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket management               | `4.0.0`                             | :white_check_mark: YES (since version `6.1.0`) |
| Inter-server communication      | `4.1.0`                             | :white_check_mark: YES (since version `7.0.0`) |
| Broadcast with acknowledgements | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: YES (since version `7.2.0`) |
| Connection state recovery       | [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Installation

```
npm install @socket.io/redis-adapter
```

## Compatibility table

| Redis Adapter version | Socket.IO server version |
|-----------------------|--------------------------|
| 4.x                   | 1.x                      |
| 5.x                   | 2.x                      |
| 6.0.x                 | 3.x                      |
| 6.1.x                 | 4.x                      |
| 7.x and above         | 4.3.1 and above          |

## Usage

:::tip

For new developments, we recommend using the [sharded adapter](#with-redis-sharded-pubsub), which takes advantage of the [sharded Pub/Sub feature](https://redis.io/docs/latest/develop/interact/pubsub/#sharded-pubsub) introduced in Redis 7.0.

:::

### With the `redis` package

:::caution

The `redis` package seems to have problems restoring the Redis subscriptions after reconnection:

- https://github.com/redis/node-redis/issues/2155
- https://github.com/redis/node-redis/issues/1252

You may want to use the [`ioredis`](#with-the-ioredis-package) package instead.

:::

```js
import { createClient } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

await Promise.all([
  pubClient.connect(),
  subClient.connect()
]);

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### With the `redis` package and a Redis cluster

```js
import { createCluster } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = createCluster({
  rootNodes: [
    {
      url: "redis://localhost:7000",
    },
    {
      url: "redis://localhost:7001",
    },
    {
      url: "redis://localhost:7002",
    },
  ],
});
const subClient = pubClient.duplicate();

await Promise.all([
  pubClient.connect(),
  subClient.connect()
]);

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### With the `ioredis` package

```js
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = new Redis();
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### With the `ioredis` package and a Redis cluster

```js
import { Cluster } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = new Cluster([
  {
    host: "localhost",
    port: 7000,
  },
  {
    host: "localhost",
    port: 7001,
  },
  {
    host: "localhost",
    port: 7002,
  },
]);
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### With Redis sharded Pub/Sub

Sharded Pub/Sub was introduced in Redis 7.0 in order to help scaling the usage of Pub/Sub in cluster mode.

Reference: https://redis.io/docs/interact/pubsub/#sharded-pubsub

A dedicated adapter can be created with the `createShardedAdapter()` method:

```js
import { Server } from "socket.io";
import { createClient } from "redis";
import { createShardedAdapter } from "@socket.io/redis-adapter";

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

await Promise.all([
  pubClient.connect(),
  subClient.connect()
]);

const io = new Server({
  adapter: createShardedAdapter(pubClient, subClient)
});

io.listen(3000);
```

Minimum requirements:

- Redis 7.0
- [`redis@4.6.0`](https://github.com/redis/node-redis/commit/3b1bad229674b421b2bc6424155b20d4d3e45bd1)

:::caution

It is not currently possible to use the sharded adapter with the `ioredis` package and a Redis cluster ([reference](https://github.com/luin/ioredis/issues/1759)).

:::

## Options

### Default adapter

| Name                               | Description                                                                   | Default value |
|------------------------------------|-------------------------------------------------------------------------------|---------------|
| `key`                              | The prefix for the Redis Pub/Sub channels.                                    | `socket.io`   |
| `requestsTimeout`                  | After this timeout the adapter will stop waiting from responses to request.   | `5_000`       |
| `publishOnSpecificResponseChannel` | Whether to publish a response to the channel specific to the requesting node. | `false`       |
| `parser`                           | The parser to use for encoding and decoding messages sent to Redis.           | `-`           |

:::tip

Setting the `publishOnSpecificResponseChannel` option to `true` is more efficient since the responses (for example when calling `fetchSockets()` or `serverSideEmit()`) are only sent to the requesting server, and not to all the servers.

However, it currently defaults to `false` for backward-compatibility.

:::

### Sharded adapter

| Name               | Description                                                                             | Default value |
|--------------------|-----------------------------------------------------------------------------------------|---------------|
| `channelPrefix`    | The prefix for the Redis Pub/Sub channels.                                              | `socket.io`   |
| `subscriptionMode` | The subscription mode impacts the number of Redis Pub/Sub channels used by the adapter. | `dynamic`     |

Available values for the `subscriptionMode` option:

| Value               | # of Pub/Sub channels                 | Description                                                                                                                                       |
|---------------------|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `static`            | 2 per namespace                       | Useful when used with dynamic namespaces.                                                                                                         |
| `dynamic` (default) | (2 + 1 per public room) per namespace | Useful when some rooms have a low number of clients (so only a few Socket.IO servers are notified).                                               |
| `dynamic-private`   | (2 + 1 per room) per namespace        | Like `dynamic` but creates separate channels for private rooms as well. Useful when there is lots of 1:1 communication via `socket.emit()` calls. |

## Common questions

### Is there any data stored in Redis?

No, the Redis adapter uses the [Pub/Sub mechanism](https://redis.io/topics/pubsub) to forward the packets between the Socket.IO servers, so there are no keys stored in Redis.

### Do I still need to enable sticky sessions when using the Redis adapter?

Yes. Failing to do so will result in HTTP 400 responses (you are reaching a server that is not aware of the Socket.IO session).

More information can be found [here](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

### What happens when the Redis server is down?

In case the connection to the Redis server is severed, the packets will only be sent to the clients that are connected to the current server.

## Migrating from `socket.io-redis`

The package was renamed from `socket.io-redis` to `@socket.io/redis-adapter` in [v7](https://github.com/socketio/socket.io-redis-adapter/releases/tag/7.0.0), in order to match the name of the Redis emitter (`@socket.io/redis-emitter`).

To migrate to the new package, you'll need to make sure to provide your own Redis clients, as the package will no longer create Redis clients on behalf of the user.

Before:

```js
const redisAdapter = require("socket.io-redis");

io.adapter(redisAdapter({ host: "localhost", port: 6379 }));
```

After:

```js
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

:::tip

The communication protocol between the Socket.IO servers has not been updated, so you can have some servers with `socket.io-redis` and some others with `@socket.io/redis-adapter` at the same time.

:::

## Latest releases

| Version | Release date  | Release notes                                                                  | Diff                                                                                         |
|---------|---------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `8.3.0` | March 2024    | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.3.0) | [`8.2.1...8.3.0`](https://github.com/socketio/socket.io-redis-adapter/compare/8.2.1...8.3.0) |
| `8.2.1` | May 2023      | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.2.1) | [`8.2.0...8.2.1`](https://github.com/socketio/socket.io-redis-adapter/compare/8.2.0...8.2.1) |
| `8.2.0` | May 2023      | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.2.0) | [`8.1.0...8.2.0`](https://github.com/socketio/socket.io-redis-adapter/compare/8.1.0...8.2.0) |
| `8.1.0` | February 2023 | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.1.0) | [`8.0.0...8.1.0`](https://github.com/socketio/socket.io-redis-adapter/compare/8.0.0...8.1.0) |
| `8.0.0` | December 2022 | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.0.0) | [`7.2.0...8.0.0`](https://github.com/socketio/socket.io-redis-adapter/compare/7.2.0...8.0.0) |
| `7.2.0` | May 2022      | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/7.2.0) | [`7.1.0...7.2.0`](https://github.com/socketio/socket.io-redis-adapter/compare/7.1.0...7.2.0) |

[Complete changelog](https://github.com/socketio/socket.io-redis-adapter/blob/main/CHANGELOG.md)

## Emitter

The Redis emitter allows sending packets to the connected clients from another Node.js process:

<ThemedImage
  alt="Diagram of how the Redis emitter works"
  sources={{
    light: useBaseUrl('/images/redis-emitter.png'),
    dark: useBaseUrl('/images/redis-emitter-dark.png'),
  }}
/>

This emitter is also available in several languages:

- Javascript: https://github.com/socketio/socket.io-redis-emitter
- Java: https://github.com/sunsus/socket.io-java-emitter
- Python: https://pypi.org/project/socket.io-emitter/
- PHP: https://github.com/rase-/socket.io-php-emitter
- Golang: https://github.com/yosuke-furukawa/socket.io-go-emitter
- Perl: https://metacpan.org/pod/SocketIO::Emitter
- Rust: https://github.com/epli2/socketio-rust-emitter

### Installation

```
npm install @socket.io/redis-emitter redis
```

### Usage

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

Note: with `redis@3`, calling `connect()` on the Redis client is not needed:

```js
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });
const emitter = new Emitter(redisClient);

setInterval(() => {
  emitter.emit("time", new Date);
}, 5000);
```

Please refer to the cheatsheet [here](adapter.md#emitter-cheatsheet).

### Migrating from `socket.io-emitter`

The package was renamed from `socket.io-emitter` to `@socket.io/redis-emitter` in [v4](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.0.0), in order to better reflect the relationship with Redis.

To migrate to the new package, you'll need to make sure to provide your own Redis clients, as the package will no longer create Redis clients on behalf of the user.

Before:

```js
const io = require("socket.io-emitter")({ host: "127.0.0.1", port: 6379 });
```

After:

```js
const { Emitter } = require("@socket.io/redis-emitter");
const { createClient } = require("redis");

const redisClient = createClient();
const io = new Emitter(redisClient);
```

### Latest releases

| Version | Release date   | Release notes                                                                  | Diff                                                                                         |
|---------|----------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `5.1.0` | January 2023   | [link](https://github.com/socketio/socket.io-redis-emitter/releases/tag/5.1.0) | [`5.0.0...5.1.0`](https://github.com/socketio/socket.io-redis-emitter/compare/5.0.0...5.1.0) |
| `5.0.0` | September 2022 | [link](https://github.com/socketio/socket.io-redis-emitter/releases/tag/5.0.1) | [`4.1.1...5.0.0`](https://github.com/socketio/socket.io-redis-emitter/compare/4.1.1...5.0.0) |
| `4.1.1` | January 2022   | [link](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.1.1) | [`4.1.0...4.1.1`](https://github.com/socketio/socket.io-redis-emitter/compare/4.1.0...4.1.1) |
| `4.1.0` | May 2021       | [link](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.1.0) | [`4.0.0...4.1.0`](https://github.com/socketio/socket.io-redis-emitter/compare/4.0.0...4.1.0) |
| `4.0.0` | March 2021     | [link](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.0.0) | [`3.2.0...4.0.0`](https://github.com/socketio/socket.io-redis-emitter/compare/3.2.0...4.0.0) |

[Complete changelog](https://github.com/socketio/socket.io-redis-emitter/blob/main/CHANGELOG.md)
