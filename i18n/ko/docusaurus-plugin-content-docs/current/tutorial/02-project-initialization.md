---
title: "튜토리얼 1단계 - 프로젝트 초기화"
sidebar_label: "1단계: 프로젝트 초기화"
slug: step-1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 프로젝트 초기화

첫 번째 목표는 폼과 메시지 목록을 보여 주는 간단한 HTML 웹 페이지를 만드는 것입니다. 여기에는 Node.js 웹 프레임워크인 `express`를 사용합니다. [Node.js](https://nodejs.org)가 설치되어 있는지 확인하세요.

먼저 프로젝트를 설명하는 `package.json` 매니페스트 파일을 만드세요. 이 파일은 프로젝트 전용 빈 디렉터리에 두기를 권장합니다. 여기서는 디렉터리 이름을 `socket-chat-example`로 정했습니다.

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```json
{
  "name": "socket-chat-example",
  "version": "0.0.1",
  "description": "my first socket.io app",
  "type": "commonjs",
  "dependencies": {}
}
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```json
{
  "name": "socket-chat-example",
  "version": "0.0.1",
  "description": "my first socket.io app",
  "type": "module",
  "dependencies": {}
}
```

  </TabItem>
</Tabs>

:::caution

"name" 속성은 고유해야 합니다. "socket.io"나 "express" 같은 이름을 쓰면 의존성을 설치할 때 npm이 오류를 냅니다.

:::

이제 `npm install`을 사용해 필요한 패키지를 `dependencies` 속성에 쉽게 추가해 보겠습니다.

```
npm install express@4
```

설치가 끝나면 애플리케이션을 설정할 `index.js` 파일을 만드세요.

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require('express');
const { createServer } = require('node:http');

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import express from 'express';
import { createServer } from 'node:http';

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
</Tabs>

이 코드는 다음과 같이 동작합니다.

- Express가 `app`을 초기화합니다. `app`은 HTTP 서버에 넘길 수 있는 함수 핸들러입니다(5번째 줄 참고).
- `/` 경로(웹사이트 홈)에 접속하면 호출되는 라우트 핸들러를 정의합니다.
- HTTP 서버가 3000번 포트에서 수신 대기하도록 합니다.

`node index.js`를 실행하면 다음과 같이 출력됩니다.

<img src="/images/chat-1.png" alt="서버가 3000번 포트에서 수신 대기를 시작했다고 알려 주는 콘솔" />

브라우저에서 `http://localhost:3000`을 열면 다음과 같이 보입니다.

<img src="/images/chat-2.png" alt="'Hello World'를 큰 글씨로 표시한 브라우저" />

여기까지는 순조롭습니다!

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step1?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step1?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step1?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step1?file=index.js)


  </TabItem>
</Tabs>

:::
