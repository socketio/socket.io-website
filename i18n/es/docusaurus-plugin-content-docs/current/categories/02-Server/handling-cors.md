---
title: Manejo de CORS
sidebar_position: 8
slug: /handling-cors/
---

## ¿Qué es CORS?

Referencia: https://developer.mozilla.org/es/docs/Web/HTTP/CORS

Cross-Origin Resource Sharing (CORS) es una característica de seguridad aplicada por los navegadores web que controla cómo los recursos pueden ser obtenidos desde un origen diferente al que está ejecutando la aplicación web. Un "origen" se define por la combinación de un esquema (como `https://`), un dominio y un puerto:

- El origen `https://example.com` es diferente de `http://example.com` porque los protocolos difieren.
- El origen `https://api.example.com` es diferente de `https://example.com` porque los dominios difieren.
- El origen `https://example.com:8080` es diferente de `https://example.com` porque los puertos difieren.

Por defecto, los navegadores bloquean las solicitudes hechas por JavaScript ejecutándose en un origen hacia recursos alojados en otro origen, a menos que el servidor lo permita explícitamente. Esta restricción está diseñada para prevenir que scripts maliciosos accedan a datos sensibles de otros sitios.

Por ejemplo, digamos que un usuario de tu sitio web `https://buen-dominio.com` es dirigido al sitio web `https://mal-dominio.com` al hacer clic en un enlace de correo electrónico fraudulento. Gracias a CORS, el navegador de tu usuario bloqueará cualquier solicitud que intente llegar a tu sitio web `https://buen-dominio.com`, asegurando que cualquier script malicioso en `https://mal-dominio.com` no pueda extraer datos o realizar acciones en tu sitio web en nombre de tu usuario.

Sin embargo, hay casos comunes donde realmente quieres permitir solicitudes de origen cruzado, por ejemplo:

- si tu backend está alojado en un subdominio diferente (ej. frontend en `https://example.com` y backend en `https://api.example.com`)
- para desarrollo local (ej. frontend en `http://localhost:3000` y backend en `http://localhost:8080`)

La opción [`cors`](../../server-options.md#cors) cubre estos casos de uso, ver [abajo](#configuración).

:::caution

Dos advertencias importantes:

- CORS solo aplica a navegadores

Incluso con la configuración CORS adecuada, un atacante todavía puede ejecutar un script en su máquina o en una VM y alcanzar tu sitio web. Las aplicaciones nativas tampoco están cubiertas.

- CORS solo aplica a HTTP long-polling

Las conexiones WebSocket no están sujetas a restricciones CORS.

Si quieres restringir quién puede realmente alcanzar tu sitio web, puedes usar la opción [`allowRequest`](../../server-options.md#allowrequest).

:::

## Configuración

Desde Socket.IO v3, necesitas habilitar explícitamente [Cross-Origin Resource Sharing](https://developer.mozilla.org/es/docs/Web/HTTP/CORS) (CORS).

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com"]
  }
});
```

Opciones disponibles:

| Opción                 | Descripción                                                                                                                                                                                                                                                                                                               |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `origin`               | Configura el encabezado CORS **Access-Control-Allow-Origin**.                                                                                                                                                                                                                                                             |
| `methods`              | Configura el encabezado CORS **Access-Control-Allow-Methods**. Espera una cadena delimitada por comas (ej: 'GET,PUT,POST') o un array (ej: `['GET', 'PUT', 'POST']`).                                                                                                                                                     |
| `allowedHeaders`       | Configura el encabezado CORS **Access-Control-Allow-Headers**. Espera una cadena delimitada por comas (ej: 'Content-Type,Authorization') o un array (ej: `['Content-Type', 'Authorization']`). Si no se especifica, por defecto refleja los encabezados especificados en el encabezado **Access-Control-Request-Headers** de la solicitud. |
| `exposedHeaders`       | Configura el encabezado CORS **Access-Control-Expose-Headers**. Espera una cadena delimitada por comas (ej: 'Content-Range,X-Content-Range') o un array (ej: `['Content-Range', 'X-Content-Range']`). Si no se especifica, no se exponen encabezados personalizados.                                                       |
| `credentials`          | Configura el encabezado CORS **Access-Control-Allow-Credentials**. Establece a `true` para pasar el encabezado, de lo contrario se omite.                                                                                                                                                                                 |
| `maxAge`               | Configura el encabezado CORS **Access-Control-Max-Age**. Establece a un entero para pasar el encabezado, de lo contrario se omite.                                                                                                                                                                                        |
| `preflightContinue`    | Pasa la respuesta preflight de CORS al siguiente manejador.                                                                                                                                                                                                                                                               |
| `optionsSuccessStatus` | Proporciona un código de estado para usar en solicitudes `OPTIONS` exitosas, ya que algunos navegadores antiguos (IE11, varios SmartTVs) fallan con `204`.                                                                                                                                                                |

Valores posibles para la opción `origin`:

- `Boolean` - establece `origin` a `true` para reflejar el [origen de la solicitud](http://tools.ietf.org/html/draft-abarth-origin-09), como se define por `req.header('Origin')`, o establécelo a `false` para deshabilitar CORS.
- `String` - establece `origin` a un origen específico. Por ejemplo si lo estableces a `"http://example.com"` solo se permitirán solicitudes de "http://example.com".
- `RegExp` - establece `origin` a un patrón de expresión regular que se usará para probar el origen de la solicitud. Si coincide, el origen de la solicitud se reflejará. Por ejemplo el patrón `/example\.com$/` reflejará cualquier solicitud que venga de un origen que termine con "example.com".
- `Array` - establece `origin` a un array de orígenes válidos. Cada origen puede ser un `String` o un `RegExp`. Por ejemplo `["http://example1.com", /\.example2\.com$/]` aceptará cualquier solicitud de "http://example1.com" o de un subdominio de "example2.com".
- `Function` - establece `origin` a una función que implementa alguna lógica personalizada. La función toma el origen de la solicitud como el primer parámetro y un callback (que espera la firma `err [object], allow [bool]`) como el segundo.

Ejemplo con cookies ([withCredentials](https://developer.mozilla.org/es/docs/Web/API/XMLHttpRequest/withCredentials)) y encabezados adicionales:

```js
// lado del servidor
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// lado del cliente
import { io } from "socket.io-client";
const socket = io("https://api.example.com", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});
```

Nota: esto también aplica a localhost si tu aplicación web y tu servidor no se sirven desde el mismo puerto

```js
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:8080"]
  }
});

