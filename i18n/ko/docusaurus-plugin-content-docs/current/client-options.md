---
title: 클라이언트 옵션
sidebar_label: 옵션
sidebar_position: 2
slug: /client-options/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## IO 팩토리 옵션 {#io-factory-options}

### `forceNew` {#forcenew}

기본값: `false`

새 Manager 인스턴스를 만들지 여부입니다.

Manager 인스턴스는 HTTP 롱 폴링이나 WebSocket으로 맺는 서버와의 저수준 연결을 담당하며, 재연결 로직도 처리합니다.

Socket 인스턴스는 서버와 이벤트를 주고받는 데 쓰는 인터페이스로, 특정 [네임스페이스](categories/06-Advanced/namespaces.md)에 속합니다.

Manager 하나에 여러 Socket 인스턴스를 연결할 수 있습니다.

다음 예시에서는 Socket 인스턴스 3개가 같은 Manager 인스턴스를 재사용합니다(WebSocket 연결은 하나뿐입니다).

```js
const socket = io("https://example.com"); // 메인 네임스페이스
const productSocket = io("https://example.com/product"); // "product" 네임스페이스
const orderSocket = io("https://example.com/order"); // "order" 네임스페이스
```

다음 예시에서는 서로 다른 Manager 인스턴스 3개가 만들어집니다(따라서 WebSocket 연결도 3개가 따로 생깁니다).

```js
const socket = io("https://example.com"); // 메인 네임스페이스
const productSocket = io("https://example.com/product", { forceNew: true }); // "product" 네임스페이스
const orderSocket = io("https://example.com/order", { forceNew: true }); // "order" 네임스페이스
```

이미 사용 중인 네임스페이스를 다시 사용할 때도 매번 새 Manager가 만들어집니다.

```js
const socket1 = io(); // 첫 번째 Manager
const socket2 = io(); // 두 번째 Manager
const socket3 = io("/admin"); // 첫 번째 Manager 재사용
const socket4 = io("/admin"); // 세 번째 Manager
```

### `multiplex` {#multiplex}

기본값: `true`

`forceNew`와 반대되는 옵션으로, 기존 Manager 인스턴스를 재사용할지 여부입니다.

```js
const socket = io(); // 첫 번째 Manager
const adminSocket = io("/admin", { multiplex: false }); // 두 번째 Manager
```

## 저수준 엔진 옵션 {#low-level-engine-options}

:::info

이 설정은 같은 Manager에 연결된 모든 Socket 인스턴스가 공유합니다.

:::

### `addTrailingSlash` {#addtrailingslash}

*v4.6.0에서 추가*

기본값: `true`

요청 경로 끝에 슬래시를 붙일지 여부입니다.

```js
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  addTrailingSlash: false
});
```

위 예시에서 요청 URL은 `https://example.com/socket.io/`가 아니라 `https://example.com/socket.io`가 됩니다.


### `autoUnref` {#autounref}

*v4.0.0에서 추가*

기본값: `false`

`autoUnref`를 `true`로 설정하면 이벤트 루프에 다른 활성 타이머나 TCP 소켓이 없을 때 Socket.IO 클라이언트가 프로그램 종료를 막지 않습니다. 클라이언트가 연결된 상태여도 마찬가지입니다.

```js
import { io } from "socket.io-client";

const socket = io({
  autoUnref: true
});
```

함께 보기: https://nodejs.org/api/timers.html#timeoutunref


### `closeOnBeforeunload` {#closeonbeforeunload}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전 | 변경 사항                             |
|---------|-------------------------------------|
| v4.7.1  | 이 옵션의 기본값이 `false`로 바뀌었습니다. |
| v4.1.0  | 최초 구현.               |

</details>

기본값: `false`

