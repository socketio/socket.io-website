---
title: "튜토리얼 - API 개요"
sidebar_label: "API 개요"
slug: api-overview
toc_max_heading_level: 4
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# API 개요

다음으로 넘어가기 전에 Socket.IO가 제공하는 API를 간단히 살펴봅시다.

## 공통 API {#common-api}

다음 메서드는 클라이언트와 서버 양쪽에서 사용할 수 있습니다.

### 기본적인 emit {#basic-emit}

[4단계](05-emitting-events.md)에서 본 것처럼 `socket.emit()`으로 상대편에 어떤 데이터든 보낼 수 있습니다.

<Tabs>
  <TabItem value="From client to server" label="클라이언트 → 서버">

*클라이언트*

```js
socket.emit('hello', 'world');
```

*서버*

```js
io.on('connection', (socket) => {
  socket.on('hello', (arg) => {
    console.log(arg); // 'world'
  });
});
```

  </TabItem>
  <TabItem value="From server to client" label="서버 → 클라이언트">

*서버*

```js
io.on('connection', (socket) => {
  socket.emit('hello', 'world');
});
```

*클라이언트*

```js
socket.on('hello', (arg) => {
  console.log(arg); // 'world'
});
```

  </TabItem>
</Tabs>

인자는 개수 제한 없이 보낼 수 있습니다. 직렬화할 수 있는 데이터 구조는 모두 지원하며 [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [Buffer](https://nodejs.org/docs/latest/api/buffer.html#buffer_buffer)(Node.js 전용) 같은 바이너리 객체도 보낼 수 있습니다.

<Tabs>
  <TabItem value="From client to server" label="클라이언트 → 서버">

*클라이언트*

```js
socket.emit('hello', 1, '2', { 3: '4', 5: Uint8Array.from([6]) });
```

*서버*

```js
io.on('connection', (socket) => {
  socket.on('hello', (arg1, arg2, arg3) => {
    console.log(arg1); // 1
    console.log(arg2); // '2'
    console.log(arg3); // { 3: '4', 5: <Buffer 06> }
  });
});
```

  </TabItem>
  <TabItem value="From server to client" label="서버 → 클라이언트">

*서버*

```js
io.on('connection', (socket) => {
  socket.emit('hello', 1, '2', { 3: '4', 5: Buffer.from([6]) });
});
```

*클라이언트*

```js
socket.on('hello', (arg1, arg2, arg3) => {
  console.log(arg1); // 1
  console.log(arg2); // '2'
  console.log(arg3); // { 3: '4', 5: ArrayBuffer (1) [ 6 ] }
});
```

  </TabItem>
</Tabs>

:::tip

객체에 `JSON.stringify()`를 호출할 필요가 없습니다.

```js
// 나쁜 예
socket.emit('hello', JSON.stringify({ name: 'John' }));

// 좋은 예
socket.emit('hello', { name: 'John' });
```

:::

### 확인 응답 {#acknowledgements}

이벤트는 편리하지만 좀 더 전통적인 요청-응답 방식의 API가 필요할 때도 있습니다. Socket.IO에서는 이 기능을 "확인 응답(acknowledgement)"이라고 합니다.

확인 응답은 두 가지 방식으로 사용할 수 있습니다.

#### 콜백 함수 사용하기 {#with-a-callback-function}

`emit()`의 마지막 인자로 콜백을 추가할 수 있습니다. 이 콜백은 상대편이 이벤트에 확인 응답을 보내면 호출됩니다.

<Tabs>
  <TabItem value="From client to server" label="클라이언트 → 서버">

*클라이언트*

```js
socket.timeout(5000).emit('request', { foo: 'bar' }, 'baz', (err, response) => {
  if (err) {
    // 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(response.status); // 'ok'
  }
});
```

*서버*

```js
io.on('connection', (socket) => {
  socket.on('request', (arg1, arg2, callback) => {
    console.log(arg1); // { foo: 'bar' }
    console.log(arg2); // 'baz'
    callback({
      status: 'ok'
    });
  });
});
```

  </TabItem>
  <TabItem value="From server to client" label="서버 → 클라이언트">

*서버*

```js
io.on('connection', (socket) => {
  socket.timeout(5000).emit('request', { foo: 'bar' }, 'baz', (err, response) => {
    if (err) {
      // 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
    } else {
      console.log(response.status); // 'ok'
    }
  });
});
```

*클라이언트*

```js
socket.on('request', (arg1, arg2, callback) => {
  console.log(arg1); // { foo: 'bar' }
  console.log(arg2); // 'baz'
  callback({
    status: 'ok'
  });
});
```

  </TabItem>
</Tabs>

#### Promise 사용하기 {#with-a-promise}

`emitWithAck()` 메서드도 같은 기능을 제공하지만 Promise를 반환합니다. 이 Promise는 상대편이 이벤트에 확인 응답을 보내면 resolve됩니다.

<Tabs>
  <TabItem value="From client to server" label="클라이언트 → 서버">

*클라이언트*

```js
try {
  const response = await socket.timeout(5000).emitWithAck('request', { foo: 'bar' }, 'baz');
  console.log(response.status); // 'ok'
} catch (e) {
  // 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
}
```

*서버*

```js
io.on('connection', (socket) => {
  socket.on('request', (arg1, arg2, callback) => {
    console.log(arg1); // { foo: 'bar' }
    console.log(arg2); // 'baz'
    callback({
      status: 'ok'
    });
  });
});
```

  </TabItem>
  <TabItem value="From server to client" label="서버 → 클라이언트">

*서버*

```js
io.on('connection', async (socket) => {
  try {
    const response = await socket.timeout(5000).emitWithAck('request', { foo: 'bar' }, 'baz');
    console.log(response.status); // 'ok'
  } catch (e) {
    // 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  }
});
```

*클라이언트*

```js
socket.on('request', (arg1, arg2, callback) => {
  console.log(arg1); // { foo: 'bar' }
  console.log(arg2); // 'baz'
  callback({
    status: 'ok'
  });
});
```

  </TabItem>
</Tabs>

:::caution

Internet Explorer처럼 [Promise를 지원하지 않는](https://caniuse.com/promises) 환경에서 이 기능을 쓰려면 폴리필을 추가하거나 [Babel](https://babeljs.io/) 같은 컴파일러를 사용해야 합니다. 다만 이 튜토리얼에서는 이 내용을 다루지 않습니다.

:::

### 모든 이벤트를 받는 리스너 {#catch-all-listeners}

모든 이벤트를 받는 리스너(catch-all listener)는 어떤 이벤트가 들어오든 호출됩니다. 애플리케이션을 디버깅할 때 유용합니다.

*송신 측*

```js
socket.emit('hello', 1, '2', { 3: '4', 5: Uint8Array.from([6]) });
```

*수신 측*

```js
socket.onAny((eventName, ...args) => {
  console.log(eventName); // 'hello'
  console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
});
```

나가는 패킷에도 같은 방식으로 리스너를 등록할 수 있습니다.

```js
socket.onAnyOutgoing((eventName, ...args) => {
  console.log(eventName); // 'hello'
  console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
});
```

## 서버 API {#server-api}

### 브로드캐스팅 {#broadcasting}

[5단계](06-broadcasting.md)에서 본 것처럼 `io.emit()`으로 연결된 모든 클라이언트에 이벤트를 브로드캐스트할 수 있습니다.

```js
io.emit('hello', 'world');
```

<ThemedImage
  alt="연결된 모든 클라이언트에 'hello' 이벤트를 보내는 모습"
  sources={{
    light: useBaseUrl('/images/tutorial/broadcasting.png'),
    dark: useBaseUrl('/images/tutorial/broadcasting-dark.png'),
  }}
/>

### 룸 {#rooms}

Socket.IO에서 *룸*(room)은 소켓이 들어가고 나갈 수 있는 임의의 채널을 말합니다. 룸을 사용하면 연결된 클라이언트 중 일부에만 이벤트를 브로드캐스트할 수 있습니다.

```js
io.on('connection', (socket) => {
  // 'some room'이라는 룸에 들어갑니다
  socket.join('some room');
  
  // 룸에 있는 연결된 모든 클라이언트에 브로드캐스트합니다
  io.to('some room').emit('hello', 'world');

  // 룸에 없는 연결된 모든 클라이언트에 브로드캐스트합니다
  io.except('some room').emit('hello', 'world');

  // 룸에서 나갑니다
  socket.leave('some room');
});
```

<ThemedImage
  alt="대상 룸에 있는 연결된 모든 클라이언트에 'hello' 이벤트를 보내는 모습"
  sources={{
    light: useBaseUrl('/images/tutorial/room.png'),
    dark: useBaseUrl('/images/tutorial/room-dark.png'),
  }}
/>

기본적인 내용은 이게 전부입니다! 전체 API는 나중에 [서버 API](../server-api.md)와 [클라이언트 API](../client-api.md) 문서에서 찾아볼 수 있습니다.
