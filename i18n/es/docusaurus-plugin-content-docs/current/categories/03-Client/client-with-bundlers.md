---
title: Uso del cliente con bundlers
sidebar_label: Uso con bundlers
sidebar_position: 5
slug: /client-with-bundlers/
---

A continuación encontrarás la configuración para empaquetar la biblioteca del cliente con diferentes bundlers:

- [Webpack 5](#webpack-5)
  - [Navegador](#navegador)
  - [Node.js](#nodejs)
- [Rollup.js](#rollupjs)
  - [Navegador](#navegador-1)
  - [Node.js](#nodejs-1)

## Webpack 5

Documentación: https://webpack.js.org/concepts/

### Navegador

Instalación:

```
npm i -D socket.io-client webpack webpack-cli babel-loader @babel/core @babel/preset-env \
    @babel/plugin-transform-object-assign webpack-remove-debug
```

`webpack.config.js`

```js
module.exports = {
  entry: "./index.js",
  output: {
    filename: "bundle.js",
  },
  mode: "production",
  node: false,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"], // asegurar compatibilidad con navegadores antiguos
            plugins: ["@babel/plugin-transform-object-assign"], // asegurar compatibilidad con IE 11
          },
        },
      },
      {
        test: /\.js$/,
        loader: "webpack-remove-debug", // eliminar paquete "debug"
      },
    ],
  },
};
```

Para referencia, aquí está la salida del paquete [`webpack-bundle-analyzer`](https://www.npmjs.com/package/webpack-bundle-analyzer):

![Salida del paquete webpack-bundle-analyzer](/images/bundle-analyzer-output.png)

### Node.js

Para usar el cliente en un entorno Node.js (conexión servidor a servidor), aquí está la configuración:

Instalación:

```
npm i -D socket.io-client webpack webpack-cli
```

`webpack.config.js`

```js
module.exports = {
  entry: "./index.js",
  output: {
    filename: "bundle.js",
  },
  mode: "production",
  target: "node",
  externals: {
    bufferutil: "bufferutil",
    "utf-8-validate": "utf-8-validate",
  },
};
```

Nota: sin establecer `target: "node"`, probablemente encontrarás el siguiente error:

```
ReferenceError: document is not defined
```

## Rollup.js

Documentación: https://rollupjs.org/guide/en/

### Navegador

Instalación:

```
npm i -D socket.io-client rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-commonjs \
  @rollup/plugin-babel rollup-plugin-uglify babel @babel/core @babel/preset-env
```

`rollup.config.js`

```js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import { uglify } from "rollup-plugin-uglify";

export default {
  input: "index.js",
  output: {
    file: "bundle.js",
    format: "cjs",
  },
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    babel({
      include: ["**.js", "node_modules/**"],
      babelHelpers: "bundled",
      presets: ["@babel/preset-env"],
    }),
    uglify(),
  ],
};
```


### Node.js

Instalación:

```
npm i -D socket.io-client rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup-plugin-uglify
```

`rollup.config.js`

```js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";

export default {
  input: "index.js",
  output: {
    file: "bundle.js",
    format: "cjs",
  },
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    uglify(),
  ],
};
```
