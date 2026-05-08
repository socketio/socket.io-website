---
title: Escuchar eventos
sidebar_position: 2
slug: /listening-to-events/
---

Hay varias formas de manejar eventos que se transmiten entre el servidor y el cliente.

## Métodos de EventEmitter

En el lado del servidor, la instancia Socket extiende la clase [EventEmitter](https://nodejs.org/docs/latest/api/events.html#events_events) de Node.js.

En el lado del cliente, la instancia Socket usa el emisor de eventos proporcionado por la biblioteca [component-emitter](https://github.com/component/emitter), que expone un subconjunto de los métodos de EventEmitter.

### socket.on(eventName, listener)

Agrega la función *listener* al final del array de listeners para el evento llamado *eventName*.

```js
socket.on("details", (...args) => {
  // ...
});
```

### socket.once(eventName, listener)

Agrega una función *listener* **de una sola vez** para el evento llamado *eventName*

```js
socket.once("details", (...args) => {
  // ...
});
```

### socket.off(eventName, listener)

Elimina el *listener* especificado del array de listeners para el evento llamado *eventName*.

```js
const listener = (...args) => {
  console.log(args);
}

socket.on("details", listener);

// y luego más tarde...
socket.off("details", listener);
```

### socket.removeAllListeners([eventName])

Elimina todos los listeners, o aquellos del *eventName* especificado.

```js
// para un evento específico
socket.removeAllListeners("details");
// para todos los eventos
socket.removeAllListeners();
```

## Listeners catch-all

Desde Socket.IO v3, una nueva API inspirada en la biblioteca [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) permite declarar listeners catch-all.

Esta característica está disponible tanto en el cliente como en el servidor.

### socket.onAny(listener)

Agrega un listener que será disparado cuando cualquier evento sea emitido.

```js
socket.onAny((eventName, ...args) => {
  // ...
});
```

:::caution

Los [Acknowledgements](./emitting-events.md#acknowledgements) no son capturados en el listener catch-all.

```js
socket.emit("foo", (value) => {
  // ...
});

socket.onAnyOutgoing(() => {
  // se activa cuando el evento es enviado
});

socket.onAny(() => {
  // no se activa cuando se recibe el acknowledgement
});
```

:::

### socket.prependAny(listener)

Agrega un listener que será disparado cuando cualquier evento sea emitido. El listener se agrega al principio del array de listeners.

```js
socket.prependAny((eventName, ...args) => {
  // ...
});
```

### socket.offAny([listener])

Elimina todos los listeners catch-all, o el listener dado.

```js
const listener = (eventName, ...args) => {
  console.log(eventName, args);
}

socket.onAny(listener);

// y luego más tarde...
socket.offAny(listener);

// o todos los listeners
socket.offAny();
```

### socket.onAnyOutgoing(listener)

Registra un nuevo listener catch-all para paquetes salientes.

```js
socket.onAnyOutgoing((event, ...args) => {
  // ...
});
```

:::caution

Los [Acknowledgements](./emitting-events.md#acknowledgements) no son capturados en el listener catch-all.

```js
socket.on("foo", (value, callback) => {
  callback("OK");
});

socket.onAny(() => {
  // se activa cuando el evento es recibido
});

socket.onAnyOutgoing(() => {
  // no se activa cuando el acknowledgement es enviado
});
```

:::

### socket.prependAnyOutgoing(listener)

Registra un nuevo listener catch-all para paquetes salientes. El listener se agrega al principio del array de listeners.

```js
socket.prependAnyOutgoing((event, ...args) => {
  // ...
});
```

### socket.offAnyOutgoing([listener])

Elimina el listener previamente registrado. Si no se proporciona un listener, se eliminan todos los listeners catch-all.

```js
const listener = (eventName, ...args) => {
  console.log(eventName, args);
}

socket.onAnyOutgoing(listener);

// eliminar un solo listener
socket.offAnyOutgoing(listener);

// eliminar todos los listeners
socket.offAnyOutgoing();
```

## Validación

La validación de los argumentos de eventos está fuera del alcance de la biblioteca Socket.IO.

Hay muchos paquetes en el ecosistema JS que cubren este caso de uso, entre ellos:

- [zod](https://zod.dev/)
- [joi](https://www.npmjs.com/package/joi)
- [ajv](https://www.npmjs.com/package/ajv)
- [validatorjs](https://www.npmjs.com/package/validatorjs)

Ejemplo con [joi](https://joi.dev/api/) y [acknowledgements](emitting-events.md#acknowledgements):

```js
const Joi = require("joi");

const userSchema = Joi.object({
  username: Joi.string().max(30).required(),
  email: Joi.string().email().required()
});

io.on("connection", (socket) => {
  socket.on("create user", (payload, callback) => {
    if (typeof callback !== "function") {
      // no es un acknowledgement
      return socket.disconnect();
    }
    const { error, value } = userSchema.validate(payload);
    if (error) {
      return callback({
        status: "Bad Request",
        error
      });
    }
    // hacer algo con el valor, y luego
    callback({
      status: "OK"
    });
  });

});
```

## Manejo de errores

Actualmente no hay manejo de errores incorporado en la biblioteca Socket.IO, lo que significa que debes capturar cualquier error que pueda lanzarse en un listener.

```js
io.on("connection", (socket) => {
  socket.on("list items", async (callback) => {
    try {
      const items = await findItems();
      callback({
        status: "OK",
        items
      });
    } catch (e) {
      callback({
        status: "NOK"
      });
    }
  });
});
```

Esto puede ser refactorizado en:

```js
const errorHandler = (handler) => {
  const handleError = (err) => {
    console.error("por favor manéjame", err);
  };

  return (...args) => {
    try {
      const ret = handler.apply(this, args);
      if (ret && typeof ret.catch === "function") {
        // handler asíncrono
        ret.catch(handleError);
      }
    } catch (e) {
      // handler síncrono
      handleError(e);
    }
  };
};

// lado del servidor o cliente
socket.on("hello", errorHandler(() => {
  throw new Error("entremos en pánico");
}));
```
