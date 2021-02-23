title: The Server instance
permalink: /docs/v3/server-instance/
release: v3
type: docs
order: 203
---

The Server instance (often called `io` in the code examples) has a few attributes that may be of use in your application.

It also inherits all the methods of the [main namespace](/docs/v3/namespaces/#Main-namespace), like [`namespace.use()`](/docs/v3/server-api/#namespace-use-fn) (see [here](/docs/v3/middlewares/)) or [`namespace.allSockets()`](/docs/v3/server-api/#namespace-allSockets).

## Server#engine

A reference to the underlying Engine.IO server.

It can be used to fetch the number of currently connected clients:

```js
const count = io.engine.clientsCount;
// may or may not be similar to the count of Socket instances in the main namespace, depending on your usage
const count2 = io.of("/").sockets.size;
```

Or to generate a custom session ID (the `sid` query parameter):

```js
const uuid = require("uuid");

io.engine.generateId = (req) => {
  return uuid.v4(); // must be unique across all Socket.IO servers
}
```

## Events

The Server instance emits one single event (well, technically two, but `connect` is an alias for `connection`):

- [`connection`](#connection)

### `connection`

This event is fired upon a new connection. The first argument is a [Socket instance](/docs/v3/server-socket-instance/).

```js
io.on("connection", (socket) => {
  // ...
});
```

## Complete API

The complete API exposed by the Server instance can be found [here](/docs/v3/server-api/#Server).
