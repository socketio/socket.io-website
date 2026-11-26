---
title: 오프라인 동작
sidebar_position: 4
slug: /client-offline-behavior/
---

## 버퍼에 쌓인 이벤트 {#buffered-events}

기본적으로 Socket이 연결되지 않은 상태에서 보낸 이벤트는 재연결될 때까지 버퍼에 쌓입니다.

이 동작은 대부분의 경우(재연결 지연이 짧을 때) 유용하지만, 다시 연결되는 순간 이벤트가 한꺼번에 몰릴 수 있습니다.

상황에 따라 다음 방법 중 하나로 이벤트가 버퍼에 쌓이지 않게 할 수 있습니다.

- Socket 인스턴스의 [connected](client-socket-instance.md#socketconnected) 속성 사용

```js
if (socket.connected) {
  socket.emit( /* ... */ );
} else {
  // ...
}
```

- [휘발성 이벤트(volatile event)](../04-Events/emitting-events.md#volatile-events) 사용

```js
socket.volatile.emit( /* ... */ );
```