httpServer.listen(3000);
```

Puedes denegar todas las solicitudes de origen cruzado con la opción [`allowRequest`](../../server-options.md#allowrequest):

```js
const io = new Server(httpServer, {
  allowRequest: (req, callback) => {
    const noOriginHeader = req.headers.origin === undefined;
    callback(null, noOriginHeader); // solo permite solicitudes sin encabezado 'origin'
  }
});
```

## Solución de problemas

### Falta el encabezado CORS 'Access-Control-Allow-Origin'

Mensaje de error completo:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at .../socket.io/?EIO=4&transport=polling&t=NMnp2WI. (Reason: CORS header 'Access-Control-Allow-Origin' missing).</i>

Si has configurado correctamente tu servidor (ver [arriba](#configuración)), esto podría significar que tu navegador no pudo alcanzar el servidor Socket.IO.

El siguiente comando:

```
curl "https://api.example.com/socket.io/?EIO=4&transport=polling"
```

debería devolver algo como:

```
0{"sid":"Lbo5JLzTotvW3g2LAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}
```

Si ese no es el caso, por favor verifica que tu servidor esté escuchando y sea realmente alcanzable en el puerto dado.

### La credencial no es soportada si el encabezado CORS 'Access-Control-Allow-Origin' es '*'

Mensaje de error completo:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at '.../socket.io/?EIO=4&transport=polling&t=NvQfU77'. (Reason: Credential is not supported if the CORS header 'Access-Control-Allow-Origin' is '*')</i>

No puedes establecer [`withCredentials`](../../client-options.md#withcredentials) a `true` con `origin: *`, necesitas usar un origen específico:

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["https://my-frontend.com"],
    credentials: true
  }
});
```

### Se esperaba 'true' en el encabezado CORS 'Access-Control-Allow-Credentials'

Mensaje de error completo:

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at .../socket.io/?EIO=4&transport=polling&t=NvQny19. (Reason: expected 'true' in CORS header 'Access-Control-Allow-Credentials')</i>

En ese caso, [`withCredentials`](../../client-options.md#withcredentials) está establecido a `true` en el cliente, pero al servidor le falta el atributo `credentials` en la opción [`cors`](../../server-options.md#cors). Ver el ejemplo de arriba.
