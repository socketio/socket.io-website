---
title: 관리자 UI
sidebar_position: 3
slug: /admin-ui/
---

Socket.IO 관리자 UI를 사용하면 Socket.IO 배포 환경의 상태를 한눈에 파악할 수 있습니다.

소스 코드는 다음 주소에서 볼 수 있습니다: https://github.com/socketio/socket.io-admin-ui/

호스팅 버전 링크: https://admin.socket.io/

## 현재 기능 {#current-features}

- 현재 연결된 서버와 클라이언트 현황

![대시보드 스크린샷](/images/admin-ui-dashboard.png)

- 각 Socket 인스턴스의 세부 정보(활성 전송 방식, 핸드셰이크, 룸 등)

![Socket의 세부 정보를 보여 주는 페이지 스크린샷](/images/admin-ui-socket-details.png)

- 각 룸의 세부 정보

![룸의 세부 정보를 보여 주는 페이지 스크린샷](/images/admin-ui-room-details.png)

- 서버가 보내거나 받은 모든 이벤트의 세부 정보

![이벤트 목록을 보여 주는 페이지 스크린샷](/images/admin-ui-events.png)

- 관리 작업(룸 참여, 룸 나가기, 연결 끊기)

의견이나 제안이 있다면 언제든지 알려 주세요!

## 설치 {#installation}

### 서버 측 {#server-side}

먼저 `@socket.io/admin-ui` 패키지를 설치하세요.

```
npm i @socket.io/admin-ui
```

그런 다음 Socket.IO 서버에서 `instrument` 메서드를 호출하세요.

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(io, {
  auth: false,
  mode: "development",
});

httpServer.listen(3000);
```

이 모듈과 호환되는 서버는 다음과 같습니다.

- Socket.IO v4 서버
- Socket.IO v3 서버(>= 3.1.0). 단, 룸 관련 작업(룸 참여, 룸 나가기, 연결 끊기)은 사용할 수 없습니다

[NestJS](https://docs.nestjs.com/websockets/gateways) 예시:

```ts
import { instrument } from "@socket.io/admin-ui";

@WebSocketGateway()
export class MyGateway {
    // ...
    afterInit() {
        instrument(this.server, {
            auth: false,
            mode: "development",
        });
    }
}
```

### 클라이언트 측 {#client-side}

그런 다음 https://admin.socket.io 사이트에 접속하거나, [여기](https://github.com/socketio/socket.io-admin-ui/tree/main/ui/dist)에 있는 `ui/dist` 폴더의 파일을 직접 호스팅하세요.

**중요**: https://admin.socket.io 사이트는 [Vercel](https://vercel.com)에서 호스팅하는 완전한 정적 사이트입니다. Socket.IO 팀은 사용자나 브라우저에 관한 어떤 정보도 저장하지 않으며 앞으로도 저장하지 않습니다(추적이나 분석 등도 하지 않습니다). 물론 파일을 직접 호스팅해도 전혀 문제없습니다.

다음과 같은 모달이 표시됩니다.

![로그인 모달 스크린샷](/images/admin-ui-login-modal.png)

서버의 URL(예: `http://localhost:3000`, `https://example.com`)을 입력하고, 필요하면 자격 증명도 입력하세요([아래](#auth)의 `auth` 옵션 참고).

### 사용 가능한 옵션 {#available-options}

#### `auth` {#auth}

기본값: `-`

이 옵션은 필수입니다. 인증을 끌 수도 있습니다. 다만 주의해서 사용하세요.

```js
instrument(io, {
  auth: false
});
```

또는 기본 인증(basic authentication)을 사용할 수 있습니다.

```js
instrument(io, {
  auth: {
    type: "basic",
    username: "admin",
    password: "$2b$10$heqvAkYMez.Va6Et2uXInOnkCT6/uQj1brkrbyG3LpopDklcq7ZOS" // bcrypt로 암호화한 "changeit"
  },
});
```

:::caution

