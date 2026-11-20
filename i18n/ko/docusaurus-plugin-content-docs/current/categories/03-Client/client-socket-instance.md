---
title: Socket 인스턴스(클라이언트 측)
sidebar_label: Socket 인스턴스
sidebar_position: 3
slug: /client-socket-instance/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

`Socket`은 서버와 상호작용하는 기본 클래스입니다. [emit](../../client-api.md#socketemiteventname-args), [on](../../client-api.md#socketoneventname-callback), [once](../../client-api.md#socketonceeventname-callback), [off](../../client-api.md#socketoffeventname) 등 Node.js [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter)의 메서드 대부분을 상속합니다.

<ThemedImage
  alt="서버와 클라이언트 간 양방향 통신"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication-socket.png'),
    dark: useBaseUrl('/images/bidirectional-communication-socket-dark.png'),
  }}
/>

<br />
<br />

Socket 인스턴스에는 이벤트를 [보내고](../04-Events/emitting-events.md) [받는](../04-Events/listening-to-events.md) 기능 외에도 애플리케이션에서 쓸 만한 속성이 몇 가지 있습니다.

## Socket#id {#socketid}

새 연결마다 20자로 된 무작위 식별자가 할당됩니다.

이 식별자는 서버 측의 값과 동기화됩니다.

```js
// 서버 측
io.on("connection", (socket) => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

// 클라이언트 측
socket.on("connect", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});
```

:::caution

[연결 상태 복구](../01-Documentation/connection-state-recovery.md)를 활성화하지 않았다면 `id` 속성은 **일시적인** ID입니다. 애플리케이션에서 쓰라고 만든 값이 아니므로 디버깅 용도로만 쓰세요. 이유는 다음과 같습니다.

- 재연결할 때마다 ID가 새로 생성됩니다(예: WebSocket 연결이 끊기거나 사용자가 페이지를 새로고침할 때).
- 브라우저 탭이 다르면 ID도 다릅니다.
- 서버는 ID별 메시지 큐를 저장하지 않습니다. 즉, 클라이언트의 연결이 끊긴 동안 서버가 이 ID로 보낸 메시지는 사라집니다.

