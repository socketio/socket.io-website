---
title: "Tutorial - Visión general de la API"
sidebar_label: "Visión general de la API"
slug: api-overview
toc_max_heading_level: 4
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Visión general de la API

Antes de continuar, hagamos un recorrido rápido por la API proporcionada por Socket.IO:

## API común

Los siguientes métodos están disponibles tanto para el cliente como para el servidor.

### Emit básico

Como vimos en el [paso #4](05-emitting-events.md), puedes enviar cualquier dato al otro lado con `socket.emit()`:

<Tabs>
  <TabItem value="From client to server" label="Del cliente al servidor">

*Cliente*

```js
socket.emit('hello', 'world');
```

*Servidor*

```js
io.on('connection', (socket) => {
  socket.on('hello', (arg) => {
    console.log(arg); // 'world'
  });
});
```

  </TabItem>
  <TabItem value="From server to client" label="Del servidor al cliente">

*Servidor*

```js
io.on('connection', (socket) => {
  socket.emit('hello', 'world');
});
```

*Cliente*

```js
socket.on('hello', (arg) => {
  console.log(arg); // 'world'
});
```

  </TabItem>
</Tabs>

Puedes enviar cualquier número de argumentos, y todas las estructuras de datos serializables son soportadas, incluyendo objetos binarios como [ArrayBuffer](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [TypedArray](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) o [Buffer](https://nodejs.org/docs/latest/api/buffer.html#buffer_buffer) (solo Node.js):

<Tabs>
  <TabItem value="From client to server" label="Del cliente al servidor">

*Cliente*

```js
socket.emit('hello', 1, '2', { 3: '4', 5: Uint8Array.from([6]) });
```

*Servidor*

```js
io.on('connection', (socket) => {
  socket.on('hello', (arg1, arg2, arg3) => {
    console.log(arg1); // 1
    console.log(arg2); // '2'
    console.log(arg3); // { 3: '4', 5: <Buffer 06> }
  });
});
```

  </TabItem>
  <TabItem value="From server to client" label="Del servidor al cliente">

*Servidor*

```js
io.on('connection', (socket) => {
  socket.emit('hello', 1, '2', { 3: '4', 5: Buffer.from([6]) });
});
```

*Cliente*

```js
socket.on('hello', (arg1, arg2, arg3) => {
  console.log(arg1); // 1
  console.log(arg2); // '2'
  console.log(arg3); // { 3: '4', 5: ArrayBuffer (1) [ 6 ] }
});
```

  </TabItem>
</Tabs>

:::tip

No es necesario llamar `JSON.stringify()` en objetos:

```js
// MAL
socket.emit('hello', JSON.stringify({ name: 'John' }));

// BIEN
socket.emit('hello', { name: 'John' });
```

:::

### Acknowledgements

Los eventos son geniales, pero en algunos casos puedes querer una API de solicitud-respuesta más clásica. En Socket.IO, esta característica se llama "acknowledgements".

Viene en dos sabores:

#### Con una función callback

Puedes añadir un callback como el último argumento del `emit()`, y este callback será llamado una vez que el otro lado haya reconocido el evento:

<Tabs>
  <TabItem value="From client to server" label="Del cliente al servidor">

*Cliente*

```js
socket.timeout(5000).emit('request', { foo: 'bar' }, 'baz', (err, response) => {
  if (err) {
    // el servidor no reconoció el evento en el tiempo dado
  } else {
    console.log(response.status); // 'ok'
  }
});
```

*Servidor*

```js
io.on('connection', (socket) => {
  socket.on('request', (arg1, arg2, callback) => {
    console.log(arg1); // { foo: 'bar' }
    console.log(arg2); // 'baz'
    callback({
      status: 'ok'
    });
  });
});
```

  </TabItem>
  <TabItem value="From server to client" label="Del servidor al cliente">

*Servidor*

```js
io.on('connection', (socket) => {
  socket.timeout(5000).emit('request', { foo: 'bar' }, 'baz', (err, response) => {
    if (err) {
      // el cliente no reconoció el evento en el tiempo dado
    } else {
      console.log(response.status); // 'ok'
    }
  });
});
```

*Cliente*

```js
socket.on('request', (arg1, arg2, callback) => {
  console.log(arg1); // { foo: 'bar' }
  console.log(arg2); // 'baz'
  callback({
    status: 'ok'
  });
});
```

  </TabItem>
</Tabs>

#### Con una Promise

El método `emitWithAck()` proporciona la misma funcionalidad, pero devuelve una Promise que se resolverá una vez que el otro lado reconozca el evento:

<Tabs>
  <TabItem value="From client to server" label="Del cliente al servidor">

*Cliente*

```js
try {
  const response = await socket.timeout(5000).emitWithAck('request', { foo: 'bar' }, 'baz');
  console.log(response.status); // 'ok'
} catch (e) {
  // el servidor no reconoció el evento en el tiempo dado
}
```

*Servidor*

```js
io.on('connection', (socket) => {
  socket.on('request', (arg1, arg2, callback) => {
    console.log(arg1); // { foo: 'bar' }
    console.log(arg2); // 'baz'
    callback({
      status: 'ok'
    });
  });
});
```

  </TabItem>
  <TabItem value="From server to client" label="Del servidor al cliente">

*Servidor*

```js
io.on('connection', async (socket) => {
  try {
    const response = await socket.timeout(5000).emitWithAck('request', { foo: 'bar' }, 'baz');
    console.log(response.status); // 'ok'
  } catch (e) {
    // el cliente no reconoció el evento en el tiempo dado
  }
});
```

*Cliente*

```js
socket.on('request', (arg1, arg2, callback) => {
  console.log(arg1); // { foo: 'bar' }
  console.log(arg2); // 'baz'
  callback({
    status: 'ok'
  });
});
```

  </TabItem>
</Tabs>

:::caution

Los entornos que [no soportan Promises](https://caniuse.com/promises) (como Internet Explorer) necesitarán añadir un polyfill o usar un compilador como [babel](https://babeljs.io/) para usar esta característica (pero esto está fuera del alcance de este tutorial).

:::

### Listeners catch-all

Un listener catch-all es un listener que será llamado para cualquier evento entrante. Esto es útil para depurar tu aplicación:

*Emisor*

```js
socket.emit('hello', 1, '2', { 3: '4', 5: Uint8Array.from([6]) });
```

*Receptor*

```js
socket.onAny((eventName, ...args) => {
  console.log(eventName); // 'hello'
  console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
});
```

De manera similar, para paquetes salientes:

```js
socket.onAnyOutgoing((eventName, ...args) => {
  console.log(eventName); // 'hello'
  console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
});
```

## API del servidor

### Broadcasting

Como vimos en el [paso #5](06-broadcasting.md), puedes difundir un evento a todos los clientes conectados con `io.emit()`:

```js
io.emit('hello', 'world');
```

<ThemedImage
  alt="El evento 'hello' se envía a todos los clientes conectados"
  sources={{
    light: useBaseUrl('/images/tutorial/broadcasting.png'),
    dark: useBaseUrl('/images/tutorial/broadcasting-dark.png'),
  }}
/>

### Rooms

En la jerga de Socket.IO, una *room* es un canal arbitrario al que los sockets pueden unirse y abandonar. Se puede usar para difundir eventos a un subconjunto de clientes conectados:

```js
io.on('connection', (socket) => {
  // unirse a la sala llamada 'some room'
  socket.join('some room');
  
  // difundir a todos los clientes conectados en la sala
  io.to('some room').emit('hello', 'world');

  // difundir a todos los clientes conectados excepto los de la sala
  io.except('some room').emit('hello', 'world');

  // abandonar la sala
  socket.leave('some room');
});
```

<ThemedImage
  alt="El evento 'hello' se envía a todos los clientes conectados en la sala objetivo"
  sources={{
    light: useBaseUrl('/images/tutorial/room.png'),
    dark: useBaseUrl('/images/tutorial/room-dark.png'),
  }}
/>

¡Eso es básicamente todo! Para referencia futura, la API completa se puede encontrar [aquí](../server-api.md) (servidor) y [aquí](../client-api.md) (cliente).
