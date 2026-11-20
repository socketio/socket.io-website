---
title: 연결 상태 복구
sidebar_position: 4
slug: /connection-state-recovery
---

연결 상태 복구(connection state recovery)는 일시적으로 연결이 끊긴 뒤 놓친 패킷을 포함해 클라이언트의 상태를 되살리는 기능입니다.

## 유의 사항 {#disclaimer}

실제 환경에서는 연결 품질과 관계없이 Socket.IO 클라이언트의 연결이 일시적으로 끊기는 일을 피할 수 없습니다.

이 기능은 이런 연결 끊김에 대처하는 데 도움이 됩니다. 하지만 복구가 **항상 성공하지는 않는다**는 점에 유의하세요. 따라서 클라이언트와 서버의 상태를 동기화해야 하는 경우는 여전히 직접 처리해야 합니다.

## 사용법 {#usage}

연결 상태 복구는 서버에서 명시적으로 활성화해야 합니다.

```js
const io = new Server(httpServer, {
  connectionStateRecovery: {
    // 세션과 패킷을 보관하는 기간
    maxDisconnectionDuration: 2 * 60 * 1000,
    // 복구에 성공했을 때 미들웨어를 건너뛸지 여부
    skipMiddlewares: false,
  }
});
```

:::tip

연결 상태 복구 기능은 간헐적인 연결 끊김에 대처하도록 설계되었습니다. 따라서 `maxDisconnectionDuration`에는 적절한 값을 지정하세요(`Infinity`는 피하세요).

:::

예기치 않게 연결이 끊기면(`socket.disconnect()`로 직접 연결을 끊은 경우는 제외) 서버는 소켓의 `id`, 룸, `data` 속성을 저장합니다.

이후 재연결할 때 서버는 클라이언트의 상태를 복구하려고 시도합니다. 복구에 성공했는지는 `recovered` 속성으로 알 수 있습니다.

*서버*

```js
io.on("connection", (socket) => {
  if (socket.recovered) {
    // 복구 성공: socket.id, socket.rooms, socket.data가 복원되었습니다
  } else {
    // 새 세션이거나 복구할 수 없는 세션입니다
  }
});
```

*클라이언트*

```js
socket.on("connect", () => {
  if (socket.recovered) {
    // 연결이 끊겨 있던 동안 놓친 이벤트를 지금 받습니다
  } else {
    // 새 세션이거나 복구할 수 없는 세션입니다
  }
});
```

내부 엔진을 강제로 닫아 보면 복구가 동작하는지 확인할 수 있습니다.

```js
import { io } from "socket.io-client";

const socket = io({
  reconnectionDelay: 10000, // 기본값은 1000
  reconnectionDelayMax: 10000 // 기본값은 5000
});

socket.on("connect", () => {
  console.log("recovered?", socket.recovered);

  setTimeout(() => {
    if (socket.io.engine) {
      // 저수준 연결을 닫아 재연결을 일으킵니다
      socket.io.engine.close();
    }
  }, 10000);
});
```

:::tip

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수도 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/connection-state-recovery-example/esm?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/connection-state-recovery-example/esm?file=index.js)

:::

## `skipMiddlewares` 옵션 {#skipmiddlewares-option}

`skipMiddlewares` 옵션을 `true`로 설정하면 연결이 성공적으로 복구되었을 때 미들웨어를 건너뜁니다.

```js
function computeUserIdFromHeaders(headers) {
  // 직접 구현해야 합니다
}

// 연결이 성공적으로 복구되면 이 미들웨어는 건너뜁니다
io.use(async (socket, next) => {
  socket.data.userId = await computeUserIdFromHeaders(socket.handshake.headers);

  next();
});

io.on("connection", (socket) => {
  // userId 속성의 출처는 둘 중 하나입니다
  // - 위의 미들웨어(첫 연결이거나 복구에 실패한 경우)
  // - 복구 메커니즘
  console.log("userId", socket.data.userId);
});
```

:::caution

이 옵션을 쓰면 예를 들어 연결이 끊겨 있던 동안 차단된 사용자도 미들웨어 검증을 거치지 않고 다시 연결할 수 있습니다. 따라서 이 옵션은 신중하게 사용하세요.

:::

## 기존 어댑터와의 호환성 {#compatibility-with-existing-adapters}

| 어댑터                                                           |                                                         지원 여부                                                         |
|------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------:|
| 내장 어댑터(인메모리)                                             |                                                  예 :white_check_mark:                                                   |
| [Redis 어댑터](../05-Adapters/adapter-redis.md)                  |                                                     아니요<sup>1</sup>                                                    |
| [Redis Streams 어댑터](../05-Adapters/adapter-redis-streams.md)  |                                                  예 :white_check_mark:                                                   |
| [MongoDB 어댑터](../05-Adapters/adapter-mongo.md)                | 예 :white_check_mark: ([`0.3.0`](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.3.0) 버전부터) |
| [Postgres 어댑터](../05-Adapters/adapter-postgres.md)            |                                                          개발 중                                                          |
| [클러스터 어댑터](../05-Adapters/adapter-cluster.md)              |                                                          개발 중                                                          |

[1] 패킷을 저장하는 방식은 Redis PUB/SUB 메커니즘과 호환되지 않습니다.

## 내부 동작 방식 {#how-it-works-under-the-hood}

- 서버는 [핸드셰이크 과정에서](../08-Miscellaneous/sio-protocol.md#connection-to-a-namespace-1) 세션 ID를 보냅니다. 이 세션 ID는 공개되어 있어 자유롭게 공유할 수 있는 기존 `id` 속성과 다른 값입니다

예시:

```
40{"sid":"GNpWD7LbGCBNCr8GAAAB","pid":"YHcX2sdAF1z452-HAAAW"}

where

4         => the Engine.IO message type
0         => the Socket.IO CONNECT type
GN...AB   => the public id of the session
YH...AW   => the private id of the session
```

- 서버는 [각 패킷](../08-Miscellaneous/sio-protocol.md#sending-and-receiving-data-1)에 오프셋도 담아 보냅니다(하위 호환성을 위해 데이터 배열의 끝에 추가합니다)

예시:

```
42["foo","MzUPkW0"]

where

4         => the Engine.IO message type
2         => the Socket.IO EVENT type
foo       => the event name (socket.emit("foo"))
MzUPkW0   => the offset
```

:::note

복구가 성공하려면 서버가 이벤트를 한 번 이상 보내야 합니다. 그래야 클라이언트 측에 오프셋 값이 처음으로 설정됩니다.

:::

- 일시적으로 연결이 끊기면 서버는 정해진 시간 동안 클라이언트 상태를 저장합니다(어댑터 수준에서 구현됩니다)

- 재연결할 때 클라이언트는 세션 ID와 마지막으로 처리한 오프셋을 함께 보내고, 서버는 상태 복구를 시도합니다

예시:

```
40{"pid":"YHcX2sdAF1z452-HAAAW","offset":"MzUPkW0"}

where

4         => the Engine.IO message type
0         => the Socket.IO CONNECT type
YH...AW   => the private id of the session
MzUPkW0   => the last processed offset
```
