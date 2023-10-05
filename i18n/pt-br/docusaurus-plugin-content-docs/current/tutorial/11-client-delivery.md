---
title: "Tutorial step #8 - Client delivery"
sidebar_label: "Step #8: Client delivery"
slug: step-8
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Ensuring delivery to the server

Let's see how we can make sure that the server always receives the messages sent by the clients.

:::info

By default, Socket.IO provides an "at most once" guarantee of delivery (also known as "fire and forget"), which means that there will be no retry in case the message does not reach the server.

:::

## Buffered events {#buffered-events}

When a client gets disconnected, any call to `socket.emit()` is buffered until reconnection:

<video width="100%"><source src="/videos/tutorial/buffered-events.mp4" /></video>

In the video above, the "realtime" message is buffered until the connection is reestablished.

This behavior might be totally sufficient for your application. However, there are a few cases where a message could be lost:

- the connection is severed while the event is being sent
- the server crashes or get restarted while processing the event
- the database is temporarily not available

## At least once {#at-least-once}

We can implement an "at least once" guarantee:

- manually with an acknowledgement:

```js
function emit(socket, event, arg) {
  socket.timeout(5000).emit(event, arg, (err) => {
    if (err) {
      // no ack from the server, let's retry
      emit(socket, event, arg);
    }
  });
}

emit(socket, 'hello', 'world');
```

- or with the `retries` option:

```js
const socket = io({
  ackTimeout: 10000,
  retries: 3
});

socket.emit('hello', 'world');
```

In both cases, the client will retry to send the message until it gets an acknowledgement from the server:

```js
io.on('connection', (socket) => {
  socket.on('hello', (value, callback) => {
    // once the event is successfully handled
    callback();
  });
})
```

:::tip

With the `retries` option, the order of the messages is guaranteed, as the messages are queued and sent one by one. This is not the case with the first option.

:::

## Exactly once {#exactly-once}

The problem with retries is that the server might now receive the same message multiple times, so it needs a way to uniquely identify each message, and only store it once in the database.

Let's see how we can implement an "exactly once" guarantee in our chat application.

We will start by assigning a unique identifier to each message on the client side:

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
    // enable retries
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
      // compute a unique offset
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
    // enable retries
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
      // compute a unique offset
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

The `socket.id` attribute is a random 20-characters identifier which is assigned to each connection.

We could also have used [`getRandomValues()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) to generate a unique offset.

:::

And then we store this offset alongside the message on the server side:

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
        // the message was already inserted, so we notify the client
        callback();
      } else {
        // nothing to do, just let the client retry
      }
      return;
      // highlight-end
    }
    io.emit('chat message', msg, result.lastID);
    // highlight-start
    // acknowledge the event
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
      // something went wrong
    }
  }
});

// [...]
```

This way, the UNIQUE constraint on the `client_offset` column prevents the duplication of the message.

:::caution

Do not forget to acknowledge the event, or else the client will keep retrying (up to `retries` times). 

```js
socket.on('chat message', async (msg, clientOffset, callback) => {
  // ... and finally
  callback();
});
```

:::

:::info

Again, the default guarantee ("at most once") might be sufficient for your application, but now you know how it can be made more reliable.

:::

Let's scale up!
