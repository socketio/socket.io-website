title: Rooms
permalink: /docs/rooms/
type: docs
order: 204
alias: /docs/rooms-and-namespaces/ # kept for compatibility
---

Within each [Namespace](/docs/namespaces/), you can define arbitrary channels called "Rooms" that sockets can `join` and `leave`.

This is useful to broadcast data to a subset of sockets:

![Room diagram](/images/rooms.png)

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

In that case, an <a href="https://en.wikipedia.org/wiki/Union_(set_theory)">union</a> is performed: every socket that is at least in one of the rooms will get the event **once** (even if the socket is in two or more rooms).

You can also broadcast to a room from a given socket:

```js
io.on('connection', function(socket){
  socket.to('some room').emit('some event');
});
```

In that case, every sockets in the room **excluding** the sender will get the event.

To leave a channel you call `leave` in the same fashion as `join`. Both methods are asynchronous and accept a `callback` argument.

## Default room

Each `Socket` in Socket.IO is identified by a random, unguessable, unique identifier `Socket#id`. For your convenience, each socket automatically joins a room identified by its own id.

This makes it easy to broadcast messages to other sockets:

```js
io.on('connection', socket => {
  socket.on('say to someone', (id, msg) => {
    socket.to(id).emit('my message', msg);
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

  socket.on('update project', async (payload) => {
    const project = await updateProject(payload);
    io.to('project:' + project.id).emit('project updated', project);
  });
});
```

## Disconnection

Upon disconnection, sockets `leave` all the channels they were part of automatically, and no special teardown is needed on your part.

You can fetch the rooms the Socket was in by listening to the `disconnecting` event:

```js
io.on('connection', socket => {
  socket.on('disconnecting', () => {
    const rooms = Object.keys(socket.rooms);
    // the rooms array contains at least the socket ID
  });

  socket.on('disconnect', () => {
    // socket.rooms === {}
  });
});
```

## Sending messages from the outside-world

In some cases, you might want to emit events to sockets in Socket.IO namespaces / rooms from outside the context of your Socket.IO processes.

There are several ways to tackle this problem, like implementing your own channel to send messages into the process.

To facilitate this use case, we created two modules:

- [socket.io-redis](https://github.com/socketio/socket.io-redis)
- [socket.io-emitter](https://github.com/socketio/socket.io-emitter)

By implementing the Redis `Adapter`:

```js
const io = require('socket.io')(3000);
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));
```

you can then `emit` messages from any other process to any channel

```js
const io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });
setInterval(function(){
  io.emit('time', new Date);
}, 5000);
```
