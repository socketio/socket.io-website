---
title: Apache Cordova
---

Apache Cordova 앱은 대부분 JS로 작성되기 때문에 Socket.IO를 아주 쉽게 쓸 수 있습니다! 간단한 예제를 따라가 보겠습니다.

먼저 간단한 서버를 준비합니다.

```js
var server = require('http').createServer();
var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {
    console.log('socket connected');

    socket.on('disconnect', function () {
        console.log('socket disconnected');
    });

    socket.emit('text', 'wow. such event. very real time.');
});

server.listen(3000);
```

이 서버는 Socket.IO 클라이언트의 연결을 기다렸다가, 연결된 클라이언트에게 `text` 이벤트로 텍스트를 보내기만 합니다.

이제 본론으로 들어가겠습니다. 먼저 새 Cordova 프로젝트를 만들고, 이 프로젝트를 고쳐 나가겠습니다. 처음부터 시작해 봅시다.

다음 명령을 실행하면

```
npm install -g cordova
```

Cordova CLI 도구가 설치됩니다. 이 도구로 프로젝트를 만들고, 의존성을 설치하거나 제거하고, 에뮬레이터를 실행하는 등의 작업을 합니다.

```
cordova create socket.io-example socket.io.example socket.io-example
```

위 명령은 앞으로 고쳐 나갈 새 프로젝트 템플릿을 만듭니다. 새로 생긴 `socket.io-example` 폴더를 둘러보면서 파일을 몇 개 살펴봐도 좋습니다.

이제 프로젝트 폴더 안에 있어야 합니다. 명령줄에서 아직 이동하지 않았다면 지금 `cd socket.io-example`를 실행하세요.

OS X에서 이 예제를 개발하고 있으므로 iOS용으로 빌드하겠습니다. Android도 비슷한 방법으로 할 수 있습니다. 빌드 대상을 추가하려면 다음 명령을 실행하세요.

```
cordova platform add ios
```

이어서 네이티브 구성 요소를 모두 빌드합니다. 아래 명령을 실행하면 됩니다.

```
cordova build ios
```

이제 템플릿 애플리케이션을 실제로 실행해서 모든 것이 잘 동작하는지 확인해 보겠습니다. OS X를 사용한다면 다음과 같이 iOS 에뮬레이터를 설치할 수 있습니다.

```
brew install ios-sim
```

`cordova emulate ios`를 실행하면 에뮬레이터가 열리고 다음과 같은 화면이 나타납니다.

<img src="https://cloudup.com/cKoYEzCeKKY+" alt="null" />

기본 구성이 잘 동작하는 것을 확인했으니 코드를 작성해 보겠습니다. 프로젝트 디렉터리에서 `www/index.html`을 여세요. 내용은 대략 다음과 같습니다.

```html
<!DOCTYPE html>
<!--
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
-->
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="format-detection" content="telephone=no" />
        <!-- WARNING: for iOS 7, remove the width=device-width and height=device-height attributes. See https://issues.apache.org/jira/browse/CB-4323 -->
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" />
        <link rel="stylesheet" type="text/css" href="css/index.css" />
        <meta name="msapplication-tap-highlight" content="no" />
        <title>Hello World</title>
    </head>
    <body>
        <div class="app">
            <h1>Apache Cordova</h1>
            <div id="deviceready" class="blink">
                <p class="event listening">Connecting to Device</p>
                <p class="event received">Device is Ready</p>
            </div>
        </div>
        <script type="text/javascript" src="cordova.js"></script>
        <script type="text/javascript" src="js/index.js"></script>
        <script type="text/javascript">
            app.initialize();
        </script>
    </body>
</html>
```

먼저 Socket.IO 클라이언트 스크립트를 가져와야 합니다. 다음과 같이 CDN에서 가져올 수 있습니다.

```html
<script type="text/javascript" src="cordova.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
<script type="text/javascript" src="js/index.js"></script>
```

이제 `app.initialize` 호출 아래에 실제 로직을 작성하겠습니다. 기기에서 애플리케이션 로딩이 끝난 뒤에 코드를 실행하는 편이 좋습니다. 다음과 같이 하면 됩니다.

```html
<script type="text/javascript">
  app.initialize();

  document.addEventListener('deviceready', function() {
    // 여기에 코드를 작성합니다
  });
</script>
```

`deviceready` 이벤트는 애플리케이션 로딩이 모두 끝나면 발생합니다. 실제 로직을 추가하려면 이 함수 안을 채우기만 하면 됩니다. 소켓이 연결되면 서버가 보낸 데이터를 받아 그 텍스트를 알림 창으로 보여 주는 코드를 만들어 보겠습니다. 예를 들면 다음과 같습니다.

```html
<script type="text/javascript">
  app.initialize();

  document.addEventListener('deviceready', function() {
    socket.on('connect', function() {
      socket.on('text', function(text) {
        alert(text);
       });
     });
  });
</script>
```

`cordova emulate ios`로 에뮬레이터를 다시 실행하면 다음과 같은 화면이 나타납니다.

<img src="https://cloudup.com/cuIaVMrmcyP+" alt="null" />

이게 전부입니다! 이 글이 시작하는 데 도움이 되면 좋겠습니다. 즐겁게 개발하세요!
