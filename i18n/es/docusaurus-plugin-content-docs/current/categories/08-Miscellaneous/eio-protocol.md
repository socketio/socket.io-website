---
title: El protocolo Engine.IO
sidebar_position: 3
slug: /engine-io-protocol/
---

Este documento describe la 4ta versión del protocolo Engine.IO.

La fuente de este documento se puede encontrar [aquí](https://github.com/socketio/engine.io-protocol).

**Tabla de contenido**

- [Introducción](#introducción)
- [Transportes](#transportes)
  - [HTTP long-polling](#http-long-polling)
    - [Ruta de la solicitud](#ruta-de-la-solicitud)
    - [Parámetros de consulta](#parámetros-de-consulta)
    - [Cabeceras](#cabeceras)
    - [Envío y recepción de datos](#envío-y-recepción-de-datos)
      - [Envío de datos](#envío-de-datos)
      - [Recepción de datos](#recepción-de-datos)
  - [WebSocket](#websocket)
- [Protocolo](#protocolo)
  - [Handshake](#handshake)
  - [Heartbeat](#heartbeat)
  - [Upgrade](#upgrade)
  - [Message](#message)
- [Codificación de paquetes](#codificación-de-paquetes)
  - [HTTP long-polling](#http-long-polling-1)
  - [WebSocket](#websocket-1)
- [Historial](#historial)
  - [De v2 a v3](#de-v2-a-v3)
  - [De v3 a v4](#de-v3-a-v4)
- [Suite de pruebas](#suite-de-pruebas)



## Introducción

El protocolo Engine.IO permite comunicación [full-duplex](https://es.wikipedia.org/wiki/D%C3%BAplex_(telecomunicaciones)#Full-d%C3%BAplex) y de bajo overhead entre un cliente y un servidor.

Está basado en el [protocolo WebSocket](https://es.wikipedia.org/wiki/WebSocket) y usa [HTTP long-polling](https://es.wikipedia.org/wiki/Tecnolog%C3%ADa_Push#Long_polling) como fallback si la conexión WebSocket no puede establecerse.

La implementación de referencia está escrita en [TypeScript](https://www.typescriptlang.org/):

- servidor: https://github.com/socketio/engine.io
- cliente: https://github.com/socketio/engine.io-client

El [protocolo Socket.IO](https://github.com/socketio/socket.io-protocol) está construido sobre estos fundamentos, añadiendo características adicionales sobre el canal de comunicación proporcionado por el protocolo Engine.IO.

## Transportes

La conexión entre un cliente Engine.IO y un servidor Engine.IO puede establecerse con:

- [HTTP long-polling](#http-long-polling)
- [WebSocket](#websocket)

### HTTP long-polling

El transporte HTTP long-polling (también referido simplemente como "polling") consiste en solicitudes HTTP sucesivas:

- solicitudes `GET` de larga duración, para recibir datos del servidor
- solicitudes `POST` de corta duración, para enviar datos al servidor

#### Ruta de la solicitud

La ruta de las solicitudes HTTP es `/engine.io/` por defecto.

Puede ser actualizada por bibliotecas construidas sobre el protocolo (por ejemplo, el protocolo Socket.IO usa `/socket.io/`).

#### Parámetros de consulta

Se utilizan los siguientes parámetros de consulta:

| Nombre      | Valor     | Descripción                                                             |
|-------------|-----------|-------------------------------------------------------------------------|
| `EIO`       | `4`       | Obligatorio, la versión del protocolo.                                  | 
| `transport` | `polling` | Obligatorio, el nombre del transporte.                                  |
| `sid`       | `<sid>`   | Obligatorio una vez establecida la sesión, el identificador de sesión.  |

Si falta un parámetro de consulta obligatorio, el servidor DEBE responder con un código de estado HTTP 400.

#### Cabeceras

Al enviar datos binarios, el emisor (cliente o servidor) DEBE incluir una cabecera `Content-Type: application/octet-stream`.

Sin una cabecera `Content-Type` explícita, el receptor DEBERÍA inferir que los datos son texto plano.

Referencia: https://developer.mozilla.org/es/docs/Web/HTTP/Headers/Content-Type

#### Envío y recepción de datos

##### Envío de datos

Para enviar algunos paquetes, un cliente DEBE crear una solicitud HTTP `POST` con los paquetes codificados en el cuerpo de la solicitud:

```
CLIENT                                                 SERVER

  │                                                      │
  │   POST /engine.io/?EIO=4&transport=polling&sid=...   │
  │ ───────────────────────────────────────────────────► │
  │ ◄──────────────────────────────────────────────────┘ │
  │                        HTTP 200                      │
  │                                                      │
```

El servidor DEBE devolver una respuesta HTTP 400 si el ID de sesión (del parámetro de consulta `sid`) no es conocido.

Para indicar éxito, el servidor DEBE devolver una respuesta HTTP 200, con la cadena `ok` en el cuerpo de la respuesta.

Para asegurar el orden de los paquetes, un cliente NO DEBE tener más de una solicitud `POST` activa. Si esto sucede, el servidor DEBE devolver un código de estado HTTP 400 y cerrar la sesión.

##### Recepción de datos

Para recibir algunos paquetes, un cliente DEBE crear una solicitud HTTP `GET`:

```
CLIENT                                                SERVER

  │   GET /engine.io/?EIO=4&transport=polling&sid=...   │
  │ ──────────────────────────────────────────────────► │
  │                                                   . │
  │                                                   . │
  │                                                   . │
  │                                                   . │
  │ ◄─────────────────────────────────────────────────┘ │
  │                       HTTP 200                      │
```

El servidor DEBE devolver una respuesta HTTP 400 si el ID de sesión (del parámetro de consulta `sid`) no es conocido.

El servidor PUEDE no responder inmediatamente si no hay paquetes en búfer para la sesión dada. Una vez que hay algunos paquetes para enviar, el servidor DEBERÍA codificarlos (ver [Codificación de paquetes](#codificación-de-paquetes)) y enviarlos en el cuerpo de la respuesta de la solicitud HTTP.

Para asegurar el orden de los paquetes, un cliente NO DEBE tener más de una solicitud `GET` activa. Si esto sucede, el servidor DEBE devolver un código de estado HTTP 400 y cerrar la sesión.

### WebSocket

El transporte WebSocket consiste en una [conexión WebSocket](https://developer.mozilla.org/es/docs/Web/API/WebSockets_API), que proporciona un canal de comunicación bidireccional y de baja latencia entre el servidor y el cliente.

Se utilizan los siguientes parámetros de consulta:

| Nombre      | Valor       | Descripción                                                                              |
|-------------|-------------|------------------------------------------------------------------------------------------|
| `EIO`       | `4`         | Obligatorio, la versión del protocolo.                                                   | 
| `transport` | `websocket` | Obligatorio, el nombre del transporte.                                                   |
| `sid`       | `<sid>`     | Opcional, dependiendo de si es un upgrade desde HTTP long-polling o no.                  |

Si falta un parámetro de consulta obligatorio, el servidor DEBE cerrar la conexión WebSocket.

Cada paquete (lectura o escritura) se envía en su propio [frame WebSocket](https://datatracker.ietf.org/doc/html/rfc6455#section-5).

Un cliente NO DEBE abrir más de una conexión WebSocket por sesión. Si esto sucede, el servidor DEBE cerrar la conexión WebSocket.

## Protocolo

Un paquete Engine.IO consiste en:

- un tipo de paquete
- una carga útil de paquete opcional

Aquí está la lista de tipos de paquetes disponibles:

| Tipo    | ID  | Uso                                                     |
|---------|-----|---------------------------------------------------------|
| open    | 0   | Usado durante el [handshake](#handshake).               | 
| close   | 1   | Usado para indicar que un transporte puede cerrarse.    |
| ping    | 2   | Usado en el [mecanismo de heartbeat](#heartbeat).       |
| pong    | 3   | Usado en el [mecanismo de heartbeat](#heartbeat).       |
| message | 4   | Usado para enviar una carga útil al otro lado.          |
| upgrade | 5   | Usado durante el [proceso de upgrade](#upgrade).        |
| noop    | 6   | Usado durante el [proceso de upgrade](#upgrade).        |

### Handshake

Para establecer una conexión, el cliente DEBE enviar una solicitud HTTP `GET` al servidor:

- HTTP long-polling primero (por defecto)

```
CLIENT                                                    SERVER

  │                                                          │
  │        GET /engine.io/?EIO=4&transport=polling           │
  │ ───────────────────────────────────────────────────────► │
  │ ◄──────────────────────────────────────────────────────┘ │
  │                        HTTP 200                          │
  │                                                          │
```

- Sesión solo WebSocket

```
CLIENT                                                    SERVER

  │                                                          │
  │        GET /engine.io/?EIO=4&transport=websocket         │
  │ ───────────────────────────────────────────────────────► │
  │ ◄──────────────────────────────────────────────────────┘ │
  │                        HTTP 101                          │
  │                                                          │
```

Si el servidor acepta la conexión, DEBE responder con un paquete `open` con la siguiente carga útil codificada en JSON:

| Clave          | Tipo       | Descripción                                                                                                              |
|----------------|------------|--------------------------------------------------------------------------------------------------------------------------|
| `sid`          | `string`   | El ID de sesión.                                                                                                         |
| `upgrades`     | `string[]` | La lista de [upgrades de transporte](#upgrade) disponibles.                                                              |
| `pingInterval` | `number`   | El intervalo de ping, usado en el [mecanismo de heartbeat](#heartbeat) (en milisegundos).                                |
| `pingTimeout`  | `number`   | El timeout de ping, usado en el [mecanismo de heartbeat](#heartbeat) (en milisegundos).                                  |
| `maxPayload`   | `number`   | El número máximo de bytes por fragmento, usado por el cliente para agregar paquetes en [cargas útiles](#codificación-de-paquetes). |

Ejemplo:

```json
{
  "sid": "lv_VI97HAXpY6yYWAAAC",
  "upgrades": ["websocket"],
  "pingInterval": 25000,
  "pingTimeout": 20000,
  "maxPayload": 1000000
}
```

El cliente DEBE enviar el valor `sid` en los parámetros de consulta de todas las solicitudes subsiguientes.

### Heartbeat

Una vez que el [handshake](#handshake) se completa, se inicia un mecanismo de heartbeat para verificar la vivacidad de la conexión:

```
CLIENT                                                 SERVER

  │                   *** Handshake ***                  │
  │                                                      │
  │  ◄─────────────────────────────────────────────────  │
  │                           2                          │  (paquete ping)
  │  ─────────────────────────────────────────────────►  │
  │                           3                          │  (paquete pong)
```

A un intervalo dado (el valor `pingInterval` enviado en el handshake) el servidor envía un paquete `ping` y el cliente tiene unos segundos (el valor `pingTimeout`) para enviar un paquete `pong` de vuelta.

Si el servidor no recibe un paquete `pong` de vuelta, DEBERÍA considerar que la conexión está cerrada.

Inversamente, si el cliente no recibe un paquete `ping` dentro de `pingInterval + pingTimeout`, DEBERÍA considerar que la conexión está cerrada.

### Upgrade

Por defecto, el cliente DEBERÍA crear una conexión HTTP long-polling, y luego hacer upgrade a mejores transportes si están disponibles.

Para hacer upgrade a WebSocket, el cliente DEBE:

- pausar el transporte HTTP long-polling (no se envían más solicitudes HTTP), para asegurar que ningún paquete se pierda
- abrir una conexión WebSocket con el mismo ID de sesión
- enviar un paquete `ping` con la cadena `probe` en la carga útil

El servidor DEBE:

- enviar un paquete `noop` a cualquier solicitud `GET` pendiente (si aplica) para cerrar limpiamente el transporte HTTP long-polling
- responder con un paquete `pong` con la cadena `probe` en la carga útil

Finalmente, el cliente DEBE enviar un paquete `upgrade` para completar el upgrade:

```
CLIENT                                                 SERVER

  │                                                      │
  │   GET /engine.io/?EIO=4&transport=websocket&sid=...  │
  │ ───────────────────────────────────────────────────► │
  │  ◄─────────────────────────────────────────────────┘ │
  │            HTTP 101 (WebSocket handshake)            │
  │                                                      │
  │            -----  WebSocket frames -----             │
  │  ─────────────────────────────────────────────────►  │
  │                         2probe                       │ (paquete ping)
  │  ◄─────────────────────────────────────────────────  │
  │                         3probe                       │ (paquete pong)
  │  ─────────────────────────────────────────────────►  │
  │                         5                            │ (paquete upgrade)
  │                                                      │
```

### Message

Una vez que el [handshake](#handshake) se completa, el cliente y el servidor pueden intercambiar datos incluyéndolos en un paquete `message`.


## Codificación de paquetes

La serialización de un paquete Engine.IO depende del tipo de carga útil (texto plano o binario) y del transporte.

### HTTP long-polling

Debido a la naturaleza del transporte HTTP long-polling, múltiples paquetes pueden concatenarse en una sola carga útil para aumentar el throughput.

Formato:

```
<tipo de paquete>[<datos>]<separador><tipo de paquete>[<datos>]<separador><tipo de paquete>[<datos>][...]
```

Ejemplo:

```
4hello\x1e2\x1e4world

con:

4      => tipo de paquete message
hello  => carga útil del mensaje
\x1e   => separador
2      => tipo de paquete ping
\x1e   => separador
4      => tipo de paquete message
world  => carga útil del mensaje
```

Los paquetes están separados por el [carácter separador de registro](https://en.wikipedia.org/wiki/C0_and_C1_control_codes#Field_separators): `\x1e`

Las cargas útiles binarias DEBEN estar codificadas en base64 y prefijadas con un carácter `b`:

Ejemplo:

```
4hello\x1ebAQIDBA==

con:

4         => tipo de paquete message
hello     => carga útil del mensaje
\x1e      => separador
b         => prefijo binario
AQIDBA==  => buffer <01 02 03 04> codificado como base64
```

El cliente DEBERÍA usar el valor `maxPayload` enviado durante el [handshake](#handshake) para decidir cuántos paquetes deben concatenarse.

### WebSocket

Cada paquete Engine.IO se envía en su propio [frame WebSocket](https://datatracker.ietf.org/doc/html/rfc6455#section-5).

Formato:

```
<tipo de paquete>[<datos>]
```

Ejemplo:

```
4hello

con:

4      => tipo de paquete message
hello  => carga útil del mensaje (codificada en UTF-8)
```

Las cargas útiles binarias se envían tal cual, sin modificación.

## Historial

### De v2 a v3

- añadir soporte para datos binarios

La [2da versión](https://github.com/socketio/engine.io-protocol/tree/v2) del protocolo se usa en Socket.IO `v0.9` y anteriores.

La [3ra versión](https://github.com/socketio/engine.io-protocol/tree/v3) del protocolo se usa en Socket.IO `v1` y `v2`.

### De v3 a v4

- invertir mecanismo ping/pong

Los paquetes ping ahora son enviados por el servidor, porque los temporizadores configurados en los navegadores no son lo suficientemente confiables. Sospechamos que muchos problemas de timeout vinieron de temporizadores retrasados en el lado del cliente.

- siempre usar base64 al codificar una carga útil con datos binarios

Este cambio permite tratar todas las cargas útiles (con o sin binarios) de la misma manera, sin tener que tomar en cuenta si el cliente o el transporte actual soporta datos binarios o no.

Por favor nota que esto solo aplica a HTTP long-polling. Los datos binarios se envían en frames WebSocket sin transformación adicional.

- usar un separador de registro (`\x1e`) en lugar de contar caracteres

Contar caracteres impedía (o al menos hacía más difícil) implementar el protocolo en otros lenguajes, que pueden no usar la codificación UTF-16.

Por ejemplo, `€` se codificaba como `2:4€`, aunque `Buffer.byteLength('€') === 3`.

Nota: esto asume que el separador de registro no se usa en los datos.

La 4ta versión (actual) está incluida en Socket.IO `v3` y superiores.

## Suite de pruebas

La suite de pruebas en el directorio [`test-suite/`](https://github.com/socketio/engine.io-protocol/tree/main/test-suite) te permite verificar la conformidad de una implementación de servidor.

Uso:

- en Node.js: `npm ci && npm test`
- en un navegador: simplemente abre el archivo `index.html` en tu navegador

Para referencia, aquí está la configuración esperada para que el servidor JavaScript pase todas las pruebas:

```js
import { listen } from "engine.io";

const server = listen(3000, {
  pingInterval: 300,
  pingTimeout: 200,
  maxPayload: 1e6,
  cors: {
    origin: "*"
  }
});

server.on("connection", socket => {
  socket.on("data", (...args) => {
    socket.send(...args);
  });
});
```
