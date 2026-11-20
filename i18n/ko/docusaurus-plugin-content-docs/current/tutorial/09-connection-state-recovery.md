---
title: "튜토리얼 6단계 - 연결 상태 복구"
sidebar_label: "6단계: 연결 상태 복구"
slug: step-6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 연결 상태 복구

먼저 연결이 끊긴 적이 없었던 것처럼 만들어서 연결 끊김을 처리해 보겠습니다. 이 기능을 "연결 상태 복구(Connection state recovery)"라고 합니다.

이 기능은 서버가 보낸 모든 이벤트를 **일시적으로** 저장해 두었다가, 클라이언트가 재연결하면 그 클라이언트의 상태를 다음과 같이 복구하려고 시도합니다.

- 클라이언트가 속해 있던 룸을 복원합니다
- 놓친 이벤트를 보냅니다

이 기능은 서버 측에서 활성화해야 합니다.

```js title="index.js"
const io = new Server(server, {
  // highlight-start
  connectionStateRecovery: {}
  // highlight-end
});
```

실제로 어떻게 동작하는지 확인해 보겠습니다.

<video controls width="100%"><source src="/videos/tutorial/connection-state-recovery.mp4" /></video>

위 영상에서 볼 수 있듯이 다시 연결되면 "realtime" 메시지가 결국 전달됩니다.

:::note

"Disconnect" 버튼은 시연을 위해 추가했습니다.

<details className="changelog">
    <summary>코드</summary>

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html
<form id="form" action="">
  <input id="input" autocomplete="off" /><button>Send</button>
  // highlight-start
  <button id="toggle-btn">Disconnect</button>
  // highlight-end
</form>

<script>
  // highlight-start
  const toggleButton = document.getElementById('toggle-btn');

  toggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (socket.connected) {
      toggleButton.innerText = 'Connect';
      socket.disconnect();
    } else {
      toggleButton.innerText = 'Disconnect';
      socket.connect();
    }
  });
  // highlight-end
</script>
```

  </TabItem>
  <TabItem value="es5" label="ES5">

```html
<form id="form" action="">
  <input id="input" autocomplete="off" /><button>Send</button>
  // highlight-start
  <button id="toggle-btn">Disconnect</button>
  // highlight-end
</form>

<script>
  // highlight-start
  var toggleButton = document.getElementById('toggle-btn');

  toggleButton.addEventListener('click', function(e) {
    e.preventDefault();
    if (socket.connected) {
      toggleButton.innerText = 'Connect';
      socket.disconnect();
    } else {
      toggleButton.innerText = 'Disconnect';
      socket.connect();
    }
  });
  // highlight-end
</script>
```

  </TabItem>
</Tabs>
</details>

:::

좋습니다! 그런데 이런 의문이 들 수 있습니다.

> 이렇게 좋은 기능인데 왜 기본으로 켜져 있지 않을까요?

여기에는 몇 가지 이유가 있습니다.

- 항상 동작하지는 않습니다. 예를 들어 서버가 갑자기 다운되거나 재시작되면 클라이언트 상태가 저장되지 않을 수 있습니다
- 서버를 확장할 때는 이 기능을 활성화할 수 없는 경우도 있습니다

:::tip

그렇긴 해도 유용한 기능인 것은 분명합니다. 사용자가 WiFi에서 4G로 전환할 때처럼 일시적으로 연결이 끊긴 뒤에 클라이언트 상태를 따로 동기화하지 않아도 되기 때문입니다.

:::

다음 단계에서는 좀 더 일반적인 해결 방법을 살펴보겠습니다.

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step6?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step6?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step6?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step6?file=index.js)


  </TabItem>
</Tabs>

:::
