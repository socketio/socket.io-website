---
title: Socket 인스턴스(서버 측)
sidebar_label: Socket 인스턴스
sidebar_position: 4
slug: /server-socket-instance/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

`Socket`은 클라이언트와 상호작용하는 기본 클래스입니다. Node.js [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter)의 모든 메서드를 상속하므로 [emit](../../server-api.md#socketemiteventname-args), [on](../../server-api.md#socketoneventname-callback), [once](../../server-api.md#socketonceeventname-listener), [removeListener](../../server-api.md#socketremovelistenereventname-listener) 같은 메서드를 쓸 수 있습니다.

<ThemedImage
  alt="서버와 클라이언트 사이의 양방향 통신"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication-socket.png'),
    dark: useBaseUrl('/images/bidirectional-communication-socket-dark.png'),
  }}
/>

<br />
<br />

이 밖에도 다음 기능이 있습니다.

- 이벤트 [보내기](../04-Events/emitting-events.md#basic-emit)와 [수신하기](../04-Events/listening-to-events.md)
- [이벤트 브로드캐스팅](../04-Events/broadcasting-events.md#to-all-connected-clients-except-the-sender)
- [룸 참여와 나가기](../04-Events/rooms.md#joining-and-leaving)

Socket 인스턴스에는 애플리케이션에서 유용하게 쓸 수 있는 속성이 몇 가지 있습니다.

## Socket#id {#socketid}

새로운 연결마다 20자의 무작위 식별자가 할당됩니다.

이 식별자는 클라이언트 측의 값과 동기화됩니다.

```js
// 서버 측
io.on("connection", (socket) => {
  console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
});

// 클라이언트 측
socket.on("connect", () => {
  console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
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

참고: 이 식별자는 Socket.IO 코드베이스의 여러 곳에서 사용하므로 덮어쓸 수 없습니다.

## Socket#handshake {#sockethandshake}

이 객체에는 Socket.IO 세션을 시작할 때 이루어지는 핸드셰이크의 세부 정보가 담겨 있습니다.

```
{
  headers: /* 최초 요청의 헤더 */
  query: /* 최초 요청의 쿼리 파라미터 */
  auth: /* 인증 페이로드 */
  time: /* 생성 일시(문자열) */
  issued: /* 생성 일시(유닉스 타임스탬프) */
  url: /* 요청 URL 문자열 */
  address: /* 클라이언트의 IP */
  xdomain: /* 크로스 도메인 연결 여부 */
  secure: /* 보안 연결 여부 */
}
```

예시:

```json
{
  "headers": {
    "user-agent": "xxxx",
    "accept": "*/*",
    "host": "example.com",
    "connection": "close"
  },
  "query": {
    "EIO": "4",
    "transport": "polling",
    "t": "NNjNltH"
  },
  "auth": {
    "token": "123"
  },
  "time": "Sun Nov 22 2020 01:33:46 GMT+0100 (Central European Standard Time)",
  "issued": 1606005226969,
  "url": "/socket.io/?EIO=4&transport=polling&t=NNjNltH",
  "address": "::ffff:1.2.3.4",
  "xdomain": false,
  "secure": true
}
```

## Socket#rooms {#socketrooms}

Socket 인스턴스가 현재 속해 있는 [룸](../04-Events/rooms.md)을 가리키는 참조입니다.

```js
io.on("connection", (socket) => {
  console.log(socket.rooms); // Set { <socket.id> }
  socket.join("room1");
  console.log(socket.rooms); // Set { <socket.id>, "room1" }
});
```

## Socket#data {#socketdata}

`fetchSockets()` 유틸리티 메서드와 함께 사용할 수 있는 임의의 객체입니다.

```js
// 서버 A
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

// 서버 B
const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

자세한 내용은 [유틸리티 메서드](server-instance.md#utility-methods)를 참고하세요.

## Socket#conn {#socketconn}

내부에서 사용하는 Engine.IO 소켓을 가리키는 참조입니다([동작 원리](../01-Documentation/how-it-works.md) 참고).

```js
io.on("connection", (socket) => {
  console.log("initial transport", socket.conn.transport.name); // "polling" 출력

  socket.conn.once("upgrade", () => {
    // 전송 방식이 업그레이드될 때 호출됩니다(예: HTTP 롱 폴링에서 WebSocket으로)
    console.log("upgraded transport", socket.conn.transport.name); // "websocket" 출력
  });

  socket.conn.on("packet", ({ type, data }) => {
    // 패킷을 받을 때마다 호출됩니다
  });

  socket.conn.on("packetCreate", ({ type, data }) => {
    // 패킷을 보낼 때마다 호출됩니다
  });

  socket.conn.on("drain", () => {
    // 쓰기 버퍼가 비워지면 호출됩니다
  });

  socket.conn.on("close", (reason) => {
    // 내부 연결이 닫히면 호출됩니다
  });
});
```

## 추가 속성 {#additional-attributes}

기존 속성을 덮어쓰지만 않는다면 Socket 인스턴스에 어떤 속성이든 붙여 두었다가 나중에 사용할 수 있습니다.

```js
// 미들웨어에서
io.use(async (socket, next) => {
  try {
    const user = await fetchUser(socket);
    socket.user = user;
  } catch (e) {
    next(new Error("unknown user"));
  }
});

io.on("connection", (socket) => {
  console.log(socket.user);

  // 리스너에서
  socket.on("set username", (username) => {
    socket.username = username;
  });
});

```

## Socket 미들웨어 {#socket-middlewares}

Socket 미들웨어는 일반적인 [미들웨어](middlewares.md)와 거의 같지만, 들어오는 패킷마다 호출된다는 점이 다릅니다.

```js
socket.use(([event, ...args], next) => {
  // 패킷에 필요한 작업을 하세요(로깅, 권한 확인, 요청 속도 제한 등)
  // 마지막에 반드시 next()를 호출하세요
  next();
});
```

`next` 메서드에 오류 객체를 넘겨 호출할 수도 있습니다. 이 경우 이벤트는 등록된 이벤트 핸들러에 전달되지 않고, 대신 `error` 이벤트가 발생합니다.

```js
io.on("connection", (socket) => {
  socket.use(([event, ...args], next) => {
    if (isUnauthorized(event)) {
      return next(new Error("unauthorized event"));
    }
    next();
  });

  socket.on("error", (err) => {
    if (err && err.message === "unauthorized event") {
      socket.disconnect();
    }
  });
});
```

:::note

미들웨어가 `next()`와 `next(err)` 중 어느 것도 호출하지 않으면 그 패킷은 무시됩니다.

- 이벤트 핸들러가 호출되지 않습니다.
- 오류가 발생하지 않습니다.
- 확인 응답(acknowledgement)이 전송되지 않습니다.

이 동작은 패킷을 의도적으로 버릴 때 유용할 수 있습니다. 하지만 권한 확인에 실패했을 때는 보통 `next(new Error(...))`를 호출하거나 이벤트 핸들러에서 거부를 명시적으로 처리해야 합니다.

:::

:::tip

이 기능은 서버 측에만 있습니다. 클라이언트 측에서는 [모든 이벤트를 받는 리스너(catch-all listener)](../04-Events/listening-to-events.md#catch-all-listeners)를 살펴보세요.

:::

## 이벤트 {#events}

서버 측의 Socket 인스턴스는 두 가지 특별한 이벤트를 발생시킵니다.

- [`disconnect`](#disconnect)
- [`disconnecting`](#disconnecting)

### `disconnect` {#disconnect}

연결이 끊기면 Socket 인스턴스가 이 이벤트를 발생시킵니다.

```js
io.on("connection", (socket) => {
  socket.on("disconnect", (reason) => {
    // ...
  });
});
```

연결이 끊길 수 있는 이유는 다음과 같습니다.

| 이유                          | 설명                                                                                                                                         |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `server namespace disconnect` | 서버가 [socket.disconnect()](server-api.md#socketdisconnectclose)로 소켓의 연결을 강제로 끊었습니다.                                                 |
| `client namespace disconnect` | 클라이언트가 [socket.disconnect()](client-api.md#socketdisconnect)로 소켓의 연결을 직접 끊었습니다.                                           |
| `server shutting down`        | 말 그대로 서버가 종료되는 중입니다.                                                                                                          |
| `ping timeout`                | 클라이언트가 `pingTimeout` 시간 안에 PONG 패킷을 보내지 않았습니다.                                                                          |
| `transport close`             | 연결이 닫혔습니다(예: 사용자의 연결이 끊겼거나 네트워크가 WiFi에서 4G로 바뀐 경우).                                                         |
| `transport error`             | 연결에서 오류가 발생했습니다.                                                                                                                |
| `parse error`                 | 서버가 클라이언트로부터 잘못된 패킷을 받았습니다.                                                                                            |
| `forced close`                | 서버가 클라이언트로부터 잘못된 패킷을 받았습니다.                                                                                            |
| `forced server close`         | 클라이언트가 제시간에 네임스페이스에 참여하지 않아([`connectTimeout`](server-options.md#connecttimeout) 옵션 참고) 연결이 강제로 닫혔습니다. |

### `disconnecting` {#disconnecting}

이 이벤트는 `disconnect`와 비슷하지만 조금 더 일찍, 즉 [Socket#rooms](server-socket-instance.md#socketrooms) 집합이 아직 비어 있지 않을 때 발생합니다.

```js
io.on("connection", (socket) => {
  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit("user has left", socket.id);
      }
    }
  });
});
```

참고: 이 두 이벤트와 `connect`, `connect_error`, `newListener`, `removeListener`는 특별한 이벤트이므로 애플리케이션의 이벤트 이름으로 쓰면 안 됩니다.

```js
// 나쁜 예. 오류가 발생합니다
socket.emit("disconnect");
```

## 전체 API {#complete-api}

Socket 인스턴스가 제공하는 전체 API는 [서버 API](../../server-api.md#socket) 문서에서 확인할 수 있습니다.
