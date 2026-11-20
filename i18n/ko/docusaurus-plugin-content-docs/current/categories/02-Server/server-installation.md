---
title: 서버 설치
sidebar_label: 설치
sidebar_position: 1
slug: /server-installation/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::info

현재 최신 릴리스는 2026년 9월에 나온 `4.8.4`입니다.

릴리스 노트는 [여기](../../changelog/4.8.4.md)에서 확인할 수 있습니다.

:::

## 사전 준비 {#prerequisites}

시스템에 [Node.js](https://nodejs.org/en/)가 설치되어 있는지 확인하세요. 현재 장기 지원(LTS) 릴리스로 시작하는 것이 가장 좋습니다. 자세한 내용은 [릴리스 일정](https://github.com/nodejs/Release#release-schedule)을 참고하세요.

:::info

Node.js 10 이상이 필요합니다. 그보다 오래된 버전은 더 이상 지원하지 않습니다.

:::

## 설치 {#installation}

최신 릴리스를 설치하려면 다음 명령을 실행하세요.

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install socket.io
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add socket.io
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add socket.io
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add socket.io
```

  </TabItem>
</Tabs>

특정 버전을 설치하려면 다음 명령을 실행하세요.

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install socket.io@version
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add socket.io@version
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add socket.io@version
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add socket.io@version
```

  </TabItem>
</Tabs>

## 추가 패키지 {#additional-packages}

Socket.IO는 기본적으로 [ws](https://www.npmjs.com/package/ws) 패키지가 제공하는 WebSocket 서버를 사용합니다.

ws와 함께 설치할 수 있는 선택 패키지가 2개 있습니다. 두 패키지는 특정 작업의 성능을 높여 주는 바이너리 애드온입니다. 많이 쓰는 플랫폼용으로는 미리 빌드된 바이너리가 제공되므로 C++ 컴파일러를 꼭 설치할 필요는 없습니다.

- [bufferutil](https://www.npmjs.com/package/bufferutil): WebSocket 프레임의 데이터 페이로드를 마스킹하고 언마스킹하는 작업 등을 효율적으로 처리합니다.
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate): 명세에서 요구하는 대로 메시지가 올바른 UTF-8인지 효율적으로 검사합니다.

두 패키지를 설치하려면 다음 명령을 실행하세요.

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install --save-optional bufferutil utf-8-validate
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add --optional bufferutil utf-8-validate
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add -O bufferutil utf-8-validate
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add --optional bufferutil utf-8-validate
```

  </TabItem>
</Tabs>

두 패키지는 선택 사항입니다. 설치하지 않으면 WebSocket 서버는 JavaScript 구현을 대신 사용합니다. 자세한 내용은 [ws 문서](https://github.com/websockets/ws/#opt-in-for-performance-and-spec-compliance)를 참고하세요.

## 다른 WebSocket 서버 구현 {#other-websocket-server-implementations}

ws와 같은 API(특히 [handleUpgrade](https://github.com/websockets/ws/blob/master/doc/ws.md#serverhandleupgraderequest-socket-head-callback) 메서드)를 제공하는 WebSocket 서버 구현이라면 무엇이든 사용할 수 있습니다.

예를 들어 지금은 지원이 중단된 [uws](https://www.npmjs.com/package/uws) 패키지를 포크한 [eiows](https://www.npmjs.com/package/eiows)를 사용할 수 있습니다.

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install eiows
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add eiows
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add eiows
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add eiows
```

  </TabItem>
</Tabs>

그런 다음 `wsEngine` 옵션을 지정하세요.

```js
const { Server } = require("socket.io");
const eiows = require("eiows");

const io = new Server(3000, {
  wsEngine: eiows.Server
});
```

이 구현은 기본 구현보다 성능과 메모리 사용량을 크게 "개선할 수 있지만, 보장하지는 않습니다". 늘 그렇듯 실제 사용 환경에서 직접 벤치마크해 보세요.

## `µWebSockets.js`와 함께 사용하기 {#usage-with-uwebsockets}

[4.4.0](/blog/socket-io-4-4-0/) 버전부터 Socket.IO 서버를 [`µWebSockets.js`](https://github.com/uNetworking/uWebSockets.js) 서버에 연결할 수 있습니다.

설치:

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install uWebSockets.js@uNetworking/uWebSockets.js#v20.52.0
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add uWebSockets.js@uNetworking/uWebSockets.js#v20.52.0
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add uWebSockets.js@uNetworking/uWebSockets.js#v20.52.0
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add uWebSockets.js@uNetworking/uWebSockets.js#v20.52.0
```

  </TabItem>
</Tabs>

사용법:

```js
const { App } = require("uWebSockets.js");
const { Server } = require("socket.io");

const app = App();
const io = new Server();

io.attachApp(app);

io.on("connection", (socket) => {
  // ...
});

app.listen(3000, (token) => {
  if (!token) {
    console.warn("port already in use");
  }
});
```

## Bun과 함께 사용하기 {#usage-with-bun}

`@socket.io/bun-engine` 패키지는 Bun의 속도와 확장성을 활용하도록 만든 Bun 전용 저수준 엔진을 제공합니다.

### 설치 {#installation-1}

```
bun add socket.io @socket.io/bun-engine
```

### 사용법 {#usage}

```js
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";

const io = new Server();

const engine = new Engine({
  path: "/socket.io/",
});

io.bind(engine);

io.on("connection", (socket) => {
  // ...
});

export default {
  port: 3000,
  idleTimeout: 30, // 엔진의 "pingInterval" 옵션(기본값 25초)보다 커야 합니다

  ...engine.handler(),
};
```

:::tip

기존 어댑터를 수정 없이 그대로 사용할 수 있습니다.

:::

## 기타 {#miscellaneous}

### 의존성 트리 {#dependency-tree}

서버를 기본 설치하면 **21**개 패키지가 포함되며, 그중 **6**개는 Socket.IO 팀이 관리합니다.

```
└─┬ socket.io@4.8.1
  ├─┬ accepts@1.3.8
  │ ├─┬ mime-types@2.1.35
  │ │ └── mime-db@1.52.0
  │ └── negotiator@0.6.3
  ├── base64id@2.0.0
  ├─┬ cors@2.8.5
  │ ├── object-assign@4.1.1
  │ └── vary@1.1.2
  ├─┬ debug@4.3.7
  │ └── ms@2.1.3
  ├─┬ engine.io@6.6.4
  │ ├─┬ @types/cors@2.8.17
  │ │ └── @types/node@22.13.9 deduped
  │ ├─┬ @types/node@22.13.9
  │ │ └── undici-types@6.20.0
  │ ├── accepts@1.3.8 deduped
  │ ├── base64id@2.0.0 deduped
  │ ├── cookie@0.7.2
  │ ├── cors@2.8.5 deduped
  │ ├── debug@4.3.7 deduped
  │ ├── engine.io-parser@5.2.3
  │ └─┬ ws@8.17.1
  │   ├── UNMET OPTIONAL DEPENDENCY bufferutil@^4.0.1
  │   └── UNMET OPTIONAL DEPENDENCY utf-8-validate@>=5.0.2
  ├─┬ socket.io-adapter@2.5.5
  │ ├── debug@4.3.7 deduped
  │ └── ws@8.17.1 deduped
  └─┬ socket.io-parser@4.2.4
    ├── @socket.io/component-emitter@3.1.2
    └── debug@4.3.7 deduped
```

:::info

TypeScript 사용자가 라이브러리를 쉽게 쓸 수 있도록 서드파티 패키지의 타입 선언도 함께 들어 있습니다. 대신 패키지 크기가 조금 커집니다. 

함께 보기: https://github.com/microsoft/types-publisher/issues/81#issuecomment-234051345

:::


### 전이 의존성 버전 {#transitive-versions}

`engine.io` 패키지는 저수준 연결(HTTP 롱 폴링 또는 WebSocket)을 관리하는 엔진을 제공합니다.  함께 보기: [동작 원리](../01-Documentation/how-it-works.md)

| `socket.io` 버전 | `engine.io` 버전 | `ws` 버전 |
|---------------------|---------------------|--------------|
| `4.8.x`             | `6.6.x`             | `8.17.x`     |
| `4.7.x`             | `6.5.x`             | `8.17.x`     |
| `4.6.x`             | `6.4.x`             | `8.11.x`     |
| `4.5.x`             | `6.2.x`             | `8.2.x`      |
| `4.4.x`             | `6.1.x`             | `8.2.x`      |
| `4.3.x`             | `6.0.x`             | `8.2.x`      |
| `4.2.x`             | `5.2.x`             | `7.4.x`      |
| `4.1.x`             | `5.1.x`             | `7.4.x`      |
| `4.0.x`             | `5.0.x`             | `7.4.x`      |
| `3.1.x`             | `4.1.x`             | `7.4.x`      |
| `3.0.x`             | `4.0.x`             | `7.4.x`      |
| `2.5.x`             | `3.6.x`             | `7.5.x`      |
| `2.4.x`             | `3.5.x`             | `7.4.x`      |
