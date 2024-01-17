---
title: Socket.IO with WebTransport
---

# Socket.IO with WebTransport

Support for WebTransport has been added in version [4.7.0](/docs/v4/changelog/4.7.0) (June 2023).

:::info

In short, WebTransport is an alternative to WebSocket which fixes several performance issues that plague WebSockets like [head-of-line blocking](https://en.wikipedia.org/wiki/Head-of-line_blocking).

If you want more information about this new web API, please check:

- https://w3c.github.io/webtransport/
- https://developer.mozilla.org/en-US/docs/Web/API/WebTransport
- https://developer.chrome.com/articles/webtransport/

:::

In this guide, we will create a Socket.IO server that accepts WebTransport connections.

Here we go!

## Requirements

Please use at least Node.js 18 (the [current LTS version](https://github.com/nodejs/Release#release-schedule) at the time of writing).

## SSL certificate

First, let's create a new directory for our project:

```
mkdir webtransport-sample-project && cd webtransport-sample-project
```

WebTransport only works in secure contexts (HTTPS), so we will need an SSL certificate.

You can run the following command to issue a new certificate:

```shell
openssl req -new -x509 -nodes \
    -out cert.pem \
    -keyout key.pem \
    -newkey ec \
    -pkeyopt ec_paramgen_curve:prime256v1 \
    -subj '/CN=127.0.0.1' \
    -days 14
```

Reference: https://www.openssl.org/docs/man3.1/man1/openssl-req.html

This will generate a private key and a certificate which comply with the requirements listed [here](https://w3c.github.io/webtransport/#web-transport-configuration): 

- the total length of the validity period MUST NOT exceed two weeks
- the exact list of allowed public key algorithms [...] MUST include ECDSA with the secp256r1 (NIST P-256) named group

OK, so you should now have:

```
.
├── cert.pem
└── key.pem
```

## Basic HTTPS server

Then, let's create a basic Node.js HTTPS server:

```json title="package.json"
{
  "name": "webtransport-sample-project",
  "version": "0.0.1",
  "description": "Socket.IO with WebTransport",
  "private": true,
  "type": "module"
}
```

```js title="index.js"
import { readFile } from "node:fs/promises";
import { createServer } from "node:https";

const key = await readFile("./key.pem");
const cert = await readFile("./cert.pem");

const httpsServer = createServer({
  key,
  cert
}, async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    const content = await readFile("./index.html");
    res.writeHead(200, {
      "content-type": "text/html"
    });
    res.write(content);
    res.end();
  } else {
    res.writeHead(404).end();
  }
});

const port = process.env.PORT || 3000;

httpsServer.listen(port, () => {
  console.log(`server listening at https://localhost:${port}`);
});
```

```html title="index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Socket.IO WebTransport example</title>
  </head>
  <body>
    Hello world!
  </body>
</html>
```

Nothing fancy here, we just serve the content of the `index.html` file at `/`, and return an HTTP 404 error code otherwise.

Reference: https://nodejs.org/api/https.html

You can start the server by running `node index.js`:

```
$ node index.js
server listening at https://localhost:3000
```

Now, let's open a new browser window:

```shell title="open_browser.sh"
#!/bin/bash
HASH=`openssl x509 -pubkey -noout -in cert.pem |
    openssl pkey -pubin -outform der |
    openssl dgst -sha256 -binary |
    base64`

chromium \
    --ignore-certificate-errors-spki-list=$HASH \
    https://localhost:3000
```

The `--ignore-certificate-errors-spki-list` flag tells Chromium to accept our self-signed certificate without complaining:

![Hello world displayed in the browser](/images/webtransport-example-1.png)

Our SSL certificate is indeed deemed valid:

![Browser indicating that our certificate is valid](/images/webtransport-example-2.png)

Great! You should now have:

```
.
├── cert.pem
├── index.html
├── index.js
├── key.pem
├── open_browser.sh
└── package.json
```

## Socket.IO server

Now, let's install the `socket.io` package:

```
npm i socket.io
```

We now create a Socket.IO server and attach it to our existing HTTPS server:

```js title="index.js"
import { readFile } from "node:fs/promises";
import { createServer } from "node:https";
// highlight-next-line
import { Server } from "socket.io";

const key = await readFile("./key.pem");
const cert = await readFile("./cert.pem");

const httpsServer = createServer({
  key,
  cert
}, async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    const content = await readFile("./index.html");
    res.writeHead(200, {
      "content-type": "text/html"
    });
    res.write(content);
    res.end();
  } else {
    res.writeHead(404).end();
  }
});

