---
title: Tutorial - Handling disconnections
sidebar_label: Handling disconnections
slug: handling-disconnections
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Handling disconnections

Now, let's highlight two really important properties of Socket.IO:

1. a Socket.IO client is not always connected
2. a Socket.IO server does not store any event

:::caution

Even over a stable network, it is not possible to maintain a connection alive forever.

:::

Which means that your application needs to be able to synchronize the local state of the client with the global state on the server after a temporary disconnection.

:::note

The Socket.IO client will automatically try to reconnect after a small delay. However, any missed event during the disconnection period will effectively be lost for this client.  

:::

In the context of our chat application, this implies that a disconnected client might miss some messages: 

<ThemedImage
  alt="The disconnected client does not receive the 'chat message' event"
  sources={{
    light: useBaseUrl('/images/tutorial/disconnected.png'),
    dark: useBaseUrl('/images/tutorial/disconnected-dark.png'),
  }}
/>

We will see in the next steps how we can improve this.
