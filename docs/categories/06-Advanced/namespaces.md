---
title: Namespaces
sidebar_position: 1
slug: /namespaces/
---

A Namespace is a communication channel that allows you to split the logic of your application over a single shared connection (also called "multiplexing").

![Namespace diagram](/images/namespaces.png)

## Introduction

Each namespace has its own:

- [event handlers](/docs/v4/listening-to-events/)

```js
io.of("/orders").on("connection", (socket) => {
  socket.on("order:list", () => {});
  socket.on("order:create", () => {});
});

io.of("/users").on("connection", (socket) => {
  socket.on("user:list", () => {});
});
```

- [rooms](/docs/v4/rooms/)

```js
const orderNamespace = io.of("/orders");

orderNamespace.on("connection", (socket) => {
  socket.join("room1");
  orderNamespace.to("room1").emit("hello");
});

const userNamespace = io.of("/users");

userNamespace.on("connection", (socket) => {
  socket.join("room1"); // distinct from the room in the "orders" namespace
  userNamespace.to("room1").emit("holà");
});
```

- [middlewares](/docs/v4/middlewares/)

```js
const orderNamespace = io.of("/orders");

orderNamespace.use((socket, next) => {
  // ensure the socket has access to the "orders" namespace, and then
  next();
});

const userNamespace = io.of("/users");

userNamespace.use((socket, next) => {
  // ensure the socket has access to the "users" namespace, and then
  next();
});
```

Possible use cases:

- you want to create a special namespace that only authorized users have access to, so the logic related to those users is separated from the rest of the application

```js
const adminNamespace = io.of("/admin");

adminNamespace.use((socket, next) => {
  // ensure the user has sufficient rights
  next();
});

adminNamespace.on("connection", socket => {
  socket.on("delete user", () => {
    // ...
  });
});
```

- your application has multiple tenants so you want to dynamically create one namespace per tenant

```js
const workspaces = io.of(/^\/\w+$/);

workspaces.on("connection", socket => {
  const workspace = socket.nsp;

  workspace.emit("hello");
});
```

## Main namespace

Until now, you interacted with the main namespace, called `/`. The `io` instance inherits all of its methods:

```js
io.on("connection", (socket) => {});
io.use((socket, next) => { next() });
io.emit("hello");
// are actually equivalent to
io.of("/").on("connection", (socket) => {});
io.of("/").use((socket, next) => { next() });
io.of("/").emit("hello");
```

Some tutorials may also mention `io.sockets`, it's simply an alias for `io.of("/")`.

```js
io.sockets === io.of("/")
```

## Custom namespaces

To set up a custom namespace, you can call the `of` function on the server-side:

```js
const nsp = io.of("/my-namespace");

nsp.on("connection", socket => {
  console.log("someone connected");
});

nsp.emit("hi", "everyone!");
```

## Client initialization

Same-origin version:

```js
const socket = io(); // or io("/"), the main namespace
const orderSocket = io("/orders"); // the "orders" namespace
const userSocket = io("/users"); // the "users" namespace
```

Cross-origin/Node.js version:

```js
const socket = io("https://example.com"); // or io("https://example.com/"), the main namespace
const orderSocket = io("https://example.com/orders"); // the "orders" namespace
const userSocket = io("https://example.com/users"); // the "users" namespace
```

In the example above, only one WebSocket connection will be established, and the packets will automatically be routed to the right namespace.

Please note that multiplexing will be disabled in the following cases:

- multiple creation for the same namespace

```js
const socket1 = io();
const socket2 = io(); // no multiplexing, two distinct WebSocket connections
```

- different domains

```js
const socket1 = io("https://first.example.com");
const socket2 = io("https://second.example.com"); // no multiplexing, two distinct WebSocket connections
```

- usage of the [forceNew](/docs/v4/client-initialization/#forceNew) option

```js
const socket1 = io();
const socket2 = io("/admin", { forceNew: true }); // no multiplexing, two distinct WebSocket connections
```

## Dynamic namespaces

It is also possible to dynamically create namespaces, either with a regular expression:

```js
io.of(/^\/dynamic-\d+$/);
```

or with a function:

```js
io.of((name, auth, next) => {
  next(null, true); // or false, when the creation is denied
});
```

You can have access to the new namespace in the `connection` event:

```js
io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
  const namespace = socket.nsp;
});
```

The return value of the `of()` method is what we call the parent namespace, from which you can:

- register [middlewares](/docs/v4/middlewares/)

```js
const parentNamespace = io.of(/^\/dynamic-\d+$/);

parentNamespace.use((socket, next) => { next() });
```

The middleware will automatically be registered on each child namespace.

- [broadcast](/docs/v4/broadcasting-events/) events

```js
const parentNamespace = io.of(/^\/dynamic-\d+$/);

parentNamespace.emit("hello"); // will be sent to users in /dynamic-1, /dynamic-2, ...
```

## Complete API

The complete API exposed by the Namespace instance can be found [here](/docs/v4/server-api/#Namespace).
