---
title: Tutorial - Manejando desconexiones
sidebar_label: Manejando desconexiones
slug: handling-disconnections
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manejando desconexiones

Ahora, destaquemos dos propiedades realmente importantes de Socket.IO:

1. un cliente Socket.IO no siempre está conectado
2. un servidor Socket.IO no almacena ningún evento

:::caution

Incluso sobre una red estable, no es posible mantener una conexión viva para siempre.

:::

Lo cual significa que tu aplicación necesita ser capaz de sincronizar el estado local del cliente con el estado global en el servidor después de una desconexión temporal.

:::note

El cliente Socket.IO intentará reconectarse automáticamente después de un pequeño retraso. Sin embargo, cualquier evento perdido durante el período de desconexión se perderá efectivamente para este cliente.

:::

En el contexto de nuestra aplicación de chat, esto implica que un cliente desconectado podría perderse algunos mensajes:

<ThemedImage
  alt="El cliente desconectado no recibe el evento 'chat message'"
  sources={{
    light: useBaseUrl('/images/tutorial/disconnected.png'),
    dark: useBaseUrl('/images/tutorial/disconnected-dark.png'),
  }}
/>

Veremos en los próximos pasos cómo podemos mejorar esto.
