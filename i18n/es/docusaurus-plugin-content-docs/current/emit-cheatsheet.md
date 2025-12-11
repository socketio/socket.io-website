---
title: Hoja de referencia de emit
slug: /emit-cheatsheet/
toc_max_heading_level: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::caution

Los siguientes nombres de eventos están reservados y no deben usarse en tu aplicación:

- `connect`
- `connect_error`
- `disconnect`
- `disconnecting`
- `newListener`
- `removeListener`

```js
// MAL, lanzará un error
socket.emit("disconnecting");
```

:::

## Servidor

### Cliente único

#### Emit básico

```js
io.on("connection", (socket) => {
  socket.emit("hello", 1, "2", { 3: "4", 5: Buffer.from([6]) });
});
```

#### Acknowledgement

<Tabs>
  <TabItem value="callback" label="Callback" default>

```js
io.on("connection", (socket) => {
  socket.emit("hello", "world", (arg1, arg2, arg3) => {
    // ...
  });
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
io.on("connection", async (socket) => {
  const response = await socket.emitWithAck("hello", "world");
});
```

  </TabItem>
</Tabs>

#### Acknowledgement y timeout

<Tabs>
  <TabItem value="callback" label="Callback" default>

```js
io.on("connection", (socket) => {
  socket.timeout(5000).emit("hello", "world", (err, arg1, arg2, arg3) => {
    if (err) {
      // el cliente no confirmó el evento en el tiempo dado
    } else {
      // ...
    }
  });
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
io.on("connection", async (socket) => {
  try {
    const response = await socket.timeout(5000).emitWithAck("hello", "world");
  } catch (e) {
    // el cliente no confirmó el evento en el tiempo dado
  }
});
```

  </TabItem>
</Tabs>

### Broadcasting

#### A todos los clientes conectados

```js
io.emit("hello");
```

#### Excepto el emisor

```js
io.on("connection", (socket) => {
  socket.broadcast.emit("hello");
});
```

#### Acknowledgements

<Tabs>
  <TabItem value="callback" label="Callback" default>

```js
io.timeout(5000).emit("hello", "world", (err, responses) => {
  if (err) {
    // algunos clientes no confirmaron el evento en el tiempo dado
  } else {
    console.log(responses); // una respuesta por cliente
  }
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
try {
  const responses = await io.timeout(5000).emitWithAck("hello", "world");
  console.log(responses); // una respuesta por cliente
} catch (e) {
  // algunos clientes no confirmaron el evento en el tiempo dado
}
```

  </TabItem>
</Tabs>

#### En una sala

- a todos los clientes conectados en la sala llamada "my room"

```js
io.to("my room").emit("hello");
```

- a todos los clientes conectados excepto los de la sala llamada "my room"

```js
io.except("my room").emit("hello");
```

- con múltiples cláusulas

```js
io.to("room1").to(["room2", "room3"]).except("room4").emit("hello");
```

#### En un namespace

```js
io.of("/my-namespace").emit("hello");
```

:::tip

Los modificadores pueden absolutamente encadenarse:

```js
io.of("/my-namespace").on("connection", (socket) => {
  socket
    .timeout(5000)
    .to("room1")
    .to(["room2", "room3"])
    .except("room4")
    .emit("hello", (err, responses) => {
      // ...
    });
});
```

Esto emitirá un evento "hello" a todos los clientes conectados:

- en el namespace llamado `my-namespace`
- en al menos una de las salas llamadas `room1`, `room2` y `room3`, pero no en `room4`
- excepto el emisor

Y espera un acknowledgement en los próximos 5 segundos.

:::

### Entre servidores

#### Emit básico

```js
io.serverSideEmit("hello", "world");
```

Lado receptor:

```js
io.on("hello", (value) => {
  console.log(value); // "world"
});
```

#### Acknowledgements

<Tabs>
  <TabItem value="callback" label="Callback" default>

```js
io.serverSideEmit("hello", "world", (err, responses) => {
  if (err) {
    // algunos servidores no confirmaron el evento en el tiempo dado
  } else {
    console.log(responses); // una respuesta por servidor (excepto el actual)
  }
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
try {
  const responses = await io.serverSideEmitWithAck("hello", "world");
  console.log(responses); // una respuesta por servidor (excepto el actual)
} catch (e) {
  // algunos servidores no confirmaron el evento en el tiempo dado
}
```

  </TabItem>
</Tabs>

Lado receptor:

```js
io.on("hello", (value, callback) => {
  console.log(value); // "world"
  callback("hi");
});
```

## Cliente

### Emit básico

```js
socket.emit("hello", 1, "2", { 3: "4", 5: Uint8Array.from([6]) });
```

### Acknowledgement

<Tabs>
  <TabItem value="callback" label="Callback" default>

```js
socket.emit("hello", "world", (arg1, arg2, arg3) => {
  // ...
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
const response = await socket.emitWithAck("hello", "world");
```

  </TabItem>
</Tabs>

### Acknowledgement y timeout

<Tabs>
  <TabItem value="callback" label="Callback" default>

```js
socket.timeout(5000).emit("hello", "world", (err, arg1, arg2, arg3) => {
  if (err) {
    // el servidor no confirmó el evento en el tiempo dado
  } else {
    // ...
  }
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
try {
  const response = await socket.timeout(5000).emitWithAck("hello", "world");
} catch (e) {
  // el servidor no confirmó el evento en el tiempo dado
}
```

  </TabItem>
</Tabs>
