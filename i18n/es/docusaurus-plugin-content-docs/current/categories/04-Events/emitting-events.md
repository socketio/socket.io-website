---
title: Emitir eventos
sidebar_position: 1
slug: /emitting-events/
---

Hay varias formas de enviar eventos entre el servidor y el cliente.

:::tip

Para usuarios de TypeScript, es posible proporcionar sugerencias de tipo para los eventos. Por favor revisa [esto](../01-Documentation/typescript.md).

:::

## Emit básico

La API de Socket.IO está inspirada en el [EventEmitter](https://nodejs.org/docs/latest/api/events.html#events_events) de Node.js, lo que significa que puedes emitir eventos de un lado y registrar listeners del otro:

*Servidor*

```js
io.on("connection", (socket) => {
  socket.emit("hello", "world");
});
```

*Cliente*

```js
socket.on("hello", (arg) => {
  console.log(arg); // world
});
```

Esto también funciona en la otra dirección:

*Servidor*

```js
io.on("connection", (socket) => {
  socket.on("hello", (arg) => {
    console.log(arg); // world
  });
});
```

*Cliente*

```js
socket.emit("hello", "world");
```

Puedes enviar cualquier número de argumentos, y todas las estructuras de datos serializables son soportadas, incluyendo objetos binarios como [Buffer](https://nodejs.org/docs/latest/api/buffer.html#buffer_buffer) o [TypedArray](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).

*Servidor*

```js
io.on("connection", (socket) => {
  socket.emit("hello", 1, "2", { 3: '4', 5: Buffer.from([6]) });
});
```

*Cliente*

```js
// lado del cliente
socket.on("hello", (arg1, arg2, arg3) => {
  console.log(arg1); // 1
  console.log(arg2); // "2"
  console.log(arg3); // { 3: '4', 5: ArrayBuffer (1) [ 6 ] }
});
```

No hay necesidad de ejecutar `JSON.stringify()` en objetos ya que se hará por ti.

```js
// MAL
socket.emit("hello", JSON.stringify({ name: "John" }));

// BIEN
socket.emit("hello", { name: "John" });
```

Notas:

- Los objetos [Date](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Date) serán convertidos a (y recibidos como) su representación en string, ej. `1970-01-01T00:00:00.000Z`

- [Map](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Map) y [Set](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Set) deben ser serializados manualmente:

```js
const serializedMap = [...myMap.entries()];
const serializedSet = [...mySet.keys()];
```

- puedes usar el método [`toJSON()`](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior) para personalizar la serialización de un objeto

Ejemplo con una clase:

```js
class Hero {
  #hp;

  constructor() {
    this.#hp = 42;
  }

  toJSON() {
    return { hp: this.#hp };
  }
}

socket.emit("here's a hero", new Hero());
```

## Acknowledgements

Los eventos son geniales, pero en algunos casos podrías querer una API más clásica de solicitud-respuesta. En Socket.IO, esta característica se llama acknowledgements.

Puedes agregar un callback como último argumento del `emit()`, y este callback será llamado una vez que el otro lado confirme el evento:

*Servidor*

```js
io.on("connection", (socket) => {
  socket.on("update item", (arg1, arg2, callback) => {
    console.log(arg1); // 1
    console.log(arg2); // { name: "updated" }
    callback({
      status: "ok"
    });
  });
});
```

*Cliente*

```js
socket.emit("update item", "1", { name: "updated" }, (response) => {
  console.log(response.status); // ok
});
```

## Con timeout

A partir de Socket.IO v4.4.0, ahora puedes asignar un timeout a cada emit:

```js
socket.timeout(5000).emit("my-event", (err) => {
  if (err) {
    // el otro lado no confirmó el evento en el tiempo dado
  }
});
```

También puedes usar tanto un timeout como un [acknowledgement](#acknowledgements):

```js
socket.timeout(5000).emit("my-event", (err, response) => {
  if (err) {
    // el otro lado no confirmó el evento en el tiempo dado
  } else {
    console.log(response);
  }
});
```

## Eventos volátiles

Los eventos volátiles son eventos que no serán enviados si la conexión subyacente no está lista (un poco como [UDP](https://es.wikipedia.org/wiki/Protocolo_de_datagramas_de_usuario), en términos de confiabilidad).

Esto puede ser interesante por ejemplo si necesitas enviar la posición de los personajes en un juego en línea (ya que solo los últimos valores son útiles).

```js
socket.volatile.emit("hello", "podría o no ser recibido");
```

Otro caso de uso es descartar eventos cuando el cliente no está conectado (por defecto, los eventos se almacenan en buffer hasta la reconexión).

Ejemplo:

*Servidor*

```js
io.on("connection", (socket) => {
  console.log("connect");

  socket.on("ping", (count) => {
    console.log(count);
  });
});
```

*Cliente*

```js
let count = 0;
setInterval(() => {
  socket.volatile.emit("ping", ++count);
}, 1000);
```

Si reinicias el servidor, verás en la consola:

```
connect
1
2
3
4
# el servidor se reinicia, el cliente se reconecta automáticamente
connect
9
10
11
```

Sin la bandera `volatile`, verías:

```
connect
1
2
3
4
# el servidor se reinicia, el cliente se reconecta automáticamente y envía sus eventos almacenados en buffer
connect
5
6
7
8
9
10
11
```
