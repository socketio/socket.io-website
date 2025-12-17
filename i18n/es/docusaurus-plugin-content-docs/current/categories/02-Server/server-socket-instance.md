---
title: La instancia de Socket (lado del servidor)
sidebar_label: La instancia de Socket
sidebar_position: 4
slug: /server-socket-instance/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Un `Socket` es la clase fundamental para interactuar con el cliente. Hereda todos los métodos del [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter) de Node.js, como [emit](../../server-api.md#socketemiteventname-args), [on](../../server-api.md#socketoneventname-callback), [once](../../server-api.md#socketonceeventname-listener) o [removeListener](../../server-api.md#socketremovelistenereventname-listener).

<ThemedImage
  alt="Comunicación bidireccional entre servidor y cliente"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication-socket.png'),
    dark: useBaseUrl('/images/bidirectional-communication-socket-dark.png'),
  }}
/>

<br />
<br />

Además de:

- [emitir](../04-Events/emitting-events.md#basic-emit) y [escuchar](../04-Events/listening-to-events.md) eventos
- [transmitir eventos](../04-Events/broadcasting-events.md#to-all-connected-clients-except-the-sender)
- [unirse y abandonar salas](../04-Events/rooms.md#joining-and-leaving)

La instancia de Socket tiene algunos atributos que pueden ser útiles en tu aplicación:

## Socket#id

A cada nueva conexión se le asigna un identificador aleatorio de 20 caracteres.

Este identificador está sincronizado con el valor en el lado del cliente.

```js
// lado del servidor
io.on("connection", (socket) => {
  console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
});

// lado del cliente
socket.on("connect", () => {
  console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
});
```

:::caution

Por favor nota que, a menos que la [recuperación del estado de conexión](../01-Documentation/connection-state-recovery.md) esté habilitada, el atributo `id` es un ID **efímero** que no está destinado a ser usado en tu aplicación (o solo para propósitos de depuración) porque:

- este ID se regenera después de cada reconexión (por ejemplo cuando la conexión WebSocket se corta, o cuando el usuario actualiza la página)
- dos pestañas diferentes del navegador tendrán dos IDs diferentes
- no hay cola de mensajes almacenada para un ID dado en el servidor (es decir, si el cliente está desconectado, los mensajes enviados desde el servidor a este ID se pierden)

Por favor usa un ID de sesión regular en su lugar (ya sea enviado en una cookie, o almacenado en localStorage y enviado en el payload de [`auth`](../../client-options.md#auth)).

Ver también:

- [Parte II de nuestra guía de mensajes privados](/get-started/private-messaging-part-2/)
- [Cómo lidiar con cookies](/how-to/deal-with-cookies)

:::

Nota: no puedes sobrescribir este identificador, ya que se usa en varias partes del código base de Socket.IO.

## Socket#handshake

Este objeto contiene algunos detalles sobre el handshake que ocurre al comienzo de la sesión Socket.IO.

```
{
  headers: /* los encabezados de la solicitud inicial */
  query: /* los parámetros de consulta de la solicitud inicial */
  auth: /* el payload de autenticación */
  time: /* la fecha de creación (como cadena) */
  issued: /* la fecha de creación (timestamp unix) */
  url: /* la cadena URL de la solicitud */
  address: /* la ip del cliente */
  xdomain: /* si la conexión es de dominio cruzado */
  secure: /* si la conexión es segura */
}
```

Ejemplo:

```json
{
  "headers": {
    "user-agent": "xxxx",
    "accept": "*/*",
    "host": "example.com",
    "connection": "close"
  },
  "query": {
    "EIO": "4",
    "transport": "polling",
    "t": "NNjNltH"
  },
  "auth": {
    "token": "123"
  },
  "time": "Sun Nov 22 2020 01:33:46 GMT+0100 (Central European Standard Time)",
  "issued": 1606005226969,
  "url": "/socket.io/?EIO=4&transport=polling&t=NNjNltH",
  "address": "::ffff:1.2.3.4",
  "xdomain": false,
  "secure": true
}
```

## Socket#rooms

Esta es una referencia a las [salas](../04-Events/rooms.md) en las que el Socket está actualmente.

```js
io.on("connection", (socket) => {
  console.log(socket.rooms); // Set { <socket.id> }
  socket.join("room1");
  console.log(socket.rooms); // Set { <socket.id>, "room1" }
});
```

## Socket#data

Un objeto arbitrario que puede usarse junto con el método de utilidad `fetchSockets()`:

```js
// servidor A
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

// servidor B
const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

Más información [aquí](server-instance.md#utility-methods).

## Socket#conn

Una referencia al socket Engine.IO subyacente (ver [aquí](../01-Documentation/how-it-works.md)).

```js
io.on("connection", (socket) => {
  console.log("transporte inicial", socket.conn.transport.name); // imprime "polling"

  socket.conn.once("upgrade", () => {
    // se llama cuando el transporte se actualiza (es decir, de HTTP long-polling a WebSocket)
    console.log("transporte actualizado", socket.conn.transport.name); // imprime "websocket"
  });

  socket.conn.on("packet", ({ type, data }) => {
    // se llama por cada paquete recibido
  });

  socket.conn.on("packetCreate", ({ type, data }) => {
    // se llama por cada paquete enviado
  });

  socket.conn.on("drain", () => {
    // se llama cuando el búfer de escritura se vacía
  });

  socket.conn.on("close", (reason) => {
    // se llama cuando la conexión subyacente se cierra
  });
});
```

## Atributos adicionales

Siempre que no sobrescribas ningún atributo existente, puedes adjuntar cualquier atributo a la instancia de Socket y usarlo más tarde:

```js
// en un middleware
io.use(async (socket, next) => {
  try {
    const user = await fetchUser(socket);
    socket.user = user;
  } catch (e) {
    next(new Error("usuario desconocido"));
  }
});

io.on("connection", (socket) => {
  console.log(socket.user);

  // en un listener
  socket.on("set username", (username) => {
    socket.username = username;
  });
});

```

## Middlewares de Socket

Estos middlewares se parecen mucho a los [middlewares](middlewares.md) habituales, excepto que se llaman por cada paquete entrante:

```js
socket.use(([event, ...args], next) => {
  // hacer algo con el paquete (registro, autorización, limitación de tasa...)
  // no olvides llamar a next() al final
  next();
});
```

El método `next` también puede ser llamado con un objeto de error. En ese caso, el evento no llegará a los manejadores de eventos registrados y se emitirá un evento `error` en su lugar:

```js
io.on("connection", (socket) => {
  socket.use(([event, ...args], next) => {
    if (isUnauthorized(event)) {
      return next(new Error("evento no autorizado"));
    }
    next();
  });

  socket.on("error", (err) => {
    if (err && err.message === "evento no autorizado") {
      socket.disconnect();
    }
  });
});
```

Nota: esta característica solo existe en el lado del servidor. Para el lado del cliente, podrías estar interesado en [listeners catch-all](../04-Events/listening-to-events.md#catch-all-listeners).

## Eventos

En el lado del servidor, la instancia de Socket emite dos eventos especiales:

- [`disconnect`](#disconnect)
- [`disconnecting`](#disconnecting)

### `disconnect`

Este evento es disparado por la instancia de Socket al desconectarse.

```js
io.on("connection", (socket) => {
  socket.on("disconnect", (reason) => {
    // ...
  });
});
```

Aquí está la lista de posibles razones:

| Razón                         | Descripción                                                                                                                                    |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `server namespace disconnect` | El socket fue desconectado forzosamente con [socket.disconnect()](server-api.md#socketdisconnectclose).                                        |
| `client namespace disconnect` | El cliente ha desconectado manualmente el socket usando [socket.disconnect()](client-api.md#socketdisconnect).                                 |
| `server shutting down`        | El servidor está, bueno, apagándose.                                                                                                           |
| `ping timeout`                | El cliente no envió un paquete PONG en el retraso `pingTimeout`.                                                                               |
| `transport close`             | La conexión fue cerrada (ejemplo: el usuario ha perdido la conexión, o la red cambió de WiFi a 4G).                                            |
| `transport error`             | La conexión ha encontrado un error.                                                                                                            |
| `parse error`                 | El servidor ha recibido un paquete inválido del cliente.                                                                                       |
| `forced close`                | El servidor ha recibido un paquete inválido del cliente.                                                                                       |
| `forced server close`         | El cliente no se unió a un namespace a tiempo (ver la opción [`connectTimeout`](server-options.md#connecttimeout)) y fue cerrado forzosamente. |

### `disconnecting`

Este evento es similar a `disconnect` pero se dispara un poco antes, cuando el set [Socket#rooms](server-socket-instance.md#socketrooms) aún no está vacío

```js
io.on("connection", (socket) => {
  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit("el usuario se ha ido", socket.id);
      }
    }
  });
});
```

Nota: estos eventos, junto con `connect`, `connect_error`, `newListener` y `removeListener`, son eventos especiales que no deberían usarse en tu aplicación:

```js
// MAL, lanzará un error
socket.emit("disconnect");
```

## API completa

La API completa expuesta por la instancia de Socket se puede encontrar [aquí](../../server-api.md#socket).
