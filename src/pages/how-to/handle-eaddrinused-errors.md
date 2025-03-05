---
title: How to handle EADDRINUSE errors
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to handle `EADDRINUSE` errors

One of the most common errors raised when starting a HTTP server is `EADDRINUSE`. This happens when another server is already listening on the requested `port`/`path`/`handle`:

```
node:events:489
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::8080
    at Server.setupListenHandle [as _listen2] (node:net:1829:16)
    at listenInCluster (node:net:1877:12)
    at Server.listen (node:net:1965:7)
```

On Linux, you can use the `netstat` command to identify which process currently uses the port:

```
$ netstat -ap | grep 8080 | grep LISTEN
tcp        0      0 localhost:8080          0.0.0.0:*               LISTEN      12345/node
```

:::tip

When testing, you might not need to use a specific port. You can simply omit the port (or use `0`) and the operating system will automatically pick an arbitrary unused port for you:

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