const port = process.env.PORT || 3000;

httpsServer.listen(port, () => {
  console.log(`server listening at https://localhost:${port}`);
});

// highlight-start
const io = new Server(httpsServer);

io.on("connection", (socket) => {
  console.log(`connected with transport ${socket.conn.transport.name}`);

  socket.conn.on("upgrade", (transport) => {
    console.log(`transport upgraded to ${transport.name}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`disconnected due to ${reason}`);
  });
});
// highlight-end
```

Let's update the client accordingly:

```html title="index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Socket.IO WebTransport example</title>
  </head>
  <body>
    // highlight-start
    <p>Status: <span id="status">Disconnected</span></p>
    <p>Transport: <span id="transport">N/A</span></p>

    <script src="/socket.io/socket.io.js"></script>
    <script>
      const $status = document.getElementById("status");
      const $transport = document.getElementById("transport");

      const socket = io();

      socket.on("connect", () => {
        console.log(`connected with transport ${socket.io.engine.transport.name}`);

        $status.innerText = "Connected";
        $transport.innerText = socket.io.engine.transport.name;

        socket.io.engine.on("upgrade", (transport) => {
          console.log(`transport upgraded to ${transport.name}`);

          $transport.innerText = transport.name;
        });
      });

      socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });

      socket.on("disconnect", (reason) => {
        console.log(`disconnect due to ${reason}`);

        $status.innerText = "Disconnected";
        $transport.innerText = "N/A";
      });
    </script>
    // highlight-end
  </body>
</html>
```

A few explanations:

- client bundle

```html
<script src="/socket.io/socket.io.js"></script>
```

The Socket.IO client bundle is served by the server at `/socket.io/socket.io.js`.

We could also have used the minified bundle (`/socket.io/socket.io.min.js`, without debug logs) or a CDN (for example https://cdn.socket.io/4.7.2/socket.io.min.js).

- transport

```js
socket.on("connect", () => {
  console.log(`connected with transport ${socket.io.engine.transport.name}`);
  // ...
});
```

In the Socket.IO jargon, a Transport is a way to establish a connection between a client and a server. Since version 4.7.0, there are now 3 available transports:

- HTTP long-polling
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport)

By default, the Socket.IO client will always try HTTP long-polling first, since it is the transport which is the most likely to successfully establish a connection. It will then quietly upgrade to more performant transports, like WebSocket or WebTransport.

More about this upgrade mechanism [here](/docs/v4/how-it-works/).

OK, so let's restart our server. You should now see:

![Browser indicating that the connection is established with WebSocket](/images/webtransport-example-3.png)

So far, so good.

## WebTransport

On the client side, WebTransport is currently available in all major browsers but Safari: https://caniuse.com/webtransport

On the server side, until support for WebTransport lands [in Node.js](https://github.com/nodejs/node/issues/38478) (and [in Deno](https://github.com/denoland/deno/issues/1558)), we can use the `@fails-components/webtransport` package maintained by [Marten Richter](https://github.com/martenrichter).

```
npm i @fails-components/webtransport @fails-components/webtransport-transport-http3-quiche
```

Source: https://github.com/fails-components/webtransport

Let's create an HTTP/3 server and forward the WebTransport sessions to the Socket.IO server: 

```js title="index.js"
import { readFile } from "node:fs/promises";
import { createServer } from "node:https";
import { Server } from "socket.io";
// highlight-next-line
import { Http3Server } from "@fails-components/webtransport";

const key = await readFile("./key.pem");
const cert = await readFile("./cert.pem");

const httpsServer = createServer({
  key,
  cert
}, async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    const content = await readFile("./index.html");
    res.writeHead(200, {
      "content-type": "text/html"
    });
    res.write(content);
    res.end();
  } else {
    res.writeHead(404).end();
  }
});

const port = process.env.PORT || 3000;

httpsServer.listen(port, () => {
  console.log(`server listening at https://localhost:${port}`);
});

// highlight-start
const io = new Server(httpsServer, {
  transports: ["polling", "websocket", "webtransport"]
});
// highlight-end

io.on("connection", (socket) => {
  console.log(`connected with transport ${socket.conn.transport.name}`);

  socket.conn.on("upgrade", (transport) => {
    console.log(`transport upgraded to ${transport.name}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`disconnected due to ${reason}`);
  });
});

// highlight-start
const h3Server = new Http3Server({
  port,
  host: "0.0.0.0",
  secret: "changeit",
  cert,
  privKey: key,
});

(async () => {
  const stream = await h3Server.sessionStream("/socket.io/");
  const sessionReader = stream.getReader();

  while (true) {
    const { done, value } = await sessionReader.read();
    if (done) {
      break;
    }
    io.engine.onWebTransportSession(value);
  }
})();

h3Server.startServer();
// highlight-end
```

This should have been sufficient, but there is an error in the browser nonetheless:

![Browser indicating an error with WebTransport](/images/webtransport-example-4.png)

:::tip

If someone has any clue about this, please ping us.

:::

:::note

Even if WebTransport fails (which might also happen if something between the client and the server blocks the connection), the connection is successfully established with WebSocket. 

:::

A quick workaround is to use `127.0.0.1` instead of `localhost`:

```html title="index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Socket.IO WebTransport example</title>
  </head>
  <body>
    <p>Status: <span id="status">Disconnected</span></p>
    <p>Transport: <span id="transport">N/A</span></p>

    <script src="/socket.io/socket.io.js"></script>
    <script>
      const $status = document.getElementById("status");
      const $transport = document.getElementById("transport");

      // highlight-start
      const socket = io({
        transportOptions: {
          webtransport: {
            hostname: "127.0.0.1"
          }
        }
      });
      // highlight-end

      socket.on("connect", () => {
        console.log(`connected with transport ${socket.io.engine.transport.name}`);

        $status.innerText = "Connected";
        $transport.innerText = socket.io.engine.transport.name;

        socket.io.engine.on("upgrade", (transport) => {
          console.log(`transport upgraded to ${transport.name}`);

          $transport.innerText = transport.name;
        });
      });

      socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });

      socket.on("disconnect", (reason) => {
        console.log(`disconnect due to ${reason}`);

        $status.innerText = "Disconnected";
        $transport.innerText = "N/A";
      });
    </script>
  </body>
</html>
```

```shell title="open_browser.sh"
#!/bin/bash
HASH=`openssl x509 -pubkey -noout -in cert.pem |
    openssl pkey -pubin -outform der |
    openssl dgst -sha256 -binary |
    base64`

chromium \
    --ignore-certificate-errors-spki-list=$HASH \
# highlight-next-line
    --origin-to-force-quic-on=127.0.0.1:3000 \
    https://localhost:3000
```

And *voilà!*

![Browser indicating that the connection is established with WebTransport](/images/webtransport-example-5.png)

## Conclusion

Like WebSocket more than 10 years ago (!), Socket.IO now allows you to benefit from the performance improvements brought by WebTransport, **without worrying about browser compatibility**.

Thanks for reading!
