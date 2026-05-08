---
title: Estructura de la aplicación
sidebar_position: 9
slug: /server-application-structure/
---

## Registrar manejadores de eventos

A continuación encontrarás dos sugerencias sobre cómo registrar tus manejadores de eventos.

Por favor nota que estas son meramente sugerencias y no pautas estrictas que debas seguir. ¡Por favor adáptalas a tu gusto!

### Cada archivo registra sus propios manejadores de eventos

Aquí, el punto de entrada se mantiene ordenado, pero los listeners de eventos pueden ser menos descubribles (aunque una convención de nombres sólida/ctrl+f ayudará).

`index.js`

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer);

const registerOrderHandlers = require("./orderHandler");
const registerUserHandlers = require("./userHandler");

const onConnection = (socket) => {
  registerOrderHandlers(io, socket);
  registerUserHandlers(io, socket);
}

io.on("connection", onConnection);
```

`orderHandler.js`

```js
module.exports = (io, socket) => {
  const createOrder = (payload) => {
    // ...
  }

  const readOrder = (orderId, callback) => {
    // ...
  }

  socket.on("order:create", createOrder);
  socket.on("order:read", readOrder);
}
```

### Todos los manejadores de eventos se registran en el archivo `index.js`

Aquí, cada nombre de evento se encuentra en el mismo lugar, lo cual es excelente para la descubribilidad, pero podría salirse de control en una aplicación mediana/grande.

`index.js`

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer);

const { createOrder, readOrder } = require("./orderHandler")(io);
const { updatePassword } = require("./userHandler")(io);

const onConnection = (socket) => {
  socket.on("order:create", createOrder);
  socket.on("order:read", readOrder);

  socket.on("user:update-password", updatePassword);
}

io.on("connection", onConnection);
```

`orderHandler.js`

```js
module.exports = (io) => {
  const createOrder = function (payload) {
    const socket = this; // de ahí la 'function' arriba, ya que una arrow function no funcionará
    // ...
  };

  const readOrder = function (orderId, callback) {
    // ...
  };

  return {
    createOrder,
    readOrder
  }
}
```
