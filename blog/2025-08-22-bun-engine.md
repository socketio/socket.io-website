---
title: Bun engine
slug: /bun-engine/
authors:
  - darrachequesne
---

Hello everyone!

We are happy to announce that we now provide a low-level engine for Bun.

<!--truncate-->

:::note for newcomers

**Socket.IO** is a JavaScript library that enables real-time, bidirectional, and event-based communication between a client and a server. It is commonly used for building applications that require low-latency updates, such as chat applications, collaborative tools, or multiplayer games.

To achieve this, it automatically selects the best available low-level transport between [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API), [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) and HTTP long-polling, based on the capabilities of the client platform and the network.

**Bun** is a fast all-in-one JavaScript runtime developed as a modern alternative to Node.js and Deno. It is designed to offer high performance, better developer experience, and compatibility with existing JavaScript/TypeScript projects.

Reference: https://bun.sh/

:::

Bun could already be used without any modification:

```js
import { Server } from "socket.io";

const io = new Server({ /* options */ });

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

However, this relied on Bun's polyfill for the Node.js HTTP server.

So, in order to fully benefit from the performance of Bun's native HTTP server, we have created a dedicated engine:

```js
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";

const io = new Server();

const engine = new Engine({
  path: "/socket.io/",
});

io.bind(engine);

io.on("connection", (socket) => {
  // ...
});

export default {
  port: 3000,
  idleTimeout: 30, // must be greater than the "pingInterval" option of the engine, which defaults to 25 seconds

  ...engine.handler(),
};
```

Which means that you can now take advantage of the speed and scalability of Bun, with the same high-level API offered by Socket.IO (and its existing adapters, when scaling to multiple servers).

The source code of this engine can be found here: https://github.com/socketio/bun-engine

:::tip

This new engine can also be used in conjunction with Hono:

```js
import { Server } from "socket.io";
import { Server as Engine } from "@socket.io/bun-engine";
import { Hono } from "hono";

const io = new Server();
const engine = new Engine();

io.bind(engine);

io.on("connection", (socket) => {
  // ...
});

const app = new Hono();

const { websocket } = engine.handler();

export default {
  port: 3000,
  idleTimeout: 30, // must be greater than the "pingInterval" option of the engine, which defaults to 25 seconds

  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/socket.io/") {
      return engine.handleRequest(req, server);
    } else {
      return app.fetch(req, server);
    }
  },

  websocket
}
```

Reference: https://hono.dev/docs/

:::

Have a great day!
