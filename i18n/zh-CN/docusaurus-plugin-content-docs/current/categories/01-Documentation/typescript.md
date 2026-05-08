---
title: TypeScript
sidebar_position: 8
slug: /typescript/
---

从 v3 开始，Socket.IO 现在对[TypeScript](https://www.typescriptlang.org/)具有很好的支持。

## 服务器 {#types-for-the-server}

首先，声明一些类型：

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

并在创建服务器时使用它们：

```ts
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>();
```

然后，从 IDE 的帮助中获益！

`ServerToClientEvents`在发送和广播事件时使用接口中声明的事件：

```ts
io.on("connection", (socket) => {
  socket.emit("noArg");
  socket.emit("basicEmit", 1, "2", Buffer.from([3]));
  socket.emit("withAck", "4", (e) => {
    // e is inferred as number
  });

  // works when broadcast to all
  io.emit("noArg");

  // works when broadcasting to a room
  io.to("room1").emit("basicEmit", 1, "2", Buffer.from([3]));
});
```

`ClientToServerEvents`接收事件时使用接口中声明的那些：

```ts
io.on("connection", (socket) => {
  socket.on("hello", () => {
    // ...
  });
});
```

接口中声明的`InterServerEvents`用于服务器间通信（于`socket.io@4.1.0`添加）：

```ts
io.serverSideEmit("ping");

io.on("ping", () => {
  // ...
});
```

最后，`SocketData` type 用于键入 `socket.data` 属性 （于`socket.io@4.4.0`添加）：

```ts
io.on("connection", (socket) => {
  socket.data.name = "john";
  socket.data.age = 42;
});
```

:::caution

这些类型提示不会取代输入的正确验证/清理。像往常一样，永远不要相信用户输入。

:::

## 客户端 {#types-for-the-client}

在客户端，您可以重用相同的`ServerToClientEvents` 和 `ClientToServerEvents` 接口：

```ts
import { io, Socket } from "socket.io-client";

// please note that the types are reversed
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
```

同样，在`ClientToServerEvents`发送事件时使用接口中声明的事件：

```ts
socket.emit("hello");
```

`ServerToClientEvents`并且在接收事件时使用声明的那些：

```ts
socket.on("noArg", () => {
  // ...
});

socket.on("basicEmit", (a, b, c) => {
  // a is inferred as number, b as string and c as buffer
});

socket.on("withAck", (d, callback) => {
  // d is inferred as string and callback as a function that takes a number as argument
});
```

## Custom types for each namespace {#custom-types-for-each-namespace}

Since each [Namespace](../06-Advanced/namespaces.md) can have its own set of events, you can also provide some types for
each one of them:

```ts
import { Server } from "socket.io";

// types for the main namespace
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>();

// types for the namespace named "/my-namespace"
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

And on the client side:

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
