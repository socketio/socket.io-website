---
title: Adaptador MongoDB
sidebar_position: 4
slug: /mongo-adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## Cómo funciona

El adaptador MongoDB se basa en los [Change Streams](https://docs.mongodb.com/manual/changeStreams/) de MongoDB (y por lo tanto requiere un replica set o un clúster sharded).

Cada paquete que se envía a múltiples clientes (ej. `io.to("room1").emit()` o `socket.broadcast.emit()`) es:

- enviado a todos los clientes coincidentes conectados al servidor actual
- insertado en una colección capped de MongoDB, y recibido por los otros servidores Socket.IO del clúster

<ThemedImage
  alt="Diagrama de cómo funciona el adaptador MongoDB"
  sources={{
    light: useBaseUrl('/images/mongo-adapter.png'),
    dark: useBaseUrl('/images/mongo-adapter-dark.png'),
  }}
/>

El código fuente de este adaptador se puede encontrar [aquí](https://github.com/socketio/socket.io-mongo-adapter).

## Características soportadas

| Característica                     | Versión de `socket.io`              | Soporte                                        |
|------------------------------------|-------------------------------------|------------------------------------------------|
| Gestión de sockets                 | `4.0.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Comunicación entre servidores      | `4.1.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Broadcast con acknowledgements     | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: SÍ (desde versión `0.2.0`)  |
| Recuperación del estado de conexión| [`4.6.0`](../../changelog/4.6.0.md) | :white_check_mark: SÍ (desde versión `0.3.0`)  |

## Instalación

```
npm install @socket.io/mongo-adapter mongodb
```

Para usuarios de TypeScript, también podrías necesitar `@types/mongodb`.

## Uso

La transmisión de paquetes dentro de un clúster Socket.IO se logra creando documentos MongoDB y usando un [change stream](https://docs.mongodb.com/manual/changeStreams/) en cada servidor Socket.IO.

Hay dos formas de limpiar los documentos en MongoDB:

- una [colección capped](https://www.mongodb.com/docs/manual/core/capped-collections/)
- un [índice TTL](https://www.mongodb.com/docs/manual/core/index-ttl/)

### Uso con una colección capped

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/mongo-adapter";
import { MongoClient } from "mongodb";

const DB = "mydb";
const COLLECTION = "socket.io-adapter-events";

const io = new Server();

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0");

await mongoClient.connect();

try {
  await mongoClient.db(DB).createCollection(COLLECTION, {
    capped: true,
    size: 1e6
  });
} catch (e) {
  // la colección ya existe
}
const mongoCollection = mongoClient.db(DB).collection(COLLECTION);

io.adapter(createAdapter(mongoCollection));
io.listen(3000);
```

### Uso con un índice TTL

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/mongo-adapter";
import { MongoClient } from "mongodb";

const DB = "mydb";
const COLLECTION = "socket.io-adapter-events";

const io = new Server();

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0");

await mongoClient.connect();

const mongoCollection = mongoClient.db(DB).collection(COLLECTION);

await mongoCollection.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600, background: true }
);

io.adapter(createAdapter(mongoCollection, {
  addCreatedAtField: true
}));

io.listen(3000);
```

## Opciones

| Nombre                | Descripción                                                                                   | Valor predeterminado | Agregado en |
|-----------------------|-----------------------------------------------------------------------------------------------|----------------------|-------------|
| `uid`                 | El ID de este nodo                                                                            | un id aleatorio      | `v0.1.0`    |
| `requestsTimeout`     | El timeout para solicitudes entre servidores como `fetchSockets()` o `serverSideEmit()` con ack | `5000`             | `v0.1.0`    |
| `heartbeatInterval`   | El número de ms entre dos heartbeats                                                          | `5000`               | `v0.1.0`    |
| `heartbeatTimeout`    | El número de ms sin heartbeat antes de considerar un nodo caído                               | `10000`              | `v0.1.0`    |
| `addCreatedAtField`   | Si agregar un campo `createdAt` a cada documento MongoDB                                      | `false`              | `v0.2.0`    |
| `changeStreamOptions` | Opciones a pasar al change stream de MongoDB                                                  | `{}`                 | `v0.4.0`    |

## Preguntas frecuentes

### ¿Todavía necesito habilitar sesiones sticky al usar el adaptador MongoDB?

Sí. No hacerlo resultará en respuestas HTTP 400 (estás llegando a un servidor que no conoce la sesión Socket.IO).

Más información se puede encontrar [aquí](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

### ¿Qué pasa cuando el clúster MongoDB está caído?

En caso de que la conexión al clúster MongoDB se corte, el comportamiento dependerá del valor de la opción `bufferMaxEntries` del cliente MongoDB:

- si su valor es `-1` (predeterminado), los paquetes se almacenarán en buffer hasta la reconexión.
- si su valor es `0`, los paquetes solo se enviarán a los clientes que están conectados al servidor actual.

Documentación: http://mongodb.github.io/node-mongodb-native/3.6/api/global.html#MongoClientOptions

## Últimas versiones

| Versión | Fecha de lanzamiento | Notas de lanzamiento                                                           | Diff                                                                                         |
|---------|----------------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `0.4.0` | Agosto 2025          | [link](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.4.0) | [`0.3.2...0.4.0`](https://github.com/socketio/socket.io-mongo-adapter/compare/0.3.2...0.4.0) |
| `0.3.2` | Enero 2024           | [link](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.3.2) | [`0.3.1...0.3.2`](https://github.com/socketio/socket.io-mongo-adapter/compare/0.3.1...0.3.2) |
| `0.3.1` | Enero 2024           | [link](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.3.1) | [`0.3.0...0.3.1`](https://github.com/socketio/socket.io-mongo-adapter/compare/0.3.0...0.3.1) |
| `0.3.0` | Febrero 2023         | [link](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.3.0) | [`0.2.1...0.3.0`](https://github.com/socketio/socket.io-mongo-adapter/compare/0.2.1...0.3.0) |

[Changelog completo](https://github.com/socketio/socket.io-mongo-adapter/blob/main/CHANGELOG.md)

## Emitter

El emitter MongoDB permite enviar paquetes a los clientes conectados desde otro proceso Node.js:

<ThemedImage
  alt="Diagrama de cómo funciona el adaptador MongoDB"
  sources={{
    light: useBaseUrl('/images/mongo-emitter.png'),
    dark: useBaseUrl('/images/mongo-emitter-dark.png'),
  }}
/>

### Instalación

```
npm install @socket.io/mongo-emitter mongodb
```

### Uso

```js
const { Emitter } = require("@socket.io/mongo-emitter");
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0");

const main = async () => {
  await mongoClient.connect();

  const mongoCollection = mongoClient.db("mydb").collection("socket.io-adapter-events");
  const emitter = new Emitter(mongoCollection);

  setInterval(() => {
    emitter.emit("ping", new Date());
  }, 1000);
}

main();
```

Por favor consulta la hoja de referencia [aquí](adapter.md#emitter-cheatsheet).
