---
title: How to use with Next.js
---

# How to use with Next.js

This guide shows how to use Socket.IO within a [Next.js](https://nextjs.org/) application.

:::caution

You won't be able to deploy your application on [Vercel](https://vercel.com), as it does not support WebSocket connections.

Reference: https://vercel.com/guides/do-vercel-serverless-functions-support-websocket-connections

:::

## Server

The Socket.IO server can share the same underlying HTTP server with Next.js. You just have to create a `server.js` file at the root of your project:

```js title=server.js
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    // ...
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
```

The `server.js` file becomes the entrypoint of your application:

```diff package.json
{
  "scripts": {
-   "dev": "next dev",
+   "dev": "node server.js",
    "build": "next build",
-   "start": "next start",
+   "start": "NODE_ENV=production node server.js",
    "lint": "next lint"
  }
}
```

And voilà!

Reference: https://nextjs.org/docs/pages/building-your-application/configuring/custom-server

:::tip

This works with both the App router and the Pages router.

:::

:::caution

From the Next.js documentation:

- Before deciding to use a custom server, please keep in mind that it should only be used when the integrated router of Next.js can't meet your app requirements. A custom server will remove important performance optimizations, like serverless functions and [Automatic Static Optimization](https://nextjs.org/docs/pages/building-your-application/rendering/automatic-static-optimization).
- A custom server cannot be deployed on [Vercel](https://vercel.com/solutions/nextjs).
- Standalone output mode, does not trace custom server files and this mode outputs a separate minimal server.js file instead.

:::

## Client

On the client side, all tips from our [React guide](/how-to/use-with-react) are valid.

The only difference is that you need to exclude the Socket.IO client from server-side rendering (SSR):

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="nextjs-router">
  <TabItem value="app" label="App router" default>

Structure:

```
├── src
│ ├── app
│ │ └── page.js
│ └── socket.js
└── package.json
```

```js title="src/socket.js"
"use client";

import { io } from "socket.io-client";

export const socket = io();
```

:::note

`"use client"` indicates that the file is part of the client bundle, and won't be server-rendered.

Reference: https://nextjs.org/docs/app/building-your-application/rendering/client-components

:::

```js title="src/app/page.js"
"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div>
      <p>Status: { isConnected ? "connected" : "disconnected" }</p>
      <p>Transport: { transport }</p>
    </div>
  );
}
```

  </TabItem>
  <TabItem value="pages" label="Pages router">

Structure:

```
├── src
│ ├── pages
│ │ └── index.js
│ └── socket.js
└── package.json
```

```js title="src/socket.js"
import { io } from "socket.io-client";

const isBrowser = typeof window !== "undefined";

export const socket = isBrowser ? io() : {};
```

:::note

The `isBrowser` check is important, as it prevents Next.js from trying to create a Socket.IO client when doing server-side rendering.

Reference: https://nextjs.org/docs/pages/building-your-application/rendering/client-side-rendering

:::

```js title="src/pages/index.js"
import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div>
      <p>Status: { isConnected ? "connected" : "disconnected" }</p>
      <p>Transport: { transport }</p>
    </div>
  );
}
```

  </TabItem>
</Tabs>

:::note

We could have used:

```js
const [isConnected, setIsConnected] = useState(socket.connected);
```

instead of:

```js
const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  if (socket.connected) {
    onConnect();
  }
  // ...
});
```

but this triggers some warnings from the Next.js compiler, as the client-rendered page may not match the server-rendered output.

> Uncaught Error: Text content does not match server-rendered HTML.

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
