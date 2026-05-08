---
title: Adaptador
sidebar_label: Introducción
sidebar_position: 1
slug: /adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Un Adaptador es un componente del lado del servidor que es responsable de transmitir eventos a todos o un subconjunto de clientes.

Al escalar a múltiples servidores Socket.IO, necesitarás reemplazar el adaptador en memoria predeterminado por otra implementación, para que los eventos se enruten correctamente a todos los clientes.

Aquí está la lista de adaptadores que son mantenidos por nuestro equipo:

- el [adaptador Redis](adapter-redis.md)
- el [adaptador Redis Streams](adapter-redis-streams.md)
- el [adaptador MongoDB](adapter-mongo.md)
- el [adaptador Postgres](adapter-postgres.md)
- el [adaptador Cluster](adapter-cluster.md)
- el [adaptador Google Cloud Pub/Sub](adapter-gcp-pubsub.md)
- el [adaptador AWS SQS](adapter-aws-sqs.md)
- el [adaptador Azure Service Bus](adapter-azure-service-bus.md)

También hay varias otras opciones que son mantenidas por la (¡increíble!) comunidad:

- [AMQP](https://github.com/sensibill/socket.io-amqp) (ej. RabbitMQ)
- [NATS](https://github.com/MickL/socket.io-nats-adapter)
- [NATS](https://github.com/distrue/socket.io-nats-adapter)

Por favor nota que habilitar sesiones sticky sigue siendo necesario al usar múltiples servidores Socket.IO y HTTP long-polling. Más información [aquí](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

## API

Puedes acceder a la instancia del adaptador con:

```js
// namespace principal
const mainAdapter = io.of("/").adapter; // ¡ADVERTENCIA! io.adapter() no funcionará
// namespace personalizado
const adminAdapter = io.of("/admin").adapter;
```

A partir de `socket.io@3.1.0`, cada instancia de Adaptador emite los siguientes eventos:

- `create-room` (argumento: room)
- `delete-room` (argumento: room)
- `join-room` (argumento: room, id)
- `leave-room` (argumento: room, id)

Ejemplo:

```js
io.of("/").adapter.on("create-room", (room) => {
  console.log(`la sala ${room} fue creada`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`el socket ${id} se ha unido a la sala ${room}`);
});
```

## Emitter

La mayoría de las implementaciones de adaptadores vienen con su paquete emitter asociado, que permite comunicarse con el grupo de servidores Socket.IO desde otro proceso Node.js.

<ThemedImage
  alt="Diagrama del Emitter"
  sources={{
    light: useBaseUrl('/images/emitter.png'),
    dark: useBaseUrl('/images/emitter-dark.png'),
  }}
/>

Esto puede ser útil por ejemplo en una configuración de microservicios, donde todos los clientes se conectan al microservicio M1, mientras que el microservicio M2 usa el emitter para transmitir paquetes (comunicación unidireccional).

## Hoja de referencia del Emitter

```js
// a todos los clientes
emitter.emit(/* ... */);

// a todos los clientes en "room1"
emitter.to("room1").emit(/* ... */);

// a todos los clientes en "room1" excepto aquellos en "room2"
emitter.to("room1").except("room2").emit(/* ... */);

const adminEmitter = emitter.of("/admin");

// a todos los clientes en el namespace "admin"
adminEmitter.emit(/* ... */);

// a todos los clientes en el namespace "admin" y en la sala "room1"
adminEmitter.to("room1").emit(/* ... */);
```

El emitter también soporta los métodos de utilidad que fueron agregados en `socket.io@4.0.0`:

- `socketsJoin()`

```js
// hacer que todas las instancias de Socket se unan a la sala "room1"
emitter.socketsJoin("room1");

// hacer que todas las instancias de Socket del namespace "admin" en la sala "room1" se unan a la sala "room2"
emitter.of("/admin").in("room1").socketsJoin("room2");
```

- `socketsLeave()`

```js
// hacer que todas las instancias de Socket abandonen la sala "room1"
emitter.socketsLeave("room1");

// hacer que todas las instancias de Socket en la sala "room1" abandonen las salas "room2" y "room3"
emitter.in("room1").socketsLeave(["room2", "room3"]);

// hacer que todas las instancias de Socket en la sala "room1" del namespace "admin" abandonen la sala "room2"
emitter.of("/admin").in("room1").socketsLeave("room2");
```

- `disconnectSockets()`

```js
// hacer que todas las instancias de Socket se desconecten
emitter.disconnectSockets();

// hacer que todas las instancias de Socket en la sala "room1" se desconecten (y descartar la conexión de bajo nivel)
emitter.in("room1").disconnectSockets(true);

// hacer que todas las instancias de Socket en la sala "room1" del namespace "admin" se desconecten
emitter.of("/admin").in("room1").disconnectSockets();

// esto también funciona con un solo ID de socket
emitter.of("/admin").in(theSocketId).disconnectSockets();
```

- `serverSideEmit()`

```js
// emitir un evento a todos los servidores Socket.IO del clúster
emitter.serverSideEmit("hello", "world");

// servidor Socket.IO (lado del servidor)
io.on("hello", (arg) => {
  console.log(arg); // imprime "world"
});
```
