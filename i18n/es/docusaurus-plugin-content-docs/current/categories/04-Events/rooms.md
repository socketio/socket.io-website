---
title: Salas
sidebar_position: 4
slug: /rooms/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Una *sala* es un canal arbitrario al que los sockets pueden `unirse` y `abandonar`. Se puede usar para transmitir eventos a un subconjunto de clientes:

<ThemedImage
  alt="Transmitiendo a todos los clientes en una sala"
  sources={{
    light: useBaseUrl('/images/rooms.png'),
    dark: useBaseUrl('/images/rooms-dark.png'),
  }}
/>

:::info

Por favor nota que las salas son un concepto **solo del servidor** (es decir, el cliente no tiene acceso a la lista de salas a las que se ha unido).

:::

## Unirse y abandonar

Puedes llamar a `join` para suscribir el socket a un canal dado:

```js
io.on("connection", (socket) => {
  socket.join("some room");
});
```

Y luego simplemente usa `to` o `in` (son lo mismo) al transmitir o emitir:

```js
io.to("some room").emit("some event");
```

O excluye una sala:

```js
io.except("some room").emit("some event");
```

También puedes emitir a varias salas al mismo tiempo:

```js
io.to("room1").to("room2").to("room3").emit("some event");
```

En ese caso, se realiza una <a href="https://es.wikipedia.org/wiki/Uni%C3%B3n_de_conjuntos">unión</a>: cada socket que esté al menos en una de las salas recibirá el evento **una vez** (incluso si el socket está en dos o más salas).

También puedes transmitir a una sala desde un socket dado:

```js
io.on("connection", (socket) => {
  socket.to("some room").emit("some event");
});
```

En ese caso, cada socket en la sala **excluyendo** al emisor recibirá el evento.

<ThemedImage
  alt="Transmitiendo a todos los clientes en una sala excepto el emisor"
  sources={{
    light: useBaseUrl('/images/rooms2.png'),
    dark: useBaseUrl('/images/rooms2-dark.png'),
  }}
/>

Para abandonar un canal llamas a `leave` de la misma manera que `join`.

## Casos de uso de ejemplo

- transmitir datos a cada dispositivo / pestaña de un usuario dado

```js
function computeUserIdFromHeaders(headers) {
  // a implementar
}

io.on("connection", async (socket) => {
  const userId = await computeUserIdFromHeaders(socket.handshake.headers);

  socket.join(userId);

  // y luego más tarde
  io.to(userId).emit("hi");
});
```

- enviar notificaciones sobre una entidad dada

```js
io.on("connection", async (socket) => {
  const projects = await fetchProjects(socket);

  projects.forEach(project => socket.join("project:" + project.id));

  // y luego más tarde
  io.to("project:4321").emit("project updated");
});
```

## Desconexión

Al desconectarse, los sockets `abandonan` todos los canales de los que formaban parte automáticamente, y no se necesita ninguna limpieza especial de tu parte.

Puedes obtener las salas en las que estaba el Socket escuchando el evento `disconnecting`:

```js
io.on("connection", socket => {
  socket.on("disconnecting", () => {
    console.log(socket.rooms); // el Set contiene al menos el ID del socket
  });

  socket.on("disconnect", () => {
    // socket.rooms.size === 0
  });
});
```

## Con múltiples servidores Socket.IO

Al igual que la [transmisión global](broadcasting-events.md#with-multiple-socketio-servers), la transmisión a salas también funciona con múltiples servidores Socket.IO.

Solo necesitas reemplazar el [Adaptador](../08-Miscellaneous/glossary.md#adapter) predeterminado por el Adaptador Redis. Más información al respecto [aquí](../05-Adapters/adapter-redis.md).

<ThemedImage
  alt="Transmitiendo a todos los clientes en una sala con Redis"
  sources={{
    light: useBaseUrl('/images/rooms-redis.png'),
    dark: useBaseUrl('/images/rooms-redis-dark.png'),
  }}
/>

## Detalles de implementación

La característica de "sala" es implementada por lo que llamamos un Adaptador. Este Adaptador es un componente del lado del servidor que es responsable de:

- almacenar las relaciones entre las instancias de Socket y las salas
- transmitir eventos a todos (o un subconjunto de) clientes

Puedes encontrar el código del adaptador predeterminado en memoria [aquí](https://github.com/socketio/socket.io-adapter).

Básicamente, consiste en dos [Maps de ES6](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Map):

- `sids`: `Map<SocketId, Set<Room>>`
- `rooms`: `Map<Room, Set<SocketId>>`

Llamar a `socket.join("the-room")` resultará en:

- en el Map `sids`, agregar "the-room" al Set identificado por el ID del socket
- en el Map `rooms`, agregar el ID del socket en el Set identificado por el string "the-room"

Esos dos maps se usan luego al transmitir:

- una transmisión a todos los sockets (`io.emit()`) recorre el Map `sids`, y envía el paquete a todos los sockets
- una transmisión a una sala dada (`io.to("room21").emit()`) recorre el Set en el Map `rooms`, y envía el paquete a todos los sockets coincidentes

Puedes acceder a esos objetos con:

```js
// namespace principal
const rooms = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

// namespace personalizado
const rooms = io.of("/my-namespace").adapter.rooms;
const sids = io.of("/my-namespace").adapter.sids;
```

Notas:

- esos objetos no están destinados a ser modificados directamente, siempre debes usar [`socket.join(...)`](../../server-api.md#socketjoinroom) y [`socket.leave(...)`](../../server-api.md#socketleaveroom) en su lugar.
- en una configuración [multi-servidor](../02-Server/using-multiple-nodes.md), los objetos `rooms` y `sids` no se comparten entre los servidores Socket.IO (una sala puede solo "existir" en un servidor y no en otro).

## Eventos de sala

A partir de `socket.io@3.1.0`, el Adaptador subyacente emitirá los siguientes eventos:

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
