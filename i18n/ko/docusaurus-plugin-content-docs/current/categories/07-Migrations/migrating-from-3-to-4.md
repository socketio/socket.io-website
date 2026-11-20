---
title: 3.x에서 4.0으로 마이그레이션하기
sidebar_position: 2
slug: /migrating-from-3-x-to-4-0/
toc_max_heading_level: 4
---

4.0.0 릴리스에는 새로운 기능이 꽤 많이 추가되었습니다(자세한 내용은 [아래](#new-features) 참고). 다만 API 호환성을 깨는 변경도 몇 가지 있어서 메이저 버전을 올렸습니다.

호환성을 깨는 변경은 서버 측 API에만 영향을 줍니다. Socket.IO 프로토콜 자체는 바뀌지 않았으므로 v3 클라이언트는 v4 서버에 **연결할 수 있고** 그 반대도 마찬가지입니다. 또한 Socket.IO v2 클라이언트와 Socket.IO v4 서버 사이에서는 여전히 호환 모드([`allowEIO3: true`](../../server-options.md#alloweio3))를 사용할 수 있습니다.

전체 변경 사항은 다음과 같습니다.

- [호환성을 깨는 변경](#breaking-changes)
  - [`io.to()`가 불변이 됨](#ioto-is-now-immutable)
  - [`wsEngine` 옵션](#wsengine-option)
- [설정](#configuration)
  - [Swift v15 클라이언트와의 호환성 보장](#ensure-compatibility-with-swift-v15-clients)
  - [`pingTimeout`의 기본값 증가](#the-default-value-of-pingtimeout-was-increased)
- [새로운 기능](#new-features)
  - [브로드캐스트할 때 특정 룸 제외하기](#allow-excluding-specific-rooms-when-broadcasting)
  - [`io.to()`에 배열 전달하기](#allow-to-pass-an-array-to-ioto)
  - [유틸리티 메서드 추가](#additional-utility-methods)
  - [타입이 지정된 이벤트](#typed-events)
  - [`autoUnref` 옵션](#autounref-option)
- [알려진 마이그레이션 문제](#known-migration-issues)

### 호환성을 깨는 변경 {#breaking-changes}

#### `io.to()`가 불변이 됨 {#ioto-is-now-immutable}

이전에는 `io.to()`를 호출해 특정 룸에 브로드캐스트하면 io 인스턴스 자체가 변경되었습니다. 그래서 다음과 같이 예상하지 못한 동작이 생길 수 있었습니다.

```js
io.to("room1");
io.to("room2").emit(/* ... */); // room1에도 전송됨

// 또는 async/await를 사용할 때
io.to("room3").emit("details", await fetchDetails()); // 동작을 예측할 수 없음: room3에 전송될 수도 있고 모든 클라이언트에 전송될 수도 있음
```

이제 `io.to()`(또는 다른 브로드캐스트 modifier)를 호출하면 불변 인스턴스를 반환합니다.

예시:

```js
const operator1 = io.to("room1");
const operator2 = operator1.to("room2");
const operator3 = socket.broadcast;
const operator4 = socket.to("room3").to("room4");

operator1.emit(/* ... */); // "room1"에 있는 클라이언트에게만 전송
operator2.emit(/* ... */); // "room1" 또는 "room2"에 있는 클라이언트에게 전송
operator3.emit(/* ... */); // 보낸 클라이언트를 제외한 모든 클라이언트에게 전송
operator4.emit(/* ... */); // 보낸 클라이언트를 제외하고 "room3" 또는 "room4"에 있는 클라이언트에게 전송
```

#### `wsEngine` 옵션 {#wsengine-option}

다음 오류를 없애려고 [`wsEngine`](../../server-options.md#wsengine) 옵션의 형식을 변경했습니다.

`Critical dependency: the request of a dependency is an expression`

이 오류는 webpack으로 서버를 번들링할 때 발생했습니다.

변경 전:

```js
const io = require("socket.io")(httpServer, {
  wsEngine: "eiows"
});
```

변경 후:

```js
const io = require("socket.io")(httpServer, {
  wsEngine: require("eiows").Server
});
```

### 설정 {#configuration}

#### Swift v15 클라이언트와의 호환성 보장 {#ensure-compatibility-with-swift-v15-clients}

16.0.0 이전 버전의 Swift 클라이언트는 HTTP 요청에 `EIO` 쿼리 매개변수를 넣지 않았고 Socket.IO v3 서버는 기본적으로 `EIO=4`로 간주했습니다.

그래서 Swift 클라이언트 v15는 호환 모드([`allowEIO3: true`](../../server-options.md#alloweio3))를 켜도 서버에 연결할 수 없었습니다. 이 문제를 해결하려면 다음과 같이 쿼리 매개변수를 직접 지정해야 했습니다.

```swift
let manager = SocketManager(socketURL: URL(string: "http://localhost:8080")!, config: [
  .log(true),
  .connectParams(["EIO": "3"])
])
let socket = manager.defaultSocket
```

이제 Socket.IO v4 서버는 `EIO` 쿼리 매개변수가 없으면 `EIO=3`으로 간주합니다.

#### `pingTimeout`의 기본값 증가 {#the-default-value-of-pingtimeout-was-increased}

`socket.io@2.1.0`(2018년 3월) 릴리스 때 [하트비트 메커니즘](../01-Documentation/how-it-works.md#disconnection-detection)에서 사용하는 [`pingTimeout`](../../server-options.md#pingtimeout)의 기본값이 60000에서 5000으로 바뀌었습니다.

당시 변경한 이유는 다음과 같습니다.

일부 사용자가 서버 측과 클라이언트 측에서 연결 끊김을 감지하는 시점 사이에 긴 지연을 겪었습니다. 브라우저에서 "disconnect" 이벤트가 늦게 발생했는데 타이머 지연이 원인으로 보였습니다. 그래서 값을 변경했습니다.

하지만 현재 값(5초)에서는 느린 네트워크로 큰 페이로드를 보낼 때 연결이 예기치 않게 끊어졌습니다. 페이로드를 보내는 동안 클라이언트와 서버가 ping-pong 패킷을 주고받지 못하기 때문입니다. 동기 작업이 서버를 5초 넘게 막을 때도 같은 일이 생길 수 있습니다.

새 값(20초)은 연결 끊김을 빠르게 감지하는 것과 다양한 지연을 견디는 것 사이에서 적절한 균형으로 보입니다.

### 새로운 기능 {#new-features}

#### 브로드캐스트할 때 특정 룸 제외하기 {#allow-excluding-specific-rooms-when-broadcasting}

[Sebastiaan Marynissen](https://github.com/sebamarynissen)의 훌륭한 기여 덕분에 이제 브로드캐스트할 때 특정 룸을 제외할 수 있습니다.

```js
io.except("room1").emit(/* ... */); // "room1"에 있는 클라이언트를 제외한 모든 클라이언트에게 전송
io.to("room2").except("room3").emit(/* ... */); // "room2"에 있는 클라이언트 중 "room3"에 있는 클라이언트를 제외하고 전송

socket.broadcast.except("room1").emit(/* ... */); // "room1"에 있는 클라이언트와 보낸 클라이언트를 제외한 모든 클라이언트에게 전송
socket.except("room1").emit(/* ... */); // 위와 같음
socket.to("room4").except("room5").emit(/* ... */); // "room4"에 있는 클라이언트 중 "room5"에 있는 클라이언트와 보낸 클라이언트를 제외하고 전송
```

#### `io.to()`에 배열 전달하기 {#allow-to-pass-an-array-to-ioto}

이제 `to()` 메서드에 룸 배열을 전달할 수 있습니다.

변경 전:

```js
const rooms = ["room1", "room2", "room3"];
for (const room of rooms) {
  io.to(room);
}
// "room1", "room2", "room3" 중 하나에 있는 클라이언트에게 브로드캐스트
// 주의!!! v4에서는 더 이상 동작하지 않음. 위의 호환성을 깨는 변경 참고
io.emit(/* ... */);
```

변경 후:

```js
io.to(["room1", "room2", "room3"]).emit(/* ... */);

socket.to(["room1", "room2", "room3"]).emit(/* ... */);
```

#### 유틸리티 메서드 추가 {#additional-utility-methods}

오래 기다려 온 메서드 몇 가지가 추가되었습니다.

- `socketsJoin`: 조건에 맞는 Socket 인스턴스를 지정한 룸에 참여시킵니다.

```js
// 모든 Socket 인스턴스를 "room1" 룸에 참여시킴
io.socketsJoin("room1");

// "admin" 네임스페이스에서 "room1" 룸에 있는 모든 Socket 인스턴스를 "room2" 룸에 참여시킴
io.of("/admin").in("room1").socketsJoin("room2");
```

- `socketsLeave`: 조건에 맞는 Socket 인스턴스를 지정한 룸에서 나가게 합니다.

```js
// 모든 Socket 인스턴스를 "room1" 룸에서 나가게 함
io.socketsLeave("room1");

// "admin" 네임스페이스에서 "room1" 룸에 있는 모든 Socket 인스턴스를 "room2" 룸에서 나가게 함
io.of("/admin").in("room1").socketsLeave("room2");
```

- `disconnectSockets`: 조건에 맞는 Socket 인스턴스의 연결을 끊습니다.

```js
// 모든 Socket 인스턴스의 연결을 끊음
io.disconnectSockets();

// "admin" 네임스페이스에서 "room1" 룸에 있는 모든 Socket 인스턴스의 연결을 끊음
io.of("/admin").in("room1").disconnectSockets();

// socket ID 하나만 지정해도 동작함
io.of("/admin").in(theSocketId).disconnectSockets();
```

- `fetchSockets`: 조건에 맞는 Socket 인스턴스를 반환합니다.

```js
// 메인 네임스페이스의 모든 Socket 인스턴스를 반환
const sockets = await io.fetchSockets();

// "admin" 네임스페이스에서 "room1" 룸에 있는 모든 Socket 인스턴스를 반환
const sockets = await io.of("/admin").in("room1").fetchSockets();

// socket ID 하나만 지정해도 동작함
const sockets = await io.in(theSocketId).fetchSockets();
```

위 예시의 `sockets` 변수는 일반 Socket 클래스의 일부 기능만 노출하는 객체의 배열입니다.

```js
for (const socket of sockets) {
  console.log(socket.id);
  console.log(socket.handshake);
  console.log(socket.rooms);
  socket.emit(/* ... */);
  socket.join(/* ... */);
  socket.leave(/* ... */);
  socket.disconnect(/* ... */);
}
```

이 메서드는 브로드캐스팅과 동작 방식이 같으며 필터도 똑같이 적용됩니다.

```js
io.of("/admin").in("room1").except("room2").local.disconnectSockets();
```

위 코드는 "admin" 네임스페이스의 Socket 인스턴스 중

- "room1" 룸에 있고(`in("room1")` 또는 `to("room1")`)
- "room2"에 있는 인스턴스는 제외하며(`except("room2")`)
- 현재 Socket.IO 서버에 있는(`local`) 인스턴스만

연결을 끊습니다.

#### 타입이 지정된 이벤트 {#typed-events}

[Maxime Kjaer](https://github.com/MaximeKjaer)의 훌륭한 기여 덕분에 이제 TypeScript 사용자는 클라이언트와 서버가 주고받는 이벤트에 타입을 지정할 수 있습니다.

먼저 각 이벤트의 시그니처를 선언합니다.

```ts
interface ClientToServerEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: number[]) => void;
}

interface ServerToClientEvents {
  withAck: (d: string, cb: (e: number) => void) => void;
}
```

이제 클라이언트 측에서 이 타입을 사용할 수 있습니다.

```ts
import { io, Socket } from "socket.io-client";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

socket.emit("noArg");

socket.emit("basicEmit", 1, "2", [3]);

socket.on("withAck", (d, cb) => {
    cb(4);
});
```

이제 IDE가 각 인자의 타입을 제대로 추론합니다.

서버 측에서도 마찬가지입니다(`ServerToClientEvents`와 `ClientToServerEvents`의 순서가 반대입니다).

```ts
import { Server } from "socket.io";

const io = new Server<ClientToServerEvents, ServerToClientEvents>(3000);

io.on("connection", (socket) => {
    socket.on("noArg", () => {
      // ...
    });

    socket.on("basicEmit", (a, b, c) => {
      // ...
    });

    socket.emit("withAck", "42", (e) => {
        console.log(e);
    });
});
```

기본적으로 이벤트에는 타입이 없으며 인자는 `any`로 추론됩니다.

#### `autoUnref` 옵션 {#autounref-option}

마지막으로 [KC Erb](https://github.com/KCErb)의 훌륭한 기여 덕분에 `autoUnref` 옵션이 추가되었습니다.

`autoUnref`를 true로 설정하면(기본값: false) 이벤트 시스템에 다른 활성 타이머나 TCP 소켓이 없을 때 Socket.IO 클라이언트가 연결되어 있어도 프로그램이 종료될 수 있습니다.

```js
const socket = io({
  autoUnref: true
});
```

참고: 이 옵션은 Node.js 클라이언트에만 적용됩니다.

### 알려진 마이그레이션 문제 {#known-migration-issues}

- `cannot get emit of undefined`

다음 표현식을 살펴보겠습니다.

```js
socket.to("room1").broadcast.emit(/* ... */);
```

이 표현식은 Socket.IO v3에서는 동작했지만 이제는 유효하지 않습니다. `to("room1")` 메서드가 이미 Socket 인스턴스를 브로드캐스팅 모드로 만들므로 `broadcast` 플래그는 필요 없습니다.

```js
// 유효함
socket.broadcast.emit(/* ... */); // 보낸 클라이언트를 제외한 모든 클라이언트에게 전송
socket.to("room1").emit(/* ... */); // 보낸 클라이언트를 제외하고 "room1"에 있는 클라이언트에게 전송

// 유효함(단, 'broadcast' 플래그는 불필요)
socket.broadcast.to("room1").emit(/* ... */);

// 유효하지 않음
socket.to("room1").broadcast.emit(/* ... */);
```
