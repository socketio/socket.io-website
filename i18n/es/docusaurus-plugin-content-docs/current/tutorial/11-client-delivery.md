---
title: "Tutorial paso #8 - Entrega del cliente"
sidebar_label: "Paso #8: Entrega del cliente"
slug: step-8
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Entrega del cliente

Veamos cómo podemos asegurarnos de que el servidor siempre reciba los mensajes enviados por los clientes.

:::info

Por defecto, Socket.IO proporciona una garantía de entrega "como máximo una vez" (también conocida como "fire and forget"), lo que significa que no habrá reintento en caso de que el mensaje no llegue al servidor.

:::

## Eventos en búfer

Cuando un cliente se desconecta, cualquier llamada a `socket.emit()` se almacena en búfer hasta la reconexión:

<video controls width="100%"><source src="/videos/tutorial/buffered-events.mp4" /></video>

En el video anterior, el mensaje "realtime" se almacena en búfer hasta que la conexión se restablece.

Este comportamiento podría ser totalmente suficiente para tu aplicación. Sin embargo, hay algunos casos donde un mensaje podría perderse:

- la conexión se corta mientras el evento se está enviando
- el servidor falla o se reinicia mientras procesa el evento
- la base de datos está temporalmente no disponible

## Al menos una vez

Podemos implementar una garantía de "al menos una vez":

- manualmente con un acknowledgement:

```js
function emit(socket, event, arg) {
  socket.timeout(5000).emit(event, arg, (err) => {
    if (err) {
      // sin ack del servidor, reintentemos
      emit(socket, event, arg);
    }
  });
}

emit(socket, 'hello', 'world');
```

- o con la opción `retries`:

```js
const socket = io({
  ackTimeout: 10000,
  retries: 3
});

socket.emit('hello', 'world');
```

En ambos casos, el cliente reintentará enviar el mensaje hasta que reciba un acknowledgement del servidor:

```js
io.on('connection', (socket) => {
  socket.on('hello', (value, callback) => {
    // una vez que el evento se maneja exitosamente
    callback();
  });
})
```

:::tip

Con la opción `retries`, el orden de los mensajes está garantizado, ya que los mensajes se encolan y se envían uno por uno. Este no es el caso con la primera opción.

:::

## Exactamente una vez

El problema con los reintentos es que el servidor ahora podría recibir el mismo mensaje múltiples veces, así que necesita una forma de identificar únicamente cada mensaje, y almacenarlo solo una vez en la base de datos.

Veamos cómo podemos implementar una garantía de "exactamente una vez" en nuestra aplicación de chat.

Comenzaremos asignando un identificador único a cada mensaje en el lado del cliente:

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html title="index.html"
<script>
  // highlight-next-line
  let counter = 0;

  const socket = io({
    auth: {
      serverOffset: 0
    },
    // highlight-start
    // habilitar reintentos
    ackTimeout: 10000,
    retries: 3,
    // highlight-end
  });

  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      // highlight-start
      // calcular un offset único
      const clientOffset = `${socket.id}-${counter++}`;
      socket.emit('chat message', input.value, clientOffset);
      // highlight-end
      input.value = '';
    }
  });

  socket.on('chat message', (msg, serverOffset) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    socket.auth.serverOffset = serverOffset;
  });
</script>
```

  </TabItem>
  <TabItem value="es5" label="ES5">

```html title="index.html"
<script>
  // highlight-next-line
  var counter = 0;

  var socket = io({
    auth: {
      serverOffset: 0
    },
    // highlight-start
    // habilitar reintentos
    ackTimeout: 10000,
    retries: 3,
    // highlight-end
  });

  var form = document.getElementById('form');
  var input = document.getElementById('input');
  var messages = document.getElementById('messages');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      // highlight-start
      // calcular un offset único
      var clientOffset = `${socket.id}-${counter++}`;
      socket.emit('chat message', input.value, clientOffset);
      // highlight-end
      input.value = '';
    }
  });

  socket.on('chat message', function(msg, serverOffset) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    socket.auth.serverOffset = serverOffset;
  });
</script>
```

  </TabItem>
</Tabs>

:::note

El atributo `socket.id` es un identificador aleatorio de 20 caracteres que se asigna a cada conexión.

También podríamos haber usado [`getRandomValues()`](https://developer.mozilla.org/es/docs/Web/API/Crypto/getRandomValues) para generar un offset único.

:::

Y luego almacenamos este offset junto con el mensaje en el lado del servidor:

```js title="index.js"
// [...]

io.on('connection', async (socket) => {
  // highlight-next-line
  socket.on('chat message', async (msg, clientOffset, callback) => {
    let result;
    try {
      // highlight-next-line
      result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
    } catch (e) {
      // highlight-start
      if (e.errno === 19 /* SQLITE_CONSTRAINT */ ) {
        // el mensaje ya fue insertado, así que notificamos al cliente
        callback();
      } else {
        // nada que hacer, solo dejar que el cliente reintente
      }
      return;
      // highlight-end
    }
    io.emit('chat message', msg, result.lastID);
    // highlight-start
    // reconocer el evento
    callback();
    // highlight-end
  });

  if (!socket.recovered) {
    try {
      await db.each('SELECT id, content FROM messages WHERE id > ?',
        [socket.handshake.auth.serverOffset || 0],
        (_err, row) => {
          socket.emit('chat message', row.content, row.id);
        }
      )
    } catch (e) {
      // algo salió mal
    }
  }
});

// [...]
```

De esta manera, la restricción UNIQUE en la columna `client_offset` previene la duplicación del mensaje.

:::caution

No olvides reconocer el evento, o de lo contrario el cliente seguirá reintentando (hasta `retries` veces).

```js
socket.on('chat message', async (msg, clientOffset, callback) => {
  // ... y finalmente
  callback();
});
```

:::

:::info

De nuevo, la garantía por defecto ("como máximo una vez") podría ser suficiente para tu aplicación, pero ahora sabes cómo puede hacerse más confiable.

:::

En el próximo paso, veremos cómo podemos escalar nuestra aplicación horizontalmente.

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step8?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step8?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step8?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step8?file=index.js)


  </TabItem>
</Tabs>

:::
