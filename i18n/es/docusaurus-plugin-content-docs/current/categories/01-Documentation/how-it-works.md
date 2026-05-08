---
title: Cómo funciona
sidebar_position: 2
slug: /how-it-works/
---

El canal bidireccional entre el servidor Socket.IO (Node.js) y el cliente Socket.IO (navegador, Node.js, u [otro lenguaje de programación](index.md#qué-es-socketio)) se establece con una [conexión WebSocket](https://developer.mozilla.org/es/docs/Web/API/WebSocket) siempre que sea posible, y usará HTTP long-polling como respaldo.

El código base de Socket.IO está dividido en dos capas distintas:

- la plomería de bajo nivel: lo que llamamos Engine.IO, el motor dentro de Socket.IO
- la API de alto nivel: Socket.IO en sí

## Engine.IO

Engine.IO es responsable de establecer la conexión de bajo nivel entre el servidor y el cliente. Se encarga de:

- los diversos [transportes](#transportes) y el [mecanismo de actualización](#mecanismo-de-actualización)
- la [detección de desconexión](#detección-de-desconexión)

Una versión detallada del protocolo Engine.IO se puede encontrar [aquí](../08-Miscellaneous/eio-protocol.md).

El código fuente de la implementación de referencia (escrita en TypeScript) se puede encontrar aquí:

- servidor: https://github.com/socketio/engine.io
- cliente: https://github.com/socketio/engine.io-client
- parser: https://github.com/socketio/engine.io-parser

### Transportes

Actualmente hay dos transportes implementados:

- [HTTP long-polling](#http-long-polling)
- [WebSocket](#websocket)

#### HTTP long-polling

El transporte HTTP long-polling (también llamado simplemente "polling") consiste en solicitudes HTTP sucesivas:

- solicitudes `GET` de larga duración, para recibir datos del servidor
- solicitudes `POST` de corta duración, para enviar datos al servidor

Debido a la naturaleza del transporte, emisiones sucesivas pueden concatenarse y enviarse dentro de la misma solicitud HTTP.

#### WebSocket

El transporte WebSocket consiste, bueno, en una [conexión WebSocket](https://developer.mozilla.org/es/docs/Web/API/WebSockets_API), que proporciona un canal de comunicación bidireccional y de baja latencia entre el servidor y el cliente.

Debido a la naturaleza del transporte, cada emisión se envía en su propio frame WebSocket (algunas emisiones pueden incluso resultar en dos frames WebSocket distintos, más información [aquí](../06-Advanced/custom-parser.md#the-default-parser)).

### Handshake

Al comienzo de la conexión Engine.IO, el servidor envía alguna información:

```json
{
  "sid": "FSDjX-WRwSA4zTZMALqx",
  "upgrades": ["websocket"],
  "pingInterval": 25000,
  "pingTimeout": 20000,
  "maxPayload": 1000000
}
```

- el `sid` es el ID de la sesión, debe incluirse en el parámetro de consulta `sid` en todas las solicitudes HTTP posteriores
- el array `upgrades` contiene la lista de todos los transportes "mejores" que son soportados por el servidor
- los valores `pingInterval` y `pingTimeout` se usan en el mecanismo de heartbeat
- el valor `maxPayload` indica el número máximo de bytes por paquete aceptado por el servidor

### Mecanismo de actualización

Por defecto, el cliente establece la conexión con el transporte HTTP long-polling.

**Pero, ¿por qué?**

Aunque WebSocket es claramente la mejor manera de establecer una comunicación bidireccional, la experiencia ha demostrado que no siempre es posible establecer una conexión WebSocket, debido a proxies corporativos, firewalls personales, software antivirus...

Desde la perspectiva del usuario, una conexión WebSocket fallida puede traducirse en hasta 10 segundos de espera para que la aplicación en tiempo real comience a intercambiar datos. Esto **perceptiblemente** afecta la experiencia del usuario.

En resumen, Engine.IO se enfoca primero en la fiabilidad y la experiencia del usuario, y segundo en mejoras marginales potenciales de UX y mayor rendimiento del servidor.

Para actualizar, el cliente:

- se asegura de que su búfer de salida esté vacío
- pone el transporte actual en modo de solo lectura
- intenta establecer una conexión con el otro transporte
- si tiene éxito, cierra el primer transporte

Puedes verificar en el Monitor de Red de tu navegador:

![Actualización exitosa](/images/network-monitor.png)

1. handshake (contiene el ID de sesión — aquí, `zBjrh...AAAK` — que se usa en las solicitudes posteriores)
2. enviar datos (HTTP long-polling)
3. recibir datos (HTTP long-polling)
4. actualización (WebSocket)
5. recibir datos (HTTP long-polling, cerrado una vez que la conexión WebSocket en 4. se establece exitosamente)

### Detección de desconexión

La conexión Engine.IO se considera cerrada cuando:

- una solicitud HTTP (ya sea GET o POST) falla (por ejemplo, cuando el servidor se apaga)
- la conexión WebSocket se cierra (por ejemplo, cuando el usuario cierra la pestaña en su navegador)
- `socket.disconnect()` se llama en el lado del servidor o del cliente

También hay un mecanismo de heartbeat que verifica que la conexión entre el servidor y el cliente sigue activa y funcionando:

En un intervalo dado (el valor `pingInterval` enviado en el handshake) el servidor envía un paquete PING y el cliente tiene unos segundos (el valor `pingTimeout`) para enviar un paquete PONG de vuelta. Si el servidor no recibe un paquete PONG de vuelta, considerará que la conexión está cerrada. De manera inversa, si el cliente no recibe un paquete PING dentro de `pingInterval + pingTimeout`, considerará que la conexión está cerrada.

Las razones de desconexión se enumeran [aquí](../02-Server/server-socket-instance.md#disconnect) (lado del servidor) y [aquí](../03-Client/client-socket-instance.md#disconnect) (lado del cliente).


## Socket.IO

Socket.IO proporciona algunas características adicionales sobre la conexión Engine.IO:

- reconexión automática
- [almacenamiento en búfer de paquetes](../03-Client/client-offline-behavior.md#buffered-events)
- [confirmaciones](../04-Events/emitting-events.md#acknowledgements)
- broadcasting [a todos los clientes](../04-Events/broadcasting-events.md) o [a un subconjunto de clientes](../04-Events/rooms.md) (lo que llamamos "Room")
- [multiplexación](../06-Advanced/namespaces.md) (lo que llamamos "Namespace")

Una versión detallada del protocolo Socket.IO se puede encontrar [aquí](../08-Miscellaneous/sio-protocol.md).

El código fuente de la implementación de referencia (escrita en TypeScript) se puede encontrar aquí:

- servidor: https://github.com/socketio/socket.io
- cliente: https://github.com/socketio/socket.io-client
- parser: https://github.com/socketio/socket.io-parser
