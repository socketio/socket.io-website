---
title: 클라이언트 API
sidebar_label: API
sidebar_position: 1
slug: /client-api/
toc_max_heading_level: 4
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## IO {#io}

독립 실행형 빌드(standalone build)에서는 `io` 메서드가 전역 스코프에 바인딩됩니다.

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

버전 [4.3.0](/blog/socket-io-4-3-0/)부터는 ESM 번들도 제공합니다.

```html
<script type="module">
  import { io } from "https://cdn.socket.io/4.8.4/socket.io.esm.min.js";

  const socket = io();
</script>
```

[import map](https://caniuse.com/import-maps)을 사용하는 경우:

```html
<script type="importmap">
  {
    "imports": {
      "socket.io-client": "https://cdn.socket.io/4.8.4/socket.io.esm.min.js"
    }
  }
</script>

<script type="module">
  import { io } from "socket.io-client";

  const socket = io();
</script>
```

빌드 도구를 쓰거나 Node.js, React Native 환경에서 쓰는 등 그 밖의 경우에는 `socket.io-client` 패키지에서 가져오면 됩니다.

```js
// ES modules
import { io } from "socket.io-client";

// CommonJS
const { io } = require("socket.io-client");
```

### io.protocol {#ioprotocol}

  * [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

프로토콜 리비전 번호입니다(현재 5).

프로토콜은 클라이언트와 서버가 주고받는 패킷의 형식을 정의합니다. 클라이언트와 서버가 서로를 이해하려면 반드시 같은 리비전을 사용해야 합니다.

자세한 내용은 [Socket.IO 프로토콜 저장소](https://github.com/socketio/socket.io-protocol)를 참고하세요.

### io([url][, options]) {#iourl-options}

  - `url` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) (기본값: `window.location.origin`)
  - `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
    - `forceNew` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) 새 연결을 만들지 여부
  - **반환값** [`<Socket>`](#socket)

주어진 URL에 대한 `Manager`를 새로 만들고, 이후 호출에서는 기존 `Manager`를 재사용하려고 시도합니다. 단, `multiplex` 옵션을 `false`로 전달하면 재사용하지 않습니다. `multiplex: false`는 `"force new connection": true` 또는 `forceNew: true`를 설정하는 것과 같습니다.

URL의 경로(pathname)로 지정한 네임스페이스의 새 `Socket` 인스턴스를 반환하며, 기본 네임스페이스는 `/`입니다. 예를 들어 `url`이 `http://localhost/users`이면 전송 연결은 `http://localhost`와, Socket.IO 연결은 `/users`와 맺어집니다.

쿼리 매개변수는 `query` 옵션으로 전달하거나 URL에 직접 넣을 수 있습니다(예: `http://localhost/users?token=abc`).

내부 동작을 살펴보면 다음 예시는

```js
import { io } from "socket.io-client";

const socket = io("ws://example.com/my-namespace", {
  reconnectionDelayMax: 10000,
  auth: {
    token: "123"
  },
  query: {
    "my-key": "my-value"
  }
});
```

아래 코드를 줄여 쓴 것입니다.

```js
import { Manager } from "socket.io-client";

const manager = new Manager("ws://example.com", {
  reconnectionDelayMax: 10000,
  query: {
    "my-key": "my-value"
  }
});

const socket = manager.socket("/my-namespace", {
  auth: {
    token: "123"
  }
});
```

사용할 수 있는 전체 옵션 목록은 [클라이언트 옵션](client-options.md) 문서를 참고하세요.

## Manager {#manager}

<ThemedImage
  alt="클라이언트 클래스 다이어그램의 Manager"
  sources={{
    light: useBaseUrl('/images/client-class-diagram-manager.png'),
    dark: useBaseUrl('/images/client-class-diagram-manager-dark.png'),
  }}
/>

`Manager`는 Engine.IO [클라이언트](https://github.com/socketio/engine.io-client/) 인스턴스를 소유합니다. 이 인스턴스는 WebSocket이나 HTTP 롱 폴링 같은 전송 방식(transport)으로 서버와 연결을 맺는 저수준 엔진입니다.

`Manager`는 재연결 로직을 처리합니다.

`Manager` 하나를 여러 [Socket](#socket)이 함께 쓸 수 있습니다. 이 멀티플렉싱 기능에 대한 자세한 내용은 [네임스페이스](categories/06-Advanced/namespaces.md) 문서를 참고하세요.

대부분의 경우 Manager를 직접 쓰지 않고 [Socket](#socket) 인스턴스를 사용합니다.

### 생성자 {#constructor}

#### new Manager(url[, options]) {#new-managerurl-options}

  - `url` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
  - `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - **반환값** [`<Manager>`](#manager)

사용할 수 있는 전체 옵션 목록은 [클라이언트 옵션](client-options.md) 문서를 참고하세요.

```js
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com");

const socket = manager.socket("/"); // 메인 네임스페이스
const adminSocket = manager.socket("/admin"); // admin 네임스페이스
```

### 이벤트 {#events}

#### Event: 'error' {#event-error}

- `error` [`<Error>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) 오류 객체

연결 오류가 나면 발생합니다.

```js
socket.io.on("error", (error) => {
  // ...
});
```

#### Event: 'ping' {#event-ping}

서버에서 ping 패킷을 받으면 발생합니다.

```js
socket.io.on("ping", () => {
  // ...
});
```

#### Event: 'reconnect' {#event-reconnect}

- `attempt` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type) 재연결 시도 횟수

재연결에 성공하면 발생합니다.

```js
socket.io.on("reconnect", (attempt) => {
  // ...
});
```

#### Event: 'reconnect_attempt' {#event-reconnect_attempt}

- `attempt` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type) 재연결 시도 횟수

재연결을 시도할 때 발생합니다.

```js
socket.io.on("reconnect_attempt", (attempt) => {
  // ...
});
```

#### Event: 'reconnect_error' {#event-reconnect_error}

- `error` [`<Error>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) 오류 객체

재연결 시도 중 오류가 나면 발생합니다.

```js
socket.io.on("reconnect_error", (error) => {
  // ...
});
```

#### Event: 'reconnect_failed' {#event-reconnect_failed}

`reconnectionAttempts` 횟수 안에 재연결하지 못하면 발생합니다.

```js
socket.io.on("reconnect_failed", () => {
  // ...
});
```

### 메서드 {#methods}

#### manager.connect([callback]) {#managerconnectcallback}

[manager.open([callback])](#manageropencallback)과 같습니다.

#### manager.open([callback]) {#manageropencallback}

- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** [`<Manager>`](#manager)

`autoConnect`를 `false`로 설정해 Manager를 생성했다면 이 메서드로 새 연결 시도를 시작합니다.

`callback` 인자는 선택 사항이며, 연결 시도가 실패하거나 성공하면 호출됩니다.

```js
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com", {
  autoConnect: false
});

const socket = manager.socket("/");

manager.open((err) => {
  if (err) {
    // 오류가 발생했습니다
  } else {
    // 연결에 성공했습니다
  }
});
```

#### manager.reconnection([value]) {#managerreconnectionvalue}

  - `value` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)
  - **반환값** [`<Manager>`](#manager) | [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

`reconnection` 옵션을 설정합니다. 매개변수를 전달하지 않으면 현재 값을 반환합니다.

#### manager.reconnectionAttempts([value]) {#managerreconnectionattemptsvalue}

  - `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
  - **반환값** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

`reconnectionAttempts` 옵션을 설정합니다. 매개변수를 전달하지 않으면 현재 값을 반환합니다.

#### manager.reconnectionDelay([value]) {#managerreconnectiondelayvalue}

  - `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
  - **반환값** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

`reconnectionDelay` 옵션을 설정합니다. 매개변수를 전달하지 않으면 현재 값을 반환합니다.

#### manager.reconnectionDelayMax([value]) {#managerreconnectiondelaymaxvalue}

  - `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
  - **반환값** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

`reconnectionDelayMax` 옵션을 설정합니다. 매개변수를 전달하지 않으면 현재 값을 반환합니다.

#### manager.socket(nsp, options) {#managersocketnsp-options}

- `nsp` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- `options` [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
- **반환값** [`<Socket>`](#socket)

주어진 네임스페이스의 `Socket`을 새로 만듭니다.

이 메서드는 `auth` 옵션만 읽습니다.

```js
const socket = manager.socket("/admin", {
  auth: {
    token: "123"
  }
});
```

`reconnectionDelayMax`, `transports`, `query` 같은 연결 수준의 옵션은 `Manager`를 생성할 때 전달해야 합니다.

```js
const manager = new Manager("https://example.com", {
  reconnectionDelayMax: 10000,
  transports: ["websocket"],
  query: {
    token: "abc"
  }
});
```

`manager.socket()`에 전달한 그 밖의 키는 무시됩니다.

#### manager.timeout([value]) {#managertimeoutvalue}

  - `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
  - **반환값** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

`timeout` 옵션을 설정합니다. 매개변수를 전달하지 않으면 현재 값을 반환합니다.

## Socket {#socket}

<ThemedImage
  alt="클라이언트 클래스 다이어그램의 Socket"
  sources={{
    light: useBaseUrl('/images/client-class-diagram-socket.png'),
    dark: useBaseUrl('/images/client-class-diagram-socket-dark.png'),
  }}
/>

`Socket`은 서버와 상호작용하는 핵심 클래스입니다. `Socket`은 특정 [네임스페이스](categories/06-Advanced/namespaces.md)(기본값 `/`)에 속하며, 내부의 [Manager](#manager)를 사용해 통신합니다.

`Socket`은 간단히 말해 네트워크를 통해 서버와 이벤트를 주고받는 [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)입니다.

```js
socket.emit("hello", { a: "b", c: [] });

socket.on("hey", (...args) => {
  // ...
});
```

자세한 내용은 [Socket 인스턴스(클라이언트 측)](categories/03-Client/client-socket-instance.md) 문서를 참고하세요.

### 이벤트 {#events-1}

#### Event: 'connect' {#event-connect}

이 이벤트는 Socket 인스턴스가 연결될 때와 재연결될 때 **모두** 발생합니다.

```js
socket.on("connect", () => {
  // ...
});
```

:::caution

`connect` 핸들러 안에서 이벤트 핸들러를 등록하면 안 됩니다. Socket 인스턴스가 재연결할 때마다 핸들러를 또 등록하게 되기 때문입니다.

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

#### Event: 'connect_error' {#event-connect_error}

- `error` [`<Error>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

이 이벤트는 연결에 실패하면 발생합니다.

| 이유                                                                                                    | 자동 재연결 여부 |
|-----------------------------------------------------------------------------------------------------------|-------------------------|
| 저수준 연결을 맺을 수 없습니다(일시적 장애).                                        | :white_check_mark: 예  |
| 서버가 [미들웨어 함수](./categories/02-Server/middlewares.md)에서 연결을 거부했습니다. | :x: 아니요                  |

[`socket.active`](#socketactive) 속성은 소켓이 짧은 [무작위 지연](client-options.md#reconnectiondelay) 후에 자동으로 재연결을 시도할지 알려 줍니다.

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

#### Event: 'disconnect' {#event-disconnect}

- `reason` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- `details` `<DisconnectDetails>`

이 이벤트는 연결이 끊기면 발생합니다.

```js
socket.on("disconnect", (reason, details) => {
  // ...
});
```

발생할 수 있는 이유는 다음과 같습니다.

| 이유                 | 설명                                                                                                       | 자동 재연결 여부 |
|------------------------|-------------------------------------------------------------------------------------------------------------------|:------------------------|
| `io server disconnect` | 서버가 [socket.disconnect()](server-api.md#socketdisconnectclose)로 소켓의 연결을 강제로 끊었습니다. | :x: 아니요                  |
| `io client disconnect` | [socket.disconnect()](client-api.md#socketdisconnect)로 소켓의 연결을 직접 끊었습니다.                  | :x: 아니요                  |
| `ping timeout`         | 서버가 `pingInterval + pingTimeout` 시간 안에 PING 패킷을 보내지 않았습니다.                                      | :white_check_mark: 예  |
| `transport close`      | 연결이 닫혔습니다(예: 사용자의 연결이 끊겼거나 네트워크가 Wi-Fi에서 4G로 바뀐 경우).    | :white_check_mark: 예  |
| `transport error`      | 연결에 오류가 발생했습니다(예: HTTP 롱 폴링 주기 중에 서버가 종료된 경우).        | :white_check_mark: 예  |

[`socket.active`](#socketactive) 속성은 소켓이 짧은 [무작위 지연](client-options.md#reconnectiondelay) 후에 자동으로 재연결을 시도할지 알려 줍니다.

```js
socket.on("disconnect", (reason) => {
  if (socket.active) {
    // 일시적인 연결 끊김. 소켓이 자동으로 재연결을 시도합니다
  } else {
    // 서버나 클라이언트 자신이 연결을 강제로 닫았습니다
    // 이 경우 재연결하려면 `socket.connect()`를 직접 호출해야 합니다
    console.log(reason);
  }
});
```

### 속성 {#attributes}

#### socket.active {#socketactive}

- [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

소켓이 자동으로 재연결을 시도할지 여부입니다.

연결에 실패한 뒤에 이 속성을 확인할 수 있습니다.

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

연결이 끊긴 뒤에도 확인할 수 있습니다.

```js
socket.on("disconnect", (reason) => {
  if (socket.active) {
    // 일시적인 연결 끊김. 소켓이 자동으로 재연결을 시도합니다
  } else {
    // 서버나 클라이언트 자신이 연결을 강제로 닫았습니다
    // 이 경우 재연결하려면 `socket.connect()`를 직접 호출해야 합니다
    console.log(reason);
  }
});
```

#### socket.connected {#socketconnected}

  - [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

소켓이 현재 서버에 연결되어 있는지 여부입니다.

```js
const socket = io();

console.log(socket.connected); // false

socket.on("connect", () => {
  console.log(socket.connected); // true
});
```

#### socket.disconnected {#socketdisconnected}

  - [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

소켓이 현재 서버와 연결이 끊겨 있는지 여부입니다.

```js
const socket = io();

console.log(socket.disconnected); // true

socket.on("connect", () => {
  console.log(socket.disconnected); // false
});
```

#### socket.id {#socketid}

- [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)

소켓 세션의 고유 식별자입니다. `connect` 이벤트가 발생한 뒤 설정되고 `reconnect` 이벤트 뒤에 갱신됩니다.

```js
const socket = io();

console.log(socket.id); // undefined

socket.on("connect", () => {
  console.log(socket.id); // "G5p5..."
});
```

:::caution

`id` 속성은 **일시적인** ID입니다. 애플리케이션에서 쓰라고 만든 값이 아니므로 디버깅 용도로만 쓰세요. 이유는 다음과 같습니다.

- 재연결할 때마다 ID가 새로 생성됩니다(예: WebSocket 연결이 끊기거나 사용자가 페이지를 새로고침할 때).
- 브라우저 탭이 다르면 ID도 다릅니다.
- 서버는 ID별 메시지 큐를 저장하지 않습니다. 즉, 클라이언트의 연결이 끊긴 동안 서버가 이 ID로 보낸 메시지는 사라집니다.

대신 일반적인 세션 ID를 사용하세요. 세션 ID는 쿠키로 보내거나, `localStorage`에 저장해 두었다가 [`auth`](./client-options.md#auth) 페이로드로 보내면 됩니다.

함께 보기:

- [개인 메시지 가이드 2부](/get-started/private-messaging-part-2/)
- [쿠키 다루기](/how-to/deal-with-cookies)

:::

#### socket.io {#socketio}

  - [`<Manager>`](#manager)

내부에서 사용하는 [Manager](#manager)를 가리키는 참조입니다.

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

#### socket.recovered {#socketrecovered}

*v4.6.0에서 추가*

- [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

마지막 재연결 때 연결 상태가 복구되었는지 여부입니다.

```js
socket.on("connect", () => {
  if (socket.recovered) {
    // 연결이 끊긴 동안 놓친 이벤트를 지금 모두 받습니다
  } else {
    // 새 세션이거나 복구할 수 없는 세션입니다
  }
});
```

이 기능에 대한 자세한 내용은 [연결 상태 복구](./categories/01-Documentation/connection-state-recovery.md) 문서를 참고하세요.

### 메서드 {#methods-1}

#### socket.close() {#socketclose}

*v1.0.0에서 추가*

[socket.disconnect()](#socketdisconnect)와 같습니다.

#### socket.compress(value) {#socketcompressvalue}

- `value` [`<boolean>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)
- **반환값** [`<Socket>`](#socket)

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. `value`가 `true`일 때만 이벤트 데이터를 *압축*합니다. 이 메서드를 호출하지 않으면 기본값은 `true`입니다.

```js
socket.compress(false).emit("an event", { some: "data" });
```

#### socket.connect() {#socketconnect}

*v1.0.0에서 추가*

- **반환값** [`<Socket>`](#socket)

소켓을 직접 연결합니다.

```js
const socket = io({
  autoConnect: false
});

// ...
socket.connect();
```

직접 재연결할 때도 사용할 수 있습니다.

```js
socket.on("disconnect", () => {
  socket.connect();
});
```

#### socket.disconnect() {#socketdisconnect}

*v1.0.0에서 추가*

- **반환값** [`<Socket>`](#socket)

소켓의 연결을 직접 끊습니다. 이 경우 소켓은 재연결을 시도하지 않습니다.

이때 연결 끊김 이유는 다음과 같습니다.

- 클라이언트 측: `"io client disconnect"`
- 서버 측: `"client namespace disconnect"`

이 소켓이 Manager의 마지막 활성 Socket 인스턴스라면 저수준 연결도 닫힙니다.

#### socket.emit(eventName[, ...args][, ack]) {#socketemiteventname-args-ack}

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `args` `<any[]>`
- `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** `true`

주어진 이름으로 서버에 이벤트를 보냅니다. 인자는 몇 개든 추가로 넘길 수 있습니다. `Buffer`를 포함해 직렬화할 수 있는 모든 데이터 구조를 지원합니다.

```js
socket.emit("hello", "world");
socket.emit("with-binary", 1, "2", { 3: "4", 5: Buffer.from([6, 7, 8]) });
```

`ack` 인자는 선택 사항이며, 서버의 응답을 인자로 받아 호출됩니다.

*클라이언트*

```js
socket.emit("hello", "world", (response) => {
  console.log(response); // "got it"
});
```

*서버*

```js
io.on("connection", (socket) => {
  socket.on("hello", (arg, callback) => {
    console.log(arg); // "world"
    callback("got it");
  });
});
```

#### socket.emitWithAck(eventName[, ...args]) {#socketemitwithackeventname-args}

*v4.6.0에서 추가*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `args` `any[]`
- **반환값** [`Promise<any>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

이벤트를 보내고 서버의 확인 응답(acknowledgement)을 기다리는 Promise 기반 버전입니다.

```js
// 타임아웃 없이
const response = await socket.emitWithAck("hello", "world");

// 타임아웃을 지정해서
try {
  const response = await socket.timeout(10000).emitWithAck("hello", "world");
} catch (err) {
  // 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
}
```

위 예시는 다음 코드와 같습니다.

```js
// 타임아웃 없이
socket.emit("hello", "world", (val) => {
  // ...
});

// 타임아웃을 지정해서
socket.timeout(10000).emit("hello", "world", (err, val) => {
  // ...
});
```

받는 쪽인 서버에서는 다음과 같이 처리합니다.

```js
io.on("connection", (socket) => {
  socket.on("hello", (arg1, callback) => {
    callback("got it"); // 인자는 하나만 받습니다
  });
});
```

:::caution

[Promise를 지원하지 않는](https://caniuse.com/promises) 환경에서 이 기능을 사용하려면 폴리필을 추가해야 합니다.

:::

#### socket.listeners(eventName) {#socketlistenerseventname}

*[EventEmitter 클래스](https://www.npmjs.com/package/@socket.io/component-emitter)에서 상속*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- **반환값** [`<Function[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

`eventName` 이벤트의 리스너 배열을 반환합니다.

```js
socket.on("my-event", () => {
  // ...
});

console.log(socket.listeners("my-event")); // [ [Function] ] 출력
```

#### socket.listenersAny() {#socketlistenersany}

*v3.0.0에서 추가*

- **반환값** [`<Function[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

모든 이벤트를 받도록 등록된 리스너(catch-all listener) 목록을 반환합니다.

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

#### socket.off([eventName][, listener]) {#socketoffeventname-listener}

*[EventEmitter 클래스](https://www.npmjs.com/package/@socket.io/component-emitter)에서 상속*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** [`<Socket>`](#socket)

`eventName` 이벤트의 리스너 배열에서 지정한 `listener`를 제거합니다.

```js
const myListener = () => {
  // ...
}

socket.on("my-event", myListener);

// 나중에
socket.off("my-event", myListener);
```

`listener` 인자는 생략할 수도 있습니다.

```js
// 이 이벤트의 리스너를 모두 제거
socket.off("my-event");

// 모든 이벤트의 리스너 제거
socket.off();
```

#### socket.offAny([listener]) {#socketoffanylistener}

*v3.0.0에서 추가*

- `listener` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

앞서 등록한 리스너를 제거합니다. 리스너를 지정하지 않으면 catch-all 리스너를 모두 제거합니다.

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

앞서 등록한 리스너를 제거합니다. 리스너를 지정하지 않으면 catch-all 리스너를 모두 제거합니다.

```js
const myListener = () => { /* ... */ };

socket.onAnyOutgoing(myListener);

// 리스너 하나만 제거
socket.offAnyOutgoing(myListener);

// 리스너를 모두 제거
socket.offAnyOutgoing();
```

#### socket.on(eventName, callback) {#socketoneventname-callback}

*[EventEmitter 클래스](https://www.npmjs.com/package/@socket.io/component-emitter)에서 상속*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** [`<Socket>`](#socket)

주어진 이벤트에 새 핸들러를 등록합니다.

```js
socket.on("news", (data) => {
  console.log(data);
});

// 인자가 여러 개인 경우
socket.on("news", (arg1, arg2, arg3, arg4) => {
  // ...
});
// 콜백을 받는 경우
socket.on("news", (cb) => {
  cb(0);
});
```

#### socket.onAny(callback) {#socketonanycallback}

*v3.0.0에서 추가*

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

#### socket.once(eventName, callback) {#socketonceeventname-callback}

*[EventEmitter 클래스](https://www.npmjs.com/package/@socket.io/component-emitter)에서 상속*

- `eventName` [`<string>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [`<symbol>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
- `callback` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **반환값** [`<Socket>`](#socket)

`eventName` 이벤트에 한 번만 실행되는 `callback` 함수를 추가합니다. 다음에 `eventName` 이벤트가 발생하면 이 리스너는 제거된 뒤 호출됩니다.

```js
socket.once("my-event", () => {
  // ...
});
```

#### socket.open() {#socketopen}

*v1.0.0에서 추가*

[socket.connect()](#socketconnect)와 같습니다.

#### socket.prependAny(callback) {#socketprependanycallback}

*v3.0.0에서 추가*

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

#### socket.send([...args][, ack]) {#socketsendargs-ack}

  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **반환값** [`<Socket>`](#socket)

`message` 이벤트를 보냅니다. [socket.emit(eventName[, ...args][, ack])](#socketemiteventname-args)를 참고하세요.

#### socket.timeout(value) {#sockettimeoutvalue}

*v4.4.0에서 추가*

- `value` [`<number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)
- **반환값** [`<Socket>`](#socket)

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 지정한 시간(밀리초) 안에 서버의 확인 응답이 오지 않으면
콜백이 오류와 함께 호출됩니다.

```js
socket.timeout(5000).emit("my-event", (err) => {
  if (err) {
    // 서버가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  }
});
```

### 플래그 {#flags}

#### Flag: 'volatile' {#flag-volatile}

*v3.0.0에서 추가*

바로 다음에 보내는 이벤트에 적용할 modifier를 설정합니다. 다음과 같은 경우 패킷이 버려질 수 있습니다.

- 소켓이 연결되어 있지 않은 경우
- 저수준 전송 방식이 쓰기 가능한 상태가 아닌 경우(예: HTTP 롱 폴링 모드에서 이미 `POST` 요청이 진행 중일 때)

```js
socket.volatile.emit(/* ... */); // 서버가 받을 수도 있고 받지 못할 수도 있습니다
```
