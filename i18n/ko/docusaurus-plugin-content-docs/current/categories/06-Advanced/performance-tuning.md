---
title: 성능 튜닝
sidebar_position: 6
slug: /performance-tuning/
---

Socket.IO 서버의 성능을 높이는 몇 가지 팁을 소개합니다.

- [Socket.IO 수준](#at-the-socketio-level)
- [OS 수준](#at-the-os-level)

[여러 노드로 확장하는 방법](../02-Server/using-multiple-nodes.md)도 함께 참고하세요.

## Socket.IO 수준 {#at-the-socketio-level}

Socket.IO 연결은 대부분 WebSocket으로 맺어집니다. 따라서 Socket.IO 서버의 성능은 내부에서 동작하는 WebSocket 서버(기본값은 [`ws`](https://github.com/websockets/ws))의 성능에 크게 좌우됩니다.

### `ws` 네이티브 애드온 설치하기 {#install-ws-native-add-ons}

`ws`에는 일부 작업의 성능을 높여 주는 선택적 바이너리 애드온이 두 가지 있습니다. 많이 쓰는 플랫폼용으로는 미리 빌드된 바이너리가 제공되므로 머신에 C++ 컴파일러가 꼭 설치되어 있지 않아도 됩니다.

- [bufferutil](https://www.npmjs.com/package/bufferutil): WebSocket 프레임의 데이터 페이로드를 마스킹하거나 언마스킹하는 등의 작업을 효율적으로 처리합니다.
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate): 메시지가 명세에서 요구하는 대로 유효한 UTF-8인지 효율적으로 검사합니다.

두 패키지는 다음과 같이 설치합니다.

```
$ npm install --save-optional bufferutil utf-8-validate
```

참고로 이 패키지는 선택 사항이며, 설치되어 있지 않으면 WebSocket 서버는 JavaScript 구현을 대신 사용합니다. 자세한 내용은 [여기](https://github.com/websockets/ws/#opt-in-for-performance-and-spec-compliance)를 참고하세요.

### 다른 WebSocket 서버 구현 사용하기 {#use-another-websocket-server-implementation}

예를 들어 [eiows](https://www.npmjs.com/package/eiows) 패키지를 사용할 수 있습니다. 지금은 지원이 중단된 [uws](https://www.npmjs.com/package/uws) 패키지의 포크입니다.

```
$ npm install eiows
```

그런 다음 [`wsEngine`](../../server-options.md#wsengine) 옵션을 지정하세요.

```js
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  wsEngine: require("eiows").Server
});
```

### 커스텀 파서 사용하기 {#use-a-custom-parser}

Socket.IO 연결로 바이너리 데이터를 보낸다면 [msgpack](custom-parser.md#the-msgpack-parser) 기반 파서 같은 [커스텀 파서](custom-parser.md)를 고려해 볼 만합니다. 기본 파서는 버퍼마다 별도의 WebSocket 프레임으로 보내기 때문입니다.

사용법:

*서버*

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const parser = require("socket.io-msgpack-parser");

const httpServer = createServer();
const io = new Server(httpServer, {
  parser
});
```

*클라이언트*

```js
const { io } = require("socket.io-client");
const parser = require("socket.io-msgpack-parser");

const socket = io("https://example.com", {
  parser
});
```

### 첫 HTTP 요청 버리기 {#discard-the-initial-http-request}

기본적으로 각 세션의 첫 HTTP 요청을 가리키는 참조가 메모리에 보관됩니다. 이 참조는 `express-session`을 사용할 때처럼 필요한 경우가 있지만([여기](/how-to/use-with-express-session)를 참고하세요), 메모리를 아끼려면 버려도 됩니다.

```js
io.engine.on("connection", (rawSocket) => {
  rawSocket.request = null;
});
```

변경 전:

![변경 전 메모리 사용량](/images/memory-usage-with-request.png)

변경 후:

![요청을 버린 후의 메모리 사용량](/images/memory-usage-without-request.png)

## OS 수준 {#at-the-os-level}

많은 연결을 받아들이도록 OS를 튜닝하는 방법을 다룬 좋은 글이 많습니다. 예를 들어 [이 글](https://medium.com/@elliekang/scaling-to-a-millions-websocket-concurrent-connections-at-spoon-radio-bbadd6ec1901)을 참고하세요.

Socket.IO 서버를 [부하 테스트](load-testing.md)하다 보면 다음 두 가지 한도에 걸릴 가능성이 높습니다.

- 열 수 있는 최대 파일 수

동시 연결 수가 1,000개를 넘지 못한다면(새 클라이언트가 연결하지 못한다면) 거의 확실히 열 수 있는 최대 파일 수에 도달한 것입니다.

```
$ ulimit -n
1024
```

이 값을 늘리려면 `/etc/security/limits.d/custom.conf` 파일을 새로 만들고 다음 내용을 넣으세요(root 권한 필요).

```
* soft nofile 1048576
* hard nofile 1048576
```

그런 다음 세션을 다시 시작하세요. 이제 새 한도가 적용되어 있어야 합니다.

```
$ ulimit -n
1048576
```

- 사용 가능한 최대 로컬 포트 수

동시 연결 수가 28,000개를 넘지 못한다면 거의 확실히 사용 가능한 최대 로컬 포트 수에 도달한 것입니다.

```
$ cat /proc/sys/net/ipv4/ip_local_port_range
32768	60999
```

이 값을 늘리려면 `/etc/sysctl.d/net.ipv4.ip_local_port_range.conf` 파일을 새로 만들고 다음 내용을 넣으세요(이 역시 root 권한 필요).

```
net.ipv4.ip_local_port_range = 10000 65535
```

참고: 하한값을 `10000`으로 정한 이유는 머신의 서비스가 사용하는 포트(예: PostgreSQL 서버의 `5432`)를 범위에서 빼기 위해서입니다. 물론 더 낮은 값(최소 `1024`)을 사용해도 됩니다.

머신을 재부팅하면 클라이언트 IP 하나당 동시 연결을 55,000개까지 문제없이 받을 수 있습니다.

함께 보기:

- https://unix.stackexchange.com/a/130798
