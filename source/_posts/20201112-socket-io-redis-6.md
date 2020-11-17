title: Redis Adapter v6.0.0
permalink: /blog/socket-io-redis-adapter-6-release/
date: 2020-11-12
author_name: Damien Arrachequesne
author_link: https://github.com/darrachequesne
alias: blog/index.html
---

Following the [release of Socket.IO v3.0.0](/blog/socket-io-3-release/), the Redis Adapter was updated and a new release is out: [6.0.0](https://github.com/socketio/socket.io-redis/releases/tag/6.0.0)

For reference, the Redis Adapter is used when broadcasting packets across a set of Socket.IO servers. It relies on Redis [Pub/Sub mechanism](https://redis.io/topics/pubsub).

More information about how it works: https://github.com/socketio/socket.io-redis/#how-does-it-work-under-the-hood

The release notes can be found here: https://github.com/socketio/socket.io-redis/releases/tag/6.0.0

Please note that the new release is not compatible with Socket.IO v2, and previous versions are not compatible with Socket.IO v3 ([compatibility table](https://github.com/socketio/socket.io-redis/#compatibility-table)).

## Notable changes

### All the requests (for inter-node communication) now return a Promise instead of accepting a callback

The Redis Adapter exposes additional methods for managing sockets and rooms in a multi-node setup:

- `RedisAdapter.sockets()`: returns the list of Socket IDs
- `RedisAdapter.allRooms()`: returns the list of all rooms.
- `RedisAdapter.remoteJoin(id, room)`: make the socket join the room
- `RedisAdapter.remoteLeave(id, room)`: make the socket leave the room
- `RedisAdapter.remoteDisconnect(id, close)`: disconnect the socket with the given id

Those methods used to accept a callback argument, they will now return a Promise.

Before:

```js
io.of('/').adapter.allRooms((err, rooms) => {
  console.log(rooms); // an array containing all rooms (across all nodes)
});
```

After:

```js
const rooms = await io.of('/').adapter.allRooms();
console.log(rooms); // a Set containing all rooms (across all nodes)
```

### customHook and customRequest methods were removed

Those methods will be replaced by a more intuitive API in a future iteration.
