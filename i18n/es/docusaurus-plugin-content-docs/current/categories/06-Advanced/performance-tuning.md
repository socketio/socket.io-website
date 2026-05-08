---
title: Ajuste de rendimiento
sidebar_position: 6
slug: /performance-tuning/
---

Aquí hay algunos consejos para mejorar el rendimiento de tu servidor Socket.IO:

- [a nivel de Socket.IO](#a-nivel-de-socketio)
- [a nivel del sistema operativo](#a-nivel-del-sistema-operativo)

También podrías estar interesado en [escalar a múltiples nodos](../02-Server/using-multiple-nodes.md).

## A nivel de Socket.IO

Ya que, en la mayoría de los casos, la conexión Socket.IO se establecerá con WebSocket, el rendimiento de tu servidor Socket.IO estará fuertemente ligado al rendimiento del servidor WebSocket subyacente ([`ws`](https://github.com/websockets/ws), por defecto).

### Instalar add-ons nativos de `ws`

`ws` viene con dos add-ons binarios opcionales que mejoran ciertas operaciones. Los binarios precompilados están disponibles para las plataformas más populares, así que no necesariamente necesitas tener un compilador C++ instalado en tu máquina.

- [bufferutil](https://www.npmjs.com/package/bufferutil): Permite realizar eficientemente operaciones como enmascarar y desenmascarar el payload de datos de los frames WebSocket.
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate): Permite verificar eficientemente si un mensaje contiene UTF-8 válido como lo requiere la especificación.

Para instalar esos paquetes:

```
$ npm install --save-optional bufferutil utf-8-validate
```

Por favor nota que estos paquetes son opcionales, el servidor WebSocket usará la implementación en Javascript si no están disponibles. Más información se puede encontrar [aquí](https://github.com/websockets/ws/#opt-in-for-performance-and-spec-compliance).

### Usar otra implementación de servidor WebSocket

Por ejemplo, puedes usar el paquete [eiows](https://www.npmjs.com/package/eiows), que es un fork del paquete (ahora obsoleto) [uws](https://www.npmjs.com/package/uws):

```
$ npm install eiows
```

Y luego usar la opción [`wsEngine`](../../server-options.md#wsengine):

```js
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  wsEngine: require("eiows").Server
});
```

### Usar un parser personalizado

Si envías datos binarios sobre la conexión Socket.IO, usar un [parser personalizado](custom-parser.md) como el basado en [msgpack](custom-parser.md#the-msgpack-parser) podría ser interesante, ya que por defecto cada buffer se enviará en su propio frame WebSocket.

Uso:

*Servidor*

```js
const { createServer } = require("http");
const { Server } = require("socket.io");
const parser = require("socket.io-msgpack-parser");

const httpServer = createServer();
const io = new Server(httpServer, {
  parser
});
```

*Cliente*

```js
const { io } = require("socket.io-client");
const parser = require("socket.io-msgpack-parser");

const socket = io("https://example.com", {
  parser
});
```

### Descartar la solicitud HTTP inicial

Por defecto, se mantiene en memoria una referencia a la primera solicitud HTTP de cada sesión. Esta referencia es necesaria cuando se trabaja con `express-session` por ejemplo (ver [aquí](/how-to/use-with-express-session)), pero puede descartarse para ahorrar memoria:

```js
io.engine.on("connection", (rawSocket) => {
  rawSocket.request = null;
});
```

## A nivel del sistema operativo

Hay muchos buenos artículos sobre cómo ajustar tu sistema operativo para aceptar un gran número de conexiones. Por favor consulta [este](https://medium.com/@elliekang/scaling-to-a-millions-websocket-concurrent-connections-at-spoon-radio-bbadd6ec1901) por ejemplo.

Al hacer [pruebas de carga](load-testing.md) a tu servidor Socket.IO, probablemente alcanzarás los dos siguientes límites:

- número máximo de archivos abiertos

Si no puedes superar las 1000 conexiones concurrentes (nuevos clientes no pueden conectarse), muy probablemente has alcanzado el número máximo de archivos abiertos:

```
$ ulimit -n
1024
```

Para aumentar este número, crea un nuevo archivo `/etc/security/limits.d/custom.conf` con el siguiente contenido (requiere privilegios de root):

```
* soft nofile 1048576
* hard nofile 1048576
```

Y luego recarga tu sesión. Tu nuevo límite ahora debería estar actualizado:

```
$ ulimit -n
1048576
```

- número máximo de puertos locales disponibles

Si no puedes superar las 28000 conexiones concurrentes, muy probablemente has alcanzado el número máximo de puertos locales disponibles:

```
$ cat /proc/sys/net/ipv4/ip_local_port_range
32768	60999
```

Para aumentar este número, crea un nuevo archivo `/etc/sysctl.d/net.ipv4.ip_local_port_range.conf` con el siguiente contenido (de nuevo, requiere privilegios de root):

```
net.ipv4.ip_local_port_range = 10000 65535
```

Nota: usamos `10000` como límite inferior para que no incluya los puertos que son usados por los servicios en la máquina (como `5432` para un servidor PostgreSQL), pero puedes totalmente usar un valor más bajo (hasta `1024`).

Una vez que reinicies tu máquina, ahora podrás alegremente llegar a 55k conexiones concurrentes (por IP entrante).
