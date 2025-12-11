---
title: TypeScript
sidebar_position: 8
slug: /typescript/
---

A partir de la versión 3, Socket.IO ahora tiene soporte de primera clase para [TypeScript](https://www.typescriptlang.org/).

## Tipos para el servidor

Primero, declara algunos tipos:

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

Y úsalos al crear tu servidor:

```ts
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>();
```

¡Entonces, aprovecha la ayuda de tu IDE!

Los eventos declarados en la interfaz `ServerToClientEvents` se usan al enviar y transmitir eventos:

```ts
io.on("connection", (socket) => {
  socket.emit("noArg");
  socket.emit("basicEmit", 1, "2", Buffer.from([3]));
  socket.emit("withAck", "4", (e) => {
    // e se infiere como number
  });

  // funciona al transmitir a todos
  io.emit("noArg");

  // funciona al transmitir a una sala
  io.to("room1").emit("basicEmit", 1, "2", Buffer.from([3]));
});
```

Los declarados en la interfaz `ClientToServerEvents` se usan al recibir eventos:

```ts
io.on("connection", (socket) => {
  socket.on("hello", () => {
    // ...
  });
});
```

Los declarados en la interfaz `InterServerEvents` se usan para la comunicación entre servidores (añadido en `socket.io@4.1.0`):

```ts
io.serverSideEmit("ping");

io.on("ping", () => {
  // ...
});
```

Y finalmente, el tipo `SocketData` se usa para tipar el atributo `socket.data` (añadido en `socket.io@4.4.0`):

```ts
io.on("connection", (socket) => {
  socket.data.name = "john";
  socket.data.age = 42;
});
```

:::caution

Estas sugerencias de tipo no reemplazan la validación/sanitización adecuada de la entrada. Como siempre, nunca confíes en la entrada del usuario.

:::

## Tipos para el cliente

En el lado del cliente, puedes reutilizar las mismas interfaces `ServerToClientEvents` y `ClientToServerEvents`:

```ts
import { io, Socket } from "socket.io-client";

// por favor nota que los tipos están invertidos
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
```

De manera similar, los eventos declarados en la interfaz `ClientToServerEvents` se usan al enviar eventos:

```ts
socket.emit("hello");
```

Y los declarados en `ServerToClientEvents` se usan al recibir eventos:

```ts
socket.on("noArg", () => {
  // ...
});

socket.on("basicEmit", (a, b, c) => {
  // a se infiere como number, b como string y c como buffer
});

socket.on("withAck", (d, callback) => {
  // d se infiere como string y callback como una función que toma un number como argumento
});
```

## Tipos personalizados para cada namespace

Ya que cada [Namespace](../06-Advanced/namespaces.md) puede tener su propio conjunto de eventos, también puedes proporcionar algunos tipos para cada uno de ellos:

```ts
import { Server } from "socket.io";

// tipos para el namespace principal
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>();

// tipos para el namespace llamado "/my-namespace"
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

Y en el lado del cliente:

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
