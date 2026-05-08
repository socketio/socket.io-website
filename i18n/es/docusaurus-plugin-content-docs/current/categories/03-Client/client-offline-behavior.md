---
title: Comportamiento offline
sidebar_position: 4
slug: /client-offline-behavior/
---

## Eventos almacenados en buffer

Por defecto, cualquier evento emitido mientras el Socket no está conectado será almacenado en buffer hasta la reconexión.

Aunque es útil en la mayoría de los casos (cuando el retraso de reconexión es corto), podría resultar en un enorme pico de eventos cuando la conexión se restaura.

Hay varias soluciones para prevenir este comportamiento, dependiendo de tu caso de uso:

- usa el atributo [connected](client-socket-instance.md#socketconnected) de la instancia Socket

```js
if (socket.connected) {
  socket.emit( /* ... */ );
} else {
  // ...
}
```

- usa [eventos volátiles](../04-Events/emitting-events.md#volatile-events)

```js
socket.volatile.emit( /* ... */ );
```
