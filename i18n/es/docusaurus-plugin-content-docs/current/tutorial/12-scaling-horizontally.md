---
title: "Tutorial paso #9 - Escalando horizontalmente"
sidebar_label: "Paso #9: Escalando horizontalmente"
slug: step-9
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Escalando horizontalmente

Ahora que nuestra aplicación es resiliente a interrupciones temporales de red, veamos cómo podemos escalarla horizontalmente para poder soportar miles de clientes concurrentes.

:::note

- Escalado horizontal (también conocido como "scaling out") significa añadir nuevos servidores a tu infraestructura para hacer frente a nuevas demandas
- Escalado vertical (también conocido como "scaling up") significa añadir más recursos (poder de procesamiento, memoria, almacenamiento, ...) a tu infraestructura existente

:::

Primer paso: usemos todos los núcleos disponibles del host. Por defecto, Node.js ejecuta tu código Javascript en un solo hilo, lo que significa que incluso con una CPU de 32 núcleos, solo se usará un núcleo. Afortunadamente, el [módulo `cluster`](https://nodejs.org/api/cluster.html#cluster) de Node.js proporciona una forma conveniente de crear un hilo worker por núcleo.

También necesitaremos una forma de reenviar eventos entre los servidores Socket.IO. Llamamos a este componente un "Adaptador".

<ThemedImage
  alt="El evento 'hello' se reenvía a los otros servidores"
  sources={{
    light: useBaseUrl('/images/tutorial/adapter.png'),
    dark: useBaseUrl('/images/tutorial/adapter-dark.png'),
  }}
/>

Así que instalemos el adaptador cluster:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install @socket.io/cluster-adapter
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add @socket.io/cluster-adapter
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add @socket.io/cluster-adapter
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add @socket.io/cluster-adapter
```

  </TabItem>
</Tabs>

Ahora lo conectamos:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js title="index.js"
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
// highlight-start
const { availableParallelism } = require('node:os');
const cluster = require('node:cluster');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');
// highlight-end

if (cluster.isPrimary) {
  // highlight-start
  const numCPUs = availableParallelism();
  // crear un worker por núcleo disponible
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: 3000 + i
    });
  }
  
  // configurar el adaptador en el hilo primario
  return setupPrimary();
  // highlight-end
}

async function main() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
    // highlight-start
    // configurar el adaptador en cada hilo worker
    adapter: createAdapter()
    // highlight-end
  });

  // [...]

  // highlight-start
  // cada worker escuchará en un puerto distinto
  const port = process.env.PORT;

  server.listen(port, () => {
    console.log(`servidor corriendo en http://localhost:${port}`);
  });
  // highlight-end
}

main();
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js title="index.js"
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
// highlight-start
import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';
// highlight-end

if (cluster.isPrimary) {
  // highlight-start
  const numCPUs = availableParallelism();
  // crear un worker por núcleo disponible
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: 3000 + i
    });
  }
  
  // configurar el adaptador en el hilo primario
  setupPrimary();
  // highlight-end
} else {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
    // highlight-start
    // configurar el adaptador en cada hilo worker
    adapter: createAdapter()
    // highlight-end
  });

  // [...]

  // highlight-start
  // cada worker escuchará en un puerto distinto
  const port = process.env.PORT;

  server.listen(port, () => {
    console.log(`servidor corriendo en http://localhost:${port}`);
  });
  // highlight-end
}
```

  </TabItem>
</Tabs>

¡Eso es todo! Esto creará un hilo worker por CPU disponible en tu máquina. Veámoslo en acción:

<video controls width="100%"><source src="/videos/tutorial/scaling-up.mp4" /></video>

Como puedes ver en la barra de direcciones, cada pestaña del navegador está conectada a un servidor Socket.IO diferente, y el adaptador simplemente está reenviando los eventos `chat message` entre ellos.

:::tip

Actualmente hay 5 implementaciones oficiales de adaptadores:

- el [adaptador Redis](../categories/05-Adapters/adapter-redis.md)
- el [adaptador Redis Streams](../categories/05-Adapters/adapter-redis-streams.md)
- el [adaptador MongoDB](../categories/05-Adapters/adapter-mongo.md)
- el [adaptador Postgres](../categories/05-Adapters/adapter-postgres.md)
- el [adaptador Cluster](../categories/05-Adapters/adapter-cluster.md)

Así que puedes elegir el que mejor se adapte a tus necesidades. Sin embargo, ten en cuenta que algunas implementaciones no soportan la característica de Recuperación del estado de conexión, puedes encontrar la matriz de compatibilidad [aquí](../categories/01-Documentation/connection-state-recovery.md#compatibility-with-existing-adapters).

:::

:::note

En la mayoría de los casos, también necesitarías asegurar que todas las solicitudes HTTP de una sesión Socket.IO lleguen al mismo servidor (también conocido como "sticky session"). Esto no es necesario aquí, ya que cada servidor Socket.IO tiene su propio puerto.

Más información [aquí](../categories/02-Server/using-multiple-nodes.md).

:::

¡Y eso finalmente completa nuestra aplicación de chat! En este tutorial, hemos visto cómo:

- enviar un evento entre el cliente y el servidor
- difundir un evento a todos o un subconjunto de clientes conectados
- manejar desconexiones temporales
- escalar

¡Ahora deberías tener una mejor visión general de las características proporcionadas por Socket.IO. Ahora es tu turno de construir tu propia aplicación en tiempo real!

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step9?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step9?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step9?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step9?file=index.js)
- [Repl.it](https://replit.com/github/socketio/chat-example)


  </TabItem>
</Tabs>

:::
