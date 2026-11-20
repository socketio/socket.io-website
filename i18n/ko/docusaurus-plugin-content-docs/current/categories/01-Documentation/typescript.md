---
title: TypeScript
sidebar_position: 8
slug: /typescript/
---

Socket.IO는 v3부터 [TypeScript](https://www.typescriptlang.org/)를 정식으로 지원합니다.

## 서버 타입 {#types-for-the-server}

먼저 사용할 타입을 선언하세요.

```ts
interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}
```

그리고 서버를 만들 때 이 타입을 사용하세요.

```ts
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>();
```

이제 IDE의 도움을 받을 수 있습니다!

이벤트를 보내거나 브로드캐스트할 때는 `ServerToClientEvents` 인터페이스의 선언을 따릅니다.

```ts
io.on("connection", (socket) => {
  socket.emit("noArg");
  socket.emit("basicEmit", 1, "2", Buffer.from([3]));
  socket.emit("withAck", "4", (e) => {
    // e는 number로 추론됩니다
  });

  // 모두에게 브로드캐스트할 때도 동작합니다
  io.emit("noArg");

  // 룸에 브로드캐스트할 때도 동작합니다
  io.to("room1").emit("basicEmit", 1, "2", Buffer.from([3]));
});
```

이벤트를 받을 때는 `ClientToServerEvents` 인터페이스의 선언을 따릅니다.

```ts
io.on("connection", (socket) => {
  socket.on("hello", () => {
    // ...
  });
});
```

:::tip

Promise 기반 API에서도 동작합니다.

```ts
interface ServerToClientEvents {
  // [...]
  withAck: (d: string, callback: (result: number) => void) => void;
}

try {
  const result = await socket.timeout(5_000).emitWithAck("withAck", "some string");
  // result는 <number>로 추론됩니다
} catch (err) {
  // 오류 처리
}
```

:::

`InterServerEvents` 인터페이스에 선언한 이벤트는 서버 간 통신에 사용됩니다(`socket.io@4.1.0`에서 추가).

```ts
io.serverSideEmit("ping");

io.on("ping", () => {
  // ...
});
```

마지막으로 `SocketData` 타입으로 `socket.data` 속성의 타입을 지정합니다(`socket.io@4.4.0`에서 추가).

```ts
io.on("connection", (socket) => {
  socket.data.name = "john";
  socket.data.age = 42;
});
```

:::caution

이 타입 힌트가 입력값의 검증이나 정제(sanitization)를 대신하지는 않습니다. 늘 그렇듯 사용자 입력은 절대 신뢰하지 마세요.

:::

## 클라이언트 타입 {#types-for-the-client}

클라이언트 측에서는 같은 `ServerToClientEvents`, `ClientToServerEvents` 인터페이스를 재사용할 수 있습니다.

```ts
import { io, Socket } from "socket.io-client";

// 타입의 순서가 서버와 반대라는 점에 유의하세요
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
```

마찬가지로 이벤트를 보낼 때는 `ClientToServerEvents` 인터페이스의 선언을 따릅니다.

```ts
socket.emit("hello");
```

이벤트를 받을 때는 `ServerToClientEvents`의 선언을 따릅니다.

```ts
socket.on("noArg", () => {
  // ...
});

socket.on("basicEmit", (a, b, c) => {
  // a는 number, b는 string, c는 buffer로 추론됩니다
});

socket.on("withAck", (d, callback) => {
  // d는 string으로, callback은 number를 인자로 받는 함수로 추론됩니다
});
```

## 네임스페이스별 커스텀 타입 {#custom-types-for-each-namespace}

[네임스페이스](../06-Advanced/namespaces.md)마다 이벤트가 다를 수 있으므로
네임스페이스별로 타입을 지정할 수도 있습니다.

```ts
import { Server } from "socket.io";

// 메인 네임스페이스의 타입
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>();

// "/my-namespace" 네임스페이스의 타입
interface NamespaceSpecificClientToServerEvents {
  foo: (arg: string) => void
}

interface NamespaceSpecificServerToClientEvents {
  bar: (arg: string) => void;
}

interface NamespaceSpecificInterServerEvents {
  // ...
}

interface NamespaceSpecificSocketData {
  // ...
}

const myNamespace: Namespace<
  NamespaceSpecificClientToServerEvents,
  NamespaceSpecificServerToClientEvents,
  NamespaceSpecificInterServerEvents,
  NamespaceSpecificSocketData
  > = io.of("/my-namespace");

myNamespace.on("connection", (socket) => {
  socket.on("foo", () => {
    // ...
  });

  socket.emit("bar", "123");
});
```

클라이언트 측은 다음과 같습니다.

```ts
import { io, Socket } from "socket.io-client";

const socket: Socket<
  NamespaceSpecificServerToClientEvents,
  NamespaceSpecificClientToServerEvents
  > = io("/my-namespace");

socket.on("bar", (arg) => {
  console.log(arg); // "123"
});
```
