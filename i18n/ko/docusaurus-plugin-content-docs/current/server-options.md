---
title: 서버 옵션
sidebar_label: 옵션
sidebar_position: 2
slug: /server-options/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Socket.IO 서버 옵션 {#socketio-server-options}

다음 옵션은 Socket.IO 서버의 동작에 영향을 줍니다.

### `adapter` {#adapter}

기본값: `require("socket.io-adapter")` (인메모리 어댑터, 소스 코드는 [여기](https://github.com/socketio/socket.io-adapter/)에 있습니다)

사용할 ["어댑터"](categories/08-Miscellaneous/glossary.md#adapter)입니다.

[Redis 어댑터](categories/05-Adapters/adapter-redis.md)를 사용하는 예시:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

  </TabItem>
</Tabs>


### `cleanupEmptyChildNamespaces` {#cleanupemptychildnamespaces}

*v4.6.0에서 추가*

기본값: `false`

연결된 소켓이 없는 [자식 네임스페이스](categories/06-Advanced/namespaces.md#dynamic-namespaces)를 제거할지 여부입니다.

네임스페이스마다 자체 어댑터 인스턴스를 생성하므로 동적 네임스페이스를 많이 만든다면 이 옵션이 유용할 수 있습니다.

이 옵션을 켜면(기본값은 꺼짐) 동적 네임스페이스에서 소켓의 연결이 끊길 때 그 네임스페이스에 남은 소켓이 없으면 네임스페이스를 정리하고 어댑터를 닫습니다.

### `connectionStateRecovery` {#connectionstaterecovery}

*v4.6.0에서 추가*

기본값: `undefined`

[연결 상태 복구](./categories/01-Documentation/connection-state-recovery.md) 기능의 옵션입니다.

```js
const io = new Server(httpServer, {
  connectionStateRecovery: {
    // 세션과 패킷을 백업해 두는 기간
    maxDisconnectionDuration: 2 * 60 * 1000,
    // 복구에 성공했을 때 미들웨어를 건너뛸지 여부
    skipMiddlewares: false,
  }
});
```

:::tip

연결 상태 복구 기능은 간헐적인 연결 끊김에 대응하도록 설계되었습니다. 따라서 `maxDisconnectionDuration`에는 적절한 값을 사용하세요(`Infinity`는 사용하지 마세요).

:::

`skipMiddlewares` 옵션을 `true`로 설정하면 연결이 성공적으로 복구됐을 때 미들웨어를 건너뜁니다.

```js
function computeUserIdFromHeaders(headers) {
  // 직접 구현하세요
}

// 연결이 성공적으로 복구되면 이 미들웨어는 건너뜁니다
io.use(async (socket, next) => {
  socket.data.userId = await computeUserIdFromHeaders(socket.handshake.headers);

  next();
});

io.on("connection", (socket) => {
  // userId 속성 값은 다음 두 곳 중 한 곳에서 가져옵니다.
  // - 위의 미들웨어(첫 연결이거나 복구에 실패한 경우)
  // - 복구 메커니즘
  console.log("userId", socket.data.userId);
});
```

:::caution

예를 들어 `skipMiddlewares` 옵션을 켜면 연결이 끊겨 있던 동안 차단된 사용자가 미들웨어 검증을 거치지 않고 다시 연결할 수도 있습니다. 따라서 이 옵션은 신중하게 사용하세요.

:::

### `connectTimeout` {#connecttimeout}

기본값: `45000`

네임스페이스에 정상적으로 참여하지 못한 클라이언트의 연결을 끊기까지 기다리는 시간(밀리초)입니다.

### `parser` {#parser}

기본값: `socket.io-parser`

사용할 파서입니다. 자세한 내용은 [커스텀 파서](categories/06-Advanced/custom-parser.md) 문서를 참고하세요.


### `path` {#path}

기본값: `/socket.io/`

서버 측에서 받아 처리하는 경로입니다.

:::caution

서버와 클라이언트의 값이 일치해야 합니다(중간에 경로를 다시 쓰는 프록시를 사용하는 경우는 예외입니다).

:::

*서버*

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/my-custom-path/"
});
```

*클라이언트*

```js
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  path: "/my-custom-path/"
});
```

### `serveClient` {#serveclient}

기본값: `true`

클라이언트 파일을 제공할지 여부입니다. `true`이면 각 번들을 다음 위치에서 제공합니다.

- `<url>/socket.io/socket.io.js`
- `<url>/socket.io/socket.io.min.js`
- `<url>/socket.io/socket.io.msgpack.min.js`

(각 번들의 소스 맵도 함께 제공합니다)

[클라이언트 설치](categories/03-Client/client-installation.md#standalone-build) 문서도 참고하세요.


## 저수준 엔진 옵션 {#low-level-engine-options}

다음 옵션은 내부 Engine.IO 서버의 동작에 영향을 줍니다.

### `addTrailingSlash` {#addtrailingslash}

*v4.6.0에서 추가*

기본값: `true`

서버 경로 끝에 슬래시를 붙일지 여부입니다.

```js
import { createServer } from "node:http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  addTrailingSlash: false
});
```

위 예시에서는 클라이언트가 끝의 슬래시를 생략하고 `/socket.io/` 대신 `/socket.io`를 사용할 수 있습니다.


### `allowEIO3` {#alloweio3}

기본값: `false`

Socket.IO v2 클라이언트와의 호환성을 켤지 여부입니다.

함께 보기: [2.x에서 3.0으로 마이그레이션하기](categories/07-Migrations/migrating-from-2-to-3.md#how-to-upgrade-an-existing-production-deployment)

예시:

```js
const io = new Server(httpServer, {
  allowEIO3: true // 기본값은 false
});
```


### `allowRequest` {#allowrequest}

기본값: `-`

핸드셰이크 요청이나 업그레이드 요청을 첫 번째 매개변수로 받아 계속 진행할지 결정하는 함수입니다.

예시:

```js
const io = new Server(httpServer, {
  allowRequest: (req, callback) => {
    const isOriginValid = check(req);
    callback(null, isOriginValid);
  }
});
```


### `allowUpgrades` {#allowupgrades}

기본값: `true`

전송 방식 업그레이드를 허용할지 여부입니다.


### `cookie` {#cookie}

기본값: 쿠키를 보내지 않음

[`cookie`](https://github.com/jshttp/cookie/) 모듈에 전달할 옵션 목록입니다. 사용할 수 있는 옵션은 다음과 같습니다.

- domain
- encode
- expires
- httpOnly
- maxAge
- path
- sameSite
- secure

예시:

```js
import { Server } from "socket.io";

