---
title: 전달 보장
sidebar_position: 3
slug: /delivery-guarantees
toc_max_heading_level: 4
---

## 메시지 순서 {#message-ordering}

Socket.IO는 어떤 저수준 전송 방식을 사용하든 메시지 순서를 보장합니다. HTTP 롱 폴링에서 WebSocket으로 업그레이드하는 도중에도 마찬가지입니다.

순서를 보장할 수 있는 이유는 다음 두 가지입니다.

- 하위 TCP 연결이 제공하는 보장
- [업그레이드 메커니즘](how-it-works.md#upgrade-mechanism)의 세심한 설계

예시:

```js
socket.emit("event1");
socket.emit("event2");
socket.emit("event3");
```

위 예시에서 상대방은 이벤트를 항상 보낸 순서 그대로 받습니다. 단, 이벤트가 실제로 도착한다는 전제입니다([아래](#message-arrival) 참고).

## 메시지 도착 {#message-arrival}

### 최대 한 번 {#at-most-once}

기본적으로 Socket.IO는 **최대 한 번(at most once)** 전달을 보장합니다.

- 이벤트를 보내는 도중 연결이 끊기면 상대방이 이벤트를 받았는지 보장할 수 없고, 재연결 후에도 다시 보내지 않습니다
- 연결이 끊긴 클라이언트는 [재연결할 때까지 이벤트를 버퍼에 쌓아 둡니다](../03-Client/client-offline-behavior.md). 다만 버퍼가 있어도 첫 번째 항목은 그대로 적용됩니다
- 서버에는 이런 버퍼가 없습니다. 따라서 연결이 끊긴 클라이언트가 놓친 이벤트는 재연결 후에도 그 클라이언트에게 전송되지 않습니다

:::info

현재로서는 그 이상의 전달 보장이 필요하면 애플리케이션에서 직접 구현해야 합니다.

:::

### 최소 한 번 {#at-least-once}

#### 클라이언트에서 서버로 {#from-client-to-server}

클라이언트 측에서는 [`retries`](../../client-options.md#retries) 옵션으로 **최소 한 번(at least once)** 전달을 보장할 수 있습니다.

```js
const socket = io({
  retries: 3,
  ackTimeout: 10000
});
```

클라이언트는 서버의 확인 응답(acknowledgement)을 받을 때까지 이벤트를 보냅니다(최대 `retries + 1`번).

:::caution

다만 이렇게 해도 사용자가 탭을 새로고침하면 대기 중인 이벤트는 모두 사라집니다.

:::

#### 서버에서 클라이언트로 {#from-server-to-client}

서버가 보내는 이벤트는 다음과 같은 방법으로 전달을 더 확실하게 보장할 수 있습니다.

- 이벤트마다 고유 ID를 붙입니다
- 이벤트를 데이터베이스에 저장합니다
- 클라이언트 측에서 마지막으로 받은 이벤트의 오프셋을 저장해 두었다가 재연결할 때 서버에 보냅니다

예시:

*클라이언트*

```js
const socket = io({
  auth: {
    offset: undefined
  }
});

socket.on("my-event", ({ id, data }) => {
  // 데이터를 처리한 뒤 오프셋을 갱신합니다
  socket.auth.offset = id;
});
```

*서버*

```js
io.on("connection", async (socket) => {
  const offset = socket.handshake.auth.offset;
  if (offset) {
    // 재연결인 경우
    for (const event of await fetchMissedEventsFromDatabase(offset)) {
      socket.emit("my-event", event);
    }
  } else {
    // 첫 연결인 경우
  }
});

setInterval(async () => {
  const event = {
    id: generateUniqueId(),
    data: new Date().toISOString()
  }

  await persistEventToDatabase(event);
  io.emit("my-event", event);
}, 1000);
```

예제에서 빠진 메서드(`fetchMissedEventsFromDatabase()`, `generateUniqueId()`, `persistEventToDatabase()`)는 사용하는 데이터베이스에 따라 구현이 달라지므로 직접 작성해 보세요.

참고 자료:

- [`socket.auth`](../../client-options.md#socket-options) (클라이언트)
- [`socket.handshake`](../../server-api.md#sockethandshake) (서버)
