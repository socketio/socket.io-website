---
title: "Tutorial paso #6 - Recuperación del estado de conexión"
sidebar_label: "Paso #6: Recuperación del estado de conexión"
slug: step-6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Recuperación del estado de conexión

Primero, manejemos las desconexiones pretendiendo que no hubo desconexión: esta característica se llama "Recuperación del estado de conexión".

Esta característica almacenará **temporalmente** todos los eventos que son enviados por el servidor e intentará restaurar el estado de un cliente cuando se reconecte:

- restaurar sus salas
- enviar cualquier evento perdido

Debe habilitarse en el lado del servidor:

```js title="index.js"
const io = new Server(server, {
  // highlight-start
  connectionStateRecovery: {}
  // highlight-end
});
```

Veámoslo en acción:

<video controls width="100%"><source src="/videos/tutorial/connection-state-recovery.mp4" /></video>

Como puedes ver en el video anterior, el mensaje "realtime" eventualmente se entrega cuando la conexión se restablece.

:::note

El botón "Disconnect" fue añadido para propósitos de demostración.

<details className="changelog">
    <summary>Código</summary>

<Tabs groupId="syntax">
  <TabItem value="es6" label="ES6" default>

```html
<form id="form" action="">
  <input id="input" autocomplete="off" /><button>Send</button>
  // highlight-start
  <button id="toggle-btn">Disconnect</button>
  // highlight-end
</form>

<script>
  // highlight-start
  const toggleButton = document.getElementById('toggle-btn');

  toggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (socket.connected) {
      toggleButton.innerText = 'Connect';
      socket.disconnect();
    } else {
      toggleButton.innerText = 'Disconnect';
      socket.connect();
    }
  });
  // highlight-end
</script>
```

  </TabItem>
  <TabItem value="es5" label="ES5">

```html
<form id="form" action="">
  <input id="input" autocomplete="off" /><button>Send</button>
  // highlight-start
  <button id="toggle-btn">Disconnect</button>
  // highlight-end
</form>

<script>
  // highlight-start
  var toggleButton = document.getElementById('toggle-btn');

  toggleButton.addEventListener('click', function(e) {
    e.preventDefault();
    if (socket.connected) {
      toggleButton.innerText = 'Connect';
      socket.disconnect();
    } else {
      toggleButton.innerText = 'Disconnect';
      socket.connect();
    }
  });
  // highlight-end
</script>
```

  </TabItem>
</Tabs>
</details>

:::

¡Genial! Ahora, puedes preguntar:

> Pero esta es una característica increíble, ¿por qué no está habilitada por defecto?

Hay varias razones para esto:

- no siempre funciona, por ejemplo si el servidor falla abruptamente o se reinicia, entonces el estado del cliente podría no guardarse
- no siempre es posible habilitar esta característica al escalar

:::tip

Dicho esto, es de hecho una gran característica ya que no tienes que sincronizar el estado del cliente después de una desconexión temporal (por ejemplo, cuando el usuario cambia de WiFi a 4G).

:::

Exploraremos una solución más general en el próximo paso.

:::info

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/cjs/step6?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/cjs/step6?file=index.js)


  </TabItem>
  <TabItem value="mjs" label="ES modules" attributes={{ className: 'display-none' }}>

Puedes ejecutar este ejemplo directamente en tu navegador en:

- [CodeSandbox](https://codesandbox.io/p/sandbox/github/socketio/chat-example/tree/esm/step6?file=index.js)
- [StackBlitz](https://stackblitz.com/github/socketio/chat-example/tree/esm/step6?file=index.js)


  </TabItem>
</Tabs>

:::
