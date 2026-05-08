---
title: "Tutorial paso #4 - Emitiendo eventos"
sidebar_label: "Paso #4: Emitiendo eventos"
slug: step-4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Emitiendo eventos

La idea principal detrás de Socket.IO es que puedes enviar y recibir cualquier evento que quieras, con cualquier dato que quieras. Cualquier objeto que pueda ser codificado como JSON funcionará, y también se soportan [datos binarios](/blog/introducing-socket-io-1-0/#binary).

Hagamos que cuando el usuario escriba un mensaje, el servidor lo reciba como un evento `chat message`. La sección `script` en `index.html` ahora debería verse así:

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

Y en `index.js` imprimimos el evento `chat message`:

```js
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('mensaje: ' + msg);
  });
});
```

El resultado debería ser como el siguiente video:

<video controls width="100%"><source src="https://i.cloudup.com/transcoded/zboNrGSsai.mp4" /></video>

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step4?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step4?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step4?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step4?file=index.js)


  </TabItem>
</Tabs>

:::
