---
title: CORS 처리하기
sidebar_position: 8
slug: /handling-cors/
---

## CORS란? {#what-is-cors}

참고: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS

교차 출처 리소스 공유(Cross-Origin Resource Sharing, CORS)는 웹 브라우저가 적용하는 보안 기능입니다. 웹 애플리케이션이 실행 중인 출처가 아닌
다른 출처에서 리소스를 어떻게 가져올 수 있는지 제어합니다. "출처(origin)"는 스킴(`https://` 등), 도메인, 포트의
조합으로 정해집니다.

- `https://example.com`과 `http://example.com`은 프로토콜이 다르므로 서로 다른 출처입니다.
- `https://api.example.com`과 `https://example.com`은 도메인이 다르므로 서로 다른 출처입니다.
- `https://example.com:8080`과 `https://example.com`은 포트가 다르므로 서로 다른 출처입니다.

기본적으로 브라우저는 한 출처에서 실행 중인 JavaScript가 다른 출처에 호스팅된 리소스로 보내는 요청을 차단합니다.
서버가 명시적으로 허용한 경우만 예외입니다. 이 제한은 악성 스크립트가 다른 사이트의
민감한 데이터에 접근하지 못하도록 막기 위한 것입니다.

예를 들어 웹사이트 `https://good-domain.com`의 사용자가 사기성 이메일 링크를 클릭해
`https://bad-domain.com`으로 이동했다고 가정해 보겠습니다. CORS 덕분에 사용자의 브라우저는 이 사이트에서 `https://good-domain.com`으로 향하는
요청을 모두 차단합니다. 따라서 `https://bad-domain.com`에 있는 악성 스크립트는
사용자를 대신해 웹사이트에서 데이터를 빼내거나 어떤 동작도 실행할 수 없습니다.

하지만 다른 출처(cross-origin)의 요청을 실제로 허용해야 하는 경우도 흔합니다. 예를 들면 다음과 같습니다.

- 백엔드가 다른 서브도메인에 호스팅된 경우(예: 프런트엔드는 `https://example.com`, 백엔드는 `https://api.example.com`)
- 로컬 개발 환경(예: 프런트엔드는 `http://localhost:3000`, 백엔드는 `http://localhost:8080`)

[`cors`](../../server-options.md#cors) 옵션으로 이런 경우를 처리할 수 있습니다. [아래](#configuration)를 참고하세요.

:::caution

중요한 주의 사항이 두 가지 있습니다.

- CORS는 브라우저에만 적용됩니다

CORS를 제대로 설정했더라도 공격자는 자신의 컴퓨터나 VM에서 스크립트를 실행해 웹사이트에 접근할 수 있습니다. 네이티브 애플리케이션도 CORS의 적용을 받지 않습니다.

- CORS는 HTTP 롱 폴링에만 적용됩니다

WebSocket 연결은 CORS 제한을 받지 않습니다.

누가 웹사이트에 실제로 접근할 수 있는지 제한하려면 [`allowRequest`](../../server-options.md#allowrequest) 옵션을 사용하세요.

:::

## 설정 {#configuration}

Socket.IO v3부터는 [교차 출처 리소스 공유](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)(CORS)를 명시적으로 활성화해야 합니다.

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com"]
  }
});
```

사용할 수 있는 옵션:

| 옵션                   | 설명                                                                                                                                                                                                                                                                                                               |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `origin`               | **Access-Control-Allow-Origin** CORS 헤더를 설정합니다.                                                                                                                                                                                                                                                            |
| `methods`              | **Access-Control-Allow-Methods** CORS 헤더를 설정합니다. 쉼표로 구분한 문자열(예: 'GET,PUT,POST') 또는 배열(예: `['GET', 'PUT', 'POST']`)을 받습니다.                                                                                                                                                             |
| `allowedHeaders`       | **Access-Control-Allow-Headers** CORS 헤더를 설정합니다. 쉼표로 구분한 문자열(예: 'Content-Type,Authorization') 또는 배열(예: `['Content-Type', 'Authorization']`)을 받습니다. 지정하지 않으면 요청의 **Access-Control-Request-Headers** 헤더에 나열된 헤더를 그대로 반영합니다.                                 |
| `exposedHeaders`       | **Access-Control-Expose-Headers** CORS 헤더를 설정합니다. 쉼표로 구분한 문자열(예: 'Content-Range,X-Content-Range') 또는 배열(예: `['Content-Range', 'X-Content-Range']`)을 받습니다. 지정하지 않으면 커스텀 헤더를 노출하지 않습니다.                                                                            |
| `credentials`          | **Access-Control-Allow-Credentials** CORS 헤더를 설정합니다. `true`로 설정하면 헤더를 전달하고, 그렇지 않으면 생략합니다.                                                                                                                                                                                         |
| `maxAge`               | **Access-Control-Max-Age** CORS 헤더를 설정합니다. 정수로 설정하면 헤더를 전달하고, 그렇지 않으면 생략합니다.                                                                                                                                                                                                     |
| `preflightContinue`    | CORS 프리플라이트 응답을 다음 핸들러로 넘깁니다.                                                                                                                                                                                                                                                                   |
| `optionsSuccessStatus` | 일부 구형 브라우저(IE11, 여러 스마트 TV)는 `204`를 제대로 처리하지 못하므로, 성공한 `OPTIONS` 요청에 사용할 상태 코드를 지정합니다.                                                                                                                                                                                 |

`origin` 옵션에 설정할 수 있는 값:

- `Boolean` - `origin`을 `true`로 설정하면 `req.header('Origin')`으로 정의되는 [요청 출처](http://tools.ietf.org/html/draft-abarth-origin-09)를 그대로 반영하고, `false`로 설정하면 CORS를 비활성화합니다.
- `String` - `origin`을 특정 출처로 설정합니다. 예를 들어 `"http://example.com"`으로 설정하면 "http://example.com"에서 온 요청만 허용합니다.
- `RegExp` - `origin`을 요청 출처를 검사할 정규 표현식 패턴으로 설정합니다. 패턴과 일치하면 요청 출처를 그대로 반영합니다. 예를 들어 `/example\.com$/` 패턴은 "example.com"으로 끝나는 출처에서 온 모든 요청을 반영합니다.
- `Array` - `origin`을 유효한 출처의 배열로 설정합니다. 각 출처는 `String`이나 `RegExp`일 수 있습니다. 예를 들어 `["http://example1.com", /\.example2\.com$/]`는 "http://example1.com"이나 "example2.com"의 서브도메인에서 온 모든 요청을 허용합니다.
- `Function` - `origin`을 커스텀 로직을 구현한 함수로 설정합니다. 이 함수는 첫 번째 매개변수로 요청 출처를, 두 번째 매개변수로 콜백을 받습니다. 콜백의 시그니처는 `err [object], allow [bool]`입니다.

쿠키([withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials))와 추가 헤더를 사용하는 예시:

```js
// 서버 측
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// 클라이언트 측
import { io } from "socket.io-client";
const socket = io("https://api.example.com", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});
```

참고: 웹 애플리케이션과 서버가 같은 포트에서 제공되지 않는다면 localhost에서도 CORS가 똑같이 적용됩니다.

```js
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:8080"]
  }
});

