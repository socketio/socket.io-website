---
title: How to use with `express-session`
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to use with `express-session`

Let's start from a basic application:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const session = require("express-session");

const port = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.post("/incr", (req, res) => {
  const session = req.session;
  session.count = (session.count || 0) + 1;
  res.status(200).end("" + session.count);
});

const io = new Server(httpServer);

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import session from "express-session";

const port = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

app.get("/", (req, res) => {
  res.sendFile(new URL("./index.html", import.meta.url).pathname);
});

app.post("/incr", (req, res) => {
  const session = req.session;
  session.count = (session.count || 0) + 1;
  res.status(200).end("" + session.count);
});

const io = new Server(httpServer);

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import express = require("express");
import { createServer } from "node:http";
import { Server } from "socket.io";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    count: number;
  }
}

const port = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

app.get("/", (req, res) => {
  res.sendFile(new URL("./index.html", import.meta.url).pathname);
});

app.post("/incr", (req, res) => {
  const session = req.session;
  session.count = (session.count || 0) + 1;
  res.status(200).end("" + session.count);
});

const io = new Server(httpServer);

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
```

:::note

You'll need those additional types:

```
npm install @types/express @types/express-session
```

:::

  </TabItem>
</Tabs>

## Sharing the session context

The session context can be shared with the Socket.IO server by calling:

```js
io.engine.use(sessionMiddleware);
```

As simple as that! You'll now have access to the `session` object:

```js
io.on("connection", (socket) => {
  const session = socket.request.session;
});
```

## Using the session ID

You can use the session ID to make the link between Express and Socket.IO:

```js 
io.on("connection", (socket) => {
  const sessionId = socket.request.session.id;

  // the session ID is used as a room
  socket.join(sessionId);
});
```

You can then notify every connected client in the `/incr` handler:

```js
app.post("/incr", (req, res) => {
  const session = req.session;
  session.count = (session.count || 0) + 1;
  res.status(200).end("" + session.count);

  // highlight-start
  io.to(session.id).emit("current count", session.count);
  // highlight-end
});
```

Same for the log-out flow:

```js
app.post("/logout", (req, res) => {
  const sessionId = req.session.id;

  req.session.destroy(() => {
    // disconnect all Socket.IO connections linked to this session ID
    // highlight-start
    io.in(sessionId).disconnectSockets();
    // highlight-end
    res.status(204).end();
  });
});
```

## Modifying the session

Since it is not bound to a single HTTP request, the session must be manually reloaded and saved:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
io.on("connection", (socket) => {
  const req = socket.request;

  socket.on("my event", () => {
    req.session.reload((err) => {
      if (err) {
        return socket.disconnect();
      }
      req.session.count++;
      req.session.save();
    });
  });
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
io.on("connection", (socket) => {
  const req = socket.request;

  socket.on("my event", () => {
    req.session.reload((err) => {
      if (err) {
        return socket.disconnect();
      }
      req.session.count++;
      req.session.save();
    });
  });
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { type Request } from "express";

io.on("connection", (socket) => {
  const req = socket.request as Request;

  socket.on("my event", () => {
    req.session.reload((err) => {
      if (err) {
        return socket.disconnect();
      }
      req.session.count++;
      req.session.save();
    });
  });
});
```

  </TabItem>
</Tabs>

You can also use a [middleware](/docs/v4/server-api/#socketusefn) which will be triggered for each incoming packet:

```js
io.on("connection", (socket) => {
  const req = socket.request;

  socket.use((__, next) => {
    req.session.reload((err) => {
      if (err) {
        socket.disconnect();
      } else {
        next();
      }
    });
  });

  // and then simply
  socket.on("my event", () => {
    req.session.count++;
    req.session.save();
  });
});
```

:::caution

Calling `req.session.reload()` updates the `req.session` object:

```js
io.on("connection", (socket) => {
  const session = socket.request.session;

  socket.use((__, next) => {
    session.reload(() => {
      // WARNING! "session" still points towards the previous session object
    });
  });
});
```

:::

## Handling session expiration

You may also want to periodically reload the session, in case it expires (for example if the client does not send any event for an extended period of time):

```js
const SESSION_RELOAD_INTERVAL = 30 * 1000;

io.on("connection", (socket) => {
  const timer = setInterval(() => {
    socket.request.session.reload((err) => {
      if (err) {
        // forces the client to reconnect
        socket.conn.close();
        // you can also use socket.disconnect(), but in that case the client
        // will not try to reconnect
      }
    });
  }, SESSION_RELOAD_INTERVAL);

  socket.on("disconnect", () => {
    clearInterval(timer);
  });
});
```

## Notes for cross-site requests

`express-session` relies on a cookie to persist the session in the browser. So if your frontend domain is different from your backend domain (for example, if you have a SPA running on your machine but on a different port), then you will need to send the appropriate CORS headers:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const cors = require("cors");
    
const corsOptions = {
  origin: ["http://localhost:4200"],
  credentials: true
};

// for Express
app.use(cors(corsOptions));

// for Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import cors from "cors";
    
const corsOptions = {
  origin: ["http://localhost:4200"],
  credentials: true
};

// for Express
app.use(cors(corsOptions));

// for Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import cors = require("cors");
    
const corsOptions = {
  origin: ["http://localhost:4200"],
  credentials: true
};

// for Express
app.use(cors(corsOptions));

// for Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions
});
```

  </TabItem>
</Tabs>

You will also need to set the `withCredentials` option to `true` on the client side:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true
});
```

That's it for the compatibility with `express-session`. Thanks for reading!

:::tip

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/express-session-example/cjs?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/express-session-example/cjs?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/express-session-example/esm?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/express-session-example/esm?file=index.js)


  </TabItem>
  <TabItem value="ts" label="TypeScript" attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/express-session-example/ts?file=index.ts)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/express-session-example/ts?file=index.ts)


  </TabItem>
</Tabs>

:::
