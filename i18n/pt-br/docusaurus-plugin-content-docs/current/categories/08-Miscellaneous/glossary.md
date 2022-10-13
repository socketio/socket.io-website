---
title: Glossario
sidebar_position: 2
slug: /glossary/
---

Nós vamos listar aqui os termos que são relacionados no Socket.IO ecosistema:

- [Adapter](#adapter)
- [Engine.IO](#engineio)
- [Namespace](#namespace)
- [Room](#room)
- [Transport](#transport)

## Adapter {#adapter}

Um Adapter é um componente do lado do servidor que é responsável por: 

- armezenando o relacionamento entre as instances Socket e os [rooms](../04-Events/rooms.md)
- transmitindo eventos para [todos](../04-Events/broadcasting-events.md) (ou um subconjunto) os clientes.

Além do [in-memory adapter](https://github.com/socketio/socket.io-adapter/) que está incluído por padrão no servidor Socket.IO, atualmente existem 4 adaptadores oficiais:

- O [Redis adapter](../05-Adapters/adapter-redis.md)
- O [MongoDB adapter](../05-Adapters/adapter-mongo.md)
- O [Postgres adapter](../05-Adapters/adapter-postgres.md)
- O [Cluster adapter](../05-Adapters/adapter-cluster.md)

O in-memory adapter pode ser extendido para adicionar suporte para outros sistemas de mensagem, como RabbitMQ ou Google Pub/Sub, por exemplo.

Obeserve a documentação [aqui](../05-Adapters/adapter.md).

## Engine.IO {#engineio}

Engine.IO é um componente interno do Socket.IO, que é responsavel por estabilizar a conexão baixo-nivel entre o servidor e o cliente.

Você pode encontrar mais informações [aqui](../01-Documentation/how-it-works.md).

## Namespace {#namespace}

Um Namespace é um conceito que permite a divisão a aplicação logíca no lado do servidor

Observe a documentação [aqui](../06-Advanced/namespaces.md).

## Room {#room}

Um Room é um conceito de lado de servidor que permite dado de transmissão para um subconjunto de clientes.

Observe a documentação [aqui](../04-Events/rooms.md).

## Transport {#transport}

Um Transport representa um forma de baixo-nível de estabelecer uma conexão entre o servidor e o cliente.

Existem atualmente dois transportes implementados:

- HTTP long-polling
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

Observe a documentação [aqui](../01-Documentation/how-it-works.md#transports).
