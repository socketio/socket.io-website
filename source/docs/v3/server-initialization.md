title: Server Initialization
short_title: Initialization
permalink: /docs/v3/server-initialization/
alias: /docs/server-initialization/
release: v3
type: docs
order: 202
---

Once you have [installed](/docs/v3/server-installation/) the Socket.IO server library, you can now init the server. The complete list of options can be found [here](/docs/server-api/#new-Server-httpServer-options).

## Syntax

### CommonJS

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  // ...
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

### ES modules

Please see [here](https://nodejs.org/api/esm.html#esm_enabling) for enabling ECMAScript modules in your Node.js project.

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // ...
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

### TypeScript

Socket.IO has now first-class support for TypeScript:

```ts
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // ...
});

io.on("connection", (socket: Socket) => {
  // ...
});

httpServer.listen(3000);
```

## Initialization

### Standalone

```js
const options = { /* ... */ };
const io = require("socket.io")(options);

io.on("connection", socket => { /* ... */ });

io.listen(3000);
```

You can also pass the port as the first argument:

```js
const options = { /* ... */ };
const io = require("socket.io")(3000, options);

io.on("connection", socket => { /* ... */ });
```

This implicitly starts a Node.js [HTTP server](https://nodejs.org/docs/latest/api/http.html#http_class_http_server), which can be accessed through `io.httpServer`.

### Attached to an existing HTTP server

```js
const httpServer = require("http").createServer();
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", socket => { /* ... */ });

httpServer.listen(3000);
```

With an [HTTPS](https://nodejs.org/api/https.html) server:

```js
const fs = require("fs");
const httpServer = require("https").createServer({
  key: fs.readFileSync("/tmp/key.pem"),
  cert: fs.readFileSync("/tmp/cert.pem")
});
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", socket => { /* ... */ });

httpServer.listen(3000);
```

With an [HTTP/2](https://nodejs.org/api/http2.html) server:

```js
const fs = require("fs");
const httpServer = require("http2").createSecureServer({
  allowHTTP1: true,
  key: fs.readFileSync("/tmp/key.pem"),
  cert: fs.readFileSync("/tmp/cert.pem")
});
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", socket => { /* ... */ });

httpServer.listen(3000);
```

### With Express

```js
const app = require("express")();
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", socket => { /* ... */ });

httpServer.listen(3000);
// WARNING !!! app.listen(3000); will not work here, as it creates a new HTTP server
```

More information [here](http://expressjs.com/).

### With Koa

```js
const app = require("koa")();
const httpServer = require("http").createServer(app.callback());
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", socket => { /* ... */ });

httpServer.listen(3000);
```

More information [here](https://koajs.com/).

## Notable options

The complete list of options can be found [here](/docs/v3/server-api/#new-Server-httpServer-options). Here are those which you will most likely use:

### `maxHttpBufferSize` option

Default value: `1e6`

This defines how many bytes a message can be, before closing the socket. It defaults to `1e6` (1MB). You may increase or decrease this value depending on your needs.

```js
const io = require("socket.io")({
  maxHttpBufferSize: 1e8
});
```

It matches the [maxPayload](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback) option of the ws package.

### `parser`

Default value: `require("socket.io-parser")`

The parser used to marshall/unmarshall packets. Please see [here](/docs/v3/custom-parser) for more information.
