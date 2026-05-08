---
title: Google Cloud Pub/Sub adapter
sidebar_position: 7
slug: /gcp-pubsub-adapter/
---

## How it works

This adapter uses [Google Cloud Pub/Sub service](https://cloud.google.com/pubsub/docs/overview) to forward messages between the nodes of a Socket.IO cluster.

The source code of this adapter can be found [here](https://github.com/socketio/socket.io-gcp-pubsub-adapter).

## Supported features

| Feature                         | `socket.io` version                 | Support                                        |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket management               | `4.0.0`                             | :white_check_mark: YES (since version `0.1.0`) |
| Inter-server communication      | `4.1.0`                             | :white_check_mark: YES (since version `0.1.0`) |
| Broadcast with acknowledgements | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: YES (since version `0.1.0`) |
| Connection state recovery       | [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Installation

```
npm install @socket.io/gcp-pubsub-adapter
```

## Usage

```js
import { PubSub } from "@google-cloud/pubsub";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/gcp-pubsub-adapter";

const pubsub = new PubSub({
  projectId: "your-project-id"
});

const topic = pubsub.topic(topicNameOrId);

const io = new Server({
  adapter: createAdapter(topic)
});

// wait for the creation of the pub/sub subscription
await io.of("/").adapter.init();

io.listen(3000);
```

## Options

| Name                  | Description                                                                                                       | Default value  |
|-----------------------|-------------------------------------------------------------------------------------------------------------------|----------------|
| `subscriptionPrefix`  | The prefix for the new subscription to create.                                                                    | `socket.io`    |
| `subscriptionOptions` | The options used to create the subscription.                                                                      | `-`            |
| `heartbeatInterval`   | The number of ms between two heartbeats.                                                                          | `5_000`        |
| `heartbeatTimeout`    | The number of ms without heartbeat before we consider a node down.                                                | `10_000`       |

## Latest releases

| Version | Release date | Release notes                                                                       | Diff |
|---------|--------------|-------------------------------------------------------------------------------------|------|
| `0.1.0` | March 2024   | [link](https://github.com/socketio/socket.io-gcp-pubsub-adapter/releases/tag/0.1.0) | `-`  |

[Complete changelog](https://github.com/socketio/socket.io-gcp-pubsub-adapter/blob/main/CHANGELOG.md)
