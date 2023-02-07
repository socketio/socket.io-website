---
title: Middlewares
sidebar_position: 5
slug: /middlewares/
---

A middleware function is a function that gets executed for every incoming connection.

Middleware functions can be useful for:

- logging
- authentication / authorization
- rate limiting

Note: this function will be executed only once per connection (even if the connection consists in multiple HTTP requests).

:::info

If you are looking for Express middlewares, please check [this section](#compatibility-with-express-middleware).

:::

## Registering a middleware

A middleware function has access to the [Socket instance](server-socket-instance.md) and to the next registered middleware function.

```js
io.use((socket, next) => {
  if (isValid(socket.request)) {
    next();
  } else {
    next(new Error("invalid"));
  }
});
```

You can register several middleware functions, and they will be executed sequentially:

```js
io.use((socket, next) => {
  next();
});

io.use((socket, next) => {
  next(new Error("thou shall not pass"));
});

io.use((socket, next) => {
  // not executed, since the previous middleware has returned an error
  next();
});
```

Please make sure to call `next()` in any case. Otherwise, the connection will be left hanging until it is closed after a given timeout.

**Important note**: the Socket instance is not actually connected when the middleware gets executed, which means that no `disconnect` event will be emitted if the connection eventually fails.

For example, if the client manually closes the connection:

```js
// server-side
io.use((socket, next) => {
  setTimeout(() => {
    // next is called after the client disconnection
    next();
  }, 1000);

  socket.on("disconnect", () => {
    // not triggered
  });
});

io.on("connection", (socket) => {
  // not triggered
});

// client-side
const socket = io();
setTimeout(() => {
  socket.disconnect();
}, 500);
```

## Sending credentials

The client can send credentials with the `auth` option:

```js
// plain object
const socket = io({
  auth: {
    token: "abc"
  }
});

// or with a function
const socket = io({
  auth: (cb) => {
    cb({
      token: "abc"
    });
  }
});
```

Those credentials can be accessed in the [handshake](server-socket-instance.md#sockethandshake) object on the server-side:

```js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // ...
});
```

## Handling middleware error

If the `next` method is called with an Error object, the connection will be refused and the client will receive an `connect_error` event.

```js
// client-side
socket.on("connect_error", (err) => {
  console.log(err.message); // prints the message associated with the error
});
```

You can attach additional details to the Error object:

```js
// server-side
io.use((socket, next) => {
  const err = new Error("not authorized");
  err.data = { content: "Please retry later" }; // additional details
  next(err);
});

// client-side
socket.on("connect_error", (err) => {
  console.log(err instanceof Error); // true
  console.log(err.message); // not authorized
  console.log(err.data); // { content: "Please retry later" }
});
```

## Compatibility with Express middleware

Since they are not bound to a usual HTTP request/response cycle, Socket.IO middlewares are not really compatible with [Express middlewares](https://expressjs.com/en/guide/using-middleware.html).

That being said, starting with version `4.6.0`, Express middlewares are now supported by the underlying engine:

```js
io.engine.use((req, res, next) => {
  // do something

  next();
});
```

The middlewares will be called for each incoming HTTP requests, including upgrade requests.

Example with [`express-session`](https://www.npmjs.com/package/express-session):

```js
import session from "express-session";

io.engine.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
```

Example with [`helmet`](https://www.npmjs.com/package/helmet):

```js
import helmet from "helmet";

io.engine.use(helmet());
```
