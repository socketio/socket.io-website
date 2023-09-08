---
title: "Tutorial step #3 - Integrating Socket.IO"
sidebar_label: "Step #3: Integrating Socket.IO"
slug: step-3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Integrating Socket.IO

Socket.IO is composed of two parts:

- A server that integrates with (or mounts on) the Node.JS HTTP Server (the [`socket.io`](https://www.npmjs.com/package/socket.io) package)
- A client library that loads on the browser side (the [`socket.io-client`](https://www.npmjs.com/package/socket.io-client) package)

During development, `socket.io` serves the client automatically for us, as we’ll see, so for now we only have to install one module:

```
npm install socket.io
```

That will install the module and add the dependency to `package.json`. Now let’s edit `index.js` to add it:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
// highlight-start
const { Server } = require('socket.io');
// highlight-end

const app = express();
const server = createServer(app);
// highlight-start
const io = new Server(server);
// highlight-end

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// highlight-start
io.on('connection', (socket) => {
  console.log('a user connected');
});
// highlight-end

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import express from 'express';
import { createServer } from 'node:http';
// highlight-start
import { Server } from 'socket.io';
// highlight-end

const app = express();
const server = createServer(app);
// highlight-start
const io = new Server(server);
// highlight-end

app.get('/', (req, res) => {
  res.sendFile(new URL('./index.html', import.meta.url).pathname);
});

// highlight-start
io.on('connection', (socket) => {
  console.log('a user connected');
});
// highlight-end

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
</Tabs>

Notice that I initialize a new instance of `socket.io` by passing the `server` (the HTTP server) object. Then I listen on the `connection` event for incoming sockets and log it to the console.


Now in index.html add the following snippet before the `</body>` (end body tag):

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

  </TabItem>
  <TabItem value="es5" label="ES5">

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();
</script>
```

  </TabItem>
</Tabs>

That’s all it takes to load the `socket.io-client`, which exposes an `io` global (and the endpoint `GET /socket.io/socket.io.js`), and then connect.

If you would like to use the local version of the client-side JS file, you can find it at `node_modules/socket.io/client-dist/socket.io.js`.

:::tip

You can also use a CDN instead of the local files (e.g. `<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>`).

:::

Notice that I’m not specifying any URL when I call `io()`, since it defaults to trying to connect to the host that serves the page.

:::note

If you're behind a reverse proxy such as apache or nginx please take a look at [the documentation for it](/docs/v4/reverse-proxy/).

If you're hosting your app in a folder that is *not* the root of your website (e.g., `https://example.com/chatapp`) then you also need to specify the [path](/docs/v4/server-options/#path) in both the server and the client.

:::

If you now restart the process (by hitting Control+C and running `node index.js` again) and then refresh the webpage you should see the console print “a user connected”.

Try opening several tabs, and you’ll see several messages.

<img src="/images/chat-4.png" alt="A console displaying several messages, indicating that some users have connected" />

Each socket also fires a special `disconnect` event:

```js
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
```

Then if you refresh a tab several times you can see it in action.

<img src="/images/chat-5.png" alt="A console displaying several messages, indicating that some users have connected and disconnected" />

:::tip

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step3?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step3?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step3?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step3?file=index.js)


  </TabItem>
</Tabs>

:::
