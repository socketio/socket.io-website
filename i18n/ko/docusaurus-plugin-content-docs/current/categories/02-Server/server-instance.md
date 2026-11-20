---
title: Server 인스턴스
sidebar_position: 3
slug: /server-instance/
---

Server 인스턴스(코드 예시에서는 보통 `io`라고 부릅니다)에는 애플리케이션에서 유용하게 쓸 수 있는 속성이 몇 가지 있습니다.

[메인 네임스페이스](../06-Advanced/namespaces.md#main-namespace)의 메서드도 모두 상속합니다. [`namespace.use()`](../../server-api.md#namespaceusefn)나 [`namespace.allSockets()`](../../server-api.md#namespaceallsockets)가 그 예입니다. `namespace.use()`는 [미들웨어](middlewares.md) 문서를 참고하세요.

## Server#engine {#serverengine}

내부에서 동작하는 Engine.IO 서버를 가리키는 참조입니다.

현재 연결된 클라이언트 수를 가져올 때 사용할 수 있습니다.

```js
const count = io.engine.clientsCount;
// 사용 방식에 따라 메인 네임스페이스의 Socket 인스턴스 수와 같을 수도, 다를 수도 있습니다
const count2 = io.of("/").sockets.size;
```

커스텀 세션 ID(`sid` 쿼리 파라미터)를 생성할 때도 사용할 수 있습니다.

```js
const uuid = require("uuid");

io.engine.generateId = (req) => {
  return uuid.v4(); // 모든 Socket.IO 서버를 통틀어 고유해야 합니다
}
```

`socket.io@4.1.0`부터 Engine.IO 서버에서 세 가지 특수 이벤트가 발생합니다.

- `initial_headers`: 세션의 첫 HTTP 요청(핸드셰이크)에 대한 응답 헤더를 쓰기 직전에 발생하며, 이 헤더를 원하는 대로 바꿀 수 있습니다.

```js
io.engine.on("initial_headers", (headers, req) => {
  headers["test"] = "123";
  headers["set-cookie"] = "mycookie=456";
});
```

- `headers`: 세션의 각 HTTP 요청(WebSocket 업그레이드 포함)에 대한 응답 헤더를 쓰기 직전에 발생하며, 이 헤더를 원하는 대로 바꿀 수 있습니다.

```js
io.engine.on("headers", (headers, req) => {
  headers["test"] = "789";
});
```

- `connection_error`: 연결이 비정상적으로 종료되면 발생합니다.

```js
io.engine.on("connection_error", (err) => {
  console.log(err.req);	     // 요청 객체
  console.log(err.code);     // 오류 코드(예: 1)
  console.log(err.message);  // 오류 메시지(예: "Session ID unknown")
  console.log(err.context);  // 추가 오류 컨텍스트
});
```

발생할 수 있는 오류 코드는 다음과 같습니다.

| 코드 |            메시지             |
|:----:|:------------------------------:|
|  0   |      "Transport unknown"       |
|  1   |      "Session ID unknown"      |
|  2   |     "Bad handshake method"     |
|  3   |         "Bad request"          |
|  4   |          "Forbidden"           |
|  5   | "Unsupported protocol version" |

## 유틸리티 메서드 {#utility-methods}

Socket.IO v4.0.0에서 Socket 인스턴스와 룸을 관리하는 유틸리티 메서드가 추가되었습니다.

- [`socketsJoin`](#socketsjoin): 조건에 맞는 Socket 인스턴스를 지정한 룸에 참여시킵니다
- [`socketsLeave`](#socketsleave): 조건에 맞는 Socket 인스턴스를 지정한 룸에서 내보냅니다
- [`disconnectSockets`](#disconnectsockets): 조건에 맞는 Socket 인스턴스의 연결을 끊습니다
- [`fetchSockets`](#fetchsockets): 조건에 맞는 Socket 인스턴스를 반환합니다

[`serverSideEmit`](#serversideemit) 메서드는 Socket.IO v4.1.0에서 추가되었습니다.

위 유틸리티 메서드는 브로드캐스팅과 동작 방식이 같고, 같은 필터를 적용할 수 있습니다.

```js
io.of("/admin").in("room1").except("room2").local.disconnectSockets();
```

위 코드는 "admin" 네임스페이스의 Socket 인스턴스 가운데

- "room1" 룸에 있으면서(`in("room1")` 또는 `to("room1")`)
- "room2" 룸에는 없고(`except("room2")`)
- 현재 Socket.IO 서버에 연결된(`local`)

인스턴스의 연결을 모두 끊습니다.

참고로 이 유틸리티 메서드는 `socket.io-redis@6.1.0`부터 Redis 어댑터와도 호환되므로 여러 Socket.IO 서버에 걸쳐 동작합니다.

### `socketsJoin` {#socketsjoin}

이 메서드는 조건에 맞는 Socket 인스턴스를 지정한 룸에 참여시킵니다.

```js
// 모든 Socket 인스턴스를 "room1" 룸에 참여시킵니다
io.socketsJoin("room1");

// "room1" 룸에 있는 모든 Socket 인스턴스를 "room2", "room3" 룸에 참여시킵니다
io.in("room1").socketsJoin(["room2", "room3"]);

// "admin" 네임스페이스의 "room1" 룸에 있는 모든 Socket 인스턴스를 "room2" 룸에 참여시킵니다
io.of("/admin").in("room1").socketsJoin("room2");

// 소켓 ID 하나만 지정해도 동작합니다
io.in(theSocketId).socketsJoin("room1");
```

### `socketsLeave` {#socketsleave}

이 메서드는 조건에 맞는 Socket 인스턴스를 지정한 룸에서 내보냅니다.

```js
// 모든 Socket 인스턴스를 "room1" 룸에서 내보냅니다
io.socketsLeave("room1");

// "room1" 룸에 있는 모든 Socket 인스턴스를 "room2", "room3" 룸에서 내보냅니다
io.in("room1").socketsLeave(["room2", "room3"]);

// "admin" 네임스페이스의 "room1" 룸에 있는 모든 Socket 인스턴스를 "room2" 룸에서 내보냅니다
io.of("/admin").in("room1").socketsLeave("room2");

// 소켓 ID 하나만 지정해도 동작합니다
io.in(theSocketId).socketsLeave("room1");
```

### `disconnectSockets` {#disconnectsockets}

이 메서드는 조건에 맞는 Socket 인스턴스의 연결을 끊습니다.

```js
// 모든 Socket 인스턴스의 연결을 끊습니다
io.disconnectSockets();

// "room1" 룸에 있는 모든 Socket 인스턴스의 연결을 끊습니다(저수준 연결도 닫습니다)
io.in("room1").disconnectSockets(true);

// "admin" 네임스페이스의 "room1" 룸에 있는 모든 Socket 인스턴스의 연결을 끊습니다
io.of("/admin").in("room1").disconnectSockets();

// 소켓 ID 하나만 지정해도 동작합니다
io.of("/admin").in(theSocketId).disconnectSockets();
```

### `fetchSockets` {#fetchsockets}

이 메서드는 조건에 맞는 Socket 인스턴스를 반환합니다.

```js
// 메인 네임스페이스의 모든 Socket 인스턴스를 반환합니다
const sockets = await io.fetchSockets();

// 메인 네임스페이스의 "room1" 룸에 있는 모든 Socket 인스턴스를 반환합니다
const sockets = await io.in("room1").fetchSockets();

// "admin" 네임스페이스의 "room1" 룸에 있는 모든 Socket 인스턴스를 반환합니다
const sockets = await io.of("/admin").in("room1").fetchSockets();

// 소켓 ID 하나만 지정해도 동작합니다
const sockets = await io.in(theSocketId).fetchSockets();
```

위 예시의 `sockets` 변수는 일반 Socket 클래스의 일부 기능만 제공하는 객체의 배열입니다.

```js
for (const socket of sockets) {
  console.log(socket.id);
  console.log(socket.handshake);
  console.log(socket.rooms);
  console.log(socket.data);
  socket.emit(/* ... */);
  socket.join(/* ... */);
  socket.leave(/* ... */);
  socket.disconnect(/* ... */);
}
```

`data` 속성은 Socket.IO 서버끼리 정보를 공유할 때 쓸 수 있는 임의의 객체입니다.

```js
// 서버 A
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

// 서버 B
const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

### `serverSideEmit` {#serversideemit}

[다중 서버 구성](using-multiple-nodes.md)에서 이 메서드를 쓰면 클러스터의 다른 Socket.IO 서버에 이벤트를 보낼 수 있습니다.

문법:

```js
io.serverSideEmit("hello", "world");
```

받는 쪽에서는 다음과 같이 처리합니다.

```js
io.on("hello", (arg1) => {
  console.log(arg1); // "world"를 출력합니다
});
```

확인 응답(acknowledgement)도 지원합니다.

```js
// 서버 A
io.serverSideEmit("ping", (err, responses) => {
  console.log(responses[0]); // "pong"을 출력합니다
});

// 서버 B
io.on("ping", (cb) => {
  cb("pong");
});
```

참고:

- `connection`, `connect`, `new_namespace` 문자열은 예약된 이름이므로 애플리케이션에서 사용할 수 없습니다.

- 인자는 개수 제한 없이 보낼 수 있지만, 현재 바이너리 구조는 지원하지 않습니다(인자 배열은 `JSON.stringify`로 직렬화됩니다).

예시:

```js
io.serverSideEmit("hello", "world", 1, "2", { 3: "4" });
```

- 다른 Socket.IO 서버가 일정 시간 안에 응답하지 않으면 확인 응답 콜백이 오류와 함께 호출될 수 있습니다.

```js
io.serverSideEmit("ping", (err, responses) => {
  if (err) {
    // 응답하지 않은 Socket.IO 서버가 하나 이상 있습니다
    // 그래도 'responses' 배열에는 이미 받은 응답이 모두 들어 있습니다
  } else {
    // 성공! 'responses' 배열에는 클러스터의 다른 Socket.IO 서버마다 객체가 하나씩 들어 있습니다
  }
});
```


## 이벤트 {#events}

Server 인스턴스에서 발생하는 이벤트는 하나뿐입니다(엄밀히 따지면 두 개지만 `connect`는 `connection`의 별칭입니다).

- [`connection`](#connection)

### `connection` {#connection}

새 연결이 생기면 발생하는 이벤트입니다. 첫 번째 인자는 [Socket 인스턴스](server-socket-instance.md)입니다.

```js
io.on("connection", (socket) => {
  // ...
});
```

## 전체 API {#complete-api}

Server 인스턴스가 제공하는 전체 API는 [여기](../../server-api.md#server)에서 확인하세요.
