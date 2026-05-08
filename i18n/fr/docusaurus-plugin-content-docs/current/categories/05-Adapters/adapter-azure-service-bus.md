---
title: Azure Service Bus adapter
sidebar_position: 9
slug: /azure-service-bus-adapter/
---

## How it works {#how-it-works}

This adapter uses [Azure Service Bus service](https://learn.microsoft.com/en-us/azure/service-bus-messaging) to forward messages between the nodes of a Socket.IO cluster.

The source code of this adapter can be found [here](https://github.com/socketio/socket.io-azure-service-bus-adapter).

## Supported features {#supported-features}

| Feature                         | `socket.io` version                 | Support                                        |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket management               | `4.0.0`                             | :white_check_mark: YES (since version `0.1.0`) |
| Inter-server communication      | `4.1.0`                             | :white_check_mark: YES (since version `0.1.0`) |
| Broadcast with acknowledgements | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: YES (since version `0.1.0`) |
| Connection state recovery       | [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Installation {#installation}

```
npm install @socket.io/azure-service-bus-adapter
```

## Usage {#usage}

```js
import { ServiceBusClient, ServiceBusAdministrationClient } from "@azure/service-bus";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/azure-service-bus-adapter";

const connectionString = "Endpoint=...";

const serviceBusClient = new ServiceBusClient(connectionString);
const serviceBusAdminClient = new ServiceBusAdministrationClient(connectionString);

const io = new Server({
  adapter: createAdapter(serviceBusClient, serviceBusAdminClient)
});

// wait for the creation of the subscription
await io.of("/").adapter.init();

io.listen(3000);
```

## Options {#options}

| Name                 | Description                                                                                            | Default value |
|----------------------|--------------------------------------------------------------------------------------------------------|---------------|
| `topicName`          | The name of the topic.                                                                                 | `socket.io`   |
| `topicOptions`       | The options used to create the topic.                                                                  | `-`           |
| `subscriptionPrefix` | The prefix of the subscription (one subscription will be created per Socket.IO server in the cluster). | `socket.io`   |
| `receiverOptions`    | The options used to create the subscription.                                                           | `-`           |
| `topicOptions`       | The options used to create the receiver.                                                               | `-`           |
| `heartbeatInterval`  | The number of ms between two heartbeats.                                                               | `5_000`       |
| `heartbeatTimeout`   | The number of ms without heartbeat before we consider a node down.                                     | `10_000`      |

## Latest releases {#latest-releases}

| Version | Release date | Release notes                                                                              | Diff |
|---------|--------------|--------------------------------------------------------------------------------------------|------|
| `0.1.0` | March 2024   | [link](https://github.com/socketio/socket.io-azure-service-bus-adapter/releases/tag/0.1.0) | `-`  |

[Complete changelog](https://github.com/socketio/socket.io-azure-service-bus-adapter/blob/main/CHANGELOG.md)
