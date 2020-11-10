title: Namespaces
permalink: /docs/v3/namespaces/
alias: /docs/namespaces/
release: v3
type: docs
order: 204
---

A Namespace is a communication channel that allows you to split the logic of your application over a single shared connection.

![Namespace diagram](/images/namespaces.png)

Possible use cases:

- you want to create an admin namespace that only authorized users have access to, so the logic related to those users is separated from the rest of the application

```js
const adminNamespace = io.of('/admin');

adminNamespace.use((socket, next) => {
  // ensure the user has sufficient rights
  next();
});

adminNamespace.on('connection', socket => {
  socket.on('delete user', () => {
    // ...
  });
});
```

- your application has multiple tenants so you want to dynamically create one namespace per tenant

```js
const workspaces = io.of(/^\/\w+$/);

workspaces.on('connection', socket => {
  const workspace = socket.nsp;

  workspace.emit('hello');
});

// this middleware will be assigned to each namespace
workspaces.use((socket, next) => {
  // ensure the user has access to the workspace
  next();
});
```

## Default namespace

We call the default namespace `/` and it’s the one Socket.IO clients connect to by default, and the one the server listens to by default.

This namespace is identified by `io.sockets` or simply `io`:

```js
// the following two will emit to all the sockets connected to `/`
io.sockets.emit('hi', 'everyone');
io.emit('hi', 'everyone'); // short form
```

Each namespace emits a `connection` event that receives each `Socket` instance as a parameter

```js
io.on('connection', socket => {
  socket.on('disconnect', () => {});
});
```

## Custom namespaces

To set up a custom namespace, you can call the `of` function on the server-side:

```js
const nsp = io.of('/my-namespace');

nsp.on('connection', socket => {
  console.log('someone connected');
});

nsp.emit('hi', 'everyone!');
```

On the client side, you tell Socket.IO client to connect to that namespace:

```js
const socket = io('/my-namespace');
```

**Important note:** The namespace is an implementation detail of the Socket.IO protocol, and is not related to the actual URL of the underlying transport, which defaults to `/socket.io/…`.

## Namespace middleware

A middleware is a function that gets executed for every incoming Socket, and receives as parameters the socket and a function to optionally defer execution to the next registered middleware. A Socket.IO middleware is very similar to what you can find in [Express](http://expressjs.com/en/guide/using-middleware.html).

```js
// registers a middleware for the default namespace
io.use((socket, next) => {
  if (isValid(socket.request)) {
    next();
  } else {
    next(new Error('invalid'));
  }
});

// registers a middleware for a custom namespace
io.of('/admin').use(async (socket, next) => {
  const user = await fetchUser(socket.handshake.query);
  if (user.isAdmin) {
    socket.user = user;
    next();
  } else {
    next(new Error('forbidden'));
  }
});
```

You can register several middleware functions for the same namespace. They will be executed sequentially:

```js
io.use((socket, next) => {
  next();
});

io.use((socket, next) => {
  next(new Error('thou shall not pass'));
});

io.use((socket, next) => {
  // not executed, since the previous middleware has returned an error
  next();
});
```

## Handling middleware error

If the `next` method is called with an Error object, the client will receive an `error` event.

```js
import { io } from 'socket.io-client';

const socket = io();

socket.on('error', (reason) => {
  console.log(reason); // prints the message associated with the error, e.g. "thou shall not pass" in the example above
});
```

## Compatibility with Express middleware

Most existing [Express middleware](http://expressjs.com/en/resources/middleware.html) modules should be compatible with Socket.IO, you just need a little wrapper function to make the method signatures match:

```js
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
```

The middleware functions that end the request-response cycle and do not call `next()` will not work though.

Example with [express-session](https://www.npmjs.com/package/express-session):

```js
const session = require('express-session');

io.use(wrap(session({ secret: 'cats' })));

io.on('connect', (socket) => {
  const session = socket.request.session;
});
```

Example with [Passport](http://www.passportjs.org/):

```js
const session = require('express-session');
const passport = require('passport');

io.use(wrap(session({ secret: 'cats' })));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error('unauthorized'))
  }
});
```

A complete example with Passport can be found [here](https://github.com/socketio/socket.io/tree/master/examples/passport-example).
