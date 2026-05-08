---
title: How to use with Nuxt
---

# How to use with Nuxt

This guide shows how to use Socket.IO within a [Nuxt](https://nuxt.com/) application.

## Server

Under the hood, Nuxt uses [Nitro](https://nitro.unjs.io/) to handle the HTTP requests.

There are two steps to attach a Socket.IO server to a Nitro server:

### Enable WebSockets

WebSockets support in Nitro is currently [experimental](https://github.com/unjs/nitro/issues/2171), so it needs to be manually enabled:

```diff title="nuxt.config.js"
// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: {
    enabled: true
  },
+ nitro: {
+   experimental: {
+     websocket: true
+   },
+ }
})
```

Reference: https://nitro.unjs.io/guide/websocket

### Hook the Socket.IO server

Our Socket.IO server is created in a [Nitro plugin](https://nitro.unjs.io/guide/plugins):

```ts title="server/plugins/socket.io.ts"
import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import { defineEventHandler } from "h3";

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const engine = new Engine();
  const io = new Server();

  io.bind(engine);

  io.on("connection", (socket) => {
    // ...
  });

  nitroApp.router.use("/socket.io/", defineEventHandler({
    handler(event) {
      engine.handleRequest(event.node.req, event.node.res);
      event._handled = true;
    },
    websocket: {
      open(peer) {
        // @ts-expect-error private method and property
        engine.prepare(peer._internal.nodeReq);
        // @ts-expect-error private method and property
        engine.onWebSocket(peer._internal.nodeReq, peer._internal.nodeReq.socket, peer.websocket);
      }
    }
  }));
});
```

And voilà!

## Client

On the client side, all tips from our [Vue 3 guide](/how-to/use-with-vue) are valid.

The only difference is that you need to exclude the Socket.IO client from server-side rendering (SSR):


Structure:

```
├── components
│ ├── Connection.client.vue
│ └── socket.ts
...
```

```js title="components/socket.ts"
import { io } from "socket.io-client";

export const socket = io();
```



```html title="components/Connection.client.vue"
<script setup>
import { socket } from "./socket";

const isConnected = ref(false);
const transport = ref("N/A");

if (socket.connected) {
  onConnect();
}

function onConnect() {
  isConnected.value = true;
  transport.value = socket.io.engine.transport.name;

  socket.io.engine.on("upgrade", (rawTransport) => {
    transport.value = rawTransport.name;
  });
}

function onDisconnect() {
  isConnected.value = false;
  transport.value = "N/A";
}

socket.on("connect", onConnect);
socket.on("disconnect", onDisconnect);

onBeforeUnmount(() => {
  socket.off("connect", onConnect);
  socket.off("disconnect", onDisconnect);
});

</script>

<template>
<div>
  <p>Status: {{ isConnected ? "connected" : "disconnected" }}</p>
  <p>Transport: {{ transport }}</p>
</div>
</template>

```

:::note

The `.client` suffix in `Connection.client.vue` indicates that the component is meant to be rendered only client-side (no SSR).

Reference: https://nuxt.com/docs/guide/directory-structure/components#client-components

:::

In the example above, the `transport` variable is the low-level transport used to establish the Socket.IO connection, which can be either:

- HTTP long-polling (`"polling"`)
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) (`"websocket"`)
- [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API) (`"webtransport"`)

If everything went well, you should see:

```
Status: connected
Transport: websocket
```

You can then exchange messages between the Socket.IO server and client with:

- `socket.emit()` to send messages

```js
socket.emit("hello", "world");
```

- `socket.on()` to receive messages

```js
socket.on("hello", (value) => {
  // ...
});
```

That's all folks, thanks for reading!

[Back to the list of examples](/get-started/)
