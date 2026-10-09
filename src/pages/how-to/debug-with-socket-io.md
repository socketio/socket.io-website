---
title: How to use Socket.IO with a debugger
---

# How to use Socket.IO with a debugger

## Problem

When debugging a Socket.IO application with breakpoints, you might notice that the connection gets closed while you are stepping through the code.

This usually happens because Socket.IO relies on a heartbeat mechanism to detect broken connections. If the server or the client is paused by the debugger for too long, the heartbeat packets might not be processed in time, and the connection will be considered closed.

The disconnection reason is usually `"ping timeout"`.

## Solution

During local development, you can increase the heartbeat timeout values on the server:

```js
import { Server } from "socket.io";

const io = new Server(httpServer, {
  pingInterval: 60_000, 
  pingTimeout: 300_000
});
```

With this configuration:

- the server sends a ping every 60 seconds
- the connection is closed if the client does not respond within 5 minutes

This gives you more time to inspect variables, step through the code, and resume execution before the connection is closed.

:::caution

This is mostly useful while debugging locally. Using huge heartbeat values in production means that broken connections will take longer to be detected.

:::

## Debugging disconnections

You can listen for the `disconnect` event to check why the connection was closed:

```js
socket.on("disconnect", (reason) => {
  console.log(reason);
});
```

If the reason is `"ping timeout"`, then increasing `pingTimeout` should help.

## Acknowledgement timeouts

If you use acknowledgements with a timeout, you might also need to increase this timeout while debugging:

```js
socket.timeout(300_000).emit("my-event", (err, response) => {
  if (err) {
    // the other side did not acknowledge the event in time
  } else {
    // ...
  }
});
```

This timeout only applies to this specific emitted event and is independent of the heartbeat timeout.

## Other tips

- Prefer conditional breakpoints when possible.
- Avoid pausing for a long time before the connection is fully established.
- If you are debugging both the client and the server, increase the heartbeat timeout enough to cover pauses on either side.

[Back to the list of examples](/get-started/)