const io = new Server(httpServer, {
  cookie: {
    name: "my-cookie",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400
  }
});
```

:::info

Socket.IO v3부터는 기본적으로 쿠키를 보내지 않습니다([참고](categories/07-Migrations/migrating-from-2-to-3.md#no-more-cookie-by-default)).

:::


### `cors` {#cors}

기본값: `-`

[`cors`](https://www.npmjs.com/package/cors) 모듈에 전달할 옵션 목록입니다. 자세한 내용은 [CORS 처리하기](categories/02-Server/handling-cors.md) 문서를 참고하세요.

예시:

- 특정 출처 허용

```js
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com"]
  }
});
```

- 로컬 개발 환경에서 특정 출처 허용

```js
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"]
  }
});
```

- 지정한 출처, 헤더, 자격 증명(쿠키, 인증 헤더, TLS 클라이언트 인증서 등) 허용

```js
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com", "https://dev.example.com"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
```

:::note

브라우저가 쿠키, 인증 헤더, TLS 클라이언트 인증서 같은 자격 증명을 보내게 하려면 클라이언트 측에서도 [`withCredentials`](./client-options.md#withcredentials) 옵션을 `true`로 설정해야 합니다.

```js
import { io } from "socket.io-client";

const socket = io("https://my-backend.com", {
  withCredentials: true
});
```

자세한 내용은 [XMLHttpRequest.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials) 문서를 참고하세요.

:::

- 모든 출처 허용

```js
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});
```

:::warning

이 경우 어떤 도메인이든 서버에 접근할 수 있으므로 사실상 교차 출처 리소스 공유(CORS)가 제공하는 보안을 끄는 것과 같습니다. 신중하게 사용하세요.

:::

사용할 수 있는 옵션:

| 옵션                   | 설명                                                                                                                                                                                                                                                                                                               |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `origin`               | **Access-Control-Allow-Origin** CORS 헤더를 설정합니다.                                                                                                                                                                                                                                                        |
| `methods`              | **Access-Control-Allow-Methods** CORS 헤더를 설정합니다. 쉼표로 구분한 문자열(예: 'GET,PUT,POST')이나 배열(예: `['GET', 'PUT', 'POST']`)을 받습니다.                                                                                                                                                     |
| `allowedHeaders`       | **Access-Control-Allow-Headers** CORS 헤더를 설정합니다. 쉼표로 구분한 문자열(예: 'Content-Type,Authorization')이나 배열(예: `['Content-Type', 'Authorization']`)을 받습니다. 지정하지 않으면 요청의 **Access-Control-Request-Headers** 헤더에 담긴 값을 그대로 반영합니다. |
| `exposedHeaders`       | **Access-Control-Expose-Headers** CORS 헤더를 설정합니다. 쉼표로 구분한 문자열(예: 'Content-Range,X-Content-Range')이나 배열(예: `['Content-Range', 'X-Content-Range']`)을 받습니다. 지정하지 않으면 커스텀 헤더를 노출하지 않습니다.                                                                    |
| `credentials`          | **Access-Control-Allow-Credentials** CORS 헤더를 설정합니다. `true`로 설정하면 헤더를 보내고, 그렇지 않으면 생략합니다.                                                                                                                                                                                        |
| `maxAge`               | **Access-Control-Max-Age** CORS 헤더를 설정합니다. 정수로 설정하면 헤더를 보내고, 그렇지 않으면 생략합니다.                                                                                                                                                                                              |
| `preflightContinue`    | CORS 사전 요청(preflight) 응답을 다음 핸들러로 넘깁니다.                                                                                                                                                                                                                                                              |
| `optionsSuccessStatus` | `OPTIONS` 요청이 성공했을 때 사용할 상태 코드를 지정합니다. 일부 레거시 브라우저(IE11, 여러 스마트 TV)는 `204`를 제대로 처리하지 못합니다.                                                                                                                                                                               |

`origin` 옵션에 사용할 수 있는 값은 다음과 같습니다.

- `Boolean` - `origin`을 `true`로 설정하면 `req.header('Origin')`으로 정의되는 [요청 출처](http://tools.ietf.org/html/draft-abarth-origin-09)를 그대로 반영하고, `false`로 설정하면 CORS를 끕니다.
- `String` - `origin`을 특정 출처로 설정합니다. 예를 들어 `"http://example.com"`으로 설정하면 "http://example.com"에서 온 요청만 허용합니다.
- `RegExp` - `origin`을 요청 출처를 검사할 정규 표현식 패턴으로 설정합니다. 패턴과 일치하면 요청 출처를 그대로 반영합니다. 예를 들어 `/example\.com$/` 패턴은 "example.com"으로 끝나는 출처에서 온 요청을 모두 반영합니다.
- `Array` - `origin`을 유효한 출처의 배열로 설정합니다. 각 출처는 `String`이나 `RegExp`일 수 있습니다. 예를 들어 `["http://example1.com", /\.example2\.com$/]`는 "http://example1.com"이나 "example2.com"의 하위 도메인에서 온 요청을 모두 허용합니다.
- `Function` - `origin`을 커스텀 로직을 구현한 함수로 설정합니다. 이 함수는 첫 번째 매개변수로 요청 출처를, 두 번째 매개변수로 콜백(`err [object], allow [bool]` 시그니처를 따름)을 받습니다.

:::note

도메인이 여러 개여도 옵션 이름은 `origins`가 아니라 `origin`입니다.

```js
const io = new Server(httpServer, {
  cors: {
    // 나쁜 예
    origins: ["https://example.com"],
    // 좋은 예
    origin: ["https://example.com"],
  }
});
```

:::

:::caution

`credentials: true`를 설정할 때는 `origin: "*"`를 사용할 수 없습니다.

```js
// 이렇게 하면 동작하지 않습니다
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true
  }
});
```

브라우저 콘솔에 다음과 같은 오류가 표시됩니다.

> Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ‘.../socket.io/?EIO=4&transport=polling&t=NvQfU77’. (Reason: Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’)

도메인 목록을 지정하거나(권장) 다음 방법을 사용해야 합니다.

```js
const io = new Server(httpServer, {
  cors: {
    origin: (_req, callback) => {
      callback(null, true);
    },
    credentials: true
  }
});
```

이 방법을 쓰면 `origin: "*"`나 `origin: true`와 마찬가지로 어떤 도메인이든 서버에 접근할 수 있으므로 사실상 교차 출처 리소스 공유(CORS)가 제공하는 보안을 끄는 것과 같습니다. 신중하게 사용하세요.

:::

### `httpCompression` {#httpcompression}

*v1.4.0에서 추가*

기본값: `true`

HTTP 롱 폴링 전송 방식에서 압축을 사용할지 여부입니다.

참고로 `httpCompression`을 `false`로 설정하면 HTTP 롱 폴링 요청으로 연결된 경우 이벤트를 보낼 때 지정한 compress 플래그(`socket.compress(true).emit(...)`)가 무시됩니다.

Node.js [`zlib` 모듈](https://nodejs.org/api/zlib.html#zlib_class_options)의 옵션을 모두 지원합니다.

예시:

```js
const io = new Server(httpServer, {
  httpCompression: {
    // Engine.IO 옵션
    threshold: 2048, // 기본값은 1024
    // Node.js zlib 옵션
    chunkSize: 8 * 1024, // 기본값은 16 * 1024
    windowBits: 14, // 기본값은 15
    memLevel: 7, // 기본값은 8
  }
});
```


### `maxHttpBufferSize` {#maxhttpbuffersize}

기본값: `1e6` (1 MB)

메시지 하나의 최대 크기(바이트)입니다. 이 크기를 넘으면 소켓을 닫습니다. 필요에 따라 이 값을 늘리거나 줄일 수 있습니다.

```js
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e8
});
```

ws 패키지의 [maxPayload](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback) 옵션에 해당합니다.


### `perMessageDeflate` {#permessagedeflate}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전    | 변경 사항                                                    |
|---------|--------------------------------------------------------------|
| v3.0.0  | permessage-deflate 확장이 기본적으로 꺼지도록 바뀌었습니다.  |
| v1.4.0  | 최초 구현.                                                   |

</details>

기본값: `false`

WebSocket 전송 방식에서 [permessage-deflate 확장](https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression-19)을 사용할지 여부입니다. 이 확장은 성능과 메모리 사용량 면에서 상당한 오버헤드를 일으키는 것으로 알려져 있으므로 꼭 필요할 때만 켜는 것을 권장합니다.

참고로 `perMessageDeflate`를 `false`(기본값)로 설정하면 WebSocket으로 연결된 경우 이벤트를 보낼 때 지정한 compress 플래그(`socket.compress(true).emit(...)`)가 무시됩니다. permessage-deflate 확장은 메시지마다 따로 켤 수 없기 때문입니다.

[`ws` 모듈](https://github.com/websockets/ws/blob/master/README.md#websocket-compression)의 옵션을 모두 지원합니다.

```js
const io = new Server(httpServer, {
  perMessageDeflate: {
    threshold: 2048, // 기본값은 1024

    zlibDeflateOptions: {
      chunkSize: 8 * 1024, // 기본값은 16 * 1024
    },

    zlibInflateOptions: {
      windowBits: 14, // 기본값은 15
      memLevel: 7, // 기본값은 8
    },

    clientNoContextTakeover: true, // 기본값은 협상된 값
    serverNoContextTakeover: true, // 기본값은 협상된 값
    serverMaxWindowBits: 10, // 기본값은 협상된 값

    concurrencyLimit: 20, // 기본값은 10
  }
});
```


### `pingInterval` {#pinginterval}

기본값: `25000`

이 값은 하트비트 메커니즘에 사용됩니다. 하트비트는 서버와 클라이언트 사이의 연결이 아직 살아 있는지 주기적으로 확인합니다.

서버는 `pingInterval` ms마다 ping 패킷을 보내고, 클라이언트가 `pingTimeout` ms 안에 pong으로 응답하지 않으면 연결이 닫힌 것으로 판단합니다.

마찬가지로 클라이언트도 `pingInterval + pingTimeout` ms 안에 서버에서 ping 패킷을 받지 못하면 연결이 닫힌 것으로 판단합니다.

두 경우 모두 연결이 끊긴 이유는 `ping timeout`입니다.

```js
socket.on("disconnect", (reason) => {
  console.log(reason); // "ping timeout"
});
```

:::caution

`1000`(초당 하트비트 한 번)처럼 작은 값을 쓰면 서버에 부하가 생깁니다. 연결된 클라이언트가 수천 개만 되어도 눈에 띄는 수준일 수 있습니다.

:::

### `pingTimeout` {#pingtimeout}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전    | 변경 사항                                 |
|---------|-------------------------------------------|
| v4.0.0  | `pingTimeout`의 기본값이 `20000` ms로 바뀌었습니다. |
| v2.1.0  | 기본값 `5000` ms.                         |
| v1.0.0  | 기본값 `60000` ms.                        |

</details>

기본값: `20000`

[위](#pinginterval)를 참고하세요.

:::caution

값을 작게 설정하면 서버가 잠시 응답하지 않을 때 클라이언트 재연결이 대량으로 발생할 수 있습니다.

반대로 값을 크게 설정하면 끊어진 연결을 감지하는 데 더 오래 걸립니다. 또 `pingInterval + pingTimeout`이 60초보다 크면 React Native에서 경고가 표시될 수 있습니다.

:::

:::tip

디버거로 애플리케이션을 일시 중지하면 하트비트가 타임아웃되어 연결이 닫힐 수 있습니다. 디버깅하는 동안에는 `pingTimeout`이나 `pingInterval`(또는 둘 다)을 잠시 늘려 두면 됩니다.

함께 보기: [디버거와 함께 Socket.IO 사용하기](/how-to/debug-with-socket-io)

:::

### `transports` {#transports}

기본값: `["polling", "websocket"]`

서버 측에서 허용하는 저수준 전송 방식입니다.

WebTransport를 켠 예시:

```js
const io = new Server({
  transports: ["polling", "websocket", "webtransport"]
});
```

WebTransport 예제는 [여기](/get-started/webtransport)를 참고하세요.

함께 보기: 클라이언트 측 [`transports`](client-options.md#transports)

### `upgradeTimeout` {#upgradetimeout}

기본값: `10000`

완료되지 않은 전송 방식 업그레이드를 취소하기까지 기다리는 시간(밀리초)입니다.


### `wsEngine` {#wsengine}

기본값: `require("ws").Server` (소스 코드는 [여기](https://github.com/websockets/ws)에 있습니다)

사용할 WebSocket 서버 구현체입니다. 자세한 내용은 [서버 설치](categories/02-Server/server-installation.md#other-websocket-server-implementations) 문서를 참고하세요.

예시:

```js
const io = new Server(httpServer, {
  wsEngine: require("eiows").Server
});
```