브라우저에서 [`beforeunload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) 이벤트가 발생할 때 연결을 (조용히) 닫을지 여부입니다.

이 옵션이 `false`(기본값)이면 **Firefox에서** 사용자가 페이지를 새로고침할 때 Socket 인스턴스가 `disconnect` 이벤트를 발생시킵니다.

![closeOnBeforeunload가 false일 때 Firefox에서의 예시](/images/closeonbeforeunload-false.gif)

:::note

이 동작은 Firefox에서만 나타납니다. 다른 브라우저에서는 사용자가 페이지를 새로고침해도 Socket 인스턴스가 `disconnect` 이벤트를 발생시키지 않습니다.

:::

이 옵션을 `true`로 설정하면 모든 브라우저가 같은 동작을 합니다(페이지를 새로고침해도 `disconnect` 이벤트가 발생하지 않음).

![closeOnBeforeunload가 true일 때 Firefox에서의 예시](/images/closeonbeforeunload-true.gif)

:::caution

애플리케이션에서 `beforeunload` 이벤트를 사용한다면("이 페이지를 떠나시겠습니까?") 이 옵션을 `false`로 두는 것이 좋습니다.

:::

자세한 내용은 [이 이슈](https://github.com/socketio/socket.io/issues/3639)를 참고하세요.

### `extraHeaders` {#extraheaders}

기본값: -

추가로 보낼 헤더입니다. 서버 측에서는 `socket.handshake.headers` 객체에서 확인할 수 있습니다.

예시:

*클라이언트*

```js
import { io } from "socket.io-client";

const socket = io({
  extraHeaders: {
    "my-custom-header": "1234"
  }
});
```

*서버*

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.headers); // "my-custom-header": "1234"가 포함된 객체
});
```

:::caution

브라우저 환경에서 WebSocket 전송 방식만 활성화하면 `extraHeaders` 옵션은 무시됩니다. 브라우저의 WebSocket API는 커스텀 헤더를 허용하지 않기 때문입니다.

```js
import { io } from "socket.io-client";

const socket = io({
  transports: ["websocket"],
  extraHeaders: {
    "my-custom-header": "1234" // 무시됨
  }
});
```

다만 Node.js나 React Native에서는 동작합니다.

:::

문서: [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)


### `forceBase64` {#forcebase64}

기본값: `false`

WebSocket으로 보내는 바이너리 데이터를 base64로 강제 인코딩할지 여부입니다(HTTP 롱 폴링에서는 항상 활성화됩니다).


### `path` {#path}

기본값: `/socket.io/`

서버 측에서 받아 처리하는 경로의 이름입니다.

:::caution

서버와 클라이언트의 값이 일치해야 합니다(중간에 경로를 다시 쓰는 프록시를 사용하는 경우는 예외입니다).

:::

*클라이언트*

```js
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  path: "/my-custom-path/"
});
```

*서버*

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/my-custom-path/"
});
```

이 값은 URI의 경로와 다르다는 점에 유의하세요. URI의 경로는 [네임스페이스](categories/06-Advanced/namespaces.md)를 나타냅니다.

예시:

```js
import { io } from "socket.io-client";

const socket = io("https://example.com/order", {
  path: "/my-custom-path/"
});
```

- Socket 인스턴스는 "order" 네임스페이스에 연결됩니다.
- HTTP 요청은 다음과 같은 형태가 됩니다: `GET https://example.com/my-custom-path/?EIO=4&transport=polling&t=ML4jUwU`


### `protocols` {#protocols}

*v2.0.0에서 추가*

기본값: -

프로토콜 문자열 하나 또는 프로토콜 문자열 배열입니다. 이 문자열로 하위 프로토콜(sub-protocol)을 지정하면 서버 하나가 여러 WebSocket 하위 프로토콜을 구현할 수 있습니다. 예를 들어 서버 하나가 지정된 프로토콜에 따라 서로 다른 유형의 상호작용을 처리하도록 만들 수 있습니다.

```js
import { io } from "socket.io-client";

const socket = io({
  transports: ["websocket"],
  protocols: ["my-protocol-v1"]
});
```

서버:

```js
io.on("connection", (socket) => {
  const transport = socket.conn.transport;
  console.log(transport.socket.protocol); // "my-protocol-v1" 출력
});
```

참고 자료:

- https://datatracker.ietf.org/doc/html/rfc6455#section-1.9
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket


### `query` {#query}

기본값: -

추가로 보낼 쿼리 매개변수입니다. 서버 측에서는 `socket.handshake.query` 객체에서 확인할 수 있습니다.

