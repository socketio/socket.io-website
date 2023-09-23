---
title: Testing
sidebar_position: 6
slug: /testing/
---

You will find below some code examples with common testing libraries:

- [mocha](#example-with-mocha)
- [jest](#example-with-jest)
- [tape](#example-with-tape)

## Example with `mocha`

Installation: `npm i -D mocha chai`

```js
// with { "type": "module" } in your package.json
import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { Server } from "socket.io";
import { assert } from "chai";

// with { "type": "commonjs" } in your package.json
// const { createServer } = require("http");
// const { Server } = require("socket.io");
// const Client = require("socket.io-client");
// const assert = require("chai").assert;

describe("my awesome project", () => {
  let io, serverSocket, clientSocket;

  before((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  after(() => {
    io.close();
    clientSocket.close();
  });

  it("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      assert.equal(arg, "world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  it("should work (with ack)", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg) => {
      assert.equal(arg, "hola");
      done();
    });
  });
});
```

## Example with `jest`

Installation: `npm i -D jest`

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("my awesome project", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  test("should work (with ack)", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg) => {
      expect(arg).toBe("hola");
      done();
    });
  });
});
```

## Example with `tape`

Installation: `npm i -D tape`

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const test = require("tape");

let io, serverSocket, clientSocket;

test("setup", (t) => {
  const httpServer = createServer();
  io = new Server(httpServer);
  httpServer.listen(() => {
    const port = httpServer.address().port;
    clientSocket = new Client(`http://localhost:${port}`);
    io.on("connection", (socket) => {
      serverSocket = socket;
    });
    clientSocket.on("connect", t.end);
  });
});

test("it works", (t) => {
  t.plan(1);
  clientSocket.on("hello", (arg) => {
    t.equal(arg, "world");
  });
  serverSocket.emit("hello", "world");
});

test("it works (with ack)", (t) => {
  t.plan(1);
  serverSocket.on("hi", (cb) => {
    cb("hola");
  });
  clientSocket.emit("hi", (arg) => {
    t.equal(arg, "hola");
  });
});

test.onFinish(() => {
  io.close();
  clientSocket.close();
});
```

## Example with `vitest` with TypeScript

Installation: `npm i -D vitest`

```ts
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { Server, Socket } from "socket.io";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import { createServer } from "http";

function waitFor(emitter: ClientSocket, event: string) {
  return new Promise<number>((resolve) => {
    emitter.once(event, resolve);
  });
}

const PORT = 5555;

async function setupTestServer() {
  const httpServer = createServer();

  const io = new Server(httpServer);
  httpServer.listen(PORT);

  const clientSocket = ioc(`ws://localhost:${PORT}`, {
    transports: ["websocket"],
  });

  let serverSocket: Socket | undefined = undefined;
  io.on("connection", (connectedSocket) => {
    serverSocket = connectedSocket;
    serverSocket.on("multiply-by-two", (number) => {
      serverSocket?.emit("result-by-two", number * 2);
    });

    serverSocket.on("multiply-by-three", (number) => {
      serverSocket?.emit("result-by-three", number * 3);
    });
  });

  await waitFor(clientSocket, "connect");

  return { io, clientSocket, serverSocket };
}

describe("websocket integration test", () => {
  let io: Server;

  let serverSocket: Socket | undefined;
  let clientSocket: ClientSocket;

  beforeAll(async () => {
    const response = await setupTestServer();
    io = response.io;
    clientSocket = response.clientSocket;
    serverSocket = response.serverSocket;
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  it("should multiply numbers", async () => {
    clientSocket.emit("multiply-by-two", 2);
    clientSocket.emit("multiply-by-three", 3);

    const promises = [
      waitFor(clientSocket, "result-by-two"),
      waitFor(clientSocket, "result-by-three"),
    ];

    const [promise1, promise2] = await Promise.all(promises);

    expect(promise1).toBe(4);
    expect(promise2).toBe(9);
  });
});

```