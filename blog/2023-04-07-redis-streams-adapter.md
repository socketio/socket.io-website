---
title: Redis Streams adapter
slug: /socket-io-redis-streams-adapter/
authors:
- darrachequesne
---

Hello everyone!

There is a new official adapter for Socket.IO: the [Redis Streams adapter](/docs/v4/redis-streams-adapter/).

<!--truncate-->

:::note

An Adapter is a server-side component which is responsible for forwarding packets within a cluster of Socket.IO servers.

More information [here](/docs/v4/adapter/).

:::

The adapter will use a [Redis stream](https://redis.io/docs/data-types/streams/) to forward packets between the Socket.IO servers.

The main difference with the existing Redis adapter (which use the [Redis Pub/Sub mechanism](https://redis.io/docs/manual/pubsub/)) is that this adapter will properly handle any temporary disconnection to the Redis server and resume the stream without losing any packets.

See also:

- [Installation steps](/docs/v4/redis-streams-adapter/#installation)
- [Source code](https://github.com/socketio/socket.io-redis-streams-adapter)

If you have any feedback, feel free to open an issue in the repository.
