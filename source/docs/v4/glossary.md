title: Glossary
permalink: /docs/v4/glossary/
release: v4
type: docs
order: 602
---

We will list here the terms that are related to the Socket.IO ecosystem:

- [Adapter](#Adapter)
- [Engine.IO](#Engine-IO)
- [Namespace](#Namespace)
- [Room](#Room)
- [Transport](#Transport)

## Adapter

An Adapter is a server-side component which is responsible for:

- storing the relationships between the Socket instances and the [rooms](/docs/v4/rooms/)
- broadcasting events to [all](/docs/v4/broadcasting-events/) (or a subset of) clients

Besides the [in-memory adapter](https://github.com/socketio/socket.io-adapter/) which is included by default with the Socket.IO server, there are currently three official adapters:

- the [Redis adapter](/docs/v4/redis-adapter/)
- the [MongoDB adapter](/docs/v4/mongo-adapter/)
- the [Postgres adapter](/docs/v4/postgres-adapter)

The in-memory adapter can be extended to add support for other messaging systems, like RabbitMQ or Google Pub/Sub for example.

Please see the documentation [here](/docs/v4/adapter/).

## Engine.IO

Engine.IO is an internal component of Socket.IO, which is responsible for establishing the low-level connection between the server and the client.

You will find more information [here](/docs/v4/how-it-works/).

## Namespace

A Namespace is a concept that allows splitting the application logic on the server-side.

Please see the documentation [here](/docs/v4/namespaces/).

## Room

A Room is a server-side concept that allows broadcasting data to a subset of clients.

Please see the documentation [here](/docs/v4/rooms/).

## Transport

A Transport represents the low-level way of establishing a connection between the server and the client.

There are currently two implemented transports:

- HTTP long-polling
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

Please see the documentation [here](/docs/v4/how-it-works/#Transports).
