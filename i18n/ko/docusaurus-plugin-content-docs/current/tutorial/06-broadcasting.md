---
title: "튜토리얼 5단계 - 브로드캐스팅"
sidebar_label: "5단계: 브로드캐스팅"
slug: step-5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 브로드캐스팅

이번에는 서버에서 다른 사용자에게 이벤트를 보내 보겠습니다.

모두에게 이벤트를 보낼 때는 Socket.IO의 `io.emit()` 메서드를 사용합니다.

```js
// 연결된 모든 소켓에 이벤트를 보냅니다
io.emit('hello', 'world'); 
```

메시지를 보내는 소켓 자신을 제외한 모두에게 보내려면 그 소켓에서 `broadcast` 플래그를 붙여 보내면 됩니다.

```js
io.on('connection', (socket) => {
  socket.broadcast.emit('hi');
});
```

이 채팅 앱에서는 단순하게 하려고 보낸 사람까지 포함해 모두에게 메시지를 보냅니다.

```js
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
```

그리고 클라이언트는 `chat message` 이벤트를 받으면 메시지를 페이지에 추가합니다.

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();

  const form = document.getElementById('form');
  const input = document.getElementById('input');
  // highlight-start
  const messages = document.getElementById('messages');
  // highlight-end

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  // highlight-start
  socket.on('chat message', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
  // highlight-end
</script>
```

  </TabItem>
  <TabItem value="es5" label="ES5">

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();

  var form = document.getElementById('form');
  var input = document.getElementById('input');
  // highlight-start
  var messages = document.getElementById('messages');
  // highlight-end

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  // highlight-start
  socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
  // highlight-end
</script>
```

  </TabItem>
</Tabs>

실제로 동작하는 모습을 확인해 봅시다.

<video controls autoplay="" loop="" width="100%"><source src="https://i.cloudup.com/transcoded/J4xwRU9DRn.mp4" /></video>

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step5?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step5?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step5?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step5?file=index.js)


  </TabItem>
</Tabs>

:::
