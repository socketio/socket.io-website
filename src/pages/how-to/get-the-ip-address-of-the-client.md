---
title: How to get the IP address of the client
---

# How to get the IP address of the client

## Direct connection

The IP address of the client can be found in the [`handshake`](/docs/v4/server-api/#sockethandshake) object:

```js
io.on("connection", (socket) => {
  const ipAddress = socket.handshake.address;

  console.log(ipAddress); // prints something like "203.0.113.195" (IPv4) or "2001:db8:85a3:8d3:1319:8a2e:370:7348" (IPv6)
});
```

## Behind a proxy

If you are behind a proxy like [nginx](https://nginx.org/en/), the `address` attribute will be the IP address of the proxy.

In that case, the IP address of the client will be found in the request headers.

### `X-Forwarded-For` header

The `X-Forwarded-For` request header was a de-facto standard header for identifying the originating IP address of a client connecting to a web server through a proxy server.

Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For

Format:

```
X-Forwarded-For: <client>, <proxy1>, <proxy2>
```

Here's how you can retrieve the IP address of the client:

```js
io.on("connection", (socket) => {
  const ipAddress = socket.handshake.headers["x-forwarded-for"].split(",")[0];

  console.log(ipAddress);
});
```

:::note

The `X-Forwarded-For` header is now deprecated (although still widely used) in favor of the standard [`Forwarded`](#forwarded-header) header.

:::

### `Forwarded` header

The `Forwarded` request header is the standard header for identifying the originating IP address of a client connecting to a web server through a proxy server.

Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Forwarded

Format:

```
Forwarded: by=<identifier>;for=<identifier>;host=<host>;proto=<http|https>
```

Here's how you can retrieve the IP address of the client:

```js
function parseHeader(header) {
  for (const directive of header.split(",")[0].split(";")) {
    if (directive.startsWith("for=")) {
      return directive.substring(4);
    }
  }
}

io.on("connection", (socket) => {
  const ipAddress = parseHeader(socket.handshake.headers["forwarded"] || "");

  console.log(ipAddress);
});
```

:::note

This `parseHeader()` method does not cover every edge case allowed by the specification. If you need a more robust method, please check the [`forwarded-parse`](https://www.npmjs.com/package/forwarded-parse) package.

:::

### CloudFlare

CloudFlare uses a specific header: `cf-connecting-ip`

Reference: https://developers.cloudflare.com/fundamentals/reference/http-request-headers/

Here's how you can retrieve the IP address of the client:

```js
io.on("connection", (socket) => {
  const ipAddress = socket.handshake.headers["cf-connecting-ip"];

  console.log(ipAddress);
});
```

### Fastly

Fastly uses a specific header: `fastly-client-ip`

Reference: https://developer.fastly.com/reference/http/http-headers/Fastly-Client-IP/

Here's how you can retrieve the IP address of the client:

```js
io.on("connection", (socket) => {
  const ipAddress = socket.handshake.headers["fastly-client-ip"];

  console.log(ipAddress);
});
```
