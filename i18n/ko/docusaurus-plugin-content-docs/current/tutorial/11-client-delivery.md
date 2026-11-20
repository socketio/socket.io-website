---
title: "튜토리얼 8단계 - 클라이언트 측 전달"
sidebar_label: "8단계: 클라이언트 측 전달"
slug: step-8
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 클라이언트 측 전달

클라이언트가 보낸 메시지를 서버가 항상 받도록 보장하는 방법을 알아보겠습니다.

:::info

Socket.IO는 기본적으로 "최대 한 번(at most once)" 전달 보장("fire and forget"이라고도 합니다)을 제공합니다. 즉 메시지가 서버에 도달하지 못해도 재시도하지 않습니다.

:::

## 버퍼에 쌓이는 이벤트 {#buffered-events}

클라이언트의 연결이 끊긴 동안 `socket.emit()`으로 보낸 이벤트는 재연결될 때까지 모두 버퍼에 쌓입니다.

<video controls width="100%"><source src="/videos/tutorial/buffered-events.mp4" /></video>

위 영상에서 "realtime" 메시지는 다시 연결될 때까지 버퍼에 쌓여 있습니다.

애플리케이션에 따라서는 이 동작만으로도 충분할 수 있습니다. 하지만 다음과 같은 경우에는 메시지가 유실될 수 있습니다.

- 이벤트를 보내는 도중에 연결이 끊긴 경우
- 서버가 이벤트를 처리하는 도중에 다운되거나 재시작된 경우
- 데이터베이스를 일시적으로 사용할 수 없는 경우

## 최소 한 번 {#at-least-once}

"최소 한 번" 전달 보장은 다음과 같이 구현할 수 있습니다.

- 확인 응답(acknowledgement)을 사용해 직접 구현하는 방법:

```js
function emit(socket, event, arg) {
  socket.timeout(5000).emit(event, arg, (err) => {
    if (err) {
      // 서버에서 확인 응답이 오지 않았으므로 재시도합니다
      emit(socket, event, arg);
    }
  });
}

emit(socket, 'hello', 'world');
```

- 또는 `retries` 옵션을 사용하는 방법:

```js
const socket = io({
  ackTimeout: 10000,
  retries: 3
});

socket.emit('hello', 'world');
```

두 경우 모두 클라이언트는 서버에서 확인 응답을 받을 때까지 메시지 전송을 재시도합니다.

```js
io.on('connection', (socket) => {
  socket.on('hello', (value, callback) => {
    // 이벤트를 성공적으로 처리했으면
    callback();
  });
})
```

:::tip

`retries` 옵션을 사용하면 메시지가 큐에 쌓였다가 하나씩 전송되므로 메시지 순서가 보장됩니다. 첫 번째 방법은 그렇지 않습니다.

:::

## 정확히 한 번 {#exactly-once}

재시도하면 서버가 같은 메시지를 여러 번 받을 수 있다는 문제가 생깁니다. 따라서 서버는 메시지를 하나하나 구별해서 데이터베이스에 한 번만 저장할 수 있어야 합니다.

채팅 앱에서 "정확히 한 번" 전달 보장을 구현하는 방법을 살펴보겠습니다.

먼저 클라이언트 측에서 각 메시지에 고유 식별자를 부여합니다.

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html title="index.html"
<script>
  // highlight-next-line
  let counter = 0;

  const socket = io({
    auth: {
      serverOffset: 0
    },
    // highlight-start
    // 재시도를 활성화합니다
    ackTimeout: 10000,
    retries: 3,
    // highlight-end
  });

  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      // highlight-start
      // 고유한 오프셋을 계산합니다
      const clientOffset = `${socket.id}-${counter++}`;
      socket.emit('chat message', input.value, clientOffset);
      // highlight-end
      input.value = '';
    }
  });

  socket.on('chat message', (msg, serverOffset) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    socket.auth.serverOffset = serverOffset;
  });
</script>
```

  </TabItem>
  <TabItem value="es5" label="ES5">

```html title="index.html"
<script>
  // highlight-next-line
  var counter = 0;

  var socket = io({
    auth: {
      serverOffset: 0
    },
    // highlight-start
    // 재시도를 활성화합니다
    ackTimeout: 10000,
    retries: 3,
    // highlight-end
  });

  var form = document.getElementById('form');
  var input = document.getElementById('input');
  var messages = document.getElementById('messages');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      // highlight-start
      // 고유한 오프셋을 계산합니다
      var clientOffset = `${socket.id}-${counter++}`;
      socket.emit('chat message', input.value, clientOffset);
      // highlight-end
      input.value = '';
    }
  });

  socket.on('chat message', function(msg, serverOffset) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    socket.auth.serverOffset = serverOffset;
  });
</script>
```

  </TabItem>
</Tabs>

:::note

`socket.id`는 연결마다 부여되는 20자짜리 무작위 식별자입니다.

고유한 오프셋을 생성할 때 [`getRandomValues()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)를 사용해도 됩니다.

:::

그런 다음 서버 측에서 이 오프셋을 메시지와 함께 저장합니다.

```js title="index.js"
// [...]

io.on('connection', async (socket) => {
  // highlight-next-line
  socket.on('chat message', async (msg, clientOffset, callback) => {
    let result;
    try {
      // highlight-next-line
      result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
    } catch (e) {
      // highlight-start
      if (e.errno === 19 /* SQLITE_CONSTRAINT */ ) {
        // 메시지가 이미 저장되었으므로 클라이언트에 이 사실을 알립니다
        callback();
      } else {
        // 따로 처리하지 않고 클라이언트가 재시도하도록 둡니다
      }
      return;
      // highlight-end
    }
    io.emit('chat message', msg, result.lastID);
    // highlight-start
    // 이벤트에 확인 응답을 보냅니다
    callback();
    // highlight-end
  });

  if (!socket.recovered) {
    try {
      await db.each('SELECT id, content FROM messages WHERE id > ?',
        [socket.handshake.auth.serverOffset || 0],
        (_err, row) => {
          socket.emit('chat message', row.content, row.id);
        }
      )
    } catch (e) {
      // 문제가 발생한 경우
    }
  }
});

// [...]
```

이렇게 하면 `client_offset` 컬럼의 UNIQUE 제약 조건이 메시지 중복을 막아 줍니다.

:::caution

이벤트에 확인 응답을 꼭 보내세요. 보내지 않으면 클라이언트가 (최대 `retries`번까지) 계속 재시도합니다.

```js
socket.on('chat message', async (msg, clientOffset, callback) => {
  // ... 마지막으로
  callback();
});
```

:::

:::info

다시 말하지만 애플리케이션에 따라서는 기본 전달 보장("최대 한 번")으로도 충분할 수 있습니다. 다만 이제는 전달을 더 확실하게 보장하는 방법도 알게 되었습니다.

:::

다음 단계에서는 애플리케이션을 수평 확장하는 방법을 알아보겠습니다.

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step8?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step8?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step8?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step8?file=index.js)


  </TabItem>
</Tabs>

:::
