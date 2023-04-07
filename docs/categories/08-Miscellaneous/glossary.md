---
title: Glossary
sidebar_position: 2
slug: /glossary/
---

We will list here the terms that are related to the Socket.IO ecosystem:

- [Adapter](#adapter)
- [Engine.IO](#engineio)
- [Namespace](#namespace)
- [Room](#room)
- [Transport](#transport)

## Adapter

An Adapter is a server-side component which is responsible for:

- storing the relationships between the Socket instances and the [rooms](../04-Events/rooms.md)
- broadcasting events to [all](../04-Events/broadcasting-events.md) (or a subset of) clients

Besides the [in-memory adapter](https://github.com/socketio/socket.io-adapter/) which is included by default with the Socket.IO server, there are currently 5 official adapters:

- the [Redis adapter](../05-Adapters/adapter-redis.md)
- the [Redis Streams adapter](../05-Adapters/adapter-redis-streams.md)
- the [MongoDB adapter](../05-Adapters/adapter-mongo.md)
- the [Postgres adapter](../05-Adapters/adapter-postgres.md)
- the [Cluster adapter](../05-Adapters/adapter-cluster.md)

The in-memory adapter can be extended to add support for other messaging systems, like RabbitMQ or Google Pub/Sub for example.

Please see the documentation [here](../05-Adapters/adapter.md).

## Engine.IO

Engine.IO is an internal component of Socket.IO, which is responsible for establishing the low-level connection between the server and the client.

You will find more information [here](../01-Documentation/how-it-works.md).

## Namespace

A Namespace is a concept that allows splitting the application logic on the server-side.

Please see the documentation [here](../06-Advanced/namespaces.md).

## Room

A Room is a server-side concept that allows broadcasting data to a subset of clients.

Please see the documentation [here](../04-Events/rooms.md).

## Transport

A Transport represents the low-level way of establishing a connection between the server and the client.

There are currently two implemented transports:

- HTTP long-polling
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

Please see the documentation [here](../01-Documentation/how-it-works.md#transports).
