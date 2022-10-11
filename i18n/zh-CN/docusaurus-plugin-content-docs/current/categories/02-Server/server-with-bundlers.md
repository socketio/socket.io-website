---
title: 与捆绑器一起使用
sidebar_position: 10
slug: /server-with-bundlers/
---

虽然不如前端捆绑常见，但完全可以为服务器创建捆绑。

## Webpack 5 {#webpack-5}

### 不提供客户端文件 {#without-serving-the-client-files}

安装：

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

注意：`bufferutil` 和 `utf-8-validate`是`ws`包中的两个可选依赖项。您还可以使用以下方法将它们设置为“外部”：

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

文档：https://webpack.js.org/configuration/externals/

### 包括提供客户端文件 {#including-serving-the-client-files}

在这种情况下，我们将不得不使用[Asset modules](https://webpack.js.org/guides/asset-modules/)并覆盖`sendFile`Socket.IO 服务器的功能：

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
