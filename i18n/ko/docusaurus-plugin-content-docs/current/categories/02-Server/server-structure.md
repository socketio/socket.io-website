---
title: 애플리케이션 구조
sidebar_position: 9
slug: /server-application-structure/
---

## 이벤트 핸들러 등록하기 {#registering-event-handlers}

이벤트 핸들러를 등록하는 방법을 두 가지 제안합니다.

어디까지나 제안일 뿐 반드시 따라야 하는 엄격한 규칙은 아닙니다. 원하는 방식에 맞게 바꿔 쓰세요.

### 파일마다 각자의 이벤트 핸들러 등록하기 {#each-file-registers-its-own-event-handlers}

이 방식은 진입점이 깔끔하게 유지되지만, 이벤트 리스너를 찾기는 조금 어려울 수 있습니다. 다만 일관된 네이밍 규칙을 쓰거나 ctrl+f로 검색하면 도움이 됩니다.

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

### 모든 이벤트 핸들러를 `index.js` 파일에서 등록하기 {#all-event-handlers-are-registered-in-the-indexjs-file}

이 방식은 모든 이벤트 이름이 한곳에 모여 있어 찾기 쉽지만, 중대형 애플리케이션에서는 관리하기 어려워질 수 있습니다.

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
    const socket = this; // 화살표 함수로는 동작하지 않으므로 바로 위 줄에서 'function'을 사용합니다
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
