title: Handling CORS
permalink: /docs/v2/handling-cors/
release: v2
type: docs
order: 206
---

## Configuration

As of Socket.IO v2, the server will automatically add the necessary headers in order to support [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS)

The `origins` option should be used to provide a list of authorized domains:

```js
const io = require("socket.io")(httpServer, {
  origins: ["https://example.com"]
});
```

Please note that by default, **ALL** domains are authorized. You should explicitly allow/disallow cross-origin requests in order to keep your application secure:

- without CORS (server and client are served from the same domain):

```js
io.origins((req, callback) => {
  callback(null, req.headers.origin === undefined); // cross-origin requests will not be allowed
});
```

- with CORS (server and client are served from distinct domains):

```js
io.origins(["http://localhost:3000"]); // for local development
io.origins(["https://example.com"]);
```

The `handlePreflightRequest` option can be used to customize the `Access-Control-Allow-xxx` headers sent in response to the preflight request.

Example with cookies ([withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)) and additional headers:

```js
// server-side
const io = require("socket.io")(httpServer, {
  origins: ["https://example.com"],

  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "https://example.com",
      "Access-Control-Allow-Methods": "GET,POST",
      "Access-Control-Allow-Headers": "my-custom-header",
      "Access-Control-Allow-Credentials": true
    });
    res.end();
  }
});

// client-side
const io = require("socket.io-client");
const socket = io("https://api.example.com", {
  withCredentials: true,
  transportOptions: {
    polling: {
      extraHeaders: {
        "my-custom-header": "abcd"
      }
    }
  }
});
```

## Troubleshooting

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at xxx/socket.io/?EIO=3&transport=polling&t=NMnp2WI. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing).
```

If you have properly configured your server (see [above](#Configuration)), this could mean that your browser wasn't able to reach the Socket.IO server.

The following command:

```
curl "https://api.example.com/socket.io/?EIO=3&transport=polling"
```

should return something like:

```
96:0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":5000}
```

If that's not the case, please check that your server is listening and is actually reachable on the given port.
