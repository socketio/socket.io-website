---
title: 服务器初始化
sidebar_label: 初始化
sidebar_position: 2
slug: /server-initialization/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[安装](server-installation.md)Socket.IO 服务器库后，您现在可以初始化服务器。可以在[此处](../../server-options.md)找到完整的选项列表。

:::tip

对于 TypeScript 用户，可以为事件提供类型提示。请检查[这个](../01-Documentation/typescript.md).

:::

## 初始化 {#initialization}

### 只使用Socket {#standalone}

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

您还可以将端口作为第一个参数传递：

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

这隐式启动了一个 Node.js[HTTP 服务器](https://nodejs.org/docs/latest/api/http.html#http_class_http_server)，可以通过 `io.httpServer`。

### 使用HTTP服务器 {#with-an-http-server}

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

### 使用HTTPS服务器 {#with-an-https-server}

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

另请参阅：[Node.js 文档](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)

使用客户端证书身份验证：

*服务器*

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

*客户端*

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

### 使用HTTP/2服务器 {#with-an-http2-server}

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

另请参阅： [Node.js 文档](https://nodejs.org/api/http2.html#http2_http2_createsecureserver_options_onrequesthandler)

### 使用 Express {#with-express}

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

:::caution 警告

在这里使用`app.listen(3000)`将不起作用，因为它会创建一个新的 HTTP 服务器。

:::

更多信息[在这里](http://expressjs.com/).

### 使用 Koa {#with-koa}

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

更多信息[在这里](https://koajs.com/).

### 使用 Nest {#with-nest}

请参阅[此处](https://docs.nestjs.com/websockets/gateways)的文档。

:::caution 警告

NestJS v7 及以下版本依赖于 Socket.IO v2，而 NestJS v8 依赖于 Socket.IO v4。请使用[兼容的客户端](../03-Client/client-installation.md#version-compatibility)。

:::

### 使用 Fastify {#with-fastify}

您需要注册[`fastify-socket.io`](https://github.com/alemagio/fastify-socket.io)插件：

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

### 使用 µWebSockets.js {#with-µwebsocketsjs}

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

参考： https://github.com/uNetworking/uWebSockets.js

## 配置 {#options}

可在[此处](../../server-options.md)找到可用配置的完整列表。
