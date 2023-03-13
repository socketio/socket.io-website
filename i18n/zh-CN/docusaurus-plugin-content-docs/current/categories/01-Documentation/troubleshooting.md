---
title: 解决连接问题
sidebar_label: 故障排除
sidebar_position: 7
slug: /troubleshooting-connection-issues/
---

常见/已知问题：

- [socket 无法连接](#problem-the-socket-is-not-able-to-connect)
- [socket 断开连接](#problem-the-socket-gets-disconnected)
- [socket 卡在 HTTP 长轮询中](#problem-the-socket-is-stuck-in-http-long-polling)

### 问题：socket无法连接 {#problem-the-socket-is-not-able-to-connect}

可能的解释：

- [您正在尝试访问普通的 WebSocket 服务器](#you-are-trying-to-reach-a-plain-websocket-server)
- [服务器无法访问](#the-server-is-not-reachable)
- [客户端与服务器版本不兼容](#the-client-is-not-compatible-with-the-version-of-the-server)
- [服务器未发送必要的 CORS 标头](#the-server-does-not-send-the-necessary-cors-headers)
- [您没有启用粘性会话（在多服务器设置中）](#you-didnt-enable-sticky-sessions-in-a-multi-server-setup)

#### 您正在尝试访问普通的 WebSocket 服务器 {#you-are-trying-to-reach-a-plain-websocket-server}

如["Socket.IO 不是什么"](index.md#what-socketio-is-not)部分所述，Socket.IO 客户端不是 WebSocket 实现，因此无法与 WebSocket 服务器建立连接，即使`transports: ["websocket"]`：

```js
const socket = io("ws://echo.websocket.org", {
  transports: ["websocket"]
});
```

#### 服务器无法访问 {#the-server-is-not-reachable}

请确保 Socket.IO 服务器实际上可以通过给定的 URL 访问。您可以使用以下方法对其进行测试：

```
curl "<the server URL>/socket.io/?EIO=4&transport=polling"
```

它应该返回如下内容：

```
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000}
```

如果不是这种情况，请检查 Socket.IO 服务器是否正在运行，并且两者之间没有任何东西阻止连接。

#### 客户端与服务器版本不兼容 {#the-client-is-not-compatible-with-the-version-of-the-server}

这是[JS 客户端](https://github.com/socketio/socket.io-client/)的兼容性表：

<table>
    <tr>
        <th rowspan="2">JS 客户端版本</th>
        <th colspan="4">Socket.IO 服务器版本</th>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>YES</b></td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">3.x</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b></td>
    </tr>
    <tr>
        <td align="center">4.x</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b></td>
    </tr>
</table>

[1] 使用[allowEIO3: true](../../server-options.md#alloweio3)

以下是[Java 客户端](https://github.com/socketio/socket.io-client-java/)的兼容性表：

<table>
    <tr>
        <th rowspan="2">Java 客户端版本</th>
        <th colspan="3">Socket.IO 服务器版本</th>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">NO</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b></td>
    </tr>
</table>

[1] 使用[allowEIO3: true](../../server-options.md#alloweio3)

这是[Swift 客户端](https://github.com/socketio/socket.io-client-swift/)的兼容性表：

<table>
    <tr>
        <th rowspan="2">Swift 客户端版本</th>
        <th colspan="3">Socket.IO 服务器版本</th>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">v15.x</td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b><sup>1</sup></td>
        <td align="center"><b>YES</b><sup>2</sup></td>
    </tr>
    <tr>
        <td align="center">v16.x</td>
        <td align="center"><b>YES</b><sup>3</sup></td>
        <td align="center"><b>YES</b></td>
        <td align="center"><b>YES</b></td>
    </tr>
</table>

[1] 使用 [allowEIO3: true](../../server-options.md#alloweio3)（服务器）和`.connectParams(["EIO": "3"])`（客户端）：

```swift
SocketManager(socketURL: URL(string:"http://localhost:8087/")!, config: [.connectParams(["EIO": "3"])])
```

[2] 使用 [allowEIO3: true](../../server-options.md#alloweio3)（服务器）

[3] 使用 `.version(.two)`（客户端）：

```swift
SocketManager(socketURL: URL(string:"http://localhost:8087/")!, config: [.version(.two)])
```

#### 服务器未发送必要的 CORS 标头 {#the-server-does-not-send-the-necessary-cors-headers}

如果您在控制台中看到以下错误：

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ...
```

大概意思是：

- 要么你实际上没有到达 Socket.IO 服务器（见[上文](#the-server-is-not-reachable)）
- 或者您没有在服务器端启用[跨域资源共享(CORS)。](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

请在[此处](../02-Server/handling-cors.md)查看文档。

#### 您没有启用粘性会话（在多服务器设置中） {#you-didnt-enable-sticky-sessions-in-a-multi-server-setup}

当扩展到多个 Socket.IO 服务器时，您需要确保给定 Socket.IO 会话的所有请求都到达同一个 Socket.IO 服务器。解释可以在[这里](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required)找到。

否则将导致 HTTP 400 响应代码：`{"code":1,"message":"Session ID unknown"}`

请在[此处](../02-Server/using-multiple-nodes.md)查看文档。

### 问题: socket 断开连接 {#problem-the-socket-gets-disconnected}

首先，请注意，即使在稳定的 Internet 连接上，断开连接也很常见并且是意料之中的：

- 用户和 Socket.IO 服务器之间的任何事情都可能遇到临时故障或重新启动
- 作为自动缩放策略的一部分，服务器本身可能会被终止
- 如果使用移动浏览器，用户可能会失去连接或从 WiFi 切换到 4G
- 浏览器本身可能会冻结非活动选项卡

[话虽如此，除非另有明确说明，否则](../../client-options.md#reconnection)Socket.IO 客户端将始终尝试重新连接。

断开连接的可能解释：

- [浏览器选项卡最小化，心跳失败](#the-browser-tab-was-minimized-and-heartbeat-has-failed)
- [客户端与服务器版本不兼容](#the-client-is-not-compatible-with-the-version-of-the-server-1)
- [你正试图发送一个巨大的有效载荷](#you-are-trying-to-send-a-huge-payload)

#### 浏览器选项卡最小化，心跳失败 {#the-browser-tab-was-minimized-and-heartbeat-has-failed}

当浏览器选项卡不在焦点上时，某些浏览器（如[Chrome](https://developer.chrome.com/blog/timer-throttling-in-chrome-88/#intensive-throttling)）会限制 JavaScript 计时器，这可能会通过Socket.IO v2 中的 ping 超时导致断开连接，因为心跳机制依赖于`setTimeout`客户端的功能。

作为一种解决方法，您可以增加`pingTimeout`服务器端的值：

```js
const io = new Server({
  pingTimeout: 60000
});
```

请注意，升级到 Socket.IO v4（至少`socket.io-client@4.1.3`，由于[这个](https://github.com/socketio/engine.io-client/commit/f30a10b7f45517fcb3abd02511c58a89e0ef498f)原因）应该可以防止此类问题，因为心跳机制已被反转（服务器现在发送 PING 数据包）。

#### 客户端与服务器版本不兼容 {#the-client-is-not-compatible-with-the-version-of-the-server-1}

由于通过 WebSocket 传输发送的数据包格式在 v2 和 v3/v4 中相似，因此您可能能够连接不兼容的客户端（见[上文](#the-client-is-not-compatible-with-the-version-of-the-server)），但连接最终会在给定延迟后关闭。

因此，如果您在 30 秒后遇到定期断开连接（这是Socket.IO v2 中[pingTimeout](../../server-options.md#pingtimeout) 和 [pingInterval](../../server-options.md#pinginterval)值的总和），这肯定是由于版本不兼容。

#### 你正试图发送一个巨大的有效载荷 {#you-are-trying-to-send-a-huge-payload}

如果您在发送大量有效负载时断开连接，这可能意味着您已达到[`maxHttpBufferSize`](../../server-options.md#maxhttpbuffersize)默认值为 1 MB 的值。请根据您的需要进行调整：

```js
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: 1e8
});
```

上传时间超过[`pingTimeout`](../../server-options.md#pingtimeout)选项值的巨大负载也可能触发断开连接（因为在上传期间[heartbeat mechanism](../01-Documentation/how-it-works.md#disconnection-detection)失败）。请根据您的需要进行调整：

```js
const io = require("socket.io")(httpServer, {
  pingTimeout: 60000
});
```

### 问题: socket 卡在 HTTP 长轮询中 {#problem-the-socket-is-stuck-in-http-long-polling}

在大多数情况下，您应该会看到如下内容：

![Network monitor upon success](/images/network-monitor.png)

1. Engine.IO 握手（包含会话 ID — 此处 `zBjrh...AAAK` — 用于后续请求）
2. tSocket.IO 握手请求（包含`auth`选项的值）
3. Socket.IO 握手响应（包含[Socket#id](../02-Server/server-socket-instance.md#socketid)）
4. WebSocket 连接
5. 第一个 HTTP 长轮询请求，一旦建立 WebSocket 连接就关闭

如果您没有看到第四个请求的[HTTP 101 Switching Protocols](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/101)响应，这意味着服务器和浏览器之间的某些东西阻止了 WebSocket 连接。

请注意，这不一定是阻塞的，因为连接仍然是通过 HTTP 长轮询建立的，但效率较低。

您可以通过以下方式获取当前传输的名称：

**客户端**

```js
socket.on("connect", () => {
  const transport = socket.io.engine.transport.name; // 在大多数情况下, "polling"

  socket.io.engine.on("upgrade", () => {
    const upgradedTransport = socket.io.engine.transport.name; // 在大多数情况下, "websocket"
  });
});
```

**服务器**

```js
io.on("connection", (socket) => {
  const transport = socket.conn.transport.name; // 在大多数情况下, "polling"

  socket.conn.on("upgrade", () => {
    const upgradedTransport = socket.conn.transport.name; // 在大多数情况下, "websocket"
  });
});
```

可能的解释：

- [服务器前面的代理不接受 WebSocket 连接](#a-proxy-in-front-of-your-servers-does-not-accept-the-WebSocket-connection)

#### 服务器前面的代理不接受 WebSocket 连接 {#a-proxy-in-front-of-your-servers-does-not-accept-the-websocket-connection}

请在[此处](../02-Server/behind-a-reverse-proxy.md)查看文档。
