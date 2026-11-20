---
title: "튜토리얼 9단계 - 수평 확장"
sidebar_label: "9단계: 수평 확장"
slug: step-9
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 수평 확장

이제 애플리케이션이 일시적인 네트워크 중단에 잘 대처할 수 있게 되었습니다. 다음으로 수천 개의 클라이언트가 동시에 접속해도 감당할 수 있도록 수평 확장하는 방법을 알아보겠습니다.

:::note

- 수평 확장("스케일 아웃"이라고도 합니다)은 늘어나는 수요에 대응하려고 인프라에 새 서버를 추가하는 것을 말합니다
- 수직 확장("스케일 업"이라고도 합니다)은 기존 인프라에 리소스(처리 능력, 메모리, 스토리지 등)를 더 추가하는 것을 말합니다

:::

첫 단계로 호스트에서 사용할 수 있는 모든 코어를 활용해 보겠습니다. Node.js는 기본적으로 JavaScript 코드를 단일 스레드에서 실행하므로 32코어 CPU에서도 코어 하나만 사용합니다. 다행히 Node.js의 [`cluster` 모듈](https://nodejs.org/api/cluster.html#cluster)을 사용하면 코어마다 워커 스레드를 하나씩 간편하게 만들 수 있습니다.

Socket.IO 서버 간에 이벤트를 전달할 방법도 필요합니다. 이 역할을 하는 구성 요소를 "어댑터(Adapter)"라고 합니다.

<ThemedImage
  alt="'hello' 이벤트가 다른 서버로 전달됩니다"
  sources={{
    light: useBaseUrl('/images/tutorial/adapter.png'),
    dark: useBaseUrl('/images/tutorial/adapter-dark.png'),
  }}
/>

그럼 클러스터 어댑터를 설치해 보겠습니다.

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install @socket.io/cluster-adapter
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add @socket.io/cluster-adapter
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add @socket.io/cluster-adapter
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add @socket.io/cluster-adapter
```

  </TabItem>
</Tabs>

이제 어댑터를 적용합니다.

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js title="index.js"
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
// highlight-start
const { availableParallelism } = require('node:os');
const cluster = require('node:cluster');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');
// highlight-end

if (cluster.isPrimary) {
  // highlight-start
  const numCPUs = availableParallelism();
  // 사용 가능한 코어마다 워커를 하나씩 생성합니다
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: 3000 + i
    });
  }
  
  // 프라이머리 스레드에 어댑터를 설정합니다
  return setupPrimary();
  // highlight-end
}

async function main() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
    // highlight-start
    // 각 워커 스레드에 어댑터를 설정합니다
    adapter: createAdapter()
    // highlight-end
  });

  // [...]

  // highlight-start
  // 워커마다 서로 다른 포트에서 요청을 받습니다
  const port = process.env.PORT;

  server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });
  // highlight-end
}

main();
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js title="index.js"
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
// highlight-start
import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';
// highlight-end

if (cluster.isPrimary) {
  // highlight-start
  const numCPUs = availableParallelism();
  // 사용 가능한 코어마다 워커를 하나씩 생성합니다
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: 3000 + i
    });
  }
  
  // 프라이머리 스레드에 어댑터를 설정합니다
  setupPrimary();
  // highlight-end
} else {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
    // highlight-start
    // 각 워커 스레드에 어댑터를 설정합니다
    adapter: createAdapter()
    // highlight-end
  });

  // [...]

  // highlight-start
  // 워커마다 서로 다른 포트에서 요청을 받습니다
  const port = process.env.PORT;

  server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });
  // highlight-end
}
```

  </TabItem>
</Tabs>

이게 전부입니다! 이제 머신에서 사용할 수 있는 CPU마다 워커 스레드가 하나씩 생성됩니다. 실제로 어떻게 동작하는지 확인해 보겠습니다.

<video controls width="100%"><source src="/videos/tutorial/scaling-up.mp4" /></video>

주소 표시줄에서 볼 수 있듯이 브라우저 탭마다 서로 다른 Socket.IO 서버에 연결되어 있고, 어댑터는 서버 간에 `chat message` 이벤트를 전달하기만 합니다.

:::tip

현재 공식 어댑터는 5가지입니다.

- [Redis 어댑터](../categories/05-Adapters/adapter-redis.md)
- [Redis Streams 어댑터](../categories/05-Adapters/adapter-redis-streams.md)
- [MongoDB 어댑터](../categories/05-Adapters/adapter-mongo.md)
- [Postgres 어댑터](../categories/05-Adapters/adapter-postgres.md)
- [클러스터 어댑터](../categories/05-Adapters/adapter-cluster.md)

이 중에서 필요에 가장 잘 맞는 어댑터를 고르면 됩니다. 다만 일부 어댑터는 연결 상태 복구 기능을 지원하지 않는다는 점에 유의하세요. 자세한 내용은 [호환성 표](../categories/01-Documentation/connection-state-recovery.md#compatibility-with-existing-adapters)를 참고하세요.

:::

:::note

또한 대개는 Socket.IO 세션의 모든 HTTP 요청이 같은 서버에 도달하도록 해야 합니다. 이런 방식을 "스티키 세션(sticky session)"이라고도 합니다. 하지만 여기서는 Socket.IO 서버마다 포트가 따로 있으므로 그럴 필요가 없습니다.

자세한 내용은 [여러 노드 사용하기](../categories/02-Server/using-multiple-nodes.md)를 참고하세요.

:::

이것으로 채팅 앱이 드디어 완성되었습니다! 이 튜토리얼에서는 다음 내용을 살펴봤습니다.

- 클라이언트와 서버 간에 이벤트 보내기
- 연결된 모든 클라이언트 또는 일부 클라이언트에게 이벤트 브로드캐스트하기
- 일시적인 연결 끊김 처리하기
- 수평 확장하기

이제 Socket.IO가 어떤 기능을 제공하는지 전보다 잘 알게 되었을 것입니다. 직접 실시간 애플리케이션을 만들어 볼 차례입니다!

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step9?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step9?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

이 예제는 다음 플랫폼에서 브라우저로 바로 실행해 볼 수 있습니다.

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step9?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step9?file=index.js)
- [Repl.it](https://replit.com/github/socketio/chat-example)


  </TabItem>
</Tabs>

:::
