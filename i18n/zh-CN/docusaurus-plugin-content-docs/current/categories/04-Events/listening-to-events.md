---
title: 监听事件
sidebar_position: 2
slug: /listening-to-events/
---

有几种方法可以处理在服务器和客户端之间传输的事件。

## EventEmitter 方法 {#eventemitter-methods}

在服务器端，Socket 实例扩展了 Node.js [EventEmitter](https://nodejs.org/docs/latest/api/events.html#events_events)类。

在客户端，Socket 实例使用[component-emitter](https://github.com/component/emitter)库提供的​​事件发射器，它公开了 EventEmitter 方法的子集。

### socket.on(eventName, listener) {#socketoneventname-listener}

将*侦听器*函数添加到名为*eventName*的事件的侦听器数组的末尾。

```js
socket.on("details", (...args) => {
  // ...
});
```

### socket.once(eventName, listener) {#socketonceeventname-listener}

为名为*eventName*的事件添加**一次性**监听函数

```js
socket.once("details", (...args) => {
  // ...
});
```

### socket.off(eventName, listener) {#socketoffeventname-listener}

从名为*eventName*的事件的侦听器数组中移除指定的*侦听器*。

```js
const listener = (...args) => {
  console.log(args);
}

socket.on("details", listener);

// and then later...
socket.off("details", listener);
```

### socket.removeAllListeners([eventName]) {#socketremovealllistenerseventname}

删除所有侦听器，或指定*eventName*的侦听器。

```js
// for a specific event
socket.removeAllListeners("details");
// for all events
socket.removeAllListeners();
```

## Catch-all 侦听器 {#catch-all-listeners}

从 Socket.IO v3 开始，受[EventEmitter2](https://github.com/EventEmitter2/EventEmitter2)库启发的新 API 允许声明 Catch-all 侦听器。

此功能在客户端和服务器上均可用。

### socket.onAny(listener) {#socketonanylistener}

添加一个监听器，当任何事件发出时将被触发。

```js
socket.onAny((eventName, ...args) => {
  // ...
});
```

### socket.prependAny(listener) {#socketprependanylistener}

添加一个监听器，当任何事件发出时将被触发。侦听器被添加到侦听器数组的开头。

```js
socket.prependAny((eventName, ...args) => {
  // ...
});
```

### socket.offAny([listener]) {#socketoffanylistener}

删除所有catch-all侦听器或给定的侦听器。

```js
const listener = (eventName, ...args) => {
  console.log(eventName, args);
}

socket.onAny(listener);

// and then later...
socket.offAny(listener);

// or all listeners
socket.offAny();
```

## 验证 {#validation}

事件参数的验证超出了 Socket.IO 库的范围。

JS 生态系统中有许多包涵盖了这个用例，其中包括：

- [joi](https://www.npmjs.com/package/joi)
- [ajv](https://www.npmjs.com/package/ajv)
- [validatorjs](https://www.npmjs.com/package/validatorjs)

带有[joi](https://joi.dev/api/)和[acknowledgements](emitting-events.md#acknowledgements)的示例：

```js
const Joi = require("joi");

const userSchema = Joi.object({
  username: Joi.string().max(30).required(),
  email: Joi.string().email().required()
});

io.on("connection", (socket) => {
  socket.on("create user", (payload, callback) => {
    if (typeof callback !== "function") {
      // not an acknowledgement
      return socket.disconnect();
    }
    const { error, value } = userSchema.validate(payload);
    if (error) {
      return callback({
        status: "KO",
        error
      });
    }
    // do something with the value, and then
    callback({
      status: "OK"
    });
  });

});
```

## 错误处理 {#error-handling}

Socket.IO 库中目前没有内置的错误处理，这意味着您必须捕获任何可能在侦听器中引发的错误。

```js
io.on("connection", (socket) => {
  socket.on("list items", async (callback) => {
    try {
      const items = await findItems();
      callback({
        status: "OK",
        items
      });
    } catch (e) {
      callback({
        status: "NOK"
      });
    }
  });
});
```

在服务器端，使用`EventEmitter.captureRejections = true`（实验性，请参见[此处](https://nodejs.org/api/events.html#events_capture_rejections_of_promises)）也可能很有趣，具体取决于您的用例。

```js
require("events").captureRejections = true;

io.on("connection", (socket) => {
  socket.on("list products", async () => {
    const products = await findProducts();
    socket.emit("products", products);
  });

  socket[Symbol.for('nodejs.rejection')] = (err) => {
    socket.emit("error", err);
  };
});
```
