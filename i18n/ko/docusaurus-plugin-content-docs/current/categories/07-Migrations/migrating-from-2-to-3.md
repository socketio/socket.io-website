---
title: 2.x에서 3.0으로 마이그레이션하기
sidebar_position: 1
slug: /migrating-from-2-x-to-3-0/
toc_max_heading_level: 4
---

이번 릴리스는 Socket.IO 라이브러리의 일관성 없는 부분을 대부분 바로잡고 사용자에게 더 직관적인 동작을
제공합니다. 여러 해 동안 커뮤니티가 보내 준 피드백을 반영한 결과입니다. 참여해 주신 모든 분께 깊이 감사드립니다!

**TL;DR:** ~~호환성을 깨는 변경이 여러 가지 있어서 v2 클라이언트는 v3 서버에 연결할 수 없습니다(그 반대도 마찬가지입니다)~~

업데이트: [Socket.IO 3.1.0](/blog/socket-io-3-1-0/)부터는 v3 서버가 v2 클라이언트와 통신할 수 있습니다. 자세한 내용은 [아래](#how-to-upgrade-an-existing-production-deployment)를 참고하세요. 다만 v3 클라이언트는 여전히 v2 서버에 연결할 수 없습니다.

저수준의 세부 사항은 다음 문서를 참고하세요.

- [Engine.IO 프로토콜 v4](https://github.com/socketio/engine.io-protocol#difference-between-v3-and-v4)
- [Socket.IO 프로토콜 v5](https://github.com/socketio/socket.io-protocol#difference-between-v5-and-v4)

전체 변경 사항은 다음과 같습니다.

- [설정](#configuration)
  - [더 합리적인 기본값](#saner-default-values)
  - [CORS 처리](#cors-handling)
  - [기본으로 쿠키를 보내지 않음](#no-more-cookie-by-default)
- [API 변경](#aPI-change)
  - [io.set() 제거](#ioset-is-removed)
  - [기본 네임스페이스에 암묵적으로 연결하지 않음](#no-more-implicit-connection-to-the-default-namespace)
  - [Namespace.connected가 Namespace.sockets로 이름이 바뀌고 Map이 됨](#namespaceconnected-is-renamed-to-namespacesockets-and-is-now-a-map)
  - [Socket.rooms가 Set이 됨](#socketrooms-is-now-a-set)
  - [Socket.binary() 제거](#socketbinary-is-removed)
  - [Socket.join()과 Socket.leave()가 동기 방식이 됨](#socketjoin-and-socketleave-are-now-synchronous)
  - [Socket.use() 제거](#socketuse-is-removed)
  - [미들웨어 오류가 이제 Error 객체를 전송함](#a-middleware-error-will-now-emit-an-error-object)
  - [Manager의 query 옵션과 Socket의 query 옵션을 명확히 구분](#add-a-clear-distinction-between-the-manager-query-option-and-the-socket-query-option)
  - [Socket 인스턴스가 더 이상 Manager의 이벤트를 전달하지 않음](#the-socket-instance-will-no-longer-forward-the-events-emitted-by-its-manager)
  - [Namespace.clients()가 Namespace.allSockets()로 이름이 바뀌고 Promise를 반환함](#namespaceclients-is-renamed-to-namespaceallsockets-and-now-returns-a-promise)
  - [클라이언트 번들](#client-bundles)
  - [지연 시간 확인용 "pong" 이벤트 제거](#no-more-pong-event-for-retrieving-latency)
  - [ES 모듈 문법](#eS-modules-syntax)
  - [더 이상 `emit()`을 체이닝할 수 없음](#emit-chains-are-not-possible-anymore)
  - [룸 이름을 더 이상 문자열로 강제 변환하지 않음](#room-names-are-not-coerced-to-string-anymore)
- [새로운 기능](#new-features)
  - [catch-all 리스너](#catch-all-listeners)
  - [휘발성 이벤트(클라이언트)](#volatile-events-client)
  - [msgpack 파서를 포함한 공식 번들](#official-bundle-with-the-msgpack-parser)
- [기타](#miscellaneous)
  - [Socket.IO 코드베이스를 TypeScript로 다시 작성](#the-socketio-codebase-has-been-rewritten-to-typescript)
  - [IE8과 Node.js 8 공식 지원 종료](#support-for-ie8-and-nodejs-8-is-officially-dropped)

- [기존 프로덕션 배포를 업그레이드하는 방법](#how-to-upgrade-an-existing-production-deployment)
- [알려진 마이그레이션 문제](#known-migration-issues)

### 설정 {#configuration}

#### 더 합리적인 기본값 {#saner-default-values}

- `maxHttpBufferSize`의 기본값이 `100MB`에서 `1MB`로 줄었습니다.
- WebSocket [permessage-deflate 확장](https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression-19)이 이제 기본적으로 꺼져 있습니다.
- 이제 허용할 도메인을 명시적으로 나열해야 합니다(CORS 관련 내용은 [아래](#cORS-handling) 참고).
- 클라이언트 측에서 `withCredentials` 옵션의 기본값이 이제 `false`입니다.

#### CORS 처리 {#cors-handling}

v2에서는 Socket.IO 서버가 [교차 출처 리소스 공유](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)(CORS)를 허용하는 데 필요한 헤더를 자동으로 추가했습니다.

이 동작은 편리하긴 했지만 보안 측면에서는 좋지 않았습니다. `origins` 옵션으로 따로 지정하지 않으면 모든 도메인이 Socket.IO 서버에 접근할 수 있었기 때문입니다.

그래서 Socket.IO v3부터는 다음과 같이 바뀌었습니다.

- CORS가 기본적으로 꺼져 있습니다.
- `origins` 옵션(허용할 도메인 목록 지정)과 `handlePreflightRequest` 옵션(`Access-Control-Allow-xxx` 헤더 수정)은 `cors` 옵션으로 대체되었습니다. `cors` 옵션은 [cors](https://www.npmjs.com/package/cors) 패키지에 그대로 전달됩니다.

전체 옵션 목록은 [여기](https://github.com/expressjs/cors#configuration-options)에서 확인할 수 있습니다.

변경 전:

```js
const io = require("socket.io")(httpServer, {
  origins: ["https://example.com"],

  // 선택 사항, 커스텀 헤더가 필요할 때 유용함
  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "https://example.com",
      "Access-Control-Allow-Methods": "GET,POST",
      "Access-Control-Allow-Headers": "my-custom-header",
      "Access-Control-Allow-Credentials": true
    });
    res.end();
  }
});
```

변경 후:

```js
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "https://example.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
```


#### 기본으로 쿠키를 보내지 않음 {#no-more-cookie-by-default}

이전 버전에서는 기본적으로 `io` 쿠키를 보냈습니다. 이 쿠키는 스티키 세션을 활성화하는 데 쓸 수 있습니다. 서버가 여러 대이고 HTTP 롱 폴링을 사용한다면 스티키 세션은 여전히 필요합니다(자세한 내용은 [여러 노드 사용하기](../02-Server/using-multiple-nodes.md) 참고).

하지만 서버 한 대로 배포하거나 IP 기반 스티키 세션을 쓰는 경우처럼 이 쿠키가 필요 없을 때도 있으므로 이제는 명시적으로 활성화해야 합니다.

변경 전:

```js
const io = require("socket.io")(httpServer, {
  cookieName: "io",
  cookieHttpOnly: false,
  cookiePath: "/custom"
});
```

변경 후:

```js
const io = require("socket.io")(httpServer, {
  cookie: {
    name: "test",
    httpOnly: false,
    path: "/custom"
  }
});
```

이제 나머지 쿠키 옵션(domain, maxAge, sameSite 등)도 모두 지원합니다. 전체 옵션 목록은 [여기](https://github.com/jshttp/cookie/)를 참고하세요.


### API 변경 {#api-change}

아래는 호환성을 깨는 변경 사항입니다. 

#### io.set() 제거 {#ioset-is-removed}

이 메서드는 1.0 릴리스에서 지원 중단되었지만 하위 호환성을 위해 남아 있었습니다. 이제 제거되었습니다.

이 메서드는 미들웨어로 대체되었습니다.

변경 전:

```js
io.set("authorization", (handshakeData, callback) => {
  // 핸드셰이크 데이터가 올바른지 확인
  callback(null, true); // 첫 번째 인자는 오류, 두 번째 인자는 "authorized" 불리언 
});
```

변경 후:

```js
io.use((socket, next) => {
  var handshakeData = socket.request;
  // 이전과 마찬가지로 핸드셰이크 데이터가 올바른지 확인
  // 오류가 있으면 다음과 같이 호출:
    // next(new Error("not authorized"));
  // 아니면 그냥 next 호출
  next();
});
```

#### 기본 네임스페이스에 암묵적으로 연결하지 않음 {#no-more-implicit-connection-to-the-default-namespace}

이 변경 사항은 멀티플렉싱 기능(Socket.IO에서 네임스페이스라고 부르는 기능)을 사용하는 사용자에게 영향을 줍니다.

이전 버전에서는 클라이언트가 다른 네임스페이스에 접근을 요청하더라도 항상 기본 네임스페이스(`/`)에 연결했습니다. 그래서 기본 네임스페이스에 등록한 미들웨어도 실행되었고, 이 동작은 꽤 당황스러울 수 있습니다.

```js
// 클라이언트 측
const socket = io("/admin");

// 서버 측
io.use((socket, next) => {
  // 더 이상 실행되지 않음
});

io.on("connection", socket => {
  // 더 이상 실행되지 않음
})

io.of("/admin").use((socket, next) => {
  // 실행됨
});
```

또한 앞으로는 "기본(default)" 네임스페이스 대신 "메인(main)" 네임스페이스라고 부릅니다.


#### Namespace.connected가 Namespace.sockets로 이름이 바뀌고 Map이 됨 {#namespaceconnected-is-renamed-to-namespacesockets-and-is-now-a-map}

`connected` 객체에는 네임스페이스에 연결된 모든 Socket이 저장되어 있어서 ID로 Socket 객체를 가져올 수 있었습니다. 이제 이 객체는 ES6 [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)입니다.

변경 전:

```js
// 메인 네임스페이스에서 ID로 socket 가져오기
const socket = io.of("/").connected[socketId];

// "admin" 네임스페이스에서 ID로 socket 가져오기
const socket = io.of("/admin").connected[socketId];

// 모든 socket 순회하기
const sockets = io.of("/").connected;
for (const id in sockets) {
  if (sockets.hasOwnProperty(id)) {
    const socket = sockets[id];
    // ...
  }
}

// 연결된 socket 개수 구하기
const count = Object.keys(io.of("/").connected).length;
```

변경 후:

```js
// 메인 네임스페이스에서 ID로 socket 가져오기
const socket = io.of("/").sockets.get(socketId);

// "admin" 네임스페이스에서 ID로 socket 가져오기
const socket = io.of("/admin").sockets.get(socketId);

// 모든 socket 순회하기
for (const [_, socket] of io.of("/").sockets) {
  // ...
}

// 연결된 socket 개수 구하기
const count = io.of("/").sockets.size;
```

#### Socket.rooms가 Set이 됨 {#socketrooms-is-now-a-set}

`rooms` 속성에는 Socket이 현재 참여한 룸 목록이 들어 있습니다. 기존에는 객체였지만 이제 ES6 [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)입니다.

변경 전:

```js
io.on("connection", (socket) => {

  console.log(Object.keys(socket.rooms)); // [ <socket.id> ]

  socket.join("room1");

  console.log(Object.keys(socket.rooms)); // [ <socket.id>, "room1" ]

});
```

변경 후:

```js
io.on("connection", (socket) => {

  console.log(socket.rooms); // Set { <socket.id> }

  socket.join("room1");

  console.log(socket.rooms); // Set { <socket.id>, "room1" }

});
```

#### Socket.binary() 제거 {#socketbinary-is-removed}

`binary`  메서드를 사용하면 특정 이벤트에 바이너리 데이터가 없다고 알릴 수 있었습니다. 라이브러리가 바이너리 데이터를 찾는 과정을 건너뛰게 해서 특정 상황에서 성능을 높이려는 용도였습니다.

이 메서드는 Socket.IO 2.0에서 추가된 커스텀 파서 기능으로 대체되었습니다.

변경 전:

```js
socket.binary(false).emit("hello", "no binary");
```

변경 후:

```js
const io = require("socket.io")(httpServer, {
  parser: myCustomParser
});
```

예시는 [socket.io-msgpack-parser](https://github.com/socketio/socket.io-msgpack-parser)를 참고하세요.


#### Socket.join()과 Socket.leave()가 동기 방식이 됨 {#socketjoin-and-socketleave-are-now-synchronous}

초기 버전의 Redis 어댑터에는 비동기 방식이 필요했지만 지금은 그렇지 않습니다.

참고로 어댑터는 Socket과 [룸](../04-Events/rooms.md)의 관계를 저장하는 객체입니다. 공식 어댑터는 내장된 인메모리 어댑터와 Redis [pub-sub 메커니즘](https://redis.io/topics/pubsub)을 기반으로 하는 [Redis 어댑터](https://github.com/socketio/socket.io-redis), 두 가지입니다.

변경 전:
    
```js
socket.join("room1", () => {
 io.to("room1").emit("hello");
});

socket.leave("room2", () => {
  io.to("room2").emit("bye");
});
```

변경 후:

```js
socket.join("room1");
io.to("room1").emit("hello");

socket.leave("room2");
io.to("room2").emit("bye");
```

참고: 커스텀 어댑터는 Promise를 반환할 수 있으므로 앞의 예시는 다음과 같이 바뀝니다.

```js
await socket.join("room1");
io.to("room1").emit("hello");
```


#### ~~Socket.use() 제거~~ {#socketuse-is-removed}

`socket.use()`는 모든 이벤트를 받는 리스너(catch-all listener)처럼 쓸 수 있었습니다. 하지만 API가 그다지 직관적이지 않았습니다. 이 메서드는 [socket.onAny()](#catch-all-listeners)로 대체되었습니다.

**업데이트**: `Socket.use()` 메서드는 [`socket.io@3.0.5`](https://github.com/socketio/socket.io/releases/3.0.5)에서 다시 추가되었습니다.

변경 전:

```js
socket.use((packet, next) => {
  console.log(packet.data);
  next();
});
```

변경 후:

```js
socket.onAny((event, ...args) => {
  console.log(event);
});
```


#### 미들웨어 오류가 이제 Error 객체를 전송함 {#a-middleware-error-will-now-emit-an-error-object}

`error` 이벤트의 이름이 `connect_error`로 바뀌었고, 이제 이 이벤트로 실제 Error 객체가 전달됩니다.

변경 전:

```js
// 서버 측
io.use((socket, next) => {
  next(new Error("not authorized"));
});

// 클라이언트 측
socket.on("error", err => {
  console.log(err); // not authorized
});

// 또는 객체를 사용할 때
// 서버 측
io.use((socket, next) => {
  const err = new Error("not authorized");
  err.data = { content: "Please retry later" }; // 추가 정보
  next(err);
});

// 클라이언트 측
socket.on("error", err => {
  console.log(err); // { content: "Please retry later" }
});
```

변경 후:

```js
// 서버 측
io.use((socket, next) => {
  const err = new Error("not authorized");
  err.data = { content: "Please retry later" }; // 추가 정보
  next(err);
});

// 클라이언트 측
socket.on("connect_error", err => {
  console.log(err instanceof Error); // true
  console.log(err.message); // not authorized
  console.log(err.data); // { content: "Please retry later" }
});
```


#### Manager의 query 옵션과 Socket의 query 옵션을 명확히 구분 {#add-a-clear-distinction-between-the-manager-query-option-and-the-socket-query-option}

이전 버전에서는 `query` 옵션이 서로 다른 두 곳에 쓰였습니다.

- HTTP 요청의 쿼리 매개변수(`GET /socket.io/?EIO=3&abc=def`)
- `CONNECT` 패킷

다음 예시를 살펴보겠습니다.

```js
const socket = io({
  query: {
    token: "abc"
  }
});
```

내부적으로 `io()` 메서드에서는 다음과 같은 일이 일어났습니다.

```js
const { Manager } = require("socket.io-client");

// 새 Manager를 생성 (저수준 연결을 관리함)
const manager = new Manager({
  query: { // 쿼리 매개변수로 전송됨
    token: "abc"
  }
});

// 그다음 네임스페이스용 Socket 인스턴스를 생성 (여기서는 메인 네임스페이스 "/")
const socket = manager.socket("/", {
  query: { // CONNECT 패킷으로 전송됨
    token: "abc"
  }
});
```

이 동작 때문에 이상한 결과가 나올 수 있었습니다. 예를 들어 Manager를 다른 네임스페이스에 재사용할 때(멀티플렉싱) 다음과 같은 일이 생겼습니다.

```js
// 클라이언트 측
const socket1 = io({
  query: {
    token: "abc"
  }
});

const socket2 = io("/my-namespace", {
  query: {
    token: "def"
  }
});

// 서버 측
io.on("connection", (socket) => {
  console.log(socket.handshake.query.token); // abc (정상!)
});

io.of("/my-namespace").on("connection", (socket) => {
  console.log(socket.handshake.query.token); // abc (어라?)
});
```

그래서 Socket.IO v3에서는 Socket 인스턴스의 `query` 옵션 이름이 `auth`로 바뀌었습니다.

```js
// 일반 객체
const socket = io({
  auth: {
    token: "abc"
  }
});

// 또는 함수 사용
const socket = io({
  auth: (cb) => {
    cb({
      token: "abc"
    });
  }
});

// 서버 측
io.on("connection", (socket) => {
  console.log(socket.handshake.auth.token); // abc
});
```

참고: HTTP 요청에 특정 쿼리 매개변수를 추가할 때는 여전히 Manager의 `query` 옵션을 사용할 수 있습니다.


#### Socket 인스턴스가 더 이상 Manager의 이벤트를 전달하지 않음 {#the-socket-instance-will-no-longer-forward-the-events-emitted-by-its-manager}

이전 버전에서는 Socket 인스턴스가 기반 연결의 상태와 관련된 이벤트를 전송했습니다. 이제는 그렇지 않습니다.

이 이벤트는 여전히 Manager 인스턴스(Socket 인스턴스의 `io` 속성)에서 받을 수 있습니다.

변경 전:

```js
socket.on("reconnect_attempt", () => {});
```

변경 후:

```js
socket.io.on("reconnect_attempt", () => {});
```

Manager가 전송하는 이벤트의 변경된 목록은 다음과 같습니다.

| 이름 | 설명 | 이전 이름(다른 경우) |
| ---- | ----------- | ------------------------- |
| open | (재)연결 성공 | - |
| error | (재)연결 실패 또는 연결 성공 후 발생한 오류 | connect_error |
| close | 연결 끊김 | - |
| ping | ping 패킷 | - |
| packet | 데이터 패킷 | - |
| reconnect_attempt | 재연결 시도 | reconnect_attempt & reconnecting | - |
| reconnect | 재연결 성공 | - |
| reconnect_error | 재연결 실패 | - |
| reconnect_failed | 모든 시도 후 재연결 실패 | - |

Socket이 전송하는 이벤트의 변경된 목록은 다음과 같습니다.

| 이름 | 설명 | 이전 이름(다른 경우) |
| ---- | ----------- | ------------------------- |
| connect | 네임스페이스 연결 성공 | - |
| connect_error | 연결 실패 | error |
| disconnect | 연결 끊김 | - |


마지막으로 애플리케이션에서 사용할 수 없는 예약 이벤트 목록도 다음과 같이 바뀌었습니다.

- `connect` (클라이언트 측에서 사용)
- `connect_error` (클라이언트 측에서 사용)
- `disconnect` (양쪽에서 사용)
- `disconnecting` (서버 측에서 사용)
- `newListener`와 `removeListener` (EventEmitter의 [예약 이벤트](https://nodejs.org/api/events.html#events_event_newlistener))

```js
socket.emit("connect_error"); // 이제 Error가 발생함
```


#### Namespace.clients()가 Namespace.allSockets()로 이름이 바뀌고 Promise를 반환함 {#namespaceclients-is-renamed-to-namespaceallsockets-and-now-returns-a-promise}

이 함수는 네임스페이스에 연결된 socket ID 목록을 반환합니다.

변경 전:

```js
// 기본 네임스페이스의 모든 socket
io.clients((error, clients) => {
  console.log(clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
});

// "chat" 네임스페이스의 모든 socket
io.of("/chat").clients((error, clients) => {
  console.log(clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
});

// "chat" 네임스페이스에서 "general" 룸에 있는 모든 socket
io.of("/chat").in("general").clients((error, clients) => {
  console.log(clients); // => [Anw2LatarvGVVXEIAAAD]
});
```

변경 후:

```js
// 기본 네임스페이스의 모든 socket
const ids = await io.allSockets();

// "chat" 네임스페이스의 모든 socket
const ids = await io.of("/chat").allSockets();

// "chat" 네임스페이스에서 "general" 룸에 있는 모든 socket
const ids = await io.of("/chat").in("general").allSockets();
```

참고: Redis 어댑터는 예전부터 이 함수를 지원했고 지금도 지원합니다. 따라서 이 함수는 모든 Socket.IO 서버의 socket ID 목록을 반환합니다.

#### 클라이언트 번들 {#client-bundles}

이제 번들을 세 가지로 제공합니다.

| 이름              | 크기             | 설명 |
|:------------------|:-----------------|:------------|
| socket.io.js               | 34.7 kB gzip     | minify하지 않은 버전, [debug](https://www.npmjs.com/package/debug) 포함    |
| socket.io.min.js           | 14.7 kB min+gzip | 프로덕션 버전, [debug](https://www.npmjs.com/package/debug) 미포함 |
| socket.io.msgpack.min.js   | 15.3 kB min+gzip | 프로덕션 버전, [debug](https://www.npmjs.com/package/debug) 미포함, [msgpack 파서](https://github.com/socketio/socket.io-msgpack-parser) 포함    |

기본적으로 서버는 이 번들을 모두 `/socket.io/<name>` 경로로 제공합니다.

변경 전:

```html
<!-- 참고: 이 번들은 실제로는 minify된 번들이었지만 debug 패키지가 들어 있었음 -->
<script src="/socket.io/socket.io.js"></script>
```

변경 후:

```html
<!-- 개발 중 -->
<script src="/socket.io/socket.io.js"></script>
<!-- 프로덕션용 -->
<script src="/socket.io/socket.io.min.js"></script>
```

#### 지연 시간 확인용 "pong" 이벤트 제거 {#no-more-pong-event-for-retrieving-latency}

Socket.IO v2에서는 클라이언트 측에서 `pong` 이벤트를 수신할 수 있었고 이 이벤트에는 마지막 상태 확인(health check)의 왕복 시간이 들어 있었습니다.

하트비트 메커니즘의 방향이 뒤바뀌면서(자세한 내용은 [여기](/blog/engine-io-4-release/#heartbeat-mechanism-reversal) 참고) 이 이벤트는 제거되었습니다.

변경 전:

```js
socket.on("pong", (latency) => {
  console.log(latency);
});
```

변경 후:

```js
// 서버 측
io.on("connection", (socket) => {
  socket.on("ping", (cb) => {
    if (typeof cb === "function")
      cb();
  });
});

// 클라이언트 측
setInterval(() => {
  const start = Date.now();

  // volatile이므로 socket이 연결되어 있지 않으면 패킷이 버려짐
  socket.volatile.emit("ping", () => {
    const latency = Date.now() - start;
    // ...
  });
}, 5000);
```

#### ES 모듈 문법 {#es-modules-syntax}

이제 ECMAScript 모듈 문법이 TypeScript 문법과 비슷해졌습니다([아래](#the-socketio-codebase-has-been-rewritten-to-typescript) 참고).

변경 전(default import 사용):

```js
// 서버 측
import Server from "socket.io";

const io = new Server(8080);

// 클라이언트 측
import io from 'socket.io-client';

const socket = io();
```

변경 후(named import 사용):

```js
// 서버 측
import { Server } from "socket.io";

const io = new Server(8080);

// 클라이언트 측
import { io } from 'socket.io-client';

const socket = io();
```

#### 더 이상 `emit()`을 체이닝할 수 없음 {#emit-chains-are-not-possible-anymore}

이제 `emit()` 메서드는 [`EventEmitter.emit()`](https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_emit_eventname_args) 메서드와 시그니처가 같으며 현재 객체 대신 `true`를 반환합니다.

변경 전:

```js
socket.emit("event1").emit("event2");
```

변경 후:

```js
socket.emit("event1");
socket.emit("event2");
```

#### 룸 이름을 더 이상 문자열로 강제 변환하지 않음 {#room-names-are-not-coerced-to-string-anymore}

이제 내부적으로 일반 객체 대신 Map과 Set을 사용하므로 룸 이름을 더 이상 암묵적으로 문자열로 변환하지 않습니다.

변경 전:

```js
// 타입을 섞어 쓸 수 있었음
socket.join(42);
io.to("42").emit("hello");
// 이것도 동작했음
socket.join("42");
io.to(42).emit("hello");
```

변경 후:

```js
// 이렇게 쓰거나
socket.join("42");
io.to("42").emit("hello");
// 이렇게 씀
socket.join(42);
io.to(42).emit("hello");
```

### 새로운 기능 {#new-features}

사용자 피드백에 따라 일부 새로운 기능은 `2.4.x` 브랜치에 백포트될 수 있습니다.


#### catch-all 리스너 {#catch-all-listeners}

이 기능은 [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) 라이브러리에서 영감을 받았습니다. 다만 브라우저 번들 크기가 늘어나지 않도록 이 라이브러리를 직접 사용하지는 않습니다.

서버 측과 클라이언트 측 모두에서 사용할 수 있습니다.

```js
// 서버
io.on("connection", (socket) => {
  socket.onAny((event, ...args) => {});
  socket.prependAny((event, ...args) => {});
  socket.offAny(); // 모든 리스너 제거
  socket.offAny(listener);
  const listeners = socket.listenersAny();
});

// 클라이언트
const socket = io();
socket.onAny((event, ...args) => {});
socket.prependAny((event, ...args) => {});
socket.offAny(); // 모든 리스너 제거
socket.offAny(listener);
const listeners = socket.listenersAny();
```


#### 휘발성 이벤트(클라이언트) {#volatile-events-client}

휘발성 이벤트(volatile event)는 저수준 전송 방식이 아직 준비되지 않았을 때(예를 들어 HTTP POST 요청이 이미 대기 중일 때) 버려도 되는 이벤트입니다.

이 기능은 서버 측에서는 이미 사용할 수 있었는데 클라이언트 측에서도 유용할 수 있습니다. 예를 들어 소켓이 연결되어 있지 않을 때 쓸 수 있습니다(기본적으로 패킷은 재연결될 때까지 버퍼에 쌓입니다).

```js
socket.volatile.emit("volatile event", "might or might not be sent");
```


#### msgpack 파서를 포함한 공식 번들 {#official-bundle-with-the-msgpack-parser}

이제 [socket.io-msgpack-parser](https://github.com/socketio/socket.io-msgpack-parser)를 포함한 번들을 제공합니다. 이 번들은 CDN에서 받거나 서버의 `/socket.io/socket.io.msgpack.min.js` 경로에서 받을 수 있습니다.

장점:

- 바이너리 데이터가 있는 이벤트를 WebSocket 프레임 1개로 보냅니다(기본 파서는 2개 이상).
- 숫자가 많은 페이로드의 크기가 더 작아집니다.

단점:

- IE9을 지원하지 않습니다(https://caniuse.com/mdn-javascript_builtins_arraybuffer).
- 번들 크기가 조금 더 큽니다.

```js
// 서버 측
const io = require("socket.io")(httpServer, {
  parser: require("socket.io-msgpack-parser")
});
```

클라이언트 측에는 추가 설정이 필요 없습니다.


### 기타 {#miscellaneous}

#### Socket.IO 코드베이스를 TypeScript로 다시 작성 {#the-socketio-codebase-has-been-rewritten-to-typescript}

따라서 더 이상 `npm i -D @types/socket.io`를 설치할 필요가 없습니다.

서버:

```ts
import { Server, Socket } from "socket.io";

const io = new Server(8080);

io.on("connection", (socket: Socket) => {
    console.log(`connect ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`disconnect ${socket.id}`);
    });
});
```

클라이언트:

```ts
import { io } from "socket.io-client";

const socket = io("/");

socket.on("connect", () => {
    console.log(`connect ${socket.id}`);
});
```

물론 일반 JavaScript도 여전히 완벽하게 지원합니다.


#### IE8과 Node.js 8 공식 지원 종료 {#support-for-ie8-and-nodejs-8-is-officially-dropped}

IE8은 더 이상 Sauce Labs 플랫폼에서 테스트할 수 없습니다. 게다가 사용자는 거의 없는데(있기는 할까요?) 들여야 하는 노력은 많아서 지원을 중단합니다.

또한 Node.js 8은 이제 [EOL](https://github.com/nodejs/Release)(지원 종료)입니다. 가능한 한 빨리 업그레이드하세요!


### 기존 프로덕션 배포를 업그레이드하는 방법 {#how-to-upgrade-an-existing-production-deployment}

- 먼저 `allowEIO3`를 `true`로 설정해 서버를 업데이트하세요(`socket.io@3.1.0`에서 추가됨).

```js
const io = require("socket.io")({
  allowEIO3: true // 기본값은 false
});
```

참고: Redis 어댑터로 [노드 간에 패킷을 브로드캐스트](../04-Events/broadcasting-events.md#with-multiple-socketio-servers)한다면 `socket.io@2`에는 `socket.io-redis@5`를, `socket.io@3`에는 `socket.io-redis@6`을 사용해야 합니다. 두 버전은 서로 호환되므로 서버를 한 대씩 업데이트할 수 있습니다(한꺼번에 전환할 필요가 없습니다).

- 그다음 클라이언트를 업데이트하세요.

일부 클라이언트에는 아직 v2 버전이 캐시에 남아 있을 수 있으므로 이 단계는 시간이 꽤 걸릴 수 있습니다.

연결의 버전은 다음과 같이 확인할 수 있습니다.

```js
io.on("connection", (socket) => {
  const version = socket.conn.protocol; // 3 또는 4
});
```

이 값은 HTTP 요청의 `EIO` 쿼리 매개변수 값과 같습니다.

- 마지막으로 모든 클라이언트를 업데이트했다면 `allowEIO3`를 `false`(기본값)로 설정하세요.

```js
const io = require("socket.io")({
  allowEIO3: false
});
```

`allowEIO3`를 `false`로 설정하면 v2 클라이언트는 연결할 때 HTTP 400 오류(`Unsupported protocol version`)를 받습니다.


### 알려진 마이그레이션 문제 {#known-migration-issues}

- `stream_1.pipeline is not a function`

```
TypeError: stream_1.pipeline is not a function
    at Function.sendFile (.../node_modules/socket.io/dist/index.js:249:26)
    at Server.serve (.../node_modules/socket.io/dist/index.js:225:16)
    at Server.srv.on (.../node_modules/socket.io/dist/index.js:186:22)
    at emitTwo (events.js:126:13)
    at Server.emit (events.js:214:7)
    at parserOnIncoming (_http_server.js:602:12)
    at HTTPParser.parserOnHeadersComplete (_http_common.js:116:23)
```

이 오류는 Node.js 버전 때문일 가능성이 높습니다. [pipeline](https://nodejs.org/api/stream.html#stream_stream_pipeline_source_transforms_destination_callback) 메서드는 Node.js 10.0.0에서 도입되었습니다.


- `error TS2416: Property 'emit' in type 'Namespace' is not assignable to the same property in base type 'EventEmitter'.`

```
node_modules/socket.io/dist/namespace.d.ts(89,5): error TS2416: Property 'emit' in type 'Namespace' is not assignable to the same property in base type 'EventEmitter'.
  Type '(ev: string, ...args: any[]) => Namespace' is not assignable to type '(event: string | symbol, ...args: any[]) => boolean'.
    Type 'Namespace' is not assignable to type 'boolean'.
node_modules/socket.io/dist/socket.d.ts(84,5): error TS2416: Property 'emit' in type 'Socket' is not assignable to the same property in base type 'EventEmitter'.
  Type '(ev: string, ...args: any[]) => this' is not assignable to type '(event: string | symbol, ...args: any[]) => boolean'.
    Type 'this' is not assignable to type 'boolean'.
      Type 'Socket' is not assignable to type 'boolean'.
```

`emit()` 메서드의 시그니처는 `3.0.1` 버전에서 수정되었습니다([커밋](https://github.com/socketio/socket.io/commit/50671d984a81535a6a15c704546ca7465e2ea295)).


- 큰 페이로드(> 1MB)를 보낼 때 클라이언트의 연결이 끊김

`maxHttpBufferSize`의 기본값이 이제 `1MB`이기 때문일 가능성이 높습니다. 서버는 악의적인 클라이언트가 과부하를 일으키지 못하도록 이보다 큰 패킷을 받으면 그 클라이언트의 연결을 끊습니다.

서버를 생성할 때 이 값을 조정할 수 있습니다.

```js
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: 1e8
});
```

- `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at xxx/socket.io/?EIO=4&transport=polling&t=NMnp2WI. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing).`

Socket.IO v3부터는 [교차 출처 리소스 공유](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)(CORS)를 명시적으로 활성화해야 합니다. 자세한 내용은 [CORS 처리하기](../02-Server/handling-cors.md) 문서를 참고하세요.

- `Uncaught TypeError: packet.data is undefined`

v3 클라이언트로 v2 서버에 연결하려는 것으로 보입니다. 이 조합으로는 연결할 수 없습니다. [다음 섹션](#how-to-upgrade-an-existing-production-deployment)을 참고하세요.

- `Object literal may only specify known properties, and 'extraHeaders' does not exist in type 'ConnectOpts'`

코드베이스를 TypeScript로 다시 작성했으므로(자세한 내용은 [여기](#the-socketio-codebase-has-been-rewritten-to-typescript) 참고) `@types/socket.io-client`는 더 이상 필요 없습니다. 오히려 `socket.io-client` 패키지에 포함된 타입 정의와 충돌합니다.

- 다른 출처(cross-origin) 환경에서 쿠키가 전송되지 않음

프런트엔드를 백엔드와 다른 도메인에서 제공한다면 이제 쿠키를 명시적으로 활성화해야 합니다.

*서버*

```js
import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: ["https://front.domain.com"],
    credentials: true
  }
});
```

*클라이언트*

```js
import { io } from "socket.io-client";

const socket = io("https://backend.domain.com", {
  withCredentials: true
});
````

참고:

- [CORS 처리하기](../02-Server/handling-cors.md)
- [`cors`](../../server-api.md#cors) 옵션
- [`withCredentials`](../../client-api.md#withcredentials) 옵션
