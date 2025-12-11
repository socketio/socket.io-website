---
title: El protocolo Socket.IO
sidebar_position: 4
slug: /socket-io-protocol/
---

Este documento describe la 5ta versión del protocolo Socket.IO.

La fuente de este documento se puede encontrar [aquí](https://github.com/socketio/socket.io-protocol).

**Tabla de contenido**

- [Introducción](#introducción)
- [Protocolo de intercambio](#protocolo-de-intercambio)
  - [Conexión a un namespace](#conexión-a-un-namespace)
  - [Envío y recepción de datos](#envío-y-recepción-de-datos)
  - [Acknowledgement](#acknowledgement)
  - [Desconexión de un namespace](#desconexión-de-un-namespace)
- [Codificación de paquetes](#codificación-de-paquetes)
  - [Formato](#formato)
  - [Ejemplos](#ejemplos)
    - [Conexión a un namespace](#conexión-a-un-namespace-1)
    - [Envío y recepción de datos](#envío-y-recepción-de-datos-1)
    - [Acknowledgement](#acknowledgement-1)
    - [Desconexión de un namespace](#desconexión-de-un-namespace-1)
- [Sesión de ejemplo](#sesión-de-ejemplo)
- [Historial](#historial)
  - [Diferencia entre v5 y v4](#diferencia-entre-v5-y-v4)
  - [Diferencia entre v4 y v3](#diferencia-entre-v4-y-v3)
  - [Diferencia entre v3 y v2](#diferencia-entre-v3-y-v2)
  - [Diferencia entre v2 y v1](#diferencia-entre-v2-y-v1)
  - [Revisión inicial](#revisión-inicial)
- [Suite de pruebas](#suite-de-pruebas)


## Introducción

El protocolo Socket.IO permite comunicación [full-duplex](https://es.wikipedia.org/wiki/D%C3%BAplex_(telecomunicaciones)#Full-d%C3%BAplex) y de bajo overhead entre un cliente y un servidor.

Está construido sobre [el protocolo Engine.IO](https://github.com/socketio/engine.io-protocol), que maneja la plomería de bajo nivel con WebSocket y HTTP long-polling.

El protocolo Socket.IO añade las siguientes características:

- multiplexación (referida como ["namespace"](https://socket.io/docs/v4/namespaces) en la jerga de Socket.IO)

Ejemplo con la API de JavaScript:

*Servidor*

```js
// declarar el namespace
const namespace = io.of("/admin");
// manejar la conexión al namespace
namespace.on("connection", (socket) => {
  // ...
});
```

*Cliente*

```js
// alcanzar el namespace principal
const socket1 = io();
// alcanzar el namespace "/admin" (con la misma conexión WebSocket subyacente)
const socket2 = io("/admin");
// manejar la conexión al namespace
socket2.on("connect", () => {
  // ...
});
```

- acknowledgement de paquetes

Ejemplo con la API de JavaScript:

```js
// en un lado
socket.emit("hello", "foo", (arg) => {
  console.log("recibido", arg);
});

// en el otro lado
socket.on("hello", (arg, ack) => {
  ack("bar");
});
```

La implementación de referencia está escrita en [TypeScript](https://www.typescriptlang.org/):

- servidor: https://github.com/socketio/socket.io
- cliente: https://github.com/socketio/socket.io-client


## Protocolo de intercambio

Un paquete Socket.IO contiene los siguientes campos:

- un tipo de paquete (entero)
- un namespace (cadena)
- opcionalmente, una carga útil (Object | Array)
- opcionalmente, un id de acknowledgment (entero)

Aquí está la lista de tipos de paquetes disponibles:

| Tipo          | ID  | Uso                                                                                     |
|---------------|-----|-----------------------------------------------------------------------------------------|
| CONNECT       | 0   | Usado durante la [conexión a un namespace](#conexión-a-un-namespace).                   |
| DISCONNECT    | 1   | Usado al [desconectarse de un namespace](#desconexión-de-un-namespace).                 |
| EVENT         | 2   | Usado para [enviar datos](#envío-y-recepción-de-datos) al otro lado.                    |
| ACK           | 3   | Usado para [acknowledger](#acknowledgement) un evento.                                  |
| CONNECT_ERROR | 4   | Usado durante la [conexión a un namespace](#conexión-a-un-namespace).                   |
| BINARY_EVENT  | 5   | Usado para [enviar datos binarios](#envío-y-recepción-de-datos) al otro lado.           |
| BINARY_ACK    | 6   | Usado para [acknowledger](#acknowledgement) un evento (la respuesta incluye datos binarios). |


### Conexión a un namespace

Al comienzo de una sesión Socket.IO, el cliente DEBE enviar un paquete `CONNECT`:

El servidor DEBE responder con:

- un paquete `CONNECT` si la conexión es exitosa, con el ID de sesión en la carga útil
- o un paquete `CONNECT_ERROR` si la conexión no está permitida

```
CLIENT                                                      SERVER

  │  ───────────────────────────────────────────────────────►  │
  │             { type: CONNECT, namespace: "/" }              │
  │  ◄───────────────────────────────────────────────────────  │
  │   { type: CONNECT, namespace: "/", data: { sid: "..." } }  │
```

Si el servidor no recibe un paquete `CONNECT` primero, DEBE cerrar la conexión inmediatamente.

Un cliente PUEDE estar conectado a múltiples namespaces al mismo tiempo, con la misma conexión WebSocket subyacente.

Ejemplos:

- con el namespace principal (llamado `"/"`)

```
Client > { type: CONNECT, namespace: "/" }
Server > { type: CONNECT, namespace: "/", data: { sid: "wZX3oN0bSVIhsaknAAAI" } }
```

- con un namespace personalizado

```
Client > { type: CONNECT, namespace: "/admin" }
Server > { type: CONNECT, namespace: "/admin", data: { sid: "oSO0OpakMV_3jnilAAAA" } }
```

- con una carga útil adicional

```
Client > { type: CONNECT, namespace: "/admin", data: { "token": "123" } }
Server > { type: CONNECT, namespace: "/admin", data: { sid: "iLnRaVGHY4B75TeVAAAB" } }
```

- en caso de que la conexión sea rechazada

```
Client > { type: CONNECT, namespace: "/" }
Server > { type: CONNECT_ERROR, namespace: "/", data: { message: "No autorizado" } }
```

### Envío y recepción de datos

Una vez que la [conexión a un namespace](#conexión-a-un-namespace) está establecida, el cliente y el servidor pueden comenzar a intercambiar datos:

```
CLIENT                                                      SERVER

  │  ───────────────────────────────────────────────────────►  │
  │        { type: EVENT, namespace: "/", data: ["foo"] }      │
  │                                                            │
  │  ◄───────────────────────────────────────────────────────  │
  │        { type: EVENT, namespace: "/", data: ["bar"] }      │
```

La carga útil es obligatoria y DEBE ser un array no vacío. Si ese no es el caso, el receptor DEBE cerrar la conexión.

Ejemplos:

- con el namespace principal

```
Client > { type: EVENT, namespace: "/", data: ["foo"] }
```

- con un namespace personalizado

```
Server > { type: EVENT, namespace: "/admin", data: ["bar"] }
```

- con datos binarios

```
Client > { type: BINARY_EVENT, namespace: "/", data: ["baz", <Buffer <01 02 03 04>> ] }
```

### Acknowledgement

El emisor PUEDE incluir un ID de evento para solicitar un acknowledgement del receptor:

```
CLIENT                                                      SERVER

  │  ───────────────────────────────────────────────────────►  │
  │   { type: EVENT, namespace: "/", data: ["foo"], id: 12 }   │
  │  ◄───────────────────────────────────────────────────────  │
  │    { type: ACK, namespace: "/", data: ["bar"], id: 12 }    │
```

El receptor DEBE responder con un paquete `ACK` con el mismo ID de evento.

La carga útil es obligatoria y DEBE ser un array (posiblemente vacío).

Ejemplos:

- con el namespace principal

```
Client > { type: EVENT, namespace: "/", data: ["foo"], id: 12 }
Server > { type: ACK, namespace: "/", data: [], id: 12 }
```

- con un namespace personalizado

```
Server > { type: EVENT, namespace: "/admin", data: ["foo"], id: 13 }
Client > { type: ACK, namespace: "/admin", data: ["bar"], id: 13 }
```

- con datos binarios

```
Client > { type: BINARY_EVENT, namespace: "/", data: ["foo", <buffer <01 02 03 04> ], id: 14 }
Server > { type: ACK, namespace: "/", data: ["bar"], id: 14 }

o

Server > { type: EVENT, namespace: "/", data: ["foo" ], id: 15 }
Client > { type: BINARY_ACK, namespace: "/", data: ["bar", <buffer <01 02 03 04>], id: 15 }
```

### Desconexión de un namespace

En cualquier momento, un lado puede terminar la conexión a un namespace enviando un paquete `DISCONNECT`:

```
CLIENT                                                      SERVER

  │  ───────────────────────────────────────────────────────►  │
  │           { type: DISCONNECT, namespace: "/" }             │
```

No se espera respuesta del otro lado. La conexión de bajo nivel PUEDE mantenerse activa si el cliente está conectado a otro namespace.


## Codificación de paquetes

Esta sección detalla la codificación usada por el parser por defecto que está incluido en el servidor y cliente Socket.IO, y cuya fuente se puede encontrar [aquí](https://github.com/socketio/socket.io-parser).

Las implementaciones de servidor y cliente en JavaScript también soportan parsers personalizados, que tienen diferentes compromisos y pueden beneficiar a ciertos tipos de aplicaciones. Por favor consulta [socket.io-json-parser](https://github.com/socketio/socket.io-json-parser) o [socket.io-msgpack-parser](https://github.com/socketio/socket.io-msgpack-parser) como ejemplo.

Por favor también nota que cada paquete Socket.IO se envía como un paquete `message` de Engine.IO (más información [aquí](https://github.com/socketio/engine.io-protocol)), así que el resultado codificado será prefijado por el carácter `"4"` cuando se envíe por el cable (en el cuerpo de solicitud/respuesta con HTTP long-polling, o en el frame WebSocket).

### Formato

```
<tipo de paquete>[<# de adjuntos binarios>-][<namespace>,][<id de acknowledgment>][carga útil JSON-stringified sin binarios]

+ adjuntos binarios extraídos
```

Nota: el namespace solo se incluye si es diferente del namespace principal (`/`)

### Ejemplos

#### Conexión a un namespace

- con el namespace principal

*Paquete*

```
{ type: CONNECT, namespace: "/" }
```

*Codificado*

```
0
```

- con un namespace personalizado

*Paquete*

```
{ type: CONNECT, namespace: "/admin", data: { sid: "oSO0OpakMV_3jnilAAAA" } }
```

*Codificado*

```
0/admin,{"sid":"oSO0OpakMV_3jnilAAAA"}
```

- en caso de que la conexión sea rechazada

*Paquete*

```
{ type: CONNECT_ERROR, namespace: "/", data: { message: "No autorizado" } }
```

*Codificado*

```
4{"message":"No autorizado"}
```

#### Envío y recepción de datos

- con el namespace principal

*Paquete*

```
{ type: EVENT, namespace: "/", data: ["foo"] }
```

*Codificado*

```
2["foo"]
```

- con un namespace personalizado

*Paquete*

```
{ type: EVENT, namespace: "/admin", data: ["bar"] }
```

*Codificado*

```
2/admin,["bar"]
```

- con datos binarios

*Paquete*

```
{ type: BINARY_EVENT, namespace: "/", data: ["baz", <Buffer <01 02 03 04>> ] }
```

*Codificado*

```
51-["baz",{"_placeholder":true,"num":0}]

+ <Buffer <01 02 03 04>>
```

- con múltiples adjuntos

*Paquete*

```
{ type: BINARY_EVENT, namespace: "/admin", data: ["baz", <Buffer <01 02>>, <Buffer <03 04>> ] }
```

*Codificado*

```
52-/admin,["baz",{"_placeholder":true,"num":0},{"_placeholder":true,"num":1}]

+ <Buffer <01 02>>
+ <Buffer <03 04>>
```

Por favor recuerda que cada paquete Socket.IO está envuelto en un paquete `message` de Engine.IO, así que serán prefijados por el carácter `"4"` cuando se envíen por el cable.

Ejemplo: `{ type: EVENT, namespace: "/", data: ["foo"] }` se enviará como `42["foo"]`

#### Acknowledgement

- con el namespace principal

*Paquete*

```
{ type: EVENT, namespace: "/", data: ["foo"], id: 12 }
```

*Codificado*

```
212["foo"]
```

- con un namespace personalizado

*Paquete*

```
{ type: ACK, namespace: "/admin", data: ["bar"], id: 13 }
```

*Codificado*

```
3/admin,13["bar"]`
```

- con datos binarios

*Paquete*

```
{ type: BINARY_ACK, namespace: "/", data: ["bar", <Buffer <01 02 03 04>>], id: 15 }
```

*Codificado*

```
61-15["bar",{"_placeholder":true,"num":0}]

+ <Buffer <01 02 03 04>>
```

#### Desconexión de un namespace

- con el namespace principal

*Paquete*

```
{ type: DISCONNECT, namespace: "/" }
```

*Codificado*

```
1
```

- con un namespace personalizado

```
{ type: DISCONNECT, namespace: "/admin" }
```

*Codificado*

```
1/admin,
```


## Sesión de ejemplo

Aquí hay un ejemplo de lo que se envía por el cable al combinar los protocolos Engine.IO y Socket.IO.

- Solicitud n°1 (paquete open)

```
GET /socket.io/?EIO=4&transport=polling&t=N8hyd6w
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
0{"sid":"lv_VI97HAXpY6yYWAAAC","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":5000,"maxPayload":1000000}
```

Detalles:

```
0           => tipo de paquete "open" de Engine.IO
{"sid":...  => los datos de handshake de Engine.IO
```

Nota: el parámetro de consulta `t` se usa para asegurar que la solicitud no sea cacheada por el navegador.

- Solicitud n°2 (solicitud de conexión al namespace):

```
POST /socket.io/?EIO=4&transport=polling&t=N8hyd7H&sid=lv_VI97HAXpY6yYWAAAC
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
40
```

Detalles:

```
4           => tipo de paquete "message" de Engine.IO
0           => tipo de paquete "CONNECT" de Socket.IO
```

- Solicitud n°3 (aprobación de conexión al namespace)

```
GET /socket.io/?EIO=4&transport=polling&t=N8hyd7H&sid=lv_VI97HAXpY6yYWAAAC
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
40{"sid":"wZX3oN0bSVIhsaknAAAI"}
```

- Solicitud n°4

`socket.emit('hey', 'Jude')` se ejecuta en el servidor:

```
GET /socket.io/?EIO=4&transport=polling&t=N8hyd7H&sid=lv_VI97HAXpY6yYWAAAC
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
42["hey","Jude"]
```

Detalles:

```
4           => tipo de paquete "message" de Engine.IO
2           => tipo de paquete "EVENT" de Socket.IO
[...]       => contenido
```

- Solicitud n°5 (mensaje saliente)

`socket.emit('hello'); socket.emit('world');` se ejecuta en el cliente:

```
POST /socket.io/?EIO=4&transport=polling&t=N8hzxke&sid=lv_VI97HAXpY6yYWAAAC
> Content-Type: text/plain; charset=UTF-8
42["hello"]\x1e42["world"]
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
ok
```

Detalles:

```
4           => tipo de paquete "message" de Engine.IO
2           => tipo de paquete "EVENT" de Socket.IO
["hello"]   => el 1er contenido
\x1e        => separador
4           => tipo de paquete "message" de Engine.IO
2           => tipo de paquete "EVENT" de Socket.IO
["world"]   => el 2do contenido
```

- Solicitud n°6 (upgrade a WebSocket)

```
GET /socket.io/?EIO=4&transport=websocket&sid=lv_VI97HAXpY6yYWAAAC
< HTTP/1.1 101 Switching Protocols
```

Frames WebSocket:

```
< 2probe                                        => solicitud probe de Engine.IO
> 3probe                                        => respuesta probe de Engine.IO
> 5                                             => tipo de paquete "upgrade" de Engine.IO
> 42["hello"]
> 42["world"]
> 40/admin,                                     => solicitar acceso al namespace admin (paquete "CONNECT" de Socket.IO)
< 40/admin,{"sid":"-G5j-67EZFp-q59rADQM"}       => conceder acceso al namespace admin
> 42/admin,1["tellme"]                          => paquete "EVENT" de Socket.IO con acknowledgement
< 461-/admin,1[{"_placeholder":true,"num":0}]   => paquete "BINARY_ACK" de Socket.IO con un placeholder
< <binary>                                      => el adjunto binario (enviado en el siguiente frame)
... después de un rato sin mensaje
> 2                                             => tipo de paquete "ping" de Engine.IO
< 3                                             => tipo de paquete "pong" de Engine.IO
> 1                                             => tipo de paquete "close" de Engine.IO
```

## Historial

### Diferencia entre v5 y v4

La 5ta revisión (actual) del protocolo Socket.IO se usa en Socket.IO v3 y superiores (`v3.0.0` fue lanzado en noviembre de 2020).

Está construido sobre la 4ta revisión de [el protocolo Engine.IO](https://github.com/socketio/engine.io-protocol) (de ahí el parámetro de consulta `EIO=4`).

Lista de cambios:

- eliminar la conexión implícita al namespace por defecto

En versiones anteriores, un cliente siempre estaba conectado al namespace por defecto, incluso si solicitaba acceso a otro namespace.

Este ya no es el caso, el cliente debe enviar un paquete `CONNECT` en cualquier caso.

Commits: [09b6f23](https://github.com/socketio/socket.io/commit/09b6f2333950b8afc8c1400b504b01ad757876bd) (servidor) y [249e0be](https://github.com/socketio/socket.io-client/commit/249e0bef9071e7afd785485961c4eef0094254e8) (cliente)


- renombrar `ERROR` a `CONNECT_ERROR`

El significado y el número de código (4) no se modifican: este tipo de paquete todavía es usado por el servidor cuando la conexión a un namespace es rechazada. Pero sentimos que el nombre es más autodescriptivo.

Commits: [d16c035](https://github.com/socketio/socket.io/commit/d16c035d258b8deb138f71801cb5aeedcdb3f002) (servidor) y [13e1db7c](https://github.com/socketio/socket.io-client/commit/13e1db7c94291c583d843beaa9e06ee041ae4f26) (cliente).


- el paquete `CONNECT` ahora puede contener una carga útil

El cliente puede enviar una carga útil para propósitos de autenticación/autorización. Ejemplo:

```json
{
  "type": 0,
  "nsp": "/admin",
  "data": {
    "token": "123"
  }
}
```

En caso de éxito, el servidor responde con una carga útil que contiene el ID del Socket. Ejemplo:

```json
{
  "type": 0,
  "nsp": "/admin",
  "data": {
    "sid": "CjdVH4TQvovi1VvgAC5Z"
  }
}
```

Este cambio significa que el ID de la conexión Socket.IO ahora será diferente del ID de la conexión Engine.IO subyacente (el que se encuentra en los parámetros de consulta de las solicitudes HTTP).

Commits: [2875d2c](https://github.com/socketio/socket.io/commit/2875d2cfdfa463e64cb520099749f543bbc4eb15) (servidor) y [bbe94ad](https://github.com/socketio/socket.io-client/commit/bbe94adb822a306c6272e977d394e3e203cae25d) (cliente)


- la carga útil del paquete `CONNECT_ERROR` ahora es un objeto en lugar de una cadena simple

Commits: [54bf4a4](https://github.com/socketio/socket.io/commit/54bf4a44e9e896dfb64764ee7bd4e8823eb7dc7b) (servidor) y [0939395](https://github.com/socketio/socket.io-client/commit/09393952e3397a0c71f239ea983f8ec1623b7c21) (cliente)


### Diferencia entre v4 y v3

La 4ta revisión del protocolo Socket.IO se usa en Socket.IO v1 (`v1.0.3` fue lanzado en junio de 2014) y v2 (`v2.0.0` fue lanzado en mayo de 2017).

Los detalles de la revisión se pueden encontrar aquí: https://github.com/socketio/socket.io-protocol/tree/v4

Está construido sobre la 3ra revisión de [el protocolo Engine.IO](https://github.com/socketio/engine.io-protocol) (de ahí el parámetro de consulta `EIO=3`).

Lista de cambios:

- añadir un tipo de paquete `BINARY_ACK`

Anteriormente, un paquete `ACK` siempre se trataba como si pudiera contener objetos binarios, con búsqueda recursiva de tales objetos, lo cual podía perjudicar el rendimiento.

Referencia: https://github.com/socketio/socket.io-parser/commit/ca4f42a922ba7078e840b1bc09fe3ad618acc065

### Diferencia entre v3 y v2

La 3ra revisión del protocolo Socket.IO se usa en las primeras versiones de Socket.IO v1 (`socket.io@1.0.0...1.0.2`) (lanzado en mayo de 2014).

Los detalles de la revisión se pueden encontrar aquí: https://github.com/socketio/socket.io-protocol/tree/v3

Lista de cambios:

- eliminar el uso de msgpack para codificar paquetes que contienen objetos binarios (ver también [299849b](https://github.com/socketio/socket.io-parser/commit/299849b00294c3bc95817572441f3aca8ffb1f65))

### Diferencia entre v2 y v1

Lista de cambios:

- añadir un tipo de paquete `BINARY_EVENT`

Esto fue añadido durante el trabajo hacia Socket.IO 1.0, para añadir soporte para objetos binarios. Los paquetes `BINARY_EVENT` fueron codificados con [msgpack](https://msgpack.org/).

### Revisión inicial

Esta primera revisión fue el resultado de la separación entre el protocolo Engine.IO (plomería de bajo nivel con WebSocket / HTTP long-polling, heartbeat) y el protocolo Socket.IO. Nunca fue incluida en un lanzamiento de Socket.IO, pero allanó el camino para las siguientes iteraciones.

## Suite de pruebas

La suite de pruebas en el directorio [`test-suite/`](https://github.com/socketio/socket.io-protocol/tree/main/test-suite) te permite verificar la conformidad de una implementación de servidor.

Uso:

- en Node.js: `npm ci && npm test`
- en un navegador: simplemente abre el archivo `index.html` en tu navegador

Para referencia, aquí está la configuración esperada para que el servidor JavaScript pase todas las pruebas:

```js
import { Server } from "socket.io";

const io = new Server(3000, {
  pingInterval: 300,
  pingTimeout: 200,
  maxPayload: 1000000,
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  socket.emit("auth", socket.handshake.auth);

  socket.on("message", (...args) => {
    socket.emit.apply(socket, ["message-back", ...args]);
  });

  socket.on("message-with-ack", (...args) => {
    const ack = args.pop();
    ack(...args);
  })
});

io.of("/custom").on("connection", (socket) => {
  socket.emit("auth", socket.handshake.auth);
});
```
