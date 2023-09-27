---
title: How to handle EADDRINUSE errors
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to handle `EADDRINUSE` errors

One of the most common errors raised when listening is `EADDRINUSE`. This happens when another server is already listening on the requested `port`/`path`/`handle`:

```
node:events:489
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::8080
    at Server.setupListenHandle [as _listen2] (node:net:1829:16)
    at listenInCluster (node:net:1877:12)
    at Server.listen (node:net:1965:7)
```

One way to handle this would be to catch the error and retry after a certain amount of time:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```ts
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer);

const PORT = process.env.PORT || 8080;

io.on("connection", (socket) => {
  // ...
});

httpServer.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error("Address already in use, retrying in a few seconds...");
    setTimeout(() => {
      httpServer.listen(PORT);
    }, 1000);
  }
});

httpServer.listen(PORT);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { createServer } from "node:http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer);

const PORT = process.env.PORT || 8080;

io.on("connection", (socket) => {
  // ...
});

httpServer.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error("Address already in use, retrying in a few seconds...");
    setTimeout(() => {
      httpServer.listen(PORT);
    }, 1000);
  }
});

httpServer.listen(PORT);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { createServer } from "node:http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer);

const PORT = process.env.PORT || 8080;

io.on("connection", (socket) => {
  // ...
});

httpServer.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error("Address already in use, retrying in a few seconds...");
    setTimeout(() => {
      httpServer.listen(PORT);
    }, 1000);
  }
});

httpServer.listen(PORT);
```

  </TabItem>
</Tabs>

Reference: https://nodejs.org/api/net.html#serverlisten

:::tip

When testing, you might not need to use a specific port. You can simply omit the port and the operating system will automatically pick an arbitrary unused port for you:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```ts
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer);

httpServer.listen(() => {
  const port = httpServer.address().port;
  // ...
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { createServer } from "node:http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer);

httpServer.listen(() => {
  const port = httpServer.address().port;
  // ...
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer);

httpServer.listen(() => {
  const port = (httpServer.address() as AddressInfo).port;
  // ...
});
```

  </TabItem>
</Tabs>

:::

[Back to the list of examples](/get-started/)
