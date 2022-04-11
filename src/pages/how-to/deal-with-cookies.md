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

Please check [this example](/how-to/use-with-express-session#2nd-use-case-socketio-can-also-create-the-session-context) with `express-session` for reference.

:::

## Node.js client and cookies

The Node.js client uses the [`xmlhttprequest-ssl`](https://github.com/mjwwit/node-XMLHttpRequest) package, which provides an API similar to the [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) objects in the browser.

The package does not provide a way to store the cookies sent by the server, but you can manually parse them:

```js
import { io } from "socket.io-client";
import { parse } from "cookie";

const socket = io("https://my-domain.com");
const COOKIE_NAME = "AWSALB";

socket.io.on("open", () => {
  socket.io.engine.transport.on("pollComplete", () => {
    const request = socket.io.engine.transport.pollXhr.xhr;
    const cookieHeader = request.getResponseHeader("set-cookie");
    if (!cookieHeader) {
      return;
    }
    cookieHeader.forEach(cookieString => {
      if (cookieString.includes(`${COOKIE_NAME}=`)) {
        const cookie = parse(cookieString);
        socket.io.opts.extraHeaders = {
          cookie: `${COOKIE_NAME}=${cookie[COOKIE_NAME]}`
        }
      }
    });
  });
});
```

This might be useful if you want to load test your Socket.IO servers running behind an AWS Application Load Balancer.

Reference: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html
