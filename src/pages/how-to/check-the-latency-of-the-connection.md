---
title: How to check the latency of the Socket.IO connection
---

# How to check the latency of the Socket.IO connection

You can test the latency of your application by sending a ping event to the server and [acknowledging it](/docs/v4/emitting-events/#acknowledgements) on the other side:

*Client*

```js
import { io } from "socket.io-client";

const socket = io("wss://example.com");

setInterval(() => {
  const start = Date.now();

  socket.emit("ping", () => {
    const duration = Date.now() - start;
    console.log(duration);
  });
}, 1000);
```

*Server*

```js
import { Server } from "socket.io";

const io = new Server(3000);

io.on("connection", (socket) => {
  socket.on("ping", (callback) => {
    callback();
  });
});
```

Please note that most of the latency will likely come **from the network**, and not Socket.IO (which has about the same overhead as the underlying WebSocket connection).

The latency can be impacted by a lot of factors, the major one being obviously the distance between the server and the client.

That being said, a client stuck in HTTP long-polling will see a higher latency compared to WebSocket, as the latter keeps an open TCP connection between the server and the client and does not need to send the HTTP headers on each request.

Related:

- [The connection is stuck in HTTP long-polling](/docs/v4/troubleshooting-connection-issues/#problem-the-socket-is-stuck-in-http-long-polling)
- [Performance tuning](/docs/v4/performance-tuning/)
- [What is latency?](https://www.cloudflare.com/learning/performance/glossary/what-is-latency/)
