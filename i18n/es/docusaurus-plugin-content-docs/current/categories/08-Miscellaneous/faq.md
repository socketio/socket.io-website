---
title: FAQ
sidebar_position: 1
slug: /faq/
---

import TOCInline from '@theme/TOCInline';

Aquí hay una lista de preguntas comunes sobre Socket.IO:

<TOCInline toc={toc} />

## ¿Algo no funciona correctamente, pueden ayudarme?

Por favor revisa la [guía de solución de problemas](../01-Documentation/troubleshooting.md).

## ¿Cómo funciona internamente?

La conexión de Socket.IO puede establecerse con diferentes transportes de bajo nivel:

- HTTP long-polling
- [WebSocket](https://developer.mozilla.org/es/docs/Web/API/WebSockets_API)
- [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)

Socket.IO elegirá automáticamente la mejor opción disponible, dependiendo de:

- las capacidades del navegador (ver [aquí](https://caniuse.com/websockets) y [aquí](https://caniuse.com/webtransport))
- la red (algunas redes bloquean conexiones WebSocket y/o WebTransport)

Puedes encontrar más detalles sobre esto en la [sección "Cómo funciona"](../01-Documentation/how-it-works.md).

## ¿Cuáles son las características proporcionadas por Socket.IO sobre WebSocket puro?

¡Los WebSockets son increíbles! No, en serio. Proporcionan una forma eficiente de transferir datos entre un cliente y un servidor. Entre las ventajas:

- no necesitas depender de polling periódico para obtener datos del servidor
- no necesitas enviar repetidamente todos los encabezados HTTP al enviar datos al servidor

Lo que los hace perfectos para aplicaciones de baja latencia e intensivas en datos como juegos, chats, soluciones colaborativas...

Dicho esto, los WebSockets también son bastante de bajo nivel y desarrollar aplicaciones en tiempo real con WebSockets a menudo requiere una capa adicional sobre ellos:

- fallback a HTTP long-polling, en caso de que la conexión WebSocket no pueda establecerse
- reconexión automática, en caso de que la conexión WebSocket se cierre
- acknowledgements, para enviar algunos datos y esperar una respuesta del otro lado
- transmisión a todos o a un subconjunto de clientes conectados
- escalar a múltiples instancias del servidor
- recuperación de conexión, para períodos cortos de desconexión

Como habrás adivinado, esta capa adicional es implementada por la biblioteca Socket.IO.

## ¿Qué es WebTransport?

En resumen, WebTransport es una alternativa a WebSocket que corrige varios problemas de rendimiento que afectan a los WebSockets como el [bloqueo de cabeza de línea](https://es.wikipedia.org/wiki/Bloqueo_de_cabeza_de_l%C3%ADnea).

Si quieres más información sobre esta nueva API web (que se incluyó en Chrome en enero de 2022 y en Firefox en junio de 2023), por favor revisa estos enlaces:

- https://w3c.github.io/webtransport/
- https://developer.mozilla.org/en-US/docs/Web/API/WebTransport
- https://developer.chrome.com/articles/webtransport/

:::note

El soporte para WebTransport no está habilitado por defecto en Socket.IO, ya que requiere un contexto seguro (HTTPS). Por favor revisa el [tutorial dedicado](/get-started/webtransport) si quieres experimentar con WebTransport.

:::

## ¿Socket.IO almacena los mensajes?

El servidor Socket.IO no almacena ningún mensaje.

Es deber de tu aplicación persistir esos mensajes *en algún lugar* para los clientes que no están actualmente conectados.

:::tip

Dicho esto, Socket.IO almacenará los mensajes por un breve período de tiempo si habilitas la [característica de recuperación del estado de conexión](../01-Documentation/connection-state-recovery.md).

:::

## ¿Cuáles son las garantías de entrega de Socket.IO?

Socket.IO **garantiza el orden de los mensajes**, sin importar qué transporte de bajo nivel se use (incluso al cambiar entre dos transportes).

Además, por defecto Socket.IO proporciona una garantía de entrega **como máximo una vez** (también conocida como "disparar y olvidar"), lo que significa que bajo ciertas circunstancias un mensaje podría perderse y no se intentará ningún reintento.

Más información sobre esto [aquí](../01-Documentation/delivery-guarantees.md).

## ¿Cómo identificar a un usuario dado?

No hay concepto de usuario en Socket.IO.

Es deber de tu aplicación vincular una conexión Socket.IO dada a una cuenta de usuario.

Para aplicaciones Node.js, puedes por ejemplo:

- reutilizar el contexto de usuario proporcionado por [Passport](https://www.passportjs.org/) (revisa [este tutorial](/how-to/use-with-express-session))
- o usar la opción [`auth`](../../client-options.md#auth) en el lado del cliente para enviar las credenciales del usuario y validarlas en un [middleware](../02-Server/middlewares.md)

## ¿Dónde puedo encontrar el changelog?

Por favor consulta [aquí](../../changelog/index.md).
