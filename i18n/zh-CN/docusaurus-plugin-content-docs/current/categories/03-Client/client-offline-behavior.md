---
title: 离线行为
sidebar_position: 4
slug: /client-offline-behavior/
---

## 缓冲事件 {#buffered-events}

默认情况下，在 Socket 未连接时发出的任何事件都将被缓冲，直到重新连接。

虽然在大多数情况下很有用（当重新连接延迟很短时），但它可能会在连接恢复时导致大量事件。

有几种解决方案可以防止这种行为，具体取决于您的用例：

- 使用Socket 实例的[connected 属性](client-socket-instance.md#socketconnected) attribute of the Socket instance

```js
if (socket.connected) {
  socket.emit( /* ... */ );
} else {
  // ...
}
```

- 使用 [volatile 事件](../04-Events/emitting-events.md#volatile-events)

```js
socket.volatile.emit( /* ... */ );
```
