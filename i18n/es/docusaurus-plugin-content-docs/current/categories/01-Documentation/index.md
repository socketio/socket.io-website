---
title: Introducción
sidebar_position: 1
slug: /
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

:::tip

Si eres nuevo en Socket.IO, te recomendamos revisar nuestro [tutorial](../../tutorial/01-introduction.md).

:::

## Qué es Socket.IO

Socket.IO es una biblioteca que permite la comunicación **de baja latencia**, **bidireccional** y **basada en eventos** entre un cliente y un servidor.

<ThemedImage
  alt="Diagrama de comunicación entre un servidor y un cliente"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication2.png'),
    dark: useBaseUrl('/images/bidirectional-communication2-dark.png'),
  }}
/>

La conexión de Socket.IO puede establecerse con diferentes transportes de bajo nivel:

- HTTP long-polling
- [WebSocket](https://developer.mozilla.org/es/docs/Web/API/WebSockets_API)
- [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)

Socket.IO seleccionará automáticamente la mejor opción disponible, dependiendo de:

- las capacidades del navegador (ver [aquí](https://caniuse.com/websockets) y [aquí](https://caniuse.com/webtransport))
- la red (algunas redes bloquean conexiones WebSocket y/o WebTransport)

Puedes encontrar más detalles sobre esto en la sección ["Cómo funciona"](./how-it-works.md).

### Implementaciones del servidor

| Lenguaje             | Sitio web                                                                                                                                               |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| JavaScript (Node.js) | - [Pasos de instalación](../02-Server/server-installation.md)<br/>- [API](../../server-api.md)<br/>- [Código fuente](https://github.com/socketio/socket.io) |
| JavaScript (Deno)    | https://github.com/socketio/socket.io-deno                                                                                                              |
| Java                 | https://github.com/mrniko/netty-socketio                                                                                                                |
| Java                 | https://github.com/trinopoty/socket.io-server-java                                                                                                      |
| Python               | https://github.com/miguelgrinberg/python-socketio                                                                                                       |
| Golang               | https://github.com/googollee/go-socket.io                                                                                                               |
| Rust                 | https://github.com/Totodore/socketioxide                                                                                                                |

### Implementaciones del cliente

| Lenguaje                                          | Sitio web                                                                                                                                                      |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| JavaScript (navegador, Node.js o React Native)    | - [Pasos de instalación](../03-Client/client-installation.md)<br/>- [API](../../client-api.md)<br/>- [Código fuente](https://github.com/socketio/socket.io-client) |
| JavaScript (para Mini-Programas de WeChat)        | https://github.com/weapp-socketio/weapp.socket.io                                                                                                              |
| Java                                              | https://github.com/socketio/socket.io-client-java                                                                                                              |
| C++                                               | https://github.com/socketio/socket.io-client-cpp                                                                                                               |
| Swift                                             | https://github.com/socketio/socket.io-client-swift                                                                                                             |
| Dart                                              | https://github.com/rikulo/socket.io-client-dart                                                                                                                |
| Python                                            | https://github.com/miguelgrinberg/python-socketio                                                                                                              |
| .Net                                              | https://github.com/doghappy/socket.io-client-csharp                                                                                                            |
| Rust                                              | https://github.com/1c3t3a/rust-socketio                                                                                                                        |
| Kotlin                                            | https://github.com/icerockdev/moko-socket-io                                                                                                                   |
| PHP                                               | https://github.com/ElephantIO/elephant.io                                                                                                                      |
| Golang                                            | https://github.com/maldikhan/go.socket.io                                                                                                                      |

## Qué NO es Socket.IO

:::caution

Socket.IO **NO** es una implementación de WebSocket.

:::

Aunque Socket.IO efectivamente usa WebSocket para el transporte cuando es posible, agrega metadatos adicionales a cada paquete. Es por eso que un cliente WebSocket no podrá conectarse exitosamente a un servidor Socket.IO, y un cliente Socket.IO tampoco podrá conectarse a un servidor WebSocket simple.

```js
// ADVERTENCIA: ¡el cliente NO podrá conectarse!
const socket = io("ws://echo.websocket.org");
```

Si estás buscando un servidor WebSocket simple, por favor echa un vistazo a [ws](https://github.com/websockets/ws) o [µWebSockets.js](https://github.com/uNetworking/uWebSockets.js).

También hay [discusiones](https://github.com/nodejs/node/issues/19308) para incluir un servidor WebSocket en el núcleo de Node.js.

En el lado del cliente, podrías estar interesado en el paquete [robust-websocket](https://github.com/nathanboktae/robust-websocket).

:::caution

Socket.IO no está pensado para ser usado en un servicio en segundo plano para aplicaciones móviles.

:::

La biblioteca Socket.IO mantiene una conexión TCP abierta al servidor, lo que puede resultar en un alto consumo de batería para tus usuarios. Por favor usa una plataforma de mensajería dedicada como [FCM](https://firebase.google.com/docs/cloud-messaging) para este caso de uso.

## Características

Aquí están las características que proporciona Socket.IO sobre WebSockets simples:

### Fallback a HTTP long-polling

La conexión recurrirá a HTTP long-polling en caso de que no se pueda establecer la conexión WebSocket.

Esta característica fue la razón #1 por la que la gente usaba Socket.IO cuando el proyecto fue creado hace más de diez años (!), ya que el soporte del navegador para WebSockets todavía estaba en sus inicios.

Aunque la mayoría de los navegadores ahora soportan WebSockets (más del [97%](https://caniuse.com/mdn-api_websocket)), sigue siendo una gran característica ya que todavía recibimos informes de usuarios que no pueden establecer una conexión WebSocket porque están detrás de algún proxy mal configurado.

### Reconexión automática

Bajo algunas condiciones particulares, la conexión WebSocket entre el servidor y el cliente puede interrumpirse sin que ambos lados estén conscientes del estado roto del enlace.

Es por eso que Socket.IO incluye un mecanismo de heartbeat, que verifica periódicamente el estado de la conexión.

Y cuando el cliente finalmente se desconecta, se reconecta automáticamente con un retraso de retroceso exponencial, para no sobrecargar el servidor.

### Almacenamiento en búfer de paquetes

Los paquetes se almacenan automáticamente en búfer cuando el cliente está desconectado, y se enviarán tras la reconexión.

Más información [aquí](../03-Client/client-offline-behavior.md#buffered-events).

### Confirmaciones (Acknowledgements)

Socket.IO proporciona una forma conveniente de enviar un evento y recibir una respuesta:

*Emisor*

```js
socket.emit("hello", "world", (response) => {
  console.log(response); // "recibido"
});
```

*Receptor*

```js
socket.on("hello", (arg, callback) => {
  console.log(arg); // "world"
  callback("recibido");
});
```

También puedes agregar un tiempo de espera:

```js
socket.timeout(5000).emit("hello", "world", (err, response) => {
  if (err) {
    // el otro lado no confirmó el evento en el tiempo dado
  } else {
    console.log(response); // "recibido"
  }
});
```

### Broadcasting

En el lado del servidor, puedes enviar un evento a [todos los clientes conectados](../04-Events/broadcasting-events.md) o [a un subconjunto de clientes](../04-Events/rooms.md):

```js
// a todos los clientes conectados
io.emit("hello");

// a todos los clientes conectados en la sala "news"
io.to("news").emit("hello");
```

Esto también funciona cuando se [escala a múltiples nodos](../02-Server/using-multiple-nodes.md).

### Multiplexación

Los namespaces te permiten dividir la lógica de tu aplicación sobre una única conexión compartida. Esto puede ser útil, por ejemplo, si quieres crear un canal de "admin" al que solo puedan unirse usuarios autorizados.

```js
io.on("connection", (socket) => {
  // usuarios clásicos
});

io.of("/admin").on("connection", (socket) => {
  // usuarios administradores
});
```

Más información sobre esto [aquí](../06-Advanced/namespaces.md).

## Preguntas comunes

### ¿Socket.IO sigue siendo necesario hoy en día?

Es una pregunta justa, ya que WebSockets es soportado [casi en todas partes](https://caniuse.com/mdn-api_websocket) ahora.

Dicho esto, creemos que si usas WebSockets simples para tu aplicación, eventualmente necesitarás implementar la mayoría de las características que ya están incluidas (y probadas en batalla) en Socket.IO, como [reconexión](#reconexión-automática), [confirmaciones](#confirmaciones-acknowledgements) o [broadcasting](#broadcasting).

### ¿Cuál es la sobrecarga del protocolo Socket.IO?

`socket.emit("hello", "world")` se enviará como un único frame WebSocket conteniendo `42["hello","world"]` con:

- `4` siendo el tipo de paquete "message" de Engine.IO
- `2` siendo el tipo de paquete "message" de Socket.IO
- `["hello","world"]` siendo la versión `JSON.stringify()` del array de argumentos

Así que, unos pocos bytes adicionales por cada mensaje, que pueden reducirse aún más mediante el uso de un [parser personalizado](../06-Advanced/custom-parser.md).

:::info

El tamaño del bundle del navegador en sí es de [`10.4 kB`](https://bundlephobia.com/package/socket.io-client) (minificado y comprimido con gzip).

:::

Puedes encontrar los detalles del protocolo Socket.IO [aquí](../08-Miscellaneous/sio-protocol.md).

### ¿Algo no funciona correctamente, pueden ayudarme?

Por favor revisa nuestra [Guía de solución de problemas](../01-Documentation/troubleshooting.md).

## Próximos pasos

- [Ejemplo para comenzar](/get-started/chat)
- [Instalación del servidor](../02-Server/server-installation.md)
- [Instalación del cliente](../03-Client/client-installation.md)
