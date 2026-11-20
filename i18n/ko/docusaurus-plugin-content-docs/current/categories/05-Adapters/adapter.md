---
title: 어댑터
sidebar_label: 소개
sidebar_position: 1
slug: /adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

어댑터(Adapter)는 모든 클라이언트 또는 일부 클라이언트에게 이벤트를 브로드캐스트하는 서버 측 구성 요소입니다.

Socket.IO 서버를 여러 대로 확장할 때는 이벤트가 모든 클라이언트에게 제대로 전달되도록 기본 인메모리 어댑터를 다른 어댑터로 바꿔야 합니다.

Socket.IO 팀이 관리하는 어댑터는 다음과 같습니다.

- [Redis 어댑터](adapter-redis.md)
- [Redis Streams 어댑터](adapter-redis-streams.md)
- [MongoDB 어댑터](adapter-mongo.md)
- [Postgres 어댑터](adapter-postgres.md)
- [클러스터 어댑터](adapter-cluster.md)
- [Google Cloud Pub/Sub 어댑터](adapter-gcp-pubsub.md)
- [AWS SQS 어댑터](adapter-aws-sqs.md)
- [Azure Service Bus 어댑터](adapter-azure-service-bus.md)

커뮤니티가 관리하는 다른 어댑터도 여러 개 있습니다.

- [AMQP](https://github.com/sensibill/socket.io-amqp) (예: RabbitMQ)
- [NATS](https://github.com/MickL/socket.io-nats-adapter)
- [NATS](https://github.com/distrue/socket.io-nats-adapter)

Socket.IO 서버를 여러 대 두고 HTTP 롱 폴링을 사용한다면 어댑터를 쓰더라도 스티키 세션을 활성화해야 합니다. 자세한 내용은 [여러 노드 사용하기](../02-Server/using-multiple-nodes.md)를 참고하세요.

## API {#api}

어댑터 인스턴스에는 다음과 같이 접근할 수 있습니다.

```js
// 메인 네임스페이스
const mainAdapter = io.of("/").adapter; // 주의! io.adapter()로는 접근할 수 없습니다
// 커스텀 네임스페이스
const adminAdapter = io.of("/admin").adapter;
```

`socket.io@3.1.0`부터 각 어댑터 인스턴스는 다음 이벤트를 발생시킵니다.

- `create-room` (인자: room)
- `delete-room` (인자: room)
- `join-room` (인자: room, id)
- `leave-room` (인자: room, id)

예시:

```js
io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
```

## 이미터 {#emitter}

대부분의 어댑터 구현체에는 짝을 이루는 이미터(emitter) 패키지가 있습니다. 이미터를 사용하면 다른 Node.js 프로세스에서 Socket.IO 서버 그룹으로 메시지를 보낼 수 있습니다.

<ThemedImage
  alt="이미터 구성도"
  sources={{
    light: useBaseUrl('/images/emitter.png'),
    dark: useBaseUrl('/images/emitter-dark.png'),
  }}
/>

예를 들어 다음과 같은 마이크로서비스 구성에서 이미터가 유용할 수 있습니다. 모든 클라이언트는 마이크로서비스 M1에 연결하고, 마이크로서비스 M2는 이미터로 패킷을 브로드캐스트합니다(단방향 통신).

## 이미터 치트 시트 {#emitter-cheatsheet}

```js
// 모든 클라이언트에게
emitter.emit(/* ... */);

// "room1"에 있는 모든 클라이언트에게
emitter.to("room1").emit(/* ... */);

// "room1"에 있는 클라이언트 중 "room2"에 있는 클라이언트를 제외한 모두에게
emitter.to("room1").except("room2").emit(/* ... */);

const adminEmitter = emitter.of("/admin");

// "admin" 네임스페이스의 모든 클라이언트에게
adminEmitter.emit(/* ... */);

// "admin" 네임스페이스에서 "room1" 룸에 있는 모든 클라이언트에게
adminEmitter.to("room1").emit(/* ... */);
```

이미터는 `socket.io@4.0.0`에서 추가된 유틸리티 메서드도 지원합니다.

- `socketsJoin()`

```js
// 모든 Socket 인스턴스를 "room1" 룸에 참여시킵니다
emitter.socketsJoin("room1");

// "admin" 네임스페이스에서 "room1" 룸에 있는 모든 Socket 인스턴스를 "room2" 룸에 참여시킵니다
emitter.of("/admin").in("room1").socketsJoin("room2");
```

- `socketsLeave()`

```js
// 모든 Socket 인스턴스를 "room1" 룸에서 나가게 합니다
emitter.socketsLeave("room1");

// "room1" 룸에 있는 모든 Socket 인스턴스를 "room2"와 "room3" 룸에서 나가게 합니다
emitter.in("room1").socketsLeave(["room2", "room3"]);

// "admin" 네임스페이스에서 "room1" 룸에 있는 모든 Socket 인스턴스를 "room2" 룸에서 나가게 합니다
emitter.of("/admin").in("room1").socketsLeave("room2");
```

- `disconnectSockets()`

```js
// 모든 Socket 인스턴스의 연결을 끊습니다
emitter.disconnectSockets();

// "room1" 룸에 있는 모든 Socket 인스턴스의 연결을 끊습니다(하위 수준 연결도 닫습니다)
emitter.in("room1").disconnectSockets(true);

// "admin" 네임스페이스에서 "room1" 룸에 있는 모든 Socket 인스턴스의 연결을 끊습니다
emitter.of("/admin").in("room1").disconnectSockets();

// 소켓 ID 하나에도 사용할 수 있습니다
emitter.of("/admin").in(theSocketId).disconnectSockets();
```

- `serverSideEmit()`

```js
// 클러스터의 모든 Socket.IO 서버에 이벤트를 보냅니다
emitter.serverSideEmit("hello", "world");

// Socket.IO 서버(서버 측)
io.on("hello", (arg) => {
  console.log(arg); // "world" 출력
});
```
