---
title: "튜토리얼 4단계 - 이벤트 보내기"
sidebar_label: "4단계: 이벤트 보내기"
slug: step-4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 이벤트 보내기

Socket.IO의 핵심 아이디어는 원하는 이벤트를 원하는 데이터와 함께 주고받을 수 있다는 것입니다. JSON으로 인코딩할 수 있는 객체라면 무엇이든 보낼 수 있고 [바이너리 데이터](/blog/introducing-socket-io-1-0/#binary)도 지원합니다.

사용자가 메시지를 입력하면 서버가 이 메시지를 `chat message` 이벤트로 받도록 만들어 봅시다. `index.html`의 `script` 부분을 다음과 같이 바꾸세요.

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();

  const form = document.getElementById('form');
  const input = document.getElementById('input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });
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

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });
</script>
```

  </TabItem>
</Tabs>

그리고 `index.js`에서는 `chat message` 이벤트로 받은 메시지를 출력합니다.

```js
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });
});
```

결과는 다음 영상과 같습니다.

<video controls width="100%"><source src="https://i.cloudup.com/transcoded/zboNrGSsai.mp4" /></video>

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step4?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step4?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step4?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step4?file=index.js)


  </TabItem>
</Tabs>

:::
