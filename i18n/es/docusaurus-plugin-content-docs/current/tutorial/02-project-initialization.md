---
title: "Tutorial paso #1 - Inicialización del proyecto"
sidebar_label: "Paso #1: Inicialización del proyecto"
slug: step-1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Inicialización del proyecto

El primer objetivo es configurar una página HTML simple que sirva un formulario y una lista de mensajes. Vamos a usar el framework web de Node.JS `express` para este fin. Asegúrate de que [Node.JS](https://nodejs.org) esté instalado.

Primero vamos a crear un archivo de manifiesto `package.json` que describa nuestro proyecto. Te recomiendo que lo coloques en un directorio vacío dedicado (yo llamaré al mío `socket-chat-example`).

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```json
{
  "name": "socket-chat-example",
  "version": "0.0.1",
  "description": "mi primera app con socket.io",
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
  "description": "mi primera app con socket.io",
  "type": "module",
  "dependencies": {}
}
```

  </TabItem>
</Tabs>

:::caution

La propiedad "name" debe ser única, no puedes usar un valor como "socket.io" o "express", porque npm se quejará al instalar la dependencia.

:::

Ahora, para poblar fácilmente la propiedad `dependencies` con las cosas que necesitamos, usaremos `npm install`:

```
npm install express@4
```

Una vez instalado podemos crear un archivo `index.js` que configurará nuestra aplicación.

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require('express');
const { createServer } = require('node:http');

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
  res.send('<h1>Hola mundo</h1>');
});

server.listen(3000, () => {
  console.log('servidor corriendo en http://localhost:3000');
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
  res.send('<h1>Hola mundo</h1>');
});

server.listen(3000, () => {
  console.log('servidor corriendo en http://localhost:3000');
});
```

  </TabItem>
</Tabs>

Esto significa que:

- Express inicializa `app` para ser un manejador de funciones que puedes suministrar a un servidor HTTP (como se ve en la línea 5).
- Definimos un manejador de ruta `/` que se llama cuando accedemos a la página de inicio de nuestro sitio web.
- Hacemos que el servidor http escuche en el puerto 3000.

Si ejecutas `node index.js` deberías ver lo siguiente:

<img src="/images/chat-1.png" alt="Una consola diciendo que el servidor ha comenzado a escuchar en el puerto 3000" />

Y si apuntas tu navegador a `http://localhost:3000`:

<img src="/images/chat-2.png" alt="Un navegador mostrando un gran 'Hola Mundo'" />

¡Hasta ahora, todo bien!
