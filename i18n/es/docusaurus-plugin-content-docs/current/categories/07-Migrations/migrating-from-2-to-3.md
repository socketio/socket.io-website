---
title: Migrando de 2.x a 3.0
sidebar_position: 1
slug: /migrating-from-2-x-to-3-0/
toc_max_heading_level: 4
---

Esta versión debería solucionar la mayoría de las inconsistencias de la biblioteca Socket.IO y proporcionar un comportamiento más intuitivo para los usuarios finales. Es el resultado de los comentarios de la comunidad a lo largo de los años. ¡Un gran agradecimiento a todos los involucrados!

**TL;DR:** ~~debido a varios cambios incompatibles, un cliente v2 no podrá conectarse a un servidor v3 (y viceversa)~~

Actualización: A partir de [Socket.IO 3.1.0](/blog/socket-io-3-1-0/), el servidor v3 ahora puede comunicarse con clientes v2. Más información [abajo](#cómo-actualizar-un-despliegue-en-producción-existente). Un cliente v3 todavía no puede conectarse a un servidor v2.

Para los detalles de bajo nivel, por favor consulte:

- [Protocolo Engine.IO v4](https://github.com/socketio/engine.io-protocol#difference-between-v3-and-v4)
- [Protocolo Socket.IO v5](https://github.com/socketio/socket.io-protocol#difference-between-v5-and-v4)

Aquí está la lista completa de cambios:

- [Configuración](#configuración)
  - [Valores predeterminados más sensatos](#valores-predeterminados-más-sensatos)
  - [Manejo de CORS](#manejo-de-cors)
  - [Ya no hay cookie por defecto](#ya-no-hay-cookie-por-defecto)
- [Cambios en la API](#cambios-en-la-api)
  - [io.set() ha sido eliminado](#ioset-ha-sido-eliminado)
  - [Ya no hay conexión implícita al namespace por defecto](#ya-no-hay-conexión-implícita-al-namespace-por-defecto)
  - [Namespace.connected ha sido renombrado a Namespace.sockets y ahora es un Map](#namespaceconnected-ha-sido-renombrado-a-namespacesockets-y-ahora-es-un-map)
  - [Socket.rooms ahora es un Set](#socketrooms-ahora-es-un-set)
  - [Socket.binary() ha sido eliminado](#socketbinary-ha-sido-eliminado)
  - [Socket.join() y Socket.leave() ahora son síncronos](#socketjoin-y-socketleave-ahora-son-síncronos)
  - [Socket.use() ha sido eliminado](#socketuse-ha-sido-eliminado)
  - [Un error de middleware ahora emitirá un objeto Error](#un-error-de-middleware-ahora-emitirá-un-objeto-error)
  - [Clara distinción entre la opción query del Manager y la opción query del Socket](#clara-distinción-entre-la-opción-query-del-manager-y-la-opción-query-del-socket)
  - [La instancia Socket ya no reenviará los eventos emitidos por su Manager](#la-instancia-socket-ya-no-reenviará-los-eventos-emitidos-por-su-manager)
  - [Namespace.clients() ha sido renombrado a Namespace.allSockets() y ahora devuelve una Promise](#namespaceclients-ha-sido-renombrado-a-namespaceallsockets-y-ahora-devuelve-una-promise)
  - [Bundles del cliente](#bundles-del-cliente)
  - [Ya no hay evento "pong" para recuperar la latencia](#ya-no-hay-evento-pong-para-recuperar-la-latencia)
  - [Sintaxis de módulos ES](#sintaxis-de-módulos-es)
  - [Las cadenas de `emit()` ya no son posibles](#las-cadenas-de-emit-ya-no-son-posibles)
  - [Los nombres de las salas ya no se convierten a string](#los-nombres-de-las-salas-ya-no-se-convierten-a-string)
- [Nuevas características](#nuevas-características)
  - [Listeners catch-all](#listeners-catch-all)
  - [Eventos volátiles (cliente)](#eventos-volátiles-cliente)
  - [Bundle oficial con el parser msgpack](#bundle-oficial-con-el-parser-msgpack)
- [Misceláneos](#misceláneos)
  - [El código fuente de Socket.IO ha sido reescrito en TypeScript](#el-código-fuente-de-socketio-ha-sido-reescrito-en-typescript)
  - [El soporte para IE8 y Node.js 8 ha sido oficialmente eliminado](#el-soporte-para-ie8-y-nodejs-8-ha-sido-oficialmente-eliminado)

- [Cómo actualizar un despliegue en producción existente](#cómo-actualizar-un-despliegue-en-producción-existente)
- [Problemas conocidos de migración](#problemas-conocidos-de-migración)

### Configuración

#### Valores predeterminados más sensatos

- el valor predeterminado de `maxHttpBufferSize` se redujo de `100MB` a `1MB`.
- la extensión WebSocket [permessage-deflate](https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression-19) ahora está deshabilitada por defecto
- ahora debes listar explícitamente los dominios permitidos (para CORS, ver [abajo](#manejo-de-cors))
- la opción `withCredentials` ahora es `false` por defecto en el lado del cliente

#### Manejo de CORS

En v2, el servidor Socket.IO añadía automáticamente las cabeceras necesarias para permitir [Cross-Origin Resource Sharing](https://developer.mozilla.org/es/docs/Web/HTTP/CORS) (CORS).

Este comportamiento, aunque conveniente, no era bueno en términos de seguridad, porque significaba que todos los dominios podían acceder a tu servidor Socket.IO, a menos que se especificara lo contrario con la opción `origins`.

Por eso, a partir de Socket.IO v3:

- CORS ahora está deshabilitado por defecto
- la opción `origins` (usada para proporcionar una lista de dominios autorizados) y la opción `handlePreflightRequest` (usada para editar las cabeceras `Access-Control-Allow-xxx`) son reemplazadas por la opción `cors`, que se reenviará al paquete [cors](https://www.npmjs.com/package/cors).

La lista completa de opciones se puede encontrar [aquí](https://github.com/expressjs/cors#configuration-options).

Antes:

```js
const io = require("socket.io")(httpServer, {
  origins: ["https://example.com"],

  // opcional, útil para cabeceras personalizadas
  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "https://example.com",
      "Access-Control-Allow-Methods": "GET,POST",
      "Access-Control-Allow-Headers": "my-custom-header",
      "Access-Control-Allow-Credentials": true
    });
    res.end();
  }
});
```

Después:

```js
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "https://example.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
```


#### Ya no hay cookie por defecto

En versiones anteriores, una cookie `io` se enviaba por defecto. Esta cookie se puede usar para habilitar sticky-session, que todavía es necesario cuando tienes varios servidores y HTTP long-polling habilitado (más información [aquí](../02-Server/using-multiple-nodes.md)).

Sin embargo, esta cookie no es necesaria en algunos casos (es decir, despliegue con un solo servidor, sticky-session basado en IP) por lo que ahora debe habilitarse explícitamente.

Antes:

```js
const io = require("socket.io")(httpServer, {
  cookieName: "io",
  cookieHttpOnly: false,
  cookiePath: "/custom"
});
```

Después:

```js
const io = require("socket.io")(httpServer, {
  cookie: {
    name: "test",
    httpOnly: false,
    path: "/custom"
  }
});
```

Todas las demás opciones (domain, maxAge, sameSite, ...) ahora son soportadas. Por favor consulte [aquí](https://github.com/jshttp/cookie/) para la lista completa de opciones.


### Cambios en la API

A continuación se listan los cambios que no son compatibles hacia atrás.

#### io.set() ha sido eliminado

Este método fue deprecado en la versión 1.0 y mantenido para compatibilidad hacia atrás. Ahora ha sido eliminado.

Fue reemplazado por middlewares.

Antes:

```js
io.set("authorization", (handshakeData, callback) => {
  // asegurarse de que los datos del handshake se vean bien
  callback(null, true); // primero el error, segundo el booleano "autorizado"
});
```

Después:

```js
io.use((socket, next) => {
  var handshakeData = socket.request;
  // asegurarse de que los datos del handshake se vean bien como antes
  // si hay error hacer esto:
    // next(new Error("no autorizado"));
  // sino solo llamar next
  next();
});
```

#### Ya no hay conexión implícita al namespace por defecto

Este cambio afecta a los usuarios de la funcionalidad de multiplexación (lo que llamamos Namespace en Socket.IO).

En versiones anteriores, un cliente siempre se conectaba al namespace por defecto (`/`), incluso si solicitaba acceso a otro namespace. Esto significaba que los middlewares registrados para el namespace por defecto se activaban, lo cual puede ser bastante sorprendente.

```js
// lado del cliente
const socket = io("/admin");

// lado del servidor
io.use((socket, next) => {
  // ya no se activa
});

io.on("connection", socket => {
  // ya no se activa
})

io.of("/admin").use((socket, next) => {
  // se activa
});
```

Además, ahora nos referiremos al namespace "principal" en lugar del namespace "por defecto".


#### Namespace.connected ha sido renombrado a Namespace.sockets y ahora es un Map

El objeto `connected` (usado para almacenar todos los Socket conectados al Namespace dado) podía usarse para recuperar un objeto Socket a partir de su id. Ahora es un [Map](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Map) de ES6.

Antes:

```js
// obtener un socket por ID en el namespace principal
const socket = io.of("/").connected[socketId];

// obtener un socket por ID en el namespace "admin"
const socket = io.of("/admin").connected[socketId];

// recorrer todos los sockets
const sockets = io.of("/").connected;
for (const id in sockets) {
  if (sockets.hasOwnProperty(id)) {
    const socket = sockets[id];
    // ...
  }
}

// obtener el número de sockets conectados
const count = Object.keys(io.of("/").connected).length;
```

Después:

```js
// obtener un socket por ID en el namespace principal
const socket = io.of("/").sockets.get(socketId);

// obtener un socket por ID en el namespace "admin"
const socket = io.of("/admin").sockets.get(socketId);

// recorrer todos los sockets
for (const [_, socket] of io.of("/").sockets) {
  // ...
}

// obtener el número de sockets conectados
const count = io.of("/").sockets.size;
```

#### Socket.rooms ahora es un Set

La propiedad `rooms` contiene la lista de salas en las que el Socket se encuentra actualmente. Era un objeto, ahora es un [Set](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Set) de ES6.

Antes:

```js
io.on("connection", (socket) => {

  console.log(Object.keys(socket.rooms)); // [ <socket.id> ]

  socket.join("room1");

  console.log(Object.keys(socket.rooms)); // [ <socket.id>, "room1" ]

});
```

Después:

```js
io.on("connection", (socket) => {

  console.log(socket.rooms); // Set { <socket.id> }

  socket.join("room1");

  console.log(socket.rooms); // Set { <socket.id>, "room1" }

});
```

#### Socket.binary() ha sido eliminado

El método `binary` podía usarse para indicar que un evento dado no contenía datos binarios (para omitir la búsqueda realizada por la biblioteca y mejorar el rendimiento en ciertas condiciones).

Fue reemplazado por la capacidad de proporcionar tu propio parser, que fue añadida en Socket.IO 2.0.

Antes:

```js
socket.binary(false).emit("hello", "sin binarios");
```

Después:

```js
const io = require("socket.io")(httpServer, {
  parser: myCustomParser
});
```

Por favor consulte [socket.io-msgpack-parser](https://github.com/socketio/socket.io-msgpack-parser) como ejemplo.


#### Socket.join() y Socket.leave() ahora son síncronos

La asincronicidad era necesaria para las primeras versiones del adaptador Redis, pero este ya no es el caso.

Para referencia, un Adapter es un objeto que almacena las relaciones entre Sockets y [Rooms](../04-Events/rooms.md). Hay dos adaptadores oficiales: el adaptador en memoria (integrado) y el [adaptador Redis](https://github.com/socketio/socket.io-redis) basado en el mecanismo [pub-sub](https://redis.io/topics/pubsub) de Redis.

Antes:

```js
socket.join("room1", () => {
 io.to("room1").emit("hello");
});

socket.leave("room2", () => {
  io.to("room2").emit("bye");
});
```

Después:

```js
socket.join("room1");
io.to("room1").emit("hello");

socket.leave("room2");
io.to("room2").emit("bye");
```

Nota: los adaptadores personalizados pueden devolver una Promise, así que el ejemplo anterior se convierte en:

```js
await socket.join("room1");
io.to("room1").emit("hello");
```


#### ~~Socket.use() ha sido eliminado~~

`socket.use()` podía usarse como un listener catch-all. Pero su API no era realmente intuitiva. Ha sido reemplazado por [socket.onAny()](#listeners-catch-all).

**ACTUALIZACIÓN**: el método `Socket.use()` fue restaurado en [`socket.io@3.0.5`](https://github.com/socketio/socket.io/releases/3.0.5).

Antes:

```js
socket.use((packet, next) => {
  console.log(packet.data);
  next();
});
```

Después:

```js
socket.onAny((event, ...args) => {
  console.log(event);
});
```


#### Un error de middleware ahora emitirá un objeto Error

El evento `error` ha sido renombrado a `connect_error` y el objeto emitido ahora es un Error real:

Antes:

```js
// lado del servidor
io.use((socket, next) => {
  next(new Error("no autorizado"));
});

// lado del cliente
socket.on("error", err => {
  console.log(err); // no autorizado
});

// o con un objeto
// lado del servidor
io.use((socket, next) => {
  const err = new Error("no autorizado");
  err.data = { content: "Por favor inténtelo más tarde" }; // detalles adicionales
  next(err);
});

// lado del cliente
socket.on("error", err => {
  console.log(err); // { content: "Por favor inténtelo más tarde" }
});
```

Después:

```js
// lado del servidor
io.use((socket, next) => {
  const err = new Error("no autorizado");
  err.data = { content: "Por favor inténtelo más tarde" }; // detalles adicionales
  next(err);
});

// lado del cliente
socket.on("connect_error", err => {
  console.log(err instanceof Error); // true
  console.log(err.message); // no autorizado
  console.log(err.data); // { content: "Por favor inténtelo más tarde" }
});
```


#### Clara distinción entre la opción query del Manager y la opción query del Socket

En versiones anteriores, la opción `query` se usaba en dos lugares distintos:

- en los parámetros de consulta de las solicitudes HTTP (`GET /socket.io/?EIO=3&abc=def`)
- en el paquete `CONNECT`

Tomemos el siguiente ejemplo:

```js
const socket = io({
  query: {
    token: "abc"
  }
});
```

Internamente, esto es lo que sucedía en el método `io()`:

```js
const { Manager } = require("socket.io-client");

// se crea un nuevo Manager (que gestionará la conexión de bajo nivel)
const manager = new Manager({
  query: { // enviado en los parámetros de consulta
    token: "abc"
  }
});

// y luego se crea una instancia de Socket para el namespace (aquí, el namespace principal, "/")
const socket = manager.socket("/", {
  query: { // enviado en el paquete CONNECT
    token: "abc"
  }
});
```

Este comportamiento podía llevar a comportamientos extraños, por ejemplo cuando el Manager se reutilizaba para otro namespace (multiplexación):

```js
// lado del cliente
const socket1 = io({
  query: {
    token: "abc"
  }
});

const socket2 = io("/my-namespace", {
  query: {
    token: "def"
  }
});

// lado del servidor
io.on("connection", (socket) => {
  console.log(socket.handshake.query.token); // abc (¡ok!)
});

io.of("/my-namespace").on("connection", (socket) => {
  console.log(socket.handshake.query.token); // abc (¿qué?)
});
```

Por eso la opción `query` de la instancia Socket ha sido renombrada a `auth` en Socket.IO v3:

```js
// objeto plano
const socket = io({
  auth: {
    token: "abc"
  }
});

// o con una función
const socket = io({
  auth: (cb) => {
    cb({
      token: "abc"
    });
  }
});

// lado del servidor
io.on("connection", (socket) => {
  console.log(socket.handshake.auth.token); // abc
});
```

Nota: la opción `query` del Manager todavía se puede usar para añadir un parámetro de consulta específico a las solicitudes HTTP.


#### La instancia Socket ya no reenviará los eventos emitidos por su Manager

En versiones anteriores, la instancia Socket emitía los eventos relacionados con el estado de la conexión subyacente. Esto ya no será el caso.

Todavía puedes acceder a esos eventos en la instancia Manager (la propiedad `io` del socket):

Antes:

```js
socket.on("reconnect_attempt", () => {});
```

Después:

```js
socket.io.on("reconnect_attempt", () => {});
```

Aquí está la lista actualizada de eventos emitidos por el Manager:

| Nombre | Descripción | Anteriormente (si era diferente) |
| ---- | ----------- | ------------------------- |
| open | (re)conexión exitosa | - |
| error | fallo de (re)conexión o error después de una conexión exitosa | connect_error |
| close | desconexión | - |
| ping | paquete ping | - |
| packet | paquete de datos | - |
| reconnect_attempt | intento de reconexión | reconnect_attempt & reconnecting | - |
| reconnect | reconexión exitosa | - |
| reconnect_error | fallo de reconexión | - |
| reconnect_failed | fallo de reconexión después de todos los intentos | - |

Aquí está la lista actualizada de eventos emitidos por el Socket:

| Nombre | Descripción | Anteriormente (si era diferente) |
| ---- | ----------- | ------------------------- |
| connect | conexión exitosa a un Namespace | - |
| connect_error | fallo de conexión | error |
| disconnect | desconexión | - |


Y finalmente, aquí está la lista actualizada de eventos reservados que no puedes usar en tu aplicación:

- `connect` (usado en el lado del cliente)
- `connect_error` (usado en el lado del cliente)
- `disconnect` (usado en ambos lados)
- `disconnecting` (usado en el lado del servidor)
- `newListener` y `removeListener` ([eventos reservados](https://nodejs.org/api/events.html#events_event_newlistener) del EventEmitter)

```js
socket.emit("connect_error"); // ahora lanzará un Error
```


#### Namespace.clients() ha sido renombrado a Namespace.allSockets() y ahora devuelve una Promise

Esta función devuelve la lista de IDs de socket que están conectados a este namespace.

Antes:

```js
// todos los sockets en el namespace por defecto
io.clients((error, clients) => {
  console.log(clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
});

// todos los sockets en el namespace "chat"
io.of("/chat").clients((error, clients) => {
  console.log(clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
});

// todos los sockets en el namespace "chat" y en la sala "general"
io.of("/chat").in("general").clients((error, clients) => {
  console.log(clients); // => [Anw2LatarvGVVXEIAAAD]
});
```

Después:

```js
// todos los sockets en el namespace por defecto
const ids = await io.allSockets();

// todos los sockets en el namespace "chat"
const ids = await io.of("/chat").allSockets();

// todos los sockets en el namespace "chat" y en la sala "general"
const ids = await io.of("/chat").in("general").allSockets();
```

Nota: esta función era (y todavía es) soportada por el adaptador Redis, lo que significa que devolverá la lista de IDs de socket a través de todos los servidores Socket.IO.

#### Bundles del cliente

Ahora hay 3 bundles distintos:

| Nombre              | Tamaño             | Descripción |
|:------------------|:-----------------|:------------|
| socket.io.js               | 34.7 kB gzip     | Versión sin minificar, con [debug](https://www.npmjs.com/package/debug)    |
| socket.io.min.js           | 14.7 kB min+gzip | Versión de producción, sin [debug](https://www.npmjs.com/package/debug) |
| socket.io.msgpack.min.js   | 15.3 kB min+gzip | Versión de producción, sin [debug](https://www.npmjs.com/package/debug) y con el [parser msgpack](https://github.com/socketio/socket.io-msgpack-parser)    |

Por defecto, todos ellos son servidos por el servidor, en `/socket.io/<nombre>`.

Antes:

```html
<!-- nota: este bundle en realidad estaba minificado pero incluía el paquete debug -->
<script src="/socket.io/socket.io.js"></script>
```

Después:

```html
<!-- durante el desarrollo -->
<script src="/socket.io/socket.io.js"></script>
<!-- para producción -->
<script src="/socket.io/socket.io.min.js"></script>
```

#### Ya no hay evento "pong" para recuperar la latencia

En Socket.IO v2, podías escuchar el evento `pong` en el lado del cliente, que incluía la duración del último viaje de ida y vuelta del health check.

Debido a la inversión del mecanismo de heartbeat (más información [aquí](/blog/engine-io-4-release/#heartbeat-mechanism-reversal)), este evento ha sido eliminado.

Antes:

```js
socket.on("pong", (latency) => {
  console.log(latency);
});
```

Después:

```js
// lado del servidor
io.on("connection", (socket) => {
  socket.on("ping", (cb) => {
    if (typeof cb === "function")
      cb();
  });
});

// lado del cliente
setInterval(() => {
  const start = Date.now();

  // volatile, así que el paquete será descartado si el socket no está conectado
  socket.volatile.emit("ping", () => {
    const latency = Date.now() - start;
    // ...
  });
}, 5000);
```

#### Sintaxis de módulos ES

La sintaxis de módulos ECMAScript ahora es similar a la de Typescript (ver [abajo](#el-código-fuente-de-socketio-ha-sido-reescrito-en-typescript)).

Antes (usando import por defecto):

```js
// lado del servidor
import Server from "socket.io";

const io = new Server(8080);

// lado del cliente
import io from 'socket.io-client';

const socket = io();
```

Después (con import nombrado):

```js
// lado del servidor
import { Server } from "socket.io";

const io = new Server(8080);

// lado del cliente
import { io } from 'socket.io-client';

const socket = io();
```

#### Las cadenas de `emit()` ya no son posibles

El método `emit()` ahora coincide con la firma del método [`EventEmitter.emit()`](https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_emit_eventname_args), y devuelve `true` en lugar del objeto actual.

Antes:

```js
socket.emit("event1").emit("event2");
```

Después:

```js
socket.emit("event1");
socket.emit("event2");
```

#### Los nombres de las salas ya no se convierten a string

Ahora usamos Maps y Sets internamente en lugar de objetos planos, por lo que los nombres de las salas ya no se convierten implícitamente a string.

Antes:

```js
// los tipos mixtos eran posibles
socket.join(42);
io.to("42").emit("hello");
// también funcionaba
socket.join("42");
io.to(42).emit("hello");
```

Después:

```js
// de una forma
socket.join("42");
io.to("42").emit("hello");
// o de otra
socket.join(42);
io.to(42).emit("hello");
```

### Nuevas características

Algunas de estas nuevas características pueden ser portadas a la rama `2.4.x`, dependiendo de los comentarios de los usuarios.


#### Listeners catch-all

Esta característica está inspirada en la biblioteca [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) (que no se usa directamente para no aumentar el tamaño del bundle del navegador).

Está disponible tanto para el lado del servidor como del cliente:

```js
// servidor
io.on("connection", (socket) => {
  socket.onAny((event, ...args) => {});
  socket.prependAny((event, ...args) => {});
  socket.offAny(); // eliminar todos los listeners
  socket.offAny(listener);
  const listeners = socket.listenersAny();
});

// cliente
const socket = io();
socket.onAny((event, ...args) => {});
socket.prependAny((event, ...args) => {});
socket.offAny(); // eliminar todos los listeners
socket.offAny(listener);
const listeners = socket.listenersAny();
```


#### Eventos volátiles (cliente)

Un evento volátil es un evento que se permite descartar si el transporte de bajo nivel aún no está listo (por ejemplo, cuando una solicitud HTTP POST ya está pendiente).

Esta característica ya estaba disponible en el lado del servidor. Puede ser útil también en el lado del cliente, por ejemplo cuando el socket no está conectado (por defecto, los paquetes se almacenan en búfer hasta la reconexión).

```js
socket.volatile.emit("evento volátil", "puede o no ser enviado");
```


#### Bundle oficial con el parser msgpack

Ahora se proporcionará un bundle con el [socket.io-msgpack-parser](https://github.com/socketio/socket.io-msgpack-parser) (ya sea en el CDN o servido por el servidor en `/socket.io/socket.io.msgpack.min.js`).

Pros:

- los eventos con contenido binario se envían como 1 frame WebSocket (en lugar de 2+ con el parser por defecto)
- las cargas útiles con muchos números deberían ser más pequeñas

Contras:

- sin soporte para IE9 (https://caniuse.com/mdn-javascript_builtins_arraybuffer)
- un tamaño de bundle ligeramente mayor

```js
// lado del servidor
const io = require("socket.io")(httpServer, {
  parser: require("socket.io-msgpack-parser")
});
```

No se necesita configuración adicional en el lado del cliente.


### Misceláneos

#### El código fuente de Socket.IO ha sido reescrito en TypeScript

Lo que significa que `npm i -D @types/socket.io` ya no debería ser necesario.

Servidor:

```ts
import { Server, Socket } from "socket.io";

const io = new Server(8080);

io.on("connection", (socket: Socket) => {
    console.log(`conectado ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`desconectado ${socket.id}`);
    });
});
```

Cliente:

```ts
import { io } from "socket.io-client";

const socket = io("/");

socket.on("connect", () => {
    console.log(`conectado ${socket.id}`);
});
```

JavaScript plano obviamente sigue siendo completamente soportado.


#### El soporte para IE8 y Node.js 8 ha sido oficialmente eliminado

IE8 ya no es testeable en la plataforma Sauce Labs, y requiere mucho esfuerzo para muy pocos usuarios (¿si acaso alguno?), así que estamos eliminando el soporte para él.

Además, Node.js 8 ahora está [EOL](https://github.com/nodejs/Release). ¡Por favor actualiza lo antes posible!


### Cómo actualizar un despliegue en producción existente

- primero, actualiza los servidores con `allowEIO3` establecido en `true` (añadido en `socket.io@3.1.0`)

```js
const io = require("socket.io")({
  allowEIO3: true // false por defecto
});
```

Nota: Si estás usando el adaptador Redis para [difundir paquetes entre nodos](../04-Events/broadcasting-events.md#con-múltiples-servidores-socketio), debes usar `socket.io-redis@5` con `socket.io@2` y `socket.io-redis@6` con `socket.io@3`. Por favor ten en cuenta que ambas versiones son compatibles, así que puedes actualizar cada servidor uno por uno (no se necesita un big bang).

- luego, actualiza los clientes

Este paso puede tomar algo de tiempo, ya que algunos clientes pueden todavía tener un cliente v2 en caché.

Puedes verificar la versión de la conexión con:

```js
io.on("connection", (socket) => {
  const version = socket.conn.protocol; // ya sea 3 o 4
});
```

Esto coincide con el valor del parámetro de consulta `EIO` en las solicitudes HTTP.

- y finalmente, una vez que cada cliente haya sido actualizado, establece `allowEIO3` en `false` (que es el valor por defecto)

```js
const io = require("socket.io")({
  allowEIO3: false
});
```

Con `allowEIO3` establecido en `false`, los clientes v2 ahora recibirán un error HTTP 400 (`Unsupported protocol version`) al conectarse.


### Problemas conocidos de migración

- `stream_1.pipeline is not a function`

```
TypeError: stream_1.pipeline is not a function
    at Function.sendFile (.../node_modules/socket.io/dist/index.js:249:26)
    at Server.serve (.../node_modules/socket.io/dist/index.js:225:16)
    at Server.srv.on (.../node_modules/socket.io/dist/index.js:186:22)
    at emitTwo (events.js:126:13)
    at Server.emit (events.js:214:7)
    at parserOnIncoming (_http_server.js:602:12)
    at HTTPParser.parserOnHeadersComplete (_http_common.js:116:23)
```

Este error probablemente se debe a tu versión de Node.js. El método [pipeline](https://nodejs.org/api/stream.html#stream_stream_pipeline_source_transforms_destination_callback) fue introducido en Node.js 10.0.0.


- `error TS2416: Property 'emit' in type 'Namespace' is not assignable to the same property in base type 'EventEmitter'.`

```
node_modules/socket.io/dist/namespace.d.ts(89,5): error TS2416: Property 'emit' in type 'Namespace' is not assignable to the same property in base type 'EventEmitter'.
  Type '(ev: string, ...args: any[]) => Namespace' is not assignable to type '(event: string | symbol, ...args: any[]) => boolean'.
    Type 'Namespace' is not assignable to type 'boolean'.
node_modules/socket.io/dist/socket.d.ts(84,5): error TS2416: Property 'emit' in type 'Socket' is not assignable to the same property in base type 'EventEmitter'.
  Type '(ev: string, ...args: any[]) => this' is not assignable to type '(event: string | symbol, ...args: any[]) => boolean'.
    Type 'this' is not assignable to type 'boolean'.
      Type 'Socket' is not assignable to type 'boolean'.
```

La firma del método `emit()` fue corregida en la versión `3.0.1` ([commit](https://github.com/socketio/socket.io/commit/50671d984a81535a6a15c704546ca7465e2ea295)).


- el cliente se desconecta al enviar una carga útil grande (> 1MB)

Esto probablemente se debe al hecho de que el valor predeterminado de `maxHttpBufferSize` ahora es `1MB`. Al recibir un paquete más grande que esto, el servidor desconecta al cliente, para evitar que clientes maliciosos sobrecarguen el servidor.

Puedes ajustar el valor al crear el servidor:

```js
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: 1e8
});
```

- `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at xxx/socket.io/?EIO=4&transport=polling&t=NMnp2WI. (Reason: CORS header 'Access-Control-Allow-Origin' missing).`

Desde Socket.IO v3, necesitas habilitar explícitamente [Cross-Origin Resource Sharing](https://developer.mozilla.org/es/docs/Web/HTTP/CORS) (CORS). La documentación se puede encontrar [aquí](../02-Server/handling-cors.md).

- `Uncaught TypeError: packet.data is undefined`

Parece que estás usando un cliente v3 para conectarte a un servidor v2, lo cual no es posible. Por favor consulta la [siguiente sección](#cómo-actualizar-un-despliegue-en-producción-existente).

- `Object literal may only specify known properties, and 'extraHeaders' does not exist in type 'ConnectOpts'`

Dado que el código fuente ha sido reescrito en TypeScript (más información [aquí](#el-código-fuente-de-socketio-ha-sido-reescrito-en-typescript)), `@types/socket.io-client` ya no es necesario y de hecho entrará en conflicto con los tipos que vienen del paquete `socket.io-client`.

- cookie faltante en un contexto cross-origin

Ahora necesitas habilitar explícitamente las cookies si el frontend no es servido desde el mismo dominio que el backend:

*Servidor*

```js
import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: ["https://front.domain.com"],
    credentials: true
  }
});
```

*Cliente*

```js
import { io } from "socket.io-client";

const socket = io("https://backend.domain.com", {
  withCredentials: true
});
```

Referencia:

- [Manejo de CORS](../02-Server/handling-cors.md)
- [Opción `cors`](../../server-api.md#cors)
- [Opción `withCredentials`](../../client-api.md#withcredentials)
