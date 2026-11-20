---
title: 네임스페이스
sidebar_position: 1
slug: /namespaces/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

네임스페이스는 하나의 연결을 공유하면서 애플리케이션의 로직을 나눌 수 있게 해 주는 통신 채널입니다("멀티플렉싱"이라고도 합니다).

<ThemedImage
  alt="네임스페이스 다이어그램"
  sources={{
    light: useBaseUrl('/images/namespaces.png'),
    dark: useBaseUrl('/images/namespaces-dark.png'),
  }}
/>

## 소개 {#introduction}

네임스페이스마다 다음 항목이 따로 있습니다.

- [이벤트 핸들러](../04-Events/listening-to-events.md)

```js
io.of("/orders").on("connection", (socket) => {
  socket.on("order:list", () => {});
  socket.on("order:create", () => {});
});

io.of("/users").on("connection", (socket) => {
  socket.on("user:list", () => {});
});
```

- [룸](../04-Events/rooms.md)

```js
const orderNamespace = io.of("/orders");

orderNamespace.on("connection", (socket) => {
  socket.join("room1");
  orderNamespace.to("room1").emit("hello");
});

const userNamespace = io.of("/users");

userNamespace.on("connection", (socket) => {
  socket.join("room1"); // "orders" 네임스페이스의 룸과는 별개입니다
  userNamespace.to("room1").emit("hola");
});
```

- [미들웨어](../02-Server/middlewares.md)

```js
const orderNamespace = io.of("/orders");

orderNamespace.use((socket, next) => {
  // 소켓이 "orders" 네임스페이스에 접근할 수 있는지 확인한 다음
  next();
});

const userNamespace = io.of("/users");

userNamespace.use((socket, next) => {
  // 소켓이 "users" 네임스페이스에 접근할 수 있는지 확인한 다음
  next();
});
```

활용 예:

- 권한이 있는 사용자만 접근할 수 있는 특별한 네임스페이스를 만들어, 이런 사용자와 관련된 로직을 애플리케이션의 나머지 부분과 분리하고 싶은 경우

```js
const adminNamespace = io.of("/admin");

adminNamespace.use((socket, next) => {
  // 사용자에게 충분한 권한이 있는지 확인합니다
  next();
});

adminNamespace.on("connection", (socket) => {
  socket.on("delete user", () => {
    // ...
  });
});
```

- 애플리케이션에 테넌트가 여러 개 있어서 테넌트마다 네임스페이스를 하나씩 동적으로 만들고 싶은 경우

```js
const workspaces = io.of(/^\/\w+$/);

workspaces.on("connection", (socket) => {
  const workspace = socket.nsp;

  workspace.emit("hello");
});
```

## 메인 네임스페이스 {#main-namespace}

지금까지는 `/`라는 이름의 메인 네임스페이스를 사용했습니다. `io` 인스턴스는 메인 네임스페이스의 메서드를 모두 상속합니다.

```js
io.on("connection", (socket) => {});
io.use((socket, next) => { next() });
io.emit("hello");
// 위 코드는 실제로 다음 코드와 같습니다
io.of("/").on("connection", (socket) => {});
io.of("/").use((socket, next) => { next() });
io.of("/").emit("hello");
```

일부 튜토리얼에 나오는 `io.sockets`는 `io.of("/")`의 별칭일 뿐입니다.

```js
io.sockets === io.of("/")
```

## 커스텀 네임스페이스 {#custom-namespaces}

커스텀 네임스페이스를 만들려면 서버 측에서 `of` 함수를 호출하세요.

```js
const nsp = io.of("/my-namespace");

nsp.on("connection", (socket) => {
  console.log("someone connected");
});

nsp.emit("hi", "everyone!");
```

## 클라이언트 초기화 {#client-initialization}

같은 출처(same-origin)인 경우:

```js
const socket = io(); // 또는 io("/"), 메인 네임스페이스
const orderSocket = io("/orders"); // "orders" 네임스페이스
const userSocket = io("/users"); // "users" 네임스페이스
```

다른 출처(cross-origin)에 연결하거나 Node.js에서 실행하는 경우:

```js
const socket = io("https://example.com"); // 또는 io("https://example.com/"), 메인 네임스페이스
const orderSocket = io("https://example.com/orders"); // "orders" 네임스페이스
const userSocket = io("https://example.com/users"); // "users" 네임스페이스
```

위 예시에서는 저수준 연결이 하나만 맺어지고, 패킷은 자동으로 알맞은 네임스페이스로 라우팅됩니다.

