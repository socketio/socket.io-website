---
title: Testing
sidebar_position: 11
slug: /testing/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Testing a Socket.IO application usually involves writing **integration tests**, where you start a real Socket.IO server, connect a client to it, and assert that events are properly exchanged between the two sides.

The examples below show how to test a basic Socket.IO setup with common testing libraries. Each example covers:

- sending an event from the server to the client
- sending an event from the client to the server with an acknowledgement
- using `emitWithAck()`
- waiting for an event with a small helper function

Select your preferred test runner:

<Tabs>
  <TabItem value="node" label="Node.js" default>

<!-- start of node -->

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

Installation:

Built-in since Node.js v18, no installation is required.

Test suite:

```js title="test/basic.test.js"
const { test } = require("node:test");
const assert = require("node:assert");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const ioc = require("socket.io-client");

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

test("my awesome project", async (t) => {
  let io, serverSocket, clientSocket;

  await t.test("setup", () => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      httpServer.listen(() => {
        const port = httpServer.address().port;
        clientSocket = ioc(`http://localhost:${port}`);
        clientSocket.on("connect", resolve);
      });
    });
  });

  t.after(() => {
    io.close();
    clientSocket.disconnect();
  });

  await t.test("should work", () => {
    return new Promise((resolve) => {
      clientSocket.on("hello", (arg) => {
        assert.strictEqual(arg, "world");
        resolve();
      });
      serverSocket.emit("hello", "world");
    });
  });

  await t.test("should work with an acknowledgement", () => {
    return new Promise((resolve) => {
      serverSocket.on("hi", (cb) => {
        cb("hola");
      });
      clientSocket.emit("hi", (arg) => {
        assert.strictEqual(arg, "hola");
        resolve();
      });
    });
  });

  await t.test("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    assert.strictEqual(result, "bar");
  });

  await t.test("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

Installation:

Built-in since Node.js v18, no installation is required.

Test suite:

```js title="test/basic.test.js"
import { test } from "node:test";
import assert from "node:assert";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { io as ioc } from "socket.io-client";

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

test("my awesome project", async (t) => {
  let io, serverSocket, clientSocket;

  await t.test("setup", () => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      httpServer.listen(() => {
        const port = httpServer.address().port;
        clientSocket = ioc(`http://localhost:${port}`);
        clientSocket.on("connect", resolve);
      });
    });
  });

  t.after(() => {
    io.close();
    clientSocket.disconnect();
  });

  await t.test("should work", () => {
    return new Promise((resolve) => {
      clientSocket.on("hello", (arg) => {
        assert.strictEqual(arg, "world");
        resolve();
      });
      serverSocket.emit("hello", "world");
    });
  });

  await t.test("should work with an acknowledgement", () => {
    return new Promise((resolve) => {
      serverSocket.on("hi", (cb) => {
        cb("hola");
      });
      clientSocket.emit("hi", (arg) => {
        assert.strictEqual(arg, "hola");
        resolve();
      });
    });
  });

  await t.test("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    assert.strictEqual(result, "bar");
  });

  await t.test("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

Installation:

Built-in since Node.js v18, no installation is required.

Test suite:

```ts title="test/basic.test.ts"
import { test } from "node:test";
import assert from "node:assert";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

test("my awesome project", async (t) => {
  let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;

  await t.test("setup", () => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        clientSocket = ioc(`http://localhost:${port}`);
        clientSocket.on("connect", resolve);
      });
    });
  });

  t.after(() => {
    io.close();
    clientSocket.disconnect();
  });

  await t.test("should work", () => {
    return new Promise((resolve) => {
      clientSocket.on("hello", (arg) => {
        assert.strictEqual(arg, "world");
        resolve();
      });
      serverSocket.emit("hello", "world");
    });
  });

  await t.test("should work with an acknowledgement", () => {
    return new Promise((resolve) => {
      serverSocket.on("hi", (cb) => {
        cb("hola");
      });
      clientSocket.emit("hi", (arg) => {
        assert.strictEqual(arg, "hola");
        resolve();
      });
    });
  });

  await t.test("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    assert.strictEqual(result, "bar");
  });

  await t.test("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
</Tabs>

Reference: https://nodejs.org/api/test.html

<!-- end of node -->

  </TabItem>
  <TabItem value="mocha" label="mocha">

<!-- start of mocha -->

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

Installation:

```
npm install --save-dev mocha chai
```

Test suite:

```js title="test/basic.js"
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const ioc = require("socket.io-client");
const { assert } = require("chai");

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io, serverSocket, clientSocket;

  before((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    io.on("connection", (socket) => {
      serverSocket = socket;
    });
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = ioc(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  after(() => {
    io.close();
    clientSocket.disconnect();
  });

  it("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      assert.equal(arg, "world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  it("should work with an acknowledgement", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg) => {
      assert.equal(arg, "hola");
      done();
    });
  });

  it("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    assert.equal(result, "bar");
  });

  it("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

Installation:

```
npm install --save-dev mocha chai
```

Test suite:

```js title="test/basic.js"
import { createServer } from "node:http";
import { io as ioc } from "socket.io-client";
import { Server } from "socket.io";
import { assert } from "chai";

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io, serverSocket, clientSocket;

  before((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    io.on("connection", (socket) => {
      serverSocket = socket;
    });
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = ioc(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  after(() => {
    io.close();
    clientSocket.disconnect();
  });

  it("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      assert.equal(arg, "world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  it("should work with an acknowledgement", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg) => {
      assert.equal(arg, "hola");
      done();
    });
  });

  it("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    assert.equal(result, "bar");
  });

  it("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

Installation:

```
npm install --save-dev mocha chai @types/mocha @types/chai
```

Test suite:

```ts title="test/basic.ts"
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";
import { assert } from "chai";

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;

  before((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    io.on("connection", (socket) => {
      serverSocket = socket;
    });
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioc(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  after(() => {
    io.close();
    clientSocket.disconnect();
  });

  it("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      assert.equal(arg, "world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  it("should work with an acknowledgement", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg) => {
      assert.equal(arg, "hola");
      done();
    });
  });

  it("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    assert.equal(result, "bar");
  });

  it("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
</Tabs>

Reference: https://mochajs.org/

<!-- end of mocha -->

  </TabItem>
  <TabItem value="jest" label="jest">

<!-- start of jest -->

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

Installation:

```
npm install --save-dev jest
```

Test suite:

```js title="__tests__/basic.test.js"
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const ioc = require("socket.io-client");

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    io.on("connection", (socket) => {
      serverSocket = socket;
    });
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = ioc(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  test("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  test("should work with an acknowledgement", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg) => {
      expect(arg).toBe("hola");
      done();
    });
  });

  test("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    expect(result).toBe("bar");
  });

  test("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

Installation:

```
npm install --save-dev jest
```

Test suite:

```js title="__tests__/basic.test.js"
import { createServer } from "node:http";
import { io as ioc } from "socket.io-client";
import { Server } from "socket.io";

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    io.on("connection", (socket) => {
      serverSocket = socket;
    });
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = ioc(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  test("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  test("should work with an acknowledgement", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg) => {
      expect(arg).toBe("hola");
      done();
    });
  });

  test("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    expect(result).toBe("bar");
  });

  test("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

Installation:

```
npm install --save-dev jest @types/jest
```

Test suite:

```ts title="__tests__/basic.test.ts"
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    io.on("connection", (socket) => {
      serverSocket = socket;
    });
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioc(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  test("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  test("should work with an acknowledgement", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg) => {
      expect(arg).toBe("hola");
      done();
    });
  });

  test("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    expect(result).toBe("bar");
  });

  test("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
</Tabs>

Reference: https://jestjs.io/

<!-- end of jest -->

  </TabItem>
  <TabItem value="tape" label="tape">

<!-- start of tape -->

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

Installation:

```
npm install --save-dev tape
```

Test suite:

```js title="test/basic.js"
const test = require("tape");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const ioc = require("socket.io-client");

let io, serverSocket, clientSocket;

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

test("setup", (t) => {
  const httpServer = createServer();
  io = new Server(httpServer);
  io.on("connection", (socket) => {
    serverSocket = socket;
  });
  httpServer.listen(() => {
    const port = httpServer.address().port;
    clientSocket = ioc(`http://localhost:${port}`);
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

test("it works with an acknowledgement", (t) => {
  t.plan(1);
  serverSocket.on("hi", (cb) => {
    cb("hola");
  });
  clientSocket.emit("hi", (arg) => {
    t.equal(arg, "hola");
  });
});

test("it works with emitWithAck()", async (t) => {
  t.plan(1);
  serverSocket.on("foo", (cb) => {
    cb("bar");
  });
  const result = await clientSocket.emitWithAck("foo");
  t.equal(result, "bar");
});

test("it works with waitFor()", async (t) => {
  t.plan(1);
  clientSocket.emit("baz");

  await waitFor(serverSocket, "baz");
  t.pass();
});

test.onFinish(() => {
  io.close();
  clientSocket.disconnect();
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

Installation:

```
npm install --save-dev tape
```

Test suite:

```js title="test/basic.js"
import { test } from "tape";
import { createServer } from "node:http";
import { io as ioc } from "socket.io-client";
import { Server } from "socket.io";

let io, serverSocket, clientSocket;

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

test("setup", (t) => {
  const httpServer = createServer();
  io = new Server(httpServer);
  io.on("connection", (socket) => {
    serverSocket = socket;
  });
  httpServer.listen(() => {
    const port = httpServer.address().port;
    clientSocket = ioc(`http://localhost:${port}`);
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

test("it works with an acknowledgement", (t) => {
  t.plan(1);
  serverSocket.on("hi", (cb) => {
    cb("hola");
  });
  clientSocket.emit("hi", (arg) => {
    t.equal(arg, "hola");
  });
});

test("it works with emitWithAck()", async (t) => {
  t.plan(1);
  serverSocket.on("foo", (cb) => {
    cb("bar");
  });
  const result = await clientSocket.emitWithAck("foo");
  t.equal(result, "bar");
});

test("it works with waitFor()", async (t) => {
  t.plan(1);
  clientSocket.emit("baz");

  await waitFor(serverSocket, "baz");
  t.pass();
});

test.onFinish(() => {
  io.close();
  clientSocket.disconnect();
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

Installation:

```
npm install --save-dev tape
```

Test suite:

```ts title="test/basic.ts"
import { test } from "tape";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";

let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

test("setup", (t) => {
  const httpServer = createServer();
  io = new Server(httpServer);
  io.on("connection", (socket) => {
    serverSocket = socket;
  });
  httpServer.listen(() => {
    const port = (httpServer.address() as AddressInfo).port;
    clientSocket = ioc(`http://localhost:${port}`);
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

test("it works with an acknowledgement", (t) => {
  t.plan(1);
  serverSocket.on("hi", (cb) => {
    cb("hola");
  });
  clientSocket.emit("hi", (arg) => {
    t.equal(arg, "hola");
  });
});

test("it works with emitWithAck()", async (t) => {
  t.plan(1);
  serverSocket.on("foo", (cb) => {
    cb("bar");
  });
  const result = await clientSocket.emitWithAck("foo");
  t.equal(result, "bar");
});

test("it works with waitFor()", async (t) => {
  t.plan(1);
  clientSocket.emit("baz");

  await waitFor(serverSocket, "baz");
  t.pass();
});

test.onFinish(() => {
  io.close();
  clientSocket.disconnect();
});
```

  </TabItem>
</Tabs>

Reference: https://github.com/ljharb/tape

<!-- end of tape -->

  </TabItem>
  <TabItem value="vitest" label="vitest">

<!-- start of vitest -->

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

Installation:

```
npm install --save-dev vitest
```

Test suite:

```js title="test/basic.js"
const { beforeAll, afterAll, describe, it, expect } = require("vitest");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const ioc = require("socket.io-client");

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io, serverSocket, clientSocket;

  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      httpServer.listen(() => {
        const port = httpServer.address().port;
        clientSocket = ioc(`http://localhost:${port}`);
        clientSocket.on("connect", resolve);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it("should work", () => {
    return new Promise((resolve) => {
      clientSocket.on("hello", (arg) => {
        expect(arg).toEqual("world");
        resolve();
      });
      serverSocket.emit("hello", "world");
    });
  });

  it("should work with an acknowledgement", () => {
    return new Promise((resolve) => {
      serverSocket.on("hi", (cb) => {
        cb("hola");
      });
      clientSocket.emit("hi", (arg) => {
        expect(arg).toEqual("hola");
        resolve();
      });
    });
  });

  it("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    expect(result).toEqual("bar");
  });

  it("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

Installation:

```
npm install --save-dev vitest
```

Test suite:

```js title="test/basic.js"
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createServer } from "node:http";
import { io as ioc } from "socket.io-client";
import { Server } from "socket.io";

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io, serverSocket, clientSocket;

  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      httpServer.listen(() => {
        const port = httpServer.address().port;
        clientSocket = ioc(`http://localhost:${port}`);
        clientSocket.on("connect", resolve);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it("should work", () => {
    return new Promise((resolve) => {
      clientSocket.on("hello", (arg) => {
        expect(arg).toEqual("world");
        resolve();
      });
      serverSocket.emit("hello", "world");
    });
  });

  it("should work with an acknowledgement", () => {
    return new Promise((resolve) => {
      serverSocket.on("hi", (cb) => {
        cb("hola");
      });
      clientSocket.emit("hi", (arg) => {
        expect(arg).toEqual("hola");
        resolve();
      });
    });
  });

  it("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    expect(result).toEqual("bar");
  });

  it("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

Installation:

```
npm install --save-dev vitest
```

Test suite:

```ts title="test/basic.ts"
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;

  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        clientSocket = ioc(`http://localhost:${port}`);
        clientSocket.on("connect", resolve);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it("should work", () => {
    return new Promise((resolve) => {
      clientSocket.on("hello", (arg) => {
        expect(arg).toEqual("world");
        resolve();
      });
      serverSocket.emit("hello", "world");
    });
  });

  it("should work with an acknowledgement", () => {
    return new Promise((resolve) => {
      serverSocket.on("hi", (cb) => {
        cb("hola");
      });
      clientSocket.emit("hi", (arg) => {
        expect(arg).toEqual("hola");
        resolve();
      });
    });
  });

  it("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    expect(result).toEqual("bar");
  });

  it("should work with waitFor()", () => {
    clientSocket.emit("baz");

    return waitFor(serverSocket, "baz");
  });
});
```

  </TabItem>
</Tabs>

Reference: https://vitest.dev/

<!-- end of vitest -->

  </TabItem>
</Tabs>
