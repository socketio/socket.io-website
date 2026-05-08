---
title: Namespaces
sidebar_position: 1
slug: /namespaces/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Un Namespace es un canal de comunicación que te permite dividir la lógica de tu aplicación sobre una única conexión compartida (también llamado "multiplexación").

<ThemedImage
  alt="Diagrama de Namespace"
  sources={{
    light: useBaseUrl('/images/namespaces.png'),
    dark: useBaseUrl('/images/namespaces-dark.png'),
  }}
/>

## Introducción

Cada namespace tiene sus propios:

- [manejadores de eventos](../04-Events/listening-to-events.md)

```js
io.of("/orders").on("connection", (socket) => {
  socket.on("order:list", () => {});
  socket.on("order:create", () => {});
});

io.of("/users").on("connection", (socket) => {
  socket.on("user:list", () => {});
});
```

- [salas](../04-Events/rooms.md)

```js
const orderNamespace = io.of("/orders");

orderNamespace.on("connection", (socket) => {
  socket.join("room1");
  orderNamespace.to("room1").emit("hello");
});

const userNamespace = io.of("/users");

userNamespace.on("connection", (socket) => {
  socket.join("room1"); // distinta de la sala en el namespace "orders"
  userNamespace.to("room1").emit("holà");
});
```

- [middlewares](../02-Server/middlewares.md)

```js
const orderNamespace = io.of("/orders");

orderNamespace.use((socket, next) => {
  // asegurar que el socket tiene acceso al namespace "orders", y luego
  next();
});

const userNamespace = io.of("/users");

userNamespace.use((socket, next) => {
  // asegurar que el socket tiene acceso al namespace "users", y luego
  next();
});
```

Posibles casos de uso:

- quieres crear un namespace especial al que solo usuarios autorizados tienen acceso, así la lógica relacionada con esos usuarios está separada del resto de la aplicación

```js
const adminNamespace = io.of("/admin");

adminNamespace.use((socket, next) => {
  // asegurar que el usuario tiene suficientes derechos
  next();
});

adminNamespace.on("connection", socket => {
  socket.on("delete user", () => {
    // ...
  });
});
```

- tu aplicación tiene múltiples tenants así que quieres crear dinámicamente un namespace por tenant

```js
const workspaces = io.of(/^\/\w+$/);

workspaces.on("connection", socket => {
  const workspace = socket.nsp;

  workspace.emit("hello");
});
```

## Namespace principal

Hasta ahora, has interactuado con el namespace principal, llamado `/`. La instancia `io` hereda todos sus métodos:

```js
io.on("connection", (socket) => {});
io.use((socket, next) => { next() });
io.emit("hello");
// son en realidad equivalentes a
io.of("/").on("connection", (socket) => {});
io.of("/").use((socket, next) => { next() });
io.of("/").emit("hello");
```

Algunos tutoriales también pueden mencionar `io.sockets`, es simplemente un alias para `io.of("/")`.

```js
io.sockets === io.of("/")
```

## Namespaces personalizados

Para configurar un namespace personalizado, puedes llamar a la función `of` en el lado del servidor:

```js
const nsp = io.of("/my-namespace");

nsp.on("connection", socket => {
  console.log("alguien se conectó");
});

nsp.emit("hi", "¡todos!");
```

## Inicialización del cliente

Versión del mismo origen:

```js
const socket = io(); // o io("/"), el namespace principal
const orderSocket = io("/orders"); // el namespace "orders"
const userSocket = io("/users"); // el namespace "users"
```

Versión cross-origin/Node.js:

```js
const socket = io("https://example.com"); // o io("https://example.com/"), el namespace principal
const orderSocket = io("https://example.com/orders"); // el namespace "orders"
const userSocket = io("https://example.com/users"); // el namespace "users"
```

En el ejemplo anterior, solo se establecerá una conexión WebSocket, y los paquetes serán enrutados automáticamente al namespace correcto.

Por favor nota que la multiplexación será deshabilitada en los siguientes casos:

- múltiples creaciones para el mismo namespace

```js
const socket1 = io();
const socket2 = io(); // sin multiplexación, dos conexiones WebSocket distintas
```

- diferentes dominios

```js
const socket1 = io("https://first.example.com");
const socket2 = io("https://second.example.com"); // sin multiplexación, dos conexiones WebSocket distintas
```

- uso de la opción [forceNew](../../client-options.md#forcenew)

```js
const socket1 = io();
const socket2 = io("/admin", { forceNew: true }); // sin multiplexación, dos conexiones WebSocket distintas
```

## Namespaces dinámicos

También es posible crear namespaces dinámicamente, ya sea con una expresión regular:

```js
io.of(/^\/dynamic-\d+$/);
```

o con una función:

```js
io.of((name, auth, next) => {
  next(null, true); // o false, cuando la creación es denegada
});
```

Puedes tener acceso al nuevo namespace en el evento `connection`:

```js
io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
  const namespace = socket.nsp;
});
```

El valor de retorno del método `of()` es lo que llamamos el namespace padre, desde el cual puedes:

- registrar [middlewares](../02-Server/middlewares.md)

```js
const parentNamespace = io.of(/^\/dynamic-\d+$/);

parentNamespace.use((socket, next) => { next() });
```

El middleware se registrará automáticamente en cada namespace hijo.

- [transmitir](../04-Events/broadcasting-events.md) eventos

```js
const parentNamespace = io.of(/^\/dynamic-\d+$/);

parentNamespace.emit("hello"); // se enviará a usuarios en /dynamic-1, /dynamic-2, ...
```

:::caution

Los namespaces existentes tienen prioridad sobre los namespaces dinámicos. Por ejemplo:

```js
// registrar namespace "dynamic-101"
io.of("/dynamic-101");

io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
  // no se llamará para una conexión en el namespace "dynamic-101"
});
```

:::

## API completa

La API completa expuesta por la instancia Namespace se puede encontrar [aquí](../../server-api.md#namespace).
