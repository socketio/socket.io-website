---
title: Redis adapter
sidebar_position: 2
slug: /redis-adapter/
---

## How it works

The Redis adapter relies on the Redis [Pub/Sub mechanism](https://redis.io/topics/pubsub).

Every packet that is sent to multiple clients (e.g. `io.to("room1").emit()` or `socket.broadcast.emit()`) is:

- sent to all matching clients connected to the current server
- published in a Redis channel, and received by the other Socket.IO servers of the cluster

![Diagram of how the Redis adapter works](/images/broadcasting-redis.png)

The source code of this adapter can be found [here](https://github.com/socketio/socket.io-redis-adapter).

## Installation

```
npm install @socket.io/redis-adapter redis
```

For TypeScript users, you will also need to install `@types/redis`.

## Usage

```js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const io = new Server();

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
io.listen(3000);
```

Or with `ioredis`:

```js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { Cluster } = require("ioredis");

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

## Options

| Name | Description | Default value |
| ---- | ----------- | ------------- |
| `key` | the prefix for the name of the Pub/Sub channel | `socket.io` |
| `requestsTimeout` | the timeout for inter-server requests such as `fetchSockets()` or `serverSideEmit()` with ack | `5000` |

## Common questions

- Do I still need to enable sticky sessions when using the Redis adapter?

Yes. Failing to do so will result in HTTP 400 responses (you are reaching a server that is not aware of the Socket.IO session).

More information can be found [here](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

- What happens when the Redis server is down?

In case the connection to the Redis server is severed, the packets will only be sent to the clients that are connected to the current server.

## Emitter

The Redis emitter allows sending packets to the connected clients from another Node.js process:

![Diagram of how the Redis emitter works](/images/redis-emitter.png)

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
const { Emitter } = require("@socket.io/redis-emitter");
const { createClient } = require("redis");

const redisClient = createClient({ host: "localhost", port: 6379 });
const emitter = new Emitter(redisClient);

setInterval(() => {
  emitter.emit("time", new Date);
}, 5000);
```

Please refer to the cheatsheet [here](adapter.md#emitter-cheatsheet).
