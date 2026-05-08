---
title: Garantías de entrega
sidebar_position: 3
slug: /delivery-guarantees
toc_max_heading_level: 4
---

## Orden de los mensajes

Socket.IO garantiza el orden de los mensajes, sin importar qué transporte de bajo nivel se utilice (incluso durante una actualización de HTTP long-polling a WebSocket).

Esto se logra gracias a:

- las garantías proporcionadas por la conexión TCP subyacente
- el diseño cuidadoso del [mecanismo de actualización](how-it-works.md#mecanismo-de-actualización)

Ejemplo:

```js
socket.emit("event1");
socket.emit("event2");
socket.emit("event3");
```

En el ejemplo anterior, los eventos siempre serán recibidos en el mismo orden por el otro lado (siempre que realmente lleguen, ver [abajo](#llegada-de-mensajes)).

## Llegada de mensajes

### Como máximo una vez

Por defecto, Socket.IO proporciona una garantía de entrega de **como máximo una vez**:

- si la conexión se interrumpe mientras se envía un evento, entonces no hay garantía de que el otro lado lo haya recibido y no habrá reintento tras la reconexión
- un cliente desconectado [almacenará eventos en búfer hasta la reconexión](../03-Client/client-offline-behavior.md) (aunque el punto anterior sigue aplicando)
- no hay tal búfer en el servidor, lo que significa que cualquier evento que haya perdido un cliente desconectado no será transmitido a ese cliente tras la reconexión

:::info

Actualmente, garantías de entrega adicionales deben implementarse en tu aplicación.

:::

### Al menos una vez

#### Del cliente al servidor

Desde el lado del cliente, puedes lograr una garantía de **al menos una vez** con la opción [`retries`](../../client-options.md#retries):

```js
const socket = io({
  retries: 3,
  ackTimeout: 10000
});
```

El cliente intentará enviar el evento (hasta `retries + 1` veces), hasta que obtenga una confirmación del servidor.

:::caution

Incluso en ese caso, cualquier evento pendiente se perderá si el usuario actualiza su pestaña.

:::

#### Del servidor al cliente

Para eventos enviados por el servidor, garantías de entrega adicionales pueden implementarse:

- asignando un ID único a cada evento
- persistiendo los eventos en una base de datos
- almacenando el offset del último evento recibido en el lado del cliente, y enviándolo tras la reconexión

Ejemplo:

*Cliente*

```js
const socket = io({
  auth: {
    offset: undefined
  }
});

socket.on("my-event", ({ id, data }) => {
  // hacer algo con los datos, y luego actualizar el offset
  socket.auth.offset = id;
});
```

*Servidor*

```js
io.on("connection", async (socket) => {
  const offset = socket.handshake.auth.offset;
  if (offset) {
    // esto es una reconexión
    for (const event of await fetchMissedEventsFromDatabase(offset)) {
      socket.emit("my-event", event);
    }
  } else {
    // esta es una primera conexión
  }
});

setInterval(async () => {
  const event = {
    id: generateUniqueId(),
    data: new Date().toISOString()
  }

  await persistEventToDatabase(event);
  io.emit("my-event", event);
}, 1000);
```

Implementar los métodos faltantes (`fetchMissedEventsFromDatabase()`, `generateUniqueId()` y `persistEventToDatabase()`) es específico de la base de datos y se deja como ejercicio para el lector.

Referencias:

- [`socket.auth`](../../client-options.md#socket-options) (cliente)
- [`socket.handshake`](../../server-api.md#sockethandshake) (servidor)