예시:

*클라이언트*

```js
import { io } from "socket.io-client";

const socket = io({
  query: {
    x: 42
  }
});
```

*서버*

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.query); // { x: "42", EIO: "4", transport: "polling" } 출력
});
```

쿼리 매개변수는 세션이 유지되는 동안 바꿀 수 없습니다. 따라서 클라이언트 측에서 `query`를 바꿔도 현재 세션이 닫히고 새 세션이 만들어져야 반영됩니다.

```js
socket.io.on("reconnect_attempt", () => {
  socket.io.opts.query.x++;
});
```

참고: 다음 쿼리 매개변수는 예약되어 있으므로 애플리케이션에서 사용할 수 없습니다.

- `EIO`: 프로토콜 버전(현재 "4")
- `transport`: 전송 방식 이름("polling" 또는 "websocket")
- `sid`: 세션 ID
- `j`: 전송 방식이 polling이지만 JSONP 응답이 필요한 경우
- `t`: 캐시 무효화(cache busting)에 쓰는 해시된 타임스탬프


### `rememberUpgrade` {#rememberupgrade}

기본값: `false`

`true`로 설정했고 이전에 서버와의 WebSocket 연결이 성공했다면 일반적인 업그레이드 과정을 건너뜁니다. 이때는 처음부터 WebSocket으로 연결을 시도합니다. 전송 오류가 발생한 뒤의 연결 시도에서는 일반적인 업그레이드 과정을 거칩니다. 이 옵션은 SSL/TLS 연결을 사용하거나, 네트워크가 WebSocket을 차단하지 않는다는 것을 알 때만 켜는 것이 좋습니다.


### `timestampParam` {#timestampparam}

기본값: `"t"`

타임스탬프 키로 사용할 쿼리 매개변수의 이름입니다.


### `timestampRequests` {#timestamprequests}

기본값: `true`

요청마다 타임스탬프 쿼리 매개변수를 추가할지 여부입니다(캐시 무효화용).

### `transportOptions` {#transportoptions}

*v2.0.0에서 추가*

기본값: `{}`

전송 방식별 옵션입니다.

예시:

```js
import { io } from "socket.io-client";

const socket = io({
  path: "/path-for-http-long-polling/",
  transportOptions: {
    websocket: {
      path: "/path-for-websocket/"
    }
  }
});
```

### `transports` {#transports}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전 | 변경 사항                                                 |
|---------|---------------------------------------------------------|
| v4.8.0  | 이제 전송 방식 구현체 배열을 전달할 수 있습니다. |
| v4.7.0  | `webtransport`가 추가되었습니다.                                |
| v1.0.0  | 최초 구현.                                   |

</details>

기본값: `["polling", "websocket", "webtransport"]`

Socket.IO 서버와의 저수준 연결은 다음 방식 중 하나로 맺을 수 있습니다.

- HTTP 롱 폴링: HTTP 요청을 연달아 보내는 방식(쓰기에는 `POST`, 읽기에는 `GET`)
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)

다음 예시는 HTTP 롱 폴링 전송 방식을 비활성화합니다.

```js
const socket = io("https://example.com", { transports: ["websocket"] });
```

참고: 이 경우 서버 측에 스티키 세션이 필요하지 않습니다(자세한 내용은 [여러 노드 사용하기](categories/02-Server/using-multiple-nodes.md) 문서를 참고하세요).

기본적으로는 HTTP 롱 폴링 연결을 먼저 맺은 뒤 WebSocket으로 업그레이드를 시도합니다(자세한 설명은 [업그레이드 메커니즘](categories/01-Documentation/how-it-works.md#upgrade-mechanism)을 참고하세요). WebSocket을 먼저 사용하려면 다음과 같이 하세요.

```js
const socket = io("https://example.com", {
  transports: ["websocket", "polling"] // 가능하면 WebSocket을 먼저 사용
});

socket.on("connect_error", () => {
  // 기존 업그레이드 방식으로 되돌리기
  socket.io.opts.transports = ["polling", "websocket"];
});
```

다만 WebSocket 연결에 실패해야만 [CORS 설정](categories/02-Server/handling-cors.md)이 올바른지 확인된다는 단점이 있을 수 있습니다.

전송 방식 구현체 배열을 전달할 수도 있습니다.

```js
import { io } from "socket.io-client";
import { Fetch, WebSocket } from "engine.io-client";

