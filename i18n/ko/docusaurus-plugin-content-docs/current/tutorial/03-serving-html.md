---
title: "튜토리얼 2단계 - HTML 제공하기"
sidebar_label: "2단계: HTML 제공하기"
slug: step-2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# HTML 제공하기

지금까지는 `index.js`에서 `res.send`를 호출하면서 HTML 문자열을 넘겼습니다. 애플리케이션의 HTML을 모두 `res.send`에 넣으면 코드를 알아보기 어려워지므로, `index.html` 파일을 따로 만들어 제공하겠습니다.

라우트 핸들러가 `sendFile`을 사용하도록 리팩터링하세요.

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const express = require('express');
const { createServer } = require('node:http');
// highlight-start
const { join } = require('node:path');
// highlight-end

const app = express();
const server = createServer(app);

// highlight-start
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
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
// highlight-start
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
// highlight-end

const app = express();
const server = createServer(app);

// highlight-start
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});
// highlight-end

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
</Tabs>

`index.html` 파일에 다음 내용을 넣으세요.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Socket.IO chat</title>
    <style>
      body { margin: 0; padding-bottom: 3rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

      #form { background: rgba(0, 0, 0, 0.15); padding: 0.25rem; position: fixed; bottom: 0; left: 0; right: 0; display: flex; height: 3rem; box-sizing: border-box; backdrop-filter: blur(10px); }
      #input { border: none; padding: 0 1rem; flex-grow: 1; border-radius: 2rem; margin: 0.25rem; }
      #input:focus { outline: none; }
      #form > button { background: #333; border: none; padding: 0 1rem; margin: 0.25rem; border-radius: 3px; outline: none; color: #fff; }

      #messages { list-style-type: none; margin: 0; padding: 0; }
      #messages > li { padding: 0.5rem 1rem; }
      #messages > li:nth-child(odd) { background: #efefef; }
    </style>
  </head>
  <body>
    <ul id="messages"></ul>
    <form id="form" action="">
      <input id="input" autocomplete="off" /><button>Send</button>
    </form>
  </body>
</html>
```

프로세스를 다시 시작하고(Control+C를 누른 뒤 `node index.js`를 다시 실행) 페이지를 새로 고치면 다음과 같이 보입니다.

<img src="/images/chat-3.png" alt="입력란과 'Send' 버튼을 표시한 브라우저" />

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step2?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step2?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step2?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step2?file=index.js)


  </TabItem>
</Tabs>

:::
