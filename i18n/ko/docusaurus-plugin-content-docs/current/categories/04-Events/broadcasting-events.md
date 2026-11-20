---
title: 이벤트 브로드캐스팅
sidebar_position: 3
slug: /broadcasting-events/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Socket.IO를 사용하면 연결된 모든 클라이언트에게 이벤트를 쉽게 보낼 수 있습니다.

:::info

브로드캐스팅은 **서버에서만** 쓸 수 있는 기능이라는 점에 유의하세요.

:::

## 연결된 모든 클라이언트에게 {#to-all-connected-clients}

<ThemedImage
  alt="연결된 모든 클라이언트에게 브로드캐스팅"
  sources={{
    light: useBaseUrl('/images/broadcasting.png'),
    dark: useBaseUrl('/images/broadcasting-dark.png'),
  }}
/>

```js
io.emit("hello", "world");
```

:::caution

현재 연결이 끊긴(또는 재연결 중인) 클라이언트는 이벤트를 받지 못합니다. 사용 사례에 따라 이 이벤트를 어딘가(예: 데이터베이스)에 저장할지는 개발자가 결정해야 합니다.

:::

## 보낸 클라이언트를 제외한 연결된 모든 클라이언트에게 {#to-all-connected-clients-except-the-sender}

<ThemedImage
  alt="보낸 클라이언트를 제외한 연결된 모든 클라이언트에게 브로드캐스팅"
  sources={{
    light: useBaseUrl('/images/broadcasting2.png'),
    dark: useBaseUrl('/images/broadcasting2-dark.png'),
  }}
/>

```js
io.on("connection", (socket) => {
  socket.broadcast.emit("hello", "world");
});
```

:::note

위 예시에서 `broadcast` 플래그 없이 `socket.emit("hello", "world")`를 사용하면 그림의 "client A"에게 이벤트를 보냅니다. 이벤트를 보내는 모든 방법은 [치트 시트](emit-cheatsheet.md)에서 확인할 수 있습니다.

:::

## 확인 응답과 함께 {#with-acknowledgements}

Socket.IO 4.5.0부터는 여러 클라이언트에게 이벤트를 브로드캐스트하고 각 클라이언트의 확인 응답(acknowledgement)을 받을 수 있습니다.

```js
io.timeout(5000).emit("hello", "world", (err, responses) => {
  if (err) {
    // 일부 클라이언트가 지정한 시간 안에 이벤트에 확인 응답을 보내지 않았습니다
  } else {
    console.log(responses); // 클라이언트마다 응답 하나
  }
});
```

모든 형태의 브로드캐스팅을 지원합니다.

- 룸 안에서

```js
io.to("room123").timeout(5000).emit("hello", "world", (err, responses) => {
  // ...
});
```

- 특정 `socket`에서

```js
socket.broadcast.timeout(5000).emit("hello", "world", (err, responses) => {
  // ...
});
```

- 네임스페이스 안에서

```js
io.of("/the-namespace").timeout(5000).emit("hello", "world", (err, responses) => {
  // ...
});
```

## 여러 Socket.IO 서버에서 {#with-multiple-socketio-servers}

브로드캐스팅은 Socket.IO 서버가 여러 대일 때도 동작합니다.

기본 어댑터를 [Redis 어댑터](../05-Adapters/adapter-redis.md)나 [호환되는 다른 어댑터](../05-Adapters/adapter.md)로 바꾸기만 하면 됩니다.

<ThemedImage
  alt="Redis를 사용한 브로드캐스팅"
  sources={{
    light: useBaseUrl('/images/broadcasting-redis.png'),
    dark: useBaseUrl('/images/broadcasting-redis-dark.png'),
  }}
/>

경우에 따라 현재 서버에 연결된 클라이언트에게만 브로드캐스트하고 싶을 수 있습니다. 이때는 `local` 플래그를 사용하세요.

```js
io.local.emit("hello", "world");
```

<ThemedImage
  alt="Redis를 사용하되 로컬에만 브로드캐스팅"
  sources={{
    light: useBaseUrl('/images/broadcasting-redis-local.png'),
    dark: useBaseUrl('/images/broadcasting-redis-local-dark.png'),
  }}
/>

브로드캐스트할 때 특정 클라이언트를 대상으로 지정하려면 [룸](rooms.md) 문서를 참고하세요.
