---
title: Handling CORS
sidebar_position: 8
slug: /handling-cors/
---

## What is CORS?

Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS

Cross-Origin Resource Sharing (CORS) is a security feature enforced by web browsers that controls how resources can be
fetched from a different origin than the one where the web application is running. An "origin" is defined by the
combination of a scheme (like `https://`), a domain and a port:

- The origin `https://example.com` is different from `http://example.com` because the protocols differ.
- The origin `https://api.example.com` is different from `https://example.com` because the domains differ.
- The origin `https://example.com:8080` is different from `https://example.com` because the ports differ.

By default, browsers block requests made by JavaScript running in one origin to resources hosted in another origin,
unless the server explicitly allows it. This restriction is designed to prevent malicious scripts from accessing
sensitive data from other sites.

For example, let's say a user of your website `https://good-domain.com` is directed to the website
`https://bad-domain.com` by clicking on a fraudulent email link. Thanks to CORS, the browser of your user will block any
request from reaching your website `https://good-domain.com`, ensuring that any malicious script at
`https://bad-domain.com` cannot extract data or perform actions on your website on behalf of your user.

However, there are common cases where you want to actually allow cross-origin requests, for example:

- if your backend is hosted on a different subdomain (e.g. frontend at `https://example.com` and backend at `https://api.example.com`)
- for local development (e.g. frontend at `http://localhost:3000` and backend at `http://localhost:8080`)

The [`cors`](../../server-options.md#cors) option covers these use cases, see [below](#configuration).

:::caution

Two important caveats:

- CORS only applies to browsers

Even with proper CORS setup, an attacker can still run a script on his machine or on a VM and reach your website. Native applications are not covered either.

- CORS only applies to HTTP long-polling

WebSocket connections are not subject to CORS restrictions.

If you want to restrict who can actually reach your website, you can use the [`allowRequest`](../../server-options.md#allowrequest) option.

:::

## Configuration

Since Socket.IO v3, you need to explicitly enable [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS).

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com"]
  }
});
```

Available options:

| Option                 | Description                                                                                                                                                                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `origin`               | Configures the **Access-Control-Allow-Origin** CORS header.                                                                                                                                                                                                                                                        |
| `methods`              | Configures the **Access-Control-Allow-Methods** CORS header. Expects a comma-delimited string (ex: 'GET,PUT,POST') or an array (ex: `['GET', 'PUT', 'POST']`).                                                                                                                                                     |
| `allowedHeaders`       | Configures the **Access-Control-Allow-Headers** CORS header. Expects a comma-delimited string (ex: 'Content-Type,Authorization') or an array (ex: `['Content-Type', 'Authorization']`). If not specified, defaults to reflecting the headers specified in the request's **Access-Control-Request-Headers** header. |
| `exposedHeaders`       | Configures the **Access-Control-Expose-Headers** CORS header. Expects a comma-delimited string (ex: 'Content-Range,X-Content-Range') or an array (ex: `['Content-Range', 'X-Content-Range']`). If not specified, no custom headers are exposed.                                                                    |
| `credentials`          | Configures the **Access-Control-Allow-Credentials** CORS header. Set to `true` to pass the header, otherwise it is omitted.                                                                                                                                                                                        |
| `maxAge`               | Configures the **Access-Control-Max-Age** CORS header. Set to an integer to pass the header, otherwise it is omitted.                                                                                                                                                                                              |
| `preflightContinue`    | Pass the CORS preflight response to the next handler.                                                                                                                                                                                                                                                              |
| `optionsSuccessStatus` | Provides a status code to use for successful `OPTIONS` requests, since some legacy browsers (IE11, various SmartTVs) choke on `204`.                                                                                                                                                                               |

Possible values for the `origin` option:

- `Boolean` - set `origin` to `true` to reflect the [request origin](http://tools.ietf.org/html/draft-abarth-origin-09), as defined by `req.header('Origin')`, or set it to `false` to disable CORS.
- `String` - set `origin` to a specific origin. For example if you set it to `"http://example.com"` only requests from "http://example.com" will be allowed.
- `RegExp` - set `origin` to a regular expression pattern which will be used to test the request origin. If it's a match, the request origin will be reflected. For example the pattern `/example\.com$/` will reflect any request that is coming from an origin ending with "example.com".
- `Array` - set `origin` to an array of valid origins. Each origin can be a `String` or a `RegExp`. For example `["http://example1.com", /\.example2\.com$/]` will accept any request from "http://example1.com" or from a subdomain of "example2.com".
- `Function` - set `origin` to a function implementing some custom logic. The function takes the request origin as the first parameter and a callback (which expects the signature `err [object], allow [bool]`) as the second.

Example with cookies ([withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)) and additional headers:

```js
// server-side
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com"],
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
    origin: ["http://localhost:8080"]
  }
});

httpServer.listen(3000);
```

You can disallow all cross-origin requests with the [`allowRequest`](../../server-options.md#allowrequest) option:

```js
const io = new Server(httpServer, {
  allowRequest: (req, callback) => {
    const noOriginHeader = req.headers.origin === undefined;
    callback(null, noOriginHeader); // only allow requests without 'origin' header
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
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}
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
    origin: ["https://my-frontend.com"],
    credentials: true
  }
});
```

### Expected ‘true’ in CORS header ‘Access-Control-Allow-Credentials’

Full error message:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at .../socket.io/?EIO=4&transport=polling&t=NvQny19. (Reason: expected ‘true’ in CORS header ‘Access-Control-Allow-Credentials’)</i>

In that case, [`withCredentials`](../../client-options.md#withcredentials) is set to `true` on the client, but the server is missing the `credentials` attribute in the [`cors`](../../server-options.md#cors) option. See the example above.
