---
title: Uso con bundlers
sidebar_position: 10
slug: /server-with-bundlers/
---

Aunque menos común que el bundling del frontend, es totalmente posible crear un bundle para el servidor.

## Webpack 5

### Sin servir los archivos del cliente

Instalación:

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
  console.log(`conectado ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`desconectado ${socket.id} debido a ${reason}`);
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

Nota: `bufferutil` y `utf-8-validate` son dos dependencias opcionales del paquete `ws`. También puedes establecerlas como "external" con:

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

Documentación: https://webpack.js.org/configuration/externals/

### Incluyendo servir los archivos del cliente

En ese caso, tendremos que usar [Asset modules](https://webpack.js.org/guides/asset-modules/) y sobrescribir la función `sendFile` del servidor Socket.IO:

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
  console.log(`conectado ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`desconectado ${socket.id} debido a ${reason}`);
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
