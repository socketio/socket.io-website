title: Socket.IO  —  FAQ
permalink: /docs/faq/
type: docs
---

## Can I use wildcards in events?

Not in Socket.IO directly, but check out [this plugin](https://github.com/hden/socketio-wildcard) by Hao-kang Den. It provides a Socket.IO middleware to deal with wildcards.


## Prevent flooding from single connection?

Limit number of events by `IP`, `uniqueUserId` or/and `socket.id` with [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#websocket-single-connection-prevent-flooding) package.

## Socket.IO with Apache Cordova?

Take a look at [this tutorial](/socket-io-with-apache-cordova/).

## Socket.IO on iOS?

Take a look at [SIOSocket](https://github.com/MegaBits/SIOSocket).

## Socket.IO on Android?

Take a look at [socket.io-client.java](https://github.com/nkzawa/socket.io-client.java).
