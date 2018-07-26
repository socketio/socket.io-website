title: Socket.IO  —  Using multiple nodes
permalink: /docs/using-multiple-nodes/
type: docs
---

## Sticky load balancing

If you plan to distribute the load of connections among different processes or machines, you have to make sure that requests associated with a particular session id connect to the process that originated them.

This is due to certain transports like XHR Polling or JSONP Polling relying on firing several requests during the lifetime of the &#8220;socket&#8221;.

To illustrate why this is needed, consider the example of emitting an event to all connected clients:

```js
io.emit('hi', 'all sockets');
```

Chances are that some of those clients might have an active bi-directional communication channel like `WebSocket` that we can write to immediately, but some of them might be using long-polling.

If they&#8217;re using long polling, they might or might not have sent a request that we can write to. They could be &#8220;in between&#8221; those requests. In those situations, it means we have to buffer messages in the process. In order for the client to successfully claim those messages when he sends his request, the easiest way is for him to connect to be routed to that same process.

An easy way to do that is by routing clients based on their originating address. An example follows using the NginX server:

## NginX configuration

Within the `http { }` section of your `nginx.conf` file, you can declare a `upstream` section with a list of Socket.IO process you want to balance load between:

```
upstream io_nodes {
  ip_hash;
  server 127.0.0.1:6001;
  server 127.0.0.1:6002;
  server 127.0.0.1:6003;
  server 127.0.0.1:6004;
}
```

Notice the `ip_hash` instruction that indicates the connections will be sticky.

In the same `http { }` section, you can declare a `server { }` that points to this upstream. In order for NginX to support and forward the `WebSocket` protocol, we explicitly pass along the required `Upgrade` headers:

```
server {
  listen 3000;
  server_name io.yourhost.com;
  location / {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_http_version 1.1;
    proxy_pass http://io_nodes;
  }
}
```

Make sure you also configure `worker_processes` in the topmost level to indicate how many workers NginX should use. You might also want to look into tweaking the `worker_connections` setting within the `events { }` block.

## Using Node.JS Cluster

Just like NginX, Node.JS comes with built-in clustering support through the `cluster` module.

Fedor Indutny has created a module called [sticky session](https://github.com/indutny/sticky-session) that ensures file descriptors (ie: connections) are routed based on the originating `remoteAddress` (ie: IP).

## Passing events between nodes

Now that you have multiple Socket.IO nodes accepting connections, if you want to broadcast events to everyone (or even everyone in a certain [room](/docs/rooms-and-namespaces/#Rooms)) you&#8217;ll need some way of passing messages between processes or computers.

The interface in charge of routing messages is what we call the `Adapter`. You can implement your own on top of the [socket.io-adapter](https://github.com/socketio/socket.io-adapter) (by inheriting from it) or you can use the one we provide on top of [Redis](https://redis.io/): [socket.io-redis](https://github.com/socketio/socket.io-redis):

```js
var io = require('socket.io')(3000);
var redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));
```

If you want to pass messages to it from non-socket.io processes, you should look into [&#8220;Sending messages from the outside-world&#8221;](/docs/rooms-and-namespaces/#Sending-messages-from-the-outside-world).
