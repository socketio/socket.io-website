---
title: Parser personalizado
sidebar_position: 2
slug: /custom-parser/
---

Desde Socket.IO v2.0.0, ahora es posible proporcionar tu propio parser, para controlar el marshalling / unmarshalling de paquetes.

*Servidor*

```js
import { Server } from "socket.io";

const io = new Server({
  parser: myParser
});
```

*Cliente*

```js
import { io } from "socket.io-client";

const socket = io({
  parser: myParser
});
```

## Parsers disponibles

Además del [parser por defecto](#el-parser-por-defecto), aquí está la lista de parsers disponibles:

| Paquete                                                                                                      | Descripción                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`socket.io-circular-parser`](https://www.npmjs.com/package/socket.io-circular-parser)                       | Similar al parser por defecto, pero maneja referencias circulares.                                                                                         |
| [`socket.io-msgpack-parser`](https://www.npmjs.com/package/socket.io-msgpack-parser)                         | Usa [MessagePack](https://msgpack.org/) para codificar los paquetes (basado en el paquete [`notepack.io`](https://github.com/darrachequesne/notepack)).    |
| [`@skgdev/socket.io-msgpack-javascript`](https://www.npmjs.com/package/@skgdev/socket.io-msgpack-javascript) | Usa [MessagePack](https://msgpack.org/) para codificar los paquetes (basado en el paquete [`@msgpack/msgpack`](https://github.com/msgpack/msgpack-javascript)). |
| [`socket.io-json-parser`](https://www.npmjs.com/package/socket.io-json-parser)                               | Usa `JSON.stringify()` y `JSON.parse()` para codificar los paquetes.                                                                                       |
| [`socket.io-cbor-x-parser`](https://www.npmjs.com/package/socket.io-cbor-x-parser)                           | Usa [cbor-x](https://github.com/kriszyp/cbor-x) para codificar los paquetes.                                                                               |
| [`@socket.io/devalue-parser`](https://www.npmjs.com/package/@socket.io/devalue-parser)                       | Usa [devalue](https://github.com/Rich-Harris/devalue) para codificar los paquetes.                                                                         |

## Implementando tu propio parser

Aquí hay un ejemplo básico con un parser que usa los métodos `JSON.stringify()` y `JSON.parse()`:

```js
import { Emitter } from "@socket.io/component-emitter"; // polyfill de Node.js EventEmitter en el navegador

class Encoder {
  /**
   * Codificar un paquete en una lista de strings/buffers
   */
  encode(packet) {
    return [JSON.stringify(packet)];
  }
}

function isObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

class Decoder extends Emitter {
  /**
   * Recibir un fragmento (string o buffer) y opcionalmente emitir un evento "decoded" con el paquete reconstruido
   */
  add(chunk) {
    const packet = JSON.parse(chunk);
    if (this.isPacketValid(packet)) {
      this.emit("decoded", packet);
    } else {
      throw new Error("formato inválido");
    }
  }
  isPacketValid({ type, data, nsp, id }) {
    const isNamespaceValid = typeof nsp === "string";
    const isAckIdValid = id === undefined || Number.isInteger(id);
    if (!isNamespaceValid || !isAckIdValid) {
      return false;
    }
    switch (type) {
      case 0: // CONNECT
        return data === undefined || isObject(data);
      case 1: // DISCONNECT
        return data === undefined;
      case 2: // EVENT
        return Array.isArray(data) && typeof data[0] === "string";
      case 3: // ACK
        return Array.isArray(data);
      case 4: // CONNECT_ERROR
        return isObject(data);
      default:
        return false;
    }
  }
  /**
   * Limpiar buffers internos
   */
  destroy() {}
}

export const parser = { Encoder, Decoder };
```

## El parser por defecto

El código fuente del parser por defecto (el paquete `socket.io-parser`) se puede encontrar aquí: https://github.com/socketio/socket.io-parser

Ejemplo de salida:

- emit básico

```js
socket.emit("test", 42);
```

será codificado como:

```
2["test",42]
|||
||└─ carga útil codificada en JSON
|└─ tipo de paquete (2 => EVENT)
```

- emit con binario, acknowledgement y namespace personalizado

```js
socket.emit("test", Uint8Array.from([42]), () => {
  console.log("ack recibido");
});
```

será codificado como:

```
51-/admin,13["test",{"_placeholder":true,"num":0}]
|||||     || └─ carga útil codificada en JSON con placeholders para adjuntos binarios
|||||     |└─ id de acknowledgement
|||||     └─ separador
||||└─ namespace (no incluido cuando es el namespace principal)
|||└─ separador
||└─ número de adjuntos binarios
|└─ tipo de paquete (5 => BINARY EVENT)

y un adjunto adicional (el Uint8Array extraído)
```

Pros:

- el adjunto binario se codifica en base64, así que este parser es compatible con navegadores que [no soportan Arraybuffers](https://caniuse.com/mdn-javascript_builtins_arraybuffer), como IE9

Contras:

- los paquetes con contenido binario se envían como dos frames WebSocket distintos (si la conexión WebSocket está establecida)

## El parser msgpack

Este parser usa el formato de serialización [MessagePack](https://msgpack.org/).

El código fuente de este parser se puede encontrar aquí: https://github.com/socketio/socket.io-msgpack-parser

Uso de ejemplo:

*Servidor*

```js
import { Server } from "socket.io";
import customParser from "socket.io-msgpack-parser";

const io = new Server({
  parser: customParser
});
```

*Cliente (Node.js)*

```js
import { io } from "socket.io-client";
import customParser from "socket.io-msgpack-parser";

const socket = io("https://example.com", {
  parser: customParser
});
```

En el navegador, ahora hay un bundle oficial que incluye este parser:

- https://cdn.socket.io/4.8.1/socket.io.msgpack.min.js
- cdnjs: https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.1/socket.io.msgpack.min.js
- jsDelivr: https://cdn.jsdelivr.net/npm/socket.io-client@4.8.1/dist/socket.io.msgpack.min.js
- unpkg: https://unpkg.com/socket.io-client@4.8.1/dist/socket.io.msgpack.min.js

En ese caso, no necesitas especificar la opción `parser`.

Pros:

- los paquetes con contenido binario se envían como un solo frame WebSocket (si la conexión WebSocket está establecida)
- puede resultar en cargas útiles más pequeñas (especialmente cuando se usan muchos números)

Contras:

- incompatible con navegadores que [no soportan Arraybuffers](https://caniuse.com/mdn-javascript_builtins_arraybuffer), como IE9
- más difícil de depurar en la pestaña Network del navegador

:::info

Por favor ten en cuenta que `socket.io-msgpack-parser` se basa en la implementación de MessagePack [`notepack.io`](https://github.com/darrachequesne/notepack). Esta implementación se enfoca principalmente en el rendimiento y el tamaño mínimo del bundle, y por lo tanto no soporta características como tipos de extensión. Para un parser basado en la [implementación oficial de JavaScript](https://github.com/msgpack/msgpack-javascript), por favor revisa [este paquete](https://www.npmjs.com/package/@skgdev/socket.io-msgpack-javascript).

:::
