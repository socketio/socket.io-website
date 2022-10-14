---
title: FAQ
sidebar_position: 1
slug: /faq/
---

## Eu posso utilizar wildcards in events? {#can-i-use-wildcards-in-events}


Não no Socket.IO diretamente, porém verifica a saída [deste plugin](https://github.com/hden/socketio-wildcard) by Hao-kang Den.Ele providencia Socket.IO middleware para lidar com wildcards.


## Prevenir flooding para conexões unicas? {#prevent-flooding-from-single-connection}

Limitar numeros do eventos por `IP`, `uniqueUserId` ou `socket.id` com o pacote[rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#websocket-single-connection-prevent-flooding) package.

## Socket.IO com Apache Cordova? {#socketio-with-apache-cordova}

Dê uma olhada [nesse tutorial](/socket-io-with-apache-cordova/).

## Socket.IO no iOS? {#socketio-on-ios}

Dê uma olhada em [socket.io-client-swift](https://github.com/socketio/socket.io-client-swift).

## Socket.IO no Android? {#socketio-on-android}

Dê uma olhada em [socket.io-client.java](https://github.com/nkzawa/socket.io-client.java).

## Uso com [express-session](https://www.npmjs.com/package/express-session) {#usage-with-express-session}

```js
const express = require('express');
const session = require('express-session');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const sessionMiddleware = session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }});
// registro de middleware em Express
app.use(sessionMiddleware);
// registro de middleware em Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
  // sessionMiddleware(socket.request, socket.request.res, next); não funcionará apenas com websocket
  // ligações, como 'socket.request.res' será indefinido nesse caso
});

io.on('connection', (socket) => {
  const session = socket.request.session;
  session.connections++;
  session.save();
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log('server listening on port ' + port));
```
