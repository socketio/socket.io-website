---
title: How to deal with cookies
---

# How to deal with cookies

## Cookie-based sticky session

When using the [`cookie`](/docs/v4/server-options/#cookie) option, the server will send a cookie upon handshake (the first HTTP request of the session), with the value of the Engine.IO session ID.

```js
const io = new Server(httpServer, {
  cookie: true
});

// is similar to

const io = new Server(httpServer, {
  cookie: {
    name: "io",
    path: "/",
    httpOnly: true,
    sameSite: "lax"
  }
});
```

You can test it with a `curl`:

```
$ curl "https://mydomain.com/socket.io/?EIO=4&transport=polling" -v
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
< Content-Length: 97
< Set-Cookie: io=G4J3Ci0cNDWd_Fz-AAAC; Path=/; HttpOnly; SameSite=Lax
<
0{"sid":"G4J3Ci0cNDWd_Fz-AAAC","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000}
```

Available options (from the [`cookie`](https://github.com/jshttp/cookie/) package):

- domain
- encode
- expires
- httpOnly
- maxAge
- path
- sameSite
- secure

This cookie can then be used for cookie-based sticky session, when scaling to multiple nodes (example with HAProxy [here](/docs/v4/using-multiple-nodes/#haproxy-configuration)).

## Application cookies

You can also customize the headers sent by the server:

```js
import { serialize, parse } from "cookie";

// called during the handshake
io.engine.on("initial_headers", (headers, request) => {
  headers["set-cookie"] = serialize("uid", "1234", { sameSite: "strict" });
});

// called for each HTTP request (including the WebSocket upgrade)
io.engine.on("headers", (headers, request) => {
  if (!request.headers.cookie) return;
  const cookies = parse(request.headers.cookie);
  if (!cookies.randomId) {
    headers["set-cookie"] = serialize("randomId", "abc", { maxAge: 86400 });
  }
});
```

:::caution

Please note that event emitters are synchronous:

```js
io.engine.on("initial_headers", async (headers, request) => {
  // WARNING! this won't work
  const session = await fetchSession(request);
  headers["set-cookie"] = serialize("sid", session.id, { sameSite: "strict" });
});
```

If you need to do some async operations, you will need to use the [`allowRequest`](/docs/v4/server-options/#allowrequest) option.

Please check [this example](/how-to/use-with-express-session) with `express-session` for reference.

:::

## Node.js client and cookies

Starting with version `4.7.0`, when setting the `withCredentials` option to `true`, the Node.js client will now include the cookies in the HTTP requests, making it easier to use it with cookie-based sticky sessions.
