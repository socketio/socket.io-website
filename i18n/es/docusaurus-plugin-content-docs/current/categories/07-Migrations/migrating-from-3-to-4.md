---
title: Migrando de 3.x a 4.0
sidebar_position: 2
slug: /migrating-from-3-x-to-4-0/
toc_max_heading_level: 4
---

La versión 4.0.0 añade muchas características nuevas, que se detallan [abajo](#nuevas-características), pero también contiene algunos cambios incompatibles en la API (de ahí el salto de versión mayor).

Por favor ten en cuenta que estos cambios incompatibles solo impactan la API en el lado del servidor. El protocolo Socket.IO en sí no fue actualizado, así que un cliente v3 **podrá** conectarse a un servidor v4 y viceversa. Además, el modo de compatibilidad ([`allowEIO3: true`](../../server-options.md#alloweio3)) todavía está disponible entre un cliente Socket.IO v2 y un servidor Socket.IO v4.

Aquí está la lista completa de cambios:

- [Cambios incompatibles](#cambios-incompatibles)
  - [`io.to()` ahora es inmutable](#ioto-ahora-es-inmutable)
  - [Opción `wsEngine`](#opción-wsengine)
- [Configuración](#configuración)
  - [Asegurar compatibilidad con clientes Swift v15](#asegurar-compatibilidad-con-clientes-swift-v15)
  - [El valor por defecto de `pingTimeout` fue aumentado](#el-valor-por-defecto-de-pingtimeout-fue-aumentado)
- [Nuevas características](#nuevas-características)
  - [Permitir excluir salas específicas al hacer broadcast](#permitir-excluir-salas-específicas-al-hacer-broadcast)
  - [Permitir pasar un array a `io.to()`](#permitir-pasar-un-array-a-ioto)
  - [Métodos utilitarios adicionales](#métodos-utilitarios-adicionales)
  - [Eventos tipados](#eventos-tipados)
  - [Opción `autoUnref`](#opción-autounref)
- [Problemas conocidos de migración](#problemas-conocidos-de-migración)

### Cambios incompatibles

#### `io.to()` ahora es inmutable

Anteriormente, hacer broadcast a una sala dada (llamando `io.to()`) mutaba la instancia io, lo cual podía llevar a comportamientos sorprendentes, como:

```js
io.to("room1");
io.to("room2").emit(/* ... */); // también enviado a room1

// o con async/await
io.to("room3").emit("details", await fetchDetails()); // comportamiento aleatorio: quizás en room3, quizás a todos los clientes
```

Llamar `io.to()` (o cualquier otro modificador de broadcast) ahora devolverá una instancia inmutable.

Ejemplos:

```js
const operator1 = io.to("room1");
const operator2 = operator1.to("room2");
const operator3 = socket.broadcast;
const operator4 = socket.to("room3").to("room4");

operator1.emit(/* ... */); // solo a clientes en "room1"
operator2.emit(/* ... */); // a clientes en "room1" o en "room2"
operator3.emit(/* ... */); // a todos los clientes excepto el emisor
operator4.emit(/* ... */); // a clientes en "room3" o en "room4" excepto el emisor
```

#### Opción `wsEngine`

El formato de la opción [`wsEngine`](../../server-options.md#wsengine) fue actualizado para deshacerse del siguiente error:

`Critical dependency: the request of a dependency is an expression`

al empaquetar el servidor con webpack.

Antes:

```js
const io = require("socket.io")(httpServer, {
  wsEngine: "eiows"
});
```

Después:

```js
const io = require("socket.io")(httpServer, {
  wsEngine: require("eiows").Server
});
```

### Configuración

#### Asegurar compatibilidad con clientes Swift v15

Antes de la versión 16.0.0, el cliente Swift no incluía el parámetro de consulta `EIO` en las solicitudes HTTP, y el servidor Socket.IO v3 infería `EIO=4` por defecto.

Por eso un cliente Swift v15 no podía conectarse al servidor, incluso cuando el modo de compatibilidad estaba habilitado ([`allowEIO3: true`](../../server-options.md#alloweio3)), a menos que especificaras explícitamente el parámetro de consulta:

```swift
let manager = SocketManager(socketURL: URL(string: "http://localhost:8080")!, config: [
  .log(true),
  .connectParams(["EIO": "3"])
])
let socket = manager.defaultSocket
```

El servidor Socket.IO v4 ahora inferirá `EIO=3` si el parámetro de consulta `EIO` no está incluido.

#### El valor por defecto de `pingTimeout` fue aumentado

El valor por defecto de [`pingTimeout`](../../server-options.md#pingtimeout) (usado en el [mecanismo de heartbeat](../01-Documentation/how-it-works.md#disconnection-detection)) fue actualizado de 60000 a 5000 en `socket.io@2.1.0` (marzo 2018).

El razonamiento en ese momento:

Algunos usuarios experimentaban largos retrasos entre la desconexión en el lado del servidor y en el lado del cliente. El evento "disconnect" tardaba mucho en dispararse en el navegador, probablemente debido a un temporizador retrasado. De ahí el cambio.

Dicho esto, el valor actual (5s) causaba desconexiones inesperadas cuando se enviaba una carga útil grande sobre una red lenta, porque impedía que los paquetes ping-pong se intercambiaran entre el cliente y el servidor. Esto también puede suceder cuando una tarea síncrona bloquea el servidor por más de 5 segundos.

El nuevo valor (20s) parece ser un buen equilibrio entre detección rápida de desconexión y tolerancia a varios retrasos.

### Nuevas características

#### Permitir excluir salas específicas al hacer broadcast

Gracias al increíble trabajo de [Sebastiaan Marynissen](https://github.com/sebamarynissen), ahora puedes excluir una sala específica al hacer broadcast:

```js
io.except("room1").emit(/* ... */); // a todos los clientes excepto los de "room1"
io.to("room2").except("room3").emit(/* ... */); // a todos los clientes en "room2" excepto los de "room3"

socket.broadcast.except("room1").emit(/* ... */); // a todos los clientes excepto los de "room1" y el emisor
socket.except("room1").emit(/* ... */); // igual que arriba
socket.to("room4").except("room5").emit(/* ... */); // a todos los clientes en "room4" excepto los de "room5" y el emisor
```

#### Permitir pasar un array a `io.to()`

El método `to()` ahora acepta un array de salas.

Antes:

```js
const rooms = ["room1", "room2", "room3"];
for (const room of rooms) {
  io.to(room);
}
// broadcast a clientes en "room1", "room2" o "room3"
// ¡¡¡ADVERTENCIA!!! esto ya no funciona en v4, ver el cambio incompatible arriba
io.emit(/* ... */);
```

Después:

```js
io.to(["room1", "room2", "room3"]).emit(/* ... */);

socket.to(["room1", "room2", "room3"]).emit(/* ... */);
```

#### Métodos utilitarios adicionales

Se añadieron algunos métodos (muy esperados):

- `socketsJoin`: hace que las instancias de socket coincidentes se unan a las salas especificadas

```js
// hacer que todas las instancias de Socket se unan a la sala "room1"
io.socketsJoin("room1");

// hacer que todas las instancias de Socket del namespace "admin" en la sala "room1" se unan a la sala "room2"
io.of("/admin").in("room1").socketsJoin("room2");
```

- `socketsLeave`: hace que las instancias de socket coincidentes abandonen las salas especificadas

```js
// hacer que todas las instancias de Socket abandonen la sala "room1"
io.socketsLeave("room1");

// hacer que todas las instancias de Socket del namespace "admin" en la sala "room1" abandonen la sala "room2"
io.of("/admin").in("room1").socketsLeave("room2");
```

- `disconnectSockets`: hace que las instancias de socket coincidentes se desconecten

```js
// hacer que todas las instancias de Socket se desconecten
io.disconnectSockets();

// hacer que todas las instancias de Socket del namespace "admin" en la sala "room1" se desconecten
io.of("/admin").in("room1").disconnectSockets();

// esto también funciona con un solo ID de socket
io.of("/admin").in(theSocketId).disconnectSockets();
```

- `fetchSockets`: devuelve las instancias de socket coincidentes

```js
// devolver todas las instancias de Socket del namespace principal
const sockets = await io.fetchSockets();

// devolver todas las instancias de Socket del namespace "admin" en la sala "room1"
const sockets = await io.of("/admin").in("room1").fetchSockets();

// esto también funciona con un solo ID de socket
const sockets = await io.in(theSocketId).fetchSockets();
```

La variable `sockets` en el ejemplo anterior es un array de objetos que exponen un subconjunto de la clase Socket usual:

```js
for (const socket of sockets) {
  console.log(socket.id);
  console.log(socket.handshake);
  console.log(socket.rooms);
  socket.emit(/* ... */);
  socket.join(/* ... */);
  socket.leave(/* ... */);
  socket.disconnect(/* ... */);
}
```

Esos métodos comparten la misma semántica que el broadcasting, y se aplican los mismos filtros:

```js
io.of("/admin").in("room1").except("room2").local.disconnectSockets();
```

Lo cual hace que todas las instancias de Socket del namespace "admin"

- en la sala "room1" (`in("room1")` o `to("room1")`)
- excepto las de "room2" (`except("room2")`)
- y solo en el servidor Socket.IO actual (`local`)

se desconecten.

#### Eventos tipados

Gracias al increíble trabajo de [Maxime Kjaer](https://github.com/MaximeKjaer), los usuarios de TypeScript ahora pueden tipar los eventos enviados entre el cliente y el servidor.

Primero, declaras la firma de cada evento:

```ts
interface ClientToServerEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: number[]) => void;
}

interface ServerToClientEvents {
  withAck: (d: string, cb: (e: number) => void) => void;
}
```

Y ahora puedes usarlos en el lado del cliente:

```ts
import { io, Socket } from "socket.io-client";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

socket.emit("noArg");

socket.emit("basicEmit", 1, "2", [3]);

socket.on("withAck", (d, cb) => {
    cb(4);
});
```

Tu IDE ahora debería inferir correctamente el tipo de cada argumento:

De manera similar en el lado del servidor (los `ServerToClientEvents` y `ClientToServerEvents` están invertidos):

```ts
import { Server } from "socket.io";

const io = new Server<ClientToServerEvents, ServerToClientEvents>(3000);

io.on("connection", (socket) => {
    socket.on("noArg", () => {
      // ...
    });

    socket.on("basicEmit", (a, b, c) => {
      // ...
    });

    socket.emit("withAck", "42", (e) => {
        console.log(e);
    });
});
```

Por defecto, los eventos no están tipados y los argumentos se inferirán como `any`.

#### Opción `autoUnref`

Y finalmente, gracias al increíble trabajo de [KC Erb](https://github.com/KCErb), se añadió la opción `autoUnref`.

Con `autoUnref` establecido en true (por defecto: false), el cliente Socket.IO permitirá que el programa termine si no hay otro temporizador/socket TCP activo en el sistema de eventos (incluso si el cliente está conectado):

```js
const socket = io({
  autoUnref: true
});
```

Nota: esta opción solo aplica a clientes Node.js.

### Problemas conocidos de migración

- `cannot get emit of undefined`

La siguiente expresión:

```js
socket.to("room1").broadcast.emit(/* ... */);
```

funcionaba en Socket.IO v3 pero ahora se considera inválida, ya que la bandera `broadcast` es inútil porque el método `to("room1")` ya pone la instancia de Socket en modo broadcasting.

```js
// VÁLIDO
socket.broadcast.emit(/* ... */); // a todos los clientes excepto el emisor
socket.to("room1").emit(/* ... */); // a clientes en "room1" excepto el emisor

// VÁLIDO (pero bandera 'broadcast' inútil)
socket.broadcast.to("room1").emit(/* ... */);

// INVÁLIDO
socket.to("room1").broadcast.emit(/* ... */);
```
