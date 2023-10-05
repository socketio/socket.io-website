---
title: "Tutorial step #1 - Project initialization"
sidebar_label: "Step #1: Project initialization"
slug: step-1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Project initialization

The first goal is to set up a simple HTML webpage that serves out a form and a list of messages. We’re going to use the Node.JS web framework `express` to this end. Make sure [Node.JS](https://nodejs.org) is installed.

First let’s create a `package.json` manifest file that describes our project. I recommend you place it in a dedicated empty directory (I’ll call mine `socket-chat-example`).

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```json
{
  "name": "socket-chat-example",
  "version": "0.0.1",
  "description": "my first socket.io app",
  "type": "commonjs",
  "dependencies": {}
}
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```json
{
  "name": "socket-chat-example",
  "version": "0.0.1",
  "description": "my first socket.io app",
  "type": "module",
  "dependencies": {}
}
```

  </TabItem>
</Tabs>

:::caution

The "name" property must be unique, you cannot use a value like "socket.io" or "express", because npm will complain when installing the dependency.

:::

Now, in order to easily populate the `dependencies` property with the things we need, we’ll use `npm install`:

```
npm install express@4
```

Once it's installed we can create an `index.js` file that will set up our application.

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require('express');
const { createServer } = require('node:http');

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import express from 'express';
import { createServer } from 'node:http';

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
</Tabs>

This means that:

- Express initializes `app` to be a function handler that you can supply to an HTTP server (as seen in line 5).
- We define a route handler `/` that gets called when we hit our website home.
- We make the http server listen on port 3000.

If you run `node index.js` you should see the following:

<img src="/images/chat-1.png" alt="A console saying that the server has started listening on port 3000" />

And if you point your browser to `http://localhost:3000`:

<img src="/images/chat-2.png" alt="A browser displaying a big 'Hello World'" />

So far, so good!

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step1?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step1?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step1?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step1?file=index.js)


  </TabItem>
</Tabs>

:::
