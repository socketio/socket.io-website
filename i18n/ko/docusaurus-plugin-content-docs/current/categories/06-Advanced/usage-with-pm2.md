---
title: PM2와 함께 사용하기
sidebar_position: 4
slug: /pm2/
---

PM2는 로드 밸런서가 내장된 Node.js 애플리케이션용 프로덕션 프로세스 관리자입니다. PM2를 사용하면 애플리케이션을 항상 실행 상태로 유지하고, 다운타임 없이 다시 시작하고, 일반적인 시스템 관리 작업을 쉽게 처리할 수 있습니다.

PM2 문서는 다음 주소에서 볼 수 있습니다: https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/

PM2로 Socket.IO 서버를 확장하는 방법은 세 가지입니다.

- 클라이언트 측에서 HTTP 롱 폴링 비활성화하기

```js
const socket = io({
  transports: ["websocket"]
});
```

다만 이렇게 하면 WebSocket 연결을 맺을 수 없을 때 HTTP 롱 폴링으로 전환되지 않습니다.

- 워커마다 다른 포트를 사용하고, 그 앞에 nginx 같은 로드 밸런서를 두기

- `@socket.io/pm2` 사용하기

## 설치 {#installation}

```
npm install -g @socket.io/pm2
```

`pm2`가 이미 설치되어 있다면 먼저 제거해야 합니다.

```
npm remove -g pm2
```

`@socket.io/pm2`는 `pm2`를 그대로 대체할 수 있으며(drop-in replacement), 기존 `pm2` 유틸리티의 명령을 모두 지원합니다.

`pm2`와 다른 점은 [이 커밋](https://github.com/socketio/pm2/commit/8c29a7feb6cbde3c8ef9eb072fee284686f1553f)의 변경 사항 하나뿐입니다.

## 사용법 {#usage}

```js title="worker.js"
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/cluster-adapter";
import { setupWorker } from "@socket.io/sticky";

const httpServer = createServer();
const io = new Server(httpServer);

io.adapter(createAdapter());

setupWorker(io);

io.on("connection", (socket) => {
  console.log(`connect ${socket.id}`);
});

// 정상 종료(graceful shutdown)
process.on("SIGINT", () => {
  io.close((err) => {
    process.exit(err ? 1 : 0);
  });
});

// 중요: 여기서는 httpServer.listen()을 호출하지 않습니다
```

```js title="ecosystem.config.js"
export const apps = [{
  script    : "worker.js",
  instances : "max", // 코어당 프로세스 하나
  exec_mode : "cluster"
}];
```

그런 다음 `pm2 start ecosystem.config.js` 명령(또는 `pm2 start worker.js -i 0`)을 실행하세요. 이게 전부입니다! 이제 포트 **8080**에서 Socket.IO 클러스터에 접속할 수 있습니다.

## 동작 방식 {#how-it-works}

[여러 노드로 확장할 때](../02-Server/using-multiple-nodes.md)는 두 가지 작업이 필요합니다.

- Socket.IO 세션의 HTTP 요청이 같은 워커로 라우팅되도록 스티키 세션을 활성화합니다
- 클라이언트가 다른 워커에 연결되어 있더라도 패킷이 모든 클라이언트에 브로드캐스트되도록 커스텀 어댑터를 사용합니다

이를 위해 `@socket.io/pm2`에는 다음 두 패키지가 추가로 포함되어 있습니다.

- [`@socket.io/sticky`](https://github.com/socketio/socket.io-sticky)
- [`@socket.io/cluster-adapter`](https://github.com/socketio/socket.io-cluster-adapter)

`pm2`와 다른 점은 [이 커밋](https://github.com/socketio/pm2/commit/8c29a7feb6cbde3c8ef9eb072fee284686f1553f)의 변경 사항 하나뿐이며, 내용은 다음과 같습니다.

- 이제 God 프로세스가 자체 HTTP 서버를 생성하고 HTTP 요청을 알맞은 워커로 라우팅합니다
- God 프로세스가 워커 간에 패킷도 중계하므로 `io.emit()`이 모든 클라이언트에 제대로 전달됩니다

참고로 여러 호스트에서 각각 PM2 클러스터를 실행한다면 [Redis 어댑터](../05-Adapters/adapter-redis.md) 같은 다른 어댑터를 사용해야 합니다.

포크의 소스 코드는 다음 주소에서 볼 수 있습니다: https://github.com/socketio/pm2

## 최신 릴리스 {#latest-releases}

Socket.IO 팀은 `pm2` 패키지의 릴리스를 최대한 따라가려고 노력하지만, 빠진 릴리스가 있다면 알려 주세요.

| 버전     | 출시일       | 릴리스 노트                                                                      |
|----------|--------------|----------------------------------------------------------------------------------|
| `6.0.14` | 2026년 6월    | [링크](https://github.com/socketio/pm2/releases/tag/%40socket.io%2Fpm2%406.0.14) |
| `6.0.8`  | 2025년 6월    | [링크](https://github.com/socketio/pm2/releases/tag/v6.0.8-socket.io)            |
| `5.3.0`  | 2023년 5월     | [링크](https://github.com/socketio/pm2/releases/tag/v5.3.0-socket.io)            |
| `5.2.2`  | 2022년 1월 | `-`                                                                              |
| `5.2.1`  | 2021년 6월    | `-`                                                                              |
