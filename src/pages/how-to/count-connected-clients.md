---
title: How to count the number of connected clients
---

# How to count the number of connected clients

## Standalone

The following snippets apply when using a single Socket.IO server:

### Globally

```js
function totalCount() {
  return io.engine.clientsCount;
}

const count = totalCount();
```

This value is the number of low-level connections on the server.

### In the main namespace

```js
function totalCount() {
  return io.of("/").sockets.size;
}

const count = totalCount();
```

If you are using a single namespace without any middleware, this value will be equal to `io.engine.clientsCount`.

If you are using multiple namespaces, for example when:

- client A is connected to the main namespace (`/`)
- client B is connected to the `/orders` namespace
- client C is connected to both the main and the `/orders` namespaces (multiplexed over a single connection)

Then in that case `io.engine.clientsCount` will be 3, while `totalCount()` is only 2.

### In a namespace

```js
function countInNamespace(namespace) {
  return io.of(namespace).sockets.size;
}

const count = countInNamespace("/chat");
```

### In a room

```js
function countInRoom(room) {
  return io.of("/").adapter.rooms.get(room).size;
}

const count = countInRoom("news");
```

## Cluster

When scaling to multiple Socket.IO servers, computing the number of connected clients is a bit more complex.

Let's review several solutions and their pros and cons:

### Solution 1: `fetchSockets()`

The `fetchSockets()` method sends a request to every node in the cluster, which respond with their local socket instances (the ones that are currently connected to the node).

- in the main namespace

```js
async function totalCount() {
  const sockets = await io.fetchSockets();
  return sockets.length;
}

const count = await totalCount();
```

- in a room

```js
async function totalCount(room) {
  const sockets = await io.in(room).fetchSockets();
  return sockets.length;
}

const count = await totalCount("news");
```

However, this solution is not recommended, as it includes a lot of details about the socket instances (id, rooms, handshake data) and thus will not scale well.

Reference: [`fetchSockets()`](/docs/v4/server-api/#serverfetchsockets)

### Solution 2: `serverSideEmit()`

Similarly, `serverSideEmit()` method sends an event to every node in the cluster, and waits for their responses.

- in the main namespace

```js
function localCount() {
  return io.of("/").sockets.size;
}

io.on("totalCount", (cb) => {
  cb(localCount());
});

async function totalCount() {
  const remoteCounts = await io.serverSideEmitWithAck("totalCount");

  return remoteCounts.reduce((a, b) => a + b, localCount());
}

const count = await totalCount();
```

- in a room

```js
function localCount(room) {
  return io.of("/").adapter.rooms.get(room).size;
}

io.on("totalCount", (room, cb) => {
  cb(localCount(room));
});

async function totalCount(room) {
  const remoteCounts = await io.serverSideEmitWithAck("totalCount", room);
  
  return remoteCounts.reduce((a, b) => a + b, localCount(room));
}

const count = await totalCount("news");
```

This method is a bit better, as each server only returns the number of connected clients. However, it may not be suitable if called frequently, as it will generate a lot of chatter between the servers.

Reference: [`serverSideEmitWithAck()`](/docs/v4/server-api/#serverserversideemitwithackeventname-args)

### Solution 3: external store

The most efficient solution for this use case is to use an external store such as Redis.

Here's a naive implementation using the [`redis` package](https://www.npmjs.com/package/redis):

```js
io.on("connection", async (socket) => {
  socket.on("disconnect", async () => {
    await redisClient.decr("total-clients");
  });
  
  // remember to always run async methods after registering event handlers!
  await redisClient.incr("total-clients");
});

async function totalCount() {
  const val = await redisClient.get("total-clients");
  return val || 0;
}

const count = await totalCount();
```

The only problem with the solution above is that, if one server abruptly crashes, then the counter will not be updated properly and will then report a number that is higher than the reality.

To prevent this, one common solution is to have a counter per Socket.IO server, and a cleanup process which periodically checks the state of each server:

In Redis:

| Key                      | Type              | Content                |
|--------------------------|-------------------|------------------------|
| `processes`              | Set               | `[process1, process2]` |
| `process1:is-up`         | String (+ expiry) | `1`                    |
| `process2:is-up`         | String (+ expiry) | `1`                    |
| `total-clients`          | String            | `5`                    |
| `process1:total-clients` | String            | `3`                    |
| `process2:total-clients` | String            | `2`                    |

On each node:

```js
// on startup
const processId = randomUUID();
await redisClient.multi()
  .sAdd("processes", processId)
  .set(`${processId}:is-up`, "1", { EX: 10 })
  .exec();

setInterval(async () => {
  await redisClient.expire(`${processId}:is-up`, 10);
}, 5000);

process.on("SIGINT", async () => {
  await io.close(); // cleanly close the server and run the "disconnect" event handlers
  process.exit(0);
});

io.on("connection", async (socket) => {
  socket.on("disconnect", async () => {
    await redisClient.multi()
      .decr(`${processId}:total-clients`)
      .decr("total-clients")
      .exec();
  });

  await redisClient.multi()
    .incr(`${processId}:total-clients`)
    .incr("total-clients")
    .exec();
});

async function totalCount() {
  const val = await redisClient.get("total-clients");
  return val || 0;
}

const count = await totalCount();
```

Cleanup process:

```js
setInterval(async () => {
  const processes = await redisClient.sMembers("processes");
  const states = await redisClient.mGet(processes.map(p => `${p}:is-up`));

  for (let i = 0; i < processes.length; i++) {
    if (states[i] === "1") {
      continue;
    }

    const processId = processes[i];
    const count = await redisClient.get(`${processId}:total-clients`);

    await redisClient.multi()
      .sRem("processes", processId)
      .del(`${processId}:total-clients}`)
      .decrBy("total-clients", count || 0)
      .exec();
  }
}, 5000);
```

That's all folks, thanks for reading!

[Back to the list of examples](/get-started/)
