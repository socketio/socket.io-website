title: Socket.IO  —  Rooms and Namespaces
permalink: /docs/rooms-and-namespaces/
type: docs
---

# Namespaces

Socket.IO allows you to “namespace” your sockets, which essentially means assigning different *endpoints* or *paths*.

This is a useful feature to minimize the number of resources (TCP connections) and at the same time separate concerns within your application by introducing separation between communication channels.

## Default namespace

We call the default namespace `/` and it’s the one Socket.IO clients connect to by default, and the one the server listens to by default.

This namespace is identified by `io.sockets` or simply `io`:

```js
// the following two will emit to all the sockets connected to `/`
io.sockets.emit('hi', 'everyone');
io.emit('hi', 'everyone'); // short form
```

Each namespace emits a `connection` event that receives each `Socket` instance as a parameter

```js
io.on('connection', function(socket){
  socket.on('disconnect', function(){ });
});
```

## Custom namespaces

To set up a custom namespace, you can call the `of` function on the server-side:

```js
const nsp = io.of('/my-namespace');
nsp.on('connection', function(socket){
  console.log('someone connected');
});
nsp.emit('hi', 'everyone!');
```

On the client side, you tell Socket.IO client to connect to that namespace:
```js
const socket = io('/my-namespace');
```

**Important note:** The namespace is an implementation detail of the Socket.IO protocol, and is not related to the actual URL of the underlying transport, which defaults to `/socket.io/…`.

# Rooms

Within each namespace, you can also define arbitrary channels that sockets can `join` and `leave`.

## Joining and leaving

You can call `join` to subscribe the socket to a given channel:

```js
io.on('connection', function(socket){
  socket.join('some room');
});
```

And then simply use `to` or `in` (they are the same) when broadcasting or emitting:

```js
io.to('some room').emit('some event');
```

To leave a channel you call `leave` in the same fashion as `join`.

## Default room

Each `Socket` in Socket.IO is identified by a random, unguessable, unique identifier `Socket#id`. For your convenience, each socket automatically joins a room identified by this id.

This makes it easy to broadcast messages to other sockets:

```js
io.on('connection', function(socket){
  socket.on('say to someone', function(id, msg){
    socket.broadcast.to(id).emit('my message', msg);
  });
});
```

## Disconnection

Upon disconnection, sockets `leave` all the channels they were part of automatically, and no special teardown is needed on your part.

# Sending messages from the outside-world

In some cases, you might want to emit events to sockets in Socket.IO namespaces / rooms from outside the context of your Socket.IO processes.

There’s several ways to tackle this problem, like implementing your own channel to send messages into the process.

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
