---
title: Middlewares
sidebar_position: 5
slug: /middlewares/
---

Una función middleware es una función que se ejecuta para cada conexión entrante.

Las funciones middleware pueden ser útiles para:

- registro (logging)
- autenticación / autorización
- limitación de tasa (rate limiting)

Nota: esta función se ejecutará solo una vez por conexión (incluso si la conexión consiste en múltiples solicitudes HTTP).

:::info

Si estás buscando middlewares de Express, por favor revisa [esta sección](#compatibilidad-con-middleware-de-express).

:::

## Registrar un middleware

Una función middleware tiene acceso a la [instancia de Socket](server-socket-instance.md) y a la siguiente función middleware registrada.

```js
io.use((socket, next) => {
  if (isValid(socket.request)) {
    next();
  } else {
    next(new Error("inválido"));
  }
});
```

Puedes registrar varias funciones middleware, y se ejecutarán secuencialmente:

```js
io.use((socket, next) => {
  next();
});

io.use((socket, next) => {
  next(new Error("no pasarás"));
});

io.use((socket, next) => {
  // no se ejecuta, ya que el middleware anterior retornó un error
  next();
});
```

Por favor asegúrate de llamar a `next()` en cualquier caso. De lo contrario, la conexión quedará colgada hasta que se cierre después de un tiempo de espera dado.

**Nota importante**: la instancia de Socket no está realmente conectada cuando se ejecuta el middleware, lo que significa que no se emitirá ningún evento `disconnect` si la conexión finalmente falla.

Por ejemplo, si el cliente cierra manualmente la conexión:

```js
// lado del servidor
io.use((socket, next) => {
  setTimeout(() => {
    // next se llama después de la desconexión del cliente
    next();
  }, 1000);

  socket.on("disconnect", () => {
    // no se activa
  });
});

io.on("connection", (socket) => {
  // no se activa
});

// lado del cliente
const socket = io();
setTimeout(() => {
  socket.disconnect();
}, 500);
```

## Enviar credenciales

El cliente puede enviar credenciales con la opción `auth`:

```js
// objeto simple
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
```

Esas credenciales se pueden acceder en el objeto [handshake](server-socket-instance.md#sockethandshake) en el lado del servidor:

```js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // ...
});
```

## Manejo de errores de middleware

Si el método `next` se llama con un objeto Error, la conexión será rechazada y el cliente recibirá un evento `connect_error`.

```js
// lado del cliente
socket.on("connect_error", (err) => {
  console.log(err.message); // imprime el mensaje asociado con el error
});
```

Puedes adjuntar detalles adicionales al objeto Error:

```js
// lado del servidor
io.use((socket, next) => {
  const err = new Error("no autorizado");
  err.data = { content: "Por favor intenta más tarde" }; // detalles adicionales
  next(err);
});

// lado del cliente
socket.on("connect_error", (err) => {
  console.log(err instanceof Error); // true
  console.log(err.message); // no autorizado
  console.log(err.data); // { content: "Por favor intenta más tarde" }
});
```

## Compatibilidad con middleware de Express

Dado que no están vinculados a un ciclo usual de solicitud/respuesta HTTP, los middlewares de Socket.IO no son realmente compatibles con los [middlewares de Express](https://expressjs.com/en/guide/using-middleware.html).

Dicho esto, a partir de la versión `4.6.0`, los middlewares de Express ahora son soportados por el motor subyacente:

```js
io.engine.use((req, res, next) => {
  // hacer algo

  next();
});
```

Los middlewares serán llamados para cada solicitud HTTP entrante, incluyendo solicitudes de actualización.

Ejemplo con [`express-session`](https://www.npmjs.com/package/express-session):

```js
import session from "express-session";

io.engine.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
```

Ejemplo con [`helmet`](https://www.npmjs.com/package/helmet):

```js
import helmet from "helmet";

io.engine.use(helmet());
```

Si el middleware debe aplicarse solo a la solicitud de handshake (y no a cada solicitud HTTP), puedes verificar la existencia del parámetro de consulta `sid`.

Ejemplo con [`passport-jwt`](https://www.npmjs.com/package/passport-jwt):

```js
io.engine.use((req, res, next) => {
  const isHandshake = req._query.sid === undefined;
  if (isHandshake) {
    passport.authenticate("jwt", { session: false })(req, res, next);
  } else {
    next();
  }
});
```
