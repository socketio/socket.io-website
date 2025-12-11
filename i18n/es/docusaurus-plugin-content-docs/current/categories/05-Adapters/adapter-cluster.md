---
title: Adaptador Cluster
sidebar_position: 6
slug: /cluster-adapter/
---

## Cómo funciona

El adaptador Cluster permite usar Socket.IO dentro de un [clúster de Node.js](https://nodejs.org/api/cluster.html).

Cada paquete enviado a múltiples clientes (ej. `io.to("room1").emit()` o `socket.broadcast.emit()`) también se envía a otros workers a través del canal IPC.

El código fuente de este adaptador se puede encontrar aquí: https://github.com/socketio/socket.io/tree/main/packages/socket.io-cluster-adapter

## Características soportadas

| Característica                     | Versión de `socket.io`              | Soporte                                        |
|------------------------------------|-------------------------------------|------------------------------------------------|
| Gestión de sockets                 | `4.0.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Comunicación entre servidores      | `4.1.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Broadcast con acknowledgements     | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: SÍ (desde versión `0.2.0`)  |
| Recuperación del estado de conexión| [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Instalación

```
npm install @socket.io/cluster-adapter
```

## Uso

### Con cluster de Node.js

```js
const cluster = require("cluster");
const http = require("http");
const { Server } = require("socket.io");
const numCPUs = require("os").cpus().length;
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");

if (cluster.isMaster) {
  console.log(`Master ${process.pid} está ejecutándose`);

  const httpServer = http.createServer();

  // configurar sesiones sticky
  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  // configurar conexiones entre los workers
  setupPrimary();

  // necesario para paquetes que contienen buffers (puedes ignorarlo si solo envías objetos de texto plano)
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
    console.log(`Worker ${worker.process.pid} murió`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} iniciado`);

  const httpServer = http.createServer();
  const io = new Server(httpServer);

  // usar el adaptador cluster
  io.adapter(createAdapter());

  // configurar conexión con el proceso primario
  setupWorker(io);

  io.on("connection", (socket) => {
    /* ... */
  });
}
```

### Con PM2

Ver la [documentación asociada](../06-Advanced/usage-with-pm2.md).

### Con `recluster`

`cluster.js`

```js
const cluster = require("cluster");
const http = require("http");
const { setupMaster } = require("@socket.io/sticky");
const { setupPrimary } = require("@socket.io/cluster-adapter");
const recluster = require("recluster");
const path = require("path");

const httpServer = http.createServer();

// configurar sesiones sticky
setupMaster(httpServer, {
  loadBalancingMethod: "least-connection",
});

// configurar conexiones entre los workers
setupPrimary();

// necesario para paquetes que contienen buffers (puedes ignorarlo si solo envías objetos de texto plano)
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

// usar el adaptador cluster
io.adapter(createAdapter());

// configurar conexión con el proceso primario
setupWorker(io);

io.on("connection", (socket) => {
  /* ... */
});
```

## Opciones

| Nombre              | Descripción                                                        | Valor predeterminado |
|---------------------|--------------------------------------------------------------------|----------------------|
| `heartbeatInterval` | El número de ms entre dos heartbeats.                              | `5_000`              |
| `heartbeatTimeout`  | El número de ms sin heartbeat antes de considerar un nodo caído.   | `10_000`             |

## Últimas versiones

| Versión | Fecha de lanzamiento | Notas de lanzamiento                                                                              | Diff                                                                                               |
|---------|----------------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `0.3.0` | Octubre 2025         | [link](https://github.com/socketio/socket.io/releases/tag/%40socket.io%2Fcluster-adapter%400.3.0) | [`0.2.2...0c43124`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.2.2...0c43124) |
| `0.2.2` | Marzo 2022           | [link](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.2.2)                  | [`0.2.1...0.2.2`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.2.1...0.2.2)     |
| `0.2.1` | Octubre 2022         | [link](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.2.1)                  | [`0.2.0...0.2.1`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.2.0...0.2.1)     |
| `0.2.0` | Abril 2022           | [link](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.2.0)                  | [`0.1.0...0.2.0`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.1.0...0.2.0)     |
| `0.1.0` | Junio 2021           | [link](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.1.0)                  |                                                                                                    |

Changelog completo: https://github.com/socketio/socket.io/blob/main/packages/socket.io-cluster-adapter/CHANGELOG.md
