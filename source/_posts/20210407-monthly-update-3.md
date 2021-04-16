title: "Monthly update #3"
permalink: /blog/monthly-update-3/
date: 2021-04-07
author_name: Damien Arrachequesne
author_link: https://github.com/darrachequesne
---

Hi everyone!

Here's the #3 edition of our Monthly update.

So, what's new in the Socket.IO ecosystem?

- [Socket.IO v4](#Socket-IO-v4)
- [Redis Adapter v6.1.0 and Redis Emitter v4.0.0](#Redis-Adapter-v6-1-0-and-Redis-Emitter-v4-0-0)
- [Documentation](#Documentation)
- [New versions](#New-versions)
- [What's next](#What’s-next)

## Socket.IO v4

Wait, already v4?

Yes, but the upgrade should be a lot easier than from v2 to v3, since the two breaking changes only impact the API on the server side.

The most important breaking change is related to broadcasting: calling `to()` or any other broadcast modifier will now return an immutable object.

Previously, the modifiers were saved on the `io` instance directly, which could lead to surprising behaviors:

```js
io.to("room1");
// and then later
io.to("room2").emit(/* ... */); // also sent to room1
```

You were also not able to reuse the operator:

```js
const operator = io.to("room1");

operator.emit(/* ... */); // to room1 (assuming synchronous call)
operator.emit(/* ... */); // to all clients
```

Even more surprising, with asynchronous code:

```js
io.to("room3").emit("details", await fetchDetails()); // unspecified behavior: maybe in room3, maybe to all clients
```

Starting with v4.0.0, you can now use `io.to()` safely:

```js
const operator = io.to("room1").except("room2");

operator.emit(/* ... */);
operator.emit(/* ... */);
```

This release also brings some interesting new features, like the `fetchSockets()` method.

Please check the migration guide [here](/docs/v4/migrating-from-3-x-to-4-0/).

## Redis Adapter v6.1.0 and Redis Emitter v4.0.0

The Redis adapter (for broadcasting packets with multiple Socket.IO servers) and the Redis emitter (for broadcasting packets from another Node.js process) have been updated in order to support the [new features](/docs/v4/migrating-from-3-x-to-4-0/#New-features) of the v4 release.

For example, the `socketsJoin` method will work across Socket.IO servers:

```js
// make all Socket instances join the "room1" room
io.socketsJoin("room1");

// make all Socket instances in the "room1" room join the "room2" and "room3" rooms
io.in("room1").socketsJoin(["room2", "room3"]);

// make all Socket instances in the "room1" room of the "admin" namespace join the "room2" room
io.of("/admin").in("room1").socketsJoin("room2");
```

More information can be found [here](/docs/v4/server-instance/#Utility-methods).

## Documentation

The documentation continues to be improved.

A new example project has been added in the "Get started" section, with middlewares and rooms: [Private messaging](/get-started/private-messaging-part-1/)

As usual, if you find a typo or think that some details are missing, please open an issue here: https://github.com/socketio/socket.io-website

## New versions

- [socket.io@4.0.1](https://github.com/socketio/socket.io/releases/tag/4.0.1) ([release notes](/blog/socket-io-3-release/))
  - [engine.io-parser@4.0.2](https://github.com/socketio/engine.io-parser/releases/tag/4.0.2) (included in `socket.io{% raw %}@{% endraw %}4.0.1`)
  - [engine.io@5.0.0](https://github.com/socketio/engine.io/releases/tag/5.0.0) (included in `socket.io{% raw %}@{% endraw %}4.0.1`)
  - [socket.io-parser@4.0.4](https://github.com/socketio/socket.io-parser/releases/tag/4.0.4) (included in `socket.io{% raw %}@{% endraw %}4.0.1`)

- [socket.io-client@4.0.1](https://github.com/socketio/socket.io-client/releases/tag/4.0.1)
  - [engine.io-parser@4.0.2](https://github.com/socketio/engine.io-parser/releases/tag/4.0.2) (included in `socket.io-client{% raw %}@{% endraw %}4.0.1`)
  - [engine.io-client@5.0.1](https://github.com/socketio/engine.io-client/releases/tag/5.0.1) (included in `socket.io-client{% raw %}@{% endraw %}4.0.1`)
  - [socket.io-parser@4.0.4](https://github.com/socketio/socket.io-parser/releases/tag/4.0.4) (included in `socket.io-client{% raw %}@{% endraw %}4.0.1`)

- [socket.io-redis@6.1.0](https://github.com/socketio/socket.io-redis/releases/tag/6.1.0)
- [@socket.io/redis-emitter@4.0.0](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.0.0)

## What's next

- a continuous focus on the documentation (additional code examples, extended guide, ...)
- additional tooling around Socket.IO

Stay safe!
