---
title: "Tutorial step #4 - Emitting events"
sidebar_label: "Step #4: Emitting events"
slug: step-4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Emitting events

The main idea behind Socket.IO is that you can send and receive any events you want, with any data you want. Any objects that can be encoded as JSON will do, and [binary data](/blog/introducing-socket-io-1-0/#binary) is supported too.

Let’s make it so that when the user types in a message, the server gets it as a `chat message` event. The `script` section in `index.html` should now look as follows:

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();

  const form = document.getElementById('form');
  const input = document.getElementById('input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });
</script>
```

  </TabItem>
  <TabItem value="es5" label="ES5">

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();

  var form = document.getElementById('form');
  var input = document.getElementById('input');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });
</script>
```

  </TabItem>
</Tabs>

And in `index.js` we print out the `chat message` event:

```js
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });
});
```

The result should be like the following video:

<video width="100%"><source src="https://i.cloudup.com/transcoded/zboNrGSsai.mp4" /></video>

:::tip

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step4?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step4?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

You can run this example directly in your browser on:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step4?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step4?file=index.js)


  </TabItem>
</Tabs>

:::