const socket = io({
  transports: [Fetch, WebSocket]
});
```

제공되는 구현체 목록은 다음과 같습니다.

| 전송 방식       | 설명                                                                                                                                              |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Fetch`         | 내장 [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) 메서드 기반 HTTP 롱 폴링                               |
| `NodeXHR`       | [`xmlhttprequest-ssl`](https://www.npmjs.com/package/xmlhttprequest-ssl) 패키지가 제공하는 `XMLHttpRequest` 객체 기반 HTTP 롱 폴링 |
| `XHR`           | 내장 [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) 객체 기반 HTTP 롱 폴링                      |
| `NodeWebSocket` | [`ws`](https://www.npmjs.com/package/ws) 패키지가 제공하는 `WebSocket` 객체 기반 WebSocket 전송 방식                                    |
| `WebSocket`     | 내장 [`WebSocket`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) 객체 기반 WebSocket 전송 방식                              |
| `WebTransport`  | 내장 [`WebTransport`](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport) 객체 기반 WebTransport 전송 방식                     |

사용 환경:

| 전송 방식       | 브라우저            | Node.js                | Deno               | Bun                |
|-----------------|--------------------|------------------------|--------------------|--------------------|
| `Fetch`         | :white_check_mark: | :white_check_mark: (1) | :white_check_mark: | :white_check_mark: |
| `NodeXHR`       |                    | :white_check_mark:     | :white_check_mark: | :white_check_mark: |
| `XHR`           | :white_check_mark: |                        |                    |                    |
| `NodeWebSocket` |                    | :white_check_mark:     | :white_check_mark: | :white_check_mark: |
| `WebSocket`     | :white_check_mark: | :white_check_mark: (2) | :white_check_mark: | :white_check_mark: |
| `WebTransport`  | :white_check_mark: | :white_check_mark:     |                    |                    |

(1) [v18.0.0](https://nodejs.org/api/globals.html#fetch)부터
(2) [v21.0.0](https://nodejs.org/api/globals.html#websocket)부터

### `tryAllTransports` {#tryalltransports}

*v4.8.0에서 추가*

기본값: `false`

`tryAllTransports` 옵션을 `true`로 설정하면 첫 번째 전송 방식(보통 HTTP 롱 폴링)이 실패했을 때 다른 전송 방식도 시도합니다.

```js
import { io } from "socket.io-client";

const socket = io({
  tryAllTransports: true
});
```

이 기능은 다음 두 가지 경우에 유용합니다.

- 서버에서 HTTP 롱 폴링을 비활성화했거나 CORS가 실패하는 경우
- WebSocket을 먼저 시도하는 경우(`transports: ["websocket", "polling"]`)

유일한 단점은 실패할 경우 연결 시도에 시간이 더 걸릴 수 있다는 점입니다. WebSocket 연결 오류가 감지되기까지 몇 초가 걸렸다는 보고가 있기 때문입니다(HTTP 롱 폴링을 먼저 사용하는 이유 중 하나이기도 합니다). 그래서 현재는 이 옵션의 기본값이 `false`입니다.


### `upgrade` {#upgrade}

기본값: `true`

클라이언트가 전송 방식을 HTTP 롱 폴링에서 더 나은 방식으로 업그레이드하려고 시도할지 여부입니다.


### `withCredentials` {#withcredentials}

<details className="changelog">
    <summary>변경 내역</summary>

| 버전 | 변경 사항                                                      |
|---------|--------------------------------------------------------------|
| v4.7.0  | 이제 Node.js 클라이언트도 `withCredentials` 설정을 따릅니다. |
| v3.0.0  | `withCredentials`의 기본값이 `false`로 바뀌었습니다.                   |
| v1.0.0  | 최초 구현.                                        |

</details>

기본값: `false`

다른 사이트(cross-site)로 보내는 요청에 쿠키, 인증 헤더, TLS 클라이언트 인증서 같은 자격 증명을 포함할지 여부입니다. 같은 사이트로 보내는 요청에는 `withCredentials` 설정이 아무 영향을 주지 않습니다.

```js
import { io } from "socket.io-client";

const socket = io("https://my-backend.com", {
  withCredentials: true
});
```

연결을 허용하려면 서버가 올바른 `Access-Control-Allow-*` 헤더를 보내야 합니다.

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://my-frontend.com",
    credentials: true
  }
});
```

:::caution

`withCredentials`를 `true`로 설정할 때는 `origin: *`를 사용할 수 없습니다. 그렇게 하면 다음 오류가 발생합니다.

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ‘.../socket.io/?EIO=4&transport=polling&t=NvQfU77’. (Reason: Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’)</i>

:::

문서:

- [XMLHttpRequest.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)
- [CORS 처리하기](categories/02-Server/handling-cors.md)

:::info

버전 `4.7.0`부터는 `withCredentials` 옵션을 `true`로 설정하면 Node.js 클라이언트도 HTTP 요청에 쿠키를 포함합니다. 덕분에 쿠키 기반 스티키 세션을 쓰기가 쉬워졌습니다.

:::

### Node.js 전용 옵션 {#nodejs-specific-options}

Node.js 클라이언트는 다음 옵션을 지원합니다.

- `agent`
- `pfx`
- `key`
- `passphrase`
- `cert`
- `ca`
- `ciphers`
- `rejectUnauthorized`

자세한 내용은 Node.js 문서를 참고하세요.

- [tls.connect(options[, callback])](https://nodejs.org/dist/latest/docs/api/tls.html#tls_tls_connect_options_callback)
- [tls.createSecureContext([options])](https://nodejs.org/dist/latest/docs/api/tls.html#tls_tls_createsecurecontext_options)

자체 서명 인증서를 사용하는 예시:

*클라이언트*

```js
import { readFileSync } from "fs";
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  ca: readFileSync("./cert.pem")
});
```

*서버*

```js
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpServer = createServer({
  cert: readFileSync("./cert.pem"),
  key: readFileSync("./key.pem")
});
const io = new Server(httpServer);
```

클라이언트 인증서로 인증하는 예시:

*클라이언트*

```js
import { readFileSync } from "fs";
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  ca: readFileSync("./server-cert.pem"),
  cert: readFileSync("./client-cert.pem"),
  key: readFileSync("./client-key.pem"),
});
```

*서버*

```js
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpServer = createServer({
  cert: readFileSync("./server-cert.pem"),
  key: readFileSync("./server-key.pem"),
  requestCert: true,
  ca: [
    readFileSync("client-cert.pem")
  ]
});
const io = new Server(httpServer);
```

:::caution

`rejectUnauthorized`는 Node.js 전용 옵션이라 브라우저의 보안 검사는 우회하지 못합니다.

![브라우저의 보안 경고](/images/self-signed-certificate.png)

:::

## Manager 옵션 {#manager-options}

:::info

이 설정은 같은 Manager에 연결된 모든 Socket 인스턴스가 공유합니다.

:::

### `autoConnect` {#autoconnect}

기본값: `true`

생성할 때 자동으로 연결할지 여부입니다. `false`로 설정하면 직접 연결해야 합니다.

```js
import { io } from "socket.io-client";

