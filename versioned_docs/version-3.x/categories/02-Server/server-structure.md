---
title: Application structure
sidebar_position: 9
slug: /server-application-structure/
---

## Registering event handlers

You will find below two suggestions on how to register your event handlers.

Please note that these are merely suggestions and not strict guidelines that you must follow. Please adapt it to your own liking!

### Each file registers its own event handlers

Here, the entrypoint is kept tidy, but the event listeners may be less discoverable (though strong naming convention/ctrl+f will help).

`index.js`

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer);

const registerOrderHandlers = require("./orderHandler");
const registerUserHandlers = require("./userHandler");

const onConnection = (socket) => {
  registerOrderHandlers(io, socket);
  registerUserHandlers(io, socket);
}

io.on("connection", onConnection);
```

`orderHandler.js`

```js
module.exports = (io, socket) => {
  const createOrder = (payload) => {
    // ...
  }

  const readOrder = (orderId, callback) => {
    // ...
  }

  socket.on("order:create", createOrder);
  socket.on("order:read", readOrder);
}
```

### All event handlers are registered in the `index.js` file

Here, each event name is located in the same place, which is great for discoverability, but could get out of hand in a medium/big application.

`index.js`

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer);

const { createOrder, readOrder } = require("./orderHandler")(io);
const { updatePassword } = require("./userHandler")(io);

const onConnection = (socket) => {
  socket.on("order:create", createOrder);
  socket.on("order:read", readOrder);

  socket.on("user:update-password", updatePassword);
}

io.on("connection", onConnection);
```

`orderHandler.js`

```js
module.exports = (io) => {
  const createOrder = function (payload) {
    const socket = this; // hence the 'function' above, as an arrow function will not work
    // ...
  };

  const readOrder = function (orderId, callback) {
    // ...
  };

  return {
    createOrder,
    readOrder
  }
}
```
