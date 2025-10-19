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

## Registering a middleware {#registering-a-middleware}

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

## Sending credentials {#sending-credentials}

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

## Handling middleware error {#handling-middleware-error}

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

## Connections rate limiting {#connections-rate-limiting}

Limit number of connections per period of time.

```js
const { RateLimiterMemory } = require('rate-limiter-flexible');

// 5 connections per minute for authorized users
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

io.use(async (socket, next) => {
  const authToken = socket.handshake.auth ? socket.handshake.auth.token : null
  const uniqStr = authToken || socket.handshake.address;
  const pointsToConsume = authToken ? 1 : 5 // consume 5 points for not authorized users - stricter limits

  try {
    await rateLimiter.consume(uniqStr, pointsToConsume);
    next();
  } catch (error) {
    next(new Error('Connections rate limit exceeded'));
  }
});
```

For distributed environments, use one of the store limiters from [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible).

## Compatibility with Express middleware {#compatibility-with-express-middleware}

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

If the middleware must be only applied to the handshake request (and not for each HTTP request), you can check for the existence of the `sid` query parameter.

Example with [`passport-jwt`](https://www.npmjs.com/package/passport-jwt):

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
