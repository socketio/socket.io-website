---
title: 클라이언트 초기화
sidebar_label: 초기화
sidebar_position: 2
slug: /client-initialization/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Socket.IO 클라이언트 라이브러리를 [설치](client-installation.md)했다면 이제 클라이언트를 초기화할 수 있습니다. 전체 옵션 목록은 [클라이언트 옵션](../../client-options.md) 문서를 참고하세요.

:::tip

TypeScript 사용자는 이벤트에 타입 힌트를 지정할 수 있습니다. 자세한 내용은 [TypeScript 문서](../01-Documentation/typescript.md)를 참고하세요.

:::

아래 예시에서 `io` 객체는 다음 중 하나로 가져옵니다.

- `<script>` 태그로 불러오기

```html
<script src="/socket.io/socket.io.js"></script>
```

- ESM으로 불러오기

```html
<script type="module">
  import { io } from "https://cdn.socket.io/4.8.4/socket.io.esm.min.js";
</script>
```

- NPM 패키지로 불러오기

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { io } = require("socket.io-client");
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { io } from "socket.io-client";
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { io } from "socket.io-client";
```

  </TabItem>
</Tabs>

## 같은 도메인에서 연결하기 {#from-the-same-domain}

프런트엔드를 서버와 같은 도메인에서 제공한다면 다음과 같이 간단히 쓰면 됩니다.

```js
const socket = io();
```

서버 URL은 [window.location](https://developer.mozilla.org/en-US/docs/Web/API/Window/location) 객체에서 추론합니다.

## 다른 도메인에서 연결하기 {#from-a-different-domain}

프런트엔드를 서버와 다른 도메인에서 제공한다면 서버 URL을 전달해야 합니다.

```js
const socket = io("https://server-domain.com");
```

이 경우 서버에서 반드시 [CORS(Cross-Origin Resource Sharing)](../02-Server/handling-cors.md)를 활성화하세요.

:::info

`https`와 `wss` 중 어느 쪽을 써도 됩니다(`http`와 `ws`도 마찬가지입니다).

:::

```js
// 다음 형태는 모두 비슷합니다
const socket = io("https://server-domain.com");
const socket = io("wss://server-domain.com");
const socket = io("server-domain.com"); // 페이지가 https로 제공될 때 브라우저에서만 동작합니다(Node.js에서는 동작하지 않음)
```

## 커스텀 네임스페이스 {#custom-namespace}

위 예시에서 클라이언트는 메인 네임스페이스에 연결합니다. 대부분의 경우 메인 네임스페이스만으로 충분하지만, 다음과 같이 네임스페이스를 지정할 수도 있습니다.

```js
// 같은 출처인 경우
const socket = io("/admin");
// 다른 출처인 경우
const socket = io("https://server-domain.com/admin");
```

자세한 내용은 [네임스페이스](../06-Advanced/namespaces.md) 문서를 참고하세요.

## 옵션 {#options}

사용할 수 있는 전체 옵션 목록은 [클라이언트 옵션](../../client-options.md) 문서를 참고하세요.
