---
title: 커스텀 파서
sidebar_position: 2
slug: /custom-parser/
---

Socket.IO v2.0.0부터는 직접 만든 파서를 지정해 패킷의 직렬화/역직렬화(marshalling/unmarshalling) 방식을 제어할 수 있습니다.

*서버*

```js
import { Server } from "socket.io";

const io = new Server({
  parser: myParser
});
```

*클라이언트*

```js
import { io } from "socket.io-client";

const socket = io({
  parser: myParser
});
```

## 사용 가능한 파서 {#available-parsers}

[기본 파서](#the-default-parser) 외에 사용할 수 있는 파서는 다음과 같습니다.

| 패키지                                                                                                       | 설명                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`socket.io-circular-parser`](https://www.npmjs.com/package/socket.io-circular-parser)                       | 기본 파서와 비슷하지만 순환 참조를 처리합니다.                                                                                            |
| [`socket.io-msgpack-parser`](https://www.npmjs.com/package/socket.io-msgpack-parser)                         | [MessagePack](https://msgpack.org/)으로 패킷을 인코딩합니다([`notepack.io`](https://github.com/darrachequesne/notepack) 패키지 기반).         |
| [`@skgdev/socket.io-msgpack-javascript`](https://www.npmjs.com/package/@skgdev/socket.io-msgpack-javascript) | [MessagePack](https://msgpack.org/)으로 패킷을 인코딩합니다([`@msgpack/msgpack`](https://github.com/msgpack/msgpack-javascript) 패키지 기반). |
| [`socket.io-json-parser`](https://www.npmjs.com/package/socket.io-json-parser)                               | `JSON.stringify()`와 `JSON.parse()`로 패킷을 인코딩합니다.                                                                                          |
| [`socket.io-cbor-x-parser`](https://www.npmjs.com/package/socket.io-cbor-x-parser)                           | [cbor-x](https://github.com/kriszyp/cbor-x)로 패킷을 인코딩합니다.                                                                                    |
| [`@socket.io/devalue-parser`](https://www.npmjs.com/package/@socket.io/devalue-parser)                       | [devalue](https://github.com/Rich-Harris/devalue)로 패킷을 인코딩합니다.                                                                              |

## 커스텀 파서 구현하기 {#implementing-your-own-parser}

다음은 `JSON.stringify()`와 `JSON.parse()` 메서드를 사용하는 파서의 기본 예시입니다.

```js
import { Emitter } from "@socket.io/component-emitter"; // 브라우저용 Node.js EventEmitter 폴리필

class Encoder {
  /**
   * 패킷을 문자열/버퍼 목록으로 인코딩합니다
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
   * 청크(문자열 또는 버퍼)를 받고, 필요하면 재구성한 패킷과 함께 "decoded" 이벤트를 보냅니다
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
   * 내부 버퍼를 정리합니다
   */
  destroy() {}
}

export const parser = { Encoder, Decoder };
```

## 기본 파서 {#the-default-parser}

기본 파서(`socket.io-parser` 패키지)의 소스 코드는 다음 주소에서 볼 수 있습니다: https://github.com/socketio/socket.io-parser

출력 예시:

- 기본적인 emit

```js
socket.emit("test", 42);
```

다음과 같이 인코딩됩니다.

```
2["test",42]
||
|└─ JSON-encoded payload
└─ packet type (2 => EVENT)
```

- 바이너리, 확인 응답(acknowledgement), 커스텀 네임스페이스를 사용하는 emit

```js
socket.emit("test", Uint8Array.from([42]), () => {
  console.log("ack received");
});
```

다음과 같이 인코딩됩니다.

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

장점:

- 바이너리 첨부 데이터를 base64로 인코딩하므로 IE9처럼 [ArrayBuffer를 지원하지 않는](https://caniuse.com/mdn-javascript_builtins_arraybuffer) 브라우저와도 호환됩니다

단점:

- 바이너리 콘텐츠가 담긴 패킷은 WebSocket 프레임 두 개로 나뉘어 전송됩니다(WebSocket 연결이 맺어진 경우)

## msgpack 파서 {#the-msgpack-parser}

이 파서는 [MessagePack](https://msgpack.org/) 직렬화 형식을 사용합니다.

이 파서의 소스 코드는 다음 주소에서 볼 수 있습니다: https://github.com/socketio/socket.io-msgpack-parser

사용 예시:

*서버*

```js
import { Server } from "socket.io";
import customParser from "socket.io-msgpack-parser";

const io = new Server({
  parser: customParser
});
```

*클라이언트(Node.js)*

```js
import { io } from "socket.io-client";
import customParser from "socket.io-msgpack-parser";

const socket = io("https://example.com", {
  parser: customParser
});
```

브라우저용으로는 이제 이 파서가 포함된 공식 번들이 제공됩니다.

| CDN           | URL                                                                               |
|---------------|-----------------------------------------------------------------------------------|
| Socket.IO CDN | https://cdn.socket.io/4.8.4/socket.io.msgpack.min.js                              |
| cdnjs         | https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.4/socket.io.msgpack.min.js   |
| jsDelivr      | https://cdn.jsdelivr.net/npm/socket.io-client@4.8.4/dist/socket.io.msgpack.min.js |
| unpkg         | https://unpkg.com/socket.io-client@4.8.4/dist/socket.io.msgpack.min.js            |

이 번들을 사용하면 `parser` 옵션을 지정하지 않아도 됩니다.

장점:

- 바이너리 콘텐츠가 담긴 패킷이 WebSocket 프레임 하나로 전송됩니다(WebSocket 연결이 맺어진 경우)
- 페이로드가 더 작아질 수 있습니다(특히 숫자를 많이 사용할 때)

단점:

- IE9처럼 [ArrayBuffer를 지원하지 않는](https://caniuse.com/mdn-javascript_builtins_arraybuffer) 브라우저와 호환되지 않습니다
- 브라우저의 네트워크 탭에서 디버깅하기가 더 어렵습니다

:::info

참고로 `socket.io-msgpack-parser`는 [`notepack.io`](https://github.com/darrachequesne/notepack) MessagePack 구현을 사용합니다. 이 구현은 주로 성능과 작은 번들 크기에 중점을 두기 때문에 확장 타입(extension type) 같은 기능은 지원하지 않습니다. [공식 JavaScript 구현](https://github.com/msgpack/msgpack-javascript)을 기반으로 한 파서가 필요하면 [이 패키지](https://www.npmjs.com/package/@skgdev/socket.io-msgpack-javascript)를 확인하세요.

:::
