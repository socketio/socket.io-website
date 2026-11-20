---
title: 이벤트 수신하기
sidebar_position: 2
slug: /listening-to-events/
---

서버와 클라이언트 사이에 오가는 이벤트를 처리하는 방법은 여러 가지입니다.

## EventEmitter 메서드 {#eventemitter-methods}

서버 측의 Socket 인스턴스는 Node.js [EventEmitter](https://nodejs.org/docs/latest/api/events.html#events_events) 클래스를 확장합니다.

클라이언트 측의 Socket 인스턴스는 [component-emitter](https://github.com/component/emitter) 라이브러리의 이벤트 이미터를 사용합니다. 이 라이브러리는 EventEmitter 메서드 중 일부를 제공합니다.

### socket.on(eventName, listener) {#socketoneventname-listener}

*eventName* 이벤트의 리스너 배열 끝에 *listener* 함수를 추가합니다.

```js
socket.on("details", (...args) => {
  // ...
});
```

### socket.once(eventName, listener) {#socketonceeventname-listener}

*eventName* 이벤트에 **한 번만 실행되는** *listener* 함수를 추가합니다.

```js
socket.once("details", (...args) => {
  // ...
});
```

### socket.off(eventName, listener) {#socketoffeventname-listener}

*eventName* 이벤트의 리스너 배열에서 지정한 *listener*를 제거합니다.

```js
const listener = (...args) => {
  console.log(args);
}

socket.on("details", listener);

// 그리고 나중에...
socket.off("details", listener);
```

### socket.removeAllListeners([eventName]) {#socketremovealllistenerseventname}

모든 리스너를 제거합니다. *eventName*을 지정하면 그 이벤트의 리스너만 제거합니다.

```js
// 특정 이벤트의 리스너 제거
socket.removeAllListeners("details");
// 모든 이벤트의 리스너 제거
socket.removeAllListeners();
```

## 모든 이벤트를 받는 리스너 {#catch-all-listeners}

Socket.IO v3부터는 새 API로 모든 이벤트를 받는 리스너(catch-all listener)를 선언할 수 있습니다. 이 API는 [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) 라이브러리에서 영감을 받았습니다.

이 기능은 클라이언트와 서버 양쪽에서 사용할 수 있습니다.

### socket.onAny(listener) {#socketonanylistener}

어떤 이벤트든 받으면 실행되는 리스너를 추가합니다.

```js
socket.onAny((eventName, ...args) => {
  // ...
});
```

:::caution

[확인 응답(acknowledgement)](./emitting-events.md#acknowledgements)은 catch-all 리스너에 걸리지 않습니다.

```js
socket.emit("foo", (value) => {
  // ...
});

socket.onAnyOutgoing(() => {
  // 이벤트를 보낼 때 실행됩니다
});

socket.onAny(() => {
  // 확인 응답을 받을 때는 실행되지 않습니다
});
```

:::

### socket.prependAny(listener) {#socketprependanylistener}

어떤 이벤트든 받으면 실행되는 리스너를 추가합니다. 이 리스너는 리스너 배열의 맨 앞에 추가됩니다.

```js
socket.prependAny((eventName, ...args) => {
  // ...
});
```

### socket.offAny([listener]) {#socketoffanylistener}

catch-all 리스너를 모두 제거합니다. 리스너를 지정하면 그 리스너만 제거합니다.

```js
const listener = (eventName, ...args) => {
  console.log(eventName, args);
}

socket.onAny(listener);

// 그리고 나중에...
socket.offAny(listener);

// 또는 모든 리스너 제거
socket.offAny();
```

### socket.onAnyOutgoing(listener) {#socketonanyoutgoinglistener}

나가는 패킷용 catch-all 리스너를 새로 등록합니다.

```js
socket.onAnyOutgoing((event, ...args) => {
  // ...
});
```

:::caution

[확인 응답](./emitting-events.md#acknowledgements)은 catch-all 리스너에 걸리지 않습니다.

```js
socket.on("foo", (value, callback) => {
  callback("OK");
});

socket.onAny(() => {
  // 이벤트를 받을 때 실행됩니다
});

socket.onAnyOutgoing(() => {
  // 확인 응답을 보낼 때는 실행되지 않습니다
});
```

:::

### socket.prependAnyOutgoing(listener) {#socketprependanyoutgoinglistener}

나가는 패킷용 catch-all 리스너를 새로 등록합니다. 이 리스너는 리스너 배열의 맨 앞에 추가됩니다.

```js
socket.prependAnyOutgoing((event, ...args) => {
  // ...
});
```

### socket.offAnyOutgoing([listener]) {#socketoffanyoutgoinglistener}

앞서 등록한 리스너를 제거합니다. 리스너를 지정하지 않으면 모든 catch-all 리스너를 제거합니다.

```js
const listener = (eventName, ...args) => {
  console.log(eventName, args);
}

socket.onAnyOutgoing(listener);

// 리스너 하나만 제거
socket.offAnyOutgoing(listener);

// 모든 리스너 제거
socket.offAnyOutgoing();
```

## 유효성 검사 {#validation}

이벤트 인자의 유효성 검사는 Socket.IO 라이브러리가 다루는 범위가 아닙니다.

JS 생태계에는 이 용도에 맞는 패키지가 많습니다. 예를 들면 다음과 같습니다.

- [zod](https://zod.dev/)
- [joi](https://www.npmjs.com/package/joi)
- [ajv](https://www.npmjs.com/package/ajv)
- [validatorjs](https://www.npmjs.com/package/validatorjs)

[joi](https://joi.dev/api/)와 [확인 응답](emitting-events.md#acknowledgements)을 사용한 예시:

```js
const Joi = require("joi");

const userSchema = Joi.object({
  username: Joi.string().max(30).required(),
  email: Joi.string().email().required()
});

io.on("connection", (socket) => {
  socket.on("create user", (payload, callback) => {
    if (typeof callback !== "function") {
      // 확인 응답 콜백이 없습니다
      return socket.disconnect();
    }
    const { error, value } = userSchema.validate(payload);
    if (error) {
      return callback({
        status: "Bad Request",
        error
      });
    }
    // value로 필요한 작업을 한 다음
    callback({
      status: "OK"
    });
  });

});
```

## 오류 처리 {#error-handling}

현재 Socket.IO 라이브러리에는 오류 처리 기능이 내장되어 있지 않습니다. 따라서 리스너에서 발생할 수 있는 오류는 직접 잡아야 합니다.

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

이 코드는 다음과 같이 리팩터링할 수 있습니다.

```js
const errorHandler = (handler) => {
  const handleError = (err) => {
    console.error("please handle me", err);
  };

  return (...args) => {
    try {
      const ret = handler.apply(this, args);
      if (ret && typeof ret.catch === "function") {
        // 비동기 핸들러
        ret.catch(handleError);
      }
    } catch (e) {
      // 동기 핸들러
      handleError(e);
    }
  };
};

// 서버 측 또는 클라이언트 측
socket.on("hello", errorHandler(() => {
  throw new Error("let's panic");
}));
```
