---
title: Transmitir eventos
sidebar_position: 3
slug: /broadcasting-events/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Socket.IO facilita el envío de eventos a todos los clientes conectados.

:::info

Por favor nota que la transmisión (broadcasting) es una característica **solo del servidor**.

:::

## A todos los clientes conectados

<ThemedImage
  alt="Transmitiendo a todos los clientes conectados"
  sources={{
    light: useBaseUrl('/images/broadcasting.png'),
    dark: useBaseUrl('/images/broadcasting-dark.png'),
  }}
/>

```js
io.emit("hello", "world");
```

:::caution

Los clientes que están actualmente desconectados (o en proceso de reconexión) no recibirán el evento. Almacenar este evento en algún lugar (en una base de datos, por ejemplo) depende de ti, según tu caso de uso.

:::

## A todos los clientes conectados excepto el emisor

<ThemedImage
  alt="Transmitiendo a todos los clientes conectados excepto el emisor"
  sources={{
    light: useBaseUrl('/images/broadcasting2.png'),
    dark: useBaseUrl('/images/broadcasting2-dark.png'),
  }}
/>

```js
io.on("connection", (socket) => {
  socket.broadcast.emit("hello", "world");
});
```

:::note

En el ejemplo anterior, usar `socket.emit("hello", "world")` (sin la bandera `broadcast`) enviaría el evento al "cliente A". Puedes encontrar la lista de todas las formas de enviar un evento en la [hoja de referencia](emit-cheatsheet.md).

:::

## Con acknowledgements

A partir de Socket.IO 4.5.0, ahora puedes transmitir un evento a múltiples clientes y esperar un acknowledgement de cada uno de ellos:

```js
io.timeout(5000).emit("hello", "world", (err, responses) => {
  if (err) {
    // algunos clientes no confirmaron el evento en el tiempo dado
  } else {
    console.log(responses); // una respuesta por cliente
  }
});
```

Todas las formas de transmisión son soportadas:

- en una sala

```js
io.to("room123").timeout(5000).emit("hello", "world", (err, responses) => {
  // ...
});
```

- desde un `socket` específico

```js
socket.broadcast.timeout(5000).emit("hello", "world", (err, responses) => {
  // ...
});
```

- en un namespace

```js
io.of("/the-namespace").timeout(5000).emit("hello", "world", (err, responses) => {
  // ...
});
```

## Con múltiples servidores Socket.IO

La transmisión también funciona con múltiples servidores Socket.IO.

Solo necesitas reemplazar el adaptador predeterminado por el [Adaptador Redis](../05-Adapters/adapter-redis.md) u otro [adaptador compatible](../05-Adapters/adapter.md).

<ThemedImage
  alt="Transmitiendo con Redis"
  sources={{
    light: useBaseUrl('/images/broadcasting-redis.png'),
    dark: useBaseUrl('/images/broadcasting-redis-dark.png'),
  }}
/>

En ciertos casos, podrías querer transmitir solo a clientes que están conectados al servidor actual. Puedes lograr esto con la bandera `local`:

```js
io.local.emit("hello", "world");
```

<ThemedImage
  alt="Transmitiendo con Redis pero local"
  sources={{
    light: useBaseUrl('/images/broadcasting-redis-local.png'),
    dark: useBaseUrl('/images/broadcasting-redis-local-dark.png'),
  }}
/>

Para dirigirse a clientes específicos al transmitir, por favor consulta la documentación sobre [Salas](rooms.md).
