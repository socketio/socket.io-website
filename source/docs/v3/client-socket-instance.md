title: The Socket instance (client-side)
short_title: The Socket instance
permalink: /docs/v3/client-socket-instance/
alias: /docs/client-connection-lifecycle/
release: v3
type: docs
order: 303
---

Besides [emitting events](/docs/v3/emitting-events/#Basic-emit), the Socket instance has a few attributes that may be of use in your application:

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

- `connect`

This event is fired by the Socket instance upon connection / reconnection.

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

- `connect_error`

This event is fired when the server does not accept the connection (in a [middleware function](/docs/v3/middlewares)).

You need to manually reconnect. You might need to update the credentials:

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

- `disconnect`

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
`ping timeout` | The server did not respond in the `pingTimeout` range
`transport close` | The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)
`transport error` | The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)

Note: those events, along with `disconnecting`, `newListener` and `removeListener`, are special events that shouldn't be used in your application:

```js
// BAD, will throw an error
socket.emit("disconnect");
```