const socket = io({
  autoConnect: false
});

socket.connect();
// 또는
socket.io.open();
```


### `parser` {#parser}

*v2.2.0에서 추가*

기본값: `require("socket.io-parser")`

패킷을 직렬화하고 역직렬화하는 데 쓰는 파서입니다. 자세한 내용은 [커스텀 파서](categories/06-Advanced/custom-parser.md) 문서를 참고하세요.


### `randomizationFactor` {#randomizationfactor}

기본값: `0.5`

재연결할 때 사용하는 무작위화 계수입니다. 예를 들어 서버가 다운된 뒤 모든 클라이언트가 정확히 같은 시각에 재연결하는 일을 막아 줍니다.

기본값을 사용할 때의 예시:

- 첫 번째 재연결 시도는 500~1500ms 사이에 일어납니다(`1000 * 2^0 * (<something between -0.5 and 1.5>)`).
- 두 번째 재연결 시도는 1000~3000ms 사이에 일어납니다(`1000 * 2^1 * (<something between -0.5 and 1.5>)`).
- 세 번째 재연결 시도는 2000~5000ms 사이에 일어납니다(`1000 * 2^2 * (<something between -0.5 and 1.5>)`).
- 그다음 재연결 시도는 5000ms 후에 일어납니다.


### `reconnection` {#reconnection}

기본값: `true`

재연결을 활성화할지 여부입니다. `false`로 설정하면 직접 재연결해야 합니다.

```js
import { io } from "socket.io-client";

