---
title: 应用结构
sidebar_position: 9
slug: /server-application-structure/
---

## 注册事件处理程序 {#registering-event-handlers}

您将在下面找到关于如何注册事件处理程序的两个建议。

请注意，这些只是建议，而不是您必须遵循的严格准则。请根据自己的喜好进行调整！

### 每个文件注册自己的事件处理程序 {#each-file-registers-its-own-event-handlers}

在这里，入口点保持整洁，但事件侦听器可能不太容易被发现（尽管强命名约定/ctrl+f 会有所帮助）。

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

### 所有事件处理程序都注册在 `index.js` 文件中 {#all-event-handlers-are-registered-in-the-indexjs-file}

在这里，每个事件名称都位于同一个位置，这对可发现性非常有用，但在中/大型应用程序中可能会失控。

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
