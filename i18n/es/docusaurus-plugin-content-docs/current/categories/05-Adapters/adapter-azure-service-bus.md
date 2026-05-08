---
title: Adaptador Azure Service Bus
sidebar_position: 9
slug: /azure-service-bus-adapter/
---

## Cómo funciona {#how-it-works}

Este adaptador usa el [servicio Azure Service Bus](https://learn.microsoft.com/en-us/azure/service-bus-messaging) para reenviar mensajes entre los nodos de un clúster Socket.IO.

El código fuente de este adaptador se puede encontrar [aquí](https://github.com/socketio/socket.io-azure-service-bus-adapter).

## Características soportadas {#supported-features}

| Característica                     | Versión de `socket.io`              | Soporte                                        |
|------------------------------------|-------------------------------------|------------------------------------------------|
| Gestión de sockets                 | `4.0.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Comunicación entre servidores      | `4.1.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Broadcast con acknowledgements     | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Recuperación del estado de conexión| [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Instalación {#installation}

```
npm install @socket.io/azure-service-bus-adapter
```

## Uso {#usage}

```js
import { ServiceBusClient, ServiceBusAdministrationClient } from "@azure/service-bus";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/azure-service-bus-adapter";

const connectionString = "Endpoint=...";

const serviceBusClient = new ServiceBusClient(connectionString);
const serviceBusAdminClient = new ServiceBusAdministrationClient(connectionString);

const io = new Server({
  adapter: createAdapter(serviceBusClient, serviceBusAdminClient)
});

// esperar la creación de la suscripción
await io.of("/").adapter.init();

io.listen(3000);
```

## Opciones {#options}

| Nombre               | Descripción                                                                                            | Valor predeterminado |
|----------------------|--------------------------------------------------------------------------------------------------------|----------------------|
| `topicName`          | El nombre del topic.                                                                                   | `socket.io`          |
| `topicOptions`       | Las opciones usadas para crear el topic.                                                               | `-`                  |
| `subscriptionPrefix` | El prefijo de la suscripción (se creará una suscripción por servidor Socket.IO en el clúster).         | `socket.io`          |
| `receiverOptions`    | Las opciones usadas para crear la suscripción.                                                         | `-`                  |
| `topicOptions`       | Las opciones usadas para crear el receiver.                                                            | `-`                  |
| `heartbeatInterval`  | El número de ms entre dos heartbeats.                                                                  | `5_000`              |
| `heartbeatTimeout`   | El número de ms sin heartbeat antes de considerar un nodo caído.                                       | `10_000`             |

## Últimas versiones {#latest-releases}

| Versión | Fecha de lanzamiento | Notas de lanzamiento                                                                       | Diff |
|---------|----------------------|--------------------------------------------------------------------------------------------|------|
| `0.1.0` | Marzo 2024           | [link](https://github.com/socketio/socket.io-azure-service-bus-adapter/releases/tag/0.1.0) | `-`  |

[Changelog completo](https://github.com/socketio/socket.io-azure-service-bus-adapter/blob/main/CHANGELOG.md)
