---
title: Uso con PM2
sidebar_position: 4
slug: /pm2/
---

PM2 es un gestor de procesos de producción para aplicaciones Node.js con un balanceador de carga incorporado. Te permite mantener las aplicaciones vivas para siempre, recargarlas sin tiempo de inactividad y facilitar tareas comunes de administración del sistema.

Puedes encontrar su documentación aquí: https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/

Para escalar un servidor Socket.IO con PM2, hay tres soluciones:

- deshabilitar HTTP long-polling en el lado del cliente

```js
const socket = io({
  transports: ["websocket"]
});
```

Aunque en ese caso, no habrá fallback a HTTP long-polling si la conexión WebSocket no puede establecerse.

- usar un puerto distinto para cada worker, y un balanceador de carga como nginx delante de ellos

- usar `@socket.io/pm2`

## Instalación

```
npm install -g @socket.io/pm2
```

Si `pm2` ya está instalado, tendrás que eliminarlo primero:

```
npm remove -g pm2
```

`@socket.io/pm2` puede usarse como un reemplazo directo de `pm2`, y soporta todos los comandos de la utilidad clásica `pm2`.

La única diferencia viene de [este commit](https://github.com/socketio/pm2/commit/8c29a7feb6cbde3c8ef9eb072fee284686f1553f).

## Uso

`worker.js`

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/cluster-adapter");
const { setupWorker } = require("@socket.io/sticky");

const httpServer = createServer();
const io = new Server(httpServer);

io.adapter(createAdapter());

setupWorker(io);

io.on("connection", (socket) => {
  console.log(`conectado ${socket.id}`);
});
```

`ecosystem.config.js`

```js
module.exports = {
  apps : [{
    script    : "worker.js",
    instances : "max",
    exec_mode : "cluster"
  }]
}
```

Y luego ejecuta `pm2 start ecosystem.config.js` (o `pm2 start worker.js -i 0`). ¡Eso es todo! Ahora puedes alcanzar el clúster Socket.IO en el puerto 8080.

## Cómo funciona

Al [escalar a múltiples nodos](../02-Server/using-multiple-nodes.md), hay dos cosas que hacer:

- habilitar sesiones sticky, para que las solicitudes HTTP de una sesión Socket.IO sean enrutadas al mismo worker
- usar un adaptador personalizado, para que los paquetes sean transmitidos a todos los clientes, incluso si están conectados a otro worker

Para lograr esto, `@socket.io/pm2` incluye dos paquetes adicionales:

- [`@socket.io/sticky`](https://github.com/socketio/socket.io-sticky)
- [`@socket.io/cluster-adapter`](https://github.com/socketio/socket.io-cluster-adapter)

La única diferencia con `pm2` viene de [este commit](https://github.com/socketio/pm2/commit/8c29a7feb6cbde3c8ef9eb072fee284686f1553f):

- el proceso God ahora crea su propio servidor HTTP y enruta las solicitudes HTTP al worker correcto
- el proceso God también retransmite los paquetes entre los workers, para que `io.emit()` alcance correctamente a todos los clientes

Por favor nota que si tienes varios hosts cada uno ejecutando un clúster PM2, tendrás que usar otro adaptador, como el [adaptador Redis](../05-Adapters/adapter-redis.md).

El código fuente del fork se puede encontrar [aquí](https://github.com/socketio/pm2). Intentaremos seguir de cerca las versiones del paquete `pm2`.
