---
title: 常问问题
sidebar_position: 1
slug: /faq/
---

## 我可以在事件中使用通配符吗？ {#can-i-use-wildcards-in-events}

不是直接在 Socket.IO 中，而是查看Hao-kang Den 的[这个插件](https://github.com/hden/socketio-wildcard)。它提供了一个 Socket.IO 中间件来处理通配符。


## 防止单个连接泛滥？ {#prevent-flooding-from-single-connection}

通过`IP`， `uniqueUserId` 或/和 `socket.id` 使用 [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#websocket-single-connection-prevent-flooding)包来限制事件的数量。

## 带有 Apache Cordova 的 Socket.IO？ {#socketio-with-apache-cordova}

看看[这个](/socket-io-with-apache-cordova/).

## iOS 上的 Socket.IO？ {#socketio-on-ios}

看看[socket.io-client-swift](https://github.com/socketio/socket.io-client-swift).

## Android 上的 Socket.IO？ {#socketio-on-android}

看看[socket.io-client.java](https://github.com/nkzawa/socket.io-client.java).

## 使用 [express-session](https://www.npmjs.com/package/express-session) {#usage-with-express-session}

看看[这个](/how-to/use-with-express-session).
