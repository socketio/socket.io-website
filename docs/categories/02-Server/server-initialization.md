---
title: Server Initialization
sidebar_label: Initialization
sidebar_position: 2
slug: /server-initialization/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Once you have [installed](server-installation.md) the Socket.IO server library, you can now init the server. The complete list of options can be found [here](../../server-options.md).

:::tip

For TypeScript users, it is possible to provide type hints for the events. Please check [this](../01-Documentation/typescript.md).

:::

## Initialization

### Standalone

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Server } = require("socket.io");

const io = new Server({ /* options */ });

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Server } from "socket.io";

const io = new Server({ /* options */ });

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { Server } from "socket.io";

const io = new Server({ /* options */ });

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

  </TabItem>
</Tabs>

You can also pass the port as the first argument:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Server } = require("socket.io");

const io = new Server(3000, { /* options */ });

io.on("connection", (socket) => {
  // ...
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Server } from "socket.io";

const io = new Server(3000, { /* options */ });

io.on("connection", (socket) => {
  // ...
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { Server } from "socket.io";

const io = new Server(3000, { /* options */ });

io.on("connection", (socket) => {
  // ...
});
```

  </TabItem>
</Tabs>

This implicitly starts a Node.js [HTTP server](https://nodejs.org/docs/latest/api/http.html#http_class_http_server), which can be accessed through `io.httpServer`.

### With an HTTP server

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
</Tabs>

### With an HTTPS server

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { readFileSync } = require("fs");
const { createServer } = require("https");
const { Server } = require("socket.io");

const httpServer = createServer({
  key: readFileSync("/path/to/my/key.pem"),
  cert: readFileSync("/path/to/my/cert.pem")
});

const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpServer = createServer({
  key: readFileSync("/path/to/my/key.pem"),
  cert: readFileSync("/path/to/my/cert.pem")
});

const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpServer = createServer({
  key: readFileSync("/path/to/my/key.pem"),
  cert: readFileSync("/path/to/my/cert.pem")
});

const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
</Tabs>

See also: [Node.js documentation](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)

With client-certificate authentication:

*Server*

```js
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpServer = createServer({
  key: readFileSync("/path/to/server-key.pem"),
  cert: readFileSync("/path/to/server-cert.pem"),
  requestCert: true,
  ca: [
    readFileSync("/path/to/client-cert.pem")
  ]
});

const io = new Server(httpServer, { /* options */ });

io.engine.on("connection", (rawSocket) => {
  // if you need the certificate details (it is no longer available once the handshake is completed)
  rawSocket.peerCertificate = rawSocket.request.client.getPeerCertificate();
});

io.on("connection", (socket) => {
  console.log(socket.conn.peerCertificate);
  // ...
});

httpServer.listen(3000);
```

*Client*

```js
import { readFileSync } from "fs";
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  key: readFileSync("/path/to/client-key.pem"),
  cert: readFileSync("/path/to/client-cert.pem"),
  ca: [
    readFileSync("/path/to/server-cert.pem")
  ]
});
```

### With an HTTP/2 server

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { readFileSync } = require("fs");
const { createSecureServer } = require("http2");
const { Server } = require("socket.io");

const httpServer = createSecureServer({
  allowHTTP1: true,
  key: readFileSync("/path/to/my/key.pem"),
  cert: readFileSync("/path/to/my/cert.pem")
});

const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { readFileSync } from "fs";
import { createSecureServer } from "http2";
import { Server } from "socket.io";

const httpServer = createSecureServer({
  allowHTTP1: true,
  key: readFileSync("/path/to/my/key.pem"),
  cert: readFileSync("/path/to/my/cert.pem")
});

const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { readFileSync } from "fs";
import { createSecureServer } from "http2";
import { Server } from "socket.io";

const httpServer = createSecureServer({
  allowHTTP1: true,
  key: readFileSync("/path/to/my/key.pem"),
  cert: readFileSync("/path/to/my/cert.pem")
});

const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
</Tabs>

See also: [Node.js documentation](https://nodejs.org/api/http2.html#http2_http2_createsecureserver_options_onrequesthandler)

### With Express

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import * as express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
</Tabs>

:::caution

Using `app.listen(3000)` will not work here, as it creates a new HTTP server.

:::

More information [here](http://expressjs.com/).

### With Koa

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const Koa = require("koa");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = new Koa();
const httpServer = createServer(app.callback());
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import Koa from "koa";
import { createServer } from "http";
import { Server } from "socket.io";

const app = new Koa();
const httpServer = createServer(app.callback());
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import * as Koa from "koa";
import { createServer } from "http";
import { Server } from "socket.io";

const app = new Koa();
const httpServer = createServer(app.callback());
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
</Tabs>

More information [here](https://koajs.com/).

### With Nest

See the documentation [here](https://docs.nestjs.com/websockets/gateways).

:::caution

NestJS v7 and below relies on Socket.IO v2, while NestJS v8 relies on Socket.IO v4. Please use a [compatible client](../03-Client/client-installation.md#version-compatibility).

:::

### With Fastify

You need to register the [`fastify-socket.io`](https://github.com/alemagio/fastify-socket.io) plugin:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const fastify = require("fastify");
const fastifyIO = require("fastify-socket.io");

const server = fastify();
server.register(fastifyIO);

server.get("/", (req, reply) => {
  server.io.emit("hello");
});

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined
  server.io.on("connection", (socket) => {
    // ...
  });
});

server.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import fastify from "fastify";
import fastifyIO from "fastify-socket.io";

const server = fastify();
server.register(fastifyIO);

server.get("/", (req, reply) => {
  server.io.emit("hello");
});

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined
  server.io.on("connection", (socket) => {
    // ...
  });
});

server.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import fastify from "fastify";
import fastifyIO from "fastify-socket.io";

const server = fastify();
server.register(fastifyIO);

server.get("/", (req, reply) => {
  server.io.emit("hello");
});

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined
  server.io.on("connection", (socket) => {
    // ...
  });
});

server.listen(3000);
```

  </TabItem>
</Tabs>

### With µWebSockets.js {#with-uwebsocketsjs}

```js
import { App } from "uWebSockets.js";
import { Server } from "socket.io";

const app = new App();
const io = new Server();

io.attachApp(app);

io.on("connection", (socket) => {
  // ...
});

app.listen(3000, (token) => {
  if (!token) {
    console.warn("port already in use");
  }
});
```

Reference: https://github.com/uNetworking/uWebSockets.js

## Options

The complete list of available options can be found [here](../../server-options.md).
