title: Troubleshooting connection issues
short_title: Troubleshooting
permalink: /docs/v3/troubleshooting-connection-issues/
release: v3
type: docs
order: 5
---

First and foremost, please note that disconnections are common and expected, even on a stable Internet connection:

- anything between the user and the Socket.IO server may encounter a temporary failure or be restarted
- the server itself may be killed as part of an autoscaling policy
- the user may lose connection or switch from WiFi to 4G, in case of a mobile browser
- the browser itself may freeze an inactive tab
- ...

That being said, the Socket.IO client will always try to reconnect, unless specifically told otherwise.

Let's review how you can troubleshoot a connection failure.

## In Node.js

### Listening to the `connect_error` event

```js
const socket = require("socket.io-client")("https://example.com");

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});
```

Common errors:

- the server might not be reachable

Please make sure the Socket.IO server is actually reachable at the given URL. You can test it with:

```
curl "https://example.com/socket.io/?EIO=4&transport=polling"
```

which should return something like this:

```
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":5000}
```

If that's not the case, please check that the Socket.IO server is running, and that there is nothing in between that prevents the connection.

- there might be an issue with the SSL certificate of the server

You can test it with `rejectUnauthorized` set to `false`.

```js
const socket = require("socket.io-client")("https://example.com", {
  rejectUnauthorized: false // WARN: please do not do this in production
});
```

If that works, it could mean that the SSL certificate is invalid, or, if you are using a self-signed certificate, that you have to trust it on the client-side:

```js
const socket = require("socket.io-client")("https://example.com", {
  ca: fs.readFileSync('./cert.pem')
});
```

### Debug logs

As explained [here](/docs/v3/logging-and-debugging/), you can also enable the logs to see what's going on under the hood.

For reference, here are the logs for a successful connection:

```
$ DEBUG=socket* node index.js

socket.io-client:url parse https://example.com +0ms
socket.io-client new io instance for https://example.com +0ms
socket.io-client:manager readyState closed +0ms
socket.io-client:manager opening https://example.com +0ms
socket.io-client:manager connect attempt will timeout after 20000 +7ms
socket.io-client:manager readyState opening +1ms
socket.io-client:manager open +6ms
socket.io-client:manager cleanup +0ms
socket.io-client:socket transport is open - connecting +0ms
socket.io-client:manager writing packet {"type":0,"nsp":"/"} +1ms
socket.io-parser encoding packet {"type":0,"nsp":"/"} +0ms
socket.io-parser encoded {"type":0,"nsp":"/"} as 0 +0ms
socket.io-parser decoded 0{"sid":"emVyzJPFYLlVMB7YAAAD"} as {"type":0,"nsp":"/","data":{"sid":"emVyzJPFYLlVMB7YAAAD"}} +2ms
socket.io-client:socket socket connected with id emVyzJPFYLlVMB7YAAAD +2ms
```

## In the browser

### In the Network Monitor of your browser

In most cases, you should see something like this:

![Network monitor upon success](/images/network-monitor.png)

1. the Engine.IO handshake (contains the session ID — here, `zBjrh...AAAK` — that is used in subsequent requests)
2. the Socket.IO handshake request (contains the value of the `auth` option)
3. the Socket.IO handshake response (contains the [Socket#id](/docs/v3/server-socket-instance/#Socket-id))
4. the WebSocket connection
5. the first HTTP long-polling request, which is closed once the WebSocket connection is established

Common errors:

- `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ...`

This probably means that you have to enable [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS) on the server-side. Please see the documentation [here](/docs/v3/handling-cors/).

- HTTP 400 Bad Request: "Session ID unknown"

This probably means that you have to enable sticky session. Please see the documentation [here](/docs/v3/using-multiple-nodes/).

- HTTP 400 Bad Request: "Unsupported protocol version"

In that case, it seems you are trying to reach a Socket.IO v3 server with a v2 client.

You can either upgrade your client, or use the compatibility mode of the server:

```js
const io = require("socket.io")({
  allowEIO3: true // false by default
});
```

More information [here](/docs/v3/migrating-from-2-x-to-3-0/).
