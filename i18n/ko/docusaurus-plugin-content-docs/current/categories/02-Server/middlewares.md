---
title: 미들웨어
sidebar_position: 5
slug: /middlewares/
---

미들웨어 함수는 들어오는 연결마다 실행되는 함수입니다.

미들웨어 함수는 다음과 같은 용도로 쓸 수 있습니다.

- 로깅
- 인증 / 권한 확인
- 요청 속도 제한

참고: 이 함수는 연결당 한 번만 실행됩니다. 연결이 여러 HTTP 요청으로 이루어지더라도 마찬가지입니다.

:::info

Express 미들웨어를 찾고 있다면 [이 섹션](#compatibility-with-express-middleware)을 확인하세요.

:::

## 미들웨어 등록하기 {#registering-a-middleware}

미들웨어 함수는 [Socket 인스턴스](server-socket-instance.md)와 바로 다음에 등록된 미들웨어 함수에 접근할 수 있습니다.

```js
io.use((socket, next) => {
  if (isValid(socket.request)) {
    next();
  } else {
    next(new Error("invalid"));
  }
});
```

미들웨어 함수를 여러 개 등록할 수 있으며, 등록한 순서대로 실행됩니다.

```js
io.use((socket, next) => {
  next();
});

io.use((socket, next) => {
  next(new Error("thou shall not pass"));
});

io.use((socket, next) => {
  // 이전 미들웨어가 오류를 반환했으므로 실행되지 않습니다
  next();
});
```

어떤 경우든 반드시 `next()`를 호출하세요. 그렇지 않으면 연결이 정해진 타임아웃이 지나 닫힐 때까지 멈춘 상태로 남습니다.

**중요**: 미들웨어가 실행되는 시점에 Socket 인스턴스는 아직 실제로 연결된 상태가 아닙니다. 따라서 결국 연결에 실패하더라도 `disconnect` 이벤트가 발생하지 않습니다.

예를 들어 클라이언트가 직접 연결을 닫으면 다음과 같이 동작합니다.

```js
// 서버 측
io.use((socket, next) => {
  setTimeout(() => {
    // 클라이언트의 연결이 끊긴 뒤에 next가 호출됩니다
    next();
  }, 1000);

  socket.on("disconnect", () => {
    // 발생하지 않습니다
  });
});

io.on("connection", (socket) => {
  // 발생하지 않습니다
});

// 클라이언트 측
const socket = io();
setTimeout(() => {
  socket.disconnect();
}, 500);
```

## 자격 증명 보내기 {#sending-credentials}

클라이언트는 `auth` 옵션으로 자격 증명을 보낼 수 있습니다.

```js
// 일반 객체
const socket = io({
  auth: {
    token: "abc"
  }
});

// 또는 함수 사용
const socket = io({
  auth: (cb) => {
    cb({
      token: "abc"
    });
  }
});
```

서버 측에서는 [핸드셰이크](server-socket-instance.md#sockethandshake) 객체에서 이 자격 증명에 접근할 수 있습니다.

```js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // ...
});
```

## 미들웨어 오류 처리하기 {#handling-middleware-error}

`next` 메서드를 Error 객체와 함께 호출하면 연결이 거부되고, 클라이언트는 `connect_error` 이벤트를 받습니다.

```js
// 클라이언트 측
socket.on("connect_error", (err) => {
  console.log(err.message); // 오류에 담긴 메시지를 출력합니다
});
```

Error 객체에 세부 정보를 추가로 붙일 수 있습니다.

```js
// 서버 측
io.use((socket, next) => {
  const err = new Error("not authorized");
  err.data = { content: "Please retry later" }; // 추가 세부 정보
  next(err);
});

// 클라이언트 측
socket.on("connect_error", (err) => {
  console.log(err instanceof Error); // true
  console.log(err.message); // not authorized
  console.log(err.data); // { content: "Please retry later" }
});
```

## Express 미들웨어와의 호환성 {#compatibility-with-express-middleware}

Socket.IO 미들웨어는 일반적인 HTTP 요청/응답 주기를 따르지 않으므로 [Express 미들웨어](https://expressjs.com/en/guide/using-middleware.html)와 사실상 호환되지 않습니다.

다만 `4.6.0` 버전부터는 내부 엔진에서 Express 미들웨어를 지원합니다.

```js
io.engine.use((req, res, next) => {
  // 필요한 작업을 하세요

  next();
});
```

이 미들웨어는 업그레이드 요청을 포함해 들어오는 HTTP 요청마다 호출됩니다.

[`express-session`](https://www.npmjs.com/package/express-session)을 사용한 예시:

```js
import session from "express-session";

io.engine.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
```

[`helmet`](https://www.npmjs.com/package/helmet)을 사용한 예시:

```js
import helmet from "helmet";

io.engine.use(helmet());
```

미들웨어를 모든 HTTP 요청이 아니라 핸드셰이크 요청에만 적용해야 한다면 `sid` 쿼리 파라미터가 있는지 확인하면 됩니다.

[`passport-jwt`](https://www.npmjs.com/package/passport-jwt)를 사용한 예시:

```js
io.engine.use((req, res, next) => {
  const isHandshake = req._query.sid === undefined;
  if (isHandshake) {
    passport.authenticate("jwt", { session: false })(req, res, next);
  } else {
    next();
  }
});
```
