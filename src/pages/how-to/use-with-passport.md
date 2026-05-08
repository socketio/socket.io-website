---
title: How to use with Passport.js
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to use with Passport.js

Let's start from a basic application:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { join } = require("node:path");

const port = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.session());

app.get("/", (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.sendFile(join(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.sendFile(join(__dirname, "login.html"));
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
);

passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === "john" && password === "changeit") {
      console.log("authentication OK");
      return done(null, { id: 1, username });
    } else {
      console.log("wrong credentials");
      return done(null, false);
    }
  }),
);

passport.serializeUser((user, cb) => {
  console.log(`serializeUser ${user.id}`);
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  console.log(`deserializeUser ${user.id}`);
  cb(null, user);
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
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";
import bodyParser from "body-parser";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const port = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.session());

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.sendFile(join(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.sendFile(join(__dirname, "login.html"));
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
);

app.post("/logout", (req, res) => {
  const sessionId = req.session.id;
  req.session.destroy(() => {
    // disconnect all Socket.IO connections linked to this session ID
    io.to(`session:${sessionId}`).disconnectSockets();
    res.status(204).end();
  });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === "john" && password === "changeit") {
      console.log("authentication OK");
      return done(null, { id: 1, username });
    } else {
      console.log("wrong credentials");
      return done(null, false);
    }
  }),
);

passport.serializeUser((user, cb) => {
  console.log(`serializeUser ${user.id}`);
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  console.log(`deserializeUser ${user.id}`);
  cb(null, user);
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
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";
import { type Request, type Response } from "express";
import bodyParser = require("body-parser");
import passport = require("passport");
import { Strategy as LocalStrategy } from "passport-local";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.sendFile(join(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.sendFile(join(__dirname, "login.html"));
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
);

app.post("/logout", (req, res) => {
  const sessionId = req.session.id;
  req.session.destroy(() => {
    // disconnect all Socket.IO connections linked to this session ID
    io.to(`session:${sessionId}`).disconnectSockets();
    res.status(204).end();
  });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === "john" && password === "changeit") {
      console.log("authentication OK");
      return done(null, { id: 1, username });
    } else {
      console.log("wrong credentials");
      return done(null, false);
    }
  }),
);

passport.serializeUser((user, cb) => {
  console.log(`serializeUser ${user.id}`);
  cb(null, user);
});

passport.deserializeUser((user: Express.User, cb) => {
  console.log(`deserializeUser ${user.id}`);
  cb(null, user);
});

const io = new Server(httpServer);

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});

```

:::note

You'll need those additional types:

```
npm install @types/express @types/express-session @types/passport @types/passport-local
```

:::

  </TabItem>
</Tabs>

## Sharing the user context

The user context can be shared with the Socket.IO server by calling:

```js
function onlyForHandshake(middleware) {
  return (req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}

io.engine.use(onlyForHandshake(sessionMiddleware));
io.engine.use(onlyForHandshake(passport.session()));
io.engine.use(
  onlyForHandshake((req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.writeHead(401);
      res.end();
    }
  }),
);
```

Here's what happens:

- the [`express-session`](https://www.npmjs.com/package/express-session) middleware retrieves the session context from the cookie
- the [`passport`](https://www.passportjs.org/) middleware extracts the user context from the session
- and finally, the handshake is validated if the user context was found

:::tip

The `onlyForHandshake()` method ensures that the middlewares are only applied to the first HTTP request of the session.

:::

You'll now have access to the `user` object:

```js
io.on("connection", (socket) => {
  const user = socket.request.user;
});
```

## Using the user ID

You can use the user ID to make the link between Express and Socket.IO:

```js
io.on("connection", (socket) => {
  const userId = socket.request.user.id;

  // the user ID is used as a room
  socket.join(`user:${userId}`);
});
```

Which allows you to easily broadcast an event to all the connections of a given user:

```js
io.to(`user:${userId}`).emit("foo", "bar");
```

You can also check whether a user is currently connected:

```js
const sockets = await io.in(`user:${userId}`).fetchSockets();
const isUserConnected = sockets.length > 0;
```

That's it for the compatibility with [Passport.js](https://www.passportjs.org/). Thanks for reading!

The complete example can be found [here](https://github.com/socketio/socket.io/tree/main/examples/passport-example).

:::tip

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/passport-example/cjs?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/passport-example/cjs?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/passport-example/esm?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/passport-example/esm?file=index.js)


  </TabItem>
  <TabItem value="ts" label="TypeScript" attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/passport-example/ts?file=index.ts)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/passport-example/ts?file=index.ts)


  </TabItem>
</Tabs>

:::

