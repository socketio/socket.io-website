---
title: 处理 CORS
sidebar_position: 8
slug: /handling-cors/
---

## 配置 {#configuration}

从 Socket.IO v3 开始，您需要显式启用[跨域资源共享](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)(CORS)。

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

所有选项都将转发到[cors](https://www.npmjs.com/package/cors)包。可以在[此处](https://github.com/expressjs/cors#configuration-options)找到完整的选项列表。

带有 cookie ( [withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)) 和附加标头的示例：

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

注意：如果您的 Web 应用程序和服务器不是从同一个端口提供服务，这也适用于 localhost

```js
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:8080"
  }
});

httpServer.listen(3000);
```

您可以使用以下选项禁止所有跨域请求[`allowRequest`](../../server-options.md#allowrequest) option:

```js
const io = new Server(httpServer, {
  allowRequest: (req, callback) => {
    const noOriginHeader = req.headers.origin === undefined;
    callback(null, noOriginHeader);
  }
});
```

## 故障排除 {#troubleshooting}

### 缺少 CORS 标头“Access-Control-Allow-Origin” {#cors-header-access-control-allow-origin-missing}

完整的错误信息：

> <i>跨域请求被阻止：同源策略不允许读取位于 .../socket.io/?EIO=4&transport=polling&t=NMnp2WI 的远程资源。（原因：缺少 CORS 标头“Access-Control-Allow-Origin”）。</i>

如果您已正确配置您的服务器（见[上文](#configuration)），这可能意味着您的浏览器无法访问 Socket.IO 服务器。

以下命令：

```
curl "https://api.example.com/socket.io/?EIO=4&transport=polling"
```

应该返回类似：

```
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000}
```

如果不是这种情况，请检查您的服务器是否正在侦听并且实际上可以在给定端口上访问。

### 如果 CORS 标头“Access-Control-Allow-Origin”为“*”，则不支持凭据 {#credential-is-not-supported-if-the-cors-header-access-control-allow-origin-is-}

完整的错误信息：

> <i>跨域请求被阻止：同源策略不允许读取位于“.../socket.io/?EIO=4&transport=polling&t=NvQfU77”的远程资源。（原因：如果 CORS 标头“Access-Control-Allow-Origin”为“*”，则不支持凭证）</i>

您不能同时设置[`withCredentials`](../../client-options.md#withcredentials) 为 `true` 和 `origin: *`，您需要使用特定的来源：

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

### CORS 标头“Access-Control-Allow-Credentials”中预期为“true” {#expected-true-in-cors-header-access-control-allow-credentials}

完整的错误信息：

> <i>跨域请求被阻止：同源策略不允许读取位于 .../socket.io/?EIO=4&transport=polling&t=NvQny19 的远程资源。（原因：CORS 标头“Access-Control-Allow-Credentials”中预期为“true”）</i>

在这种情况下，在客户端上[`withCredentials`](../../client-options.md#withcredentials)设置为`true`，但服务器缺少选项`credentials`中的属性[`cors`](../../server-options.md#cors) 。请参见上面的示例。
