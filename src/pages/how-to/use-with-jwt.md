---
title: How to use with JSON Web Tokens
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to use with JSON Web Tokens

:::info

JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.

It is often used for authentication, because of its small overhead and its ability to be easily used across different domains.

More information [here](https://jwt.io).

:::

Let's start from a basic application:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const passport = require("passport");
const passportJwt = require("passport-jwt");
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 3000;
const jwtSecret = "Mys3cr3t";

const app = express();
const httpServer = createServer(app);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.get(
  "/self",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user) {
      res.send(req.user);
    } else {
      res.status(401).end();
    }
  },
);

app.post("/login", (req, res) => {
  if (req.body.username === "john" && req.body.password === "changeit") {
    console.log("authentication OK");

    const user = {
      id: 1,
      username: "john",
    };

    const token = jwt.sign(
      {
        data: user,
      },
      jwtSecret,
      {
        issuer: "accounts.examplesoft.com",
        audience: "yoursite.net",
        expiresIn: "1h",
      },
    );

    res.json({ token });
  } else {
    console.log("wrong credentials");
    res.status(401).end();
  }
});

const jwtDecodeOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
  issuer: "accounts.examplesoft.com",
  audience: "yoursite.net",
};

passport.use(
  new JwtStrategy(jwtDecodeOptions, (payload, done) => {
    return done(null, payload.data);
  }),
);

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
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const port = process.env.PORT || 3000;
const jwtSecret = "Mys3cr3t";

const app = express();
const httpServer = createServer(app);

app.use(bodyParser.json());

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.get(
  "/self",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user) {
      res.send(req.user);
    } else {
      res.status(401).end();
    }
  },
);

app.post("/login", (req, res) => {
  if (req.body.username === "john" && req.body.password === "changeit") {
    console.log("authentication OK");

    const user = {
      id: 1,
      username: "john",
    };

    const token = jwt.sign(
      {
        data: user,
      },
      jwtSecret,
      {
        issuer: "accounts.examplesoft.com",
        audience: "yoursite.net",
        expiresIn: "1h",
      },
    );

    res.json({ token });
  } else {
    console.log("wrong credentials");
    res.status(401).end();
  }
});

const jwtDecodeOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
  issuer: "accounts.examplesoft.com",
  audience: "yoursite.net",
};

passport.use(
  new JwtStrategy(jwtDecodeOptions, (payload, done) => {
    return done(null, payload.data);
  }),
);

const io = new Server(httpServer);

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import express from "express";
import { type Request, type Response } from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
  }
}

const port = process.env.PORT || 3000;
const jwtSecret = "Mys3cr3t";

const app = express();
const httpServer = createServer(app);

app.use(bodyParser.json());

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.get(
  "/self",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user) {
      res.send(req.user);
    } else {
      res.status(401).end();
    }
  },
);

app.post("/login", (req, res) => {
  if (req.body.username === "john" && req.body.password === "changeit") {
    console.log("authentication OK");

    const user = {
      id: 1,
      username: "john",
    };

    const token = jwt.sign(
      {
        data: user,
      },
      jwtSecret,
      {
        issuer: "accounts.examplesoft.com",
        audience: "yoursite.net",
        expiresIn: "1h",
      },
    );

    res.json({ token });
  } else {
    console.log("wrong credentials");
    res.status(401).end();
  }
});

const jwtDecodeOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
  issuer: "accounts.examplesoft.com",
  audience: "yoursite.net",
};

passport.use(
  new JwtStrategy(jwtDecodeOptions, (payload, done) => {
    return done(null, payload.data);
  }),
);

const io = new Server(httpServer);

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
```

:::note

You'll need those additional types:

```
npm install @types/express @types/jsonwebtoken @types/passport @types/passport-jwt
```

:::

  </TabItem>
</Tabs>

:::note

In this example, we manually create the token in the `/login` handler, but it might come from somewhere else in your own application.

:::

On the client side, the token is included in the `Authorization` header:

```js
const socket = io({
  extraHeaders: {
    authorization: `bearer ${myToken}`
  }
});
```

:::warning

This only works if HTTP long-polling is enabled and used first, as the browsers do not provide a way to provide additional headers for WebSocket connections:

```js
// THIS WON'T WORK
const socket = io({
  transports: ["websocket"],
  extraHeaders: {
    authorization: `bearer ${myToken}`
  }
});
```

:::

## Sharing the user context

The user context can be shared with the Socket.IO server by calling:

```js
io.engine.use((req, res, next) => {
  const isHandshake = req._query.sid === undefined;
  if (isHandshake) {
    passport.authenticate("jwt", { session: false })(req, res, next);
  } else {
    next();
  }
});
```

:::tip

The `isHandshake` check ensures that the middleware is only applied to the first HTTP request of the session.

:::

You'll now have access to the `user` object:

```js
io.on("connection", (socket) => {
  const user = socket.request.user;
});
```

## Manual parsing

In the example above, we use the [`passport-jwt`](https://www.npmjs.com/package/passport-jwt) package, but you can totally verify the bearer token manually with the [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken) package:

```js
io.engine.use((req, res, next) => {
  const isHandshake = req._query.sid === undefined;
  if (!isHandshake) {
    return next();
  }

  const header = req.headers["authorization"];

  if (!header) {
    return next(new Error("no token"));
  }

  if (!header.startsWith("bearer ")) {
    return next(new Error("invalid token"));
  }

  const token = header.substring(7);

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return next(new Error("invalid token"));
    }
    req.user = decoded.data;
    next();
  });
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

That's it for the compatibility with JSON Web Tokens. Thanks for reading!

The complete example can be found [here](https://github.com/socketio/socket.io/tree/main/examples/passport-jwt-example).

:::tip

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/passport-jwt-example/cjs?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/passport-jwt-example/cjs?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/passport-jwt-example/esm?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/passport-jwt-example/esm?file=index.js)


  </TabItem>
  <TabItem value="ts" label="TypeScript" attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/passport-jwt-example/ts?file=index.ts)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/passport-jwt-example/ts?file=index.ts)


  </TabItem>
</Tabs>

:::

