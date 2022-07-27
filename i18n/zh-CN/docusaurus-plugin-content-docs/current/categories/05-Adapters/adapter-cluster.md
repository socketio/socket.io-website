---
title: Cluster 适配器
sidebar_position: 5
slug: /cluster-adapter/
---

## 这个怎么运作 {#how-it-works}

集群适配器允许在[Node.js cluster](https://nodejs.org/api/cluster.html)中使用 Socket.IO 。

每个发送给多个客户的数据包 (例如 `io.to("room1").emit()` 或 `socket.broadcast.emit()`) 也通过IPC渠道发送给其他客户端。

这个适配器的源代码可以在[这里](https://github.com/socketio/socket.io-cluster-adapter)找到。

## 安装 {#installation}

```
npm install @socket.io/cluster-adapter
```

## 用法 {#usage}

### 使用 Node.js cluster {#with-nodejs-cluster}

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

### 使用 PM2 {#with-pm2}

请参阅[相关文档](../06-Advanced/usage-with-pm2.md).

### 使用 `recluster` {#with-recluster}

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

## 配置 {#options}

| 配置项 | 描述 | 默认值 |
| ---- | ----------- | ------------- |
| `requestsTimeout` | 服务器间请求的超时时间，例如`fetchSockets()` 或 `serverSideEmit()` | `5000` |
