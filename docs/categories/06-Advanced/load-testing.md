---
title: Load testing
sidebar_position: 5
slug: /load-testing/
---

Since Socket.IO has its [own protocol](https://github.com/socketio/socket.io-protocol), including handshake, heartbeats and custom packet encoding, the easiest way to load test your Socket.IO server is to use the Socket.IO client library and create *a lot of* clients.

There are two classic solutions to do this:

- using [Artillery](#artillery)
- or [manually manage the clients](#manual-client-creation)

## Artillery

Artillery is a great tool for load testing your application. It allows creating connections, sending events and checking acknowledgments.

The documentation can be found [here](https://artillery.io/docs/guides/guides/socketio-reference.html).

**Important note**: the default installation comes with a v2 client, which is [not compatible](/docs/v4/client-installation/#Version-compatibility) with a v3/v4 server. You need to install a custom engine for this: https://github.com/ptejada/artillery-engine-socketio-v3

Installation:

```
$ npm install artillery artillery-engine-socketio-v3
```

Sample scenario:

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

To run this scenario:

```
$ npx artillery run my-scenario.yml
```

Artillery also comes with a lot of awesome features, like the ability to [publish the metrics to various endpoints](https://artillery.io/docs/guides/plugins/plugin-publish-metrics.html) or [run the tests from AWS](https://artillery.io/docs/guides/guides/running-tests-with-artillery-pro.html).

Its only limitation is that you cannot easily test server-to-client events, as the Artillery DSL is more suited for classic client-to-server communication. Which brings us to [our next section](#manual-client-creation).

## Manual client creation

Here's a basic script to create a thousand Socket.IO clients and monitor the number of packets received per second:

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

You can use it as a starting point for load testing your own application.