httpServer.listen(3000);
```

[`allowRequest`](../../server-options.md#allowrequest) 옵션으로 다른 출처의 요청을 모두 막을 수 있습니다.

```js
const io = new Server(httpServer, {
  allowRequest: (req, callback) => {
    const noOriginHeader = req.headers.origin === undefined;
    callback(null, noOriginHeader); // 'origin' 헤더가 없는 요청만 허용합니다
  }
});
```

## 문제 해결 {#troubleshooting}

### CORS header ‘Access-Control-Allow-Origin’ missing {#cors-header-access-control-allow-origin-missing}

전체 오류 메시지:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at .../socket.io/?EIO=4&transport=polling&t=NMnp2WI. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing).</i>

서버를 제대로 설정했다면([위](#configuration) 참고) 브라우저가 Socket.IO 서버에 접근하지 못했다는 뜻일 수 있습니다.

다음 명령은

```
curl "https://api.example.com/socket.io/?EIO=4&transport=polling"
```

아래와 비슷한 결과를 반환해야 합니다.

```
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}
```

그렇지 않다면 서버가 지정한 포트에서 수신 대기 중인지, 그 포트로 실제로 접근할 수 있는지 확인하세요.

### Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’ {#credential-is-not-supported-if-the-cors-header-access-control-allow-origin-is-}

전체 오류 메시지:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ‘.../socket.io/?EIO=4&transport=polling&t=NvQfU77’. (Reason: Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’)</i>

`origin: *` 설정에서는 [`withCredentials`](../../client-options.md#withcredentials)를 `true`로 설정할 수 없습니다. 특정 출처를 지정해야 합니다.

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["https://my-frontend.com"],
    credentials: true
  }
});
```

### Expected ‘true’ in CORS header ‘Access-Control-Allow-Credentials’ {#expected-true-in-cors-header-access-control-allow-credentials}

전체 오류 메시지:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at .../socket.io/?EIO=4&transport=polling&t=NvQny19. (Reason: expected ‘true’ in CORS header ‘Access-Control-Allow-Credentials’)</i>

이 경우는 클라이언트에서 [`withCredentials`](../../client-options.md#withcredentials)를 `true`로 설정했지만, 서버의 [`cors`](../../server-options.md#cors) 옵션에 `credentials` 속성이 빠져 있는 상황입니다. 위의 예시를 참고하세요.
