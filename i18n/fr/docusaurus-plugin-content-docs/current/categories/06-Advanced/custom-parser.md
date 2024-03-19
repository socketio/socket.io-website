---
title: Custom parser
sidebar_position: 2
slug: /custom-parser/
---

Since Socket.IO v2.0.0, it is now possible to provide your own parser, in order to control the marshalling / unmarshalling of packets.

*Server*

```js
import { Server } from "socket.io";

const io = new Server({
  parser: myParser
});
```

*Client*

```js
import { io } from "socket.io-client";

const socket = io({
  parser: myParser
});
```

## Available parsers {#available-parsers}

Besides [the default parser](#the-default-parser), here is the list of available parsers:

| Package                                                                                                      | Description                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`socket.io-circular-parser`](https://www.npmjs.com/package/socket.io-circular-parser)                       | Similar to the default parser, but handles circular references.                                                                                            |
| [`socket.io-msgpack-parser`](https://www.npmjs.com/package/socket.io-msgpack-parser)                         | Uses [MessagePack](https://msgpack.org/) to encode the packets (based on the [`notepack.io`](https://github.com/darrachequesne/notepack) package).         |
| [`@skgdev/socket.io-msgpack-javascript`](https://www.npmjs.com/package/@skgdev/socket.io-msgpack-javascript) | Uses [MessagePack](https://msgpack.org/) to encode the packets (based on the [`@msgpack/msgpack`](https://github.com/msgpack/msgpack-javascript) package). |
| [`socket.io-json-parser`](https://www.npmjs.com/package/socket.io-json-parser)                               | Uses `JSON.stringify()` and `JSON.parse()` to encode the packets.                                                                                          |
| [`socket.io-cbor-x-parser`](https://www.npmjs.com/package/socket.io-cbor-x-parser)                           | Uses [cbor-x](https://github.com/kriszyp/cbor-x) to encode the packets.                                                                                    |

## Implementing your own parser {#implementing-your-own-parser}

Here is a basic example with a parser that uses the `JSON.stringify()` and `JSON.parse()` methods:

```js
import { Emitter } from "@socket.io/component-emitter"; // polyfill of Node.js EventEmitter in the browser

class Encoder {
  /**
   * Encode a packet into a list of strings/buffers
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
   * Receive a chunk (string or buffer) and optionally emit a "decoded" event with the reconstructed packet
   */
  add(chunk) {
    const packet = JSON.parse(chunk);
    if (this.isPacketValid(packet)) {
      this.emit("decoded", packet);
    } else {
      throw new Error("invalid format");
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
   * Clean up internal buffers
   */
  destroy() {}
}

export const parser = { Encoder, Decoder };
```

## The default parser {#the-default-parser}

The source code of the default parser (the `socket.io-parser` package) can be found here: https://github.com/socketio/socket.io-parser

Example of output:

- basic emit

```js
socket.emit("test", 42);
```

will be encoded as:

```
2["test",42]
||
|└─ JSON-encoded payload
└─ packet type (2 => EVENT)
```

- emit with binary, acknowledgement and custom namespace

```js
socket.emit("test", Uint8Array.from([42]), () => {
  console.log("ack received");
});
```

will be encoded as:

```
51-/admin,13["test",{"_placeholder":true,"num":0}]
||||     || └─ JSON-encoded payload with placeholders for binary attachments
||||     |└─ acknowledgement id
||||     └─ separator
|||└─ namespace (not included when it's the main namespace)
||└─ separator
|└─ number of binary attachments
└─ packet type (5 => BINARY EVENT)

and an additional attachment (the extracted Uint8Array)
```

Pros:

- the binary attachments is then base64-encoded, so this parser is compatible with browsers that [do not support Arraybuffers](https://caniuse.com/mdn-javascript_builtins_arraybuffer), like IE9

Cons:

- packets with binary content are sent as two distinct WebSocket frames (if the WebSocket connection is established)

## The msgpack parser {#the-msgpack-parser}

This parser uses the [MessagePack](https://msgpack.org/) serialization format.

The source code of this parser can be found here: https://github.com/socketio/socket.io-msgpack-parser

Sample usage:

*Server*

```js
import { Server } from "socket.io";
import customParser from "socket.io-msgpack-parser";

const io = new Server({
  parser: customParser
});
```

*Client (Node.js)*

```js
import { io } from "socket.io-client";
import customParser from "socket.io-msgpack-parser";

const socket = io("https://example.com", {
  parser: customParser
});
```

In the browser, there is now an official bundle which includes this parser:

- https://cdn.socket.io/4.7.5/socket.io.msgpack.min.js
- cdnjs: https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.msgpack.min.js
- jsDelivr: https://cdn.jsdelivr.net/npm/socket.io-client@4.7.5/dist/socket.io.msgpack.min.js
- unpkg: https://unpkg.com/socket.io-client@4.7.5/dist/socket.io.msgpack.min.js

In that case, you don't need to specify the `parser` option.

Pros:

- packets with binary content are sent as one single WebSocket frame (if the WebSocket connection is established)
- may result in smaller payloads (especially when using a lot of numbers)

Cons:

- incompatible with browsers that [do not support Arraybuffers](https://caniuse.com/mdn-javascript_builtins_arraybuffer), like IE9
- harder to debug in the Network tab of the browser

:::info

Please note that `socket.io-msgpack-parser` relies on the [`notepack.io`](https://github.com/darrachequesne/notepack) MessagePack implementation. This implementation mainly focuses on performance and minimal bundle size, and thus does not support features like extension types. For a parser based on the [official JavaScript implementation](https://github.com/msgpack/msgpack-javascript), please check [this package](https://www.npmjs.com/package/@skgdev/socket.io-msgpack-javascript).

:::
