---
title: 튜토리얼 - 소개
sidebar_label: 소개
slug: introduction
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 시작하기

Socket.IO 튜토리얼에 오신 것을 환영합니다!

이 튜토리얼에서는 간단한 채팅 앱을 만듭니다. Node.js나 Socket.IO를 거의 몰라도 따라 할 수 있으므로 수준에 관계없이 누구나 시작하기 좋습니다.

## 소개 {#introduction}

LAMP(PHP)처럼 널리 쓰이는 웹 애플리케이션 스택으로는 채팅 앱을 만들기가 보통 무척 어려웠습니다. 서버에 변경 사항이 있는지 계속 폴링하고 타임스탬프를 추적해야 하며, 속도도 기대보다 훨씬 느립니다.

전통적으로 대부분의 실시간 채팅 시스템은 소켓을 중심으로 설계되었습니다. 소켓은 클라이언트와 서버 사이에 양방향 통신 채널을 제공합니다.

다시 말해 서버가 클라이언트에 메시지를 *푸시*할 수 있습니다. 사용자가 채팅 메시지를 쓰면 서버가 그 메시지를 받아 연결된 다른 모든 클라이언트에 푸시하는 방식입니다.

## 튜토리얼 진행 방법 {#how-to-use-this-tutorial}

### 도구 {#tooling}

간단한 텍스트 편집기든 [VS Code](https://code.visualstudio.com/) 같은 완전한 IDE든 어떤 편집기로도 이 튜토리얼을 진행할 수 있습니다.

각 단계 끝에는 브라우저에서 바로 코드를 실행할 수 있는 온라인 플랫폼([CodeSandbox](https://codesandbox.io)와 [StackBlitz](https://stackblitz.com)) 링크도 있습니다.

![CodeSandbox 플랫폼 스크린샷](/images/codesandbox.png)

### 문법 설정 {#syntax-settings}

Node.js에서 모듈을 가져오는 방법은 두 가지입니다.

- 표준 방식: ECMAScript 모듈(ESM)

```js
import { Server } from "socket.io";
```

참고: https://nodejs.org/api/esm.html

- 레거시 방식: CommonJS

```js
const { Server } = require("socket.io");
```

참고: https://nodejs.org/api/modules.html

Socket.IO는 두 문법을 모두 지원합니다.

:::tip

프로젝트에서는 ESM 문법을 쓰는 것을 권장합니다. 다만 ESM 문법을 지원하지 않는 패키지도 있어서 항상 ESM을 쓸 수 있는 것은 아닙니다.

:::

편의를 위해 튜토리얼 전체에서 코드 블록마다 원하는 문법을 골라 볼 수 있습니다.

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Server } = require("socket.io");
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Server } from "socket.io";
```

  </TabItem>
</Tabs>


준비되었나요? "다음"을 눌러 시작하세요.
