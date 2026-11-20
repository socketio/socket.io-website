---
title: 로깅과 디버깅
sidebar_position: 5
slug: /logging-and-debugging/
---

이제 Socket.IO의 모든 코드에는 TJ Holowaychuk이 만든 [debug](https://github.com/visionmedia/debug)가 적용되어 있습니다. debug는 단순하지만 강력한 유틸리티입니다.

1.0 이전에는 Socket.IO 서버가 기본적으로 모든 내용을 콘솔에 출력했습니다. 이 방식이 아주 유용한 사용자도 있었지만 많은 사용자에게는 성가실 정도로 출력이 많았습니다. 그래서 지금은 기본적으로 아무것도 출력하지 않습니다.

Socket.IO가 사용하는 모듈마다 디버깅 범위(scope)가 따로 있어서 내부 동작을 들여다볼 수 있습니다. 기본적으로 모든 출력은 꺼져 있으며, `DEBUG` 환경 변수(Node.js)나 `localStorage.debug` 속성(브라우저)을 지정하면 메시지를 볼 수 있습니다.

예를 들어 Socket.IO 홈페이지에서 실제로 동작하는 모습을 볼 수 있습니다.

<video controls id="debugging-vid" data-setup='{"autoplay":true,"loop":true, "techOrder": ["html5", "flash"], "height": 300}' class="video-js vjs-default-skin" autoplay loop width="100%"><source src="https://i.cloudup.com/transcoded/IL9alTr0eO.mp4" type="video/mp4" /></video>

## 사용할 수 있는 디버깅 범위 {#available-debugging-scopes}

어떤 정보를 볼 수 있는지 확인하려면 `*`를 사용하는 것이 가장 좋습니다.

```
DEBUG=* node yourfile.js
```

브라우저에서는 다음과 같이 합니다.

```
localStorage.debug = '*';
```

그런 다음 관심 있는 범위로 걸러 내세요. `*` 앞에 범위 이름을 붙여 지정하며, 범위가 여러 개면 쉼표로 구분합니다. 예를 들어 Node.js에서 socket.io 클라이언트의 디버그 메시지만 보려면 다음과 같이 하세요.

```
DEBUG=socket.io:client* node yourfile.js
```

engine과 socket.io의 디버그 메시지를 *모두* 보려면 다음과 같이 하세요.

```
DEBUG=engine,socket.io* node yourfile.js
```


### 브라우저 번들에서 debug 제거하기 {#removing-debug-from-your-browser-bundle}

debug 패키지는 개발 중에는 유용하지만 최종 번들의 크기를 늘립니다(minify 및 gzip 적용 기준 약 4KB). 그래서 slim 번들에는 들어 있지 않습니다. 브라우저 번들 종류는 [클라이언트 설치](../03-Client/client-installation.md#from-a-cdn) 문서에서 자세히 확인하세요.

webpack을 사용한다면 [webpack-remove-debug](https://github.com/johngodley/webpack-remove-debug)로 debug를 제거할 수 있습니다.

```js
{
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'webpack-remove-debug'
      }
    ]
  }
}
```

## 브라우저 콘솔의 오류 로그 {#error-logs-in-the-browser-console}

참고로 다음과 같은 오류 로그는 Socket.IO 라이브러리가 아니라 브라우저가 직접 출력합니다.

- `net::ERR_INTERNET_DISCONNECTED`
- `net::ERR_CONNECTION_REFUSED`
- `WebSocket is already in CLOSING or CLOSED state`
- `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at xxx. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing).`
- `The connection to xxx was interrupted while the page was loading`

따라서 Socket.IO 쪽에서는 제어할 수 없습니다.
