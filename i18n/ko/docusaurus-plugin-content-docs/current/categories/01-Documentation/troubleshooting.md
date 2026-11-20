---
title: 연결 문제 해결
sidebar_label: 문제 해결
sidebar_position: 7
slug: /troubleshooting-connection-issues/
toc_max_heading_level: 4
---

:::tip

[관리자 UI](../06-Advanced/admin-ui.md)를 사용하면 Socket.IO 배포 상태를 더 자세히 파악할 수 있습니다.

:::

자주 발생하는 문제와 알려진 문제:

- [소켓이 연결되지 않음](#problem-the-socket-is-not-able-to-connect)
- [소켓의 연결이 끊김](#problem-the-socket-gets-disconnected)
- [소켓이 HTTP 롱 폴링에서 벗어나지 못함](#problem-the-socket-is-stuck-in-http-long-polling)

그 밖에 자주 실수하는 부분:

- [이벤트 중복 등록](#duplicate-event-registration)
- [이벤트 핸들러를 늦게 등록하는 경우](#delayed-event-handler-registration)
- [`socket.id` 속성 사용](#usage-of-the-socketid-attribute)
- [서버리스 플랫폼에 배포](#deployment-on-a-serverless-platform)


## 문제: 소켓이 연결되지 않음 {#problem-the-socket-is-not-able-to-connect}

### 문제 해결 단계 {#troubleshooting-steps}

클라이언트 측에서는 `connect_error` 이벤트로 추가 정보를 확인할 수 있습니다.

```js
socket.on("connect_error", (err) => {
  // 오류 원인. 예: "xhr poll error"
  console.log(err.message);

  // 추가 설명. 예: 첫 HTTP 응답의 상태 코드
  console.log(err.description);

  // 추가 컨텍스트. 예: XMLHttpRequest 객체
  console.log(err.context);
});
```

서버 측에서도 `connection_error` 이벤트로 추가 정보를 얻을 수 있습니다.

```js
io.engine.on("connection_error", (err) => {
  console.log(err.req);	     // 요청 객체
  console.log(err.code);     // 오류 코드. 예: 1
  console.log(err.message);  // 오류 메시지. 예: "Session ID unknown"
  console.log(err.context);  // 추가 오류 컨텍스트
});
```

발생할 수 있는 오류 코드는 다음과 같습니다.

| 코드 |            메시지             | 가능한 원인                                                                                                                                           |
|:----:|:------------------------------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
|  0   |      "Transport unknown"       | 정상적인 상황에서는 발생하지 않습니다.                                                                                                              |
|  1   |      "Session ID unknown"      | 대개 스티키 세션이 활성화되지 않았다는 뜻입니다([아래](#you-didnt-enable-sticky-sessions-in-a-multi-server-setup) 참고).                              |
|  2   |     "Bad handshake method"     | 정상적인 상황에서는 발생하지 않습니다.                                                                                                              |
|  3   |         "Bad request"          | 대개 서버 앞단의 프록시가 WebSocket 헤더를 제대로 전달하지 않는다는 뜻입니다([리버스 프록시 문서](../02-Server/behind-a-reverse-proxy.md) 참고). |
|  4   |          "Forbidden"           | [`allowRequest()`](../../server-options.md#allowrequest) 메서드가 연결을 거부했습니다.                                                               |
|  5   | "Unsupported protocol version" | 클라이언트 버전이 서버와 호환되지 않습니다([관련 내용](#the-client-is-not-compatible-with-the-version-of-the-server) 참고).                         |

### 가능한 원인 {#possible-explanations}

#### 일반 WebSocket 서버에 접속하려는 경우 {#you-are-trying-to-reach-a-plain-websocket-server}

["Socket.IO가 아닌 것"](index.md#what-socketio-is-not) 섹션에서 설명했듯이 Socket.IO 클라이언트는 WebSocket 구현체가 아닙니다. 따라서 `transports: ["websocket"]`을 지정해도 WebSocket 서버와 연결할 수 없습니다.

```js
const socket = io("ws://echo.websocket.org", {
  transports: ["websocket"]
});
```

#### 서버에 접속할 수 없는 경우 {#the-server-is-not-reachable}

주어진 URL로 Socket.IO 서버에 실제로 접속할 수 있는지 확인하세요. 다음 명령으로 테스트할 수 있습니다.

```
curl "<the server URL>/socket.io/?EIO=4&transport=polling"
```

정상이라면 다음과 비슷한 응답이 와야 합니다.

```
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}
```

그렇지 않다면 Socket.IO 서버가 실행 중인지, 중간에 연결을 가로막는 것이 없는지 확인하세요.

:::note

v1/v2 서버(프로토콜 v3을 구현하므로 `EIO=3`)는 다음과 비슷한 응답을 반환합니다.

```
96:0{"sid":"ptzi_578ycUci8WLB9G1","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":5000}2:40
```

:::

#### 클라이언트가 서버 버전과 호환되지 않는 경우 {#the-client-is-not-compatible-with-the-version-of-the-server}

Socket.IO 팀은 하위 호환성 유지를 최우선으로 여기지만, 몇몇 특별한 경우에는 프로토콜 수준에서 호환성을 깨는 변경을 할 수밖에 없었습니다.

- v1.x에서 v2.0.0으로(2017년 5월 출시): JavaScript가 아닌 클라이언트와의 호환성을 높이려고 변경했습니다([관련 이슈](https://github.com/socketio/engine.io/issues/315) 참고).
- v2.x에서 v3.0.0으로(2020년 11월 출시): 프로토콜의 오래된 문제 몇 가지를 완전히 해결하려고 변경했습니다([관련 문서](../07-Migrations/migrating-from-2-to-3.md) 참고).

:::info

`v4.0.0`에는 JavaScript 서버 API의 호환성을 깨는 변경이 일부 있습니다. 하지만 Socket.IO 프로토콜 자체는 바뀌지 않았으므로 v3 클라이언트는 v4 서버에 접속할 수 있고, 그 반대도 가능합니다([관련 문서](../07-Migrations/migrating-from-3-to-4.md) 참고).

:::

예를 들어 v1/v2 클라이언트로 v3/v4 서버에 접속하면 다음과 같은 응답을 받습니다.

```
< HTTP/1.1 400 Bad Request
< Content-Type: application/json

{"code":5,"message":"Unsupported protocol version"}
```

[JS 클라이언트](https://github.com/socketio/socket.io-client/)의 호환성 표는 다음과 같습니다.

<table>
    <tr>
        <th rowspan="2">JS 클라이언트 버전</th>
        <th colspan="4">Socket.IO 서버 버전</th>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>예</b></td>
        <td align="center">아니요</td>
        <td align="center">아니요</td>
        <td align="center">아니요</td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">아니요</td>
        <td align="center"><b>예</b></td>
        <td align="center"><b>예</b><sup>1</sup></td>
        <td align="center"><b>예</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">3.x</td>
        <td align="center">아니요</td>
        <td align="center">아니요</td>
        <td align="center"><b>예</b></td>
        <td align="center"><b>예</b></td>
    </tr>
    <tr>
        <td align="center">4.x</td>
        <td align="center">아니요</td>
        <td align="center">아니요</td>
        <td align="center"><b>예</b></td>
        <td align="center"><b>예</b></td>
    </tr>
</table>

[1] 호환됩니다. 단, [allowEIO3: true](../../server-options.md#alloweio3)가 필요합니다.

[Java 클라이언트](https://github.com/socketio/socket.io-client-java/)의 호환성 표는 다음과 같습니다.

<table>
    <tr>
        <th rowspan="2">Java 클라이언트 버전</th>
        <th colspan="3">Socket.IO 서버 버전</th>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>예</b></td>
        <td align="center"><b>예</b><sup>1</sup></td>
        <td align="center"><b>예</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">아니요</td>
        <td align="center"><b>예</b></td>
        <td align="center"><b>예</b></td>
    </tr>
</table>

[1] 호환됩니다. 단, [allowEIO3: true](../../server-options.md#alloweio3)가 필요합니다.

[Swift 클라이언트](https://github.com/socketio/socket.io-client-swift/)의 호환성 표는 다음과 같습니다.

<table>
    <tr>
        <th rowspan="2">Swift 클라이언트 버전</th>
        <th colspan="3">Socket.IO 서버 버전</th>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">v15.x</td>
        <td align="center"><b>예</b></td>
        <td align="center"><b>예</b><sup>1</sup></td>
        <td align="center"><b>예</b><sup>2</sup></td>
    </tr>
    <tr>
        <td align="center">v16.x</td>
        <td align="center"><b>예</b><sup>3</sup></td>
        <td align="center"><b>예</b></td>
        <td align="center"><b>예</b></td>
    </tr>
</table>

[1] 호환됩니다. 단, [allowEIO3: true](../../server-options.md#alloweio3)(서버)와 `.connectParams(["EIO": "3"])`(클라이언트)가 필요합니다.

```swift
SocketManager(socketURL: URL(string:"http://localhost:8087/")!, config: [.connectParams(["EIO": "3"])])
```

[2] 호환됩니다. 단, [allowEIO3: true](../../server-options.md#alloweio3)(서버)가 필요합니다.

[3] 호환됩니다. 단, `.version(.two)`(클라이언트)가 필요합니다.

```swift
SocketManager(socketURL: URL(string:"http://localhost:8087/")!, config: [.version(.two)])
```

#### 서버가 필요한 CORS 헤더를 보내지 않는 경우 {#the-server-does-not-send-the-necessary-cors-headers}

다음은 콘솔에 표시될 수 있는 오류입니다.

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ...
```

이 오류가 보인다면 다음 중 하나일 가능성이 높습니다.

- 실제로는 Socket.IO 서버에 접속하지 못하고 있습니다([위](#the-server-is-not-reachable) 참고).
- 서버 측에서 [CORS(Cross-Origin Resource Sharing)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)를 활성화하지 않았습니다.

자세한 내용은 [CORS 처리하기](../02-Server/handling-cors.md) 문서를 참고하세요.

#### 스티키 세션을 활성화하지 않은 경우(여러 서버 구성) {#you-didnt-enable-sticky-sessions-in-a-multi-server-setup}

Socket.IO 서버를 여러 대로 확장할 때는 한 세션의 모든 요청이 같은 서버에 도달하도록 해야 합니다. 이유는 [여러 노드 사용하기](../02-Server/using-multiple-nodes.md) 문서에서 설명합니다.

그렇지 않으면 `{"code":1,"message":"Session ID unknown"}` 본문과 함께 HTTP 400 응답을 받습니다.

자세한 내용은 [여러 노드 사용하기](../02-Server/using-multiple-nodes.md) 문서를 참고하세요.

#### 요청 경로가 양쪽에서 일치하지 않는 경우 {#the-request-path-does-not-match-on-both-sides}

기본적으로 클라이언트는 "/socket.io/" 요청 경로로 HTTP 요청을 보내고, 서버도 이 경로로 요청이 오기를 기대합니다.

이 경로는 `path` 옵션으로 바꿀 수 있습니다.

*서버*

```js
import { Server } from "socket.io";

const io = new Server({
  path: "/my-custom-path/"
});

io.listen(3000);
```

*클라이언트*

```js
import { io } from "socket.io-client";

const socket = io(SERVER_URL, {
  path: "/my-custom-path/"
});
```

이렇게 하면 HTTP 요청은 `<SERVER_URL>/my-custom-path/?EIO=4&transport=polling[&...]` 형태가 됩니다.

:::caution

```js
import { io } from "socket.io-client";

const socket = io("/my-custom-path/");
```

위 코드에서 클라이언트는 "/my-custom-path/"라는 이름의 [네임스페이스](../06-Advanced/namespaces.md)에 접속하려고 합니다. 요청 경로는 여전히 "/socket.io/"입니다.

:::

## 문제: 소켓의 연결이 끊김 {#problem-the-socket-gets-disconnected}

### 문제 해결 단계 {#troubleshooting-steps-1}

무엇보다 먼저, 인터넷 연결이 안정적이어도 연결 끊김은 흔히 일어나는 정상적인 일이라는 점을 알아 두세요.

- 사용자와 Socket.IO 서버 사이에 있는 무언가가 일시적으로 장애를 겪거나 재시작될 수 있습니다.
- 오토스케일링 정책에 따라 서버 자체가 종료될 수 있습니다.
- 모바일 브라우저라면 사용자의 연결이 끊기거나 WiFi에서 4G로 전환될 수 있습니다.
- 브라우저가 비활성 탭을 일시 정지할 수 있습니다.

다만 Socket.IO 클라이언트는 [따로 설정](../../client-options.md#reconnection)하지 않는 한 항상 재연결을 시도합니다.

`disconnect` 이벤트로 추가 정보를 확인할 수 있습니다.

```js
socket.on("disconnect", (reason, details) => {
  // 연결이 끊긴 이유. 예: "transport error"
  console.log(reason);

  // 연결이 끊긴 저수준 원인. 예: "xhr post error"
  console.log(details.message);

  // 추가 설명. 예: HTTP 응답의 상태 코드
  console.log(details.description);

  // 추가 컨텍스트. 예: XMLHttpRequest 객체
  console.log(details.context);
});
```

가능한 이유 목록은 [클라이언트 측 Socket 인스턴스 문서](../03-Client/client-socket-instance.md#disconnect)를 참고하세요.

### 가능한 원인 {#possible-explanations-1}

#### 서버와 클라이언트 사이의 무언가가 연결을 닫는 경우 {#something-between-the-server-and-the-client-closes-the-connection}

연결이 일정한 간격으로 끊긴다면 서버와 클라이언트 사이에 있는 무언가가 제대로 설정되지 않아 연결을 닫고 있을 수 있습니다.

- nginx

nginx의 [`proxy_read_timeout`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout) 값(기본값 60초)은 Socket.IO의 [`pingInterval + pingTimeout`](../../server-options.md#pinginterval) 값(기본값 45초)보다 커야 합니다. 그렇지 않으면 `proxy_read_timeout` 시간 동안 데이터가 전송되지 않았을 때 nginx가 연결을 강제로 닫고 클라이언트는 "transport close" 오류를 받습니다.

- Apache HTTP Server

httpd의 [`ProxyTimeout`](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#proxytimeout) 값(기본값 60초)은 Socket.IO의 [`pingInterval + pingTimeout`](../../server-options.md#pinginterval) 값(기본값 45초)보다 커야 합니다. 그렇지 않으면 `ProxyTimeout` 시간 동안 데이터가 전송되지 않았을 때 httpd가 연결을 강제로 닫고 클라이언트는 "transport close" 오류를 받습니다.

#### 브라우저 탭이 최소화되어 하트비트가 실패한 경우 {#the-browser-tab-was-minimized-and-heartbeat-has-failed}

일부 브라우저([Chrome](https://developer.chrome.com/blog/timer-throttling-in-chrome-88/#intensive-throttling) 등)는 포커스가 없는 탭의 JavaScript 타이머를 제한합니다. **Socket.IO v2**에서는 하트비트 메커니즘이 클라이언트 측의 `setTimeout` 함수에 의존했으므로 타이머가 제한되면 ping 타임아웃으로 연결이 끊길 수 있었습니다.

임시 해결책으로 서버 측에서 `pingTimeout` 값을 늘릴 수 있습니다.

```js
const io = new Server({
  pingTimeout: 60000
});
```

참고로 Socket.IO v4([이 커밋](https://github.com/socketio/engine.io-client/commit/f30a10b7f45517fcb3abd02511c58a89e0ef498f)이 반영된 `socket.io-client@4.1.3` 이상)로 업그레이드하면 이런 문제를 막을 수 있습니다. 하트비트 메커니즘의 방향이 바뀌어 이제 서버가 PING 패킷을 보내기 때문입니다.

#### 클라이언트가 서버 버전과 호환되지 않는 경우 {#the-client-is-not-compatible-with-the-version-of-the-server-1}

WebSocket 전송 방식으로 보내는 패킷의 형식이 v2와 v3/v4에서 비슷하기 때문에 호환되지 않는 클라이언트로도 연결될 수 있습니다([위](#the-client-is-not-compatible-with-the-version-of-the-server) 참고). 하지만 일정 시간이 지나면 결국 연결이 닫힙니다.

따라서 30초마다 연결이 끊긴다면 분명 버전 비호환 때문입니다. 30초는 Socket.IO v2의 [pingTimeout](../../server-options.md#pingtimeout)과 [pingInterval](../../server-options.md#pinginterval) 값을 더한 시간입니다.

#### 너무 큰 페이로드를 보내려는 경우 {#you-are-trying-to-send-a-huge-payload}

큰 페이로드를 보내는 중에 연결이 끊긴다면 [`maxHttpBufferSize`](../../server-options.md#maxhttpbuffersize) 값(기본값 1MB)에 도달했을 수 있습니다. 이 값을 필요에 맞게 조정하세요.

```js
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: 1e8
});
```

큰 페이로드를 업로드하는 데 [`pingTimeout`](../../server-options.md#pingtimeout) 옵션 값보다 오래 걸려도 연결이 끊길 수 있습니다. 업로드하는 동안 [하트비트 메커니즘](../01-Documentation/how-it-works.md#disconnection-detection)이 실패하기 때문입니다. `pingTimeout` 값을 필요에 맞게 조정하세요.

```js
const io = require("socket.io")(httpServer, {
  pingTimeout: 60000
});
```

## 문제: 소켓이 HTTP 롱 폴링에서 벗어나지 못함 {#problem-the-socket-is-stuck-in-http-long-polling}

### 문제 해결 단계 {#troubleshooting-steps-2}

대부분의 경우 다음과 같은 화면을 볼 수 있습니다.

![연결에 성공했을 때의 네트워크 모니터](/images/network-monitor.png)

1. Engine.IO 핸드셰이크(이후 요청에 쓰이는 세션 ID가 들어 있습니다. 여기서는 `zBjrh...AAAK`)
2. Socket.IO 핸드셰이크 요청(`auth` 옵션 값이 들어 있습니다)
3. Socket.IO 핸드셰이크 응답([Socket#id](../02-Server/server-socket-instance.md#socketid)가 들어 있습니다)
4. WebSocket 연결
5. 첫 번째 HTTP 롱 폴링 요청(WebSocket 연결이 맺어지면 닫힙니다)

4번 요청에서 [HTTP 101 Switching Protocols](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/101) 응답이 보이지 않는다면 서버와 브라우저 사이의 무언가가 WebSocket 연결을 막고 있다는 뜻입니다.

이 경우에도 HTTP 롱 폴링으로 연결은 맺어지므로 꼭 문제가 되는 것은 아니지만 효율이 떨어집니다.

현재 전송 방식의 이름은 다음과 같이 확인할 수 있습니다.

**클라이언트 측**

```js
socket.on("connect", () => {
  const transport = socket.io.engine.transport.name; // 대부분의 경우 "polling"

  socket.io.engine.on("upgrade", () => {
    const upgradedTransport = socket.io.engine.transport.name; // 대부분의 경우 "websocket"
  });
});
```

**서버 측**

```js
io.on("connection", (socket) => {
  const transport = socket.conn.transport.name; // 대부분의 경우 "polling"

  socket.conn.on("upgrade", () => {
    const upgradedTransport = socket.conn.transport.name; // 대부분의 경우 "websocket"
  });
});
```

### 가능한 원인 {#possible-explanations-2}

#### 서버 앞단의 프록시가 WebSocket 연결을 받아들이지 않는 경우 {#a-proxy-in-front-of-your-servers-does-not-accept-the-websocket-connection}

nginx나 Apache HTTPD 같은 프록시가 WebSocket 연결을 받아들이도록 제대로 설정되지 않았다면 `TRANSPORT_MISMATCH` 오류가 발생할 수 있습니다.

```js
io.engine.on("connection_error", (err) => {
  console.log(err.code);     // 3
  console.log(err.message);  // "Bad request"
  console.log(err.context);  // { name: 'TRANSPORT_MISMATCH', transport: 'websocket', previousTransport: 'polling' }
});
```

이 오류는 Socket.IO 서버가 필요한 `Connection: upgrade` 헤더를 받지 못했다는 뜻입니다(`err.req.headers` 객체로 확인할 수 있습니다).

자세한 내용은 [리버스 프록시 뒤에서 사용하기](../02-Server/behind-a-reverse-proxy.md) 문서를 참고하세요.

#### [`express-status-monitor`](https://www.npmjs.com/package/express-status-monitor)가 자체 socket.io 인스턴스를 실행하는 경우 {#express-status-monitor-runs-its-own-socketio-instance}

해결 방법은 [이 저장소](https://github.com/RafalWilinski/express-status-monitor)를 참고하세요.

## 그 밖에 자주 실수하는 부분 {#other-common-gotchas}

### 이벤트 중복 등록 {#duplicate-event-registration}

클라이언트 측에서 `connect` 이벤트는 소켓이 재연결될 때마다 발생합니다. 따라서 이벤트 리스너는 `connect` 이벤트 리스너 바깥에서 등록해야 합니다.

나쁜 예 :warning:

```js
socket.on("connect", () => {
  socket.on("foo", () => {
    // ...
  });
});
```

좋은 예 :+1:

```js
socket.on("connect", () => {
  // ...
});

socket.on("foo", () => {
  // ...
});
```

이벤트 리스너를 `connect` 이벤트 리스너 안에서 등록하면 여러 번 호출될 수 있습니다.

### 이벤트 핸들러를 늦게 등록하는 경우 {#delayed-event-handler-registration}

나쁜 예 :warning:

```js
io.on("connection", async (socket) => {
  await longRunningOperation();

  // 주의! 서버가 받은 일부 패킷에 대응하는 핸들러가 없을 수 있습니다
  socket.on("hello", () => {
    // ...
  });
});
```

좋은 예 :+1:

```js
io.on("connection", async (socket) => {
  socket.on("hello", () => {
    // ...
  });

  await longRunningOperation();
});
```

### `socket.id` 속성 사용 {#usage-of-the-socketid-attribute}

[연결 상태 복구](../01-Documentation/connection-state-recovery.md)를 활성화하지 않았다면 `id` 속성은 **일시적인** ID입니다. 애플리케이션에서 쓰라고 만든 값이 아니므로 디버깅 용도로만 쓰세요. 이유는 다음과 같습니다.

- 재연결할 때마다 ID가 새로 생성됩니다(예: WebSocket 연결이 끊기거나 사용자가 페이지를 새로고침할 때).
- 브라우저 탭이 다르면 ID도 다릅니다.
- 서버는 ID별 메시지 큐를 저장하지 않습니다. 즉, 클라이언트의 연결이 끊긴 동안 서버가 이 ID로 보낸 메시지는 사라집니다.

대신 일반적인 세션 ID를 사용하세요. 세션 ID는 쿠키로 보내거나, localStorage에 저장해 두었다가 [`auth`](../../client-options.md#auth) 페이로드로 보내면 됩니다.

함께 보기:

- [개인 메시지 가이드 2부](/get-started/private-messaging-part-2/)
- [쿠키 다루기](/how-to/deal-with-cookies)

### 서버리스 플랫폼에 배포 {#deployment-on-a-serverless-platform}

대부분의 서버리스 플랫폼(Vercel 등)은 요청 핸들러의 실행 시간에 따라 요금을 부과합니다. 따라서 Socket.IO(또는 일반 WebSocket)로 연결을 오래 유지하는 방식은 권장하지 않습니다.

참고 자료:

- https://vercel.com/guides/do-vercel-serverless-functions-support-websocket-connections
- https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html
