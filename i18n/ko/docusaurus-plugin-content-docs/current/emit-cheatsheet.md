---
title: emit 치트 시트
slug: /emit-cheatsheet/
toc_max_heading_level: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::caution

다음 이벤트 이름은 예약되어 있으므로 애플리케이션에서 사용하면 안 됩니다.

- `connect`
- `connect_error`
- `disconnect`
- `disconnecting`
- `newListener`
- `removeListener`

```js
// 나쁜 예. 오류가 발생합니다
socket.emit("disconnecting");
```

:::

## 서버 {#server}

### 단일 클라이언트 {#single-client}

#### 기본적인 emit {#basic-emit}

```js
io.on("connection", (socket) => {
  socket.emit("hello", 1, "2", { 3: "4", 5: Buffer.from([6]) });
});
```

#### 확인 응답(acknowledgement) {#acknowledgement}

<Tabs>
  <TabItem value="callback" label="콜백" default>

```js
io.on("connection", (socket) => {
  socket.emit("hello", "world", (arg1, arg2, arg3) => {
    // ...
  });
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
io.on("connection", async (socket) => {
  const response = await socket.emitWithAck("hello", "world");
});
```

  </TabItem>
</Tabs>

#### 확인 응답과 타임아웃 {#acknowledgement-and-timeout}

<Tabs>
  <TabItem value="callback" label="콜백" default>

```js
io.on("connection", (socket) => {
  socket.timeout(5000).emit("hello", "world", (err, arg1, arg2, arg3) => {
    if (err) {
      // 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
    } else {
      // ...
    }
  });
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
io.on("connection", async (socket) => {
  try {
    const response = await socket.timeout(5000).emitWithAck("hello", "world");
  } catch (e) {
    // 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  }
});
```

  </TabItem>
</Tabs>

### 브로드캐스팅 {#broadcasting}

#### 연결된 모든 클라이언트에게 {#to-all-connected-clients}

```js
io.emit("hello");
```

#### 발신자를 제외하고 {#except-the-sender}

```js
io.on("connection", (socket) => {
  socket.broadcast.emit("hello");
});
```

#### 확인 응답 {#acknowledgements}

<Tabs>
  <TabItem value="callback" label="콜백" default>

```js
io.timeout(5000).emit("hello", "world", (err, responses) => {
  if (err) {
    // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 클라이언트마다 응답 하나
  }
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
try {
  const responses = await io.timeout(5000).emitWithAck("hello", "world");
  console.log(responses); // 클라이언트마다 응답 하나
} catch (e) {
  // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
}
```

  </TabItem>
</Tabs>

#### 룸에 보내기 {#in-a-room}

- "my room"이라는 룸에 있는 연결된 모든 클라이언트에게

```js
io.to("my room").emit("hello");
```

- "my room" 룸에 있는 클라이언트를 제외한 연결된 모든 클라이언트에게

```js
io.except("my room").emit("hello");
```

- 여러 조건을 함께 사용

```js
io.to("room1").to(["room2", "room3"]).except("room4").emit("hello");
```

#### 네임스페이스에 보내기 {#in-a-namespace}

```js
io.of("/my-namespace").emit("hello");
```

:::tip

modifier는 얼마든지 체이닝할 수 있습니다.

```js
io.of("/my-namespace").on("connection", (socket) => {
  socket
    .timeout(5000)
    .to("room1")
    .to(["room2", "room3"])
    .except("room4")
    .emit("hello", (err, responses) => {
      // ...
    });
});
```

위 코드는 다음 조건에 맞는 연결된 모든 클라이언트에게 "hello" 이벤트를 보냅니다.

- `my-namespace`라는 네임스페이스에 있음
- `room1`, `room2`, `room3` 중 하나 이상의 룸에 있고 `room4`에는 없음
- 발신자는 제외

또한 5초 안에 확인 응답이 오기를 기다립니다.

:::

### 서버 간 {#between-servers}

#### 기본적인 emit {#basic-emit-1}

```js
io.serverSideEmit("hello", "world");
```

받는 쪽:

```js
io.on("hello", (value) => {
  console.log(value); // "world"
});
```

#### 확인 응답 {#acknowledgements-1}

<Tabs>
  <TabItem value="callback" label="콜백" default>

```js
io.serverSideEmit("hello", "world", (err, responses) => {
  if (err) {
    // 일부 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 서버마다 응답 하나(현재 서버 제외)
  }
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
try {
  const responses = await io.serverSideEmitWithAck("hello", "world");
  console.log(responses); // 서버마다 응답 하나(현재 서버 제외)
} catch (e) {
  // 일부 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
}
```

  </TabItem>
</Tabs>

받는 쪽:

```js
io.on("hello", (value, callback) => {
  console.log(value); // "world"
  callback("hi");
});
```

## 클라이언트 {#client}

### 기본적인 emit {#basic-emit-2}

```js
socket.emit("hello", 1, "2", { 3: "4", 5: Uint8Array.from([6]) });
```

### 확인 응답 {#acknowledgement-1}

<Tabs>
  <TabItem value="callback" label="콜백" default>

```js
socket.emit("hello", "world", (arg1, arg2, arg3) => {
  // ...
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
const response = await socket.emitWithAck("hello", "world");
```

  </TabItem>
</Tabs>

### 확인 응답과 타임아웃 {#acknowledgement-and-timeout-1}

<Tabs>
  <TabItem value="callback" label="콜백" default>

```js
socket.timeout(5000).emit("hello", "world", (err, arg1, arg2, arg3) => {
  if (err) {
    // 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    // ...
  }
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
try {
  const response = await socket.timeout(5000).emitWithAck("hello", "world");
} catch (e) {
  // 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
}
```

  </TabItem>
</Tabs>
