---
title: 부하 테스트
sidebar_position: 5
slug: /load-testing/
---

Socket.IO는 핸드셰이크, 하트비트, 자체 패킷 인코딩을 포함한 [고유한 프로토콜](https://github.com/socketio/socket.io-protocol)을 사용합니다. 따라서 Socket.IO 서버를 부하 테스트하는 가장 쉬운 방법은 Socket.IO 클라이언트 라이브러리로 클라이언트를 *아주 많이* 만드는 것입니다.

이를 위한 대표적인 방법은 두 가지입니다.

- [Artillery](#artillery) 사용하기
- 또는 [클라이언트를 직접 생성하기](#manual-client-creation)

## Artillery {#artillery}

Artillery는 애플리케이션의 부하 테스트에 유용한 도구입니다. 연결을 생성하고, 이벤트를 보내고, 확인 응답(acknowledgement)을 검사할 수 있습니다.

문서는 [여기](https://artillery.io/docs/guides/guides/socketio-reference.html)에서 볼 수 있습니다.

**중요**: 기본으로 설치되는 클라이언트는 v2라서 v3/v4 서버와 [호환되지 않습니다](../03-Client/client-installation.md#version-compatibility). 따라서 다음 커스텀 엔진을 설치해야 합니다: https://github.com/ptejada/artillery-engine-socketio-v3

설치:

```
$ npm install artillery artillery-engine-socketio-v3
```

시나리오 예시:

```yaml
# my-scenario.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
  engines:
   socketio-v3: {}

scenarios:
  - name: My sample scenario
    engine: socketio-v3
    flow:
      # WebSocket 업그레이드를 기다립니다(선택 사항)
      - think: 1

      # 기본적인 emit
      - emit:
          channel: "hello"
          data: "world"

      # 객체 보내기
      - emit:
          channel: "hello"
          data:
            id: 42
            status: "in progress"
            tags:
              - "tag1"
              - "tag2"

      # 커스텀 네임스페이스에서 보내기
      - namespace: "/my-namespace"
        emit:
          channel: "hello"
          data: "world"

      # 확인 응답과 함께 보내기
      - emit:
          channel: "ping"
        acknowledge:
          match:
            value: "pong"

      # 30초 동안 아무것도 하지 않다가 연결을 끊습니다
      - think: 30
```

이 시나리오는 다음과 같이 실행합니다.

```
$ npx artillery run my-scenario.yml
```

Artillery는 [지표를 다양한 엔드포인트로 게시](https://artillery.io/docs/guides/plugins/plugin-publish-metrics.html)하거나 [AWS에서 테스트를 실행](https://artillery.io/docs/guides/guides/running-tests-with-artillery-pro.html)하는 등 유용한 기능도 많이 제공합니다.

유일한 한계는 서버에서 클라이언트로 보내는 이벤트를 쉽게 테스트할 수 없다는 점입니다. Artillery DSL은 일반적인 클라이언트 → 서버 통신에 더 적합하기 때문입니다. 그럼 [다음 섹션](#manual-client-creation)으로 넘어가겠습니다.

## 클라이언트 직접 생성하기 {#manual-client-creation}

다음은 Socket.IO 클라이언트를 1,000개 생성하고 초당 수신 패킷 수를 모니터링하는 기본 스크립트입니다.

```js
const { io } = require("socket.io-client");

const URL = process.env.URL || "http://localhost:3000";
const MAX_CLIENTS = 1000;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATION_INTERVAL_IN_MS = 10;
const EMIT_INTERVAL_IN_MS = 1000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const createClient = () => {
  // 시연을 위해 일부 클라이언트는 HTTP 롱 폴링에 머무르게 합니다
  const transports =
    Math.random() < POLLING_PERCENTAGE ? ["polling"] : ["polling", "websocket"];

  const socket = io(URL, {
    transports,
  });

  setInterval(() => {
    socket.emit("client to server event");
  }, EMIT_INTERVAL_IN_MS);

  socket.on("server to client event", () => {
    packetsSinceLastReport++;
  });

  socket.on("disconnect", (reason) => {
    console.log(`disconnect due to ${reason}`);
  });

  if (++clientCount < MAX_CLIENTS) {
    setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
  }
};

createClient();

const printReport = () => {
  const now = new Date().getTime();
  const durationSinceLastReport = (now - lastReport) / 1000;
  const packetsPerSeconds = (
    packetsSinceLastReport / durationSinceLastReport
  ).toFixed(2);

  console.log(
    `client count: ${clientCount} ; average packets received per second: ${packetsPerSeconds}`
  );

  packetsSinceLastReport = 0;
  lastReport = now;
};

setInterval(printReport, 5000);
```

이 스크립트를 출발점으로 삼아 애플리케이션의 부하 테스트를 만들 수 있습니다.
