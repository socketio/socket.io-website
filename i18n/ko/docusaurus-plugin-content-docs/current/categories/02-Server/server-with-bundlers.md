---
title: 번들러와 함께 사용하기
sidebar_position: 10
slug: /server-with-bundlers/
---

프런트엔드 번들링만큼 흔하지는 않지만 서버용 번들도 얼마든지 만들 수 있습니다.

## Webpack 5 {#webpack-5}

### 클라이언트 파일을 제공하지 않는 경우 {#without-serving-the-client-files}

설치:

```
npm install -D webpack webpack-cli socket.io bufferutil utf-8-validate
```

`index.js`

```js
const { Server } = require("socket.io");

const io = new Server({
  serveClient: false
});

io.on("connection", socket => {
  console.log(`connect ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`disconnect ${socket.id} due to ${reason}`);
  });
});

io.listen(3000);
```

`webpack.config.js`

```js
const path = require("path");

module.exports = {
  entry: "./index.js",
  target: "node",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  }
};
```

참고: `bufferutil`과 `utf-8-validate`는 `ws` 패키지의 선택적 의존성입니다. 다음과 같이 "external"로 지정할 수도 있습니다.

```js
const path = require("path");

module.exports = {
  entry: "./index.js",
  target: "node",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  externals: {
    bufferutil: "bufferutil",
    "utf-8-validate": "utf-8-validate",
  },
};
```

문서: https://webpack.js.org/configuration/externals/

### 클라이언트 파일도 제공하는 경우 {#including-serving-the-client-files}

이 경우 [애셋 모듈](https://webpack.js.org/guides/asset-modules/)(Asset modules)을 사용하고 Socket.IO 서버의 `sendFile` 함수를 재정의해야 합니다.

`index.js`

```js
const { Server } = require("socket.io");

const clientFile = require("./node_modules/socket.io/client-dist/socket.io.min?raw");
const clientMap = require("./node_modules/socket.io/client-dist/socket.io.min.js.map?raw");

Server.sendFile = (filename, req, res) => {
  res.end(filename.endsWith(".map") ? clientMap : clientFile);
};

const io = new Server();

io.on("connection", socket => {
  console.log(`connect ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`disconnect ${socket.id} due to ${reason}`);
  });
});

io.listen(3000);
```

`webpack.config.js`

```js
const path = require("path");

module.exports = {
  entry: "./index.js",
  target: "node",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        resourceQuery: /raw/,
        type: "asset/source",
      },
    ],
  },
};
```
