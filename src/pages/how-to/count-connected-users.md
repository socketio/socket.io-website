---
title: How to count the number of connected users
---

# How to count the number of connected users

Counting connected users is a bit more complex than [counting clients](/how-to/count-connected-clients), because a single user can be connected across multiple tabs, browsers or even devices.

## Standalone

When using a single Socket.IO server, a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) should be sufficient:

```js
function computeUserId(socket) {
  // parse cookie / read JWT token / ... and retrieve the user ID (to be implemented)
}

const users = new Map();

function handleConnection(userId) {
  const count = users.get(userId) || 0;
  users.set(userId, count + 1);
  return count === 0;
}

function handleDisconnection(userId) {
  const count = users.get(userId) - 1;
  if (count === 0) {
    users.delete(userId);
  } else {
    users.set(userId, count);
  }
  return count === 0;
}

io.on("connection", (socket) => {
  const userId = computeUserId(socket);
  const hasConnected = handleConnection(userId);

  if (hasConnected) {
    io.emit("user has connected", userId);
  }

  socket.on("disconnect", () => {
    const hasDisconnected = handleDisconnection(userId);

    if (hasDisconnected) {
      io.emit("user has disconnected", userId);
    }
  });
});
```

In that case, computing the user presence is quite straightforward:

```js
function isUserConnected(userId) {
  return users.has(userId);
}

function usersCount() {
  return users.size;
}

function usersList() {
  return [...users.keys()];
}
```

## Cluster

### Single user presence

A simple yet effective solution to check whether a given user is online is to use the `fetchSockets()` method with one room per user ID:

:::note

The `fetchSockets()` method sends a request to every node in the cluster, which respond with their local socket instances (the ones that are currently connected to the node).

