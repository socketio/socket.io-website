---
title: 서버 API
sidebar_label: API
sidebar_position: 1
slug: /server-api/
toc_max_heading_level: 4
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## Server {#server}

<ThemedImage
  alt="서버 클래스 다이어그램의 Server"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-server.png'),
    dark: useBaseUrl('/images/server-class-diagram-server-dark.png'),
  }}
/>

관련 문서:

- [설치](categories/02-Server/server-installation.md)
- [초기화](categories/02-Server/server-initialization.md)
- [Server 인스턴스](categories/02-Server/server-instance.md)

### 생성자 {#constructor}

#### new Server(httpServer[, options]) {#new-serverhttpserver-options}

- `httpServer` [`<http.Server>`](https://nodejs.org/api/http.html#class-httpserver) | [`<https.Server>`](https://nodejs.org/api/https.html#class-httpsserver)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // 옵션
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

사용할 수 있는 전체 옵션 목록은 [서버 옵션](server-options.md) 문서를 참고하세요.

#### new Server(port[, options]) {#new-serverport-options}

- `port` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

```js
import { Server } from "socket.io";

const io = new Server(3000, {
  // 옵션
});

io.on("connection", (socket) => {
  // ...
});
```

사용할 수 있는 전체 옵션 목록은 [서버 옵션](server-options.md) 문서를 참고하세요.

#### new Server(options) {#new-serveroptions}

  - `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

```js
import { Server } from "socket.io";

const io = new Server({
  // 옵션
});

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

사용할 수 있는 전체 옵션 목록은 [서버 옵션](server-options.md) 문서를 참고하세요.

### 이벤트 {#events}

#### Event: 'connect' {#event-connect}

[Event: "connection"](#event-connection)과 같습니다.

#### Event: 'connection' {#event-connection}

- `socket` _(Socket)_ 클라이언트와 맺은 소켓 연결

클라이언트가 연결하면 발생합니다.

```js
io.on("connection", (socket) => {
  // ...
});
```

#### Event: 'new_namespace' {#event-new_namespace}

- `namespace` [`Namespace`](#namespace)

새 네임스페이스가 생성되면 발생합니다.

```js
io.on("new_namespace", (namespace) => {
  // ...
});
```

다음과 같은 경우에 유용합니다.

- 모든 네임스페이스에 공통 미들웨어를 붙일 때

```js
io.on("new_namespace", (namespace) => {
  namespace.use(myMiddleware);
});
```

- [동적으로 생성된](categories/06-Advanced/namespaces.md#dynamic-namespaces) 네임스페이스를 추적할 때

```js
io.of(/\/nsp-\w+/);

io.on("new_namespace", (namespace) => {
  console.log(namespace.name);
});
```

### 속성 {#attributes}

#### server.engine {#serverengine}

내부 Engine.IO 서버를 가리키는 참조입니다. 자세한 내용은 [Engine](#engine)을 참고하세요.

#### server.sockets {#serversockets}

  * [`<Namespace>`](#namespace)

메인 네임스페이스(`/`)의 별칭입니다.

```js
io.sockets.emit("hi", "everyone");
// 다음 코드와 같습니다
io.of("/").emit("hi", "everyone");
```

### 메서드 {#methods}

:::note

`Server` 인스턴스는 메인 네임스페이스(`/`)를 대상으로 하는 편의 메서드를 몇 가지 제공합니다.

예를 들어 다음 코드는

```js
io.on("connection", (socket) => {});
io.use((socket, next) => next());
io.emit("hello");
```

아래 코드와 같습니다.

```js
io.of("/").on("connection", (socket) => {});
io.of("/").use((socket, next) => next());
io.of("/").emit("hello");
```

단, 이 규칙은 `connection`, `connect`처럼 네임스페이스와 관련된 이벤트에만 적용됩니다. `new_namespace` 같은 다른 이벤트는 `Server` 인스턴스가 직접 발생시킵니다.

다음 메서드, 속성, 플래그에도 같은 규칙이 적용됩니다.

| 단축 표기                       | 동일한 코드                             |
|---------------------------------|-----------------------------------------|
| `io.on("connection", listener)` | `io.of("/").on("connection", listener)` |
| `io.emit(...)`                  | `io.of("/").emit(...)`                  |
| `io.emitWithAck(...)`           | `io.of("/").emitWithAck(...)`           |
| `io.to(room)`                   | `io.of("/").to(room)`                   |
| `io.in(room)`                   | `io.of("/").in(room)`                   |
| `io.except(room)`               | `io.of("/").except(room)`               |
| `io.timeout(value)`             | `io.of("/").timeout(value)`             |
| `io.use(fn)`                    | `io.of("/").use(fn)`                    |
| `io.allSockets()`               | `io.of("/").allSockets()`               |
| `io.fetchSockets()`             | `io.of("/").fetchSockets()`             |
| `io.socketsJoin(rooms)`         | `io.of("/").socketsJoin(rooms)`         |
| `io.socketsLeave(rooms)`        | `io.of("/").socketsLeave(rooms)`        |
| `io.disconnectSockets([close])` | `io.of("/").disconnectSockets([close])` |
| `io.serverSideEmit(...)`        | `io.of("/").serverSideEmit(...)`        |
| `io.serverSideEmitWithAck(...)` | `io.of("/").serverSideEmitWithAck(...)` |
| `io.local`                      | `io.of("/").local`                      |
| `io.volatile`                   | `io.of("/").volatile`                   |
| `io.sockets`                    | `io.of("/")`                            |

:::

#### server.adapter([value]) {#serveradaptervalue}

다음 메서드와 플래그에도 같은 규칙이 적용됩니다.

| 단축 표기                       | 동일한 코드                             |
|---------------------------------|-----------------------------------------|
| `io.on("connection", listener)` | `io.of("/").on("connection", listener)` |
| `io.emit(...)`                  | `io.of("/").emit(...)`                  |
| `io.emitWithAck(...)`           | `io.of("/").emitWithAck(...)`           |
| `io.to(room)`                   | `io.of("/").to(room)`                   |
| `io.in(room)`                   | `io.of("/").in(room)`                   |
| `io.except(room)`               | `io.of("/").except(room)`               |
| `io.timeout(value)`             | `io.of("/").timeout(value)`             |
| `io.use(fn)`                    | `io.of("/").use(fn)`                    |
| `io.fetchSockets()`             | `io.of("/").fetchSockets()`             |
| `io.socketsJoin(rooms)`         | `io.of("/").socketsJoin(rooms)`         |
| `io.socketsLeave(rooms)`        | `io.of("/").socketsLeave(rooms)`        |
| `io.disconnectSockets([close])` | `io.of("/").disconnectSockets([close])` |
| `io.serverSideEmit(...)`        | `io.of("/").serverSideEmit(...)`        |
| `io.serverSideEmitWithAck(...)` | `io.of("/").serverSideEmitWithAck(...)` |
| `io.local`                      | `io.of("/").local`                      |
| `io.volatile`                   | `io.of("/").volatile`                   |
| `io.sockets`                    | `io.of("/")`                            |

:::

#### server.adapter([value]) {#serveradaptervalue-1}

- `value` [`<Adapter>`](categories/05-Adapters/adapter.md)
- **반환값** [`<Server>`](#server) | [`<Adapter>`](categories/05-Adapters/adapter.md)

어댑터를 `value`로 설정합니다. 기본값은 socket.io에 함께 들어 있는 메모리 기반 `Adapter`의 인스턴스입니다. 자세한 내용은 [socket.io-adapter](https://github.com/socketio/socket.io-adapter)를 참고하세요. 인자 없이 호출하면 현재 값을 반환합니다.

```js
import { Server } from "socket.io"; 
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const io = new Server();

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// redis@3
io.listen(3000);

// redis@4
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.listen(3000);
});
```

#### server.attach(httpServer[, options]) {#serverattachhttpserver-options}

- `httpServer` [`<http.Server>`](https://nodejs.org/api/http.html#class-httpserver) | [`<https.Server>`](https://nodejs.org/api/https.html#class-httpsserver)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

주어진 `options`로 `Server`를 `httpServer`에 연결합니다.

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server();

io.attach(httpServer);

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

#### server.attach(port[, options]) {#serverattachport-options}

- `port` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

주어진 `options`로 `Server`를 지정한 `port`에 연결합니다.

```js
import { Server } from "socket.io";

const io = new Server();

io.attach(3000);

io.on("connection", (socket) => {
  // ...
});
```

#### server.attachApp(app[, options]) {#serverattachappapp-options}

- `app` [`<uws.App>`](https://unetworking.github.io/uWebSockets.js/generated/interfaces/TemplatedApp.html)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

Socket.IO 서버를 [µWebSockets.js](https://github.com/uNetworking/uWebSockets.js) 앱에 연결합니다.

```js
import { App } from "uWebSockets.js";
import { Server } from "socket.io";

const app = App();
const io = new Server();

io.attachApp(app);

io.on("connection", (socket) => {
  // ...
});

app.listen(3000, (token) => {
  if (!token) {
    console.warn("port already in use");
  }
});
```

#### server.bind(engine) {#serverbindengine}

- `engine` `<engine.Server>`
- **반환값** [`<Server>`](#server)

고급 사용자용입니다. 서버를 특정 engine.io `Server`(또는 호환 API) 인스턴스에 바인딩합니다.

```js
import { createServer } from "node:http";
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";

const httpServer = createServer((req, res) => {
  res.writeHead(404).end();
});

const engine = new Engine();

engine.attach(httpServer, {
  path: "/socket.io/"
});

const io = new Server();

io.bind(engine);

httpServer.listen(3000);
```

#### server.close([callback]) {#serverclosecallback}

- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Socket.IO 서버를 닫고 모든 클라이언트의 연결을 끊습니다. `callback` 인자는 선택 사항이며, 모든 연결이 닫히면 호출됩니다.

:::info

내부 HTTP 서버도 함께 닫힙니다.

:::

```js
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3030;
const io = new Server(PORT);

io.close();

const httpServer = createServer();

httpServer.listen(PORT); // 이제 PORT를 사용할 수 있습니다

io.attach(httpServer);
```

:::note

내부 HTTP 서버만 닫는 것으로는 부족합니다. 새 연결은 받지 않지만, WebSocket으로 연결된 클라이언트의 연결은 바로 끊기지 않습니다.

참고: https://nodejs.org/api/http.html#serverclosecallback

:::

#### server.disconnectSockets([close]) {#serverdisconnectsocketsclose}

*v4.0.0에서 추가*

[`io.of("/").disconnectSockets(close)`](#namespacedisconnectsocketsclose)의 별칭입니다.

```js
// 모든 Socket 인스턴스의 연결을 끊습니다
io.disconnectSockets();

// "room1" 룸에 있는 모든 Socket 인스턴스의 연결을 끊고 저수준 연결도 닫습니다
io.in("room1").disconnectSockets(true);
```

:::tip

이 메서드는 [Postgres 어댑터](./categories/05-Adapters/adapter-postgres.md) 같은 호환 어댑터를 쓰면 여러 Socket.IO 서버로 이루어진 클러스터에서도 동작합니다.

이때 현재 노드의 Socket 인스턴스에만 적용하려면 `local` 플래그를 사용해야 합니다.

```js
// 현재 노드에 연결된 모든 Socket 인스턴스의 연결을 끊습니다
io.local.disconnectSockets();
```

:::

자세한 내용은 [유틸리티 메서드](categories/02-Server/server-instance.md#utility-methods)를 참고하세요.

#### server.emit(eventName[, ...args]) {#serveremiteventname-args}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전    | 변경 사항                                  |
|---------|--------------------------------------------|
| v4.5.0  | `io.emit()`에서 확인 응답(acknowledgement)을 지원합니다. |
| v1.0.0  | 최초 구현.                                 |

</details>

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `args` `any[]`
- **반환값** `true`

메인 네임스페이스에 연결된 모든 클라이언트에게 이벤트를 보냅니다.

```js
io.emit("hello");
```

인자는 개수 제한 없이 보낼 수 있으며, 직렬화할 수 있는 데이터 구조는 모두 지원합니다.

```js
io.emit("hello", 1, "2", { "3": 4 }, Buffer.from([5]));
```

받는 쪽에서는 다음과 같이 처리합니다.

```js
socket.on("hello", (arg1, arg2, arg3, arg4) => {
  console.log(arg1); // 1
  console.log(arg2); // "2"
  console.log(arg3); // { "3": 4 }
  console.log(arg4); // 플랫폼에 따라 ArrayBuffer 또는 Buffer
});
```

:::info

인자는 자동으로 직렬화되므로 `JSON.stringify()`를 호출할 필요가 없습니다.

:::

[`to()`](#servertoroom)와 [`except()`](#serverexceptrooms)를 사용하면 특정 클라이언트에게만 패킷을 보낼 수 있습니다.

```js
// "room1" 룸이나 "room2" 룸에 있는 연결된 모든 클라이언트에게 "hello" 이벤트를 브로드캐스트합니다
// 단, "room3" 룸에 있는 클라이언트는 제외합니다
io.to("room1").to("room2").except("room3").emit("hello");
```

`4.5.0` 버전부터는 브로드캐스트할 때도 확인 응답을 사용할 수 있습니다.

```js
io.timeout(10000).emit("some-event", (err, responses) => {
  if (err) {
    // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 클라이언트마다 응답 하나
  }
});
```

:::caution

이때는 반드시 [`timeout()`](#servertimeoutvalue)을 호출해야 합니다.

:::

#### server.emitWithAck(eventName[, ...args]) {#serveremitwithackeventname-args}

*v4.6.0에서 추가*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `args` `any[]`
- **반환값** [`Promise<any[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

이벤트를 브로드캐스트하고 모든 대상 클라이언트의 확인 응답을 기다리는 동작의 Promise 기반 버전입니다.

```js
try {
  const responses = await io.timeout(10000).emitWithAck("some-event");
  console.log(responses); // 클라이언트마다 응답 하나
} catch (e) {
  // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
}
```

위 예시는 다음 코드와 같습니다.

```js
io.timeout(10000).emit("some-event", (err, responses) => {
  if (err) {
    // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 클라이언트마다 응답 하나
  }
});
```

받는 쪽에서는 다음과 같이 처리합니다.

```js
socket.on("some-event", (callback) => {
  callback("got it"); // 인자는 하나만 받습니다
});
```

#### server.except(rooms) {#serverexceptrooms}

*v4.0.0에서 추가*

- `rooms` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- **반환값** `BroadcastOperator`

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 이벤트는 지정한 `rooms`에 참여하지 않은 클라이언트에게만 *브로드캐스트*됩니다.

```js
// "room-101" 룸에 있는 클라이언트를 제외한 연결된 모든 클라이언트에게 "foo" 이벤트를 브로드캐스트합니다
io.except("room-101").emit("foo", "bar");

// 룸 배열 사용
io.except(["room-101", "room-102"]).emit("foo", "bar");

// 여러 번 체이닝해서 호출
io.except("room-101").except("room-102").emit("foo", "bar");
```

#### server.fetchSockets() {#serverfetchsockets}

*v4.0.0에서 추가*

[`io.of("/").fetchSockets()`](#namespacefetchsockets)의 별칭입니다.

```js
// 메인 네임스페이스의 모든 Socket 인스턴스를 반환합니다
const sockets = await io.fetchSockets();

// 메인 네임스페이스의 "room1" 룸에 있는 모든 Socket 인스턴스를 반환합니다
const sockets = await io.in("room1").fetchSockets();
```

사용 예시:

```js
io.on("connection", (socket) => {
  const userId = computeUserId(socket);

  socket.join(userId);

  socket.on("disconnect", async () => {
    const sockets = await io.in(userId).fetchSockets();
    if (sockets.length === 0) {
      // 이 사용자의 활성 연결이 더 이상 없습니다
    }
  });
});
```

:::tip

이 메서드는 [Postgres 어댑터](./categories/05-Adapters/adapter-postgres.md) 같은 호환 어댑터를 쓰면 여러 Socket.IO 서버로 이루어진 클러스터에서도 동작합니다.

이때 현재 노드의 Socket 인스턴스만 반환하려면 `local` 플래그를 사용해야 합니다.

```js
// 현재 노드에 연결된 모든 Socket 인스턴스를 반환합니다
const sockets = await io.local.fetchSockets();
```

:::

자세한 내용은 [유틸리티 메서드](categories/02-Server/server-instance.md#utility-methods)를 참고하세요.

#### server.in(room) {#serverinroom}

*v1.0.0에서 추가*

[server.to(room)](#servertoroom)과 같지만, 경우에 따라 이쪽이 더 명확할 수 있습니다.

```js
// "room-101" 룸에 있는 모든 클라이언트의 연결을 끊습니다
io.in("room-101").disconnectSockets();
```

#### server.listen(httpServer[, options]) {#serverlistenhttpserver-options}

[server.attach(httpServer[, options])](#serverattachhttpserver-options)와 같습니다.

#### server.listen(port[, options]) {#serverlistenport-options}

[server.attach(port[, options])](#serverattachport-options)와 같습니다.

#### server.of(nsp) {#serverofnsp}

- `nsp` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) | [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** [`<Namespace>`](#namespace)

경로 이름 `nsp`로 식별되는 `Namespace`를 초기화하고 가져옵니다. 이미 초기화된 네임스페이스라면 바로 반환합니다.

```js
const adminNamespace = io.of("/admin");
```

정규식이나 함수를 넘겨 네임스페이스를 동적으로 생성할 수도 있습니다.

```js
const dynamicNsp = io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
  const newNamespace = socket.nsp; // newNamespace.name === "/dynamic-101"

  // 해당 하위 네임스페이스에 있는 모든 클라이언트에게 브로드캐스트합니다
  newNamespace.emit("hello");
});

// 클라이언트 측
const socket = io("/dynamic-101");

// 각 하위 네임스페이스에 있는 모든 클라이언트에게 브로드캐스트합니다
dynamicNsp.emit("hello");

// 모든 하위 네임스페이스에 미들웨어를 적용합니다
dynamicNsp.use((socket, next) => { /* ... */ });
```

함수를 사용하는 경우:

```js
io.of((name, query, next) => {
  // checkToken 메서드는 클라이언트의 연결 허용 여부를 나타내는 불리언을 반환해야 합니다
  next(null, checkToken(query.token));
}).on("connection", (socket) => { /* ... */ });
```

#### server.on(eventName, listener) {#serveroneventname-listener}

*[EventEmitter 클래스](https://nodejs.org/api/events.html#class-eventemitter)에서 상속*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** [`<Server>`](#server)

`eventName` 이벤트의 리스너 배열 끝에 `listener` 함수를 추가합니다.

사용할 수 있는 이벤트:

- [`connection`](#event-connection)
- [`new_namespace`](#event-new_namespace)
- [`serverSideEmit`](#namespaceserversideemiteventname-args) 메서드로 보낸 모든 커스텀 이벤트

```js
io.on("connection", (socket) => {
  // ...
});
```

#### server.onconnection(socket) {#serveronconnectionsocket}

- `socket` `<engine.Socket>`
- **반환값** [`<Server>`](#server)

고급 사용자용입니다. 들어오는 engine.io(또는 호환 API) `Socket`으로 새 `socket.io` 클라이언트를 생성합니다.

```js
import { Server } from "socket.io";
import { Server as Engine } from "engine.io";

const engine = new Engine();
const io = new Server();

engine.on("connection", (socket) => {
  io.onconnection(socket);
});

engine.listen(3000);
```

#### server.path([value]) {#serverpathvalue}

- `value` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- **반환값** [`<Server>`](#server) | [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)

`engine.io`와 정적 파일을 제공할 경로를 `value`로 설정합니다. 기본값은 `/socket.io/`입니다. 인자 없이 호출하면 현재 값을 반환합니다.

```js
import { Server } from "socket.io";

const io = new Server();

io.path("/myownpath/");
```

:::warning

`path` 값은 클라이언트 측 값과 일치해야 합니다.

```js
import { io } from "socket.io-client";

const socket = io({
  path: "/myownpath/"
});
```

:::

#### server.serveClient([value]) {#serverserveclientvalue}

  - `value` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)
  - **반환값** [`<Server>`](#server) | [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

`value`가 `true`이면 Socket.IO가 연결된 서버에서 클라이언트 파일을 제공합니다. 기본값은 `true`입니다. `listen`을 호출한 뒤에는 이 메서드를 호출해도 효과가 없습니다. 인자 없이 호출하면 현재 값을 반환합니다.

```js
import { Server } from "socket.io";

const io = new Server();

io.serveClient(false);

io.listen(3000);
```

#### server.serverSideEmit(eventName[, ...args][, ack]) {#serverserversideemiteventname-args-ack}

*v4.1.0에서 추가*

[`io.of("/").serverSideEmit(/* ... */);`](#namespaceserversideemiteventname-args)의 별칭입니다.

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- `args` `<any[]>`
- `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** `true`

[클러스터](categories/02-Server/using-multiple-nodes.md)의 다른 Socket.IO 서버에 메시지를 보냅니다.

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

확인 응답도 지원합니다.

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

- 인자는 개수 제한 없이 보낼 수 있지만, 현재 바이너리 데이터는 지원하지 않습니다. 인자 배열은 `JSON.stringify`로 직렬화됩니다.

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

#### server.serverSideEmitWithAck(eventName[, ...args]) {#serverserversideemitwithackeventname-args}

*v4.6.0에서 추가*

[`io.of("/").serverSideEmitWithAck(/* ... */);`](#namespaceserversideemitwithackeventname-args)의 별칭입니다.

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- `args` `<any[]>`
- `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** [`Promise<any[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

[클러스터](categories/02-Server/using-multiple-nodes.md)의 다른 Socket.IO 서버에 브로드캐스트하고 확인 응답을 기다리는 동작의 Promise 기반 버전입니다.

```js
try {
  const responses = await io.serverSideEmitWithAck("some-event");
  console.log(responses); // 서버마다 응답 하나(현재 서버 제외)
} catch (e) {
  // 일부 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
}
```

위 예시는 다음 코드와 같습니다.

```js
io.serverSideEmit("some-event", (err, responses) => {
  if (err) {
    // 일부 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 서버마다 응답 하나(현재 서버 제외)
  }
});
```

받는 쪽에서는 다음과 같이 처리합니다.

```js
io.on("some-event", (callback) => {
  callback("got it"); // 인자는 하나만 받습니다
});
```

#### server.socketsJoin(rooms) {#serversocketsjoinrooms}

*v4.0.0에서 추가*

[`io.of("/").socketsJoin(rooms)`](#namespacesocketsjoinrooms)의 별칭입니다.

```js
// 모든 Socket 인스턴스를 "room1" 룸에 참여시킵니다
io.socketsJoin("room1");

// "room1" 룸에 있는 모든 Socket 인스턴스를 "room2", "room3" 룸에 참여시킵니다
io.in("room1").socketsJoin(["room2", "room3"]);

// 소켓 ID 하나만 지정해도 동작합니다
io.in(theSocketId).socketsJoin("room1");
```

:::tip

이 메서드는 [Postgres 어댑터](./categories/05-Adapters/adapter-postgres.md) 같은 호환 어댑터를 쓰면 여러 Socket.IO 서버로 이루어진 클러스터에서도 동작합니다.

이때 현재 노드의 Socket 인스턴스에만 적용하려면 `local` 플래그를 사용해야 합니다.

```js
// 현재 노드에 연결된 모든 Socket 인스턴스를 "room1" 룸에 참여시킵니다
io.local.socketsJoin("room1");
```

:::

자세한 내용은 [유틸리티 메서드](categories/02-Server/server-instance.md#utility-methods)를 참고하세요.

#### server.socketsLeave(rooms) {#serversocketsleaverooms}

*v4.0.0에서 추가*

[`io.of("/").socketsLeave(rooms)`](#namespacesocketsleaverooms)의 별칭입니다.

```js
// 모든 Socket 인스턴스를 "room1" 룸에서 내보냅니다
io.socketsLeave("room1");

// "room1" 룸에 있는 모든 Socket 인스턴스를 "room2", "room3" 룸에서 내보냅니다
io.in("room1").socketsLeave(["room2", "room3"]);

// 소켓 ID 하나만 지정해도 동작합니다
io.in(theSocketId).socketsLeave("room1");
```

:::tip

이 메서드는 [Postgres 어댑터](./categories/05-Adapters/adapter-postgres.md) 같은 호환 어댑터를 쓰면 여러 Socket.IO 서버로 이루어진 클러스터에서도 동작합니다.

이때 현재 노드의 Socket 인스턴스에만 적용하려면 `local` 플래그를 사용해야 합니다.

```js
// 현재 노드에 연결된 모든 Socket 인스턴스를 "room1" 룸에서 내보냅니다
io.local.socketsLeave("room1");
```

:::

자세한 내용은 [유틸리티 메서드](categories/02-Server/server-instance.md#utility-methods)를 참고하세요.

#### server.timeout(value) {#servertimeoutvalue}

*v4.5.0에서 추가*

- `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
- **반환값** `BroadcastOperator`

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 모든 대상 클라이언트의 확인 응답을 받기 전에
지정한 시간(밀리초)이 지나면 콜백이 오류와 함께 호출됩니다.

```js
io.timeout(10000).emit("some-event", (err, responses) => {
  if (err) {
    // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 클라이언트마다 응답 하나
  }
});
```

#### server.to(room) {#servertoroom}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전    | 변경 사항                        |
|---------|----------------------------------|
| v4.0.0  | 룸 배열을 넘길 수 있습니다.      |
| v1.0.0  | 최초 구현.                       |

</details>

- `room` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- **반환값** 체이닝할 수 있는 `BroadcastOperator`

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 이벤트는 지정한 `room`에 참여한 클라이언트에게만 *브로드캐스트*됩니다.

여러 룸에 보내려면 `to`를 여러 번 호출하면 됩니다.

```js
// "room-101" 룸에 있는 연결된 모든 클라이언트에게 "foo" 이벤트를 브로드캐스트합니다
io.to("room-101").emit("foo", "bar");

// 룸 배열 사용(클라이언트는 최대 한 번만 이벤트를 받습니다)
io.to(["room-101", "room-102"]).emit("foo", "bar");

// 여러 번 체이닝해서 호출
io.to("room-101").to("room-102").emit("foo", "bar");
```

#### server.use(fn) {#serverusefn}

*v1.0.0에서 추가*

[`io.of("/").use(fn)`](#namespaceusefn)의 별칭입니다.

- `fn` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

메인 네임스페이스에 미들웨어를 등록합니다. 미들웨어는 들어오는 모든 `Socket`마다 실행되는 함수입니다. 매개변수로는 소켓, 그리고 다음에 등록된 미들웨어로 실행을 넘길 때 호출하는 함수를 받습니다.

미들웨어 콜백에 넘긴 오류는 특수한 `connect_error` 패킷으로 클라이언트에 전송됩니다.

*서버*

```js
io.use((socket, next) => {
  const err = new Error("not authorized");
  err.data = { content: "Please retry later" }; // 추가 정보
  next(err);
});
```

*클라이언트*

```js
socket.on("connect_error", err => {
  console.log(err instanceof Error); // true
  console.log(err.message); // not authorized
  console.log(err.data); // { content: "Please retry later" }
});
```

자세한 내용은 [미들웨어](categories/02-Server/middlewares.md) 문서를 참고하세요.

:::info

Express 미들웨어를 찾고 있다면 [이 섹션](#engineusemiddleware)을 확인하세요.

:::

## Namespace {#namespace}

<ThemedImage
  alt="서버 클래스 다이어그램의 Namespace"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-namespace.png'),
    dark: useBaseUrl('/images/server-class-diagram-namespace-dark.png'),
  }}
/>

경로 이름(예: `/chat`)으로 식별되는 범위에 연결된 소켓의 집합을 나타냅니다.

자세한 내용은 [네임스페이스](categories/06-Advanced/namespaces.md) 문서를 참고하세요.

### 속성 {#attributes-1}

#### namespace.adapter {#namespaceadapter}

* [`<Adapter>`](categories/05-Adapters/adapter.md)

네임스페이스에서 사용하는 ["어댑터"](categories/08-Miscellaneous/glossary.md#adapter)입니다.

**참고:** 메인 네임스페이스의 어댑터는 `io.of("/").adapter`로 접근할 수 있습니다.

자세한 내용은 [어댑터](categories/05-Adapters/adapter.md) 문서를 참고하세요.

```js
const adapter = io.of("/my-namespace").adapter;
```

#### namespace.name {#namespacename}

  * [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)

네임스페이스의 식별자입니다.

#### namespace.sockets {#namespacesockets}

  * [`Map<SocketId, Socket>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

이 네임스페이스에 연결된 [Socket](#socket) 인스턴스의 Map입니다.

```js
// 이 네임스페이스에 있는 소켓 수(현재 노드 기준)
const socketCount = io.of("/admin").sockets.size;
```

### 이벤트 {#events-1}

#### Event: 'connect' {#event-connect-1}

[Event: "connection"](#event-connection-1)과 같습니다.

#### Event: 'connection' {#event-connection-1}

- `socket` [`<Socket>`](#socket)

클라이언트가 연결하면 발생합니다.

```js
// 메인 네임스페이스
io.on("connection", (socket) => {
  // ...
});

// 커스텀 네임스페이스
io.of("/admin").on("connection", (socket) => {
  // ...
});
```

### 메서드 {#methods-1}

#### namespace.allSockets() {#namespaceallsockets}

- **반환값** `Promise<Set<SocketId>>`

:::caution

이 메서드는 다음 메이저 릴리스에서 제거될 예정입니다. 대신 [`serverSideEmit()`](#namespaceserversideemiteventname-args)이나 [`fetchSockets()`](#namespacefetchsockets)를 사용하세요. 

:::

이 네임스페이스에 연결된 소켓 ID 목록을 가져옵니다. 노드가 여러 개라면 모든 노드의 소켓 ID가 포함됩니다.

```js
// 메인 네임스페이스의 모든 소켓
const ids = await io.allSockets();

// 메인 네임스페이스에서 "user:1234" 룸에 있는 모든 소켓
const ids = await io.in("user:1234").allSockets();

// "chat" 네임스페이스의 모든 소켓
const ids = await io.of("/chat").allSockets();

// "chat" 네임스페이스에서 "general" 룸에 있는 모든 소켓
const ids = await io.of("/chat").in("general").allSockets();
```

#### namespace.disconnectSockets([close]) {#namespacedisconnectsocketsclose}

*v4.0.0에서 추가*

- `close` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) 내부 연결을 닫을지 여부
- **반환값** `void`

조건에 맞는 Socket 인스턴스의 연결을 끊습니다.

```js
// 모든 Socket 인스턴스의 연결을 끊습니다
io.disconnectSockets();

// "room1" 룸에 있는 모든 Socket 인스턴스의 연결을 끊고 저수준 연결도 닫습니다
io.in("room1").disconnectSockets(true);

// "admin" 네임스페이스의 "room1" 룸에 있는 모든 Socket 인스턴스의 연결을 끊습니다
io.of("/admin").in("room1").disconnectSockets();

// 소켓 ID 하나만 지정해도 동작합니다
io.of("/admin").in(theSocketId).disconnectSockets();
```

#### namespace.emit(eventName[, ...args]) {#namespaceemiteventname-args}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전    | 변경 사항                                  |
|---------|--------------------------------------------|
| v4.5.0  | `io.emit()`에서 확인 응답을 지원합니다.    |
| v1.0.0  | 최초 구현.                                 |

</details>

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `args` `any[]`
- **반환값** `true`

지정한 네임스페이스에 연결된 모든 클라이언트에게 이벤트를 보냅니다.

```js
io.of("/chat").emit("hello");
```

인자는 개수 제한 없이 보낼 수 있으며, 직렬화할 수 있는 데이터 구조는 모두 지원합니다.

```js
io.of("/chat").emit("hello", 1, "2", { "3": 4 }, Buffer.from([5]));
```

받는 쪽에서는 다음과 같이 처리합니다.

```js
socket.on("hello", (arg1, arg2, arg3, arg4) => {
  console.log(arg1); // 1
  console.log(arg2); // "2"
  console.log(arg3); // { "3": 4 }
  console.log(arg4); // 플랫폼에 따라 ArrayBuffer 또는 Buffer
});
```

:::info

인자는 자동으로 직렬화되므로 `JSON.stringify()`를 호출할 필요가 없습니다.

:::

[`to()`](#namespacetoroom)와 [`except()`](#namespaceexceptrooms)를 사용하면 특정 클라이언트에게만 패킷을 보낼 수 있습니다.

```js
// "room1" 룸이나 "room2" 룸에 있는 연결된 모든 클라이언트에게 "hello" 이벤트를 브로드캐스트합니다
// 단, "room3" 룸에 있는 클라이언트는 제외합니다
io.of("/chat").to("room1").to("room2").except("room3").emit("hello");
```

`4.5.0` 버전부터는 브로드캐스트할 때도 확인 응답을 사용할 수 있습니다.

```js
io.of("/chat").timeout(10000).emit("some-event", (err, responses) => {
  if (err) {
    // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 클라이언트마다 응답 하나
  }
});
```

:::caution

이때는 반드시 [`timeout()`](#namespacetimeoutvalue)을 호출해야 합니다.

:::

#### namespace.emitWithAck(eventName[, ...args]) {#namespaceemitwithackeventname-args}

*v4.6.0에서 추가*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `args` `any[]`
- **반환값** [`Promise<any[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

지정한 네임스페이스에서 이벤트를 브로드캐스트하고 모든 대상 클라이언트의 확인 응답을 기다리는 동작의 Promise 기반 버전입니다.

```js
try {
  const responses = await io.of("/chat").timeout(10000).emitWithAck("some-event");
  console.log(responses); // 클라이언트마다 응답 하나
} catch (e) {
  // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
}
```

위 예시는 다음 코드와 같습니다.

```js
io.of("/chat").timeout(10000).emit("some-event", (err, responses) => {
  if (err) {
    // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 클라이언트마다 응답 하나
  }
});
```

받는 쪽에서는 다음과 같이 처리합니다.

```js
socket.on("some-event", (callback) => {
  callback("got it"); // 인자는 하나만 받습니다
});
```

#### namespace.except(rooms) {#namespaceexceptrooms}

*v4.0.0에서 추가*

- `rooms` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- **반환값** `BroadcastOperator`

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 이벤트는 지정한 `rooms`에 참여하지 않은 클라이언트에게만 *브로드캐스트*됩니다.

```js
const myNamespace = io.of("/my-namespace");

// "room-101" 룸에 있는 클라이언트를 제외한 연결된 모든 클라이언트에게 "foo" 이벤트를 브로드캐스트합니다
myNamespace.except("room-101").emit("foo", "bar");

// 룸 배열 사용
myNamespace.except(["room-101", "room-102"]).emit("foo", "bar");

// 여러 번 체이닝해서 호출
myNamespace.except("room-101").except("room-102").emit("foo", "bar");
```

#### namespace.fetchSockets() {#namespacefetchsockets}

*v4.0.0에서 추가*

- **반환값** [`Socket[]`](#socket) | `RemoteSocket[]`

조건에 맞는 Socket 인스턴스를 반환합니다.

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

위 예시의 `sockets` 변수는 Socket 클래스의 기능 중 일부를 제공하는 객체의 배열입니다.

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

`data` 속성은 Socket.IO 서버 간에 정보를 공유할 때 쓸 수 있는 임의의 객체입니다.

```js
// 서버 A
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

// 서버 B
const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

**중요**: 이 메서드는 `socketsJoin`, `socketsLeave`, `disconnectSockets`와 마찬가지로 Redis 어댑터와 호환됩니다(`socket.io-redis@6.1.0`부터). 즉 여러 Socket.IO 서버에 걸쳐 동작합니다.

#### namespace.in(room) {#namespaceinroom}

*v1.0.0에서 추가*

[namespace.to(room)](#namespacetoroom)과 같지만, 경우에 따라 이쪽이 더 명확할 수 있습니다.

```js
const myNamespace = io.of("/my-namespace");

// "room-101" 룸에 있는 모든 클라이언트의 연결을 끊습니다
myNamespace.in("room-101").disconnectSockets();
```

#### namespace.serverSideEmit(eventName[, ...args][, ack]) {#namespaceserversideemiteventname-args-ack}

*v4.1.0에서 추가*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- `args` `<any[]>`
- `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** `true`

[클러스터](categories/02-Server/using-multiple-nodes.md)의 다른 Socket.IO 서버에 메시지를 보냅니다.

문법:

```js
io.of("/chat").serverSideEmit("hello", "world");
```

받는 쪽에서는 다음과 같이 처리합니다.

```js
io.of("/chat").on("hello", (arg1) => {
  console.log(arg1); // "world"를 출력합니다
});
```

확인 응답도 지원합니다.

```js
// 서버 A
io.of("/chat").serverSideEmit("ping", (err, responses) => {
  console.log(responses[0]); // "pong"을 출력합니다
});

// 서버 B
io.of("/chat").on("ping", (cb) => {
  cb("pong");
});
```

참고:

- `connection`, `connect`, `new_namespace` 문자열은 예약된 이름이므로 애플리케이션에서 사용할 수 없습니다.

- 인자는 개수 제한 없이 보낼 수 있지만, 현재 바이너리 데이터는 지원하지 않습니다. 인자 배열은 `JSON.stringify`로 직렬화됩니다.

예시:

```js
io.of("/chat").serverSideEmit("hello", "world", 1, "2", { 3: "4" });
```

- 다른 Socket.IO 서버가 일정 시간 안에 응답하지 않으면 확인 응답 콜백이 오류와 함께 호출될 수 있습니다.

```js
io.of("/chat").serverSideEmit("ping", (err, responses) => {
  if (err) {
    // 응답하지 않은 Socket.IO 서버가 하나 이상 있습니다
    // 그래도 'responses' 배열에는 이미 받은 응답이 모두 들어 있습니다
  } else {
    // 성공! 'responses' 배열에는 클러스터의 다른 Socket.IO 서버마다 객체가 하나씩 들어 있습니다
  }
});
```

#### namespace.serverSideEmitWithAck(eventName[, ...args]) {#namespaceserversideemitwithackeventname-args}

*v4.6.0에서 추가*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- `args` `<any[]>`
- `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** [`Promise<any[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

[클러스터](categories/02-Server/using-multiple-nodes.md)의 다른 Socket.IO 서버에 브로드캐스트하고 확인 응답을 기다리는 동작의 Promise 기반 버전입니다.

```js
try {
  const responses = await io.of("/chat").serverSideEmitWithAck("some-event");
  console.log(responses); // 서버마다 응답 하나(현재 서버 제외)
} catch (e) {
  // 일부 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
}
```

위 예시는 다음 코드와 같습니다.

```js
io.of("/chat").serverSideEmit("some-event", (err, responses) => {
  if (err) {
    // 일부 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 서버마다 응답 하나(현재 서버 제외)
  }
});
```

받는 쪽에서는 다음과 같이 처리합니다.

```js
io.of("/chat").on("some-event", (callback) => {
  callback("got it"); // 인자는 하나만 받습니다
});
```

#### namespace.socketsJoin(rooms) {#namespacesocketsjoinrooms}

*v4.0.0에서 추가*

- `rooms` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- **반환값** `void`

조건에 맞는 Socket 인스턴스를 지정한 룸에 참여시킵니다.

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

자세한 내용은 [유틸리티 메서드](categories/02-Server/server-instance.md#utility-methods)를 참고하세요.

#### namespace.socketsLeave(rooms) {#namespacesocketsleaverooms}

*v4.0.0에서 추가*

- `rooms` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- **반환값** `void`

조건에 맞는 Socket 인스턴스를 지정한 룸에서 내보냅니다.

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

#### namespace.timeout(value) {#namespacetimeoutvalue}

*v4.5.0에서 추가*

- `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
- **반환값** `BroadcastOperator`

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 모든 대상 클라이언트의 확인 응답을 받기 전에
지정한 시간(밀리초)이 지나면 콜백이 오류와 함께 호출됩니다.

```js
io.of("/chat").timeout(10000).emit("some-event", (err, responses) => {
  if (err) {
    // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 클라이언트마다 응답 하나
  }
});
```

#### namespace.to(room) {#namespacetoroom}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전    | 변경 사항                        |
|---------|----------------------------------|
| v4.0.0  | 룸 배열을 넘길 수 있습니다.      |
| v1.0.0  | 최초 구현.                       |

</details>

  - `room` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - **반환값** 체이닝할 수 있는 `BroadcastOperator`

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 이벤트는 지정한 `room`에 참여한 클라이언트에게만 *브로드캐스트*됩니다.

여러 룸에 보내려면 `to`를 여러 번 호출하면 됩니다.

```js
const myNamespace = io.of("/my-namespace");

// "room-101" 룸에 있는 연결된 모든 클라이언트에게 "foo" 이벤트를 브로드캐스트합니다
myNamespace.to("room-101").emit("foo", "bar");

// 룸 배열 사용(클라이언트는 최대 한 번만 이벤트를 받습니다)
myNamespace.to(["room-101", "room-102"]).emit("foo", "bar");

// 여러 번 체이닝해서 호출
myNamespace.to("room-101").to("room-102").emit("foo", "bar");
```

#### namespace.use(fn) {#namespaceusefn}

*v1.0.0에서 추가*

  - `fn` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

지정한 네임스페이스에 미들웨어를 등록합니다. 미들웨어는 들어오는 모든 `Socket`마다 실행되는 함수입니다. 매개변수로는 소켓, 그리고 다음에 등록된 미들웨어로 실행을 넘길 때 호출하는 함수를 받습니다.

미들웨어 콜백에 넘긴 오류는 특수한 `connect_error` 패킷으로 클라이언트에 전송됩니다.

*서버*

```js
io.of("/chat").use((socket, next) => {
  const err = new Error("not authorized");
  err.data = { content: "Please retry later" }; // 추가 정보
  next(err);
});
```

*클라이언트*

```js
socket.on("connect_error", err => {
  console.log(err instanceof Error); // true
  console.log(err.message); // not authorized
  console.log(err.data); // { content: "Please retry later" }
});
```

자세한 내용은 [미들웨어](categories/02-Server/middlewares.md) 문서를 참고하세요.

:::info

Express 미들웨어를 찾고 있다면 [이 섹션](#engineusemiddleware)을 확인하세요.

:::

### 플래그 {#flags}

#### Flag: 'local' {#flag-local}

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. [여러 노드로 확장](categories/02-Server/using-multiple-nodes.md)한 경우 이벤트 데이터가 현재 노드에만 *브로드캐스트*됩니다.

```js
io.local.emit("an event", { some: "data" });
```

#### Flag: 'volatile' {#flag-volatile}

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 클라이언트가 메시지를 받을 준비가 되지 않았다면 이벤트 데이터가 유실될 수 있습니다. 네트워크가 느리거나 다른 문제가 있을 때, 또는 롱 폴링으로 연결되어 요청-응답 사이클이 진행 중일 때가 그렇습니다.

```js
io.volatile.emit("an event", { some: "data" }); // 클라이언트가 받을 수도 있고 받지 못할 수도 있습니다
```

## Socket {#socket}

<ThemedImage
  alt="서버 클래스 다이어그램의 Socket"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-socket.png'),
    dark: useBaseUrl('/images/server-class-diagram-socket-dark.png'),
  }}
/>

`Socket`은 브라우저 클라이언트와 상호작용하는 핵심 클래스입니다. `Socket`은 특정 `Namespace`(기본값은 `/`)에 속하며, 통신에는 내부의 `Client`를 사용합니다.

참고로 `Socket`은 실제 내부의 TCP/IP `socket`과 직접적인 관련이 없으며, 클래스 이름일 뿐입니다.

각 `Namespace` 안에서는 `Socket`이 참여하고 나갈 수 있는 임의의 채널(`room`이라고 부릅니다)을 정의할 수도 있습니다. 룸을 이용하면 `Socket` 그룹에 편리하게 브로드캐스트할 수 있습니다(아래 `Socket#to` 참고).

`Socket` 클래스는 [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)를 상속하며, `emit` 메서드만 오버라이드하고 다른 `EventEmitter` 메서드는 수정하지 않습니다. 이 문서에 나오는 메서드 중 `EventEmitter`에도 있는 메서드(`emit` 제외)는 `EventEmitter`가 구현합니다. 이런 메서드에는 `EventEmitter` 문서가 그대로 적용됩니다.

자세한 내용은 [Socket 인스턴스(서버 측)](categories/02-Server/server-socket-instance.md) 문서를 참고하세요.

### 이벤트 {#events-2}

#### Event: 'disconnect' {#event-disconnect}

- `reason` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) 연결이 끊긴 이유(클라이언트 측 또는 서버 측)

연결이 끊기면 발생합니다.

```js
io.on("connection", (socket) => {
  socket.on("disconnect", (reason) => {
    // ...
  });
});
```

발생할 수 있는 이유는 다음과 같습니다.

| 이유                          | 설명                                                                                                                                         |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `server namespace disconnect` | 서버가 [socket.disconnect()](server-api.md#socketdisconnectclose)로 소켓의 연결을 강제로 끊었습니다.                                          |
| `client namespace disconnect` | 클라이언트가 [socket.disconnect()](client-api.md#socketdisconnect)로 소켓의 연결을 직접 끊었습니다.                                           |
| `server shutting down`        | 말 그대로 서버가 종료되는 중입니다.                                                                                                          |
| `ping timeout`                | 클라이언트가 `pingTimeout` 시간 안에 PONG 패킷을 보내지 않았습니다.                                                                          |
| `transport close`             | 연결이 닫혔습니다(예: 사용자의 연결이 끊겼거나 네트워크가 WiFi에서 4G로 바뀐 경우).                                                         |
| `transport error`             | 연결에서 오류가 발생했습니다.                                                                                                                |
| `parse error`                 | 서버가 클라이언트로부터 잘못된 패킷을 받았습니다.                                                                                            |
| `forced close`                | 서버가 클라이언트로부터 잘못된 패킷을 받았습니다.                                                                                            |
| `forced server close`         | 클라이언트가 제시간에 네임스페이스에 참여하지 않아([`connectTimeout`](server-options.md#connecttimeout) 옵션 참고) 연결이 강제로 닫혔습니다. |

#### Event: 'disconnecting' {#event-disconnecting}

*v1.5.0에서 추가*

- `reason` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) 연결이 끊긴 이유(클라이언트 측 또는 서버 측)

클라이언트의 연결이 끊기기 직전(아직 `rooms`에서 나가기 전)에 발생합니다.

```js
io.on("connection", (socket) => {
  socket.on("disconnecting", (reason) => {
    console.log(socket.rooms); // Set { ... }
  });
});
```

비동기 핸들러에서는 `rooms` 속성의 복사본을 만들어 두어야 합니다.

```js
io.on("connection", (socket) => {
  socket.on("disconnecting", async (reason) => {
    const rooms = new Set(socket.rooms);

    await someLongRunningOperation();

    // 이 시점에는 socket.rooms가 비어 있습니다
    console.log(rooms);
  });
});
```

:::caution

이 이벤트와 `connect`, `connect_error`, `newListener`, `removeListener`는 특수 이벤트이므로 애플리케이션에서 사용하면 안 됩니다.

```js
// 나쁜 예. 오류가 발생합니다
socket.emit("disconnect");
```

:::

### 속성 {#attributes-2}

#### socket.client {#socketclient}

* [`<Client>`](#client)

내부 `Client` 객체를 가리키는 참조입니다.

#### socket.conn {#socketconn}

* `<engine.Socket>`

내부 `Client`의 전송 방식(transport) 연결(engine.io `Socket` 객체)을 가리키는 참조입니다. 이 객체로 IO 전송 계층에 접근할 수 있습니다. 다만 이 계층은 여전히 실제 TCP/IP 소켓을 (대부분) 추상화합니다.

```js
io.on("connection", (socket) => {
  console.log("initial transport", socket.conn.transport.name); // "polling"을 출력합니다

  socket.conn.once("upgrade", () => {
    // 전송 방식이 업그레이드될 때 호출됩니다(예: HTTP 롱 폴링에서 WebSocket으로)
    console.log("upgraded transport", socket.conn.transport.name); // "websocket"을 출력합니다
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

  socket.conn.on("heartbeat", () => {
    // 하트비트 왕복이 한 번 끝날 때마다 호출됩니다
    console.log("heartbeat");
  });

  socket.conn.on("close", (reason) => {
    // 내부 연결이 닫히면 호출됩니다
  });
});
```

#### socket.data {#socketdata}

*v4.0.0에서 추가*

[`fetchSockets()`](#namespacefetchsockets) 유틸리티 메서드와 함께 쓸 수 있는 임의의 객체입니다.

```js
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

:::tip

[Postgres 어댑터](./categories/05-Adapters/adapter-postgres.md) 같은 호환 어댑터를 쓰면 Socket.IO 클러스터에서도 동작합니다.

:::

#### socket.handshake {#sockethandshake}

* [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

핸드셰이크 세부 정보입니다.

| 필드    | 타입                                                                                                | 설명                                                                              |
|---------|-----------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| headers | `IncomingHttpHeaders`                                                                               | 핸드셰이크 때 보낸 헤더입니다.                                                    |
| time    | [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)   | 생성 일시(문자열)입니다.                                                          |
| address | [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)   | 클라이언트의 IP 주소입니다.                                                       |
| xdomain | [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) | 크로스 도메인 연결인지 여부입니다.                                                |
| secure  | [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) | SSL로 연결했는지 여부입니다.                                                      |
| issued  | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)   | 생성 일시(유닉스 타임스탬프)입니다.                                               |
| url     | [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)   | 요청 URL 문자열입니다.                                                            |
| query   | `Record<string, string or string[]>`                                                                | 첫 요청의 쿼리 파라미터입니다.                                                    |
| auth    | `Record<string, any>`                                                                               | 인증 페이로드입니다. [미들웨어](categories/02-Server/middlewares.md)도 참고하세요. |

사용법:

```js
io.use((socket, next) => {
  let handshake = socket.handshake;
  // ...
});

io.on("connection", (socket) => {
  let handshake = socket.handshake;
  // ...
});
```

예시:

```js
const handshake = {
  headers: {
    "user-agent": "node-XMLHttpRequest",
    accept: "*/*",
    host: "localhost:3000",
    connection: "close"
  },
  time: "Wed Jan 01 2020 01:00:00 GMT+0100 (Central European Standard Time)",
  address: "::ffff:127.0.0.1",
  xdomain: false,
  secure: false,
  issued: 1577836800000,
  url: "/socket.io/?EIO=4&transport=polling&t=OPAfXv5&b64=1",
  query: {
    EIO: "4",
    transport: "polling",
    t: "OPAfXv5",
    b64: "1"
  },
  auth: {}
}
```

참고: `headers` 속성은 세션의 첫 HTTP 요청에 담긴 헤더를 가리키며, 이후의 HTTP 요청으로 갱신되지 않습니다.

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.headers === socket.request.headers); // "true"를 출력합니다
});
```

#### socket.id {#socketid}

  * [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)

세션의 고유 식별자로, 내부 `Client`에서 가져온 값입니다.

:::caution

`id` 속성은 **일시적인** ID입니다. 애플리케이션에서 쓰라고 만든 값이 아니므로 디버깅 용도로만 쓰세요. 이유는 다음과 같습니다.

- 재연결할 때마다 ID가 새로 생성됩니다(예: WebSocket 연결이 끊기거나 사용자가 페이지를 새로고침할 때).
- 브라우저 탭이 다르면 ID도 다릅니다.
- 서버는 ID별 메시지 큐를 저장하지 않습니다. 즉, 클라이언트의 연결이 끊긴 동안 서버가 이 ID로 보낸 메시지는 사라집니다.

대신 일반적인 세션 ID를 사용하세요. 세션 ID는 쿠키로 보내거나, localStorage에 저장해 두었다가 [`auth`](./client-options.md#auth) 페이로드로 보내면 됩니다.

함께 보기:

- [개인 메시지 가이드 2부](/get-started/private-messaging-part-2/)
- [쿠키 다루기](/how-to/deal-with-cookies)

:::

#### socket.recovered {#socketrecovered}

*v4.6.0에서 추가*

- [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

마지막 재연결 때 연결 상태가 성공적으로 복구되었는지 여부입니다.

```js
io.on("connection", (socket) => {
  if (socket.recovered) {
    // 복구에 성공했습니다. socket.id, socket.rooms, socket.data가 복원되었습니다
  } else {
    // 새 세션이거나 복구할 수 없는 세션입니다
  }
});
```

이 기능에 대한 자세한 내용은 [연결 상태 복구](./categories/01-Documentation/connection-state-recovery.md) 문서를 참고하세요.

#### socket.request {#socketrequest}

* [`<http.IncomingMessage>`](https://nodejs.org/api/http.html#class-httpincomingmessage)

내부 engine.io `Client`를 만든 `request`를 반환하는 getter 프록시입니다. `Cookie`나 `User-Agent` 같은 요청 헤더에 접근할 때 유용합니다.

```js
import { parse } from "cookie";

io.on("connection", (socket) => {
  const cookies = parse(socket.request.headers.cookie || "");
});
```

참고: `socket.request`는 세션의 첫 HTTP 요청을 가리키며, 이후의 HTTP 요청으로 갱신되지 않습니다.

```js
io.on("connection", (socket) => {
  console.log(socket.request.headers === socket.handshake.headers); // "true"를 출력합니다
});
```

이 참조가 필요 없다면 삭제해서 메모리 사용량을 줄일 수 있습니다.

```js
io.on("connection", (socket) => {
  delete socket.conn.request;
});
```

#### socket.rooms {#socketrooms}

  * [`Set<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

이 클라이언트가 속한 룸을 식별하는 문자열의 Set입니다.

```js
io.on("connection", (socket) => {

  console.log(socket.rooms); // Set { <socket.id> }

  socket.join("room1");

  console.log(socket.rooms); // Set { <socket.id>, "room1" }

});
```

### 메서드 {#methods-2}

#### socket.compress(value) {#socketcompressvalue}

- `value` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) 다음 패킷을 압축할지 여부
- **반환값** 체이닝할 수 있는 `Socket`

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 값이 `true`일 때만 이벤트 데이터를 *압축*합니다. 이 메서드를 호출하지 않으면 기본값은 `true`입니다.

```js
io.on("connection", (socket) => {
  socket.compress(false).emit("uncompressed", "that's rough");
});
```

#### socket.disconnect([close]) {#socketdisconnectclose}

- `close` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) 내부 연결을 닫을지 여부
- **반환값** [`Socket`](#socket)

이 소켓의 연결을 끊습니다. close 값이 `true`이면 내부 연결도 닫습니다. 그렇지 않으면 네임스페이스와의 연결만 끊습니다.

```js
io.on("connection", (socket) => {
  setTimeout(() => socket.disconnect(true), 5000);
});
```

#### socket.emit(eventName[, ...args][, ack]) {#socketemiteventname-args-ack}

*(`EventEmitter.emit`을 오버라이드)*
- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `args` `<any[]>`
- `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** `true`

문자열 이름으로 식별되는 이벤트를 소켓에 보냅니다. 다른 인자도 얼마든지 넣을 수 있습니다. `Buffer`를 포함해 직렬화할 수 있는 모든 데이터 구조를 지원합니다.

```js
io.on("connection", () => {
  socket.emit("hello", "world");
  socket.emit("with-binary", 1, "2", { 3: "4", 5: Buffer.from([6]) });
});
```

`ack` 인자는 선택 사항이며, 클라이언트의 응답을 인자로 받아 호출됩니다.

*서버*

```js
io.on("connection", (socket) => {
  socket.emit("hello", "world", (response) => {
    console.log(response); // "got it"
  });
});
```

*클라이언트*

```js
socket.on("hello", (arg, callback) => {
  console.log(arg); // "world"
  callback("got it");
});
```

#### socket.emitWithAck(eventName[, ...args]) {#socketemitwithackeventname-args}

*v4.6.0에서 추가*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `args` `any[]`
- **반환값** [`Promise<any>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

이벤트를 보내고 대상 클라이언트의 확인 응답을 기다리는 동작의 Promise 기반 버전입니다.

```js
io.on("connection", async (socket) => {
  // 타임아웃 없이
  const response = await socket.emitWithAck("hello", "world");

  // 타임아웃을 지정해서
  try {
    const response = await socket.timeout(10000).emitWithAck("hello", "world");
  } catch (err) {
    // 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  }
});
```

위 예시는 다음 코드와 같습니다.

```js
io.on("connection", (socket) => {
  // 타임아웃 없이
  socket.emit("hello", "world", (val) => {
    // ...
  });

  // 타임아웃을 지정해서
  socket.timeout(10000).emit("hello", "world", (err, val) => {
    // ...
  });
});
```

받는 쪽에서는 다음과 같이 처리합니다.

```js
socket.on("hello", (arg1, callback) => {
  callback("got it"); // 인자는 하나만 받습니다
});
```

#### socket.eventNames() {#socketeventnames}

`EventEmitter`에서 상속한 메서드입니다(여기서 다루지 않는 다른 메서드도 마찬가지입니다). Node.js의 [events](https://nodejs.org/docs/latest/api/events.html) 모듈 문서를 참고하세요.

#### socket.except(rooms) {#socketexceptrooms}

*v4.0.0에서 추가*

- `rooms` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- **반환값** `BroadcastOperator`

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 이벤트는 지정한 `rooms`에 참여하지 않은 클라이언트에게만 *브로드캐스트*됩니다(소켓 자신은 제외).

```js
// "room1"에 있는 클라이언트와 발신자를 제외한 모든 클라이언트에게 보냅니다
socket.broadcast.except("room1").emit(/* ... */);

// 위와 같습니다
socket.except("room1").emit(/* ... */);

// "room4"에 있는 클라이언트 중 "room5"에 있는 클라이언트와 발신자를 제외한 모두에게 보냅니다
socket.to("room4").except("room5").emit(/* ... */);
```

#### socket.in(room) {#socketinroom}

*v1.0.0에서 추가*

[socket.to(room)](#sockettoroom)과 같습니다.

#### socket.join(room) {#socketjoinroom}

- `room` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- **반환값** `void` | `Promise`

소켓을 지정한 `room` 또는 룸 목록에 추가합니다.

```js
io.on("connection", (socket) => {
  socket.join("room 237");
  
  console.log(socket.rooms); // Set { <socket.id>, "room 237" }

  socket.join(["room 237", "room 238"]);

  io.to("room 237").emit("a new user has joined the room"); // 룸에 있는 모두에게 브로드캐스트합니다
});
```

룸 참여 처리는 설정된 `Adapter`가 담당하며(위의 `Server#adapter` 참고), 기본값은 [socket.io-adapter](https://github.com/socketio/socket.io-adapter)입니다.

편의를 위해 각 소켓은 자신의 id로 식별되는 룸에 자동으로 참여합니다(`Socket#id` 참고). 덕분에 다른 소켓에 메시지를 쉽게 브로드캐스트할 수 있습니다.

```js
io.on("connection", (socket) => {
  socket.on("say to someone", (id, msg) => {
    // 지정한 id의 소켓에 개인 메시지를 보냅니다
    socket.to(id).emit("my message", msg);
  });
});
```

#### socket.leave(room) {#socketleaveroom}

- `room` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- **반환값** `void` | `Promise`

지정한 `room`에서 소켓을 내보냅니다.

```js
io.on("connection", (socket) => {
  socket.leave("room 237");

  io.to("room 237").emit(`user ${socket.id} has left the room`);
});
```

:::info

연결이 끊기면 룸에서 자동으로 나갑니다.

:::

#### socket.listenersAny() {#socketlistenersany}

- **반환값** [`<Function[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

모든 이벤트를 받는 리스너(catch-all listener)로 등록된 리스너 목록을 반환합니다.

```js
const listeners = socket.listenersAny();
```

#### socket.listenersAnyOutgoing() {#socketlistenersanyoutgoing}

*v4.5.0에서 추가*

- **반환값** [`<Function[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

보내는 패킷에 대해 등록된 catch-all 리스너 목록을 반환합니다.

```js
const listeners = socket.listenersAnyOutgoing();
```

#### socket.offAny([listener]) {#socketoffanylistener}

- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

앞서 등록한 리스너를 제거합니다. 리스너를 지정하지 않으면 모든 catch-all 리스너를 제거합니다.

```js
const myListener = () => { /* ... */ };

socket.onAny(myListener);

// 나중에
socket.offAny(myListener);

socket.offAny();
```

#### socket.offAnyOutgoing([listener]) {#socketoffanyoutgoinglistener}

*v4.5.0에서 추가*

- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

앞서 등록한 리스너를 제거합니다. 리스너를 지정하지 않으면 모든 catch-all 리스너를 제거합니다.

```js
const myListener = () => { /* ... */ };

socket.onAnyOutgoing(myListener);

// 리스너 하나만 제거
socket.offAnyOutgoing(myListener);

// 리스너를 모두 제거
socket.offAnyOutgoing();
```

#### socket.on(eventName, callback) {#socketoneventname-callback}

*[EventEmitter 클래스](https://nodejs.org/api/events.html#class-eventemitter)에서 상속*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** [`<Socket>`](#socket)

주어진 이벤트에 새 핸들러를 등록합니다.

```js
socket.on("news", (data) => {
  console.log(data);
});
// 인자가 여러 개인 경우
socket.on("news", (arg1, arg2, arg3) => {
  // ...
});
// 확인 응답을 보내는 경우
socket.on("news", (data, callback) => {
  callback(0);
});
```

#### socket.onAny(callback) {#socketonanycallback}

- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

catch-all 리스너를 새로 등록합니다.

```js
socket.onAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

:::caution

[확인 응답](categories/04-Events/emitting-events.md#acknowledgements)은 catch-all 리스너에서 잡히지 않습니다.

```js
socket.emit("foo", (value) => {
  // ...
});

socket.onAnyOutgoing(() => {
  // 이벤트를 보낼 때 실행됩니다
});

socket.onAny(() => {
  // 확인 응답을 받을 때는 실행되지 않습니다
});
```

:::

#### socket.onAnyOutgoing(callback) {#socketonanyoutgoingcallback}

*v4.5.0에서 추가*

- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

보내는 패킷에 대한 catch-all 리스너를 새로 등록합니다.

```js
socket.onAnyOutgoing((event, ...args) => {
  console.log(`got ${event}`);
});
```

:::caution

[확인 응답](categories/04-Events/emitting-events.md#acknowledgements)은 catch-all 리스너에서 잡히지 않습니다.

```js
socket.on("foo", (value, callback) => {
  callback("OK");
});

socket.onAny(() => {
  // 이벤트를 받을 때 실행됩니다
});

socket.onAnyOutgoing(() => {
  // 확인 응답을 보낼 때는 실행되지 않습니다
});
```

:::

#### socket.once(eventName, listener) {#socketonceeventname-listener}

`EventEmitter`에서 상속한 메서드입니다(여기서 다루지 않는 다른 메서드도 마찬가지입니다). Node.js의 [events](https://nodejs.org/docs/latest/api/events.html) 모듈 문서를 참고하세요.

#### socket.prependAny(callback) {#socketprependanycallback}

- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

catch-all 리스너를 새로 등록합니다. 이 리스너는 리스너 배열의 맨 앞에 추가됩니다.

```js
socket.prependAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

#### socket.prependAnyOutgoing(callback) {#socketprependanyoutgoingcallback}

*v4.5.0에서 추가*

- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

보내는 패킷에 대한 catch-all 리스너를 새로 등록합니다. 이 리스너는 리스너 배열의 맨 앞에 추가됩니다.

```js
socket.prependAnyOutgoing((event, ...args) => {
  console.log(`got ${event}`);
});
```

#### socket.removeAllListeners([eventName]) {#socketremovealllistenerseventname}

`EventEmitter`에서 상속한 메서드입니다(여기서 다루지 않는 다른 메서드도 마찬가지입니다). Node.js의 [events](https://nodejs.org/docs/latest/api/events.html) 모듈 문서를 참고하세요.

#### socket.removeListener(eventName, listener) {#socketremovelistenereventname-listener}

`EventEmitter`에서 상속한 메서드입니다(여기서 다루지 않는 다른 메서드도 마찬가지입니다). Node.js의 [events](https://nodejs.org/docs/latest/api/events.html) 모듈 문서를 참고하세요.

#### socket.send([...args][, ack]) {#socketsendargs-ack}

- `args` `<any[]>`
- `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** [`Socket`](#socket)

`message` 이벤트를 보냅니다. [socket.emit(eventName[, ...args][, ack])](#socketemiteventname-args-ack)을 참고하세요.

#### socket.timeout(value) {#sockettimeoutvalue}

*v4.4.0에서 추가*

- `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
- **반환값** [`<Socket>`](#socket)

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 지정한 시간(밀리초) 안에 클라이언트의 확인 응답이 오지 않으면
콜백이 오류와 함께 호출됩니다.

```js
socket.timeout(5000).emit("my-event", (err) => {
  if (err) {
    // 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  }
});
```

#### socket.to(room) {#sockettoroom}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전 | 변경 사항 |
| ------- | ------- |
| v4.0.0 | 룸 배열을 넘길 수 있습니다.
| v1.0.0 | 최초 구현.

</details>

- `room` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<string[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- **반환값** 체이닝할 수 있는 `Socket`

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 이벤트는 지정한 `room`에 참여한 클라이언트에게만 *브로드캐스트*됩니다(소켓 자신은 제외).

여러 룸에 보내려면 `to`를 여러 번 호출하면 됩니다.

```js
io.on("connection", (socket) => {

  // 룸 하나에 보내기
  socket.to("others").emit("an event", { some: "data" });

  // 여러 룸에 보내기
  socket.to("room1").to("room2").emit("hello");

  // 배열로 보내기
  socket.to(["room1", "room2"]).emit("hello");

  // 다른 소켓에 개인 메시지 보내기
  socket.to(/* another socket id */).emit("hey");

  // 주의: `socket.to(socket.id).emit()`은 동작하지 않습니다
  // 대신 `io.to(socket.id).emit()`을 사용하세요.
});
```

#### socket.use(fn) {#socketusefn}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전    | 변경 사항                                         |
|---------|---------------------------------------------------|
| v3.0.5  | 최초 구현을 복원했습니다.                         |
| v3.0.0  | `socket.onAny()`로 대체되어 제거되었습니다.       |
| v1.7.2  | `error` 이벤트를 클라이언트에 바로 보냅니다.      |
| v1.6.0  | 최초 구현.                                        |

</details>

  - `fn` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

미들웨어를 등록합니다. 미들웨어는 들어오는 모든 `Packet`마다 실행되는 함수입니다. 매개변수로는 패킷, 그리고 다음에 등록된 미들웨어로 실행을 넘길 때 호출하는 함수를 받습니다.

미들웨어 콜백에 넘긴 오류는 서버 측에서 `error` 이벤트로 발생합니다.

```js
io.on("connection", (socket) => {
  socket.use(([event, ...args], next) => {
    if (isUnauthorized(event)) {
      return next(new Error("unauthorized event"));
    }
    // next를 꼭 호출하세요
    next();
  });

  socket.on("error", (err) => {
    if (err && err.message === "unauthorized event") {
      socket.disconnect();
    }
  });
});
```

### 플래그 {#flags-1}

#### Flag: 'broadcast' {#flag-broadcast}

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 이벤트 데이터는 발신자를 제외한 모든 소켓에 *브로드캐스트*됩니다.

```js
io.on("connection", (socket) => {
  socket.broadcast.emit("an event", { some: "data" }); // 발신자를 제외한 모두가 받습니다
});
```

#### Flag: 'volatile' {#flag-volatile-1}

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 클라이언트가 메시지를 받을 준비가 되지 않았다면 이벤트 데이터가 유실될 수 있습니다. 네트워크가 느리거나 다른 문제가 있을 때, 또는 롱 폴링으로 연결되어 요청-응답 사이클이 진행 중일 때가 그렇습니다.

```js
io.on("connection", (socket) => {
  socket.volatile.emit("an event", { some: "data" }); // 클라이언트가 받을 수도 있고 받지 못할 수도 있습니다
});
```

## Client {#client}

<ThemedImage
  alt="서버 클래스 다이어그램의 Client"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-client.png'),
    dark: useBaseUrl('/images/server-class-diagram-client-dark.png'),
  }}
/>

`Client` 클래스는 들어오는 전송 방식(engine.io) 연결을 나타냅니다. `Client` 하나에 서로 다른 `Namespace`에 속한 여러 `Socket`을 다중화해 연결할 수 있습니다.

### 속성 {#attributes-3}

#### client.conn {#clientconn}

  * `<engine.Socket>`

내부 `engine.io` `Socket` 연결을 가리키는 참조입니다.

#### client.request {#clientrequest}

  * [`<http.IncomingMessage>`](https://nodejs.org/api/http.html#class-httpincomingmessage)

engine.io 연결을 만든 `request`를 반환하는 getter 프록시입니다. `Cookie`나 `User-Agent` 같은 요청 헤더에 접근할 때 유용합니다.

## Engine {#engine}

WebSocket / HTTP 롱 폴링 연결을 관리하는 Engine.IO 서버입니다. 자세한 내용은 [동작 원리](categories/01-Documentation/how-it-works.md) 문서를 참고하세요.

소스 코드는 다음 저장소에서 볼 수 있습니다: https://github.com/socketio/engine.io

### 이벤트 {#events-3}

#### Event: 'connection_error' {#event-connection_error}

*v4.1.0에서 추가*

- `error` [`<Error>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

```js
io.engine.on("connection_error", (err) => {
  console.log(err.req);	     // 요청 객체
  console.log(err.code);     // 오류 코드(예: 1)
  console.log(err.message);  // 오류 메시지(예: "Session ID unknown")
  console.log(err.context);  // 추가 오류 컨텍스트
});
```

연결이 비정상적으로 종료되면 이 이벤트가 발생합니다. 발생할 수 있는 오류 코드는 다음과 같습니다.

| 코드 |            메시지             |
|:----:|:------------------------------:|
|  0   |      "Transport unknown"       |
|  1   |      "Session ID unknown"      |
|  2   |     "Bad handshake method"     |
|  3   |         "Bad request"          |
|  4   |          "Forbidden"           |
|  5   | "Unsupported protocol version" |

#### Event: 'headers' {#event-headers}

*v4.1.0에서 추가*

- `headers` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) 헤더 이름을 키로 하는 헤더 해시
- `request` [`<http.IncomingMessage>`](https://nodejs.org/docs/latest/api/http.html#http_class_http_incomingmessage) 들어온 요청

세션의 **각** HTTP 요청(WebSocket 업그레이드 포함)에 대한 응답 헤더를 쓰기 직전에 발생하며, 이 헤더를 원하는 대로 바꿀 수 있습니다.

```js
import { serialize, parse } from "cookie";

io.engine.on("headers", (headers, request) => {
  if (!request.headers.cookie) return;
  const cookies = parse(request.headers.cookie);
  if (!cookies.randomId) {
    headers["set-cookie"] = serialize("randomId", "abc", { maxAge: 86400 });
  }
});
```

#### Event: 'initial_headers' {#event-initial_headers}

*v4.1.0에서 추가*

- `headers` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) 헤더 이름을 키로 하는 헤더 해시
- `request` [`<http.IncomingMessage>`](https://nodejs.org/docs/latest/api/http.html#http_class_http_incomingmessage) 들어온 요청

세션의 **첫** HTTP 요청(핸드셰이크)에 대한 응답 헤더를 쓰기 직전에 발생하며, 이 헤더를 원하는 대로 바꿀 수 있습니다.

```js
import { serialize } from "cookie";

io.engine.on("initial_headers", (headers, request) => {
  headers["set-cookie"] = serialize("uid", "1234", { sameSite: "strict" });
});
```

비동기 작업을 해야 한다면 [`allowRequest`](./server-options.md#allowrequest) 옵션을 사용해야 합니다.

```js
import { serialize } from "cookie";

const io = new Server(httpServer, {
  allowRequest: async (req, callback) => {
    const session = await fetchSession(req);
    req.session = session;
    callback(null, true);
  }
});

io.engine.on("initial_headers", (headers, req) => {
  if (req.session) {
    headers["set-cookie"] = serialize("sid", req.session.id, { sameSite: "strict" });
  }
});
```

함께 보기:

- [`express-session`과 함께 사용하기](/how-to/use-with-express-session)
- [쿠키 다루기](/how-to/deal-with-cookies)

### 속성 {#attributes-4}

#### engine.clientsCount {#engineclientscount}

*v1.0.0에서 추가*

  - [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

현재 연결된 클라이언트 수입니다.

```js
const count = io.engine.clientsCount;
// 사용 방식에 따라 메인 네임스페이스의 Socket 인스턴스 수와 같을 수도, 다를 수도 있습니다
const count2 = io.of("/").sockets.size;
```

### 메서드 {#methods-3}

#### engine.generateId {#enginegenerateid}

  - [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

새 세션 ID를 생성하는 함수입니다. 기본값은 [base64id](https://github.com/faeldt/base64id)입니다.

```js
const uuid = require("uuid");

io.engine.generateId = () => {
  return uuid.v4(); // 모든 Socket.IO 서버에서 고유해야 합니다
}
```

#### engine.handleUpgrade(request, socket, head) {#enginehandleupgraderequest-socket-head}

*v1.0.0에서 추가*

  - `request` [`<http.IncomingMessage>`](https://nodejs.org/docs/latest/api/http.html#http_class_http_incomingmessage) 들어온 요청
  - `socket` [`<stream.Duplex>`](https://nodejs.org/docs/latest/api/stream.html#stream_class_stream_duplex) 서버와 클라이언트 사이의 네트워크 소켓
  - `head` [`<Buffer>`](https://nodejs.org/docs/latest/api/buffer.html#buffer_class_buffer) 업그레이드된 스트림의 첫 패킷(비어 있을 수 있음)

이 메서드로 HTTP 업그레이드 요청을 직접 넘겨 처리할 수 있습니다.

Socket.IO 서버와 일반 WebSocket 서버를 함께 사용하는 예시:

```js
import { createServer } from "http";
import { Server as WsServer } from "ws";
import { Server } from "socket.io";

const httpServer = createServer();
const wss = new WsServer({ noServer: true });
const io = new Server(httpServer);

httpServer.removeAllListeners("upgrade");

httpServer.on("upgrade", (req, socket, head) => {
  if (req.url === "/") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else if (req.url.startsWith("/socket.io/")) {
    io.engine.handleUpgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

httpServer.listen(3000);
```

#### engine.use(middleware) {#engineusemiddleware}

*v4.6.0에서 추가*

- [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

[Express 미들웨어](https://expressjs.com/en/guide/using-middleware.html)를 새로 추가합니다.

```js
io.engine.use((req, res, next) => {
  // 필요한 작업을 합니다

  next();
});
```

미들웨어는 업그레이드 요청을 포함해 들어오는 모든 HTTP 요청마다 호출됩니다.

[`express-session`](https://www.npmjs.com/package/express-session)을 사용하는 예시:

```js
import session from "express-session";

io.engine.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
```

[`helmet`](https://www.npmjs.com/package/helmet)을 사용하는 예시:

```js
import helmet from "helmet";

io.engine.use(helmet());
```
