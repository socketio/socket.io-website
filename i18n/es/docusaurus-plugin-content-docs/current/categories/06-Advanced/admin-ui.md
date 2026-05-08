---
title: Admin UI
sidebar_position: 3
slug: /admin-ui/
---

La UI de administración de Socket.IO se puede usar para tener una visión general del estado de tu despliegue de Socket.IO.

El código fuente se puede encontrar aquí: https://github.com/socketio/socket.io-admin-ui/

Enlace a la versión hospedada: https://admin.socket.io/

## Características actuales

- visión general de los servidores y los clientes que están actualmente conectados

![Captura de pantalla del dashboard](/images/admin-ui-dashboard.png)

- detalles de cada instancia de socket (transporte activo, handshake, salas, ...)

![Captura de pantalla de la página mostrando los detalles de un socket](/images/admin-ui-socket-details.png)

- detalles de cada sala

![Captura de pantalla de la página mostrando los detalles de una sala](/images/admin-ui-room-details.png)

- detalles de cada evento emitido o recibido por el servidor

![Captura de pantalla de la página mostrando la lista de eventos](/images/admin-ui-events.png)

- operaciones administrativas (join, leave, disconnect)

¡Si tienes algún comentario / sugerencia, no dudes en compartirlo!

## Instalación

### Lado del servidor

Primero, instala el paquete `@socket.io/admin-ui`:

```
npm i @socket.io/admin-ui
```

Y luego invoca el método `instrument` en tu servidor Socket.IO:

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(io, {
  auth: false,
  mode: "development",
});

httpServer.listen(3000);
```

El módulo es compatible con:

- servidor Socket.IO v4
- servidor Socket.IO v3 (>= 3.1.0), pero sin las operaciones en salas (join, leave, desconexión)

Ejemplo con [NestJS](https://docs.nestjs.com/websockets/gateways):

```ts
import { instrument } from "@socket.io/admin-ui";

@WebSocketGateway()
export class MyGateway {
    // ...
    afterInit() {
        instrument(this.server, {
            auth: false,
            mode: "development",
        });
    }
}
```

### Lado del cliente

Luego puedes ir a https://admin.socket.io, o hospedar los archivos encontrados en la carpeta `ui/dist` [aquí](https://github.com/socketio/socket.io-admin-ui/tree/main/ui/dist).

**Nota importante**: el sitio web en https://admin.socket.io es totalmente estático (hospedado en [Vercel](https://vercel.com)), no almacenamos (y nunca lo haremos) ninguna información sobre ti o tu navegador (sin tracking, sin analytics, ...). Dicho esto, hospedar los archivos tú mismo es totalmente válido.

Deberías ver el siguiente modal:

![captura de pantalla del modal de login](/images/admin-ui-login-modal.png)

Por favor ingresa la URL de tu servidor (por ejemplo, `http://localhost:3000` o `https://example.com`) y las credenciales, si aplican (ver la opción `auth` [abajo](#auth)).

### Opciones disponibles

#### `auth`

Valor por defecto: `-`

Esta opción es obligatoria. Puedes deshabilitar la autenticación (por favor usa con precaución):

```js
instrument(io, {
  auth: false
});
```

O usar autenticación básica:

```js
instrument(io, {
  auth: {
    type: "basic",
    username: "admin",
    password: "$2b$10$heqvAkYMez.Va6Et2uXInOnkCT6/uQj1brkrbyG3LpopDklcq7ZOS" // "changeit" encriptado con bcrypt
  },
});
```

:::caution

Por favor ten en cuenta que el paquete `bcrypt` actualmente no soporta hashes que comiencen con el prefijo `$2y$`, que es usado por algunas implementaciones de BCrypt (por ejemplo https://bcrypt-generator.com/ o https://www.bcrypt.fr/). Puedes verificar la validez del hash con:

```
$ node
> require("bcryptjs").compareSync("<la contraseña>", "<el hash>")
true
```

Puedes generar un hash válido con:

```
$ node
> require("bcryptjs").hashSync("changeit", 10)
'$2b$10$LQUE...'
```

Ver también:

- https://github.com/kelektiv/node.bcrypt.js/issues/849
- https://stackoverflow.com/a/36225192/5138796

:::

#### `namespaceName`

Valor por defecto: `/admin`

El nombre del namespace que se creará para manejar las tareas administrativas.

```js
instrument(io, {
  namespaceName: "/custom"
});
```

Este namespace es un namespace clásico de Socket.IO, puedes acceder a él con:

```js
const adminNamespace = io.of("/admin");
```

Más información [aquí](namespaces.md).

#### `readonly`

Valor por defecto: `false`

Si poner la UI de admin en modo solo lectura (no se permite join, leave o disconnect).

```js
instrument(io, {
  readonly: true
});
```

#### `serverId`

Valor por defecto: `require("os").hostname()`

El ID del servidor dado. Si tienes varios servidores Socket.IO en la misma máquina, necesitarás darles un ID distinto:

```js
instrument(io, {
  serverId: `${require("os").hostname()}#${process.pid}`
});
```

#### `store`

Valor por defecto: `new InMemoryStore()`

El store se usa para almacenar los IDs de sesión para que el usuario no tenga que volver a escribir las credenciales al reconectarse.

Si usas autenticación básica en una configuración multi-servidor, deberías proporcionar un store personalizado:

```js
const { instrument, RedisStore } = require("@socket.io/admin-ui");

instrument(io, {
  store: new RedisStore(redisClient)
});
```

#### `mode`

Valor por defecto: `development`

En modo producción, el servidor no enviará todos los detalles sobre las instancias de socket y las salas, reduciendo así la huella de memoria de la instrumentación.

```js
instrument(io, {
  mode: "production"
});
```

El modo producción también puede habilitarse con la variable de entorno NODE_ENV:

```
NODE_ENV=production node index.js
```

## Cómo funciona

El código fuente se puede encontrar aquí: https://github.com/socketio/socket.io-admin-ui/

El método `instrument` simplemente:

- crea un [namespace](namespaces.md) y añade un [middleware](../02-Server/middlewares.md) de autenticación si aplica
- registra listeners para los eventos `connection` y `disconnect` para cada namespace existente para rastrear las instancias de socket
- registra un temporizador que periódicamente enviará estadísticas del servidor a la UI
- registra manejadores para los comandos `join`, `leave` y `_disconnect` enviados desde la UI

## Últimas versiones

- `0.5.1` (Oct 2022): [GitHub release](https://github.com/socketio/socket.io-admin-ui/releases/tag/0.5.1) / [diff](https://github.com/socketio/socket.io-admin-ui/compare/0.5.0...0.5.1)
- `0.5.0` (Sep 2022): [GitHub release](https://github.com/socketio/socket.io-admin-ui/releases/tag/0.5.0) / [diff](https://github.com/socketio/socket.io-admin-ui/compare/0.4.0...0.5.0)
- `0.4.0` (Jun 2022): [GitHub release](https://github.com/socketio/socket.io-admin-ui/releases/tag/0.4.0) / [diff](https://github.com/socketio/socket.io-admin-ui/compare/0.3.0...0.4.0)
