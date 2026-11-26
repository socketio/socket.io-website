---
title: 클러스터 어댑터
sidebar_position: 6
slug: /cluster-adapter/
---

## 동작 방식 {#how-it-works}

클러스터 어댑터를 사용하면 [Node.js 클러스터](https://nodejs.org/api/cluster.html) 환경에서 Socket.IO를 쓸 수 있습니다.

여러 클라이언트에게 보내는 모든 패킷(예: `io.to("room1").emit()`, `socket.broadcast.emit()`)은 IPC 채널로 다른 워커에도 전송됩니다.

이 어댑터의 소스 코드는 다음 주소에서 확인할 수 있습니다: https://github.com/socketio/socket.io/tree/main/packages/socket.io-cluster-adapter

## 지원 기능 {#supported-features}

| 기능                            | `socket.io` 버전                    | 지원 여부                                      |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket 관리                     | `4.0.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 서버 간 통신                    | `4.1.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 확인 응답(acknowledgement)을 받는 브로드캐스트 | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: 예 (`0.2.0` 버전부터) |
| 연결 상태 복구                  | [`4.6.0`](../../changelog/4.6.0.md) | :x: 아니요                                     |

## 설치 {#installation}

```
npm install @socket.io/cluster-adapter
```

## 사용법 {#usage}

### Node.js 클러스터와 함께 사용하기 {#with-nodejs-cluster}

```js
const cluster = require("cluster");
const http = require("http");
const { Server } = require("socket.io");
const numCPUs = require("os").cpus().length;
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  const httpServer = http.createServer();

  // 스티키 세션을 설정합니다
  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  // 워커 간 연결을 설정합니다
  setupPrimary();

  // 버퍼가 포함된 패킷을 보낼 때 필요합니다(일반 객체만 보낸다면 무시해도 됩니다)
  // Node.js < 16.0.0
  cluster.setupMaster({
    serialization: "advanced",
  });
  // Node.js > 16.0.0
  // cluster.setupPrimary({
  //   serialization: "advanced",
  // });

  httpServer.listen(3000);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const httpServer = http.createServer();
  const io = new Server(httpServer);

  // 클러스터 어댑터를 사용합니다
  io.adapter(createAdapter());

  // 프라이머리 프로세스와 연결을 설정합니다
  setupWorker(io);

  io.on("connection", (socket) => {
    /* ... */
  });
}
```

### PM2와 함께 사용하기 {#with-pm2}

[PM2와 함께 사용하기](../06-Advanced/usage-with-pm2.md) 문서를 참고하세요.

### `recluster`와 함께 사용하기 {#with-recluster}

`cluster.js`

```js
const cluster = require("cluster");
const http = require("http");
const { setupMaster } = require("@socket.io/sticky");
const { setupPrimary } = require("@socket.io/cluster-adapter");
const recluster = require("recluster");
const path = require("path");

const httpServer = http.createServer();

// 스티키 세션을 설정합니다
setupMaster(httpServer, {
  loadBalancingMethod: "least-connection",
});

// 워커 간 연결을 설정합니다
setupPrimary();

// 버퍼가 포함된 패킷을 보낼 때 필요합니다(일반 객체만 보낸다면 무시해도 됩니다)
// Node.js < 16.0.0
cluster.setupMaster({
  serialization: "advanced",
});
// Node.js > 16.0.0
// cluster.setupPrimary({
//   serialization: "advanced",
// });

httpServer.listen(3000);

const balancer = recluster(path.join(__dirname, "worker.js"));

balancer.run();
```

`worker.js`

```js
const http = require("http");
const { Server } = require("socket.io");
const { setupWorker } = require("@socket.io/sticky");
const { createAdapter } = require("@socket.io/cluster-adapter");

const httpServer = http.createServer();
const io = new Server(httpServer);

// 클러스터 어댑터를 사용합니다
io.adapter(createAdapter());

// 프라이머리 프로세스와 연결을 설정합니다
setupWorker(io);

io.on("connection", (socket) => {
  /* ... */
});
```

## 옵션 {#options}

| 이름                | 설명                                                        | 기본값 |
|---------------------|--------------------------------------------------------------------|---------------|
| `heartbeatInterval` | 하트비트 간격(ms)입니다.                           | `5_000`       |
| `heartbeatTimeout`  | 이 시간(ms) 동안 하트비트가 없으면 노드가 다운된 것으로 판단합니다. | `10_000`      |

## 최신 릴리스 {#latest-releases}

| 버전 | 릴리스 날짜 | 릴리스 노트                                                                                     | 비교                                                                                               |
|---------|--------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `0.3.0` | 2025년 10월 | [링크](https://github.com/socketio/socket.io/releases/tag/%40socket.io%2Fcluster-adapter%400.3.0) | [`0.2.2...0c43124`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.2.2...0c43124) |
| `0.2.2` | 2022년 3월   | [링크](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.2.2)                  | [`0.2.1...0.2.2`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.2.1...0.2.2)     |
| `0.2.1` | 2022년 10월 | [링크](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.2.1)                  | [`0.2.0...0.2.1`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.2.0...0.2.1)     |
| `0.2.0` | 2022년 4월   | [링크](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.2.0)                  | [`0.1.0...0.2.0`](https://github.com/socketio/socket.io-cluster-adapter/compare/0.1.0...0.2.0)     |
| `0.1.0` | 2021년 6월    | [링크](https://github.com/socketio/socket.io-cluster-adapter/releases/tag/0.1.0)                  |                                                                                                    |

전체 변경 내역: https://github.com/socketio/socket.io/blob/main/packages/socket.io-cluster-adapter/CHANGELOG.md
