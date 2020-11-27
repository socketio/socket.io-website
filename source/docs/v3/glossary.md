title: Glossary
permalink: /docs/v3/glossary/
release: v3
type: docs
order: 602
---

We will list here the terms that are related to the Socket.IO ecosystem.

## Adapter

An Adapter is a server-side component which is responsible for:

- storing the relationships between the Socket instances and the [rooms](/docs/v3/rooms/)
- broadcasting events to [all](/docs/v3/broadcasting-events/) (or a subset of) clients

There are currently two official adapters:

- the [in-memory adapter](https://github.com/socketio/socket.io-adapter/), which is included by default with the Socket.IO server
- the [Redis adapter](https://github.com/socketio/socket.io-redis/), which is useful when scaling horizontally (see [here](/docs/v3/using-multiple-nodes/))

The in-memory adapter can be extended to add support for other messaging systems, like RabbitMQ or Google Pub/Sub for example.
