---
title: 서버 초기화
sidebar_label: 초기화
sidebar_position: 2
slug: /server-initialization/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Socket.IO 서버 라이브러리를 [설치](server-installation.md)했다면 이제 서버를 초기화할 수 있습니다. 전체 옵션 목록은 [여기](../../server-options.md)에서 확인하세요.

:::tip

TypeScript 사용자는 이벤트에 타입 힌트를 지정할 수 있습니다. 자세한 내용은 [TypeScript 문서](../01-Documentation/typescript.md)를 참고하세요.

:::

## 초기화 {#initialization}

### 독립 실행형 {#standalone}

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

포트를 첫 번째 인자로 전달할 수도 있습니다.

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

이렇게 하면 Node.js [HTTP 서버](https://nodejs.org/docs/latest/api/http.html#http_class_http_server)가 자동으로 시작되며, 이 서버에는 `io.httpServer`로 접근할 수 있습니다.

### HTTP 서버와 함께 사용하기 {#with-an-http-server}

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

### HTTPS 서버와 함께 사용하기 {#with-an-https-server}

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { readFileSync } = require("fs");
const { createServer } = require("https");
const { Server } = require("socket.io");

const httpsServer = createServer({
  key: readFileSync("/path/to/my/key.pem"),
  cert: readFileSync("/path/to/my/cert.pem")
});

const io = new Server(httpsServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpsServer.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpsServer = createServer({
  key: readFileSync("/path/to/my/key.pem"),
  cert: readFileSync("/path/to/my/cert.pem")
});

const io = new Server(httpsServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpsServer.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpsServer = createServer({
  key: readFileSync("/path/to/my/key.pem"),
  cert: readFileSync("/path/to/my/cert.pem")
});

const io = new Server(httpsServer, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

httpsServer.listen(3000);
```

  </TabItem>
</Tabs>

함께 보기: [Node.js 문서](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)

클라이언트 인증서로 인증하는 경우:

*서버*

```js
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpsServer = createServer({
  key: readFileSync("/path/to/server-key.pem"),
  cert: readFileSync("/path/to/server-cert.pem"),
  requestCert: true,
  ca: [
    readFileSync("/path/to/client-cert.pem")
  ]
});

const io = new Server(httpsServer, { /* options */ });

io.engine.on("connection", (rawSocket) => {
  // 인증서 정보가 필요한 경우(핸드셰이크가 끝나면 더 이상 가져올 수 없습니다)
  rawSocket.peerCertificate = rawSocket.request.client.getPeerCertificate();
});

io.on("connection", (socket) => {
  console.log(socket.conn.peerCertificate);
  // ...
});

httpsServer.listen(3000);
```

*클라이언트*

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

### HTTP/2 서버와 함께 사용하기 {#with-an-http2-server}

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

함께 보기: [Node.js 문서](https://nodejs.org/api/http2.html#http2_http2_createsecureserver_options_onrequesthandler)

### Express와 함께 사용하기 {#with-express}

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

`app.listen(3000)`을 쓰면 새 HTTP 서버가 만들어지므로 이 구성에서는 동작하지 않습니다.

:::

자세한 내용은 [Express 문서](http://expressjs.com/)를 참고하세요.

### Koa와 함께 사용하기 {#with-koa}

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

자세한 내용은 [Koa 문서](https://koajs.com/)를 참고하세요.

### Nest와 함께 사용하기 {#with-nest}

[NestJS 문서](https://docs.nestjs.com/websockets/gateways)를 참고하세요.

:::caution

NestJS v7 이하는 Socket.IO v2를, NestJS v8은 Socket.IO v4를 사용합니다. 반드시 [호환되는 클라이언트](../03-Client/client-installation.md#version-compatibility)를 사용하세요.

:::

### Fastify와 함께 사용하기 {#with-fastify}

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const Fastify = require("fastify");
const { Server } = require("socket.io");

const fastify = Fastify();
const io = new Server(fastify.server, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

fastify.addHook("preClose", (done) => {
  // 이 서버의 활성 연결을 모두 닫습니다
  io.local.disconnectSockets(true);
  done();
});

fastify.listen({ port: 3000 });
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import Fastify from "fastify";
import { Server } from "socket.io";

const fastify = Fastify();
const io = new Server(fastify.server, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

fastify.addHook("preClose", (done) => {
  // 이 서버의 활성 연결을 모두 닫습니다
  io.local.disconnectSockets(true);
  done();
});

fastify.listen({ port: 3000 });
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import Fastify from "fastify";
import { Server } from "socket.io";

const fastify = Fastify();
const io = new Server(fastify.server, { /* options */ });

io.on("connection", (socket) => {
  // ...
});

fastify.addHook("preClose", (done) => {
  // 이 서버의 활성 연결을 모두 닫습니다
  io.local.disconnectSockets(true);
  done();
});

fastify.listen({ port: 3000 });
```

  </TabItem>
</Tabs>

자세한 내용은 [Fastify 문서](https://fastify.dev/)를 참고하세요.

### µWebSockets.js와 함께 사용하기 {#with-uwebsocketsjs}

```js
import { App } from "uWebSockets.js";
import { Server } from "socket.io";

const app = App();
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

참고: https://github.com/uNetworking/uWebSockets.js

### Hono(Node.js)와 함께 사용하기 {#with-hono-nodejs}

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Hono } = require("hono");
const { serve } = require("@hono/node-server");
const { Server } = require("socket.io");

const app = new Hono();

const httpServer = serve({
    fetch: app.fetch,
    port: 3000,
});

const io = new Server(httpServer, {
    /* options */
});

io.on("connection", (socket) => {
    // ...
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";

const app = new Hono();

const httpServer = serve({
    fetch: app.fetch,
    port: 3000,
});

const io = new Server(httpServer, {
    /* options */
});

io.on("connection", (socket) => {
    // ...
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";

const app = new Hono();

const httpServer = serve({
    fetch: app.fetch,
    port: 3000,
});

const io = new Server(httpServer as HTTPServer, {
    /* options */
});

io.on("connection", (socket) => {
    // ...
});

```

  </TabItem>
</Tabs>

참고: https://hono.dev/docs/

### Hono, Bun과 함께 사용하기 {#with-hono--bun}

```js
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";
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
  idleTimeout: 30, // 엔진의 "pingInterval" 옵션(기본값 25초)보다 커야 합니다

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

참고: https://hono.dev/docs/

## 옵션 {#options}

사용할 수 있는 전체 옵션 목록은 [여기](../../server-options.md)에서 확인하세요.
