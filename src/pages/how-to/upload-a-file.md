---
title: How to upload a file
---

# How to upload a file

[Files](https://developer.mozilla.org/en-US/docs/Web/API/File) can be sent as is:

```html
<!doctype html>
<html lang="en">
  <body>
    <input type="file" onchange="upload(this.files)" />

    <script src="/path/to/socket.io.js"></script>
    <script>
      const socket = io();

      function upload(files) {
        socket.emit("upload", files[0], (status) => {
          console.log(status);
        });
      }
    </script>
  </body>
</html>
```

The file will be received as a [Buffer](https://nodejs.org/api/buffer.html) on the server side:

```js
import { writeFile } from "fs";

io.on("connection", (socket) => {
  socket.on("upload", (file, callback) => {
    console.log(file); // <Buffer 25 50 44 ...>

    // save the content to the disk, for example
    writeFile("/tmp/upload", file, (err) => {
      callback({ message: err ? "failure" : "success" });
    });
  });
});
```

## Additional notes

### `maxHttpBufferSize` limit

While uploading a file, you might reach the `maxHttpBufferSize` value, which is the maximum allowed message size in bytes. It defaults to 1 MB.

You can increase this value, according to your use case:

```js
import { Server } from "socket.io";

const io = new Server({
  maxHttpBufferSize: 1e8 // 100 MB
});
```

Reference: [`maxHttpBufferSize` option](/docs/v4/server-options/#maxhttpbuffersize)

### Over the wire

Like other binary structures ([ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)), the arguments of the `emit()` method will be sent as two WebSocket frames over the wire:

First, a text frame:

```
451-["upload",{"_placeholder":true,"num":0}]
||||└─ JSON-encoded payload with placeholders for binary attachments
||||
|||└─ separator
||└─ number of binary attachments
|└─ socket.io BINARY EVENT packet type
└─ engine.io MESSAGE packet type
```

And then a binary frame (one per binary structure):

```
<0x25 0x50 0x44 ...>
```

Depending on your use case, you may change this behavior by using a [custom parser](/docs/v4/custom-parser/).
