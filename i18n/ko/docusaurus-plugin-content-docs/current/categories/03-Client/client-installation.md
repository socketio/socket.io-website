---
title: 클라이언트 설치
sidebar_label: 설치
sidebar_position: 1
slug: /client-installation/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::info

현재 최신 릴리스는 2026년 9월에 출시된 `4.8.4`입니다.

변경 사항은 [4.8.4 릴리스 노트](../../changelog/4.8.4.md)에서 확인할 수 있습니다.

:::

## 버전 호환성 {#version-compatibility}

서버와 JS 클라이언트의 호환성 표는 다음과 같습니다.

<table>
    <tr>
        <th rowspan="2">JS 클라이언트 버전</th>
        <th colspan="4">Socket.IO 서버 버전</th>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>예</b></td>
        <td align="center">아니요</td>
        <td align="center">아니요</td>
        <td align="center">아니요</td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">아니요</td>
        <td align="center"><b>예</b></td>
        <td align="center"><b>예</b><sup>1</sup></td>
        <td align="center"><b>예</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">3.x</td>
        <td align="center">아니요</td>
        <td align="center">아니요</td>
        <td align="center"><b>예</b></td>
        <td align="center"><b>예</b></td>
    </tr>
    <tr>
        <td align="center">4.x</td>
        <td align="center">아니요</td>
        <td align="center">아니요</td>
        <td align="center"><b>예</b></td>
        <td align="center"><b>예</b></td>
    </tr>
</table>

