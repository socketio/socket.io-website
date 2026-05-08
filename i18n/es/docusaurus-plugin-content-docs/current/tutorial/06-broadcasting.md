---
title: "Tutorial paso #5 - Broadcasting"
sidebar_label: "Paso #5: Broadcasting"
slug: step-5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Broadcasting

El siguiente objetivo es emitir el evento desde el servidor al resto de los usuarios.

Para enviar un evento a todos, Socket.IO nos da el método `io.emit()`.

```js
// esto emitirá el evento a todos los sockets conectados
io.emit('hello', 'world'); 
```

Si quieres enviar un mensaje a todos excepto a un cierto socket emisor, tenemos la bandera `broadcast` para emitir desde ese socket:

```js
io.on('connection', (socket) => {
  socket.broadcast.emit('hi');
});
```

En este caso, por simplicidad enviaremos el mensaje a todos, incluyendo al emisor.

```js
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
```

Y en el lado del cliente cuando capturamos un evento `chat message` lo incluiremos en la página.

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();

  const form = document.getElementById('form');
  const input = document.getElementById('input');
  // highlight-start
  const messages = document.getElementById('messages');
  // highlight-end

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  // highlight-start
  socket.on('chat message', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
  // highlight-end
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
  // highlight-start
  var messages = document.getElementById('messages');
  // highlight-end

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  // highlight-start
  socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
  // highlight-end
</script>
```

  </TabItem>
</Tabs>

Veámoslo en acción:

<video controls autoplay="" loop="" width="100%"><source src="https://i.cloudup.com/transcoded/J4xwRU9DRn.mp4" /></video>

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step5?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step5?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step5?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step5?file=index.js)


  </TabItem>
</Tabs>

:::
