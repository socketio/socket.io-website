---
title: Performance tuning
sidebar_position: 6
slug: /performance-tuning/
---

Here are some tips to improve the performance of your Socket.IO server:

- [at the Socket.IO level](#at-the-Socket-IO-level)
- [at the OS level](#at-the-OS-level)

You might also be interested in [scaling to multiple nodes](/docs/v4/using-multiple-nodes/).

## At the Socket.IO level

Since, in most cases, the Socket.IO connection will be established with WebSocket, the performance of your Socket.IO server will be strongly linked to the performance of the underlying WebSocket server ([`ws`](https://github.com/websockets/ws), by default).

### Install `ws` native add-ons

`ws` comes with two optional binary add-ons which improve certain operations. Prebuilt binaries are available for the most popular platforms so you don't necessarily need to have a C++ compiler installed on your machine.

- [bufferutil](https://www.npmjs.com/package/bufferutil): Allows to efficiently perform operations such as masking and unmasking the data payload of the WebSocket frames.
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate): Allows to efficiently check if a message contains valid UTF-8 as required by the spec.

To install those packages:

```
$ npm install --save-optional bufferutil utf-8-validate
```

Please note that these packages are optional, the WebSocket server will fallback to the Javascript implementation if they are not available. More information can be found [here](https://github.com/websockets/ws/#opt-in-for-performance-and-spec-compliance).

### Use another WebSocket server implementation

For example, you can use the [eiows](https://www.npmjs.com/package/eiows) package, which is a fork of the (now deprecated) [uws](https://www.npmjs.com/package/uws) package:

```
$ npm install eiows
```

And then use the [`wsEngine`](/docs/v4/server-initialization/#wsEngine) option:

```js
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  wsEngine: require("eiows").Server
});
```

### Use a custom parser

If you send binary data over the Socket.IO connection, using a [custom parser](/docs/v4/custom-parser/) like the one based on [msgpack](/docs/v4/custom-parser/#The-msgpack-parser) might be interesting, as by default each buffer will be sent in its own WebSocket frame.

Usage:

*Server*

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const parser = require("socket.io-msgpack-parser");

const httpServer = createServer();
const io = new Server(httpServer, {
  parser
});
```

*Client*

```js
const { io } = require("socket.io-client");
const parser = require("socket.io-msgpack-parser");

const socket = io("https://example.com", {
  parser
});
```

## At the OS level

There are lots of good articles on how to tune your OS to accept a large number of connections. Please see [this one](https://blog.jayway.com/2015/04/13/600k-concurrent-websocket-connections-on-aws-using-node-js/) or [this one](https://medium.com/@elliekang/scaling-to-a-millions-websocket-concurrent-connections-at-spoon-radio-bbadd6ec1901) for example.

While [load testing](/docs/v4/load-testing/) your Socket.IO server, you will likely reach the two following limits:

- maximum number of open files

If you can't go over 1000 concurrent connections (new clients are not able to connect), you have most certainly reached the maximum number of open files:

```
$ ulimit -n
1024
```

To increase this number, create a new file `/etc/security/limits.d/custom.conf` with the following content (requires root privileges):

```
* soft nofile 1048576
* hard nofile 1048576
```

And then reload your session. Your new limit should now be updated:

```
$ ulimit -n
1048576
```

- maximum number of available local ports

If you can't go over 28000 concurrent connections, you have most certainly reached the maximum number of available local ports:

```
$ cat /proc/sys/net/ipv4/ip_local_port_range
32768	60999
```

To increase this number, create a new file `/etc/sysctl.d/net.ipv4.ip_local_port_range.conf` with the following content (again, requires root privileges):

```
net.ipv4.ip_local_port_range = 10000 65535
```

Note: we used `10000` as a lower bound so it does not include the ports that are used by the services on the machine (like `5432` for a PostgreSQL server), but you can totally use a lower value (down to `1024`).

Once you reboot your machine, you will now be able to happily go to 55k concurrent connections (per incoming IP).

See also:

- https://unix.stackexchange.com/a/130798
- https://making.pusher.com/ephemeral-port-exhaustion-and-how-to-avoid-it/
