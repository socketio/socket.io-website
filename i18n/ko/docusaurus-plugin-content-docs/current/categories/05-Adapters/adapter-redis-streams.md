---
title: Redis Streams 어댑터
sidebar_position: 3
slug: /redis-streams-adapter/
---

## 동작 방식 {#how-it-works}

이 어댑터는 [Redis 스트림](https://redis.io/docs/latest/develop/data-types/streams/)을 사용해 Socket.IO 서버 간에 패킷을 전달합니다.

기존 Redis 어댑터는 [Redis Pub/Sub 메커니즘](https://redis.io/docs/latest/develop/pubsub/)을 사용합니다. 이 어댑터가 기존 어댑터와 가장 크게 다른 점은 Redis 서버와의 일시적인 연결 끊김을 제대로 처리해 패킷 손실 없이 스트림을 재개한다는 것입니다.

:::info

- 기본적으로 모든 네임스페이스가 스트림 하나를 함께 사용합니다(`streamCount` 옵션 참고)
- `maxLen` 옵션으로 스트림 크기를 제한할 수 있습니다
- Redis PUB/SUB 메커니즘 기반 어댑터와 달리 이 어댑터는 Redis 서버와의 일시적인 연결 끊김을 제대로 처리하고 스트림을 재개합니다
- [연결 상태 복구](../01-Documentation/connection-state-recovery.md)를 활성화하면 세션은 일반적인 키/값 쌍으로 Redis에 저장됩니다

:::

:::tip

이 어댑터는 [Valkey](https://valkey.io/)와도 호환됩니다.

:::

소스 코드: https://github.com/socketio/socket.io-redis-streams-adapter

## 보안 고려 사항 {#security-considerations}

Redis 어댑터는 Redis가 신뢰할 수 있는 내부 인프라의 일부라고 가정합니다.

어댑터는 Redis Streams로 주고받는 메시지에 서명, 암호화, 인증을 적용하지 않습니다. Redis에 접속해 어댑터 채널에 메시지를 발행할 수 있는 사람은 누구든 패킷을 주입하거나 서버 간 제어 메시지를 위조하거나 연결된 클라이언트에게 가짜 이벤트를 보낼 수 있습니다. Redis 트래픽을 엿보거나 관련 채널을 구독할 수 있는 사람이라면 이벤트 페이로드의 내용도 볼 수 있습니다.

따라서 Redis를 신뢰할 수 없는 네트워크에 노출하거나 신뢰할 수 없는 클라이언트와 공유하지 않아야 합니다. ACL을 제대로 설정하지 않았다면 관련 없는 애플리케이션과 같은 Redis 인스턴스를 함께 쓰지 마세요.

Redis ACL, 인증, TLS, 방화벽 규칙, 사설 네트워크를 상황에 맞게 적용하고, 꼭 필요한 명령과 채널 권한만 부여한 전용 자격 증명을 쓰세요. Redis 배포 환경이 충분히 보호되지 않았다면 오래 유지되는 비밀 값이나 민감한 자격 증명을 이벤트 페이로드에 담아 보내지 마세요.

## 지원 기능 {#supported-features}

| 기능                             | `socket.io` 버전                     | 지원 여부                                       |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket 관리                      | `4.0.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터)    |
| 서버 간 통신                       | `4.1.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터)    |
| 확인 응답(acknowledgement)을 받는 브로드캐스트 | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: 예 (`0.1.0` 버전부터)    |
| 연결 상태 복구                      | [`4.6.0`](../../changelog/4.6.0.md) | :white_check_mark: 예 (`0.1.0` 버전부터)    |

## 설치 {#installation}

```
npm install @socket.io/redis-streams-adapter redis
```

## 사용법 {#usage}

### `redis` 패키지 사용 {#with-the-redis-package}

```js
import { createClient } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";

const redisClient = createClient({ url: "redis://localhost:6379" });

await redisClient.connect();

const io = new Server({
  adapter: createAdapter(redisClient)
});

io.listen(3000);
```

### `redis` 패키지와 Redis 클러스터 사용 {#with-the-redis-package-and-a-redis-cluster}

```js
import { createCluster } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";

const redisClient = createCluster({
  rootNodes: [
    {
      url: "redis://localhost:7000",
    },
    {
      url: "redis://localhost:7001",
    },
    {
      url: "redis://localhost:7002",
    },
  ],
});

await redisClient.connect();

const io = new Server({
  adapter: createAdapter(redisClient)
});

io.listen(3000);
```

### `ioredis` 패키지 사용 {#with-the-ioredis-package}

```js
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";

const redisClient = new Redis();

const io = new Server({
  adapter: createAdapter(redisClient)
});

io.listen(3000);
```

### `ioredis` 패키지와 Redis 클러스터 사용 {#with-the-ioredis-package-and-a-redis-cluster}

```js
import { Cluster } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";

const redisClient = new Cluster([
  {
    host: "localhost",
    port: 7000,
  },
  {
    host: "localhost",
    port: 7001,
  },
  {
    host: "localhost",
    port: 7002,
  },
]);

const io = new Server({
  adapter: createAdapter(redisClient)
});

io.listen(3000);
```

## 옵션 {#options}

| 이름                 | 설명                                                                                                                    | 기본값          |
|---------------------|-----------------------------------------------------------------------------------------------------------------------|----------------|
| `streamName`        | Redis 스트림의 이름입니다. | `socket.io`    |
| `streamCount`       | 수평 확장에 사용할 스트림 수입니다. | `1`            |
| `channelPrefix`     | 노드 간 통신에 사용하는 Redis PUB/SUB 채널의 접두사입니다. | `socket.io`    |
| `useShardedPubSub`  | 노드 간 통신에 샤딩된 PUB/SUB(Redis 7.0에서 추가)을 사용할지 여부입니다. | `false`        |
| `maxLen`            | 스트림의 최대 크기입니다. 근사 트리밍(~)을 사용합니다. | `10_000`       |
| `readCount`         | XREAD 호출 한 번에 가져올 요소 수입니다. | `100`          |
| `blockTimeInMs`     | XREAD 호출이 타임아웃되기까지의 시간(ms)입니다. | `5_000`        |
| `sessionKeyPrefix`  | 연결 상태 복구 기능을 활성화했을 때 Socket.IO 세션을 저장하는 키의 접두사입니다. | `sio:session:` |
| `onlyPlaintext`     | 전송하는 데이터가 JSON으로 직렬화할 수 있는 객체뿐이고 바이너리 데이터(Buffer, ArrayBuffer 등)가 없는지 여부입니다. | `false`        |

## 자주 묻는 질문 {#common-questions}

### Redis Streams 어댑터를 사용해도 스티키 세션을 활성화해야 하나요? {#do-i-still-need-to-enable-sticky-sessions-when-using-the-redis-streams-adapter}

네. 활성화하지 않으면 HTTP 400 응답을 받습니다. 요청이 그 Socket.IO 세션을 모르는 서버에 도달하기 때문입니다.

자세한 내용은 [여러 노드 사용하기](../02-Server/using-multiple-nodes.md)를 참고하세요.

### Redis 서버가 다운되면 어떻게 되나요? {#what-happens-when-the-redis-server-is-down}

기존 [Redis 어댑터](./adapter-redis.md)와 달리 이 어댑터는 Redis 서버와의 일시적인 연결 끊김을 제대로 처리하고 패킷 손실 없이 스트림을 재개합니다.

## 최신 릴리스 {#latest-releases}

| 버전     | 릴리스 날짜     | 릴리스 노트                                                                               | 비교                                                                                                  |
|---------|---------------|----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `0.3.0` | 2026년 2월     | [링크](https://github.com/socketio/socket.io-redis-streams-adapter/releases/tag/0.3.0) | [`0.2.3...0.3.0`](https://github.com/socketio/socket.io-redis-streams-adapter/compare/0.2.3...0.3.0) |
| `0.2.3` | 2025년 11월    | [링크](https://github.com/socketio/socket.io-redis-streams-adapter/releases/tag/0.2.3) | [`0.2.2...0.2.3`](https://github.com/socketio/socket.io-redis-streams-adapter/compare/0.2.2...0.2.3) |
| `0.2.1` | 2024년 3월     | [링크](https://github.com/socketio/socket.io-redis-streams-adapter/releases/tag/0.2.1) | [`0.2.0...0.2.1`](https://github.com/socketio/socket.io-redis-streams-adapter/compare/0.2.0...0.2.1) |
| `0.2.0` | 2024년 2월     | [링크](https://github.com/socketio/socket.io-redis-streams-adapter/releases/tag/0.2.0) | [`0.1.0...0.2.0`](https://github.com/socketio/socket.io-redis-streams-adapter/compare/0.1.0...0.2.0) |
| `0.1.0` | 2023년 4월     | [링크](https://github.com/socketio/socket.io-redis-streams-adapter/releases/tag/0.1.0) |                                                                                                      |

[전체 변경 내역](https://github.com/socketio/socket.io-redis-streams-adapter/blob/main/CHANGELOG.md)
