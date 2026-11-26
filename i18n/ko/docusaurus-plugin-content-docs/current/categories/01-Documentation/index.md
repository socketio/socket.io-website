---
title: 소개
sidebar_position: 1
slug: /
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

:::tip

Socket.IO를 처음 사용한다면 [튜토리얼](../../tutorial/01-introduction.md)부터 살펴보세요.

:::

## Socket.IO란 {#what-socketio-is}

Socket.IO는 클라이언트와 서버 사이의 **낮은 지연 시간**, **양방향**, **이벤트 기반** 통신을 지원하는 라이브러리입니다.

<ThemedImage
  alt="서버와 클라이언트 사이의 통신을 나타낸 다이어그램"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication2.png'),
    dark: useBaseUrl('/images/bidirectional-communication2-dark.png'),
  }}
/>

Socket.IO 연결은 여러 저수준 전송 방식(transport)으로 맺을 수 있습니다.

- HTTP 롱 폴링
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)

Socket.IO는 다음 조건에 따라 쓸 수 있는 방식 가운데 가장 적합한 것을 자동으로 고릅니다.

- 브라우저의 지원 기능([WebSocket](https://caniuse.com/websockets)과 [WebTransport](https://caniuse.com/webtransport) 지원 현황을 참고하세요)
- 네트워크(일부 네트워크는 WebSocket이나 WebTransport 연결을 차단합니다)

자세한 내용은 [동작 원리](./how-it-works.md) 문서에서 확인하세요.

### 서버 구현체 {#server-implementations}

| 언어                 | 웹사이트                                                                                                                                                |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| JavaScript (Node.js) | - [설치 방법](../02-Server/server-installation.md)<br/>- [API](../../server-api.md)<br/>- [소스 코드](https://github.com/socketio/socket.io) |
| JavaScript (Deno)    | https://github.com/socketio/socket.io-deno                                                                                                              |
| Java (활발히 개발 중) | https://github.com/socketio4j/netty-socketio |
| Java                 | https://github.com/mrniko/netty-socketio                                                                                                                |
| Java                 | https://github.com/trinopoty/socket.io-server-java                                                                                                      |
| Python               | https://github.com/miguelgrinberg/python-socketio                                                                                                       |
| Golang               | https://github.com/googollee/go-socket.io                                                                                                               |
| Rust                 | https://github.com/Totodore/socketioxide                                                                                                                |

### 클라이언트 구현체 {#client-implementations}

| 언어                                          | 웹사이트                                                                                                                                                       |
|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| JavaScript (브라우저, Node.js, React Native) | - [설치 방법](../03-Client/client-installation.md)<br/>- [API](../../client-api.md)<br/>- [소스 코드](https://github.com/socketio/socket.io-client) |
| JavaScript (WeChat 미니 프로그램용)           | https://github.com/weapp-socketio/weapp.socket.io                                                                                                              |
| Java                                          | https://github.com/socketio/socket.io-client-java                                                                                                              |
| C++                                           | https://github.com/socketio/socket.io-client-cpp                                                                                                               |
| Swift                                         | https://github.com/socketio/socket.io-client-swift                                                                                                             |
| Dart                                          | https://github.com/rikulo/socket.io-client-dart                                                                                                                |
| Python                                        | https://github.com/miguelgrinberg/python-socketio                                                                                                              |
| .Net                                          | https://github.com/doghappy/socket.io-client-csharp                                                                                                            |
| Rust                                          | https://github.com/1c3t3a/rust-socketio                                                                                                                        |
| Kotlin                                        | https://github.com/icerockdev/moko-socket-io                                                                                                                   |
| PHP                                           | https://github.com/ElephantIO/elephant.io                                                                                                                      |
| Golang                                        | https://github.com/maldikhan/go.socket.io                                                                                                                      |

## Socket.IO가 아닌 것 {#what-socketio-is-not}

:::caution

Socket.IO는 WebSocket 구현체가 **아닙니다**.

:::

Socket.IO는 가능하면 WebSocket을 전송 방식으로 사용하지만 각 패킷에 메타데이터를 덧붙입니다. 그래서 WebSocket 클라이언트는 Socket.IO 서버에 제대로 연결할 수 없고, Socket.IO 클라이언트도 일반 WebSocket 서버에 연결할 수 없습니다.

```js
// 주의: 이 클라이언트는 연결할 수 없습니다!
const socket = io("ws://echo.websocket.org");
```

일반 WebSocket 서버가 필요하다면 [ws](https://github.com/websockets/ws)나 [µWebSockets.js](https://github.com/uNetworking/uWebSockets.js)를 살펴보세요.

Node.js 코어에 WebSocket 서버를 포함하자는 [논의](https://github.com/nodejs/node/issues/19308)도 진행되고 있습니다.

클라이언트 측에서는 [robust-websocket](https://github.com/nathanboktae/robust-websocket) 패키지가 도움이 될 수 있습니다.

:::caution

Socket.IO는 모바일 애플리케이션의 백그라운드 서비스에서 사용하도록 만들어지지 않았습니다.

:::

Socket.IO 라이브러리는 서버와 TCP 연결을 계속 열어 두므로 사용자 기기의 배터리를 많이 소모할 수 있습니다. 이런 용도라면 [FCM](https://firebase.google.com/docs/cloud-messaging) 같은 전용 메시징 플랫폼을 사용하세요.

## 기능 {#features}

Socket.IO가 일반 WebSocket에 더해 제공하는 기능은 다음과 같습니다.

### HTTP 롱 폴링 폴백 {#http-long-polling-fallback}

WebSocket 연결을 맺을 수 없으면 HTTP 롱 폴링으로 전환됩니다.

10여 년 전(!) 프로젝트가 처음 만들어졌을 때는 브라우저의 WebSocket 지원이 아직 걸음마 단계였습니다. 그래서 사람들이 Socket.IO를 쓰던 가장 큰 이유가 이 기능이었습니다.

지금은 대부분의 브라우저가 WebSocket을 지원합니다([97%](https://caniuse.com/mdn-api_websocket) 이상). 그래도 이 기능은 여전히 유용합니다. 잘못 설정된 프록시 뒤에 있어서 WebSocket 연결을 맺지 못한다는 사용자 제보가 지금도 들어오기 때문입니다.

### 자동 재연결 {#automatic-reconnection}

특정 조건에서는 서버와 클라이언트 사이의 WebSocket 연결이 끊겼는데도 양쪽 모두 이를 알아채지 못할 수 있습니다.

그래서 Socket.IO에는 연결 상태를 주기적으로 확인하는 하트비트 메커니즘이 있습니다.

실제로 연결이 끊기면 클라이언트는 서버에 부담을 주지 않도록 지수 백오프(exponential back-off) 방식으로 지연 시간을 늘려 가며 자동으로 재연결합니다.

### 패킷 버퍼링 {#packet-buffering}

클라이언트의 연결이 끊겨 있는 동안에는 패킷이 자동으로 버퍼에 쌓이고, 재연결하면 전송됩니다.

자세한 내용은 [오프라인 동작](../03-Client/client-offline-behavior.md#buffered-events) 문서를 참고하세요.

### 확인 응답(acknowledgement) {#acknowledgements}

Socket.IO에는 이벤트를 보내고 응답을 받는 간편한 방법이 있습니다.

*보내는 쪽*

```js
socket.emit("hello", "world", (response) => {
  console.log(response); // "got it"
});
```

*받는 쪽*

```js
socket.on("hello", (arg, callback) => {
  console.log(arg); // "world"
  callback("got it");
});
```

타임아웃을 추가할 수도 있습니다.

```js
socket.timeout(5000).emit("hello", "world", (err, response) => {
  if (err) {
    // 상대편이 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(response); // "got it"
  }
});
```

### 브로드캐스팅 {#broadcasting}

서버 측에서는 [연결된 모든 클라이언트](../04-Events/broadcasting-events.md)나 [일부 클라이언트](../04-Events/rooms.md)에게 이벤트를 보낼 수 있습니다.

```js
// 연결된 모든 클라이언트에게
io.emit("hello");

// "news" 룸에 있는 연결된 모든 클라이언트에게
io.to("news").emit("hello");
```

[여러 노드로 확장](../02-Server/using-multiple-nodes.md)한 경우에도 마찬가지로 동작합니다.

### 멀티플렉싱 {#multiplexing}

네임스페이스를 사용하면 연결 하나를 공유하면서 애플리케이션 로직을 나눌 수 있습니다. 예를 들어 권한이 있는 사용자만 들어올 수 있는 "admin" 채널을 만들 때 유용합니다.

```js
io.on("connection", (socket) => {
  // 일반 사용자
});

io.of("/admin").on("connection", (socket) => {
  // 관리자
});
```

자세한 내용은 [네임스페이스](../06-Advanced/namespaces.md) 문서를 참고하세요.

## 자주 묻는 질문 {#common-questions}

### 요즘에도 Socket.IO가 필요한가요? {#is-socketio-still-needed-today}

이제는 WebSocket이 [거의 모든 곳](https://caniuse.com/mdn-api_websocket)에서 지원되니 충분히 나올 만한 질문입니다.

그렇긴 해도 일반 WebSocket으로 애플리케이션을 만들면 결국 Socket.IO에 이미 들어 있는 기능 대부분을 직접 구현하게 될 것이라고 생각합니다. [재연결](#automatic-reconnection), [확인 응답](#acknowledgements), [브로드캐스팅](#broadcasting) 같은 기능은 Socket.IO에서 이미 실전 검증을 거쳤습니다.

### Socket.IO 프로토콜의 오버헤드는 어느 정도인가요? {#what-is-the-overhead-of-the-socketio-protocol}

`socket.emit("hello", "world")`는 `42["hello","world"]`를 담은 WebSocket 프레임 하나로 전송됩니다. 각 부분의 의미는 다음과 같습니다.

- `4`: Engine.IO "message" 패킷 타입
- `2`: Socket.IO "message" 패킷 타입
- `["hello","world"]`: 인자 배열을 `JSON.stringify()`로 변환한 값

즉 메시지마다 몇 바이트가 더 붙습니다. 이 오버헤드는 [커스텀 파서](../06-Advanced/custom-parser.md)를 사용하면 더 줄일 수 있습니다.

:::info

브라우저 번들 자체의 크기는 [`10.4 kB`](https://bundlephobia.com/package/socket.io-client)입니다(minify 및 gzip 적용 기준).

:::

Socket.IO 프로토콜의 자세한 내용은 [여기](../08-Miscellaneous/sio-protocol.md)에서 확인하세요.

### 제대로 동작하지 않는데 도와주실 수 있나요? {#something-does-not-work-properly-please-help}

[문제 해결 가이드](../01-Documentation/troubleshooting.md)를 확인하세요.

## 다음 단계 {#next-steps}

- [시작하기 예제](/get-started/chat)
- [서버 설치](../02-Server/server-installation.md)
- [클라이언트 설치](../03-Client/client-installation.md)
