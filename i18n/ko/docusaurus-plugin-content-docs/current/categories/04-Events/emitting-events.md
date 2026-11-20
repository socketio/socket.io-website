---
title: 이벤트 보내기
sidebar_position: 1
slug: /emitting-events/
---

서버와 클라이언트 사이에 이벤트를 보내는 방법은 여러 가지입니다.

:::tip

TypeScript 사용자는 이벤트에 타입 힌트를 지정할 수 있습니다. 자세한 내용은 [TypeScript](../01-Documentation/typescript.md) 문서를 참고하세요.

:::

## 기본적인 emit {#basic-emit}

Socket.IO API는 Node.js [EventEmitter](https://nodejs.org/docs/latest/api/events.html#events_events)에서 영감을 받았습니다. 따라서 한쪽에서 이벤트를 보내고 다른 쪽에서 리스너를 등록할 수 있습니다.

*서버*

```js
io.on("connection", (socket) => {
  socket.emit("hello", "world");
});
```

*클라이언트*

```js
socket.on("hello", (arg) => {
  console.log(arg); // world
});
```

반대 방향으로도 똑같이 동작합니다.

*서버*

```js
io.on("connection", (socket) => {
  socket.on("hello", (arg) => {
    console.log(arg); // world
  });
});
```

*클라이언트*

```js
socket.emit("hello", "world");
```

인자는 개수에 제한 없이 보낼 수 있습니다. [Buffer](https://nodejs.org/docs/latest/api/buffer.html#buffer_buffer)나 [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) 같은 바이너리 객체를 포함해 직렬화할 수 있는 데이터 구조는 모두 지원합니다.

*서버*

```js
io.on("connection", (socket) => {
  socket.emit("hello", 1, "2", { 3: '4', 5: Buffer.from([6]) });
});
```

*클라이언트*

```js
// 클라이언트 측
socket.on("hello", (arg1, arg2, arg3) => {
  console.log(arg1); // 1
  console.log(arg2); // "2"
  console.log(arg3); // { 3: '4', 5: ArrayBuffer (1) [ 6 ] }
});
```

객체에 `JSON.stringify()`를 직접 실행할 필요가 없습니다. Socket.IO가 알아서 처리합니다.

```js
// 나쁜 예
socket.emit("hello", JSON.stringify({ name: "John" }));

// 좋은 예
socket.emit("hello", { name: "John" });
```

참고:

- [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) 객체는 `1970-01-01T00:00:00.000Z`처럼 문자열 표현으로 변환되며, 받는 쪽에서도 문자열로 받습니다.

- [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)과 [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)은 직접 직렬화해야 합니다.

```js
const serializedMap = [...myMap.entries()];
const serializedSet = [...mySet.keys()];
```

- [`toJSON()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior) 메서드로 객체의 직렬화 방식을 바꿀 수 있습니다.

클래스를 사용한 예시:

```js
class Hero {
  #hp;

  constructor() {
    this.#hp = 42;
  }

  toJSON() {
    return { hp: this.#hp };
  }
}

socket.emit("here's a hero", new Hero());
```

## 확인 응답 {#acknowledgements}

이벤트도 좋지만, 좀 더 전통적인 요청-응답 방식의 API가 필요할 때도 있습니다. Socket.IO에서는 이 기능을 확인 응답(acknowledgement)이라고 부릅니다.

`emit()`의 마지막 인자로 콜백을 추가하면, 상대편이 이벤트를 확인했을 때 이 콜백이 호출됩니다.

*서버*

```js
io.on("connection", (socket) => {
  socket.on("update item", (arg1, arg2, callback) => {
    console.log(arg1); // 1
    console.log(arg2); // { name: "updated" }
    callback({
      status: "ok"
    });
  });
});
```

*클라이언트*

```js
socket.emit("update item", "1", { name: "updated" }, (response) => {
  console.log(response.status); // ok
});
```

## 타임아웃 지정하기 {#with-timeout}

Socket.IO v4.4.0부터는 각 emit에 타임아웃을 지정할 수 있습니다.

```js
socket.timeout(5000).emit("my-event", (err) => {
  if (err) {
    // 상대편이 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  }
});
```

타임아웃과 [확인 응답](#acknowledgements)을 함께 사용할 수도 있습니다.

```js
socket.timeout(5000).emit("my-event", (err, response) => {
  if (err) {
    // 상대편이 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(response);
  }
});
```

## 휘발성 이벤트 {#volatile-events}

휘발성 이벤트(volatile event)는 내부 연결이 준비되지 않았으면 보내지 않는 이벤트입니다. 신뢰성 측면에서는 [UDP](https://en.wikipedia.org/wiki/User_Datagram_Protocol)와 어느 정도 비슷합니다.

예를 들어 온라인 게임에서 캐릭터의 위치를 보내야 할 때 유용합니다. 최신 값만 의미가 있기 때문입니다.

```js
socket.volatile.emit("hello", "might or might not be received");
```

클라이언트가 연결되어 있지 않을 때 이벤트를 버리는 용도로도 쓸 수 있습니다(기본적으로 이벤트는 재연결될 때까지 버퍼에 쌓입니다).

예시:

*서버*

```js
io.on("connection", (socket) => {
  console.log("connect");

  socket.on("ping", (count) => {
    console.log(count);
  });
});
```

*클라이언트*

```js
let count = 0;
setInterval(() => {
  socket.volatile.emit("ping", ++count);
}, 1000);
```

서버를 재시작하면 콘솔에 다음과 같이 출력됩니다.

```
connect
1
2
3
4
# 서버가 재시작되고, 클라이언트가 자동으로 재연결합니다
connect
9
10
11
```

`volatile` 플래그가 없으면 다음과 같이 출력됩니다.

```
connect
1
2
3
4
# 서버가 재시작되고, 클라이언트가 자동으로 재연결한 뒤 버퍼에 쌓인 이벤트를 보냅니다
connect
5
6
7
8
9
10
11
```