대신 일반적인 세션 ID를 사용하세요. 세션 ID는 쿠키로 보내거나, localStorage에 저장해 두었다가 [`auth`](../../client-options.md#auth) 페이로드로 보내면 됩니다.

함께 보기:

- [개인 메시지 가이드 2부](/get-started/private-messaging-part-2/)
- [쿠키 다루기](/how-to/deal-with-cookies)

:::

## Socket#connected {#socketconnected}

이 속성은 소켓이 현재 서버에 연결되어 있는지를 나타냅니다.

```js
socket.on("connect", () => {
  console.log(socket.connected); // true
});

socket.on("disconnect", () => {
  console.log(socket.connected); // false
});
```

## Socket#io {#socketio}

내부에서 사용하는 [Manager](../../client-api.md#manager)를 가리키는 참조입니다.

```js
socket.on("connect", () => {
  const engine = socket.io.engine;
  console.log(engine.transport.name); // 대부분의 경우 "polling" 출력

  engine.once("upgrade", () => {
    // 전송 방식이 업그레이드되면 호출됩니다(예: HTTP 롱 폴링에서 WebSocket으로)
    console.log(engine.transport.name); // 대부분의 경우 "websocket" 출력
  });

  engine.on("packet", ({ type, data }) => {
    // 패킷을 받을 때마다 호출됩니다
  });

  engine.on("packetCreate", ({ type, data }) => {
    // 패킷을 보낼 때마다 호출됩니다
  });

  engine.on("drain", () => {
    // 쓰기 버퍼가 비워지면 호출됩니다
  });

  engine.on("close", (reason) => {
    // 내부 연결이 닫히면 호출됩니다
  });
});
```

## 생명주기 {#lifecycle}

<ThemedImage
  alt="생명주기 다이어그램"
  sources={{
    light: useBaseUrl('/images/client_socket_events.png'),
    dark: useBaseUrl('/images/client_socket_events-dark.png'),
  }}
/>

## 이벤트 {#events}

Socket 인스턴스는 세 가지 특별한 이벤트를 발생시킵니다.

- [`connect`](#connect)
- [`connect_error`](#connect_error)
- [`disconnect`](#disconnect)

:::tip

Socket.IO v3부터는 Socket 인스턴스가 재연결 로직 관련 이벤트를 더 이상 발생시키지 않습니다. 이런 이벤트는 Manager 인스턴스에서 직접 수신할 수 있습니다.

```js
socket.io.on("reconnect_attempt", () => {
  // ...
});

socket.io.on("reconnect", () => {
  // ...
});
```

자세한 내용은 [마이그레이션 가이드](../07-Migrations/migrating-from-2-to-3.md#the-socket-instance-will-no-longer-forward-the-events-emitted-by-its-manager)를 참고하세요.

:::

### `connect` {#connect}

이 이벤트는 Socket 인스턴스가 연결될 때와 재연결될 때 **모두** 발생합니다.

```js
socket.on("connect", () => {
  // ...
});
```

:::caution

`connect` 핸들러 안에서 이벤트 핸들러를 등록하지 않는 것이 좋습니다. Socket 인스턴스가 재연결할 때마다 새 핸들러가 등록되기 때문입니다.

나쁜 예 :warning:

```js
socket.on("connect", () => {
  socket.on("data", () => { /* ... */ });
});
```

좋은 예 :+1:

```js
socket.on("connect", () => {
  // ...
});

socket.on("data", () => { /* ... */ });
```

:::

### `connect_error` {#connect_error}

- `error` [`<Error>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

이 이벤트는 연결에 실패하면 발생합니다.

| 이유                                                                                          | 자동 재연결 여부 |
|-------------------------------------------------------------------------------------------------|-------------------------|
| 저수준 연결을 맺을 수 없습니다(일시적 장애).                              | :white_check_mark: 예  |
| 서버가 [미들웨어 함수](../02-Server/middlewares.md)에서 연결을 거부했습니다. | :x: 아니요                  |

[`socket.active`](../../client-api.md#socketactive) 속성은 소켓이 짧은 [무작위 지연](../../client-options.md#reconnectiondelay) 후에 자동으로 재연결을 시도할지 알려 줍니다.

```js
socket.on("connect_error", (error) => {
  if (socket.active) {
    // 일시적 장애. 소켓이 자동으로 재연결을 시도합니다
  } else {
    // 서버가 연결을 거부했습니다
    // 이 경우 재연결하려면 `socket.connect()`를 직접 호출해야 합니다
    console.log(error.message);
  }
});
```

### `disconnect` {#disconnect}

- `reason` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- `details` `<DisconnectDetails>`

이 이벤트는 연결이 끊기면 발생합니다.

```js
socket.on("disconnect", (reason, details) => {
  // ...
});
```

연결이 끊길 수 있는 이유는 다음과 같습니다.

| 이유                 | 설명                                                                                                             | 자동 재연결 여부 |
|------------------------|-------------------------------------------------------------------------------------------------------------------------|:------------------------|
| `io server disconnect` | 서버가 [socket.disconnect()](../../server-api.md#socketdisconnectclose)로 소켓의 연결을 강제로 끊었습니다. | :x: 아니요                  |
| `io client disconnect` | [socket.disconnect()](../../client-api.md#socketdisconnect)로 소켓의 연결을 직접 끊었습니다.                  | :x: 아니요                  |
| `ping timeout`         | 서버가 `pingInterval + pingTimeout` 시간 안에 PING을 보내지 않았습니다.                                            | :white_check_mark: 예  |
| `transport close`      | 연결이 닫혔습니다(예: 사용자의 연결이 끊겼거나 네트워크가 WiFi에서 4G로 바뀐 경우).           | :white_check_mark: 예  |
| `transport error`      | 연결에 오류가 발생했습니다(예: HTTP 롱 폴링 주기 중에 서버가 종료된 경우).               | :white_check_mark: 예  |

[`socket.active`](../../client-api.md#socketactive) 속성은 소켓이 짧은 [무작위 지연](../../client-options.md#reconnectiondelay) 후에 자동으로 재연결을 시도할지 알려 줍니다.

```js
socket.on("disconnect", (reason) => {
  if (socket.active) {
    // 일시적인 연결 끊김. 소켓이 자동으로 재연결을 시도합니다
  } else {
    // 서버 또는 클라이언트 자신이 연결을 강제로 닫았습니다
    // 이 경우 재연결하려면 `socket.connect()`를 직접 호출해야 합니다
    console.log(reason);
  }
});
```

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
socket.emit("disconnect");
```

:::

## 전체 API {#complete-api}

Socket 인스턴스가 제공하는 전체 API는 [클라이언트 API 문서](../../client-api.md#socket)를 참고하세요.
