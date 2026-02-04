---
title: Instalación del servidor
sidebar_label: Instalación
sidebar_position: 1
slug: /server-installation/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::info

La última versión actualmente es `4.8.3`, lanzada en diciembre de 2025.

Puedes encontrar las notas de la versión [aquí](../../changelog/4.8.3.md).

:::

## Prerrequisitos

Por favor asegúrate de que [Node.js](https://nodejs.org/es/) esté instalado en tu sistema. La versión actual de Soporte a Largo Plazo (LTS) es un punto de partida ideal, ver [aquí](https://github.com/nodejs/Release#release-schedule).

:::info

Se necesita al menos Node.js 10, las versiones anteriores ya no son soportadas.

:::

## Instalación

Para instalar la última versión:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install socket.io
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add socket.io
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add socket.io
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add socket.io
```

  </TabItem>
</Tabs>

Para instalar una versión específica:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install socket.io@version
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add socket.io@version
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add socket.io@version
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add socket.io@version
```

  </TabItem>
</Tabs>

## Paquetes adicionales

Por defecto, Socket.IO usa el servidor WebSocket proporcionado por el paquete [ws](https://www.npmjs.com/package/ws).

Hay 2 paquetes opcionales que se pueden instalar junto con este paquete. Estos paquetes son complementos binarios que mejoran ciertas operaciones. Los binarios precompilados están disponibles para las plataformas más populares, así que no necesariamente necesitas tener un compilador C++ instalado en tu máquina.

- [bufferutil](https://www.npmjs.com/package/bufferutil): Permite realizar eficientemente operaciones como enmascarar y desenmascarar la carga de datos de los frames WebSocket.
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate): Permite verificar eficientemente si un mensaje contiene UTF-8 válido como lo requiere la especificación.

Para instalar esos paquetes:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install --save-optional bufferutil utf-8-validate
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add --optional bufferutil utf-8-validate
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add -O bufferutil utf-8-validate
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add --optional bufferutil utf-8-validate
```

  </TabItem>
</Tabs>

Por favor nota que estos paquetes son opcionales, el servidor WebSocket recurrirá a la implementación en JavaScript si no están disponibles. Más información se puede encontrar [aquí](https://github.com/websockets/ws/#opt-in-for-performance-and-spec-compliance).

## Otras implementaciones de servidor WebSocket

Cualquier implementación de servidor WebSocket que exponga la misma API que ws (notablemente el método [handleUpgrade](https://github.com/websockets/ws/blob/master/doc/ws.md#serverhandleupgraderequest-socket-head-callback)) puede ser usada.

Por ejemplo, puedes usar el paquete [eiows](https://www.npmjs.com/package/eiows), que es un fork del paquete (ahora obsoleto) [uws](https://www.npmjs.com/package/uws):

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install eiows
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add eiows
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add eiows
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add eiows
```

  </TabItem>
</Tabs>

Y luego usa la opción `wsEngine`:

```js
const { Server } = require("socket.io");
const eiows = require("eiows");

const io = new Server(3000, {
  wsEngine: eiows.Server
});
```

Esta implementación "permite, pero no garantiza" mejoras significativas de rendimiento y uso de memoria sobre la implementación predeterminada. Como siempre, por favor haz benchmarks contra tu propio uso.

## Uso con `µWebSockets.js` {#usage-with-uwebsockets}

A partir de la versión [4.4.0](/blog/socket-io-4-4-0/), un servidor Socket.IO ahora puede vincularse a un servidor [`µWebSockets.js`](https://github.com/uNetworking/uWebSockets.js).

Instalación:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install uWebSockets.js@uNetworking/uWebSockets.js#v20.52.0
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add uWebSockets.js@uNetworking/uWebSockets.js#v20.52.0
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add uWebSockets.js@uNetworking/uWebSockets.js#v20.52.0
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add uWebSockets.js@uNetworking/uWebSockets.js#v20.52.0
```

  </TabItem>
</Tabs>

Uso:

```js
const { App } = require("uWebSockets.js");
const { Server } = require("socket.io");

const app = App();
const io = new Server();

io.attachApp(app);

io.on("connection", (socket) => {
  // ...
});

app.listen(3000, (token) => {
  if (!token) {
    console.warn("puerto ya en uso");
  }
});
```

## Uso con Bun

El paquete `@socket.io/bun-engine` proporciona un motor de bajo nivel específico para Bun, destinado a aprovechar la velocidad y escalabilidad de Bun.

### Instalación

```
bun add socket.io @socket.io/bun-engine
```

### Uso

```js
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";

const io = new Server();

const engine = new Engine({
  path: "/socket.io/",
});

io.bind(engine);

io.on("connection", (socket) => {
  // ...
});

export default {
  port: 3000,
  idleTimeout: 30, // debe ser mayor que la opción "pingInterval" del motor, que por defecto es 25 segundos

  ...engine.handler(),
};
```

:::tip

Cualquier adaptador existente puede ser usado sin ninguna modificación.

:::

## Miscelánea

### Árbol de dependencias

Una instalación básica del servidor incluye **21** paquetes, de los cuales **6** son mantenidos por nuestro equipo:

```
└─┬ socket.io@4.8.1
  ├─┬ accepts@1.3.8
  │ ├─┬ mime-types@2.1.35
  │ │ └── mime-db@1.52.0
  │ └── negotiator@0.6.3
  ├── base64id@2.0.0
  ├─┬ cors@2.8.5
  │ ├── object-assign@4.1.1
  │ └── vary@1.1.2
  ├─┬ debug@4.3.7
  │ └── ms@2.1.3
  ├─┬ engine.io@6.6.4
  │ ├─┬ @types/cors@2.8.17
  │ │ └── @types/node@22.13.9 deduped
  │ ├─┬ @types/node@22.13.9
  │ │ └── undici-types@6.20.0
  │ ├── accepts@1.3.8 deduped
  │ ├── base64id@2.0.0 deduped
  │ ├── cookie@0.7.2
  │ ├── cors@2.8.5 deduped
  │ ├── debug@4.3.7 deduped
  │ ├── engine.io-parser@5.2.3
  │ └─┬ ws@8.17.1
  │   ├── UNMET OPTIONAL DEPENDENCY bufferutil@^4.0.1
  │   └── UNMET OPTIONAL DEPENDENCY utf-8-validate@>=5.0.2
  ├─┬ socket.io-adapter@2.5.5
  │ ├── debug@4.3.7 deduped
  │ └── ws@8.17.1 deduped
  └─┬ socket.io-parser@4.2.4
    ├── @socket.io/component-emitter@3.1.2
    └── debug@4.3.7 deduped
```

:::info

Las declaraciones de tipos para paquetes de terceros están incluidas, para facilitar el uso de la biblioteca para usuarios de TypeScript (pero a costa de un paquete ligeramente más grande).

Ver también: https://github.com/microsoft/types-publisher/issues/81#issuecomment-234051345

:::


### Versiones transitivas

El paquete `engine.io` trae el motor que es responsable de gestionar las conexiones de bajo nivel (HTTP long-polling o WebSocket). Ver también: [Cómo funciona](../01-Documentation/how-it-works.md)

| versión de `socket.io` | versión de `engine.io` | versión de `ws` |
|------------------------|------------------------|-----------------|
| `4.8.x`                | `6.6.x`                | `8.17.x`        |
| `4.7.x`                | `6.5.x`                | `8.17.x`        |
| `4.6.x`                | `6.4.x`                | `8.11.x`        |
| `4.5.x`                | `6.2.x`                | `8.2.x`         |
| `4.4.x`                | `6.1.x`                | `8.2.x`         |
| `4.3.x`                | `6.0.x`                | `8.2.x`         |
| `4.2.x`                | `5.2.x`                | `7.4.x`         |
| `4.1.x`                | `5.1.x`                | `7.4.x`         |
| `4.0.x`                | `5.0.x`                | `7.4.x`         |
| `3.1.x`                | `4.1.x`                | `7.4.x`         |
| `3.0.x`                | `4.0.x`                | `7.4.x`         |
| `2.5.x`                | `3.6.x`                | `7.5.x`         |
| `2.4.x`                | `3.5.x`                | `7.4.x`         |
