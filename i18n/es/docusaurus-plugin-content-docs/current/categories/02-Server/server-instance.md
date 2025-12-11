---
title: La instancia del Servidor
sidebar_position: 3
slug: /server-instance/
---

La instancia del Servidor (a menudo llamada `io` en los ejemplos de código) tiene algunos atributos que pueden ser útiles en tu aplicación.

También hereda todos los métodos del [namespace principal](../06-Advanced/namespaces.md#main-namespace), como [`namespace.use()`](../../server-api.md#namespaceusefn) (ver [aquí](middlewares.md)) o [`namespace.allSockets()`](../../server-api.md#namespaceallsockets).

## Server#engine

Una referencia al servidor Engine.IO subyacente.

Puede usarse para obtener el número de clientes conectados actualmente:

```js
const count = io.engine.clientsCount;
// puede o no ser similar al conteo de instancias Socket en el namespace principal, dependiendo de tu uso
const count2 = io.of("/").sockets.size;
```

O para generar un ID de sesión personalizado (el parámetro de consulta `sid`):

```js
const uuid = require("uuid");

io.engine.generateId = (req) => {
  return uuid.v4(); // debe ser único en todos los servidores Socket.IO
}
```

A partir de `socket.io@4.1.0`, el servidor Engine.IO emite tres eventos especiales:

- `initial_headers`: se emitirá justo antes de escribir los encabezados de respuesta de la primera solicitud HTTP de la sesión (el handshake), permitiéndote personalizarlos.

```js
io.engine.on("initial_headers", (headers, req) => {
  headers["test"] = "123";
  headers["set-cookie"] = "mycookie=456";
});
```

- `headers`: se emitirá justo antes de escribir los encabezados de respuesta de cada solicitud HTTP de la sesión (incluyendo la actualización a WebSocket), permitiéndote personalizarlos.

```js
io.engine.on("headers", (headers, req) => {
  headers["test"] = "789";
});
```

- `connection_error`: se emitirá cuando una conexión se cierra anormalmente

```js
io.engine.on("connection_error", (err) => {
  console.log(err.req);      // el objeto de solicitud
  console.log(err.code);     // el código de error, por ejemplo 1
  console.log(err.message);  // el mensaje de error, por ejemplo "Session ID unknown"
  console.log(err.context);  // algún contexto adicional del error
});
```

Aquí está la lista de posibles códigos de error:

| Código |            Mensaje             |
|:------:|:------------------------------:|
|   0    |      "Transport unknown"       |
|   1    |      "Session ID unknown"      |
|   2    |     "Bad handshake method"     |
|   3    |         "Bad request"          |
|   4    |          "Forbidden"           |
|   5    | "Unsupported protocol version" |

## Métodos de utilidad

Se añadieron algunos métodos de utilidad en Socket.IO v4.0.0 para gestionar las instancias de Socket y sus salas:

- [`socketsJoin`](#socketsjoin): hace que las instancias de socket coincidentes se unan a las salas especificadas
- [`socketsLeave`](#socketsleave): hace que las instancias de socket coincidentes abandonen las salas especificadas
- [`disconnectSockets`](#disconnectsockets): hace que las instancias de socket coincidentes se desconecten
- [`fetchSockets`](#fetchsockets): devuelve las instancias de socket coincidentes

El método [`serverSideEmit`](#serversideemit) fue añadido en Socket.IO v4.1.0.

Esos métodos comparten la misma semántica que broadcasting, y se aplican los mismos filtros:

```js
io.of("/admin").in("room1").except("room2").local.disconnectSockets();
```

Lo cual hace que todas las instancias de Socket del namespace "admin"

- en la sala "room1" (`in("room1")` o `to("room1")`)
- excepto las que están en "room2" (`except("room2")`)
- y solo en el servidor Socket.IO actual (`local`)

se desconecten.

Por favor nota que también son compatibles con el adaptador Redis (a partir de `socket.io-redis@6.1.0`), lo que significa que funcionarán a través de servidores Socket.IO.

### `socketsJoin`

Este método hace que las instancias de Socket coincidentes se unan a las salas especificadas:

```js
// hacer que todas las instancias de Socket se unan a la sala "room1"
io.socketsJoin("room1");

// hacer que todas las instancias de Socket en la sala "room1" se unan a las salas "room2" y "room3"
io.in("room1").socketsJoin(["room2", "room3"]);

// hacer que todas las instancias de Socket en la sala "room1" del namespace "admin" se unan a la sala "room2"
io.of("/admin").in("room1").socketsJoin("room2");

// esto también funciona con un solo ID de socket
io.in(theSocketId).socketsJoin("room1");
```

### `socketsLeave`

Este método hace que las instancias de Socket coincidentes abandonen las salas especificadas:

```js
// hacer que todas las instancias de Socket abandonen la sala "room1"
io.socketsLeave("room1");

// hacer que todas las instancias de Socket en la sala "room1" abandonen las salas "room2" y "room3"
io.in("room1").socketsLeave(["room2", "room3"]);

// hacer que todas las instancias de Socket en la sala "room1" del namespace "admin" abandonen la sala "room2"
io.of("/admin").in("room1").socketsLeave("room2");

// esto también funciona con un solo ID de socket
io.in(theSocketId).socketsLeave("room1");
```

### `disconnectSockets`

Este método hace que las instancias de Socket coincidentes se desconecten:

```js
// hacer que todas las instancias de Socket se desconecten
io.disconnectSockets();

// hacer que todas las instancias de Socket en la sala "room1" se desconecten (y descartar la conexión de bajo nivel)
io.in("room1").disconnectSockets(true);

// hacer que todas las instancias de Socket en la sala "room1" del namespace "admin" se desconecten
io.of("/admin").in("room1").disconnectSockets();

// esto también funciona con un solo ID de socket
io.of("/admin").in(theSocketId).disconnectSockets();
```

### `fetchSockets`

Este método devuelve las instancias de Socket coincidentes:

```js
// devolver todas las instancias de Socket del namespace principal
const sockets = await io.fetchSockets();

// devolver todas las instancias de Socket en la sala "room1" del namespace principal
const sockets = await io.in("room1").fetchSockets();

// devolver todas las instancias de Socket en la sala "room1" del namespace "admin"
const sockets = await io.of("/admin").in("room1").fetchSockets();

// esto también funciona con un solo ID de socket
const sockets = await io.in(theSocketId).fetchSockets();
```

La variable `sockets` en el ejemplo anterior es un array de objetos que exponen un subconjunto de la clase Socket habitual:

```js
for (const socket of sockets) {
  console.log(socket.id);
  console.log(socket.handshake);
  console.log(socket.rooms);
  console.log(socket.data);
  socket.emit(/* ... */);
  socket.join(/* ... */);
  socket.leave(/* ... */);
  socket.disconnect(/* ... */);
}
```

El atributo `data` es un objeto arbitrario que puede usarse para compartir información entre servidores Socket.IO:

```js
// servidor A
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

// servidor B
const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

### `serverSideEmit`

Este método permite emitir eventos a los otros servidores Socket.IO del clúster, en una [configuración de múltiples servidores](using-multiple-nodes.md).

Sintaxis:

```js
io.serverSideEmit("hello", "world");
```

Y en el lado receptor:

```js
io.on("hello", (arg1) => {
  console.log(arg1); // imprime "world"
});
```

Las confirmaciones también son soportadas:

```js
// servidor A
io.serverSideEmit("ping", (err, responses) => {
  console.log(responses[0]); // imprime "pong"
});

// servidor B
io.on("ping", (cb) => {
  cb("pong");
});
```

Notas:

- las cadenas `connection`, `connect` y `new_namespace` están reservadas y no pueden usarse en tu aplicación.

- puedes enviar cualquier número de argumentos, pero las estructuras binarias actualmente no son soportadas (el array de argumentos será `JSON.stringify`)

Ejemplo:

```js
io.serverSideEmit("hello", "world", 1, "2", { 3: "4" });
```

- el callback de confirmación podría ser llamado con un error, si los otros servidores Socket.IO no responden después de un retraso dado

```js
io.serverSideEmit("ping", (err, responses) => {
  if (err) {
    // al menos un servidor Socket.IO no ha respondido
    // el array 'responses' contiene todas las respuestas ya recibidas sin embargo
  } else {
    // ¡éxito! el array 'responses' contiene un objeto por cada otro servidor Socket.IO en el clúster
  }
});
```


## Eventos

La instancia del Servidor emite un solo evento (bueno, técnicamente dos, pero `connect` es un alias de `connection`):

- [`connection`](#connection)

### `connection`

Este evento se dispara ante una nueva conexión. El primer argumento es una [instancia de Socket](server-socket-instance.md).

```js
io.on("connection", (socket) => {
  // ...
});
```

## API completa

La API completa expuesta por la instancia del Servidor se puede encontrar [aquí](../../server-api.md#server).
