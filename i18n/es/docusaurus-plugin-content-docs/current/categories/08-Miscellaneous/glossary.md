---
title: Glosario
sidebar_position: 2
slug: /glossary/
---

Aquí listamos los términos que están relacionados con el ecosistema Socket.IO:

- [Adaptador](#adaptador)
- [Engine.IO](#engineio)
- [Namespace](#namespace)
- [Sala](#sala)
- [Transporte](#transporte)

## Adaptador

Un Adaptador es un componente del lado del servidor que es responsable de:

- almacenar las relaciones entre las instancias de Socket y las [salas](../04-Events/rooms.md)
- transmitir eventos a [todos](../04-Events/broadcasting-events.md) (o un subconjunto de) clientes

Además del [adaptador en memoria](https://github.com/socketio/socket.io-adapter/) que está incluido por defecto con el servidor Socket.IO, actualmente hay 5 adaptadores oficiales:

- el [adaptador Redis](../05-Adapters/adapter-redis.md)
- el [adaptador Redis Streams](../05-Adapters/adapter-redis-streams.md)
- el [adaptador MongoDB](../05-Adapters/adapter-mongo.md)
- el [adaptador Postgres](../05-Adapters/adapter-postgres.md)
- el [adaptador Cluster](../05-Adapters/adapter-cluster.md)

El adaptador en memoria puede ser extendido para agregar soporte para otros sistemas de mensajería, como RabbitMQ o Google Pub/Sub por ejemplo.

Por favor consulta la documentación [aquí](../05-Adapters/adapter.md).

## Engine.IO

Engine.IO es un componente interno de Socket.IO, que es responsable de establecer la conexión de bajo nivel entre el servidor y el cliente.

Encontrarás más información [aquí](../01-Documentation/how-it-works.md).

## Namespace

Un Namespace es un concepto que permite dividir la lógica de la aplicación en el lado del servidor.

Por favor consulta la documentación [aquí](../06-Advanced/namespaces.md).

## Sala

Una Sala es un concepto del lado del servidor que permite transmitir datos a un subconjunto de clientes.

Por favor consulta la documentación [aquí](../04-Events/rooms.md).

## Transporte

Un Transporte representa la forma de bajo nivel de establecer una conexión entre el servidor y el cliente.

Actualmente hay tres transportes implementados:

- HTTP long-polling
- [WebSocket](https://developer.mozilla.org/es/docs/Web/API/WebSockets_API)
- [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)

Por favor consulta la documentación [aquí](../01-Documentation/how-it-works.md#transports).
