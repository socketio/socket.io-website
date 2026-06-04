---
title: How to implement back pressure
---

# How to implement back pressure

:::info

In distributed systems, particularly in event-driven architectures, back pressure is a technique to regulate the flow of data, ensuring that components do not become overwhelmed.

Source: [Wikipedia](https://en.wikipedia.org/wiki/Back_pressure)

See also: https://nodejs.org/learn/modules/backpressuring-in-streams

:::

Socket.IO [acknowledgement callbacks](/docs/v4/emitting-events/#acknowledgements) can be used as an application-level back pressure mechanism: instead of sending messages as fast as possible, the sender waits until the receiver explicitly confirms that it has processed, stored, or forwarded the previous message.

For example, let's say we want to send a huge file over Socket.IO.

We cannot load the whole file into memory at once and run `socket.emit()`, because it's too large. Let's see how we can take advantage of the [Node.js Stream API](https://nodejs.org/docs/latest/api/stream.html) and Socket.IO acknowledgement mechanism to send the file in small chunks.

## Overview

### Client

Here's the main idea on the client side:

```js title="client.js"
// create a Socket.IO client
const socket = io();

// create a readable stream to load the file in 1 MB chunks
const input = createReadStream(path, {
  highWaterMark: 1024 * 1024,
});

input.on("data", async (chunk) => {
  // pause the source until the server confirms that it has processed the chunk
  input.pause();

  // send the chunk to the server and wait for its acknowledgement
  const res = await socket
    .timeout(5_000)
    .emitWithAck("upload:chunk", chunk);

  if (res.ok) {
    // load next chunk
    input.resume();
  }
});
```

:::tip

The client does not continue reading and sending chunks until the server acknowledges the previous one.

:::

### Server

And on the server side:

```js title="server.js"
// create a Socket.IO server with a 2 MB chunk max size
const io = new Server({
  maxHttpBufferSize: 2 * 1024 * 1024,
});

io.on("connection", (socket) => {
  const fileId = "some random ID";
  // create a writable stream to store the file
  const writeStream = createWriteStream(`./uploads/${fileId}`, {
    flags: "wx",
  });

  socket.on("upload:chunk", (chunk, ack) => {
    writeStream.write(chunk, (err) => {
      if (err) {
        return ack({
          ok: false,
          error: err.message,
        });
      }

      // only send the acknowledgement when the chunk has been flushed
      ack({
        ok: true,
      });
    });
  });
});
```

The server does not call the acknowledgement immediately. It waits until the chunk has successfully been flushed.

So if the server-side write stream slows down, the acknowledgement is delayed, and the client-side read loop pauses naturally.

## Complete example

Here's a more complex example supporting multiple in-flight chunks and parallel uploads to maximize throughput:

### Client

```js
import { createReadStream } from "node:fs";
import { io } from "socket.io-client";

const DEFAULT_TIMEOUT = 5_000;

const socket = io("http://localhost:3000");

async function uploadFile(path, maxInFlight = 4) {
  const res = await socket.timeout(DEFAULT_TIMEOUT).emitWithAck("upload:start");

  if (!res.ok) {
    throw new Error(res.error);
  }

  const fileId = res.value;

  const input = createReadStream(path, {
    highWaterMark: 1024 * 1024,
  });

  let inFlight = 0;
  let inputEnded = false;
  let ending = false;
  let settled = false;

  function abortUpload() {
    socket.emit("upload:error", {
      fileId,
    });
  }

  return new Promise((resolve, reject) => {
    function fail(err) {
      if (settled) {
        return;
      }

      settled = true;
      input.destroy();
      abortUpload();
      reject(err);
    }

    async function maybeEndUpload() {
      if (settled || ending || !inputEnded || inFlight > 0) {
        return;
      }

      ending = true;

      try {
        const res = await socket
          .timeout(DEFAULT_TIMEOUT)
          .emitWithAck("upload:end", {
            fileId,
          });

        if (!res.ok) {
          return fail(new Error(res.error));
        }

        settled = true;
        resolve();
      } catch (err) {
        fail(err);
      }
    }

    input.on("data", async (chunk) => {
      inFlight++;

      if (inFlight >= maxInFlight) {
        input.pause();
      }

      try {
        const res = await socket
          .timeout(DEFAULT_TIMEOUT)
          .emitWithAck("upload:chunk", {
            fileId,
            chunk,
          });

        inFlight--;

        if (!res.ok) {
          return fail(new Error(res.error));
        }

        if (!settled && input.isPaused() && inFlight < maxInFlight) {
          input.resume();
        }

        await maybeEndUpload();
      } catch (err) {
        inFlight--;
        fail(err);
      }
    });

    input.on("end", async () => {
      inputEnded = true;
      await maybeEndUpload();
    });

    input.on("error", (err) => {
      fail(err);
    });
  });
}

console.log("upload started");

try {
  await uploadFile("./large-file.bin");

  console.log("upload completed");
} catch (err) {
  console.log("upload failed:", err.message);
}

socket.disconnect();
```

### Server

```js
import { createServer } from "node:http";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { Server } from "socket.io";
import { randomUUID } from "node:crypto";

const httpServer = createServer();
const io = new Server(httpServer, {
  maxHttpBufferSize: 2 * 1024 * 1024,
});

await mkdir("./uploads", { recursive: true });

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  const uploads = new Map();

  socket.on("upload:start", (ack) => {
    const fileId = randomUUID();

    const writeStream = createWriteStream(`./uploads/${fileId}`, {
      flags: "wx",
    });

    const upload = {
      writeStream,
      ended: false,
      failed: false,
    };

    uploads.set(fileId, upload);

    writeStream.on("error", (err) => {
      upload.failed = true;
      uploads.delete(fileId);
      console.error(`write stream error for ${fileId}:`, err.message);
    });

    writeStream.on("close", () => {
      uploads.delete(fileId);
    });

    ack({
      ok: true,
      value: fileId,
    });
  });

  socket.on("upload:chunk", ({ fileId, chunk }, ack) => {
    const upload = uploads.get(fileId);

    if (!upload) {
      return ack({
        ok: false,
        error: "unknown file ID",
      });
    }

    if (upload.failed) {
      return ack({
        ok: false,
        error: "upload has failed",
      });
    }

    if (upload.ended) {
      return ack({
        ok: false,
        error: "upload has already ended",
      });
    }

    upload.writeStream.write(chunk, (err) => {
      if (err) {
        upload.failed = true;
        uploads.delete(fileId);

        return ack({
          ok: false,
          error: err.message,
        });
      }

      ack({
        ok: true,
      });
    });
  });

  socket.on("upload:end", ({ fileId }, ack) => {
    const upload = uploads.get(fileId);

    if (!upload) {
      return ack({
        ok: false,
        error: "unknown file ID",
      });
    }

    if (upload.failed) {
      return ack({
        ok: false,
        error: "upload has failed",
      });
    }

    if (upload.ended) {
      return ack({
        ok: false,
        error: "upload has already ended",
      });
    }

    upload.ended = true;

    upload.writeStream.end((err) => {
      uploads.delete(fileId);

      if (err) {
        return ack({
          ok: false,
          error: err.message,
        });
      }

      ack({
        ok: true,
      });
    });
  });

  socket.on("upload:error", ({ fileId }) => {
    const upload = uploads.get(fileId);

    if (upload) {
      upload.failed = true;
      upload.writeStream.destroy();
      // note: depending on your use case, you may also want to delete the partially uploaded file
      uploads.delete(fileId);
    }
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);

    for (const upload of uploads.values()) {
      upload.writeStream.destroy();
    }

    uploads.clear();
  });
});

httpServer.listen(3000, () => {
  console.log("server listening on http://localhost:3000");
});
```

That's all folks, thanks for reading!

[Back to the list of examples](/get-started/)