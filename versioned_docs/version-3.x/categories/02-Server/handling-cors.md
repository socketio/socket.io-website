---
title: Handling CORS
sidebar_position: 8
slug: /handling-cors/
---

## Configuration

Since Socket.IO v3, you need to explicitly enable [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS).

```js
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "https://example.com",
    methods: ["GET", "POST"]
  }
});
```

All options will be forwarded to the [cors](https://www.npmjs.com/package/cors) package. The complete list of options can be found [here](https://github.com/expressjs/cors#configuration-options).

Example with cookies ([withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)) and additional headers:

```js
// server-side
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "https://example.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// client-side
const io = require("socket.io-client");
const socket = io("https://api.example.com", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});
```

Note: this also applies to localhost if your web application and your server are not served from the same port

```js
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

httpServer.listen(3000);
```

You can disallow all cross-origin requests with the [`allowRequest`](/docs/v3/server-initialization/#allowRequest) option:

```js
const io = require("socket.io")(httpServer, {
  allowRequest: (req, callback) => {
    const noOriginHeader = req.headers.origin === undefined;
    callback(null, noOriginHeader);
  }
});
```

## Troubleshooting

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at xxx/socket.io/?EIO=4&transport=polling&t=NMnp2WI. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing).
```

If you have properly configured your server (see [above](#Configuration)), this could mean that your browser wasn't able to reach the Socket.IO server.

The following command:

```
curl "https://api.example.com/socket.io/?EIO=4&transport=polling"
```

should return something like:

```
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":5000}
```

If that's not the case, please check that your server is listening and is actually reachable on the given port.
