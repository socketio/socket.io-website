---
title: How to use with `pkg`
---

# How to use with `pkg`

The client files are not automatically included as assets, you need to manually specify them:

`index.js`

```js
const { Server } = require("socket.io");

const io = new Server();

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

:::caution

ES modules are not currently supported. More information here: https://github.com/vercel/pkg/issues/1291

:::

`pkg.json`

```json
{
  "assets": "node_modules/socket.io/client-dist/*.js"
}
```

And then run:

```
$ pkg -c pkg.json -t node14-linux index.js
```

And *voilà*!
