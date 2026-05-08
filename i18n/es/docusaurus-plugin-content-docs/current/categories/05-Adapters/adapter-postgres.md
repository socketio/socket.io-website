---
title: Adaptador Postgres
sidebar_position: 5
slug: /postgres-adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## Cómo funciona

El adaptador Postgres se basa en los comandos [NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html) y [LISTEN](https://www.postgresql.org/docs/current/sql-listen.html).

Cada paquete que se envía a múltiples clientes (ej. `io.to("room1").emit()` o `socket.broadcast.emit()`) es:

- enviado a todos los clientes coincidentes conectados al servidor actual
- si el paquete contiene datos binarios o supera el límite de 8000 bytes, el paquete es:
  - codificado con [msgpack](https://msgpack.org/) e insertado en una tabla auxiliar
  - el ID de fila se envía dentro de un comando NOTIFY
  - este ID de fila es recibido por los otros servidores Socket.IO del clúster, que consultan la tabla, decodifican el paquete y luego lo transmiten a su propio conjunto de clientes conectados
- de lo contrario, el paquete simplemente se envía dentro de un comando NOTIFY y es recibido por los otros servidores Socket.IO del clúster

<ThemedImage
  alt="Diagrama de cómo funciona el adaptador Postgres"
  sources={{
    light: useBaseUrl('/images/postgres-adapter.png'),
    dark: useBaseUrl('/images/postgres-adapter-dark.png'),
  }}
/>

El código fuente de este adaptador se puede encontrar [aquí](https://github.com/socketio/socket.io-postgres-adapter).

## Características soportadas

| Característica                     | Versión de `socket.io`              | Soporte                                        |
|------------------------------------|-------------------------------------|------------------------------------------------|
| Gestión de sockets                 | `4.0.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Comunicación entre servidores      | `4.1.0`                             | :white_check_mark: SÍ (desde versión `0.1.0`)  |
| Broadcast con acknowledgements     | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: SÍ (desde versión `0.3.0`)  |
| Recuperación del estado de conexión| [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Instalación

```
npm install @socket.io/postgres-adapter pg
```

Para usuarios de TypeScript, también podrías necesitar `@types/pg`.

## Uso

### Independiente

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/postgres-adapter";
import pg from "pg";

const io = new Server();

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "changeit",
  port: 5432,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS socket_io_attachments (
      id          bigserial UNIQUE,
      created_at  timestamptz DEFAULT NOW(),
      payload     bytea
  );
`);

pool.on("error", (err) => {
  console.error("Error de Postgres", err);
});

io.adapter(createAdapter(pool));
io.listen(3000);
```

## Opciones

| Nombre              | Descripción                                                                                   | Valor predeterminado    |
|---------------------|-----------------------------------------------------------------------------------------------|-------------------------|
| `channelPrefix`     | El prefijo del canal de notificación                                                          | `socket.io`             |
| `tableName`         | El nombre de la tabla para payloads sobre el límite de 8000 bytes o que contienen datos binarios | `socket_io_attachments` |
| `payloadThreshold`  | El umbral para el tamaño del payload en bytes                                                 | `8_000`                 |
| `cleanupInterval`   | El número de ms entre dos consultas de limpieza                                               | `30_000`                |
| `heartbeatInterval` | El número de ms entre dos heartbeats                                                          | `5_000`                 |
| `heartbeatTimeout`  | El número de ms sin heartbeat antes de considerar un nodo caído                               | `10_000`                |

## Preguntas frecuentes

### ¿Todavía necesito habilitar sesiones sticky al usar el adaptador Postgres?

Sí. No hacerlo resultará en respuestas HTTP 400 (estás llegando a un servidor que no conoce la sesión Socket.IO).

Más información se puede encontrar [aquí](../02-Server/using-multiple-nodes.md#why-is-sticky-session-required).

### ¿Qué pasa cuando el servidor Postgres está caído?

En caso de que la conexión al servidor Postgres se corte, los paquetes solo se enviarán a los clientes que están conectados al servidor actual.

## Últimas versiones

| Versión | Fecha de lanzamiento | Notas de lanzamiento                                                              | Diff                                                                                            |
|---------|----------------------|-----------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| `0.5.0` | Noviembre 2025       | [link](https://github.com/socketio/socket.io-postgres-adapter/releases/tag/0.5.0) | [`0.4.0...0.5.0`](https://github.com/socketio/socket.io-postgres-adapter/compare/0.4.0...0.5.0) |
| `0.4.0` | Julio 2024           | [link](https://github.com/socketio/socket.io-postgres-adapter/releases/tag/0.4.0) | [`0.3.1...0.4.0`](https://github.com/socketio/socket.io-postgres-adapter/compare/0.3.1...0.4.0) |
| `0.3.1` | Febrero 2023         | [link](https://github.com/socketio/socket.io-postgres-adapter/releases/tag/0.3.1) | [`0.3.0...0.3.1`](https://github.com/socketio/socket.io-postgres-adapter/compare/0.3.0...0.3.1) |
| `0.3.0` | Abril 2022           | [link](https://github.com/socketio/socket.io-postgres-adapter/releases/tag/0.3.0) | [`0.2.0...0.3.0`](https://github.com/socketio/socket.io-postgres-adapter/compare/0.2.0...0.3.0) |
| `0.2.0` | Diciembre 2021       | [link](https://github.com/socketio/socket.io-postgres-adapter/releases/tag/0.2.0) | [`0.1.1...0.2.0`](https://github.com/socketio/socket.io-postgres-adapter/compare/0.1.1...0.2.0) |

[Changelog completo](https://github.com/socketio/socket.io-postgres-adapter/blob/main/CHANGELOG.md)

## Emitter

El emitter Postgres permite enviar paquetes a los clientes conectados desde otro proceso Node.js:

<ThemedImage
  alt="Diagrama de cómo funciona el emitter Postgres"
  sources={{
    light: useBaseUrl('/images/postgres-emitter.png'),
    dark: useBaseUrl('/images/postgres-emitter-dark.png'),
  }}
/>

### Instalación

```
npm install @socket.io/postgres-emitter pg
```

### Uso

```js
import { Emitter } from "@socket.io/postgres-emitter";
import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  password: "changeit",
});

const emitter = new Emitter(pool);

setInterval(() => {
  emitter.emit("ping", new Date());
}, 1000);
```

Por favor consulta la hoja de referencia [aquí](adapter.md#emitter-cheatsheet).

### Últimas versiones

| Versión | Fecha de lanzamiento | Notas de lanzamiento                                                              | Diff |
|---------|----------------------|-----------------------------------------------------------------------------------|------|
| `0.1.0` | Junio 2021           | [link](https://github.com/socketio/socket.io-postgres-emitter/releases/tag/0.1.0) |      |

[Changelog completo](https://github.com/socketio/socket.io/blob/main/packages/socket.io-postgres-emitter/CHANGELOG.md)
