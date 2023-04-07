---
title: Cluster adapter
sidebar_position: 6
slug: /cluster-adapter/
---

## How it works {#how-it-works}

The Cluster adapter allows to use Socket.IO within a [Node.js cluster](https://nodejs.org/api/cluster.html).

Every packet that is sent to multiple clients (e.g. `io.to("room1").emit()` or `socket.broadcast.emit()`) is also sent to other workers via the IPC channel.

The source code of this adapter can be found [here](https://github.com/socketio/socket.io-cluster-adapter).

## Installation {#installation}

```
npm install @socket.io/cluster-adapter
```

## Usage {#usage}

### With Node.js cluster {#with-nodejs-cluster}

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

### With PM2 {#with-pm2}

See the [associated documentation](../06-Advanced/usage-with-pm2.md).

### With `recluster` {#with-recluster}

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

## Options {#options}

| Name | Description | Default value |
| ---- | ----------- | ------------- |
| `requestsTimeout` | the timeout for inter-server requests such as `fetchSockets()` or `serverSideEmit()` with ack | `5000` |
