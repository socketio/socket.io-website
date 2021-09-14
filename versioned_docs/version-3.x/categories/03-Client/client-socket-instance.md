---
title: The Socket instance (client-side)
sidebar_label: The Socket instance
sidebar_position: 3
slug: /client-socket-instance/
alias: /docs/client-connection-lifecycle/
---

Besides [emitting](/docs/v3/emitting-events/#Basic-emit) and [listening to](/docs/v3/listening-to-events/) events, the Socket instance has a few attributes that may be of use in your application:

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

## Lifecycle

<img src="/images/client_socket_events.png" alt="Lifecycle diagram" />

## Events

The Socket instance emits three special events:

- [`connect`](#connect)
- [`connect_error`](#connect-error)
- [`disconnect`](#disconnect)

Please note that since Socket.IO v3, the Socket instance does not emit any event related to the reconnection logic anymore. You can listen to the events on the Manager instance directly:

```js
socket.io.on("reconnection_attempt", () => {
  // ...
});

socket.io.on("reconnect", () => {
  // ...
});
```

More information can be found in the [migration guide](/docs/v3/migrating-from-2-x-to-3-0/#The-Socket-instance-will-no-longer-forward-the-events-emitted-by-its-Manager).

### `connect`

This event is fired by the Socket instance upon connection **and** reconnection.

```js
socket.on("connect", () => {
  // ...
});
```

Please note that you shouldn't register event handlers in the `connect` handler itself, as a new handler will be registered every time the Socket reconnects:

```js
// BAD
socket.on("connect", () => {
  socket.on("data", () => { /* ... */ });
});

// GOOD
socket.on("connect", () => {
  // ...
});

socket.on("data", () => { /* ... */ });
```

### `connect_error`

This event is fired when:

- the low-level connection cannot be established
- the connection is denied by the server in a [middleware function](/docs/v3/middlewares/)

In the first case, the Socket will automatically try to reconnect, after a [given delay](/docs/v3/client-initialization/#reconnectionDelay).

In the latter case, you need to manually reconnect. You might need to update the credentials:

```js
// either by directly modifying the `auth` attribute
socket.on("connect_error", () => {
  socket.auth.token = "abcd";
  socket.connect();
});

// or if the `auth` attribute is a function
const socket = io({
  auth: (cb) => {
    cb(localStorage.getItem("token"));
  }
});

socket.on("connect_error", () => {
  setTimeout(() => {
    socket.connect();
  }, 1000);
});
```

### `disconnect`

This event is fired upon disconnection.

```js
socket.on("disconnect", (reason) => {
  // ...
});
```

Here is the list of possible reasons:

Reason | Description
------ | -----------
`io server disconnect` | The server has forcefully disconnected the socket with [socket.disconnect()](/docs/v3/server-api/#socket-disconnect-close)
`io client disconnect` | The socket was manually disconnected using [socket.disconnect()](/docs/v3/client-api/#socket-disconnect)
`ping timeout` | The server did not send a PING within the `pingInterval + pingTimeout` range
`transport close` | The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)
`transport error` | The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)

In the first two cases (explicit disconnection), the client will not try to reconnect and you need to manually call `socket.connect()`.

In all other cases, the client will wait for a small [random delay](/docs/v3/client-initialization/#reconnectionDelay) and then try to reconnect:

```js
socket.on("disconnect", (reason) => {
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
});
```

Note: those events, along with `disconnecting`, `newListener` and `removeListener`, are special events that shouldn't be used in your application:

```js
// BAD, will throw an error
socket.emit("disconnect");
```

## Complete API

The complete API exposed by the Socket instance can be found [here](/docs/v3/client-api/#Socket).
