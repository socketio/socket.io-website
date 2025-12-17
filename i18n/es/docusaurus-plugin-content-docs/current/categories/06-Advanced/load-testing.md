---
title: Pruebas de carga
sidebar_position: 5
slug: /load-testing/
---

Ya que Socket.IO tiene su [propio protocolo](https://github.com/socketio/socket.io-protocol), incluyendo handshake, heartbeats y codificación de paquetes personalizada, la forma más fácil de hacer pruebas de carga a tu servidor Socket.IO es usar la biblioteca cliente de Socket.IO y crear *muchos* clientes.

Hay dos soluciones clásicas para hacer esto:

- usando [Artillery](#artillery)
- o [gestionar manualmente los clientes](#creación-manual-de-clientes)

## Artillery

Artillery es una gran herramienta para hacer pruebas de carga a tu aplicación. Permite crear conexiones, enviar eventos y verificar acknowledgements.

La documentación se puede encontrar [aquí](https://artillery.io/docs/guides/guides/socketio-reference.html).

**Nota importante**: la instalación predeterminada viene con un cliente v2, que no es [compatible](../03-Client/client-installation.md#version-compatibility) con un servidor v3/v4. Necesitas instalar un motor personalizado para esto: https://github.com/ptejada/artillery-engine-socketio-v3

Instalación:

```
$ npm install artillery artillery-engine-socketio-v3
```

Escenario de ejemplo:

```yaml
# my-scenario.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
  engines:
   socketio-v3: {}

scenarios:
  - name: Mi escenario de ejemplo
    engine: socketio-v3
    flow:
      # esperar la actualización a WebSocket (opcional)
      - think: 1

      # emit básico
      - emit:
          channel: "hello"
          data: "world"

      # emitir un objeto
      - emit:
          channel: "hello"
          data:
            id: 42
            status: "en progreso"
            tags:
              - "tag1"
              - "tag2"

      # emitir en un namespace personalizado
      - namespace: "/my-namespace"
        emit:
          channel: "hello"
          data: "world"

      # emitir con acknowledgement
      - emit:
          channel: "ping"
        acknowledge:
          match:
            value: "pong"

      # no hacer nada por 30 segundos y luego desconectar
      - think: 30
```

Para ejecutar este escenario:

```
$ npx artillery run my-scenario.yml
```

Artillery también viene con muchas características increíbles, como la capacidad de [publicar las métricas a varios endpoints](https://artillery.io/docs/guides/plugins/plugin-publish-metrics.html) o [ejecutar las pruebas desde AWS](https://artillery.io/docs/guides/guides/running-tests-with-artillery-pro.html).

Su única limitación es que no puedes probar fácilmente eventos de servidor a cliente, ya que el DSL de Artillery está más orientado a la comunicación clásica de cliente a servidor. Lo que nos lleva a [nuestra siguiente sección](#creación-manual-de-clientes).

## Creación manual de clientes

Aquí hay un script básico para crear mil clientes Socket.IO y monitorear el número de paquetes recibidos por segundo:

```js
const { io } = require("socket.io-client");

const URL = process.env.URL || "http://localhost:3000";
const MAX_CLIENTS = 1000;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATION_INTERVAL_IN_MS = 10;
const EMIT_INTERVAL_IN_MS = 1000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const createClient = () => {
  // para fines de demostración, algunos clientes permanecen atascados en HTTP long-polling
  const transports =
    Math.random() < POLLING_PERCENTAGE ? ["polling"] : ["polling", "websocket"];

  const socket = io(URL, {
    transports,
  });

  setInterval(() => {
    socket.emit("evento de cliente a servidor");
  }, EMIT_INTERVAL_IN_MS);

  socket.on("evento de servidor a cliente", () => {
    packetsSinceLastReport++;
  });

  socket.on("disconnect", (reason) => {
    console.log(`desconectado debido a ${reason}`);
  });

  if (++clientCount < MAX_CLIENTS) {
    setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
  }
};

createClient();

const printReport = () => {
  const now = new Date().getTime();
  const durationSinceLastReport = (now - lastReport) / 1000;
  const packetsPerSeconds = (
    packetsSinceLastReport / durationSinceLastReport
  ).toFixed(2);

  console.log(
    `cantidad de clientes: ${clientCount} ; promedio de paquetes recibidos por segundo: ${packetsPerSeconds}`
  );

  packetsSinceLastReport = 0;
  lastReport = now;
};

setInterval(printReport, 5000);
```

Puedes usarlo como punto de partida para hacer pruebas de carga a tu propia aplicación.
