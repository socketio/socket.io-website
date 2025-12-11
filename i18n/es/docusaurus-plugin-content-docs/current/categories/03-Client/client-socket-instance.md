---
title: La instancia Socket (lado del cliente)
sidebar_label: La instancia Socket
sidebar_position: 3
slug: /client-socket-instance/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Un `Socket` es la clase fundamental para interactuar con el servidor. Hereda la mayoría de los métodos del [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter) de Node.js, como [emit](../../client-api.md#socketemiteventname-args), [on](../../client-api.md#socketoneventname-callback), [once](../../client-api.md#socketonceeventname-callback) u [off](../../client-api.md#socketoffeventname).

<ThemedImage
  alt="Comunicación bidireccional entre servidor y cliente"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication-socket.png'),
    dark: useBaseUrl('/images/bidirectional-communication-socket-dark.png'),
  }}
/>

<br />
<br />

Además de [emitir](../04-Events/emitting-events.md) y [escuchar](../04-Events/listening-to-events.md) eventos, la instancia Socket tiene algunos atributos que pueden ser útiles en tu aplicación:

## Socket#id

A cada nueva conexión se le asigna un identificador aleatorio de 20 caracteres.

Este identificador está sincronizado con el valor en el lado del servidor.

```js
// lado del servidor
io.on("connection", (socket) => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

// lado del cliente
socket.on("connect", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});
```

:::caution

Por favor nota que, a menos que la [recuperación del estado de conexión](../01-Documentation/connection-state-recovery.md) esté habilitada, el atributo `id` es un ID **efímero** que no está destinado a ser usado en tu aplicación (o solo con propósitos de depuración) porque:

- este ID se regenera después de cada reconexión (por ejemplo cuando la conexión WebSocket se corta, o cuando el usuario actualiza la página)
- dos pestañas de navegador diferentes tendrán dos IDs diferentes
- no hay cola de mensajes almacenada para un ID dado en el servidor (es decir, si el cliente está desconectado, los mensajes enviados desde el servidor a este ID se pierden)

