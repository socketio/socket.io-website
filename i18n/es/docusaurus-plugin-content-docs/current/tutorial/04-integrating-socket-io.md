---
title: "Tutorial paso #3 - Integrando Socket.IO"
sidebar_label: "Paso #3: Integrando Socket.IO"
slug: step-3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Integrando Socket.IO

Socket.IO está compuesto de dos partes:

- Un servidor que se integra con (o se monta en) el servidor HTTP de Node.JS (el paquete [`socket.io`](https://www.npmjs.com/package/socket.io))
- Una biblioteca cliente que se carga en el lado del navegador (el paquete [`socket.io-client`](https://www.npmjs.com/package/socket.io-client))

Durante el desarrollo, `socket.io` sirve el cliente automáticamente para nosotros, como veremos, así que por ahora solo tenemos que instalar un módulo:

```
npm install socket.io
```

Eso instalará el módulo y añadirá la dependencia a `package.json`. Ahora editemos `index.js` para añadirlo:

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
  console.log('un usuario se conectó');
});
// highlight-end

server.listen(3000, () => {
  console.log('servidor corriendo en http://localhost:3000');
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
// highlight-start
import { Server } from 'socket.io';
// highlight-end

const app = express();
const server = createServer(app);
// highlight-start
const io = new Server(server);
// highlight-end

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// highlight-start
io.on('connection', (socket) => {
  console.log('un usuario se conectó');
});
// highlight-end

server.listen(3000, () => {
  console.log('servidor corriendo en http://localhost:3000');
});
```

  </TabItem>
</Tabs>

Observa que inicializo una nueva instancia de `socket.io` pasando el objeto `server` (el servidor HTTP). Luego escucho el evento `connection` para sockets entrantes y lo registro en la consola.


Ahora en index.html añade el siguiente fragmento antes del `</body>` (etiqueta de cierre del body):

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

Eso es todo lo que se necesita para cargar el `socket.io-client`, que expone un global `io` (y el endpoint `GET /socket.io/socket.io.js`), y luego conectar.

Si deseas usar la versión local del archivo JS del lado del cliente, puedes encontrarlo en `node_modules/socket.io/client-dist/socket.io.js`.

:::tip

También puedes usar un CDN en lugar de los archivos locales (ej. `<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>`).

:::

Observa que no estoy especificando ninguna URL cuando llamo a `io()`, ya que por defecto intenta conectarse al host que sirve la página.

:::note

Si estás detrás de un proxy inverso como apache o nginx, por favor consulta [la documentación correspondiente](/docs/v4/reverse-proxy/).

Si estás alojando tu aplicación en una carpeta que *no* es la raíz de tu sitio web (ej., `https://example.com/chatapp`) entonces también necesitas especificar el [path](/docs/v4/server-options/#path) tanto en el servidor como en el cliente.

:::

Si ahora reinicias el proceso (presionando Control+C y ejecutando `node index.js` de nuevo) y luego refrescas la página web, deberías ver la consola imprimir "un usuario se conectó".

Intenta abrir varias pestañas, y verás varios mensajes.

<img src="/images/chat-4.png" alt="Una consola mostrando varios mensajes, indicando que algunos usuarios se han conectado" />

Cada socket también dispara un evento especial `disconnect`:

```js
io.on('connection', (socket) => {
  console.log('un usuario se conectó');
  socket.on('disconnect', () => {
    console.log('usuario desconectado');
  });
});
```

Luego si refrescas una pestaña varias veces puedes verlo en acción.

<img src="/images/chat-5.png" alt="Una consola mostrando varios mensajes, indicando que algunos usuarios se han conectado y desconectado" />

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step3?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step3?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step3?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step3?file=index.js)


  </TabItem>
</Tabs>

:::
