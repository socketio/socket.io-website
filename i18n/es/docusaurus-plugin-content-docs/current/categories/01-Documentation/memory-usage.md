---
title: Uso de memoria
sidebar_position: 9
slug: /memory-usage/
---

Los recursos consumidos por tu servidor Socket.IO dependerán principalmente de:

- el número de clientes conectados
- el número de mensajes ([emit básico](../04-Events/emitting-events.md#basic-emit), [emit con confirmación](../04-Events/emitting-events.md#acknowledgements) y [broadcast](../04-Events/broadcasting-events.md)) recibidos y enviados por segundo

:::info

El uso de memoria del servidor Socket.IO debería escalar **linealmente** con el número de clientes conectados.

:::

:::tip

Por defecto, se mantiene en memoria una referencia a la primera solicitud HTTP de cada sesión. Esta referencia es necesaria cuando se trabaja con `express-session` por ejemplo (ver [aquí](/how-to/use-with-express-session)), pero puede descartarse para ahorrar memoria:

```js
io.engine.on("connection", (rawSocket) => {
  rawSocket.request = null;
});
```

:::

El código fuente para reproducir los resultados presentados en esta página se puede encontrar [aquí](https://github.com/socketio/socket.io-benchmarks).

Ver también:

- [Pruebas de carga](../06-Advanced/load-testing.md)
- [Ajuste de rendimiento](../06-Advanced/performance-tuning.md)

## Uso de memoria por implementación de servidor WebSocket

El uso de memoria del servidor Socket.IO depende en gran medida del uso de memoria de la implementación subyacente del servidor WebSocket.

El gráfico a continuación muestra el uso de memoria del servidor Socket.IO, desde 0 hasta 10,000 clientes conectados, con:

- un servidor Socket.IO basado en el paquete [`ws`](https://github.com/websockets/ws) (usado por defecto)
- un servidor Socket.IO basado en el paquete [`eiows`](https://github.com/mmdevries/eiows), una implementación de servidor WebSocket en C++ (ver [pasos de instalación](../02-Server/server-installation.md#other-websocket-server-implementations))
- un servidor Socket.IO basado en el paquete [`µWebSockets.js`](https://github.com/uNetworking/uWebSockets.js), una alternativa en C++ al servidor HTTP nativo de Node.js (ver [pasos de instalación](../02-Server/server-installation.md#usage-with-uwebsockets))
- un servidor WebSocket simple basado en el paquete [`ws`](https://github.com/websockets/ws)

![Gráfico del uso de memoria por implementación de servidor WebSocket](/images/memory-usage-per-impl.png?v=2)


Probado en `Ubuntu 22.04 LTS` con Node.js `v20.3.0`, con las siguientes versiones de paquetes:

- `socket.io@4.7.2`
- `eiows@6.7.2`
- `uWebSockets.js@20.33.0`
- `ws@8.11.0`

## Uso de memoria a lo largo del tiempo

El gráfico a continuación muestra el uso de memoria del servidor Socket.IO a lo largo del tiempo, desde 0 hasta 10,000 clientes conectados.

![Gráfico del uso de memoria a lo largo del tiempo](/images/memory-usage-over-time.png?v=2)

:::note

Para propósitos de demostración, llamamos manualmente al recolector de basura al final de cada ola de clientes:

```js
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    const lastToDisconnect = io.of("/").sockets.size === 0;
    if (lastToDisconnect) {
      gc();
    }
  });
});
```

Lo cual explica la caída limpia en el uso de memoria cuando el último cliente se desconecta. Esto no es necesario en tu aplicación, la recolección de basura se activará automáticamente cuando sea necesario.

:::
