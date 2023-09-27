---
title: 发出备忘单
sidebar_position: 5
slug: /emit-cheatsheet/
toc_max_heading_level: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::warning

The following event names are reserved and must not be used in your application:

- `connect`
- `connect_error`
- `disconnect`
- `disconnecting`
- `newListener`
- `removeListener`

```js
// BAD, will throw an error
socket.emit("disconnecting");
```

:::

## Server

### Single client

#### Basic emit

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

#### Acknowledgement and timeout

<Tabs>
  <TabItem value="callback" label="Callback" default>

```js
io.on("connection", (socket) => {
  socket.timeout(5000).emit("hello", "world", (err, arg1, arg2, arg3) => {
    if (err) {
      // the client did not acknowledge the event in the given delay
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
    // the client did not acknowledge the event in the given delay
  }
});
```

  </TabItem>
</Tabs>

### Broadcasting

#### To all connected clients

```js
io.emit("hello");
```

#### Except the sender

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
    // some clients did not acknowledge the event in the given delay
  } else {
    console.log(responses); // one response per client
  }
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
try {
  const responses = await io.timeout(5000).emitWithAck("hello", "world");
  console.log(responses); // one response per client
} catch (e) {
  // some clients did not acknowledge the event in the given delay
}
```

  </TabItem>
</Tabs>

#### In a room

- to all connected clients in the room named "my room"

```js
io.to("my room").emit("hello");
```

- to all connected clients except the ones in the room named "my room"

```js
io.except("my room").emit("hello");
```

- with multiple clauses

```js
io.to("room1").to(["room2", "room3"]).except("room4").emit("hello");
```

#### In a namespace

```js
io.of("/my-namespace").emit("hello");
```

:::tip

The modifiers can absolutely be chained:

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

This will emit a "hello" event to all connected clients:

- in the namespace named `my-namespace`
- in at least one of the rooms named `room1`, `room2` and `room3`, but not in `room4`
- except the sender

And expect an acknowledgement in the next 5 seconds.

:::

### Between servers

#### Basic emit

```js
io.serverSideEmit("hello", "world");
```

Receiving side:

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
    // some servers did not acknowledge the event in the given delay
  } else {
    console.log(responses); // one response per server (except the current one)
  }
});
```

  </TabItem>
  <TabItem value="promise" label="Promise">

```js
try {
  const responses = await io.serverSideEmitWithAck("hello", "world");
  console.log(responses); // one response per server (except the current one)
} catch (e) {
  // some servers did not acknowledge the event in the given delay
}
```

  </TabItem>
</Tabs>

Receiving side:

```js
io.on("hello", (value, callback) => {
  console.log(value); // "world"
  callback("hi");
});
```

## Client

### Basic emit

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

### Acknowledgement and timeout

<Tabs>
  <TabItem value="callback" label="Callback" default>

```js
socket.timeout(5000).emit("hello", "world", (err, arg1, arg2, arg3) => {
  if (err) {
    // the server did not acknowledge the event in the given delay
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
  // the server did not acknowledge the event in the given delay
}
```

  </TabItem>
</Tabs>
