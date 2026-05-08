---
title: Changelog
sidebar_position: 1
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## Política de versionado

Los lanzamientos de Socket.IO siguen de cerca el [Versionado Semántico](https://semver.org/).

Esto significa que con un número de versión `x.y.z`:

- cuando lanzamos correcciones de errores críticos, hacemos un lanzamiento de parche incrementando el número `z` (ej: `1.2.3` a `1.2.4`).
- cuando lanzamos nuevas características o correcciones no críticas, hacemos un lanzamiento menor incrementando el número `y` (ej: `1.2.3` a `1.3.0`).
- cuando lanzamos cambios incompatibles, hacemos un lanzamiento mayor incrementando el número `x` (ej: `1.2.3` a `2.0.0`).

## Cambios incompatibles

Los cambios incompatibles son inconvenientes para todos, así que intentamos minimizar el número de lanzamientos mayores.

Hemos tenido dos cambios incompatibles importantes que impactaron el protocolo Socket.IO a lo largo de los años:

- Socket.IO v2 fue lanzado en **mayo 2017**
- Socket.IO v3 fue lanzado en **noviembre 2020**

:::info

Socket.IO v4 (lanzado en marzo 2021) no incluyó ninguna actualización al protocolo Socket.IO (solo un par de cambios incompatibles en la API del servidor Node.js), así que no se cuenta aquí.

Referencia: [Migrando de 3.x a 4.0](../categories/07-Migrations/migrating-from-3-to-4.md)

:::

## Hitos importantes

Además de los cambios incompatibles listados arriba, aquí están los últimos cambios importantes en Socket.IO:

| Versión             | Fecha          | Descripción                                                                                              |
|---------------------|----------------|----------------------------------------------------------------------------------------------------------|
| [`4.7.0`](4.7.0.md) | Junio 2023     | Soporte para WebTransport                                                                                |
| [`4.6.0`](4.6.0.md) | Febrero 2023   | Introducción de [Recuperación del estado de conexión](../categories/01-Documentation/connection-state-recovery.md) |
| `4.4.0`             | Noviembre 2021 | Soporte para [uWebSockets.js](../categories/02-Server/server-installation.md#usage-with-uwebsockets)     |
| `4.1.0`             | Mayo 2021      | Introducción de [`serverSideEmit()`](../categories/02-Server/server-instance.md#serversideemit)          |
| `4.0.0`             | Marzo 2021     | Reescritura a [TypeScript](https://www.typescriptlang.org/)                                              |

## Uso por versión

A partir de junio 2024:

Paquete `socket.io`

<ThemedImage
  alt="Descargas del cliente por versión"
  sources={{
    light: useBaseUrl('/images/server-downloads-per-version.png'),
    dark: useBaseUrl('/images/server-downloads-per-version-dark.png'),
  }}
/>


Paquete `socket.io-client`

<ThemedImage
  alt="Descargas del cliente por versión"
  sources={{
    light: useBaseUrl('/images/client-downloads-per-version.png'),
    dark: useBaseUrl('/images/client-downloads-per-version-dark.png'),
  }}
/>
