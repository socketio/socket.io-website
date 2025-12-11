---
title: Adaptador Redis
sidebar_position: 2
slug: /redis-adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## Cómo funciona

El adaptador Redis se basa en el mecanismo [Pub/Sub](https://redis.io/topics/pubsub) de Redis.

Cada paquete que se envía a múltiples clientes (ej. `io.to("room1").emit()` o `socket.broadcast.emit()`) es:

- enviado a todos los clientes coincidentes conectados al servidor actual
- publicado en un canal Redis, y recibido por los otros servidores Socket.IO del clúster

<ThemedImage
  alt="Diagrama de cómo funciona el adaptador Redis"
  sources={{
    light: useBaseUrl('/images/broadcasting-redis.png'),
    dark: useBaseUrl('/images/broadcasting-redis-dark.png'),
  }}
/>

El código fuente de este adaptador se puede encontrar [aquí](https://github.com/socketio/socket.io-redis-adapter).

## Características soportadas

| Característica                     | Versión de `socket.io`              | Soporte                                        |
|------------------------------------|-------------------------------------|------------------------------------------------|
| Gestión de sockets                 | `4.0.0`                             | :white_check_mark: SÍ (desde versión `6.1.0`)  |
| Comunicación entre servidores      | `4.1.0`                             | :white_check_mark: SÍ (desde versión `7.0.0`)  |
| Broadcast con acknowledgements     | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: SÍ (desde versión `7.2.0`)  |
| Recuperación del estado de conexión| [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Instalación

```
npm install @socket.io/redis-adapter
```

## Tabla de compatibilidad

| Versión del adaptador Redis | Versión del servidor Socket.IO |
|-----------------------------|--------------------------------|
| 4.x                         | 1.x                            |
| 5.x                         | 2.x                            |
| 6.0.x                       | 3.x                            |
| 6.1.x                       | 4.x                            |
| 7.x y superior              | 4.3.1 y superior               |

## Uso

:::tip

Para nuevos desarrollos, recomendamos usar el [adaptador sharded](#with-redis-sharded-pubsub), que aprovecha la [característica sharded Pub/Sub](https://redis.io/docs/latest/develop/interact/pubsub/#sharded-pubsub) introducida en Redis 7.0.

:::

### Con el paquete `redis`

:::caution

El paquete `redis` parece tener problemas restaurando las suscripciones Redis después de reconectarse:

- https://github.com/redis/node-redis/issues/2155
- https://github.com/redis/node-redis/issues/1252

Podrías querer usar el paquete [`ioredis`](#with-the-ioredis-package) en su lugar.

:::

```js
import { createClient } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

await Promise.all([
  pubClient.connect(),
  subClient.connect()
]);

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### Con el paquete `redis` y un clúster Redis

```js
import { createCluster } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = createCluster({
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
const subClient = pubClient.duplicate();

await Promise.all([
  pubClient.connect(),
  subClient.connect()
]);

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### Con el paquete `ioredis`

```js
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = new Redis();
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### Con el paquete `ioredis` y un clúster Redis

```js
import { Cluster } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = new Cluster([
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
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### Con Redis sharded Pub/Sub

Sharded Pub/Sub fue introducido en Redis 7.0 para ayudar a escalar el uso de Pub/Sub en modo clúster.

Referencia: https://redis.io/docs/interact/pubsub/#sharded-pubsub

Se puede crear un adaptador dedicado con el método `createShardedAdapter()`:

```js
import { Server } from "socket.io";
import { createClient } from "redis";
import { createShardedAdapter } from "@socket.io/redis-adapter";

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

await Promise.all([
  pubClient.connect(),
  subClient.connect()
]);

const io = new Server({
  adapter: createShardedAdapter(pubClient, subClient)
});

io.listen(3000);
```

Requisitos mínimos:

- Redis 7.0
- [`redis@4.6.0`](https://github.com/redis/node-redis/commit/3b1bad229674b421b2bc6424155b20d4d3e45bd1)

:::caution

Actualmente no es posible usar el adaptador sharded con el paquete `ioredis` y un clúster Redis ([referencia](https://github.com/luin/ioredis/issues/1759)).

:::

## Opciones

### Adaptador predeterminado

| Nombre                              | Descripción                                                                   | Valor predeterminado |
|-------------------------------------|-------------------------------------------------------------------------------|----------------------|
| `key`                               | El prefijo para los canales Redis Pub/Sub.                                    | `socket.io`          |
| `requestsTimeout`                   | Después de este timeout el adaptador dejará de esperar respuestas a solicitudes. | `5_000`           |
| `publishOnSpecificResponseChannel`  | Si publicar una respuesta al canal específico del nodo solicitante.           | `false`              |
| `parser`                            | El parser a usar para codificar y decodificar mensajes enviados a Redis.      | `-`                  |

:::tip

Establecer la opción `publishOnSpecificResponseChannel` a `true` es más eficiente ya que las respuestas (por ejemplo al llamar `fetchSockets()` o `serverSideEmit()`) solo se envían al servidor solicitante, y no a todos los servidores.

Sin embargo, actualmente está en `false` por defecto para compatibilidad hacia atrás.

:::

### Adaptador sharded

| Nombre              | Descripción                                                                              | Valor predeterminado |
|---------------------|------------------------------------------------------------------------------------------|----------------------|
| `channelPrefix`     | El prefijo para los canales Redis Pub/Sub.                                               | `socket.io`          |
| `subscriptionMode`  | El modo de suscripción impacta el número de canales Redis Pub/Sub usados por el adaptador. | `dynamic`           |

Valores disponibles para la opción `subscriptionMode`:

| Valor               | # de canales Pub/Sub                  | Descripción                                                                                                                                       |
|---------------------|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `static`            | 2 por namespace                       | Útil cuando se usan namespaces dinámicos.                                                                                                         |
| `dynamic` (defecto) | (2 + 1 por sala pública) por namespace| Útil cuando algunas salas tienen un bajo número de clientes (así solo unos pocos servidores Socket.IO son notificados).                           |
| `dynamic-private`   | (2 + 1 por sala) por namespace        | Como `dynamic` pero crea canales separados para salas privadas también. Útil cuando hay mucha comunicación 1:1 vía llamadas `socket.emit()`.      |

## Preguntas frecuentes

### ¿Se almacena algún dato en Redis?

No, el adaptador Redis usa el mecanismo [Pub/Sub](https://redis.io/topics/pubsub) para reenviar los paquetes entre los servidores Socket.IO, así que no hay claves almacenadas en Redis.

### ¿Todavía necesito habilitar sesiones sticky al usar el adaptador Redis?

Sí. No hacerlo resultará en respuestas HTTP 400 (estás llegando a un servidor que no conoce la sesión Socket.IO).

Más información se puede encontrar [aquí](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

### ¿Qué pasa cuando el servidor Redis está caído?

En caso de que la conexión al servidor Redis se corte, los paquetes solo se enviarán a los clientes que están conectados al servidor actual.

## Últimas versiones

| Versión | Fecha de lanzamiento | Notas de lanzamiento                                                           | Diff                                                                                         |
|---------|----------------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `8.3.0` | Marzo 2024           | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.3.0) | [`8.2.1...8.3.0`](https://github.com/socketio/socket.io-redis-adapter/compare/8.2.1...8.3.0) |
| `8.2.1` | Mayo 2023            | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.2.1) | [`8.2.0...8.2.1`](https://github.com/socketio/socket.io-redis-adapter/compare/8.2.0...8.2.1) |
| `8.2.0` | Mayo 2023            | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.2.0) | [`8.1.0...8.2.0`](https://github.com/socketio/socket.io-redis-adapter/compare/8.1.0...8.2.0) |
| `8.1.0` | Febrero 2023         | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.1.0) | [`8.0.0...8.1.0`](https://github.com/socketio/socket.io-redis-adapter/compare/8.0.0...8.1.0) |
| `8.0.0` | Diciembre 2022       | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.0.0) | [`7.2.0...8.0.0`](https://github.com/socketio/socket.io-redis-adapter/compare/7.2.0...8.0.0) |
| `7.2.0` | Mayo 2022            | [link](https://github.com/socketio/socket.io-redis-adapter/releases/tag/7.2.0) | [`7.1.0...7.2.0`](https://github.com/socketio/socket.io-redis-adapter/compare/7.1.0...7.2.0) |

[Changelog completo](https://github.com/socketio/socket.io-redis-adapter/blob/main/CHANGELOG.md)

## Emitter

El emitter Redis permite enviar paquetes a los clientes conectados desde otro proceso Node.js:

<ThemedImage
  alt="Diagrama de cómo funciona el emitter Redis"
  sources={{
    light: useBaseUrl('/images/redis-emitter.png'),
    dark: useBaseUrl('/images/redis-emitter-dark.png'),
  }}
/>

Este emitter también está disponible en varios lenguajes:

- Javascript: https://github.com/socketio/socket.io-redis-emitter
- Java: https://github.com/sunsus/socket.io-java-emitter
- Python: https://pypi.org/project/socket.io-emitter/
- PHP: https://github.com/rase-/socket.io-php-emitter
- Golang: https://github.com/yosuke-furukawa/socket.io-go-emitter
- Perl: https://metacpan.org/pod/SocketIO::Emitter
- Rust: https://github.com/epli2/socketio-rust-emitter

### Instalación

```
npm install @socket.io/redis-emitter redis
```

### Uso

```js
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });

redisClient.connect().then(() => {
  const emitter = new Emitter(redisClient);

  setInterval(() => {
    emitter.emit("time", new Date);
  }, 5000);
});
```

Nota: con `redis@3`, no es necesario llamar a `connect()` en el cliente Redis:

```js
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });
const emitter = new Emitter(redisClient);

setInterval(() => {
  emitter.emit("time", new Date);
}, 5000);
```

Por favor consulta la hoja de referencia [aquí](adapter.md#emitter-cheatsheet).

### Migrando desde `socket.io-emitter`

El paquete fue renombrado de `socket.io-emitter` a `@socket.io/redis-emitter` en [v4](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.0.0), para reflejar mejor la relación con Redis.

Para migrar al nuevo paquete, deberás asegurarte de proporcionar tus propios clientes Redis, ya que el paquete ya no creará clientes Redis en nombre del usuario.

Antes:

```js
const io = require("socket.io-emitter")({ host: "127.0.0.1", port: 6379 });
```

Después:

```js
const { Emitter } = require("@socket.io/redis-emitter");
const { createClient } = require("redis");

const redisClient = createClient();
const io = new Emitter(redisClient);
```

### Últimas versiones

| Versión | Fecha de lanzamiento | Notas de lanzamiento                                                           | Diff                                                                                         |
|---------|----------------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `5.1.0` | Enero 2023           | [link](https://github.com/socketio/socket.io-redis-emitter/releases/tag/5.1.0) | [`5.0.0...5.1.0`](https://github.com/socketio/socket.io-redis-emitter/compare/5.0.0...5.1.0) |
| `5.0.0` | Septiembre 2022      | [link](https://github.com/socketio/socket.io-redis-emitter/releases/tag/5.0.1) | [`4.1.1...5.0.0`](https://github.com/socketio/socket.io-redis-emitter/compare/4.1.1...5.0.0) |
| `4.1.1` | Enero 2022           | [link](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.1.1) | [`4.1.0...4.1.1`](https://github.com/socketio/socket.io-redis-emitter/compare/4.1.0...4.1.1) |
| `4.1.0` | Mayo 2021            | [link](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.1.0) | [`4.0.0...4.1.0`](https://github.com/socketio/socket.io-redis-emitter/compare/4.0.0...4.1.0) |
| `4.0.0` | Marzo 2021           | [link](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.0.0) | [`3.2.0...4.0.0`](https://github.com/socketio/socket.io-redis-emitter/compare/3.2.0...4.0.0) |

[Changelog completo](https://github.com/socketio/socket.io-redis-emitter/blob/main/CHANGELOG.md)
