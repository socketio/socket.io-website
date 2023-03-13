---
title: 记录和调试
sidebar_position: 5
slug: /logging-and-debugging/
---

Socket.IO 现在完全由 TJ Holowaychuk 开发的名为[debug](https://github.com/visionmedia/debug)的简约但功能强大的实用程序进行检测。

在 1.0 之前，Socket.IO 服务器默认将所有内容都记录到控制台。事实证明，这对于许多用户来说非常冗长（尽管对其他人非常有用），所以现在我们默认为完全静音。

基本思想是 Socket.IO 使用的每个模块都提供不同的调试范围，让您深入了解内部结构。默认情况下，所有输出都被抑制，您可以通过提供`DEBUG`env 变量 (Node.JS) 或`localStorage.debug`属性 (Browsers) 来选择查看消息。

例如，您可以在我们的主页上看到它的实际效果：

<video id="debugging-vid" data-setup='{"autoplay":true,"loop":true, "techOrder": ["html5", "flash"], "height": 300}' class="video-js vjs-default-skin" autoplay loop width="100%"><source src="https://i.cloudup.com/transcoded/IL9alTr0eO.mp4" type="video/mp4" /></video>

## 可用的调试范围 {#available-debugging-scopes}

查看可用信息的最佳方法是使用 `*`：

```
DEBUG=* node yourfile.js
```

或在浏览器中：

```
localStorage.debug = '*';
```

A然后按您感兴趣的范围进行过滤。您可以在范围前加上前缀，如果有多个，则用逗号分隔。例如，要仅在 Node.js 上查看来自 socket.io 客户端的调试语句，请尝试以下操作：`*`

```
DEBUG=socket.io:client* node yourfile.js
```

要查看来自引擎和socket.io 的所有调试消息：

```
DEBUG=engine,socket.io* node yourfile.js
```


### 从浏览器调试包中删除调试 {#removing-debug-from-your-browser-bundle}

虽然在开发过程中很有用，但调试包给最终包增加了额外的权重（大约 4KB 压缩和 gzip 压缩），这就是为什么它被排除在 slim 包之外（关于各种浏览器包的更多详细信息可以在[这里](../03-Client/client-installation.md#from-a-cdn)找到）。

I如果你使用 webpack，你可以使用[webpack-remove-debug](https://github.com/johngodley/webpack-remove-debug)删除它：

```js
{
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'webpack-remove-debug'
      }
    ]
  }
}
```

## 浏览器控制台中的错误日志 {#error-logs-in-the-browser-console}

请注意错误日志，例如：

- `net::ERR_INTERNET_DISCONNECTED`
- `net::ERR_CONNECTION_REFUSED`
- `WebSocket is already in CLOSING or CLOSED state`
- `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at xxx. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing).`
- `The connection to xxx was interrupted while the page was loading`

不是由 Socket.IO 库发出的，而是由浏览器本身发出的，因此我们无法控制。
