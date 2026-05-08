---
title: Adaptador AWS SQS
sidebar_position: 8
slug: /aws-sqs-adapter/
---

## Cómo funciona

Este adaptador usa [AWS Simple Queue Service](https://aws.amazon.com/sqs/) para reenviar mensajes entre los nodos de un clúster Socket.IO.

A diferencia del paquete existente [`socket.io-sqs`](https://github.com/thinkalpha/socket.io-sqs), este paquete soporta payloads binarios y namespaces dinámicos.

El código fuente de este adaptador se puede encontrar [aquí](https://github.com/socketio/socket.io-aws-sqs-adapter).

## Características soportadas

| Característica                     | Versión de `socket.io`              | Soporte                                        |
|------------------------------------|-------------------------------------|------------------------------------------------|
| Gestión de sockets                 | `4.0.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Comunicación entre servidores      | `4.1.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Broadcast con acknowledgements     | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Recuperación del estado de conexión| [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Instalación

```
npm install @socket.io/aws-sqs-adapter
```

## Uso

```js
import { SNS } from "@aws-sdk/client-sns";
import { SQS } from "@aws-sdk/client-sqs";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/aws-sqs-adapter";

const snsClient = new SNS();
const sqsClient = new SQS();

const io = new Server({
  adapter: createAdapter(snsClient, sqsClient)
});

// esperar la creación de la cola SQS
await io.of("/").adapter.init();

io.listen(3000);
```

## Opciones

| Nombre              | Descripción                                                        | Valor predeterminado |
|---------------------|--------------------------------------------------------------------|----------------------|
| `topicName`         | El nombre del topic SNS.                                           | `socket.io`          |
| `topicTags`         | Las etiquetas a aplicar al nuevo topic SNS.                        | `-`                  |
| `queuePrefix`       | El prefijo de la cola SQS.                                         | `socket.io`          |
| `queueTags`         | Las etiquetas a aplicar a la nueva cola SQS.                       | `-`                  |
| `heartbeatInterval` | El número de ms entre dos heartbeats.                              | `5_000`              |
| `heartbeatTimeout`  | El número de ms sin heartbeat antes de considerar un nodo caído.   | `10_000`             |

## Últimas versiones

| Versión | Fecha de lanzamiento | Notas de lanzamiento                                                             | Diff                                                                                           |
|---------|----------------------|----------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `0.1.1` | Junio 2024           | [link](https://github.com/socketio/socket.io-aws-sqs-adapter/releases/tag/0.1.1) | [`0.1.0...0.1.1`](https://github.com/socketio/socket.io-aws-sqs-adapter/compare/0.1.0...0.1.1) |
| `0.1.0` | Marzo 2024           | [link](https://github.com/socketio/socket.io-aws-sqs-adapter/releases/tag/0.1.0) | `-`                                                                                            |

[Changelog completo](https://github.com/socketio/socket.io-aws-sqs-adapter/blob/main/CHANGELOG.md)
