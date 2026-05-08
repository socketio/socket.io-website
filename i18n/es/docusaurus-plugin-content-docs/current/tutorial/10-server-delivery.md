---
title: "Tutorial paso #7 - Entrega del servidor"
sidebar_label: "Paso #7: Entrega del servidor"
slug: step-7
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Entrega del servidor

Hay dos formas comunes de sincronizar el estado del cliente al reconectarse:

- el servidor envía todo el estado
- o el cliente mantiene registro del último evento que procesó y el servidor envía las piezas faltantes

Ambas son soluciones totalmente válidas y elegir una dependerá de tu caso de uso. En este tutorial, iremos con la segunda.

Primero, persistamos los mensajes de nuestra aplicación de chat. Hoy hay muchas opciones geniales, usaremos [SQLite](https://www.sqlite.org/) aquí.

:::tip

Si no estás familiarizado con SQLite, hay muchos tutoriales disponibles en línea, como [este](https://www.sqlitetutorial.net/).

:::

Instalemos los paquetes necesarios:

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
  <TabItem value="bun" label="Bun">

```sh
bun add sqlite sqlite3
```

  </TabItem>
</Tabs>

Simplemente almacenaremos cada mensaje en una tabla SQL:

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
  // abrir el archivo de base de datos
  const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  // crear nuestra tabla 'messages' (puedes ignorar la columna 'client_offset' por ahora)
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
        // almacenar el mensaje en la base de datos
        result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
      } catch (e) {
        // TODO manejar el fallo
        return;
      }
      // incluir el offset con el mensaje
      io.emit('chat message', msg, result.lastID);
      // highlight-end
    });
  });

  server.listen(3000, () => {
    console.log('servidor corriendo en http://localhost:3000');
  });
}

main();
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js title="index.js"
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
// highlight-start
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// abrir el archivo de base de datos
const db = await open({
  filename: 'chat.db',
  driver: sqlite3.Database
});

// crear nuestra tabla 'messages' (puedes ignorar la columna 'client_offset' por ahora)
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

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', async (msg) => {
    // highlight-start
    let result;
    try {
      // almacenar el mensaje en la base de datos
      result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
    } catch (e) {
      // TODO manejar el fallo
      return;
    }
    // incluir el offset con el mensaje
    io.emit('chat message', msg, result.lastID);
    // highlight-end
  });
});

server.listen(3000, () => {
  console.log('servidor corriendo en http://localhost:3000');
});
```

  </TabItem>
</Tabs>

El cliente luego mantendrá registro del offset:

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

Y finalmente el servidor enviará los mensajes faltantes al (re)conectarse:

```js title="index.js"
// [...]

io.on('connection', async (socket) => {
  socket.on('chat message', async (msg) => {
    let result;
    try {
      result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
    } catch (e) {
      // TODO manejar el fallo
      return;
    }
    io.emit('chat message', msg, result.lastID);
  });

  // highlight-start
  if (!socket.recovered) {
    // si la recuperación del estado de conexión no fue exitosa
    try {
      await db.each('SELECT id, content FROM messages WHERE id > ?',
        [socket.handshake.auth.serverOffset || 0],
        (_err, row) => {
          socket.emit('chat message', row.content, row.id);
        }
      )
    } catch (e) {
      // algo salió mal
    }
  }
  // highlight-end
});

// [...]
```

Veámoslo en acción:

<video controls width="100%"><source src="/videos/tutorial/server-delivery.mp4" /></video>

Como puedes ver en el video anterior, funciona tanto después de una desconexión temporal como de un refresco completo de la página.

:::tip

La diferencia con la característica de "Recuperación del estado de conexión" es que una recuperación exitosa podría no necesitar consultar tu base de datos principal (podría obtener los mensajes de un stream de Redis, por ejemplo).

:::

OK, ahora hablemos de la entrega del cliente.
