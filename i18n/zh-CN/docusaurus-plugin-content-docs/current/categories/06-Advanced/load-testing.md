---
title: 负载测试
sidebar_position: 5
slug: /load-testing/
---

由于 Socket.IO 有[自己的协议](https://github.com/socketio/socket.io-protocol)，包括握手、心跳和自定义数据包编码，负载测试 Socket.IO 服务器最简单的方法是使用 Socket.IO 客户端库并创建*大量*客户端。

有两种经典的解决方案可以做到这一点：

- 使用 [Artillery](#artillery)
- 或 [manually manage the clients](#manual-client-creation)

## Artillery {#artillery}

Artillery 是负载测试应用程序的绝佳工具。它允许创建连接、发送事件和检查确认。

文档可以在[这里](https://artillery.io/docs/guides/guides/socketio-reference.html)找到。

**重要提示：**默认安装带有 v2 客户端，与 v3/v4 服务器[不兼容](../03-Client/client-installation.md#version-compatibility)。您需要为此安装自定义引擎：https://github.com/ptejada/artillery-engine-socketio-v3

安装:

```
$ npm install artillery artillery-engine-socketio-v3
```

示例场景：

```yaml
# my-scenario.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
  engines:
   socketio-v3: {}

scenarios:
  - name: My sample scenario
    engine: socketio-v3
    flow:
      # wait for the WebSocket upgrade (optional)
      - think: 1

      # basic emit
      - emit:
          channel: "hello"
          data: "world"

      # emit an object
      - emit:
          channel: "hello"
          data:
            id: 42
            status: "in progress"
            tags:
              - "tag1"
              - "tag2"

      # emit in a custom namespace
      - namespace: "/my-namespace"
        emit:
          channel: "hello"
          data: "world"

      # emit with acknowledgement
      - emit:
          channel: "ping"
        acknowledge:
          match:
            value: "pong"

      # do nothing for 30 seconds then disconnect
      - think: 30
```

要运行此方案：

```
$ npx artillery run my-scenario.yml
```

Artillery 还附带了许多很棒的功能，例如能够[将指标发布到各种端点](https://artillery.io/docs/guides/plugins/plugin-publish-metrics.html) 或 [从 AWS 运行测试](https://artillery.io/docs/guides/guides/running-tests-with-artillery-pro.html)。

它唯一的限制是您无法轻松测试服务器到客户端的事件，因为 Artillery DSL 更适合经典的客户端到服务器通信。这将我们带到[下一节](#manual-client-creation).

## 手动创建客户端 {#manual-client-creation}

这是创建一千个 Socket.IO 客户端并监控每秒接收的数据包数量的基本脚本：

```js
const { io } = require("socket.io-client");

const URL = process.env.URL || "http://localhost:3000";
const MAX_CLIENTS = 1000;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATION_INTERVAL_IN_MS = 10;
const EMIT_INTERVAL_IN_MS = 1000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const createClient = () => {
  // for demonstration purposes, some clients stay stuck in HTTP long-polling
  const transports =
    Math.random() < POLLING_PERCENTAGE ? ["polling"] : ["polling", "websocket"];

  const socket = io(URL, {
    transports,
  });

  setInterval(() => {
    socket.emit("client to server event");
  }, EMIT_INTERVAL_IN_MS);

  socket.on("server to client event", () => {
    packetsSinceLastReport++;
  });

  socket.on("disconnect", (reason) => {
    console.log(`disconnect due to ${reason}`);
  });

  if (++clientCount < MAX_CLIENTS) {
    setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
  }
};

createClient();

const printReport = () => {
  const now = new Date().getTime();
  const durationSinceLastReport = (now - lastReport) / 1000;
  const packetsPerSeconds = (
    packetsSinceLastReport / durationSinceLastReport
  ).toFixed(2);

  console.log(
    `client count: ${clientCount} ; average packets received per second: ${packetsPerSeconds}`
  );

  packetsSinceLastReport = 0;
  lastReport = now;
};

setInterval(printReport, 5000);
```

您可以将其用作负载测试您自己的应用程序的起点。
