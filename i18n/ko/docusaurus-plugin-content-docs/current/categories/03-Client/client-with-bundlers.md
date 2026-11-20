---
title: 번들러와 함께 클라이언트 사용하기
sidebar_label: 번들러와 함께 사용하기
sidebar_position: 5
slug: /client-with-bundlers/
---

아래는 여러 번들러로 클라이언트 라이브러리를 번들링하는 설정입니다.

- [Webpack 5](#webpack-5)
  - [브라우저](#browser)
  - [Node.js](#nodejs)
- [Rollup.js](#rollup-js)
  - [브라우저](#browser-1)
  - [Node.js](#nodejs-1)

## Webpack 5 {#webpack-5}

문서: https://webpack.js.org/concepts/

### 브라우저 {#browser}

설치:

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
            presets: ["@babel/preset-env"], // 구형 브라우저와의 호환성 확보
            plugins: ["@babel/plugin-transform-object-assign"], // IE 11과의 호환성 확보
          },
        },
      },
      {
        test: /\.js$/,
        loader: "webpack-remove-debug", // "debug" 패키지 제거
      },
    ],
  },
};
```

참고로 [`webpack-bundle-analyzer`](https://www.npmjs.com/package/webpack-bundle-analyzer) 패키지의 출력 결과는 다음과 같습니다.

![webpack-bundle-analyzer 패키지의 출력 결과](/images/bundle-analyzer-output.png)

### Node.js {#nodejs}

Node.js 환경에서(서버 간 연결) 클라이언트를 사용하려면 다음과 같이 설정합니다.

설치:

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

참고: `target: "node"`를 설정하지 않으면 다음 오류가 발생할 가능성이 높습니다.

```
ReferenceError: document is not defined
```

## Rollup.js {#rollupjs}

문서: https://rollupjs.org/guide/en/

### 브라우저 {#browser-1}

설치:

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


### Node.js {#nodejs-1}

설치:

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

