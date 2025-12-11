---
title: Inicialización del cliente
sidebar_label: Inicialización
sidebar_position: 2
slug: /client-initialization/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Una vez que hayas [instalado](client-installation.md) la biblioteca del cliente Socket.IO, ahora puedes inicializar el cliente. La lista completa de opciones se puede encontrar [aquí](../../client-options.md).

:::tip

Para usuarios de TypeScript, es posible proporcionar sugerencias de tipo para los eventos. Por favor revisa [esto](../01-Documentation/typescript.md).

:::

En los ejemplos a continuación, el objeto `io` proviene de:

- la importación por `<script>`

```html
<script src="/socket.io/socket.io.js"></script>
```

- una importación ESM

```html
<script type="module">
  import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
</script>
```

- NPM

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { io } = require("socket.io-client");
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { io } from "socket.io-client";
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { io } from "socket.io-client";
```

  </TabItem>
</Tabs>

## Desde el mismo dominio

Si tu frontend se sirve desde el mismo dominio que tu servidor, puedes simplemente usar:

```js
const socket = io();
```

La URL del servidor se deducirá del objeto [window.location](https://developer.mozilla.org/es/docs/Web/API/Window/location).

## Desde un dominio diferente

En caso de que tu frontend no se sirva desde el mismo dominio que tu servidor, tienes que pasar la URL de tu servidor.

```js
const socket = io("https://server-domain.com");
```

En ese caso, por favor asegúrate de habilitar [Cross-Origin Resource Sharing (CORS)](../02-Server/handling-cors.md) en el servidor.

:::info

Puedes usar tanto `https` como `wss` (respectivamente, `http` o `ws`).

:::

```js
// las siguientes formas son similares
const socket = io("https://server-domain.com");
const socket = io("wss://server-domain.com");
const socket = io("server-domain.com"); // solo en el navegador cuando la página se sirve sobre https (no funcionará en Node.js)
```

## Namespace personalizado

En los ejemplos anteriores, el cliente se conectará al namespace principal. Usar solo el namespace principal debería ser suficiente para la mayoría de los casos de uso, pero puedes especificar el namespace con:

```js
// versión del mismo origen
const socket = io("/admin");
// versión cross origin
const socket = io("https://server-domain.com/admin");
```

Puedes encontrar más detalles sobre namespaces [aquí](../06-Advanced/namespaces.md).

## Opciones

La lista completa de opciones disponibles se puede encontrar [aquí](../../client-options.md).