단, 다음과 같은 경우에는 멀티플렉싱이 적용되지 않습니다.

- 같은 네임스페이스를 여러 번 생성하는 경우

```js
const socket1 = io();
const socket2 = io(); // 멀티플렉싱 없음, 서로 다른 WebSocket 연결 두 개
```

- 도메인이 다른 경우

```js
const socket1 = io("https://first.example.com");
const socket2 = io("https://second.example.com"); // 멀티플렉싱 없음, 서로 다른 WebSocket 연결 두 개
```

- [forceNew](../../client-options.md#forcenew) 옵션을 사용하는 경우

```js
const socket1 = io();
const socket2 = io("/admin", { forceNew: true }); // 멀티플렉싱 없음, 서로 다른 WebSocket 연결 두 개
```

## 동적 네임스페이스 {#dynamic-namespaces}

### 사용법 {#usage}

네임스페이스를 동적으로 만들 수도 있습니다. 정규 표현식을 사용하거나

```js
io.of(/^\/dynamic-\d+$/);
```

함수를 사용하면 됩니다.

```js
io.of((name, auth, next) => {
  // name은 요청된 네임스페이스입니다(예: "/workspace-123")
  // auth는 클라이언트가 보낸 인증 페이로드입니다
  next(null, true); // 생성을 거부할 때는 false
});
```

새로 생성된 네임스페이스에는 `connection` 이벤트에서 접근할 수 있습니다.

```js
io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
  const namespace = socket.nsp;
});
```

### 우선순위 {#priority}

기존 네임스페이스가 동적 네임스페이스보다 우선합니다. 예를 들면 다음과 같습니다.

```js
// "dynamic-101" 네임스페이스를 등록합니다
io.of("/dynamic-101");

io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
  // "dynamic-101" 네임스페이스에 연결할 때는 호출되지 않습니다
});
```

### 보안 고려 사항 {#security-considerations}

네임스페이스 생성 여부가 사용자 신원, 권한, 테넌트 소속에 따라 달라진다면 함수 기반 동적 네임스페이스를 사용하는 편이 좋습니다.

예를 들어 다음 패턴을 사용하면

```js
io.of(/^\/\w+$/);
```

어떤 클라이언트든 패턴과 일치하는 이름으로 연결하기만 해도 새 네임스페이스를 만들 수 있습니다. 애플리케이션에 따라서는 의도하지 않은 네임스페이스가 생성되거나 리소스가 예상치 못하게 소모될 수 있습니다.

함수 기반 동적 네임스페이스를 사용하면 생성을 명시적으로 허용하거나 거부할 수 있습니다.

```js
io.of((name, auth, next) => {
  // 네임스페이스 이름과 인증 페이로드를 모두 검증합니다
  next(null, true); // 생성을 거부할 때는 false
});
```

### 부모 네임스페이스 {#parent-namespace}

`of()` 메서드의 반환값을 부모 네임스페이스라고 하며, 부모 네임스페이스로 다음 작업을 할 수 있습니다.

- [미들웨어](../02-Server/middlewares.md) 등록

```js
const parentNamespace = io.of(/^\/dynamic-\d+$/);

parentNamespace.use((socket, next) => {
  next();
});
```

미들웨어는 각 자식 네임스페이스에 자동으로 등록됩니다.

- 이벤트 [브로드캐스트](../04-Events/broadcasting-events.md)

```js
const parentNamespace = io.of(/^\/dynamic-\d+$/);

parentNamespace.emit("hello"); // /dynamic-1, /dynamic-2, ...의 사용자에게 전송됩니다
```

### 빈 자식 네임스페이스 정리 {#cleanup-of-empty-child-namespaces}

동적으로 생성된 자식 네임스페이스는 기본적으로 마지막 소켓의 연결이 끊긴 뒤에도 메모리에 남아 있습니다.

[`cleanupEmptyChildNamespaces`](../../server-options.md#cleanupemptychildnamespaces) 옵션(`v4.6.0`부터 사용 가능)으로 자동 정리를 켤 수 있습니다.

```js
const io = new Server(httpServer, {
  cleanupEmptyChildNamespaces: true,
});
```

이 옵션을 켜면 동적 네임스페이스에서 생성된 자식 네임스페이스는 연결된 소켓이 하나도 남지 않을 때 제거됩니다.

## 전체 API {#complete-api}

Namespace 인스턴스가 제공하는 전체 API는 [서버 API](../../server-api.md#namespace) 문서에서 확인할 수 있습니다.
