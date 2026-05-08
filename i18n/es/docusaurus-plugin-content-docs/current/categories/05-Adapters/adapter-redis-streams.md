---
title: Adaptador Redis Streams
sidebar_position: 3
slug: /redis-streams-adapter/
---

## Cómo funciona

El adaptador usará un [stream de Redis](https://redis.io/docs/data-types/streams/) para reenviar paquetes entre los servidores Socket.IO.

La principal diferencia con el adaptador Redis existente (que usa el [mecanismo Redis Pub/Sub](https://redis.io/docs/manual/pubsub/)) es que este adaptador manejará correctamente cualquier desconexión temporal al servidor Redis y reanudará el stream sin perder ningún paquete.

:::info

- un único stream se usa para todos los namespaces
- la opción `maxLen` permite limitar el tamaño del stream
- a diferencia del adaptador basado en el mecanismo Redis PUB/SUB, este adaptador manejará correctamente cualquier desconexión temporal al servidor Redis y reanudará el stream
- si la [recuperación del estado de conexión](../01-Documentation/connection-state-recovery.md) está habilitada, las sesiones se almacenarán en Redis como un par clave/valor clásico

:::

:::tip

Este adaptador también es compatible con [Valkey](https://valkey.io/).

:::

Código fuente: https://github.com/socketio/socket.io-redis-streams-adapter

## Características soportadas

| Característica                     | Versión de `socket.io`              | Soporte                                        |
|------------------------------------|-------------------------------------|------------------------------------------------|
| Gestión de sockets                 | `4.0.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Comunicación entre servidores      | `4.1.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Broadcast con acknowledgements     | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Recuperación del estado de conexión| [`4.6.0`](../../changelog/4.6.0.md) | :white_check_mark: SÍ (desde versión `0.1.0`)  |

## Instalación

```
npm install @socket.io/redis-streams-adapter redis
```

## Uso

### Con el paquete `redis`

```js
import { createClient } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";

const redisClient = createClient({ url: "redis://localhost:6379" });

await redisClient.connect();

const io = new Server({
  adapter: createAdapter(redisClient)
});

io.listen(3000);
```

### Con el paquete `redis` y un clúster Redis

```js
import { createCluster } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";

const redisClient = createCluster({
  rootNodes: [
    {
      url: "redis://localhost:7000",
    },
    {
      url: "redis://localhost:7001",
    },
    {
      url: "redis://localhost:7002",
    },
  ],
});

await redisClient.connect();

const io = new Server({
  adapter: createAdapter(redisClient)
});

io.listen(3000);
```

### Con el paquete `ioredis`

```js
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";

const redisClient = new Redis();

const io = new Server({
  adapter: createAdapter(redisClient)
});

io.listen(3000);
```

### Con el paquete `ioredis` y un clúster Redis

```js
import { Cluster } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";

const redisClient = new Cluster([
  {
    host: "localhost",
    port: 7000,
  },
  {
    host: "localhost",
    port: 7001,
  },
  {
    host: "localhost",
    port: 7002,
  },
]);

const io = new Server({
  adapter: createAdapter(redisClient)
});

io.listen(3000);
```

## Opciones

| Nombre              | Descripción                                                                                                       | Valor predeterminado |
|---------------------|-------------------------------------------------------------------------------------------------------------------|----------------------|
| `streamName`        | El nombre del stream de Redis.                                                                                    | `socket.io`          |
| `maxLen`            | El tamaño máximo del stream. Se usa recorte casi exacto (~).                                                      | `10_000`             |
| `readCount`         | El número de elementos a obtener por llamada XREAD.                                                               | `100`                |
| `sessionKeyPrefix`  | El prefijo de la clave usada para almacenar la sesión Socket.IO, cuando la característica de recuperación del estado de conexión está habilitada. | `sio:session:` |
| `heartbeatInterval` | El número de ms entre dos heartbeats.                                                                             | `5_000`              |
| `heartbeatTimeout`  | El número de ms sin heartbeat antes de considerar un nodo caído.                                                  | `10_000`             |

## Preguntas frecuentes

### ¿Todavía necesito habilitar sesiones sticky al usar el adaptador Redis Streams?

Sí. No hacerlo resultará en respuestas HTTP 400 (estás llegando a un servidor que no conoce la sesión Socket.IO).

Más información se puede encontrar [aquí](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

### ¿Qué pasa cuando el servidor Redis está caído?

A diferencia del [adaptador Redis](./adapter-redis.md) clásico, este adaptador manejará correctamente cualquier desconexión temporal al servidor Redis y reanudará el stream sin perder ningún paquete.

## Últimas versiones

| Versión | Fecha de lanzamiento | Notas de lanzamiento                                                                   | Diff                                                                                                 |
|---------|----------------------|----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `0.2.2` | Mayo 2024            | [link](https://github.com/socketio/socket.io-redis-streams-adapter/releases/tag/0.2.2) | [`0.2.1...0.2.2`](https://github.com/socketio/socket.io-redis-streams-adapter/compare/0.2.1...0.2.2) |
| `0.2.1` | Marzo 2024           | [link](https://github.com/socketio/socket.io-redis-streams-adapter/releases/tag/0.2.1) | [`0.2.0...0.2.1`](https://github.com/socketio/socket.io-redis-streams-adapter/compare/0.2.0...0.2.1) |
| `0.2.0` | Febrero 2024         | [link](https://github.com/socketio/socket.io-redis-streams-adapter/releases/tag/0.2.0) | [`0.1.0...0.2.0`](https://github.com/socketio/socket.io-redis-streams-adapter/compare/0.1.0...0.2.0) |
| `0.1.0` | Abril 2023           | [link](https://github.com/socketio/socket.io-redis-streams-adapter/releases/tag/0.1.0) |                                                                                                      |

[Changelog completo](https://github.com/socketio/socket.io-redis-streams-adapter/blob/main/CHANGELOG.md)
