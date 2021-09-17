---
title: Client usage with bundlers
sidebar_label: Usage with bundlers
sidebar_position: 5
slug: /client-with-bundlers/
---

You will find below the configuration for bundling the client library with different bundlers:

- [Webpack 5](#webpack-5)
  - [Browser](#browser)
  - [Node.js](#nodejs)
- [Rollup.js](#rollup-js)
  - [Browser](#browser-1)
  - [Node.js](#nodejs-1)

## Webpack 5

Documentation: https://webpack.js.org/concepts/

### Browser

Installation:

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
            presets: ["@babel/preset-env"], // ensure compatibility with older browsers
            plugins: ["@babel/plugin-transform-object-assign"], // ensure compatibility with IE 11
          },
        },
      },
      {
        test: /\.js$/,
        loader: "webpack-remove-debug", // remove "debug" package
      },
    ],
  },
};
```

For reference, here is the output of the [`webpack-bundle-analyzer`](https://www.npmjs.com/package/webpack-bundle-analyzer) package:

![Output of the webpack-bundle-analyzer package](/images/bundle-analyzer-output.png)

### Node.js

To use the client in a Node.js environment (server to server connection), here is the configuration:

Installation:

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

Note: without setting `target: "node"`, you will likely encounter the following error:

```
ReferenceError: document is not defined
```

## Rollup.js

Documentation: https://rollupjs.org/guide/en/

### Browser

Installation:

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

Installation:

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

