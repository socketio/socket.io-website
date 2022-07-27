---
title: 广播事件
sidebar_position: 3
slug: /broadcasting-events/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Socket.IO 使向所有连接的客户端发送事件变得容易。

:::info

请注意，广播是**仅服务器**功能。

:::

## 给所有连接的客户端 {#to-all-connected-clients}

<ThemedImage
  alt="Broadcasting to all connected clients"
  sources={{
    light: useBaseUrl('/images/broadcasting.png'),
    dark: useBaseUrl('/images/broadcasting-dark.png'),
  }}
/>

```js
io.emit("hello", "world");
```

:::caution

当前断开连接（或正在重新连接）的客户端将不会收到该事件。将此事件存储在某处（例如在数据库中）取决于您的用例。

:::

## 除发送者外的所有连接的客户端 {#to-all-connected-clients-except-the-sender}

<ThemedImage
  alt="Broadcasting to all connected clients excepting the sender"
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

在上面的示例中，使用`socket.emit("hello", "world")`（不带`broadcast`标志）会将事件发送到“客户端 A”。您可以在[备忘单](emit-cheatsheet.md)中找到发送事件的所有方式的列表。

:::

## 使用多个 Socket.IO 服务器 {#with-multiple-socketio-servers}

广播也适用于多个 Socket.IO 服务器。

您只需将默认适配器替换为[Redis 适配器](../05-Adapters/adapter.md)或其他[兼容的适配器](../05-Adapters/adapter-redis.md)。

<ThemedImage
  alt="Broadcasting with Redis"
  sources={{
    light: useBaseUrl('/images/broadcasting-redis.png'),
    dark: useBaseUrl('/images/broadcasting-redis-dark.png'),
  }}
/>

在某些情况下，您可能只想向连接到当前服务器的客户端广播。您可以使用`local`标志实现此目的：

```js
io.local.emit("hello", "world");
```

<ThemedImage
  alt="Broadcasting with Redis but local"
  sources={{
    light: useBaseUrl('/images/broadcasting-redis-local.png'),
    dark: useBaseUrl('/images/broadcasting-redis-local-dark.png'),
  }}
/>

为了在广播时针对特定客户，请参阅有关[Rooms](rooms.md)的文档。
