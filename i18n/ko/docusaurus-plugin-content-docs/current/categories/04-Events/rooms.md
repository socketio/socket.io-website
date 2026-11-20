---
title: 룸
sidebar_position: 4
slug: /rooms/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

*룸(room)*은 소켓이 `join`하거나 `leave`할 수 있는 임의의 채널입니다. 룸을 사용하면 일부 클라이언트에게만 이벤트를 브로드캐스트할 수 있습니다.

<ThemedImage
  alt="룸 안의 모든 클라이언트에게 브로드캐스팅"
  sources={{
    light: useBaseUrl('/images/rooms.png'),
    dark: useBaseUrl('/images/rooms-dark.png'),
  }}
/>

:::info

룸은 **서버에만** 있는 개념이라는 점에 유의하세요(즉, 클라이언트는 자신이 참여한 룸 목록에 접근할 수 없습니다).

:::

## 참여와 나가기 {#joining-and-leaving}

`join`을 호출하면 소켓이 특정 채널을 구독합니다.

```js
io.on("connection", (socket) => {
  socket.join("some room");
});
```

그런 다음 브로드캐스트하거나 이벤트를 보낼 때 `to`나 `in`을 사용하면 됩니다(두 메서드는 같습니다).

```js
io.to("some room").emit("some event");
```

특정 룸을 제외할 수도 있습니다.

```js
io.except("some room").emit("some event");
```

여러 룸에 동시에 이벤트를 보낼 수도 있습니다.

```js
io.to("room1").to("room2").to("room3").emit("some event");
```

이 경우 <a href="https://en.wikipedia.org/wiki/Union_(set_theory)">합집합</a>을 구합니다. 즉 지정한 룸 중 하나 이상에 속한 모든 소켓이 이벤트를 **한 번** 받습니다. 소켓이 두 개 이상의 룸에 속해 있어도 마찬가지입니다.

특정 소켓에서 룸으로 브로드캐스트할 수도 있습니다.

```js
io.on("connection", (socket) => {
  socket.to("some room").emit("some event");
});
```

이 경우 보낸 소켓을 **제외한** 룸 안의 모든 소켓이 이벤트를 받습니다.

<ThemedImage
  alt="보낸 클라이언트를 제외한 룸 안의 모든 클라이언트에게 브로드캐스팅"
  sources={{
    light: useBaseUrl('/images/rooms2.png'),
    dark: useBaseUrl('/images/rooms2-dark.png'),
  }}
/>

채널에서 나가려면 `join`과 같은 방식으로 `leave`를 호출하세요.

## 사용 사례 {#sample-use-cases}

- 특정 사용자의 모든 기기/탭에 데이터 브로드캐스트하기

```js
function computeUserIdFromHeaders(headers) {
  // 구현 필요
}

io.on("connection", async (socket) => {
  const userId = await computeUserIdFromHeaders(socket.handshake.headers);

  socket.join(userId);

  // 그리고 나중에
  io.to(userId).emit("hi");
});
```

- 특정 엔티티 관련 알림 보내기

```js
io.on("connection", async (socket) => {
  const projects = await fetchProjects(socket);

  projects.forEach(project => socket.join("project:" + project.id));

  // 그리고 나중에
  io.to("project:4321").emit("project updated");
});
```

## 연결 끊김 {#disconnection}

연결이 끊기면 소켓은 속해 있던 모든 채널에서 자동으로 `leave`하므로 별도의 정리 작업이 필요 없습니다.

`disconnecting` 이벤트 리스너에서 Socket 인스턴스가 속해 있던 룸을 가져올 수 있습니다.

```js
io.on("connection", socket => {
  socket.on("disconnecting", () => {
    console.log(socket.rooms); // 이 Set에는 최소한 소켓 ID가 들어 있습니다
  });

  socket.on("disconnect", () => {
    // socket.rooms.size === 0
  });
});
```

## 여러 Socket.IO 서버에서 {#with-multiple-socketio-servers}

[모든 클라이언트에게 보내는 브로드캐스팅](broadcasting-events.md#with-multiple-socketio-servers)과 마찬가지로 룸으로 보내는 브로드캐스팅도 Socket.IO 서버가 여러 대일 때 동작합니다.

기본 [어댑터](../08-Miscellaneous/glossary.md#adapter)를 Redis 어댑터로 바꾸기만 하면 됩니다. 자세한 내용은 [Redis 어댑터](../05-Adapters/adapter-redis.md) 문서를 참고하세요.

<ThemedImage
  alt="Redis를 사용해 룸 안의 모든 클라이언트에게 브로드캐스팅"
  sources={{
    light: useBaseUrl('/images/rooms-redis.png'),
    dark: useBaseUrl('/images/rooms-redis-dark.png'),
  }}
/>

## 구현 세부 사항 {#implementation-details}

"룸" 기능은 어댑터(Adapter)가 구현합니다. 어댑터는 다음 역할을 맡는 서버 측 구성 요소입니다.

- Socket 인스턴스와 룸 사이의 관계 저장
- 모든 클라이언트(또는 일부 클라이언트)에게 이벤트 브로드캐스팅

기본 인메모리 어댑터의 코드는 [socket.io-adapter 저장소](https://github.com/socketio/socket.io-adapter)에서 볼 수 있습니다.

간단히 말해 이 어댑터는 두 개의 [ES6 Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)으로 이루어져 있습니다.

- `sids`: `Map<SocketId, Set<Room>>`
- `rooms`: `Map<Room, Set<SocketId>>`

`socket.join("the-room")`을 호출하면 다음 작업이 이루어집니다.

- `sids` Map에서는 소켓 ID로 식별되는 Set에 "the-room"을 추가합니다.
- `rooms` Map에서는 문자열 "the-room"으로 식별되는 Set에 소켓 ID를 추가합니다.

브로드캐스트할 때는 이 두 Map을 사용합니다.

- 모든 소켓으로 보내는 브로드캐스트(`io.emit()`)는 `sids` Map을 순회하며 모든 소켓에 패킷을 보냅니다.
- 특정 룸으로 보내는 브로드캐스트(`io.to("room21").emit()`)는 `rooms` Map의 Set을 순회하며 해당하는 모든 소켓에 패킷을 보냅니다.

이 두 객체에는 다음과 같이 접근할 수 있습니다.

```js
// 메인 네임스페이스
const rooms = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

// 커스텀 네임스페이스
const rooms = io.of("/my-namespace").adapter.rooms;
const sids = io.of("/my-namespace").adapter.sids;
```

참고:

- 이 두 객체는 직접 수정하면 안 됩니다. 항상 [`socket.join(...)`](../../server-api.md#socketjoinroom)과 [`socket.leave(...)`](../../server-api.md#socketleaveroom)를 사용하세요.
- [다중 서버](../02-Server/using-multiple-nodes.md) 환경에서는 `rooms`와 `sids` 객체가 Socket.IO 서버 사이에 공유되지 않습니다. 어떤 룸이 한 서버에만 "존재"하고 다른 서버에는 없을 수 있습니다.

## 룸 이벤트 {#room-events}

`socket.io@3.1.0`부터는 내부 어댑터가 다음 이벤트를 발생시킵니다.

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
