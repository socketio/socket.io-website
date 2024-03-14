---
title: 自定义解析器
sidebar_position: 2
slug: /custom-parser/
---

从 Socket.IO v2.0.0 开始，现在可以提供自己的解析器，以控制数据包的编组/解组。

*服务器*

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  parser: myParser
});
```

*客户端*

```js
const socket = io({
  parser: myParser
});
```

## 实现自己的解析器 {#implementing-your-own-parser}

这是一个使用`JSON.stringify()`和`JSON.parse()`方法的解析器的基本示例：

```js
const Emitter = require("component-emitter"); // polyfill of Node.js EventEmitter in the browser 

class Encoder {
  /**
   * Encode a packet into a list of strings/buffers
   */
  encode(packet) {
    return [JSON.stringify(packet)];
  }
}

class Decoder extends Emitter {
  /**
   * Receive a chunk (string or buffer) and optionally emit a "decoded" event with the reconstructed packet
   */
  add(chunk) {
    const packet = JSON.parse(chunk);
    if (this.isPacketValid(packet)) {
      this.emit("decoded", packet);
    } else {
      throw new Error("invalid format");
    }
  }
  isPacketValid({ type, data, nsp, id }) {
    const isNamespaceValid = typeof nsp === "string";
    const isAckIdValid = id === undefined || Number.isInteger(id);
    if (!isNamespaceValid || !isAckIdValid) {
      return false;
    }
    switch (type) {
      case 0: // CONNECT
        return data === undefined || typeof data === "object";
      case 1: // DISCONNECT
        return data === undefined;
      case 2: // EVENT
        return Array.isArray(data) && data.length > 0;
      case 3: // ACK
        return Array.isArray(data);
      case 4: // CONNECT_ERROR
        return typeof data === "object";
      default:
        return false;
    }
  }
  /**
   * Clean up internal buffers
   */
  destroy() {}
}

module.exports = { Encoder, Decoder };
```

## 默认解析器 {#the-default-parser}

默认解析器（`socket.io-parser`包）的源代码可以在这里找到：https://github.com/socketio/socket.io-parser

输出示例：

- 基本 emit

```js
socket.emit("test", 42);
```

将被编码为：

```
2["test",42]
||
|└─ JSON-encoded payload
└─ packet type (2 => EVENT)
```

- 使用二进制、确认和自定义命名空间发出

```js
socket.emit("test", Uint8Array.from([42]), () => {
  console.log("ack received");
});
```

将被编码为：

```
51-/admin,13["test",{"_placeholder":true,"num":0}]
||||     || └─ JSON-encoded payload with placeholders for binary attachments
||||     |└─ acknowledgement id
||||     └─ separator
|||└─ namespace (not included when it's the main namespace)
||└─ separator
|└─ number of binary attachments
└─ packet type (5 => BINARY EVENT)

and an additional attachment (the extracted Uint8Array)
```

优点：

- 二进制附件是 base64 编码的，所以这个解析器与[不支持 Arraybuffers](https://caniuse.com/mdn-javascript_builtins_arraybuffer)的浏览器兼容，比如 IE9

缺点：

- 具有二进制内容的数据包作为两个不同的 WebSocket 帧发送（如果建立了 WebSocket 连接）

## msgpack 解析器 {#the-msgpack-parser}

此解析器使用[MessagePack](https://msgpack.org/)序列化格式。

这个解析器的源代码可以在这里找到：https://github.com/socketio/socket.io-msgpack-parser

示例用法：

*服务器*

```js
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  parser: require("socket.io-msgpack-parser")
});
```

*客户端 (Node.js)*

```js
const socket = require("socket.io-client")("https://example.com", {
  parser: require("socket.io-msgpack-parser")
});
```

在浏览器中，现在有一个包含此解析器的官方包：

- https://cdn.socket.io/4.7.5/socket.io.msgpack.min.js
- cdnjs: https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.msgpack.min.js
- jsDelivr: https://cdn.jsdelivr.net/npm/socket.io-client@4.7.5/dist/socket.io.msgpack.min.js
- unpkg: https://unpkg.com/socket.io-client@4.7.5/dist/socket.io.msgpack.min.js

在这种情况下，您不需要指定`parser`配置项。

优点：

- 具有二进制内容的数据包作为单个 WebSocket 帧发送（如果建立了 WebSocket 连接）
- 可能会导致更小的有效载荷（尤其是在使用大量数字时）

缺点：

- 与[不支持 Arraybuffers](https://caniuse.com/mdn-javascript_builtins_arraybuffer)的浏览器不兼容，例如 IE9
- 在浏览器的网络选项卡中更难调试

请注意，这`socket.io-msgpack-parser`依赖于[`notepack.io`](https://github.com/darrachequesne/notepack)MessagePack 实现。此实现主要关注性能和最小包大小，因此不支持扩展类型等功能。对于基于[官方 JavaScript 实现](https://github.com/msgpack/msgpack-javascript)的解析器，请查看[这个包](https://www.npmjs.com/package/@skgdev/socket.io-msgpack-javascript)。
