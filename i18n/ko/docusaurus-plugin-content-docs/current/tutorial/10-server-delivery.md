---
title: "튜토리얼 7단계 - 서버 측 전달"
sidebar_label: "7단계: 서버 측 전달"
slug: step-7
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 서버 측 전달

재연결할 때 클라이언트 상태를 동기화하는 방법은 보통 두 가지입니다.

- 서버가 전체 상태를 보내는 방법
- 클라이언트가 마지막으로 처리한 이벤트를 기록해 두고, 서버가 빠진 부분만 보내는 방법

둘 다 올바른 방법이며 어느 쪽을 고를지는 사용 사례에 따라 다릅니다. 이 튜토리얼에서는 두 번째 방법을 사용합니다.

먼저 채팅 앱의 메시지를 영구 저장해 보겠습니다. 요즘은 저장소로 쓸 좋은 선택지가 많지만, 여기서는 [SQLite](https://www.sqlite.org/)를 사용합니다.

:::tip

SQLite가 익숙하지 않다면 [이 튜토리얼](https://www.sqlitetutorial.net/)처럼 온라인에서 볼 수 있는 자료가 많습니다.

:::

필요한 패키지를 설치하세요.

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install sqlite sqlite3
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add sqlite sqlite3
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add sqlite sqlite3
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add sqlite sqlite3
```

  </TabItem>
</Tabs>

여기서는 단순하게 각 메시지를 SQL 테이블에 저장합니다.

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js title="index.js"
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
// highlight-start
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
// highlight-end

async function main() {
  // highlight-start
  // 데이터베이스 파일을 엽니다
  const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  // 'messages' 테이블을 만듭니다 (지금은 'client_offset' 컬럼을 무시해도 됩니다)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content TEXT
    );
  `);
  // highlight-end

  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {}
  });

  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });

  io.on('connection', (socket) => {
    socket.on('chat message', async (msg) => {
      // highlight-start
      let result;
      try {
        // 메시지를 데이터베이스에 저장합니다
        result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
      } catch (e) {
        // TODO 실패 처리
        return;
      }
      // 메시지와 함께 오프셋을 보냅니다
      io.emit('chat message', msg, result.lastID);
      // highlight-end
    });
  });

  server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
  });
}

main();
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js title="index.js"
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
// highlight-start
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// 데이터베이스 파일을 엽니다
const db = await open({
  filename: 'chat.db',
  driver: sqlite3.Database
});

// 'messages' 테이블을 만듭니다 (지금은 'client_offset' 컬럼을 무시해도 됩니다)
await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
  );
`);
// highlight-end

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', async (msg) => {
    // highlight-start
    let result;
    try {
      // 메시지를 데이터베이스에 저장합니다
      result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
    } catch (e) {
      // TODO 실패 처리
      return;
    }
    // 메시지와 함께 오프셋을 보냅니다
    io.emit('chat message', msg, result.lastID);
    // highlight-end
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

  </TabItem>
</Tabs>

그런 다음 클라이언트가 오프셋(offset)을 기록해 두도록 합니다.

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html title="index.html"
<script>
  // highlight-start
  const socket = io({
    auth: {
      serverOffset: 0
    }
  });
  // highlight-end

  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  // highlight-next-line
  socket.on('chat message', (msg, serverOffset) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    // highlight-next-line
    socket.auth.serverOffset = serverOffset;
  });
</script>
```

  </TabItem>
  <TabItem value="es5" label="ES5">

```html title="index.html"
<script>
  // highlight-start
  var socket = io({
    auth: {
      serverOffset: 0
    }
  });
  // highlight-end

  var form = document.getElementById('form');
  var input = document.getElementById('input');
  var messages = document.getElementById('messages');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  // highlight-next-line
  socket.on('chat message', function(msg, serverOffset) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    // highlight-next-line
    socket.auth.serverOffset = serverOffset;
  });
</script>
```

  </TabItem>
</Tabs>

마지막으로 클라이언트가 연결되거나 재연결되면 서버가 빠진 메시지를 보내도록 합니다.

```js title="index.js"
// [...]

io.on('connection', async (socket) => {
  socket.on('chat message', async (msg) => {
    let result;
    try {
      result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
    } catch (e) {
      // TODO 실패 처리
      return;
    }
    io.emit('chat message', msg, result.lastID);
  });

  // highlight-start
  if (!socket.recovered) {
    // 연결 상태 복구에 실패한 경우
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
  // highlight-end
});

// [...]
```

실제로 어떻게 동작하는지 확인해 보겠습니다.

<video controls width="100%"><source src="/videos/tutorial/server-delivery.mp4" /></video>

위 영상에서 볼 수 있듯이 일시적으로 연결이 끊겼을 때와 페이지를 완전히 새로 고쳤을 때 모두 잘 동작합니다.

:::tip

"연결 상태 복구" 기능은 이 단계의 방법과 달리 복구에 성공하면 메인 데이터베이스를 조회하지 않아도 될 수 있습니다. 예를 들어 Redis 스트림에서 메시지를 가져올 수도 있습니다.

:::

이제 클라이언트 측 전달을 알아보겠습니다.