Por favor usa un ID de sesión regular en su lugar (ya sea enviado en una cookie, o almacenado en el localStorage y enviado en el payload de [`auth`](../../client-options.md#auth)).

Ver también:

- [Parte II de nuestra guía de mensajes privados](/get-started/private-messaging-part-2/)
- [Cómo manejar cookies](/how-to/deal-with-cookies)

:::

## Socket#connected

Este atributo describe si el socket está actualmente conectado al servidor.

```js
socket.on("connect", () => {
  console.log(socket.connected); // true
});

socket.on("disconnect", () => {
  console.log(socket.connected); // false
});
```

## Socket#io

Una referencia al [Manager](../../client-api.md#manager) subyacente.

```js
socket.on("connect", () => {
  const engine = socket.io.engine;
  console.log(engine.transport.name); // en la mayoría de los casos, imprime "polling"

  engine.once("upgrade", () => {
    // se llama cuando el transporte se actualiza (es decir, de HTTP long-polling a WebSocket)
    console.log(engine.transport.name); // en la mayoría de los casos, imprime "websocket"
  });

  engine.on("packet", ({ type, data }) => {
    // se llama para cada paquete recibido
  });

  engine.on("packetCreate", ({ type, data }) => {
    // se llama para cada paquete enviado
  });

  engine.on("drain", () => {
    // se llama cuando el buffer de escritura se vacía
  });

  engine.on("close", (reason) => {
    // se llama cuando la conexión subyacente se cierra
  });
});
```

## Ciclo de vida

<ThemedImage
  alt="Diagrama de ciclo de vida"
  sources={{
    light: useBaseUrl('/images/client_socket_events.png'),
    dark: useBaseUrl('/images/client_socket_events-dark.png'),
  }}
/>

## Eventos

La instancia Socket emite tres eventos especiales:

- [`connect`](#connect)
- [`connect_error`](#connect_error)
- [`disconnect`](#disconnect)

:::tip

Desde Socket.IO v3, la instancia Socket ya no emite ningún evento relacionado con la lógica de reconexión. Puedes escuchar los eventos en la instancia Manager directamente:

```js
socket.io.on("reconnect_attempt", () => {
  // ...
});

socket.io.on("reconnect", () => {
  // ...
});
```

Más información se puede encontrar en la [guía de migración](../07-Migrations/migrating-from-2-to-3.md#the-socket-instance-will-no-longer-forward-the-events-emitted-by-its-manager).

:::

### `connect`

Este evento es disparado por la instancia Socket al conectarse **y** reconectarse.

```js
socket.on("connect", () => {
  // ...
});
```

:::caution

Los manejadores de eventos no deben registrarse en el manejador `connect` mismo, ya que se registrará un nuevo manejador cada vez que la instancia socket se reconecte:

MAL :warning:

```js
socket.on("connect", () => {
  socket.on("data", () => { /* ... */ });
});
```

BIEN :+1:

```js
socket.on("connect", () => {
  // ...
});

socket.on("data", () => { /* ... */ });
```

:::

### `connect_error`

- `error` [`<Error>`](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Error)

Este evento se dispara al fallar la conexión.

| Razón                                                                                          | ¿Reconexión automática? |
|-------------------------------------------------------------------------------------------------|-------------------------|
| La conexión de bajo nivel no puede establecerse (fallo temporal)                               | :white_check_mark: SÍ   |
| La conexión fue denegada por el servidor en una [función middleware](../02-Server/middlewares.md) | :x: NO                  |

El atributo [`socket.active`](../../client-api.md#socketactive) indica si el socket intentará reconectarse automáticamente después de un pequeño [retraso aleatorizado](../../client-options.md#reconnectiondelay):

```js
socket.on("connect_error", (error) => {
  if (socket.active) {
    // fallo temporal, el socket intentará reconectarse automáticamente
  } else {
    // la conexión fue denegada por el servidor
    // en ese caso, `socket.connect()` debe llamarse manualmente para reconectarse
    console.log(error.message);
  }
});
```

### `disconnect`

- `reason` [`<string>`](https://developer.mozilla.org/es/docs/Web/JavaScript/Data_structures#string_type)
- `details` `<DisconnectDetails>`

Este evento se dispara al desconectarse.

```js
socket.on("disconnect", (reason, details) => {
  // ...
});
```

Aquí está la lista de posibles razones:

| Razón                 | Descripción                                                                                                             | ¿Reconexión automática? |
|------------------------|-------------------------------------------------------------------------------------------------------------------------|:------------------------|
| `io server disconnect` | El servidor ha desconectado forzosamente el socket con [socket.disconnect()](../../server-api.md#socketdisconnectclose) | :x: NO                  |
| `io client disconnect` | El socket fue desconectado manualmente usando [socket.disconnect()](../../client-api.md#socketdisconnect)                  | :x: NO                  |
| `ping timeout`         | El servidor no envió un PING dentro del rango `pingInterval + pingTimeout`                                            | :white_check_mark: SÍ   |
| `transport close`      | La conexión se cerró (ejemplo: el usuario perdió conexión, o la red cambió de WiFi a 4G)                               | :white_check_mark: SÍ   |
| `transport error`      | La conexión encontró un error (ejemplo: el servidor fue detenido durante un ciclo HTTP long-polling)                   | :white_check_mark: SÍ   |

El atributo [`socket.active`](../../client-api.md#socketactive) indica si el socket intentará reconectarse automáticamente después de un pequeño [retraso aleatorizado](../../client-options.md#reconnectiondelay):

```js
socket.on("disconnect", (reason) => {
  if (socket.active) {
    // desconexión temporal, el socket intentará reconectarse automáticamente
  } else {
    // la conexión fue cerrada forzosamente por el servidor o el cliente mismo
    // en ese caso, `socket.connect()` debe llamarse manualmente para reconectarse
    console.log(reason);
  }
});
```

:::caution

Los siguientes nombres de eventos están reservados y no deben usarse en tu aplicación:

- `connect`
- `connect_error`
- `disconnect`
- `disconnecting`
- `newListener`
- `removeListener`

```js
// MAL, lanzará un error
socket.emit("disconnect");
```

:::

## API completa

La API completa expuesta por la instancia Socket se puede encontrar [aquí](../../client-api.md#socket).
