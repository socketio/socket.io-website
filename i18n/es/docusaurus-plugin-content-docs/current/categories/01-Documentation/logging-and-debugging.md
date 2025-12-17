---
title: Registro y depuración
sidebar_position: 5
slug: /logging-and-debugging/
---

Socket.IO ahora está completamente instrumentado por una utilidad minimalista pero tremendamente poderosa llamada [debug](https://github.com/visionmedia/debug) de TJ Holowaychuk.

Antes de la versión 1.0, el servidor Socket.IO registraba todo en la consola por defecto. Esto resultó ser molestamente verboso para muchos usuarios (aunque extremadamente útil para otros), así que ahora por defecto somos completamente silenciosos.

La idea básica es que cada módulo usado por Socket.IO proporciona diferentes ámbitos de depuración que te dan información sobre los internos. Por defecto, toda la salida está suprimida, y puedes optar por ver mensajes proporcionando la variable de entorno `DEBUG` (Node.js) o la propiedad `localStorage.debug` (navegadores).

Puedes verlo en acción, por ejemplo, en nuestra página de inicio:

<video controls id="debugging-vid" data-setup='{"autoplay":true,"loop":true, "techOrder": ["html5", "flash"], "height": 300}' class="video-js vjs-default-skin" autoplay loop width="100%"><source src="https://i.cloudup.com/transcoded/IL9alTr0eO.mp4" type="video/mp4" /></video>

## Ámbitos de depuración disponibles

La mejor manera de ver qué información está disponible es usar el `*`:

```
DEBUG=* node yourfile.js
```

o en el navegador:

```
localStorage.debug = '*';
```

Y luego filtrar por los ámbitos que te interesen. Puedes prefijar el `*` con ámbitos, separados por coma si hay más de uno. Por ejemplo, para ver solo las declaraciones de depuración del cliente socket.io en Node.js prueba esto:

```
DEBUG=socket.io:client* node yourfile.js
```

Para ver todos los mensajes de depuración del motor *y* socket.io:

```
DEBUG=engine,socket.io* node yourfile.js
```


### Eliminar debug de tu bundle del navegador

Aunque es útil durante el desarrollo, el paquete debug añade un peso extra al bundle final (aproximadamente 4KB minificado y comprimido con gzip), por eso está excluido del bundle slim (más detalles sobre los diversos bundles del navegador se pueden encontrar [aquí](../03-Client/client-installation.md#from-a-cdn)).

Si estás usando webpack, puedes eliminarlo con [webpack-remove-debug](https://github.com/johngodley/webpack-remove-debug):

```js
{
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'webpack-remove-debug'
      }
    ]
  }
}
```

## Registros de error en la consola del navegador

Por favor nota que los registros de error como:

- `net::ERR_INTERNET_DISCONNECTED`
- `net::ERR_CONNECTION_REFUSED`
- `WebSocket is already in CLOSING or CLOSED state`
- `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at xxx. (Reason: CORS header 'Access-Control-Allow-Origin' missing).`
- `The connection to xxx was interrupted while the page was loading`

no son emitidos por la biblioteca Socket.IO sino por el navegador en sí, y por lo tanto están fuera de nuestro control.
