---
title: 客户端初始化
sidebar_label: 初始化
sidebar_position: 2
slug: /client-initialization/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[安装](client-installation.md)Socket.IO客户端库后，您现在可以初始化客户端。可以在[此处](../../client-options.md)找到完整的选项列表。

:::tip 提示

对于 TypeScript 用户，可以为事件提供类型提示。请检查[这个](../01-Documentation/typescript.md)。

:::

在下面的示例中，`io`对象来自：

- 使用 `<script>` 引入

```html
<script src="/socket.io/socket.io.js"></script>
```

- 使用 ESM 引入

```html
<script type="module">
  import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
</script>
```

- NPM

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { io } = require("socket.io-client");
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { io } from "socket.io-client";
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { io } from "socket.io-client";
```

  </TabItem>
</Tabs>

## 来自同一域 {#from-the-same-domain}

如果您的前端与您的服务器在同一个域上提供服务，您可以简单地使用：

```js
const socket = io();
```

服务器 URL 将从 [window.location](https://developer.mozilla.org/en-US/docs/Web/API/Window/location)对象中推导出来。

## 来自不同的域 {#from-a-different-domain}

如果您的前端不是来自与服务器相同的域，则必须传递服务器的 URL。

```js
const socket = io("https://server-domain.com");
```

在这种情况下，请确保在服务器上启用 [跨域资源共享 (CORS)](../02-Server/handling-cors.md)。

:::info 信息

您可以使用`https` 或 `wss` (分别为, `http` 或 `ws`).

:::

```js
// the following forms are similar
const socket = io("https://server-domain.com");
const socket = io("wss://server-domain.com");
const socket = io("server-domain.com"); // only in the browser when the page is served over https (will not work in Node.js)
```

## 自定义命名空间 {#custom-namespace}

在上面的示例中，客户端将连接到主命名空间。对于大多数用例来说，仅使用主命名空间就足够了，但您可以使用以下命令指定命名空间：

```js
// same origin version
const socket = io("/admin");
// cross origin version
const socket = io("https://server-domain.com/admin");
```

您可以[在此处](../06-Advanced/namespaces.md)找到有关名称空间的更多详细信息。

## 配置 {#options}

可在[此处](../../client-options.md)找到可用配置的完整列表。
