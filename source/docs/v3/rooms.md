title: Rooms
permalink: /docs/v3/rooms/
alias:
  - /docs/rooms/
  - /docs/rooms-and-namespaces/ # kept for compatibility
release: v3
type: docs
order: 354
---

A *room* is an arbitrary channel that sockets can `join` and `leave`. It can be used to broadcast events to a subset of clients:

![Room diagram](/images/rooms.png)

Please note that rooms are a **server-only** concept (i.e. the client does not have access to the list of rooms it has joined).

## Joining and leaving

You can call `join` to subscribe the socket to a given channel:

```js
io.on('connection', socket => {
  socket.join('some room');
});
```

And then simply use `to` or `in` (they are the same) when broadcasting or emitting:

```js
io.to('some room').emit('some event');
```

You can emit to several rooms at the same time:

```js
io.to('room1').to('room2').to('room3').emit('some event');
```

In that case, a <a href="https://en.wikipedia.org/wiki/Union_(set_theory)">union</a> is performed: every socket that is at least in one of the rooms will get the event **once** (even if the socket is in two or more rooms).

You can also broadcast to a room from a given socket:

```js
io.on('connection', function(socket){
  socket.to('some room').emit('some event');
});
```

In that case, every socket in the room **excluding** the sender will get the event.

![Broadcasting to room excepting the sender](/images/rooms2.png)

To leave a channel you call `leave` in the same fashion as `join`.

## Default room

Each `Socket` in Socket.IO is identified by a random, unguessable, unique identifier [Socket#id](/docs/v3/server-socket-instance/#Socket-id). For your convenience, each socket automatically joins a room identified by its own id.

This makes it easy to implement private messages:

```js
io.on("connection", socket => {
  socket.on("private message", (anotherSocketId, msg) => {
    socket.to(anotherSocketId).emit("private message", socket.id, msg);
  });
});
```

## Sample use cases

- broadcast data to each device / tab of a given user

```js
io.on('connection', async (socket) => {
  const userId = await fetchUserId(socket);

  socket.join(userId);

  // and then later
  io.to(userId).emit('hi');
});
```

- send notifications about a given entity

```js
io.on('connection', async (socket) => {
  const projects = await fetchProjects(socket);

  projects.forEach(project => socket.join('project:' + project.id));

  // and then later
  io.to('project:4321').emit('project updated');
});
```

## Usage with asynchronous code

Please make sure to use `io.to(...).emit(...)` (or `socket.to(...).emit(...)`) in a synchronous manner.

Example with callback:

```js
// BAD
const room = socket.to('room1');
saveProduct(() => {
  room.emit('product-updated');
});

// GOOD
saveProduct(() => {
  socket.to('room1').emit('product-updated');
});
```

Example with `async/await`:

```js
// BAD
io.to('room2').emit('details', await fetchDetails());

// GOOD
const details = await fetchDetails();
io.to('room2').emit('details', details);
```

Explanation: the `to()` method does not return a new object, it mutates an attribute on the `io` (respectively, the `socket`) object.

This also applies to other broadcast modifiers:

- [local](/docs/v3/server-api/#Flag-‘local’)
- [broadcast](/docs/v3/server-api/#Flag-‘broadcast’)
- [volatile](/docs/v3/server-api/#Flag-‘volatile’)

## Disconnection

Upon disconnection, sockets `leave` all the channels they were part of automatically, and no special teardown is needed on your part.

You can fetch the rooms the Socket was in by listening to the `disconnecting` event:

```js
io.on('connection', socket => {
  socket.on('disconnecting', () => {
    console.log(socket.rooms); // the Set contains at least the socket ID
  });

  socket.on('disconnect', () => {
    // socket.rooms.size === 0
  });
});
```

## With multiple Socket.IO servers

Like [global broadcasting](/docs/v3/broadcasting-events/#With-multiple-Socket-IO-servers), broadcasting to rooms also works with multiple Socket.IO servers.

You just need to replace the default [Adapter](/docs/v3/glossary/#Adapter) by the Redis Adapter. More information about it [here](/docs/v3/using-multiple-nodes/#Passing-events-between-nodes).

![Broadcasting to room with Redis](/images/rooms-redis.png)

## Implementation details

The "room" feature is implemented by what we call an Adapter. This Adapter is a server-side component which is responsible for:

- storing the relationships between the Socket instances and the rooms
- broadcasting events to all (or a subset of) clients

You can find the code of the default in-memory adapter [here](https://github.com/socketio/socket.io-adapter).

Basically, it consists in two [ES6 Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map):

- `sids`: `Map<SocketId, Set<Room>>`
- `rooms`: `Map<Room, Set<SocketId>>`

Calling `socket.join("the-room")` will result in:

- in the ̀`sids` Map, adding "the-room" to the Set identified by the socket ID
- in the `rooms` Map, adding the socket ID in the Set identified by the string "the-room"

Those two maps are then used when broadcasting:

- a broadcast to all sockets (`io.emit()`) loops through the `sids` Map, and send the packet to all sockets
- a broadcast to a given room (`io.to("room21").emit()`) loops through the Set in the `rooms` Map, and sends the packet to all matching sockets

You can access those objects with:

```js
// main namespace
const rooms = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

// custom namespace
const rooms = io.of("/my-namespace").adapter.rooms;
const sids = io.of("/my-namespace").adapter.sids;
```

Notes:

- those objects are not meant to be directly modified, you should always use [`socket.join(...)`](/docs/v3/server-api/#socket-join-room) and [`socket.leave(...)`](/docs/v3/server-api/#socket-leave-room) instead.
- in a [multi-server](/docs/v3/using-multiple-nodes/) setup, the `rooms` and `sids` objects are not shared between the Socket.IO servers (a room may only "exist" on one server and not on another).

## Room events

Starting with `socket.io@3.1.0`, the underlying Adapter will emit the following events:

- `create-room` (argument: room)
- `delete-room` (argument: room)
- `join-room` (argument: room, id)
- `leave-room` (argument: room, id)

Example:

```js
io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
```