[1] 호환됩니다. 단, [allowEIO3: true](../../server-options.md#alloweio3)가 필요합니다.

관련 마이그레이션 가이드를 확인하세요.

- [v2에서 v3으로](../07-Migrations/migrating-from-2-to-3.md)
- [v3에서 v4로](../07-Migrations/migrating-from-3-to-4.md)

## 브라우저 지원 {#browser-support}

Socket.IO는 IE9 이상을 지원합니다. IE 6/7/8은 더 이상 지원하지 않습니다.

브라우저 호환성은 Sauce Labs 플랫폼의 도움을 받아 테스트합니다.

![브라우저 지원 현황](/images/saucelabs.svg)

## 설치 {#installation}

### 독립 실행형 빌드 {#standalone-build}

기본적으로 Socket.IO 서버는 `/socket.io/socket.io.js` 경로로 클라이언트 번들을 제공합니다.

`io`는 전역 변수로 등록됩니다.

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

이 기능이 필요 없다면(아래의 다른 방법 참고) 서버 측에서 끌 수 있습니다.

```js
const { Server } = require("socket.io");

const io = new Server({
  serveClient: false
});
```

### CDN에서 불러오기 {#from-a-cdn}

CDN에서 클라이언트 번들을 불러올 수도 있습니다.

```html
<script src="https://cdn.socket.io/4.8.4/socket.io.min.js" integrity="sha384-fBrXvbDtHoeKWJ/hcA6M+YGueiDW+h45I7V6F2kD1S8bOkrF9rZYPLVkCR6BLR/1" crossorigin="anonymous"></script>
```

다른 CDN에서도 Socket.IO를 제공합니다.

| CDN      | URL                                                                       |
|----------|---------------------------------------------------------------------------|
| cdnjs    | https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.4/socket.io.min.js   |
| jsDelivr | https://cdn.jsdelivr.net/npm/socket.io-client@4.8.4/dist/socket.io.min.js |
| unpkg    | https://unpkg.com/socket.io-client@4.8.4/dist/socket.io.min.js            |

사용할 수 있는 번들은 여러 가지입니다.

| 이름              | 크기             | 설명 |
|:------------------|:-----------------|:------------|
| socket.io.js               | 34.7 kB gzip     | minify하지 않은 버전, [debug](https://www.npmjs.com/package/debug) 포함    |
| socket.io.min.js           | 14.7 kB min+gzip | 프로덕션 버전, [debug](https://www.npmjs.com/package/debug) 제외 |
| socket.io.msgpack.min.js   | 15.3 kB min+gzip | 프로덕션 버전, [debug](https://www.npmjs.com/package/debug) 제외, [msgpack 파서](https://github.com/socketio/socket.io-msgpack-parser) 포함    |

[debug](https://www.npmjs.com/package/debug) 패키지를 사용하면 콘솔에 디버그 정보를 출력할 수 있습니다. 자세한 내용은 [로깅과 디버깅](../01-Documentation/logging-and-debugging.md) 문서를 참고하세요.

개발 중에는 `socket.io.js` 번들을 사용하길 권장합니다. `localStorage.debug = 'socket.io-client:socket'`을 설정하면 클라이언트가 받는 모든 이벤트가 콘솔에 출력됩니다.

프로덕션에서는 debug 패키지를 제외하고 최적화한 빌드인 `socket.io.min.js` 번들을 사용하세요.

### NPM으로 설치 {#from-npm}

Socket.IO 클라이언트는 [webpack](https://webpack.js.org/)이나 [browserify](http://browserify.org/) 같은 번들러와 호환됩니다.

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install socket.io-client
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add socket.io-client
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add socket.io-client
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add socket.io-client
```

  </TabItem>
</Tabs>

클라이언트는 Node.js에서도 실행할 수 있습니다.

참고: 앞서 말한 이유로 브라우저 번들에서 debug를 제외하고 싶을 수 있습니다. webpack을 사용한다면 [webpack-remove-debug](https://github.com/johngodley/webpack-remove-debug)를 쓰면 됩니다.

TypeScript 사용자 참고: 이제 `socket.io-client` 패키지에 타입이 포함되어 있으므로 `@types/socket.io-client`는 더 이상 필요 없습니다. 오히려 다음과 같은 오류가 발생할 수 있습니다.

```
Object literal may only specify known properties, and 'extraHeaders' does not exist in type 'ConnectOpts'
```

## 기타 {#miscellaneous}

### 의존성 트리 {#dependency-tree}

클라이언트를 기본 설치하면 패키지 **9**개가 포함되며, 그중 **5**개는 Socket.IO 팀이 관리합니다.

```
└─┬ socket.io-client@4.8.1
  ├── @socket.io/component-emitter@3.1.2
  ├─┬ debug@4.3.7
  │ └── ms@2.1.3
  ├─┬ engine.io-client@6.6.3
  │ ├── @socket.io/component-emitter@3.1.2 deduped
  │ ├── debug@4.3.7 deduped
  │ ├── engine.io-parser@5.2.3
  │ ├─┬ ws@8.17.1
  │ │ ├── UNMET OPTIONAL DEPENDENCY bufferutil@^4.0.1
  │ │ └── UNMET OPTIONAL DEPENDENCY utf-8-validate@>=5.0.2
  │ └── xmlhttprequest-ssl@2.1.2
  └─┬ socket.io-parser@4.2.4
    ├── @socket.io/component-emitter@3.1.2 deduped
    └── debug@4.3.7 deduped
```

### 전이 의존성 버전 {#transitive-versions}

`engine.io-client` 패키지는 저수준 연결(HTTP 롱 폴링 또는 WebSocket)을 관리하는 엔진을 제공합니다. 함께 보기: [동작 원리](../01-Documentation/how-it-works.md)

| `socket.io-client` 버전 | `engine.io-client` 버전 | `ws` 버전<sup>1</sup> |
|----------------------------|----------------------------|--------------------------|
| `4.8.x`                    | `6.6.x`                    | `8.17.x`                 |
| `4.7.x`                    | `6.5.x`                    | `8.17.x`                 |
| `4.6.x`                    | `6.4.x`                    | `8.11.x`                 |
| `4.5.x`                    | `6.2.x`                    | `8.2.x`                  |
| `4.4.x`                    | `6.1.x`                    | `8.2.x`                  |
| `4.3.x`                    | `6.0.x`                    | `8.2.x`                  |
| `4.2.x`                    | `5.2.x`                    | `7.4.x`                  |
| `4.1.x`                    | `5.1.x`                    | `7.4.x`                  |
| `4.0.x`                    | `5.0.x`                    | `7.4.x`                  |
| `3.1.x`                    | `4.1.x`                    | `7.4.x`                  |
| `3.0.x`                    | `4.0.x`                    | `7.4.x`                  |
| `2.5.x`                    | `3.5.x`                    | `7.5.x`                  |
| `2.4.x`                    | `3.5.x`                    | `7.5.x`                  |

[1] Node.js 사용자에게만 해당합니다. 브라우저에서는 네이티브 WebSocket API를 사용합니다.
