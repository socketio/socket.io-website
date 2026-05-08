---
title: Instalación del cliente
sidebar_label: Instalación
sidebar_position: 1
slug: /client-installation/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::info

La última versión actual es `4.8.1`, lanzada en octubre de 2024.

Puedes encontrar las notas de la versión [aquí](../../changelog/4.8.1.md).

:::

## Compatibilidad de versiones

Aquí está la tabla de compatibilidad entre el servidor y el cliente JS:

<table>
    <tr>
        <th rowspan="2">Versión del cliente JS</th>
        <th colspan="4">Versión del servidor Socket.IO</th>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">NO</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center"><b>SÍ</b><sup>1</sup></td>
        <td align="center"><b>SÍ</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">3.x</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center"><b>SÍ</b></td>
    </tr>
    <tr>
        <td align="center">4.x</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center"><b>SÍ</b></td>
    </tr>
</table>

[1] Sí, con [allowEIO3: true](../../server-options.md#alloweio3)

Por favor revisa las guías de migración asociadas:

- [v2 a v3](../07-Migrations/migrating-from-2-to-3.md)
- [v3 a v4](../07-Migrations/migrating-from-3-to-4.md)

## Soporte de navegadores

Socket.IO soporta IE9 y superiores. IE 6/7/8 ya no son soportados.

La compatibilidad de navegadores se prueba gracias a la increíble plataforma Sauce Labs:

![Soporte de navegadores](/images/saucelabs.svg)

## Instalación

### Build independiente

Por defecto, el servidor Socket.IO expone un bundle del cliente en `/socket.io/socket.io.js`.

`io` se registrará como una variable global:

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

Si no necesitas esto (ver otras opciones abajo), puedes deshabilitar la funcionalidad en el lado del servidor:

```js
const { Server } = require("socket.io");

const io = new Server({
  serveClient: false
});
```

### Desde un CDN

También puedes incluir el bundle del cliente desde un CDN:

```html
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js" integrity="sha384-mkQ3/7FUtcGyoppY6bz/PORYoGqOl7/aSUMn2ymDOJcapfS6PHqxhRTMh1RR0Q6+" crossorigin="anonymous"></script>
```

Socket.IO también está disponible desde otros CDN:

- cdnjs: https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.1/socket.io.min.js
- jsDelivr: https://cdn.jsdelivr.net/npm/socket.io-client@4.8.1/dist/socket.io.min.js
- unpkg: https://unpkg.com/socket.io-client@4.8.1/dist/socket.io.min.js

Hay varios bundles disponibles:

| Nombre              | Tamaño             | Descripción |
|:------------------|:-----------------|:------------|
| socket.io.js               | 34.7 kB gzip     | Versión sin minificar, con [debug](https://www.npmjs.com/package/debug)    |
| socket.io.min.js           | 14.7 kB min+gzip | Versión de producción, sin [debug](https://www.npmjs.com/package/debug) |
| socket.io.msgpack.min.js   | 15.3 kB min+gzip | Versión de producción, sin [debug](https://www.npmjs.com/package/debug) y con el [parser msgpack](https://github.com/socketio/socket.io-msgpack-parser)    |

El paquete [debug](https://www.npmjs.com/package/debug) permite imprimir información de depuración en la consola. Puedes encontrar más información [aquí](../01-Documentation/logging-and-debugging.md).

Durante el desarrollo, recomendamos usar el bundle `socket.io.js`. Configurando `localStorage.debug = 'socket.io-client:socket'`, cualquier evento recibido por el cliente se imprimirá en la consola.

Para producción, por favor usa el bundle `socket.io.min.js`, que es un build optimizado que excluye el paquete debug.

### Desde NPM

El cliente Socket.IO es compatible con bundlers como [webpack](https://webpack.js.org/) o [browserify](http://browserify.org/).

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install socket.io-client
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add socket.io-client
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add socket.io-client
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add socket.io-client
```

  </TabItem>
</Tabs>

El cliente también puede ejecutarse desde Node.js.

Nota: por las razones citadas arriba, podrías querer excluir debug de tu bundle del navegador. Con webpack, puedes usar [webpack-remove-debug](https://github.com/johngodley/webpack-remove-debug).

Nota para usuarios de TypeScript: los tipos ahora están incluidos en el paquete `socket.io-client` y por lo tanto los tipos de `@types/socket.io-client` ya no son necesarios y de hecho podrían causar errores:

```
Object literal may only specify known properties, and 'extraHeaders' does not exist in type 'ConnectOpts'
```

## Miscelánea

### Árbol de dependencias

Una instalación básica del cliente incluye **9** paquetes, de los cuales **5** son mantenidos por nuestro equipo:

```
└─┬ socket.io-client@4.8.1
  ├── @socket.io/component-emitter@3.1.2
  ├─┬ debug@4.3.7
  │ └── ms@2.1.3
  ├─┬ engine.io-client@6.6.3
  │ ├── @socket.io/component-emitter@3.1.2 deduped
  │ ├── debug@4.3.7 deduped
  │ ├── engine.io-parser@5.2.3
  │ ├─┬ ws@8.17.1
  │ │ ├── UNMET OPTIONAL DEPENDENCY bufferutil@^4.0.1
  │ │ └── UNMET OPTIONAL DEPENDENCY utf-8-validate@>=5.0.2
  │ └── xmlhttprequest-ssl@2.1.2
  └─┬ socket.io-parser@4.2.4
    ├── @socket.io/component-emitter@3.1.2 deduped
    └── debug@4.3.7 deduped
```

### Versiones transitivas

El paquete `engine.io-client` trae el motor que es responsable de manejar las conexiones de bajo nivel (HTTP long-polling o WebSocket). Ver también: [Cómo funciona](../01-Documentation/how-it-works.md)

| Versión de `socket.io-client` | Versión de `engine.io-client` | Versión de `ws`<sup>1</sup> |
|----------------------------|----------------------------|--------------------------|
| `4.8.x`                    | `6.6.x`                    | `8.17.x`                 |
| `4.7.x`                    | `6.5.x`                    | `8.17.x`                 |
| `4.6.x`                    | `6.4.x`                    | `8.11.x`                 |
| `4.5.x`                    | `6.2.x`                    | `8.2.x`                  |
| `4.4.x`                    | `6.1.x`                    | `8.2.x`                  |
| `4.3.x`                    | `6.0.x`                    | `8.2.x`                  |
| `4.2.x`                    | `5.2.x`                    | `7.4.x`                  |
| `4.1.x`                    | `5.1.x`                    | `7.4.x`                  |
| `4.0.x`                    | `5.0.x`                    | `7.4.x`                  |
| `3.1.x`                    | `4.1.x`                    | `7.4.x`                  |
| `3.0.x`                    | `4.0.x`                    | `7.4.x`                  |
| `2.5.x`                    | `3.5.x`                    | `7.5.x`                  |
| `2.4.x`                    | `3.5.x`                    | `7.5.x`                  |

[1] solo para usuarios de Node.js. En el navegador, se usa la API nativa de WebSocket.
