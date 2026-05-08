---
title: AWS SQS adapter
sidebar_position: 8
slug: /aws-sqs-adapter/
---

## How it works

This adapter uses [AWS Simple Queue Service](https://aws.amazon.com/sqs/) to forward messages between the nodes of a Socket.IO cluster.

Unlike the existing [`socket.io-sqs`](https://github.com/thinkalpha/socket.io-sqs) package, this package supports binary payloads and dynamic namespaces.

The source code of this adapter can be found [here](https://github.com/socketio/socket.io-aws-sqs-adapter).

## Supported features

| Feature                         | `socket.io` version                 | Support                                        |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket management               | `4.0.0`                             | :white_check_mark: YES (since version `0.1.0`) |
| Inter-server communication      | `4.1.0`                             | :white_check_mark: YES (since version `0.1.0`) |
| Broadcast with acknowledgements | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: YES (since version `0.1.0`) |
| Connection state recovery       | [`4.6.0`](../../changelog/4.6.0.md) | :x: NO                                         |

## Installation

```
npm install @socket.io/aws-sqs-adapter
```

## Usage

```js
import { SNS } from "@aws-sdk/client-sns";
import { SQS } from "@aws-sdk/client-sqs";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/aws-sqs-adapter";

const snsClient = new SNS();
const sqsClient = new SQS();

const io = new Server({
  adapter: createAdapter(snsClient, sqsClient)
});

// wait for the creation of the SQS queue
await io.of("/").adapter.init();

io.listen(3000);
```

## Options

| Name                | Description                                                        | Default value |
|---------------------|--------------------------------------------------------------------|---------------|
| `topicName`         | The name of the SNS topic.                                         | `socket.io`   |
| `topicTags`         | The tags to apply to the new SNS topic.                            | `-`           |
| `queuePrefix`       | The prefix of the SQS queue.                                       | `socket.io`   |
| `queueTags`         | The tags to apply to the new SQS queue.                            | `-`           |
| `heartbeatInterval` | The number of ms between two heartbeats.                           | `5_000`       |
| `heartbeatTimeout`  | The number of ms without heartbeat before we consider a node down. | `10_000`      |

## Latest releases

| Version | Release date | Release notes                                                                    | Diff |
|---------|--------------|----------------------------------------------------------------------------------|------|
| `0.1.0` | March 2024   | [link](https://github.com/socketio/socket.io-aws-sqs-adapter/releases/tag/0.1.0) | `-`  |

[Complete changelog](https://github.com/socketio/socket.io-aws-sqs-adapter/blob/main/CHANGELOG.md)
