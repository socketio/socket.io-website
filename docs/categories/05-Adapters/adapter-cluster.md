---
title: Cluster adapter
sidebar_position: 6
slug: /cluster-adapter/
---

## How it works

The Cluster adapter allows using Socket.IO within a [Node.js cluster](https://nodejs.org/api/cluster.html).

Every packet sent to multiple clients (e.g. `io.to("room1").emit()` or `socket.broadcast.emit()`) is also sent to other workers via the IPC channel.

The source code of this adapter can be found here: https://github.com/socketio/socket.io/tree/main/packages/socket.io-cluster-adapter

## Supported features

| Feature                         | `socket.io` version                 | Support                                        |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket management               | `4.0.0`                             | :white_check_mark: YES (since version `0.1.0`) |
| Inter-server communication      | `4.1.0`                             | :white_check_mark: YES (since version `0.1.0`) |
| Broadcast with acknowledgements | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: YES (since version `0.2.0`) |
| Connection state recovery       | [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Installation

```
npm install @socket.io/cluster-adapter
```

## Usage

### With Node.js cluster

```js
const cluster = require("cluster");
const http = require("http");
const { Server } = require("socket.io");
const numCPUs = require("os").cpus().length;
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  const httpServer = http.createServer();

  // setup sticky sessions
  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  // setup connections between the workers
  setupPrimary();

  // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
  // Node.js < 16.0.0
  cluster.setupMaster({
    serialization: "advanced",
  });
  // Node.js > 16.0.0
  // cluster.setupPrimary({
  //   serialization: "advanced",
  // });

  httpServer.listen(3000);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const httpServer = http.createServer();
  const io = new Server(httpServer);

  // use the cluster adapter
  io.adapter(createAdapter());

  // setup connection with the primary process
  setupWorker(io);

  io.on("connection", (socket) => {
    /* ... */
  });
}
```

### With PM2

See the [associated documentation](../06-Advanced/usage-with-pm2.md).

### With `recluster`

`cluster.js`

```js
const cluster = require("cluster");
const http = require("http");
const { setupMaster } = require("@socket.io/sticky");
const { setupPrimary } = require("@socket.io/cluster-adapter");
const recluster = require("recluster");
const path = require("path");

const httpServer = http.createServer();

// setup sticky sessions
setupMaster(httpServer, {
  loadBalancingMethod: "least-connection",
});

// setup connections between the workers
setupPrimary();

// needed for packets containing buffers (you can ignore it if you only send plaintext objects)
// Node.js < 16.0.0
cluster.setupMaster({
  serialization: "advanced",
});
// Node.js > 16.0.0
// cluster.setupPrimary({
//   serialization: "advanced",
// });

httpServer.listen(3000);

const balancer = recluster(path.join(__dirname, "worker.js"));

balancer.run();
```

`worker.js`

```js
const http = require("http");
const { Server } = require("socket.io");
const { setupWorker } = require("@socket.io/sticky");
const { createAdapter } = require("@socket.io/cluster-adapter");

const httpServer = http.createServer();
const io = new Server(httpServer);

// use the cluster adapter
io.adapter(createAdapter());

// setup connection with the primary process
setupWorker(io);

io.on("connection", (socket) => {
  /* ... */
});
```

## Options

| Name                | Description                                                        | Default value |
|---------------------|--------------------------------------------------------------------|---------------|
| `heartbeatInterval` | The number of ms between two heartbeats.                           | `5_000`       |
| `heartbeatTimeout`  | The number of ms without heartbeat before we consider a node down. | `10_000`      |

## Latest releases

| Version | Release date | Release notes                                                                                     | Diff                                                                                               |
|---------|--------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `0.3.0` | October 2025 | [link](https://github.com/socketio/socket.io/releases/tag/%40socket.io%2Fcluster-adapter%400.3.0) | [`0.2.2...0c43124`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.2.2...0c43124) |
| `0.2.2` | March 2022   | [link](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.2.2)                  | [`0.2.1...0.2.2`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.2.1...0.2.2)     |
| `0.2.1` | October 2022 | [link](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.2.1)                  | [`0.2.0...0.2.1`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.2.0...0.2.1)     |
| `0.2.0` | April 2022   | [link](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.2.0)                  | [`0.1.0...0.2.0`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.1.0...0.2.0)     |
| `0.1.0` | June 2021    | [link](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.1.0)                  |                                                                                                    |

Complete changelog: https://github.com/socketio/socket.io/blob/main/packages/socket.io-cluster-adapter/CHANGELOG.md
