---
title: Redis 어댑터
sidebar_position: 2
slug: /redis-adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## 동작 방식 {#how-it-works}

Redis 어댑터는 Redis의 [Pub/Sub 메커니즘](https://redis.io/topics/pubsub)을 기반으로 동작합니다.

여러 클라이언트에게 보내는 모든 패킷(예: `io.to("room1").emit()`, `socket.broadcast.emit()`)은 다음과 같이 처리됩니다.

- 현재 서버에 연결된 대상 클라이언트 모두에게 전송됩니다
- Redis 채널에 발행되고, 클러스터의 다른 Socket.IO 서버가 이 패킷을 받습니다

<ThemedImage
  alt="Redis 어댑터의 동작 방식을 나타낸 다이어그램"
  sources={{
    light: useBaseUrl('/images/broadcasting-redis.png'),
    dark: useBaseUrl('/images/broadcasting-redis-dark.png'),
  }}
/>

이 어댑터의 소스 코드는 [여기](https://github.com/socketio/socket.io-redis-adapter)에서 확인할 수 있습니다.

## 보안 고려 사항 {#security-considerations}

Redis 어댑터는 Redis가 신뢰할 수 있는 내부 인프라의 일부라고 가정합니다.

어댑터는 Redis Pub/Sub으로 주고받는 메시지에 서명, 암호화, 인증을 적용하지 않습니다. Redis에 접속해 어댑터 채널에 메시지를 발행할 수 있는 사람은 누구든 패킷을 주입하거나 서버 간 제어 메시지를 위조하거나 연결된 클라이언트에게 가짜 이벤트를 보낼 수 있습니다. Redis 트래픽을 엿보거나 관련 채널을 구독할 수 있는 사람이라면 이벤트 페이로드의 내용도 볼 수 있습니다.

따라서 Redis를 신뢰할 수 없는 네트워크에 노출하거나 신뢰할 수 없는 클라이언트와 공유하지 않아야 합니다. ACL과 Pub/Sub 채널 격리를 제대로 설정하지 않았다면 관련 없는 애플리케이션과 같은 Redis 인스턴스를 함께 쓰지 마세요.

Redis ACL, 인증, TLS, 방화벽 규칙, 사설 네트워크를 상황에 맞게 적용하고, 꼭 필요한 명령과 채널 권한만 부여한 전용 자격 증명을 쓰세요. Redis 배포 환경이 충분히 보호되지 않았다면 오래 유지되는 비밀 값이나 민감한 자격 증명을 이벤트 페이로드에 담아 보내지 마세요.

## 지원 기능 {#supported-features}

| 기능                             | `socket.io` 버전                     | 지원 여부                                       |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket 관리                      | `4.0.0`                             | :white_check_mark: 예 (`6.1.0` 버전부터)          |
| 서버 간 통신                       | `4.1.0`                             | :white_check_mark: 예 (`7.0.0` 버전부터)          |
| 확인 응답(acknowledgement)을 받는 브로드캐스트 | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: 예 (`7.2.0` 버전부터)          |
| 연결 상태 복구                      | [`4.6.0`](../../changelog/4.6.0.md) | :x: 아니요                                      |

## 설치 {#installation}

```
npm install @socket.io/redis-adapter
```

## 호환성 표 {#compatibility-table}

| Redis 어댑터 버전       | Socket.IO 서버 버전        |
|-----------------------|--------------------------|
| 4.x                   | 1.x                      |
| 5.x                   | 2.x                      |
| 6.0.x                 | 3.x                      |
| 6.1.x                 | 4.x                      |
| 7.x 이상               | 4.3.1 이상                 |

## 사용법 {#usage}

:::tip

새로 개발한다면 Redis 7.0에서 도입된 [샤딩된 Pub/Sub 기능](https://redis.io/docs/latest/develop/interact/pubsub/#sharded-pubsub)을 활용하는 [샤딩 어댑터](#with-redis-sharded-pubsub)를 사용하길 권장합니다.

:::

### `redis` 패키지 사용 {#with-the-redis-package}

:::caution

`redis` 패키지는 재연결 후 Redis 구독을 복원하는 데 문제가 있는 것으로 보입니다.

- https://github.com/redis/node-redis/issues/2155
- https://github.com/redis/node-redis/issues/1252

대신 [`ioredis`](#with-the-ioredis-package) 패키지 사용을 고려해 보세요.

:::

```js
import { createClient } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

await Promise.all([
  pubClient.connect(),
  subClient.connect()
]);

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### `redis` 패키지와 Redis 클러스터 사용 {#with-the-redis-package-and-a-redis-cluster}

```js
import { createCluster } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = createCluster({
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
const subClient = pubClient.duplicate();

await Promise.all([
  pubClient.connect(),
  subClient.connect()
]);

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### `ioredis` 패키지 사용 {#with-the-ioredis-package}

```js
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = new Redis();
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### `ioredis` 패키지와 Redis 클러스터 사용 {#with-the-ioredis-package-and-a-redis-cluster}

```js
import { Cluster } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = new Cluster([
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
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

### Redis 샤딩된 Pub/Sub 사용 {#with-redis-sharded-pubsub}

샤딩된 Pub/Sub은 클러스터 모드에서 Pub/Sub을 더 쉽게 확장할 수 있도록 Redis 7.0에서 도입되었습니다.

참고: https://redis.io/docs/interact/pubsub/#sharded-pubsub

`createShardedAdapter()` 메서드로 전용 어댑터를 만들 수 있습니다.

#### `redis` 사용 {#with-redis}

최소 요구 사항:

- Redis 7.0
- [`redis@4.6.0`](https://github.com/redis/node-redis/commit/3b1bad229674b421b2bc6424155b20d4d3e45bd1)

```js
import { Server } from "socket.io";
import { createClient } from "redis";
import { createShardedAdapter } from "@socket.io/redis-adapter";

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

await Promise.all([
  pubClient.connect(),
  subClient.connect()
]);

const io = new Server({
  adapter: createShardedAdapter(pubClient, subClient)
});

io.listen(3000);
```

#### `ioredis` 사용 {#with-ioredis}

최소 요구 사항:

- Redis 7.0
- [`ioredis@5.9.0`](https://github.com/redis/ioredis/pull/1956)

샤딩된 Pub/Sub을 활성화하려면 `shardedSubscribers` 옵션이 필요하다는 점에 유의하세요.

```js
import { Cluster } from "ioredis";
import { Server } from "socket.io";
import { createShardedAdapter } from "@socket.io/redis-adapter";

const pubClient = new Cluster(
  [
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
  ],
  {
    shardedSubscribers: true,
  }
);
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createShardedAdapter(pubClient, subClient)
});

io.listen(3000);
```

## 옵션 {#options}

### 기본 어댑터 {#default-adapter}

| 이름                                | 설명                                                                            | 기본값         |
|------------------------------------|-------------------------------------------------------------------------------|---------------|
| `key`                              | Redis Pub/Sub 채널의 접두사입니다.                                                  | `socket.io`   |
| `requestsTimeout`                  | 이 시간이 지나면 어댑터는 요청에 대한 응답을 더 이상 기다리지 않습니다.                          | `5_000`       |
| `publishOnSpecificResponseChannel` | 요청한 노드 전용 채널에 응답을 발행할지 여부입니다.                                         | `false`       |
| `parser`                           | Redis로 보내는 메시지를 인코딩하고 디코딩할 때 사용할 파서입니다.                                | `-`           |

:::tip

`publishOnSpecificResponseChannel` 옵션을 `true`로 설정하면 더 효율적입니다. `fetchSockets()`나 `serverSideEmit()` 등을 호출했을 때 응답이 모든 서버가 아니라 요청한 서버에만 전송되기 때문입니다.

다만 하위 호환성 때문에 현재 기본값은 `false`입니다.

:::

### 샤딩 어댑터 {#sharded-adapter}

| 이름                | 설명                                                                                     | 기본값         |
|--------------------|-----------------------------------------------------------------------------------------|---------------|
| `channelPrefix`    | Redis Pub/Sub 채널의 접두사입니다.                                                            | `socket.io`   |
| `subscriptionMode` | 구독 모드에 따라 어댑터가 사용하는 Redis Pub/Sub 채널 수가 달라집니다.                                 | `dynamic`     |

`subscriptionMode` 옵션에 사용할 수 있는 값:

| 값                   | Pub/Sub 채널 수                        | 설명                                                                                                                                                |
|---------------------|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `static`            | 네임스페이스당 2개                         | 동적 네임스페이스와 함께 사용할 때 유용합니다.                                                                                                                  |
| `dynamic` (기본값)    | 네임스페이스당 (2 + 공개 룸당 1개)              | 클라이언트 수가 적은 룸이 있을 때 유용합니다(일부 Socket.IO 서버만 알림을 받습니다).                                                                              |
| `dynamic-private`   | 네임스페이스당 (2 + 룸당 1개)                 | `dynamic`과 같지만 비공개 룸에도 별도 채널을 만듭니다. `socket.emit()` 호출로 1:1 통신을 많이 할 때 유용합니다.                                                           |

## 자주 묻는 질문 {#common-questions}

### Redis에 저장되는 데이터가 있나요? {#is-there-any-data-stored-in-redis}

아니요. Redis 어댑터는 [Pub/Sub 메커니즘](https://redis.io/topics/pubsub)으로 Socket.IO 서버 간에 패킷을 전달하므로 Redis에 저장되는 키는 없습니다.

### Redis 어댑터를 사용해도 스티키 세션을 활성화해야 하나요? {#do-i-still-need-to-enable-sticky-sessions-when-using-the-redis-adapter}

네. 활성화하지 않으면 HTTP 400 응답을 받습니다. 요청이 그 Socket.IO 세션을 모르는 서버에 도달하기 때문입니다.

자세한 내용은 [여러 노드 사용하기](../02-Server/using-multiple-nodes.md)를 참고하세요.

### Redis 서버가 다운되면 어떻게 되나요? {#what-happens-when-the-redis-server-is-down}

Redis 서버와의 연결이 끊기면 패킷은 현재 서버에 연결된 클라이언트에게만 전송됩니다.

## `socket.io-redis`에서 마이그레이션하기 {#migrating-from-socketio-redis}

Redis 이미터(`@socket.io/redis-emitter`)와 이름을 맞추려고 [v7](https://github.com/socketio/socket.io-redis-adapter/releases/tag/7.0.0)에서 패키지 이름을 `socket.io-redis`에서 `@socket.io/redis-adapter`로 바꿨습니다.

새 패키지는 더 이상 사용자 대신 Redis 클라이언트를 만들지 않습니다. 새 패키지로 마이그레이션하려면 Redis 클라이언트를 직접 만들어 넘겨야 합니다.

변경 전:

```js
const redisAdapter = require("socket.io-redis");

io.adapter(redisAdapter({ host: "localhost", port: 6379 }));
```

변경 후:

```js
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

:::tip

Socket.IO 서버 간 통신 프로토콜은 바뀌지 않았습니다. 따라서 일부 서버는 `socket.io-redis`를, 다른 서버는 `@socket.io/redis-adapter`를 동시에 사용할 수 있습니다.

:::

## 최신 릴리스 {#latest-releases}

| 버전     | 릴리스 날짜     | 릴리스 노트                                                                       | 비교                                                                                          |
|---------|---------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `8.3.0` | 2024년 3월     | [링크](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.3.0) | [`8.2.1...8.3.0`](https://github.com/socketio/socket.io-redis-adapter/compare/8.2.1...8.3.0) |
| `8.2.1` | 2023년 5월     | [링크](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.2.1) | [`8.2.0...8.2.1`](https://github.com/socketio/socket.io-redis-adapter/compare/8.2.0...8.2.1) |
| `8.2.0` | 2023년 5월     | [링크](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.2.0) | [`8.1.0...8.2.0`](https://github.com/socketio/socket.io-redis-adapter/compare/8.1.0...8.2.0) |
| `8.1.0` | 2023년 2월     | [링크](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.1.0) | [`8.0.0...8.1.0`](https://github.com/socketio/socket.io-redis-adapter/compare/8.0.0...8.1.0) |
| `8.0.0` | 2022년 12월    | [링크](https://github.com/socketio/socket.io-redis-adapter/releases/tag/8.0.0) | [`7.2.0...8.0.0`](https://github.com/socketio/socket.io-redis-adapter/compare/7.2.0...8.0.0) |
| `7.2.0` | 2022년 5월     | [링크](https://github.com/socketio/socket.io-redis-adapter/releases/tag/7.2.0) | [`7.1.0...7.2.0`](https://github.com/socketio/socket.io-redis-adapter/compare/7.1.0...7.2.0) |

[전체 변경 내역](https://github.com/socketio/socket.io-redis-adapter/blob/main/CHANGELOG.md)

## 이미터 {#emitter}

Redis 이미터(emitter)를 사용하면 다른 Node.js 프로세스에서 연결된 클라이언트에게 패킷을 보낼 수 있습니다.

<ThemedImage
  alt="Redis 이미터의 동작 방식을 나타낸 다이어그램"
  sources={{
    light: useBaseUrl('/images/redis-emitter.png'),
    dark: useBaseUrl('/images/redis-emitter-dark.png'),
  }}
/>

이 이미터는 여러 언어로도 구현되어 있습니다.

- Javascript: https://github.com/socketio/socket.io-redis-emitter
- Java: https://github.com/sunsus/socket.io-java-emitter
- Python: https://pypi.org/project/socket.io-emitter/
- PHP: https://github.com/rase-/socket.io-php-emitter
- Golang: https://github.com/yosuke-furukawa/socket.io-go-emitter
- Perl: https://metacpan.org/pod/SocketIO::Emitter
- Rust: https://github.com/epli2/socketio-rust-emitter

### 설치 {#installation-1}

```
npm install @socket.io/redis-emitter redis
```

### 사용법 {#usage-1}

```js
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });

redisClient.connect().then(() => {
  const emitter = new Emitter(redisClient);

  setInterval(() => {
    emitter.emit("time", new Date);
  }, 5000);
});
```

참고: `redis@3`에서는 Redis 클라이언트의 `connect()`를 호출할 필요가 없습니다.

```js
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });
const emitter = new Emitter(redisClient);

setInterval(() => {
  emitter.emit("time", new Date);
}, 5000);
```

[이미터 치트 시트](adapter.md#emitter-cheatsheet)를 참고하세요.

### `socket.io-emitter`에서 마이그레이션하기 {#migrating-from-socketio-emitter}

Redis와의 관계를 더 잘 드러내려고 [v4](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.0.0)에서 패키지 이름을 `socket.io-emitter`에서 `@socket.io/redis-emitter`로 바꿨습니다.

새 패키지는 더 이상 사용자 대신 Redis 클라이언트를 만들지 않습니다. 새 패키지로 마이그레이션하려면 Redis 클라이언트를 직접 만들어 넘겨야 합니다.

변경 전:

```js
const io = require("socket.io-emitter")({ host: "127.0.0.1", port: 6379 });
```

변경 후:

```js
const { Emitter } = require("@socket.io/redis-emitter");
const { createClient } = require("redis");

const redisClient = createClient();
const io = new Emitter(redisClient);
```

### 최신 릴리스 {#latest-releases-1}

| 버전     | 릴리스 날짜      | 릴리스 노트                                                                       | 비교                                                                                          |
|---------|----------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `5.1.0` | 2023년 1월      | [링크](https://github.com/socketio/socket.io-redis-emitter/releases/tag/5.1.0) | [`5.0.0...5.1.0`](https://github.com/socketio/socket.io-redis-emitter/compare/5.0.0...5.1.0) |
| `5.0.0` | 2022년 9월      | [링크](https://github.com/socketio/socket.io-redis-emitter/releases/tag/5.0.1) | [`4.1.1...5.0.0`](https://github.com/socketio/socket.io-redis-emitter/compare/4.1.1...5.0.0) |
| `4.1.1` | 2022년 1월      | [링크](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.1.1) | [`4.1.0...4.1.1`](https://github.com/socketio/socket.io-redis-emitter/compare/4.1.0...4.1.1) |
| `4.1.0` | 2021년 5월      | [링크](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.1.0) | [`4.0.0...4.1.0`](https://github.com/socketio/socket.io-redis-emitter/compare/4.0.0...4.1.0) |
| `4.0.0` | 2021년 3월      | [링크](https://github.com/socketio/socket.io-redis-emitter/releases/tag/4.0.0) | [`3.2.0...4.0.0`](https://github.com/socketio/socket.io-redis-emitter/compare/3.2.0...4.0.0) |

[전체 변경 내역](https://github.com/socketio/socket.io-redis-emitter/blob/main/CHANGELOG.md)
