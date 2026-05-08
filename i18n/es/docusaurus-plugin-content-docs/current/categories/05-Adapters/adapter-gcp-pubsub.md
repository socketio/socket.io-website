---
title: Adaptador Google Cloud Pub/Sub
sidebar_position: 7
slug: /gcp-pubsub-adapter/
---

## Cómo funciona

Este adaptador usa el [servicio Google Cloud Pub/Sub](https://cloud.google.com/pubsub/docs/overview) para reenviar mensajes entre los nodos de un clúster Socket.IO.

El código fuente de este adaptador se puede encontrar [aquí](https://github.com/socketio/socket.io-gcp-pubsub-adapter).

## Características soportadas

| Característica                     | Versión de `socket.io`              | Soporte                                        |
|------------------------------------|-------------------------------------|------------------------------------------------|
| Gestión de sockets                 | `4.0.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Comunicación entre servidores      | `4.1.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Broadcast con acknowledgements     | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Recuperación del estado de conexión| [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Instalación

```
npm install @socket.io/gcp-pubsub-adapter
```

## Uso

```js
import { PubSub } from "@google-cloud/pubsub";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/gcp-pubsub-adapter";

const pubsub = new PubSub({
  projectId: "your-project-id"
});

const topic = pubsub.topic(topicNameOrId);

const io = new Server({
  adapter: createAdapter(topic)
});

// esperar la creación de la suscripción pub/sub
await io.of("/").adapter.init();

io.listen(3000);
```

## Opciones

| Nombre                | Descripción                                                                                                       | Valor predeterminado |
|-----------------------|-------------------------------------------------------------------------------------------------------------------|----------------------|
| `subscriptionPrefix`  | El prefijo para la nueva suscripción a crear.                                                                     | `socket.io`          |
| `subscriptionOptions` | Las opciones usadas para crear la suscripción.                                                                    | `-`                  |
| `heartbeatInterval`   | El número de ms entre dos heartbeats.                                                                             | `5_000`              |
| `heartbeatTimeout`    | El número de ms sin heartbeat antes de considerar un nodo caído.                                                  | `10_000`             |

## Últimas versiones

| Versión | Fecha de lanzamiento | Notas de lanzamiento                                                                | Diff |
|---------|----------------------|-------------------------------------------------------------------------------------|------|
| `0.1.0` | Marzo 2024           | [link](https://github.com/socketio/socket.io-gcp-pubsub-adapter/releases/tag/0.1.0) | `-`  |

[Changelog completo](https://github.com/socketio/socket.io-gcp-pubsub-adapter/blob/main/CHANGELOG.md)