Reference: [`fetchSockets()`](/docs/v4/server-api/#serverfetchsockets)

:::

```js
io.on("connection", (socket) => {
  const userId = computeUserId(socket);
  socket.join(userId);
});

async function isUserConnected(userId) {
  const sockets = await io.in(userId).fetchSockets();
  return sockets.length > 0;
}
```

This works, however the `fetchSockets()` method includes a lot of details about the socket instances (id, rooms, handshake data). This can be slightly improved with the `serverSideEmit()` method:

:::note

The `serverSideEmit()` method sends an event to every node in the cluster, and waits for their responses.

Reference: [`serverSideEmitWithAck()`](/docs/v4/server-api/#serverserversideemitwithackeventname-args)

:::

```js
const users = new Map();

io.on("connection", (socket) => {
  // update the `users` map (see the "Standalone" section above)
});

function isUserConnectedOnThisNode(userId) {
  return users.has(userId);
}

io.on("isUserConnected", (userId, cb) => {
  cb(isUserConnectedOnThisNode(userId));
});

async function isUserConnected(userId) {
  if (isUserConnectedOnThisNode(userId)) {
    return true;
  }
  const responses = await io.serverSideEmitWithAck("isUserConnected", userId);
  return responses.some(r => r);
}
```

However, both methods do not allow to efficiently count and/or list all connected users.

### All users presence

The most efficient solution for this use case is to use an external store like Redis.

In Redis:

| Key              | Type              | Content                  |
|------------------|-------------------|--------------------------|
| `processes`      | Set               | `[process1, process2]`   |
| `process1:is-up` | String (+ expiry) | `1`                      |
| `process2:is-up` | String (+ expiry) | `1`                      |
| `users`          | Hash              | `{ user1: 2, user2: 1 }` |
| `process1:users` | Hash              | `{ user1: 1, user2: 1 }` |
| `process2:users` | Hash              | `{ user1: 1 }`           |


Notes:

- the `users` hash tracks the number of socket instances per user ID
- the `<processId>:users` hashes are used in case one server abruptly crashes and fails to update the `users` hash

Let's start by creating a custom `HDECR` method, which will decrement a field of the hash, and delete it if it drops to 0. We will use a [Lua script](https://redis.io/docs/latest/develop/interact/programmability/eval-intro/), so both commands are executed atomically:

```js
import { createClient, defineScript } from "redis";

const redisClient = createClient({
  url: "redis://...",
  scripts: {
    hDecr: defineScript({
      NUMBER_OF_KEYS: 1,
      SCRIPT:
        `
          local count = redis.call('HINCRBY', KEYS[1], ARGV[1], -1)

          if count == 0 then
            redis.call('HDEL', KEYS[1], ARGV[1])
          end

          return count
        `,
      transformArguments(key, userId) {
        return [key, userId];
      }
    }),
  },
});
```

Now we'll simply:

- call [`HINCRBY`](https://redis.io/docs/latest/commands/hincrby/) upon connection
- call our custom `HDECR` command upon disconnection

Here we go:

```js
const processId = randomUUID();
// add the process ID to the "processes" set
await redisClient.multi()
  .sAdd("processes", processId)
  .set(`${processId}:is-up`, "1", { EX: 10 })
  .exec();

setInterval(async () => {
  // notify that the process is still alive
  await redisClient.expire(`${processId}:is-up`, 10);
}, 5000);

async function handleConnection(userId) {
  // atomically increment the `userId` field in both hashes
  const [res] = await redisClient.multi()
    .hIncrBy("users", userId, 1)
    .hIncrBy(`${processId}:users`, userId, 1)
    .exec();
  return res === 1;
}

async function handleDisconnection(userId) {
  // atomically decrement the `userId` field in both hashes
  const [res] = await redisClient.multi()
    .hDecr("users", userId)
    .hDecr(`${processId}:users`, userId)
    .exec();
  return res === 0;
}

io.on("connection", async (socket) => {
  const userId = computeUserId(socket);
  const hasConnected = await handleConnection(userId);

  if (hasConnected) {
    io.emit("user has connected", userId);
  }

  socket.on("disconnect", async () => {
    const hasDisconnected = await handleDisconnection(userId);

    if (hasDisconnected) {
      io.emit("user has disconnected", userId);
    }
  });
});
```

Finally, we can use the `users` hash to compute the user presence:

```js
function isUserConnected(userId) {
  return redisClient.hExists("users", userId);
}

function usersCount() {
  return redisClient.hLen("users");
}

function usersList() {
  return redisClient.hKeys("users");
}
```

The cleanup process periodically checks for dead processes:

```js
import { createClient, defineScript } from "redis";

const redisClient = createClient({
  url: "redis://...",
  scripts: {
    cleanup: defineScript({
      NUMBER_OF_KEYS: 2,
      SCRIPT:
        `
          local disconnected_users = {}
          local values = redis.call('HGETALL', KEYS[2])

          for i = 1, #values, 2 do
            local user_id = values[i]
            local socket_count = tonumber(values[i + 1])
            local count = redis.call('HINCRBY', KEYS[1], user_id, -socket_count)

            if count == 0 then
              redis.call('HDEL', KEYS[1], user_id)
              table.insert(disconnected_users, user_id)
            end
          end

          redis.call('DEL', KEYS[2])

          return disconnected_users
        `,
      transformArguments(key, processKey) {
        return [key, processKey];
      }
    }),
  },
});

await redisClient.connect();

setInterval(async () => {
  const processes = await redisClient.sMembers("processes");
  const states = await redisClient.mGet(processes.map(p => `${p}:is-up`));

  for (let i = 0; i < processes.length; i++) {
    if (states[i] === "1") {
      continue;
    }

    const processId = processes[i];

    await redisClient.multi()
      .cleanup("users", `${processId}:users`)
      .sRem("processes", processId)
      .exec();
    // TODO emit the "user has disconnected" events
  }
}, 5000);
```

That's all folks, thanks for reading!

See also: [How to count the number of connected clients](/how-to/count-connected-clients)

[Back to the list of examples](/get-started/)
