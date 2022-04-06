---
title: How to use with `express-session`
---

# How to use with `express-session`

There are two ways to share the session context between [Express](http://expressjs.com/) and [Socket.IO](https://socket.io/docs/v4/), depending on your use case:

### 1st use case: Socket.IO only retrieves the session context

This is useful when the authentication is handled by Express (or [Passport](http://www.passportjs.org/)) for example.

In that case, we can directly use the session middleware:

```js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";

const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
  secret: "changeit",
  resave: false,
  saveUninitialized: false
});

app.use(sessionMiddleware);

app.post("/login", (req, res) => {
  req.session.authenticated = true;
  res.status(204).end();
});

const io = new Server(httpServer);

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

// only allow authenticated users
io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.authenticated) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log(socket.request.session);
});
```

Please check the example with Passport [here](https://github.com/socketio/socket.io/tree/main/examples/passport-example).

### 2nd use case: Socket.IO can also create the session context

This is useful if you want to use `express-session` without an Express application for example.

In that case, we need to customize the headers sent during the handshake:

```js
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";

const httpServer = createServer();

const sessionMiddleware = session({
  secret: "changeit",
  resave: false,
  saveUninitialized: false
});

const io = new Server(httpServer, {
  allowRequest: (req, callback) => {
    // with HTTP long-polling, we have access to the HTTP response here, but this is not
    // the case with WebSocket, so we provide a dummy response object
    const fakeRes = {
      getHeader() {
        return [];
      },
      setHeader(key, values) {
        req.cookieHolder = values[0];
      },
      writeHead() {},
    };
    sessionMiddleware(req, fakeRes, () => {
      if (req.session) {
        // trigger the setHeader() above
        fakeRes.writeHead();
        // manually save the session (normally triggered by res.end())
        req.session.save();
      }
      callback(null, true);
    });
  },
});

io.engine.on("initial_headers", (headers, req) => {
  if (req.cookieHolder) {
    headers["set-cookie"] = req.cookieHolder;
    delete req.cookieHolder;
  }
});

io.on("connection", (socket) => {
  console.log(socket.request.session);
});
```

Please check the example [here](https://github.com/socketio/socket.io/tree/main/examples/express-session-example).

## Modifying the session

Since it is not bound to an HTTP request, the session must be manually reloaded and saved:

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

You can also use a [middleware](https://socket.io/docs/v4/server-api/#socketusefn) which will be triggered for each incoming packet:

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

## Handling logout

You can use the session ID to make the link between Express and Socket.IO:

```js
io.on("connection", (socket) => {
  const sessionId = socket.request.session.id;

  socket.join(sessionId);
});

app.post("/logout", (req, res) => {
  const sessionId = req.session.id;

  req.session.destroy(() => {
    // disconnect all Socket.IO connections linked to this session ID
    io.to(sessionId).disconnectSockets();
    res.status(204).end();
  });
});
```

## Handling session expiration

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

## With TypeScript

To add proper typings to the session details, you will need to extend the `IncomingMessage` object from the Node.js "http" module.

Which gives, in the [first case](#1st-use-case-socketio-only-retrieves-the-session-context):

```ts
import { Request, Response, NextFunction } from "express";
import { Session } from "express-session";

declare module "http" {
    interface IncomingMessage {
        session: Session & {
            authenticated: boolean
        }
    }
}

io.use((socket, next) => {
    sessionMiddleware(socket.request as Request, {} as Response, next as NextFunction);
});
```

And in the [second case](#2nd-use-case-socketio-can-also-create-the-session-context):

```ts
import { Request, Response } from "express";
import { Session } from "express-session";
import { IncomingMessage } from "http";

declare module "http" {
    interface IncomingMessage {
        cookieHolder?: string,
        session: Session & {
            count: number
        }
    }
}

const io = new Server(httpServer, {
    allowRequest: (req, callback) => {
        // with HTTP long-polling, we have access to the HTTP response here, but this is not
        // the case with WebSocket, so we provide a dummy response object
        const fakeRes = {
            getHeader() {
                return [];
            },
            setHeader(key: string, values: string[]) {
                req.cookieHolder = values[0];
            },
            writeHead() {},
        };
        sessionMiddleware(req as Request, fakeRes as unknown as Response, () => {
            if (req.session) {
                // trigger the setHeader() above
                fakeRes.writeHead();
                // manually save the session (normally triggered by res.end())
                req.session.save();
            }
            callback(null, true);
        });
    },
});

io.engine.on("initial_headers", (headers: { [key: string]: string }, req: IncomingMessage) => {
    if (req.cookieHolder) {
        headers["set-cookie"] = req.cookieHolder;
        delete req.cookieHolder;
    }
});
```

Reference: [TypeScript's Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
