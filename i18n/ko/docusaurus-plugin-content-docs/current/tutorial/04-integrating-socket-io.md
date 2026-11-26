---
title: "튜토리얼 3단계 - Socket.IO 통합하기"
sidebar_label: "3단계: Socket.IO 통합하기"
slug: step-3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Socket.IO 통합하기

Socket.IO는 두 부분으로 구성됩니다.

- Node.js HTTP 서버와 통합되는(또는 HTTP 서버에 마운트되는) 서버([`socket.io`](https://www.npmjs.com/package/socket.io) 패키지)
- 브라우저 측에서 로드되는 클라이언트 라이브러리([`socket.io-client`](https://www.npmjs.com/package/socket.io-client) 패키지)

뒤에서 보겠지만 개발 중에는 `socket.io`가 클라이언트를 자동으로 제공하므로 지금은 모듈 하나만 설치하면 됩니다.

```
npm install socket.io
```

이 명령은 모듈을 설치하고 `package.json`에 의존성을 추가합니다. 이제 `index.js`를 수정해 모듈을 추가하세요.

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
// highlight-start
const { Server } = require('socket.io');
// highlight-end

const app = express();
const server = createServer(app);
// highlight-start
const io = new Server(server);
// highlight-end

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// highlight-start
io.on('connection', (socket) => {
  console.log('a user connected');
});
// highlight-end

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
// highlight-start
import { Server } from 'socket.io';
// highlight-end

const app = express();
const server = createServer(app);
// highlight-start
const io = new Server(server);
// highlight-end

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// highlight-start
io.on('connection', (socket) => {
  console.log('a user connected');
});
// highlight-end

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
</Tabs>

`server`(HTTP 서버) 객체를 넘겨 `socket.io`의 새 인스턴스를 만든 부분을 눈여겨보세요. 그리고 `connection` 이벤트를 수신해 소켓이 연결될 때마다 콘솔에 로그를 남깁니다.


이제 index.html의 `</body>`(body 종료 태그) 앞에 다음 코드를 추가하세요.

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

  </TabItem>
  <TabItem value="es5" label="ES5">

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();
</script>
```

  </TabItem>
</Tabs>

이 코드만으로 `socket.io-client`를 로드하고 연결할 수 있습니다. `socket.io-client`는 `GET /socket.io/socket.io.js` 엔드포인트로 제공되며 전역 변수 `io`를 노출합니다.

클라이언트 측 JS 파일을 로컬에서 직접 쓰고 싶다면 `node_modules/socket.io/client-dist/socket.io.js` 파일을 사용하세요.

:::tip

로컬 파일 대신 CDN을 사용할 수도 있습니다(예: `<script src="https://cdn.socket.io/4.8.4/socket.io.min.js"></script>`).

:::

`io()`를 호출할 때 URL을 지정하지 않았다는 점에 유의하세요. `io()`는 기본적으로 페이지를 제공한 호스트에 연결을 시도합니다.

:::note

apache나 nginx 같은 리버스 프록시 뒤에서 실행한다면 [리버스 프록시 문서](/docs/v4/reverse-proxy/)를 참고하세요.

웹사이트의 루트가 *아닌* 폴더(예: `https://example.com/chatapp`)에서 앱을 호스팅한다면 서버와 클라이언트 양쪽에 [path](/docs/v4/server-options/#path)도 지정해야 합니다.

:::

이제 프로세스를 다시 시작하고(Control+C를 누른 뒤 `node index.js`를 다시 실행) 웹 페이지를 새로 고치면 콘솔에 "a user connected"가 출력됩니다.

탭을 여러 개 열어 보세요. 이 메시지가 여러 번 출력됩니다.

<img src="/images/chat-4.png" alt="여러 사용자가 연결되었음을 알리는 메시지가 여러 줄 출력된 콘솔" />

각 소켓은 특별한 `disconnect` 이벤트도 발생시킵니다.

```js
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
```

탭을 여러 번 새로 고치면 이 이벤트가 동작하는 모습을 볼 수 있습니다.

<img src="/images/chat-5.png" alt="여러 사용자가 연결되었다가 연결이 끊겼음을 알리는 메시지가 여러 줄 출력된 콘솔" />

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step3?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step3?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step3?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step3?file=index.js)


  </TabItem>
</Tabs>

:::
