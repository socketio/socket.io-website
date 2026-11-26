---
title: 메모리 사용량
sidebar_position: 9
slug: /memory-usage/
---

Socket.IO 서버가 쓰는 리소스는 주로 다음에 따라 달라집니다.

- 연결된 클라이언트 수
- 초당 주고받는 메시지 수([기본 emit](../04-Events/emitting-events.md#basic-emit), [확인 응답(acknowledgement)을 받는 emit](../04-Events/emitting-events.md#acknowledgements), [브로드캐스트](../04-Events/broadcasting-events.md))

:::info

Socket.IO 서버의 메모리 사용량은 연결된 클라이언트 수에 따라 **선형적으로** 늘어나는 것이 정상입니다.

:::

:::tip

기본적으로 Socket.IO는 각 세션의 첫 HTTP 요청에 대한 참조를 메모리에 보관합니다. 이 참조는 `express-session`을 사용할 때처럼 필요한 경우가 있지만([여기](/how-to/use-with-express-session)를 참고하세요), 메모리를 아끼려면 버려도 됩니다.

```js
io.engine.on("connection", (rawSocket) => {
  rawSocket.request = null;
});
```

:::

이 페이지에 나온 결과를 재현하는 소스 코드는 [여기](https://github.com/socketio/socket.io-benchmarks)에 있습니다.

함께 보기:

- [부하 테스트](../06-Advanced/load-testing.md)
- [성능 튜닝](../06-Advanced/performance-tuning.md)

## WebSocket 서버 구현체별 메모리 사용량 {#memory-usage-per-websocket-server-implementation}

Socket.IO 서버의 메모리 사용량은 내부에서 사용하는 WebSocket 서버 구현체의 메모리 사용량에 크게 좌우됩니다.

아래 차트는 연결된 클라이언트가 0개에서 10,000개까지 늘어날 때 Socket.IO 서버의 메모리 사용량을 보여 줍니다. 비교 대상은 다음과 같습니다.

- [`ws`](https://github.com/websockets/ws) 패키지 기반 Socket.IO 서버(기본값)
- [`eiows`](https://github.com/mmdevries/eiows) 패키지 기반 Socket.IO 서버(C++로 구현한 WebSocket 서버, [설치 방법](../02-Server/server-installation.md#other-websocket-server-implementations) 참고)
- [`µWebSockets.js`](https://github.com/uNetworking/uWebSockets.js) 패키지 기반 Socket.IO 서버(Node.js 기본 HTTP 서버를 대체하는 C++ 구현체, [설치 방법](../02-Server/server-installation.md#usage-with-uwebsockets) 참고)
- [`ws`](https://github.com/websockets/ws) 패키지 기반의 일반 WebSocket 서버

![WebSocket 서버 구현체별 메모리 사용량 차트](/images/memory-usage-per-impl.png?v=2)


테스트 환경은 `Ubuntu 22.04 LTS`, Node.js `v20.3.0`이며 패키지 버전은 다음과 같습니다.

- `socket.io@4.7.2`
- `eiows@6.7.2`
- `uWebSockets.js@20.33.0`
- `ws@8.11.0`

## 시간에 따른 메모리 사용량 {#memory-usage-over-time}

아래 차트는 연결된 클라이언트가 0개에서 10,000개까지 늘어날 때 Socket.IO 서버의 메모리 사용량을 시간에 따라 보여 줍니다.

![시간에 따른 메모리 사용량 차트](/images/memory-usage-over-time.png?v=2)

:::note

시연을 위해 클라이언트가 한 차례 접속했다가 모두 연결을 끊을 때마다 가비지 컬렉터를 직접 호출했습니다.

```js
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    const lastToDisconnect = io.of("/").sockets.size === 0;
    if (lastToDisconnect) {
      gc();
    }
  });
});
```

그래서 마지막 클라이언트의 연결이 끊길 때 메모리 사용량이 깔끔하게 떨어집니다. 실제 애플리케이션에서는 이렇게 할 필요가 없으며, 가비지 컬렉션은 필요할 때 자동으로 실행됩니다.

:::
