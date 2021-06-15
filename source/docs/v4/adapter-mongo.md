title: MongoDB adapter
permalink: /docs/v4/mongo-adapter/
release: v4
type: docs
order: 403
---

## How it works

The MongoDB adapter relies on MongoDB's [Change Streams](https://docs.mongodb.com/manual/changeStreams/) (and thus requires a replica set or a sharded cluster).

Every packet that is sent to multiple clients (e.g. `io.to("room1").emit()` or `socket.broadcast.emit()`) is:

- sent to all matching clients connected to the current server
- inserted in a MongoDB capped collection, and received by the other Socket.IO servers of the cluster

![Diagram of how the MongoDB adapter works](/images/mongo-adapter.png)

The source code of this adapter can be found [here](https://github.com/socketio/socket.io-mongo-adapter).

## Installation

```
npm install @socket.io/mongo-adapter mongodb
```

For TypeScript users, you might also need `@types/mongodb`.

## Usage

```js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/mongo-adapter");
const { MongoClient } = require("mongodb");

const DB = "mydb";
const COLLECTION = "socket.io-adapter-events";

const io = new Server();

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0", {
  useUnifiedTopology: true,
});

const main = async () => {
  await mongoClient.connect();

  try {
    await mongoClient.db(DB).createCollection(COLLECTION, {
      capped: true,
      size: 1e6
    });
  } catch (e) {
    // collection already exists
  }
  const mongoCollection = mongoClient.db(DB).collection(COLLECTION);

  io.adapter(createAdapter(mongoCollection));
  io.listen(3000);
}

main();
```

Note: the [capped collection](https://docs.mongodb.com/manual/core/capped-collections/) prevents the collection from growing too big.

## Options

| Name | Description | Default value |
| ---- | ----------- | ------------- |
| `uid` | the ID of this node | a random id |
| `requestsTimeout` | the timeout for inter-server requests such as `fetchSockets()` or `serverSideEmit()` with ack | `5000` |
| `heartbeatInterval` | the number of ms between two heartbeats | `5000` |
| `heartbeatTimeout` | the number of ms without heartbeat before we consider a node down | `10000` |

## Common questions

- Do I still need to enable sticky sessions when using the MongoDB adapter?

Yes. Failing to do so will result in HTTP 400 responses (you are reaching a server that is not aware of the Socket.IO session).

More information can be found [here](/docs/v4/using-multiple-nodes/#Why-is-sticky-session-required).

- What happens when the MongoDB cluster is down?

In case the connection to the MongoDB cluster is severed, the behavior will depend on the value of the `bufferMaxEntries` option of the MongoDB client:

- if its value is `-1` (default), the packets will be buffered until reconnection.
- if its value is `0`, the packets will only be sent to the clients that are connected to the current server.

Documentation: http://mongodb.github.io/node-mongodb-native/3.6/api/global.html#MongoClientOptions

## Emitter

The MongoDB emitter allows sending packets to the connected clients from another Node.js process:

![Diagram of how the MongoDB emitter works](/images/mongo-emitter.png)

### Installation

```
npm install @socket.io/mongo-emitter mongodb
```

### Usage

```js
const { Emitter } = require("@socket.io/mongo-emitter");
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0", {
  useUnifiedTopology: true,
});

const main = async () => {
  await mongoClient.connect();

  const mongoCollection = mongoClient.db("mydb").collection("socket.io-adapter-events");
  const emitter = new Emitter(mongoCollection);

  setInterval(() => {
    emitter.emit("ping", new Date());
  }, 1000);
}

main();
```

Please refer to the cheatsheet [here](/docs/v4/adapter/#Emitter-cheatsheet).