const socket = io({
  reconnection: false
});

const tryReconnect = () => {
  setTimeout(() => {
    socket.io.open((err) => {
      if (err) {
        tryReconnect();
      }
    });
  }, 2000);
}

socket.io.on("close", tryReconnect);
```

### `reconnectionAttempts` {#reconnectionattempts}

기본값: `Infinity`

재연결을 포기하기 전까지 시도하는 횟수입니다.

### `reconnectionDelay` {#reconnectiondelay}

기본값: `1000`

재연결 전 초기 지연 시간(밀리초)입니다([randomizationFactor](#randomizationfactor) 값의 영향을 받습니다).

### `reconnectionDelayMax` {#reconnectiondelaymax}

기본값: `5000`

두 재연결 시도 사이의 최대 지연 시간입니다. 재연결 지연 시간은 시도할 때마다 2배로 늘어납니다.


### `timeout` {#timeout}

기본값: `20000`

연결 시도마다 적용되는 타임아웃(밀리초)입니다.


## Socket 옵션 {#socket-options}

:::info

이 설정은 Socket 인스턴스마다 따로 적용됩니다.

:::

### `ackTimeout` {#acktimeout}

*v4.6.0에서 추가*

기본값: -

확인 응답(acknowledgement)을 기다릴 때 사용하는 기본 타임아웃(밀리초)입니다. Manager가 연결할 때 쓰는 기존 [timeout](#timeout) 옵션과 혼동하지 마세요.

[`retries`](#retries)와 함께 사용해야 합니다.

### `auth` {#auth}

*v3.0.0에서 추가*

기본값: -

네임스페이스에 접근할 때 보내는 자격 증명입니다([자격 증명 보내기](categories/02-Server/middlewares.md#sending-credentials)도 참고하세요).

예시:

*클라이언트*

```js
import { io } from "socket.io-client";

const socket = io({
  auth: {
    token: "abcd"
  }
});

// 또는 함수로
const socket = io({
  auth: (cb) => {
    cb({ token: localStorage.token })
  }
});
```

*서버*

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.auth); // { token: "abcd" } 출력
});
```

네임스페이스 접근이 거부되면 `auth` 객체를 수정할 수 있습니다.

```js
socket.on("connect_error", (err) => {
  if (err.message === "invalid credentials") {
    socket.auth.token = "efgh";
    socket.connect();
  }
});
```

또는 Socket 인스턴스를 직접 강제로 재연결할 수도 있습니다.

```js
socket.auth.token = "efgh";
socket.disconnect().connect();
```

### `retries` {#retries}

*v4.6.0에서 추가*

기본값: -

최대 재시도 횟수입니다. 이 횟수를 넘으면 패킷은 버려집니다.

```js
const socket = io({
  retries: 3,
  ackTimeout: 10000
});

// 암묵적 확인 응답
socket.emit("my-event");

// 명시적 확인 응답
socket.emit("my-event", (err, val) => { /* ... */ });

// 커스텀 타임아웃(이 경우 ackTimeout은 선택 사항)
socket.timeout(5000).emit("my-event", (err, val) => { /* ... */ });
```

:::caution

서버는 반드시 이벤트에 확인 응답을 보내야 합니다(암묵적 확인 응답인 경우에도).

```js
io.on("connection", (socket) => {
  socket.on("my-event", (cb) => {
    cb("got it");
  });
});
```

그렇지 않으면 클라이언트는 이벤트 전송을 최대 `retries + 1`번까지 시도합니다.

:::
