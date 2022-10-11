---
title: 性能优化
sidebar_position: 6
slug: /performance-tuning/
---

以下是一些提高 Socket.IO 服务器性能的技巧：

- [通过Socket.IO调节](#at-the-socketio-level)
- [通过系统调节](#at-the-os-level)

You might also be interested in [scaling to multiple nodes](../02-Server/using-multiple-nodes.md).

## 通过Socket.IO调节 {#at-the-socketio-level}

由于在大多数情况下，Socket.IO 连接将与 WebSocket 建立，因此 Socket.IO 服务器的性能将与底层 WebSocket 服务器的性能密切相关（[`ws`](https://github.com/websockets/ws)默认情况下）。

### 安装 `ws` 本机插件 {#install-ws-native-add-ons}

`ws`带有两个可选的二进制附加组件，可改进某些操作。预构建的二进制文件可用于最流行的平台，因此您不一定需要在计算机上安装 C++ 编译器。

- [bufferutil](https://www.npmjs.com/package/bufferutil): Allows to efficiently perform operations such as masking and unmasking the data payload of the WebSocket frames.
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate): Allows to efficiently check if a message contains valid UTF-8 as required by the spec.

要安装这些软件包：

```
$ npm install --save-optional bufferutil utf-8-validate
```

请注意，这些包是可选的，如果它们不可用，WebSocket 服务器将回退到 Javascript 实现。更多信息可以在[这里](https://github.com/websockets/ws/#opt-in-for-performance-and-spec-compliance)找到。

### 使用另一个 WebSocket 服务器实现 {#use-another-websocket-server-implementation}

例如，您可以使用[eiows](https://www.npmjs.com/package/eiows)包，它是（现已弃用的）[uws](https://www.npmjs.com/package/uws)包的一个分支：

```
$ npm install eiows
```

然后使用[`wsEngine`](../../server-options.md#wsengine)选项：

```js
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  wsEngine: require("eiows").Server
});
```

### 使用自定义解析器 {#use-a-custom-parser}

如果您通过 Socket.IO 连接发送二进制数据，使用[自定义解析器](custom-parser.md)（如基于[msgpack](custom-parser.md#the-msgpack-parser)的解析器）可能会很有趣，因为默认情况下，每个缓冲区都将在其自己的 WebSocket 帧中发送。

用法：

*服务器*

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const parser = require("socket.io-msgpack-parser");

const httpServer = createServer();
const io = new Server(httpServer, {
  parser
});
```

*客户端*

```js
const { io } = require("socket.io-client");
const parser = require("socket.io-msgpack-parser");

const socket = io("https://example.com", {
  parser
});
```

## 通过系统调节 {#at-the-os-level}

有很多关于如何调整操作系统以接受大量连接的好文章。例如，请看[这个](https://blog.jayway.com/2015/04/13/600k-concurrent-websocket-connections-on-aws-using-node-js/) 或 [这个](https://medium.com/@elliekang/scaling-to-a-millions-websocket-concurrent-connections-at-spoon-radio-bbadd6ec1901)。

在对 Socket.IO 服务器[进行负载测试](load-testing.md)时，您可能会达到以下两个限制：

- 最大打开文件数

如果您不能超过 1000 个并发连接（新客户端无法连接），那么您肯定已经达到了打开文件的最大数量：

```
$ ulimit -n
1024
```

要增加此数量，请创建一个`/etc/security/limits.d/custom.conf`包含以下内容的新文件（需要 root 权限）：

```
* soft nofile 1048576
* hard nofile 1048576
```

然后重新加载您的会话。您的新限制现在应该已更新：

```
$ ulimit -n
1048576
```

- 最大可用本地端口数

如果你不能超过 28000 个并发连接，你肯定已经达到了可用本地端口的最大数量：

```
$ cat /proc/sys/net/ipv4/ip_local_port_range
32768	60999
```

要增加此数量，请创建一个`/etc/sysctl.d/net.ipv4.ip_local_port_range.conf`包含以下内容的新文件（同样，需要 root 权限）：

```
net.ipv4.ip_local_port_range = 10000 65535
```

注意：我们用作`10000`下限，因此它不包括机器上服务使用的端口（例如`5432`PostgreSQL 服务器），但您完全可以使用较低的值（下至`1024`）。

重新启动机器后，您现在可以愉快地达到 55k 并发连接（每个传入 IP）。

也可以看看：

- https://unix.stackexchange.com/a/130798
- https://making.pusher.com/ephemeral-port-exhaustion-and-how-to-avoid-it/
