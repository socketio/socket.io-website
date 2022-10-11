---
title: 中间件
sidebar_position: 5
slug: /middlewares/
---

中间件函数是为每个传入连接执行的函数。

中间件函数可用于：

- logging
- authentication / authorization
- rate limiting

Note: this function will be executed only once per connection (even if the connection consists in multiple HTTP requests).

## 注册中间件 {#registering-a-middleware}

中间件函数可以访问[Socket 实例](server-socket-instance.md)和下一个注册的中间件函数。

```js
io.use((socket, next) => {
  if (isValid(socket.request)) {
    next();
  } else {
    next(new Error("invalid"));
  }
});
```

您可以注册几个中间件函数，它们将按顺序执行：

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

请确保在任何情况下都调用`next（）`。 否则，连接将一直挂起，直到在给定超时后关闭。

**重要提示**：执行中间件时，Socket 实例实际上并未连接，这意味着`disconnect`如果连接最终失败，则不会发出任何事件。

例如，如果客户端手动关闭连接：

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

## 发送凭据 {#sending-credentials}

`auth`客户端可以使用以下选项发送凭据：

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

可以在服务器端的[握手](server-socket-instance.md#sockethandshake)对象中访问这些凭据：

```js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // ...
});
```

## 处理中间件错误 {#handling-middleware-error}

如果`next`使用 Error 对象调用该方法，则连接将被拒绝并且客户端将收到一个`connect_error`事件。

```js
// client-side
socket.on("connect_error", (err) => {
  console.log(err.message); // prints the message associated with the error
});
```

您可以将其他详细信息附加到错误对象：

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

## 与Express中间件的兼容性 {#compatibility-with-express-middleware}

大多数现有的[Express 中间件](http://expressjs.com/en/resources/middleware.html)模块应该与 Socket.IO 兼容，您只需要一个小包装函数来使方法签名匹配：

```js
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
```

结束请求-响应周期并且不调用的中间件函数`next()`将不起作用。

[express-session](https://www.npmjs.com/package/express-session)示例：

```js
const session = require("express-session");

io.use(wrap(session({ secret: "cats" })));

io.on("connection", (socket) => {
  const session = socket.request.session;
});
```

[Passport](http://www.passportjs.org/)示例：

```js
const session = require("express-session");
const passport = require("passport");

io.use(wrap(session({ secret: "cats" })));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error("unauthorized"))
  }
});
```

可以在[此处](https://github.com/socketio/socket.io/tree/master/examples/passport-example)找到 Passport 的完整示例。
