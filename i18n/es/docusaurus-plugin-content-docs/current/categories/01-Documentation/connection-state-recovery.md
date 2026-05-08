---
title: Recuperación del estado de conexión
sidebar_position: 4
slug: /connection-state-recovery
---

La recuperación del estado de conexión es una característica que permite restaurar el estado de un cliente después de una desconexión temporal, incluyendo cualquier paquete perdido.

:::info

Esta característica fue añadida en la versión `4.6.0`, lanzada en febrero de 2023.

Las notas de lanzamiento se pueden encontrar [aquí](../../changelog/4.6.0.md).

:::

## Descargo de responsabilidad

Bajo condiciones reales, un cliente Socket.IO inevitablemente experimentará desconexiones temporales, independientemente de la calidad de la conexión.

Esta característica te ayudará a lidiar con tales desconexiones, pero por favor ten en cuenta que la recuperación **no siempre será exitosa**. Es por eso que todavía necesitarás manejar el caso donde los estados del cliente y el servidor deben sincronizarse.

## Uso

La recuperación del estado de conexión debe ser habilitada por el servidor:

```js
const io = new Server(httpServer, {
  connectionStateRecovery: {
    // la duración del respaldo de las sesiones y los paquetes
    maxDisconnectionDuration: 2 * 60 * 1000,
    // si se deben omitir los middlewares tras una recuperación exitosa
    skipMiddlewares: true,
  }
});
```

:::caution

La característica de recuperación del estado de conexión está diseñada para lidiar con desconexiones intermitentes, así que por favor usa un valor razonable para `maxDisconnectionDuration`.

:::

Ante una desconexión inesperada (es decir, no una desconexión manual con `socket.disconnect()`), el servidor almacenará el `id`, las salas y el atributo `data` del socket.

Luego, tras la reconexión, el servidor intentará restaurar el estado del cliente. El atributo `recovered` indica si esta recuperación fue exitosa:

*Servidor*

```js
io.on("connection", (socket) => {
  if (socket.recovered) {
    // la recuperación fue exitosa: socket.id, socket.rooms y socket.data fueron restaurados
  } else {
    // sesión nueva o no recuperable
  }
});
```

*Cliente*

```js
socket.on("connect", () => {
  if (socket.recovered) {
    // cualquier evento perdido durante el período de desconexión se recibirá ahora
  } else {
    // sesión nueva o no recuperable
  }
});
```

Puedes verificar que la recuperación está funcionando forzando el cierre del motor subyacente:

```js
import { io } from "socket.io-client";

const socket = io({
  reconnectionDelay: 10000, // por defecto es 1000
  reconnectionDelayMax: 10000 // por defecto es 5000
});

socket.on("connect", () => {
  console.log("¿recuperado?", socket.recovered);

  setTimeout(() => {
    if (socket.io.engine) {
      // cerrar la conexión de bajo nivel y activar una reconexión
      socket.io.engine.close();
    }
  }, 10000);
});
```

:::tip

También puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/socket.io/tree/main/examples/connection-state-recovery-example/esm?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/socket.io/tree/main/examples/connection-state-recovery-example/esm?file=index.js)

:::

## Compatibilidad con adaptadores existentes

| Adaptador                                                        |                                                       ¿Soporte?                                                        |
|------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------:|
| Adaptador integrado (en memoria)                                 |                                                 SÍ :white_check_mark:                                                  |
| [Adaptador Redis](../05-Adapters/adapter-redis.md)               |                                                     NO<sup>1</sup>                                                     |
| [Adaptador Redis Streams](../05-Adapters/adapter-redis-streams.md) |                                                 SÍ :white_check_mark:                                                  |
| [Adaptador MongoDB](../05-Adapters/adapter-mongo.md)             | SÍ :white_check_mark: (desde la versión [`0.3.0`](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.3.0)) |
| [Adaptador Postgres](../05-Adapters/adapter-postgres.md)         |                                                          WIP                                                           |
| [Adaptador Cluster](../05-Adapters/adapter-cluster.md)           |                                                          WIP                                                           |

[1] Persistir los paquetes no es compatible con el mecanismo Redis PUB/SUB.

## Cómo funciona internamente

- el servidor envía un ID de sesión [durante el handshake](../08-Miscellaneous/sio-protocol.md#connection-to-a-namespace-1) (que es diferente del atributo `id` existente, que es público y puede compartirse libremente)

Ejemplo:

```
40{"sid":"GNpWD7LbGCBNCr8GAAAB","pid":"YHcX2sdAF1z452-HAAAW"}

donde

4         => el tipo de mensaje Engine.IO
0         => el tipo CONNECT de Socket.IO
GN...AB   => el id público de la sesión
YH...AW   => el id privado de la sesión
```

- el servidor también incluye un offset en [cada paquete](../08-Miscellaneous/sio-protocol.md#sending-and-receiving-data-1) (añadido al final del array de datos, para compatibilidad hacia atrás)

Ejemplo:

```
42["foo","MzUPkW0"]

donde

4         => el tipo de mensaje Engine.IO
2         => el tipo EVENT de Socket.IO
foo       => el nombre del evento (socket.emit("foo"))
MzUPkW0   => el offset
```

:::note

Para que la recuperación tenga éxito, el servidor debe enviar al menos un evento, para inicializar el offset en el lado del cliente.

:::

- tras una desconexión temporal, el servidor almacena el estado del cliente por un tiempo dado (implementado a nivel del adaptador)

- tras la reconexión, el cliente envía tanto el ID de sesión como el último offset que procesó, y el servidor intenta restaurar el estado

Ejemplo:

```
40{"pid":"YHcX2sdAF1z452-HAAAW","offset":"MzUPkW0"}

donde

4         => el tipo de mensaje Engine.IO
0         => el tipo CONNECT de Socket.IO
YH...AW   => el id privado de la sesión
MzUPkW0   => el último offset procesado
```
