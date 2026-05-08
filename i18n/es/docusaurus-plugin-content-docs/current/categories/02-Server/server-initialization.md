---
title: Inicialización del servidor
sidebar_label: Inicialización
sidebar_position: 2
slug: /server-initialization/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Una vez que hayas [instalado](server-installation.md) la biblioteca del servidor Socket.IO, ahora puedes inicializar el servidor. La lista completa de opciones se puede encontrar [aquí](../../server-options.md).

:::tip

Para usuarios de TypeScript, es posible proporcionar sugerencias de tipo para los eventos. Por favor revisa [esto](../01-Documentation/typescript.md).

:::

## Inicialización

### Independiente

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Server } = require("socket.io");

const io = new Server({ /* opciones */ });

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Server } from "socket.io";

const io = new Server({ /* opciones */ });

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { Server } from "socket.io";

const io = new Server({ /* opciones */ });

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

  </TabItem>
</Tabs>

También puedes pasar el puerto como primer argumento:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Server } = require("socket.io");

const io = new Server(3000, { /* opciones */ });

io.on("connection", (socket) => {
  // ...
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Server } from "socket.io";

const io = new Server(3000, { /* opciones */ });

io.on("connection", (socket) => {
  // ...
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { Server } from "socket.io";

const io = new Server(3000, { /* opciones */ });

io.on("connection", (socket) => {
  // ...
});
```

  </TabItem>
</Tabs>

Esto inicia implícitamente un [servidor HTTP](https://nodejs.org/docs/latest/api/http.html#http_class_http_server) de Node.js, al cual se puede acceder a través de `io.httpServer`.

### Con un servidor HTTP

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, { /* opciones */ });

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
const io = new Server(httpServer, { /* opciones */ });

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
const io = new Server(httpServer, { /* opciones */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
</Tabs>

### Con un servidor HTTPS

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

const io = new Server(httpsServer, { /* opciones */ });

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

const io = new Server(httpsServer, { /* opciones */ });

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

const io = new Server(httpsServer, { /* opciones */ });

io.on("connection", (socket) => {
  // ...
});

httpsServer.listen(3000);
```

  </TabItem>
</Tabs>

Ver también: [documentación de Node.js](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)

Con autenticación de certificado de cliente:

*Servidor*

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

const io = new Server(httpsServer, { /* opciones */ });

io.engine.on("connection", (rawSocket) => {
  // si necesitas los detalles del certificado (ya no está disponible una vez completado el handshake)
  rawSocket.peerCertificate = rawSocket.request.client.getPeerCertificate();
});

io.on("connection", (socket) => {
  console.log(socket.conn.peerCertificate);
  // ...
});

httpsServer.listen(3000);
```

*Cliente*

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

### Con un servidor HTTP/2

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

const io = new Server(httpServer, { /* opciones */ });

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

const io = new Server(httpServer, { /* opciones */ });

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

const io = new Server(httpServer, { /* opciones */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
</Tabs>

Ver también: [documentación de Node.js](https://nodejs.org/api/http2.html#http2_http2_createsecureserver_options_onrequesthandler)

### Con Express

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* opciones */ });

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
const io = new Server(httpServer, { /* opciones */ });

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
const io = new Server(httpServer, { /* opciones */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
</Tabs>

:::caution

Usar `app.listen(3000)` no funcionará aquí, ya que crea un nuevo servidor HTTP.

:::

Más información [aquí](http://expressjs.com/).

### Con Koa

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const Koa = require("koa");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = new Koa();
const httpServer = createServer(app.callback());
const io = new Server(httpServer, { /* opciones */ });

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
const io = new Server(httpServer, { /* opciones */ });

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
const io = new Server(httpServer, { /* opciones */ });

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

  </TabItem>
</Tabs>

Más información [aquí](https://koajs.com/).

### Con Nest

Ver la documentación [aquí](https://docs.nestjs.com/websockets/gateways).

:::caution

NestJS v7 y anteriores dependen de Socket.IO v2, mientras que NestJS v8 depende de Socket.IO v4. Por favor usa un [cliente compatible](../03-Client/client-installation.md#version-compatibility).

:::

### Con Fastify

Necesitas registrar el plugin [`fastify-socket.io`](https://github.com/alemagio/fastify-socket.io):

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
  // necesitamos esperar a que el servidor esté listo, de lo contrario `server.io` es undefined
  server.io.on("connection", (socket) => {
    // ...
  });
});

server.listen({ port: 3000 });
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
  // necesitamos esperar a que el servidor esté listo, de lo contrario `server.io` es undefined
  server.io.on("connection", (socket) => {
    // ...
  });
});

server.listen({ port: 3000 });
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
  // necesitamos esperar a que el servidor esté listo, de lo contrario `server.io` es undefined
  server.io.on("connection", (socket) => {
    // ...
  });
});

server.listen({ port: 3000 });
```

  </TabItem>
</Tabs>

### Con µWebSockets.js {#with-uwebsocketsjs}

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
    console.warn("puerto ya en uso");
  }
});
```

Referencia: https://github.com/uNetworking/uWebSockets.js

### Con Hono (Node.js)

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
    /* opciones */
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
    /* opciones */
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
    /* opciones */
});

io.on("connection", (socket) => {
    // ...
});

```

  </TabItem>
</Tabs>

Referencia: https://hono.dev/docs/

### Con Hono & Bun

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
  idleTimeout: 30, // debe ser mayor que la opción "pingInterval" del motor, que por defecto es 25 segundos

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

Referencia: https://hono.dev/docs/

## Opciones

La lista completa de opciones disponibles se puede encontrar [aquí](../../server-options.md).
