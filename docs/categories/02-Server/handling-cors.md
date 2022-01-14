---
title: Handling CORS
sidebar_position: 8
slug: /handling-cors/
---

## Configuration

Since Socket.IO v3, you need to explicitly enable [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS).

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://example.com"
  }
});
```

All options will be forwarded to the [cors](https://www.npmjs.com/package/cors) package. The complete list of options can be found [here](https://github.com/expressjs/cors#configuration-options).

Example with cookies ([withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)) and additional headers:

```js
// server-side
const io = new Server(httpServer, {
  cors: {
    origin: "https://example.com",
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// client-side
import { io } from "socket.io-client";
const socket = io("https://api.example.com", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});
```

Note: this also applies to localhost if your web application and your server are not served from the same port

```js
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:8080"
  }
});

httpServer.listen(3000);
```

You can disallow all cross-origin requests with the [`allowRequest`](../../server-options.md#allowrequest) option:

```js
const io = new Server(httpServer, {
  allowRequest: (req, callback) => {
    const noOriginHeader = req.headers.origin === undefined;
    callback(null, noOriginHeader);
  }
});
```

## Troubleshooting

### CORS header ‘Access-Control-Allow-Origin’ missing

Full error message:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at .../socket.io/?EIO=4&transport=polling&t=NMnp2WI. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing).</i>

If you have properly configured your server (see [above](#configuration)), this could mean that your browser wasn't able to reach the Socket.IO server.

The following command:

```
curl "https://api.example.com/socket.io/?EIO=4&transport=polling"
```

should return something like:

```
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000}
```

If that's not the case, please check that your server is listening and is actually reachable on the given port.

### Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’

Full error message:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ‘.../socket.io/?EIO=4&transport=polling&t=NvQfU77’. (Reason: Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’)</i>

You can't set [`withCredentials`](../../client-options.md#withcredentials) to `true` with `origin: *`, you need to use a specific origin:

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://my-frontend.com",
    // or with an array of origins
    // origin: ["https://my-frontend.com", "https://my-other-frontend.com", "http://localhost:3000"],
    credentials: true
  }
});
```

### Expected ‘true’ in CORS header ‘Access-Control-Allow-Credentials’

Full error message:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at .../socket.io/?EIO=4&transport=polling&t=NvQny19. (Reason: expected ‘true’ in CORS header ‘Access-Control-Allow-Credentials’)</i>

In that case, [`withCredentials`](../../client-options.md#withcredentials) is set to `true` on the client, but the server is missing the `credentials` attribute in the [`cors`](../../server-options.md#cors) option. See the example above.