참고로 `bcrypt` 패키지는 현재 `$2y$` 접두사로 시작하는 해시를 지원하지 않습니다. 이 접두사는 일부 BCrypt 구현(예: https://bcrypt-generator.com/, https://www.bcrypt.fr/)에서 사용합니다. 해시가 유효한지는 다음과 같이 확인할 수 있습니다.

```
$ node
> require("bcryptjs").compareSync("<the password>", "<the hash>")
true
```

유효한 해시는 다음과 같이 생성할 수 있습니다.

```
$ node
> require("bcryptjs").hashSync("changeit", 10)
'$2b$10$LQUE...'
```

함께 보기:

- https://github.com/kelektiv/node.bcrypt.js/issues/849
- https://stackoverflow.com/a/36225192/5138796

:::

#### `namespaceName` {#namespacename}

기본값: `/admin`

관리 작업 처리용으로 생성되는 네임스페이스의 이름입니다.

```js
instrument(io, {
  namespaceName: "/custom"
});
```

이 네임스페이스는 일반적인 Socket.IO 네임스페이스이므로 다음과 같이 접근할 수 있습니다.

```js
const adminNamespace = io.of("/admin");
```

자세한 내용은 [네임스페이스](namespaces.md) 문서를 참고하세요.

#### `readonly` {#readonly}

기본값: `false`

관리자 UI를 읽기 전용 모드로 둘지 여부입니다. 읽기 전용 모드에서는 룸 참여, 룸 나가기, 연결 끊기를 할 수 없습니다.

```js
instrument(io, {
  readonly: true
});
```

#### `serverId` {#serverid}

기본값: `require("os").hostname()`

이 서버의 ID입니다. 같은 머신에서 Socket.IO 서버를 여러 개 실행한다면 서버마다 다른 ID를 지정해야 합니다.

```js
instrument(io, {
  serverId: `${require("os").hostname()}#${process.pid}`
});
```

#### `store` {#store}

기본값: `new InMemoryStore()`

저장소(store)는 세션 ID를 저장합니다. 덕분에 사용자는 재연결할 때 자격 증명을 다시 입력하지 않아도 됩니다.

여러 서버로 구성된 환경에서 기본 인증을 사용한다면 커스텀 저장소를 지정해야 합니다.

```js
const { instrument, RedisStore } = require("@socket.io/admin-ui");

instrument(io, {
  store: new RedisStore(redisClient)
});
```

#### `mode` {#mode}

기본값: `development`

프로덕션 모드에서는 서버가 Socket 인스턴스와 룸의 세부 정보를 모두 보내지는 않으므로, 계측(instrumentation)에 드는 메모리 사용량이 줄어듭니다.

```js
instrument(io, {
  mode: "production"
});
```

NODE_ENV 환경 변수로도 프로덕션 모드를 켤 수 있습니다.

```
NODE_ENV=production node index.js
```

## 동작 방식 {#how-it-works}

소스 코드는 다음 주소에서 볼 수 있습니다: https://github.com/socketio/socket.io-admin-ui/

`instrument` 메서드는 다음 작업만 합니다.

- [네임스페이스](namespaces.md)를 생성하고, 필요하면 인증 [미들웨어](../02-Server/middlewares.md)를 추가합니다
- Socket 인스턴스를 추적하려고 기존의 모든 네임스페이스에 `connection`, `disconnect` 이벤트 리스너를 등록합니다
- 서버의 통계를 주기적으로 UI에 보내는 타이머를 등록합니다
- UI에서 보낸 `join`, `leave`, `_disconnect` 명령을 처리하는 핸들러를 등록합니다

## 최신 릴리스 {#latest-releases}

- `0.5.1` (2022년 10월): [GitHub 릴리스](https://github.com/socketio/socket.io-admin-ui/releases/tag/0.5.1) / [비교](https://github.com/socketio/socket.io-admin-ui/compare/0.5.0...0.5.1)
- `0.5.0` (2022년 9월): [GitHub 릴리스](https://github.com/socketio/socket.io-admin-ui/releases/tag/0.5.0) / [비교](https://github.com/socketio/socket.io-admin-ui/compare/0.4.0...0.5.0)
- `0.4.0` (2022년 6월): [GitHub 릴리스](https://github.com/socketio/socket.io-admin-ui/releases/tag/0.4.0) / [비교](https://github.com/socketio/socket.io-admin-ui/compare/0.3.0...0.4.0)
