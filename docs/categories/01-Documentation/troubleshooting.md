---
title: Troubleshooting connection issues
sidebar_label: Troubleshooting
sidebar_position: 5
slug: /troubleshooting-connection-issues/
---

Common/known issues:

- [the socket is not able to connect](#problem-the-socket-is-not-able-to-connect)
- [the socket gets disconnected](#problem-the-socket-gets-disconnected)
- [the socket is stuck in HTTP long-polling](#problem-the-socket-is-stuck-in-http-long-polling)

### Problem: the socket is not able to connect

Possible explanations:

- [You are trying to reach a plain WebSocket server](#you-are-trying-to-reach-a-plain-websocket-server)
- [The server is not reachable](#the-server-is-not-reachable)
- [The client is not compatible with the version of the server](#the-client-is-not-compatible-with-the-version-of-the-server)
- [The server does not send the necessary CORS headers](#the-server-does-not-send-the-necessary-cors-headers)
- [You didn’t enable sticky sessions (in a multi server setup)](#you-didnt-enable-sticky-sessions-in-a-multi-server-setup)

#### You are trying to reach a plain WebSocket server

As explained in the ["What Socket.IO is not"](index.md#what-socketio-is-not) section, the Socket.IO client is not a WebSocket implementation and thus will not be able to establish a connection with a WebSocket server, even with `transports: ["websocket"]`:

```js
const socket = io("ws://echo.websocket.org", {
  transports: ["websocket"]
});
```

#### The server is not reachable

Please make sure the Socket.IO server is actually reachable at the given URL. You can test it with:

```
curl "<the server URL>/socket.io/?EIO=4&transport=polling"
```

which should return something like this:

```
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000}
```

If that's not the case, please check that the Socket.IO server is running, and that there is nothing in between that prevents the connection.

#### The client is not compatible with the version of the server

Here is the compatibility table for the [JS client](https://github.com/socketio/socket.io-client/):

<table>
    <tr>
        <th rowspan="2">JS Client version</th>
        <th colspan="4">Socket.IO server version</th>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>YES</b></td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">3.x</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b></td>
    </tr>
    <tr>
        <td align="center">4.x</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b></td>
    </tr>
</table>

[1] Yes, with [allowEIO3: true](../../server-options.md#alloweio3)

Here is the compatibility table for the [Java client](https://github.com/socketio/socket.io-client-java/):

<table>
    <tr>
        <th rowspan="2">Java Client version</th>
        <th colspan="3">Socket.IO server version</th>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b></td>
    </tr>
</table>

[1] Yes, with [allowEIO3: true](../../server-options.md#alloweio3)

Here is the compatibility table for the [Swift client](https://github.com/socketio/socket.io-client-swift/):

<table>
    <tr>
        <th rowspan="2">Swift Client version</th>
        <th colspan="3">Socket.IO server version</th>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">v15.x</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
        <td align="center"><b>YES</b><sup>2</sup></td>
    </tr>
    <tr>
        <td align="center">v16.x</td>
        <td align="center"><b>YES</b><sup>3</sup></td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b></td>
    </tr>
</table>

[1] Yes, with [allowEIO3: true](../../server-options.md#alloweio3) (server) and `.connectParams(["EIO": "3"])` (client):

```swift
SocketManager(socketURL: URL(string:"http://localhost:8087/")!, config: [.connectParams(["EIO": "3"])])
```

[2] Yes, [allowEIO3: true](../../server-options.md#alloweio3) (server)

[3] Yes, with `.version(.two)` (client):

```swift
SocketManager(socketURL: URL(string:"http://localhost:8087/")!, config: [.version(.two)])
```

#### The server does not send the necessary CORS headers

If you see the following error in your console:

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ...
```

It probably means that:

- either you are not actually reaching the Socket.IO server (see [above](#the-server-is-not-reachable))
- or you didn't enable [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS) on the server-side.

Please see the documentation [here](../02-Server/handling-cors.md).

#### You didn't enable sticky sessions (in a multi server setup)

When scaling to multiple Socket.IO servers, you need to make sure that all the requests of a given Socket.IO session reach the same Socket.IO server. The explanation can be found [here](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

Failure to do so will result in HTTP 400 responses with the code: `{"code":1,"message":"Session ID unknown"}`

Please see the documentation [here](../02-Server/using-multiple-nodes.md).

### Problem: the socket gets disconnected

First and foremost, please note that disconnections are common and expected, even on a stable Internet connection:

- anything between the user and the Socket.IO server may encounter a temporary failure or be restarted
- the server itself may be killed as part of an autoscaling policy
- the user may lose connection or switch from WiFi to 4G, in case of a mobile browser
- the browser itself may freeze an inactive tab

That being said, the Socket.IO client will always try to reconnect, unless specifically told [otherwise](../../client-options.md#reconnection).

Possible explanations for a disconnection:

- [The browser tab was minimized and heartbeat has failed](#the-browser-tab-was-minimized-and-heartbeat-has-failed)
- [The client is not compatible with the version of the server](#the-client-is-not-compatible-with-the-version-of-the-server-1)
- [You are trying to send a huge payload](#you-are-trying-to-send-a-huge-payload)

#### The browser tab was minimized and heartbeat has failed

When a browser tab is not in focus, some browsers (like [Chrome](https://developer.chrome.com/blog/timer-throttling-in-chrome-88/#intensive-throttling)) throttle JavaScript timers, which could lead to a disconnection by ping timeout **in Socket.IO v2**, as the heartbeat mechanism relied on `setTimeout` function on the client side.

As a workaround, you can increase the `pingTimeout` value on the server side:

```js
const io = new Server({
  pingTimeout: 60000
});
```

Please note that upgrading to Socket.IO v4 (at least `socket.io-client@4.1.3`, due to [this](https://github.com/socketio/engine.io-client/commit/f30a10b7f45517fcb3abd02511c58a89e0ef498f)) should prevent this kind of issues, as the heartbeat mechanism has been reversed (the server now sends PING packets).

#### The client is not compatible with the version of the server

Since the format of the packets sent over the WebSocket transport is similar in v2 and v3/v4, you might be able to connect with an incompatible client (see [above](#the-client-is-not-compatible-with-the-version-of-the-server)), but the connection will eventually be closed after a given delay.

So if you are experiencing a regular disconnection after 30 seconds (which was the sum of the values of [pingTimeout](../../server-options.md#pingtimeout) and [pingInterval](../../server-options.md#pinginterval) in Socket.IO v2), this is certainly due to a version incompatibility.

#### You are trying to send a huge payload

If you get disconnected while sending a huge payload, this may mean that you have reached the [`maxHttpBufferSize`](../../server-options.md#maxhttpbuffersize) value, which defaults to 1 MB. Please adjust it according to your needs:

```js
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: 1e8
});
```

A huge payload taking more time to upload than the value of the [`pingTimeout`](../../server-options.md#pingtimeout) option can also trigger a disconnection (since the [heartbeat mechanism](../01-Documentation/how-it-works.md#disconnection-detection) fails during the upload). Please adjust it according to your needs:

```js
const io = require("socket.io")(httpServer, {
  pingTimeout: 60000
});
```

### Problem: the socket is stuck in HTTP long-polling

In most cases, you should see something like this:

![Network monitor upon success](/images/network-monitor.png)

1. the Engine.IO handshake (contains the session ID — here, `zBjrh...AAAK` — that is used in subsequent requests)
2. the Socket.IO handshake request (contains the value of the `auth` option)
3. the Socket.IO handshake response (contains the [Socket#id](../02-Server/server-socket-instance.md#socketid))
4. the WebSocket connection
5. the first HTTP long-polling request, which is closed once the WebSocket connection is established

If you don't see a [HTTP 101 Switching Protocols](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/101) response for the 4th request, that means that something between the server and your browser is preventing the WebSocket connection.

Please note that this is not necessarily blocking since the connection is still established with HTTP long-polling, but it is less efficient.

You can get the name of the current transport with:

**Client-side**

```js
socket.on("connect", () => {
  const transport = socket.io.engine.transport.name; // in most cases, "polling"

  socket.io.engine.on("upgrade", () => {
    const upgradedTransport = socket.io.engine.transport.name; // in most cases, "websocket"
  });
});
```

**Server-side**

```js
io.on("connection", (socket) => {
  const transport = socket.conn.transport.name; // in most cases, "polling"

  socket.conn.on("upgrade", () => {
    const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
  });
});
```

Possible explanations:

- [a proxy in front of your servers does not accept the WebSocket connection](#a-proxy-in-front-of-your-servers-does-not-accept-the-WebSocket-connection)

#### A proxy in front of your servers does not accept the WebSocket connection

Please see the documentation [here](../02-Server/behind-a-reverse-proxy.md).
