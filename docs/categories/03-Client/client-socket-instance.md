---
title: The Socket instance (client-side)
sidebar_label: The Socket instance
sidebar_position: 3
slug: /client-socket-instance/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

A `Socket` is the fundamental class for interacting with the server. It inherits most of the methods of the Node.js [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter), like [emit](../../client-api.md#socketemiteventname-args), [on](../../client-api.md#socketoneventname-callback), [once](../../client-api.md#socketonceeventname-callback) or [off](../../client-api.md#socketoffeventname).

<ThemedImage
  alt="Bidirectional communication between server and client"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication-socket.png'),
    dark: useBaseUrl('/images/bidirectional-communication-socket-dark.png'),
  }}
/>

<br />
<br />

Besides [emitting](../04-Events/emitting-events.md) and [listening to](../04-Events/listening-to-events.md) events, the Socket instance has a few attributes that may be of use in your application:

## Socket#id

Each new connection is assigned a random 20-characters identifier.

This identifier is synced with the value on the server-side.

```js
// server-side
io.on("connection", (socket) => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

// client-side
socket.on("connect", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});
```

:::caution

Please note that, unless [connection state recovery](../01-Documentation/connection-state-recovery.md) is enabled, the `id` attribute is an **ephemeral** ID that is not meant to be used in your application (or only for debugging purposes) because:

- this ID is regenerated after each reconnection (for example when the WebSocket connection is severed, or when the user refreshes the page)
- two different browser tabs will have two different IDs
- there is no message queue stored for a given ID on the server (i.e. if the client is disconnected, the messages sent from the server to this ID are lost)

Please use a regular session ID instead (either sent in a cookie, or stored in the localStorage and sent in the [`auth`](../../client-options.md#auth) payload).

See also:

- [Part II of our private message guide](/get-started/private-messaging-part-2/)
- [How to deal with cookies](/how-to/deal-with-cookies)

:::

## Socket#connected

This attribute describes whether the socket is currently connected to the server.

```js
socket.on("connect", () => {
  console.log(socket.connected); // true
});

socket.on("disconnect", () => {
  console.log(socket.connected); // false
});
```

## Socket#io

A reference to the underlying [Manager](../../client-api.md#manager).

```js
socket.on("connect", () => {
  const engine = socket.io.engine;
  console.log(engine.transport.name); // in most cases, prints "polling"

  engine.once("upgrade", () => {
    // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    console.log(engine.transport.name); // in most cases, prints "websocket"
  });

  engine.on("packet", ({ type, data }) => {
    // called for each packet received
  });

  engine.on("packetCreate", ({ type, data }) => {
    // called for each packet sent
  });

  engine.on("drain", () => {
    // called when the write buffer is drained
  });

  engine.on("close", (reason) => {
    // called when the underlying connection is closed
  });
});
```

## Lifecycle

<ThemedImage
  alt="Lifecycle diagram"
  sources={{
    light: useBaseUrl('/images/client_socket_events.png'),
    dark: useBaseUrl('/images/client_socket_events-dark.png'),
  }}
/>

## Events

The Socket instance emits three special events:

- [`connect`](#connect)
- [`connect_error`](#connect_error)
- [`disconnect`](#disconnect)

:::tip

Since Socket.IO v3, the Socket instance does not emit any event related to the reconnection logic anymore. You can listen to the events on the Manager instance directly:

```js
socket.io.on("reconnect_attempt", () => {
  // ...
});

socket.io.on("reconnect", () => {
  // ...
});
```

More information can be found in the [migration guide](../07-Migrations/migrating-from-2-to-3.md#the-socket-instance-will-no-longer-forward-the-events-emitted-by-its-manager).

:::

### `connect`

This event is fired by the Socket instance upon connection **and** reconnection.

```js
socket.on("connect", () => {
  // ...
});
```

:::caution

Event handlers shouldn't be registered in the `connect` handler itself, as a new handler will be registered every time the socket instance reconnects:

BAD :warning:

```js
socket.on("connect", () => {
  socket.on("data", () => { /* ... */ });
});
```

GOOD :+1:

```js
socket.on("connect", () => {
  // ...
});

socket.on("data", () => { /* ... */ });
```

:::

### `connect_error`

- `error` [`<Error>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

This event is fired upon connection failure.

| Reason                                                                                          | Automatic reconnection? |
|-------------------------------------------------------------------------------------------------|-------------------------|
| The low-level connection cannot be established (temporary failure)                              | :white_check_mark: YES  |
| The connection was denied by the server in a [middleware function](../02-Server/middlewares.md) | :x: NO                  |

The [`socket.active`](../../client-api.md#socketactive) attribute indicates whether the socket will automatically try to reconnect after a small [randomized delay](../../client-options.md#reconnectiondelay):

```js
socket.on("connect_error", (error) => {
  if (socket.active) {
    // temporary failure, the socket will automatically try to reconnect
  } else {
    // the connection was denied by the server
    // in that case, `socket.connect()` must be manually called in order to reconnect
    console.log(error.message);
  }
});
```

### `disconnect`

- `reason` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- `details` `<DisconnectDetails>`

This event is fired upon disconnection.

```js
socket.on("disconnect", (reason, details) => {
  // ...
});
```

Here is the list of possible reasons:

| Reason                 | Description                                                                                                             | Automatic reconnection? |
|------------------------|-------------------------------------------------------------------------------------------------------------------------|:------------------------|
| `io server disconnect` | The server has forcefully disconnected the socket with [socket.disconnect()](../../server-api.md#socketdisconnectclose) | :x: NO                  |
| `io client disconnect` | The socket was manually disconnected using [socket.disconnect()](../../client-api.md#socketdisconnect)                  | :x: NO                  |
| `ping timeout`         | The server did not send a PING within the `pingInterval + pingTimeout` range                                            | :white_check_mark: YES  |
| `transport close`      | The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)           | :white_check_mark: YES  |
| `transport error`      | The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)               | :white_check_mark: YES  |

The [`socket.active`](../../client-api#socketactive) attribute indicates whether the socket will automatically try to reconnect after a small [randomized delay](../../client-options.md#reconnectiondelay):

```js
socket.on("disconnect", (reason) => {
  if (socket.active) {
    // temporary disconnection, the socket will automatically try to reconnect
  } else {
    // the connection was forcefully closed by the server or the client itself
    // in that case, `socket.connect()` must be manually called in order to reconnect
    console.log(reason);
  }
});
```

:::caution

The following event names are reserved and must not be used in your application:

- `connect`
- `connect_error`
- `disconnect`
- `disconnecting`
- `newListener`
- `removeListener`

```js
// BAD, will throw an error
socket.emit("disconnect");
```

:::

## Complete API

The complete API exposed by the Socket instance can be found [here](../../client-api.md#socket).
