---
title: 词汇表
sidebar_position: 2
slug: /glossary/
---

我们将在这里列出与 Socket.IO 生态系统相关的术语：

- [Adapter](#adapter)
- [Engine.IO](#engineio)
- [Namespace](#namespace)
- [Room](#room)
- [Transport](#transport)

## Adapter {#adapter}

Adapter是一个服务器端组件，负责：

- 存储 Socket 实例和[房间](../04-Events/rooms.md)之间的关系
- [向所有](../04-Events/broadcasting-events.md)（或部分）客户端广播事件

除了Socket.IO 服务器默认包含[的内存适配器](https://github.com/socketio/socket.io-adapter/)外，目前还有 4 个官方适配器：

- [Redis 适配器](../05-Adapters/adapter-redis.md)
- [MongoDB 适配器](../05-Adapters/adapter-mongo.md)
- [Postgres 适配器](../05-Adapters/adapter-postgres.md)
- [Cluster 适配器](../05-Adapters/adapter-cluster.md)

内存适配器可以扩展以添加对其他消息传递系统的支持，例如 RabbitMQ 或 Google Pub/Sub。

请查看[这个文档](../05-Adapters/adapter.md)。

## Engine.IO {#engineio}

Engine.IO 是 Socket.IO 的内部组件，负责建立服务器和客户端之间的低级连接。

您将[在这里](../01-Documentation/how-it-works.md)找到更多信息。

## Namespace {#namespace}

命名空间是一个允许在服务器端拆分应用程序逻辑的概念。

请查看[这个文档](../06-Advanced/namespaces.md)。

## Room {#room}

Room 是一个服务器端概念，允许将数据广播到客户端的子集。

请查看[这个文档](../04-Events/rooms.md)。

## Transport {#transport}

传输表示在服务器和客户端之间建立连接的低级方式。

目前有两种实现的传输：

- HTTP 长轮询
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

请查看[这个文档](../01-Documentation/how-it-works.md#transports).
