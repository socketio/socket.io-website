---
title: Tutorial - Introducción
sidebar_label: Introducción
slug: introduction
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Empezando

¡Bienvenido al tutorial de Socket.IO!

En este tutorial crearemos una aplicación básica de chat. No requiere casi ningún conocimiento previo de Node.JS o Socket.IO, por lo que es ideal para usuarios de todos los niveles de conocimiento.

## Introducción

Escribir una aplicación de chat con pilas de aplicaciones web populares como LAMP (PHP) ha sido normalmente muy difícil. Implica hacer polling al servidor en busca de cambios, mantener un registro de marcas de tiempo, y es mucho más lento de lo que debería ser.

Los sockets han sido tradicionalmente la solución alrededor de la cual se arquitectan la mayoría de los sistemas de chat en tiempo real, proporcionando un canal de comunicación bidireccional entre un cliente y un servidor.

Esto significa que el servidor puede *enviar* mensajes a los clientes. Cuando escribes un mensaje de chat, la idea es que el servidor lo reciba y lo envíe a todos los demás clientes conectados.

## Cómo usar este tutorial

### Herramientas

Cualquier editor de texto (desde un editor de texto básico hasta un IDE completo como [VS Code](https://code.visualstudio.com/)) debería ser suficiente para completar este tutorial.

Además, al final de cada paso encontrarás un enlace a algunas plataformas en línea ([CodeSandbox](https://codesandbox.io) y [StackBlitz](https://stackblitz.com), a saber), que te permiten ejecutar el código directamente desde tu navegador:

![Captura de pantalla de la plataforma CodeSandbox](/images/codesandbox.png)

### Configuración de sintaxis

En el mundo de Node.js, hay dos formas de importar módulos:

- la forma estándar: módulos ECMAScript (o ESM)

```js
import { Server } from "socket.io";
```

Referencia: https://nodejs.org/api/esm.html

- la forma legacy: CommonJS

```js
const { Server } = require("socket.io");
```

Referencia: https://nodejs.org/api/modules.html

Socket.IO soporta ambas sintaxis.

:::tip

Recomendamos usar la sintaxis ESM en tu proyecto, aunque esto no siempre sea posible debido a que algunos paquetes no soportan esta sintaxis.

:::

Para tu conveniencia, a lo largo del tutorial, cada bloque de código te permite seleccionar tu sintaxis preferida:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Server } = require("socket.io");
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Server } from "socket.io";
```

  </TabItem>
</Tabs>


¿Listo? Haz clic en "Siguiente" para empezar.
