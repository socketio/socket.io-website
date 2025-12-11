---
title: Solución de problemas de conexión
sidebar_label: Solución de problemas
sidebar_position: 7
slug: /troubleshooting-connection-issues/
toc_max_heading_level: 4
---

:::tip

La [Interfaz de Administración](../06-Advanced/admin-ui.md) puede darte información adicional sobre el estado de tu despliegue de Socket.IO.

:::

Problemas comunes/conocidos:

- [el socket no puede conectarse](#problema-el-socket-no-puede-conectarse)
- [el socket se desconecta](#problema-el-socket-se-desconecta)
- [el socket está atascado en HTTP long-polling](#problema-el-socket-está-atascado-en-http-long-polling)

Otros errores comunes:

- [Registro duplicado de eventos](#registro-duplicado-de-eventos)
- [Registro retrasado del manejador de eventos](#registro-retrasado-del-manejador-de-eventos)
- [Uso del atributo `socket.id`](#uso-del-atributo-socketid)
- [Despliegue en una plataforma serverless](#despliegue-en-una-plataforma-serverless)


## Problema: el socket no puede conectarse

### Pasos de solución de problemas

En el lado del cliente, el evento `connect_error` proporciona información adicional:

```js
socket.on("connect_error", (err) => {
  // la razón del error, por ejemplo "xhr poll error"
  console.log(err.message);

  // alguna descripción adicional, por ejemplo el código de estado de la respuesta HTTP inicial
  console.log(err.description);

  // algún contexto adicional, por ejemplo el objeto XMLHttpRequest
  console.log(err.context);
});
```

En el lado del servidor, el evento `connection_error` también puede proporcionar información adicional:

```js
io.engine.on("connection_error", (err) => {
  console.log(err.req);      // el objeto de solicitud
  console.log(err.code);     // el código de error, por ejemplo 1
  console.log(err.message);  // el mensaje de error, por ejemplo "Session ID unknown"
  console.log(err.context);  // algún contexto adicional del error
});
```

Aquí está la lista de posibles códigos de error:

| Código |            Mensaje             | Posibles explicaciones                                                                                                                                                     |
|:------:|:------------------------------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|   0    |      "Transport unknown"       | Esto no debería suceder bajo circunstancias normales.                                                                                                                       |
|   1    |      "Session ID unknown"      | Usualmente, esto significa que las sesiones sticky no están habilitadas (ver [abajo](#no-habilitaste-sesiones-sticky-en-una-configuración-de-múltiples-servidores)).        |
|   2    |     "Bad handshake method"     | Esto no debería suceder bajo circunstancias normales.                                                                                                                       |
|   3    |         "Bad request"          | Usualmente, esto significa que un proxy frente a tu servidor no está reenviando correctamente los encabezados WebSocket (ver [aquí](../02-Server/behind-a-reverse-proxy.md)). |
|   4    |          "Forbidden"           | La conexión fue denegada por el método [`allowRequest()`](../../server-options.md#allowrequest).                                                                            |
|   5    | "Unsupported protocol version" | La versión del cliente no es compatible con el servidor (ver [aquí](#el-cliente-no-es-compatible-con-la-versión-del-servidor)).                                            |

### Posibles explicaciones

#### Estás intentando alcanzar un servidor WebSocket simple

Como se explicó en la sección ["Qué NO es Socket.IO"](index.md#qué-no-es-socketio), el cliente Socket.IO no es una implementación de WebSocket y por lo tanto no podrá establecer una conexión con un servidor WebSocket, incluso con `transports: ["websocket"]`:

```js
const socket = io("ws://echo.websocket.org", {
  transports: ["websocket"]
});
```

#### El servidor no es alcanzable

Por favor asegúrate de que el servidor Socket.IO sea realmente alcanzable en la URL dada. Puedes probarlo con:

```
curl "<la URL del servidor>/socket.io/?EIO=4&transport=polling"
```

lo cual debería devolver algo como esto:

```
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}
```

Si ese no es el caso, por favor verifica que el servidor Socket.IO esté ejecutándose, y que no haya nada entre medio que prevenga la conexión.

:::note

Los servidores v1/v2 (que implementan la v3 del protocolo, de ahí el `EIO=3`) devolverán algo como esto:

```
96:0{"sid":"ptzi_578ycUci8WLB9G1","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":5000}2:40
```

:::

#### El cliente no es compatible con la versión del servidor

Mantener la compatibilidad hacia atrás es una prioridad principal para nosotros, pero en algunos casos particulares tuvimos que implementar algunos cambios importantes a nivel de protocolo:

- de v1.x a v2.0.0 (lanzado en mayo de 2017), para mejorar la compatibilidad con clientes que no son JavaScript (ver [aquí](https://github.com/socketio/engine.io/issues/315))
- de v2.x a v3.0.0 (lanzado en noviembre de 2020), para arreglar algunos problemas de larga data en el protocolo de una vez por todas (ver [aquí](../07-Migrations/migrating-from-2-to-3.md))

:::info

`v4.0.0` contiene algunos cambios importantes en la API del servidor JavaScript. El protocolo Socket.IO en sí no fue actualizado, por lo que un cliente v3 podrá alcanzar un servidor v4 y viceversa (ver [aquí](../07-Migrations/migrating-from-3-to-4.md)).

:::

Por ejemplo, alcanzar un servidor v3/v4 con un cliente v1/v2 resultará en la siguiente respuesta:

```
< HTTP/1.1 400 Bad Request
< Content-Type: application/json

{"code":5,"message":"Unsupported protocol version"}
```

Aquí está la tabla de compatibilidad para el [cliente JS](https://github.com/socketio/socket.io-client/):

<table>
    <tr>
        <th rowspan="2">Versión del cliente JS</th>
        <th colspan="4">Versión del servidor Socket.IO</th>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">NO</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center"><b>SÍ</b><sup>1</sup></td>
        <td align="center"><b>SÍ</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">3.x</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center"><b>SÍ</b></td>
    </tr>
    <tr>
        <td align="center">4.x</td>
        <td align="center">NO</td>
        <td align="center">NO</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center"><b>SÍ</b></td>
    </tr>
</table>

[1] Sí, con [allowEIO3: true](../../server-options.md#alloweio3)

Aquí está la tabla de compatibilidad para el [cliente Java](https://github.com/socketio/socket.io-client-java/):

<table>
    <tr>
        <th rowspan="2">Versión del cliente Java</th>
        <th colspan="3">Versión del servidor Socket.IO</th>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">1.x</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center"><b>SÍ</b><sup>1</sup></td>
        <td align="center"><b>SÍ</b><sup>1</sup></td>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">NO</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center"><b>SÍ</b></td>
    </tr>
</table>

[1] Sí, con [allowEIO3: true](../../server-options.md#alloweio3)

Aquí está la tabla de compatibilidad para el [cliente Swift](https://github.com/socketio/socket.io-client-swift/):

<table>
    <tr>
        <th rowspan="2">Versión del cliente Swift</th>
        <th colspan="3">Versión del servidor Socket.IO</th>
    </tr>
    <tr>
        <td align="center">2.x</td>
        <td align="center">3.x</td>
        <td align="center">4.x</td>
    </tr>
    <tr>
        <td align="center">v15.x</td>
        <td align="center"><b>SÍ</b></td>
        <td align="center"><b>SÍ</b><sup>1</sup></td>
        <td align="center"><b>SÍ</b><sup>2</sup></td>
    </tr>
    <tr>
        <td align="center">v16.x</td>
        <td align="center"><b>SÍ</b><sup>3</sup></td>
        <td align="center"><b>SÍ</b></td>
        <td align="center"><b>SÍ</b></td>
    </tr>
</table>

[1] Sí, con [allowEIO3: true](../../server-options.md#alloweio3) (servidor) y `.connectParams(["EIO": "3"])` (cliente):

```swift
SocketManager(socketURL: URL(string:"http://localhost:8087/")!, config: [.connectParams(["EIO": "3"])])
```

[2] Sí, [allowEIO3: true](../../server-options.md#alloweio3) (servidor)

[3] Sí, con `.version(.two)` (cliente):

```swift
SocketManager(socketURL: URL(string:"http://localhost:8087/")!, config: [.version(.two)])
```

#### El servidor no envía los encabezados CORS necesarios

Si ves el siguiente error en tu consola:

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ...
```

Probablemente significa que:

- o no estás realmente alcanzando el servidor Socket.IO (ver [arriba](#el-servidor-no-es-alcanzable))
- o no habilitaste [Cross-Origin Resource Sharing](https://developer.mozilla.org/es/docs/Web/HTTP/CORS) (CORS) en el lado del servidor.

Por favor consulta la documentación [aquí](../02-Server/handling-cors.md).

#### No habilitaste sesiones sticky (en una configuración de múltiples servidores)

Al escalar a múltiples servidores Socket.IO, necesitas asegurarte de que todas las solicitudes de una sesión Socket.IO dada lleguen al mismo servidor Socket.IO. La explicación se puede encontrar [aquí](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

No hacerlo resultará en respuestas HTTP 400 con el código: `{"code":1,"message":"Session ID unknown"}`

Por favor consulta la documentación [aquí](../02-Server/using-multiple-nodes.md).

#### La ruta de solicitud no coincide en ambos lados

Por defecto, el cliente envía — y el servidor espera — solicitudes HTTP con la ruta de solicitud "/socket.io/".

Esto puede controlarse con la opción `path`:

*Servidor*

```js
import { Server } from "socket.io";

const io = new Server({
  path: "/my-custom-path/"
});

io.listen(3000);
```

*Cliente*

```js
import { io } from "socket.io-client";

const socket = io(SERVER_URL, {
  path: "/my-custom-path/"
});
```

En ese caso, las solicitudes HTTP se verán como `<SERVER_URL>/my-custom-path/?EIO=4&transport=polling[&...]`.

:::caution

```js
import { io } from "socket.io-client";

const socket = io("/my-custom-path/");
```

significa que el cliente intentará alcanzar el [namespace](../06-Advanced/namespaces.md) llamado "/my-custom-path/", pero la ruta de solicitud seguirá siendo "/socket.io/".

:::

## Problema: el socket se desconecta

### Pasos de solución de problemas

Primero y ante todo, por favor nota que las desconexiones son comunes y esperadas, incluso en una conexión a Internet estable:

- cualquier cosa entre el usuario y el servidor Socket.IO puede encontrar una falla temporal o ser reiniciada
- el servidor en sí puede ser terminado como parte de una política de autoescalado
- el usuario puede perder la conexión o cambiar de WiFi a 4G, en caso de un navegador móvil
- el navegador en sí puede congelar una pestaña inactiva

Dicho esto, el cliente Socket.IO siempre intentará reconectarse, a menos que se le indique específicamente [lo contrario](../../client-options.md#reconnection).

El evento `disconnect` proporciona información adicional:

```js
socket.on("disconnect", (reason, details) => {
  // la razón de la desconexión, por ejemplo "transport error"
  console.log(reason);

  // la razón de bajo nivel de la desconexión, por ejemplo "xhr post error"
  console.log(details.message);

  // alguna descripción adicional, por ejemplo el código de estado de la respuesta HTTP
  console.log(details.description);

  // algún contexto adicional, por ejemplo el objeto XMLHttpRequest
  console.log(details.context);
});
```

Las posibles razones se enumeran [aquí](../03-Client/client-socket-instance.md#disconnect).

### Posibles explicaciones

#### Algo entre el servidor y el cliente cierra la conexión

Si la desconexión ocurre a intervalos regulares, esto podría indicar que algo entre el servidor y el cliente no está configurado correctamente y cierra la conexión:

- nginx

El valor de [`proxy_read_timeout`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout) de nginx (60 segundos por defecto) debe ser mayor que [`pingInterval + pingTimeout`](../../server-options.md#pinginterval) de Socket.IO (45 segundos por defecto), de lo contrario cerrará forzosamente la conexión si no se envían datos después del retraso dado y el cliente obtendrá un error "transport close".

- Apache HTTP Server

El valor de [`ProxyTimeout`](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#proxytimeout) de httpd (60 segundos por defecto) debe ser mayor que [`pingInterval + pingTimeout`](../../server-options.md#pinginterval) de Socket.IO (45 segundos por defecto), de lo contrario cerrará forzosamente la conexión si no se envían datos después del retraso dado y el cliente obtendrá un error "transport close".

#### La pestaña del navegador fue minimizada y el heartbeat falló

Cuando una pestaña del navegador no está en foco, algunos navegadores (como [Chrome](https://developer.chrome.com/blog/timer-throttling-in-chrome-88/#intensive-throttling)) limitan los temporizadores de JavaScript, lo que podría llevar a una desconexión por timeout de ping **en Socket.IO v2**, ya que el mecanismo de heartbeat dependía de la función `setTimeout` en el lado del cliente.

Como solución alternativa, puedes aumentar el valor de `pingTimeout` en el lado del servidor:

```js
const io = new Server({
  pingTimeout: 60000
});
```

Por favor nota que actualizar a Socket.IO v4 (al menos `socket.io-client@4.1.3`, debido a [esto](https://github.com/socketio/engine.io-client/commit/f30a10b7f45517fcb3abd02511c58a89e0ef498f)) debería prevenir este tipo de problemas, ya que el mecanismo de heartbeat ha sido invertido (el servidor ahora envía paquetes PING).

#### El cliente no es compatible con la versión del servidor

Dado que el formato de los paquetes enviados sobre el transporte WebSocket es similar en v2 y v3/v4, podrías ser capaz de conectar con un cliente incompatible (ver [arriba](#el-cliente-no-es-compatible-con-la-versión-del-servidor)), pero la conexión eventualmente se cerrará después de un retraso dado.

Así que si estás experimentando una desconexión regular después de 30 segundos (que era la suma de los valores de [pingTimeout](../../server-options.md#pingtimeout) y [pingInterval](../../server-options.md#pinginterval) en Socket.IO v2), esto ciertamente se debe a una incompatibilidad de versiones.

#### Estás intentando enviar una carga útil enorme

Si te desconectas mientras envías una carga útil enorme, esto puede significar que has alcanzado el valor de [`maxHttpBufferSize`](../../server-options.md#maxhttpbuffersize), que por defecto es 1 MB. Por favor ajústalo según tus necesidades:

```js
const io = require("socket.io")(httpServer, {
  maxHttpBufferSize: 1e8
});
```

Una carga útil enorme que toma más tiempo en subir que el valor de la opción [`pingTimeout`](../../server-options.md#pingtimeout) también puede desencadenar una desconexión (ya que el [mecanismo de heartbeat](../01-Documentation/how-it-works.md#detección-de-desconexión) falla durante la subida). Por favor ajústalo según tus necesidades:

```js
const io = require("socket.io")(httpServer, {
  pingTimeout: 60000
});
```

## Problema: el socket está atascado en HTTP long-polling

### Pasos de solución de problemas

En la mayoría de los casos, deberías ver algo como esto:

![Monitor de red al éxito](/images/network-monitor.png)

1. el handshake de Engine.IO (contiene el ID de sesión — aquí, `zBjrh...AAAK` — que se usa en las solicitudes posteriores)
2. la solicitud de handshake de Socket.IO (contiene el valor de la opción `auth`)
3. la respuesta de handshake de Socket.IO (contiene el [Socket#id](../02-Server/server-socket-instance.md#socketid))
4. la conexión WebSocket
5. la primera solicitud HTTP long-polling, que se cierra una vez que la conexión WebSocket se establece

Si no ves una respuesta [HTTP 101 Switching Protocols](https://developer.mozilla.org/es/docs/Web/HTTP/Status/101) para la 4ta solicitud, eso significa que algo entre el servidor y tu navegador está previniendo la conexión WebSocket.

Por favor nota que esto no es necesariamente bloqueante ya que la conexión todavía se establece con HTTP long-polling, pero es menos eficiente.

Puedes obtener el nombre del transporte actual con:

**Lado del cliente**

```js
socket.on("connect", () => {
  const transport = socket.io.engine.transport.name; // en la mayoría de los casos, "polling"

  socket.io.engine.on("upgrade", () => {
    const upgradedTransport = socket.io.engine.transport.name; // en la mayoría de los casos, "websocket"
  });
});
```

**Lado del servidor**

```js
io.on("connection", (socket) => {
  const transport = socket.conn.transport.name; // en la mayoría de los casos, "polling"

  socket.conn.on("upgrade", () => {
    const upgradedTransport = socket.conn.transport.name; // en la mayoría de los casos, "websocket"
  });
});
```

### Posibles explicaciones

#### Un proxy frente a tus servidores no acepta la conexión WebSocket

Si un proxy como nginx o Apache HTTPD no está configurado correctamente para aceptar conexiones WebSocket, entonces podrías obtener un error `TRANSPORT_MISMATCH`:

```js
io.engine.on("connection_error", (err) => {
  console.log(err.code);     // 3
  console.log(err.message);  // "Bad request"
  console.log(err.context);  // { name: 'TRANSPORT_MISMATCH', transport: 'websocket', previousTransport: 'polling' }
});
```

Lo que significa que el servidor Socket.IO no recibe el encabezado `Connection: upgrade` necesario (puedes verificar el objeto `err.req.headers`).

Por favor consulta la documentación [aquí](../02-Server/behind-a-reverse-proxy.md).

#### [`express-status-monitor`](https://www.npmjs.com/package/express-status-monitor) ejecuta su propia instancia de socket.io

Por favor consulta la solución [aquí](https://github.com/RafalWilinski/express-status-monitor).

## Otros errores comunes

### Registro duplicado de eventos

En el lado del cliente, el evento `connect` se emitirá cada vez que el socket se reconecte, por lo que los listeners de eventos deben registrarse fuera del listener del evento `connect`:

MAL :warning:

```js
socket.on("connect", () => {
  socket.on("foo", () => {
    // ...
  });
});
```

BIEN :+1:

```js
socket.on("connect", () => {
  // ...
});

socket.on("foo", () => {
  // ...
});
```

Si ese no es el caso, tu listener de eventos podría ser llamado múltiples veces.

### Registro retrasado del manejador de eventos

MAL :warning:

```js
io.on("connection", async (socket) => {
  await longRunningOperation();

  // ¡ADVERTENCIA! Algunos paquetes podrían ser recibidos por el servidor pero sin manejador
  socket.on("hello", () => {
    // ...
  });
});
```

BIEN :+1:

```js
io.on("connection", async (socket) => {
  socket.on("hello", () => {
    // ...
  });

  await longRunningOperation();
});
```

### Uso del atributo `socket.id`

Por favor nota que, a menos que la [recuperación del estado de conexión](../01-Documentation/connection-state-recovery.md) esté habilitada, el atributo `id` es un ID **efímero** que no está destinado a ser usado en tu aplicación (o solo para propósitos de depuración) porque:

- este ID se regenera después de cada reconexión (por ejemplo cuando la conexión WebSocket se corta, o cuando el usuario actualiza la página)
- dos pestañas diferentes del navegador tendrán dos IDs diferentes
- no hay cola de mensajes almacenada para un ID dado en el servidor (es decir, si el cliente está desconectado, los mensajes enviados desde el servidor a este ID se pierden)

Por favor usa un ID de sesión regular en su lugar (ya sea enviado en una cookie, o almacenado en localStorage y enviado en el payload de [`auth`](../../client-options.md#auth)).

Ver también:

- [Parte II de nuestra guía de mensajes privados](/get-started/private-messaging-part-2/)
- [Cómo lidiar con cookies](/how-to/deal-with-cookies)

### Despliegue en una plataforma serverless

Dado que la mayoría de las plataformas serverless (como Vercel) cobran por la duración del manejador de solicitudes, mantener una conexión de larga duración con Socket.IO (o incluso WebSocket simple) no es recomendado.

Referencias:

- https://vercel.com/guides/do-vercel-serverless-functions-support-websocket-connections
- https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html
