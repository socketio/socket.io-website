---
title: "Tutorial step #7 - Server delivery"
sidebar_label: "Step #7: Server delivery"
slug: step-7
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Server delivery

There are two common ways to synchronize the state of the client upon reconnection:

- either the server sends the whole state
- or the client keeps track of the last event it has processed and the server sends the missing pieces

Both are totally valid solutions and choosing one will depend on your use case. In this tutorial, we will go with the latter.

First, let's persist the messages of our chat application. Today there are plenty of great options, we will use with [SQLite](https://www.sqlite.org/) here.

:::tip

If you are not familiar with SQLite, there are plenty of tutorials available online, like [this one](https://www.sqlitetutorial.net/).

:::

Let's install the necessary packages:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install sqlite sqlite3
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add sqlite sqlite3
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add sqlite sqlite3
```

  </TabItem>
</Tabs>

We will simply store each message in a SQL table:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js title="index.js"
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
// highlight-start
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
// highlight-end

async function main() {
  // highlight-start
  // open the database file
  const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  // create our 'messages' table (you can ignore the 'client_offset' column for now)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content TEXT
    );
  `);
  // highlight-end

  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {}
  });

  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });

  io.on('connection', (socket) => {
    socket.on('chat message', async (msg) => {
      // highlight-start
      let result;
      try {
        // store the message in the database
        result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
      } catch (e) {
        // TODO handle the failure
        return;
      }
      // include the offset with the message
      io.emit('chat message', msg, result.lastID);
      // highlight-end
    });
  });

  server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
  });
}

main();
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js title="index.js"
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
// highlight-start
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// open the database file
const db = await open({
  filename: 'chat.db',
  driver: sqlite3.Database
});

// create our 'messages' table (you can ignore the 'client_offset' column for now)
await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
  );
`);
// highlight-end

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});

app.get('/', (req, res) => {
  res.sendFile(new URL('./index.html', import.meta.url).pathname);
});

io.on('connection', (socket) => {
  socket.on('chat message', async (msg) => {
    // highlight-start
    let result;
    try {
      // store the message in the database
      result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
    } catch (e) {
      // TODO handle the failure
      return;
    }
    // include the offset with the message
    io.emit('chat message', msg, result.lastID);
    // highlight-end
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
</Tabs>

The client will then keep track of the offset:

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html title="index.html"
<script>
  // highlight-start
  const socket = io({
    auth: {
      serverOffset: 0
    }
  });
  // highlight-end

  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  // highlight-next-line
  socket.on('chat message', (msg, serverOffset) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    // highlight-next-line
    socket.auth.serverOffset = serverOffset;
  });
</script>
```

  </TabItem>
  <TabItem value="es5" label="ES5">

```html title="index.html"
<script>
  // highlight-start
  var socket = io({
    auth: {
      serverOffset: 0
    }
  });
  // highlight-end

  var form = document.getElementById('form');
  var input = document.getElementById('input');
  var messages = document.getElementById('messages');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  // highlight-next-line
  socket.on('chat message', function(msg, serverOffset) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    // highlight-next-line
    socket.auth.serverOffset = serverOffset;
  });
</script>
```

  </TabItem>
</Tabs>

And finally the server will send the missing messages upon (re)connection:

```js title="index.js"
// [...]

io.on('connection', async (socket) => {
  socket.on('chat message', async (msg) => {
    let result;
    try {
      result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
    } catch (e) {
      // TODO handle the failure
      return;
    }
    io.emit('chat message', msg, result.lastID);
  });

  // highlight-start
  if (!socket.recovered) {
    // if the connection state recovery was not successful
    try {
      await db.each('SELECT id, content FROM messages WHERE id > ?',
        [socket.handshake.auth.serverOffset || 0],
        (_err, row) => {
          socket.emit('chat message', row.content, row.id);
        }
      )
    } catch (e) {
      // something went wrong
    }
  }
  // highlight-end
});

// [...]
```

Let's see it in action:

<video controls width="100%"><source src="/videos/tutorial/server-delivery.mp4" /></video>

As you can see in the video above, it works both after a temporary disconnection and a full page refresh.

:::tip

The difference with the "Connection state recovery" feature is that a successful recovery might not need to hit your main database (it might fetch the messages from a Redis stream for example).

:::

OK, now let's talk about the client delivery.
