---
title: Usage with PM2
sidebar_position: 4
slug: /pm2/
---

PM2 is a production process manager for Node.js applications with a built-in load balancer. It allows you to keep applications alive forever, to reload them without downtime and to facilitate common system admin tasks.

You can find its documentation here: https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/

To scale a Socket.IO server with PM2, there are three solutions:

- disable HTTP long-polling on the client-side

```js
const socket = io({
  transports: ["websocket"]
});
```

Though in that case, there will be no fallback to HTTP long-polling if the WebSocket connection cannot be established.

- use a distinct port for each worker, and a load-balancer like nginx in front of them

- use `@socket.io/pm2`

## Installation {#installation}

```
npm install -g @socket.io/pm2
```

If `pm2` is already installed, you will have to remove it first:

```
npm remove -g pm2
```

`@socket.io/pm2` can be used as a drop-in replacement for `pm2`, and supports all the commands of the class `pm2` utility.

The only difference comes from [this commit](https://github.com/socketio/pm2/commit/8c29a7feb6cbde3c8ef9eb072fee284686f1553f).

## Usage {#usage}

`worker.js`

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/cluster-adapter");
const { setupWorker } = require("@socket.io/sticky");

const httpServer = createServer();
const io = new Server(httpServer);

io.adapter(createAdapter());

setupWorker(io);

io.on("connection", (socket) => {
  console.log(`connect ${socket.id}`);
});
```

`ecosystem.config.js`

```js
module.exports = {
  apps : [{
    script    : "worker.js",
    instances : "max",
    exec_mode : "cluster"
  }]
}
```

And then run `pm2 start ecosystem.config.js` (or `pm2 start worker.js -i 0`). That's it! You can now reach the Socket.IO cluster on port 8080.

## How it works {#how-it-works}

When [scaling to multiple nodes](../02-Server/using-multiple-nodes.md), there are two things to do:

- enable sticky sessions, so that the HTTP requests of a Socket.IO session are routed to the same worker
- use a custom adapter, so that the packets are broadcast to all clients, even if they are connected to another worker

In order to achieve this, `@socket.io/pm2` includes two additional packages:

- [`@socket.io/sticky`](https://github.com/socketio/socket.io-sticky)
- [`@socket.io/cluster-adapter`](https://github.com/socketio/socket.io-cluster-adapter)

The only difference with `pm2` comes from [this commit](https://github.com/socketio/pm2/commit/8c29a7feb6cbde3c8ef9eb072fee284686f1553f):

- the God process now creates its own HTTP server and routes the HTTP requests to the right worker
- the God process also relays the packets between the workers, so that `io.emit()` correctly reaches all clients

Please note that if you have several hosts each running a PM2 cluster, you will have to use another adapter, like the [Redis adapter](../05-Adapters/adapter-redis.md).

The source code of the fork can be found [here](https://github.com/socketio/pm2). We will try to closely follow the releases of the `pm2` package.
