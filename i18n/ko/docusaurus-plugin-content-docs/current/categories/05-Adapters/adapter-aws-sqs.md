---
title: AWS SQS 어댑터
sidebar_position: 8
slug: /aws-sqs-adapter/
---

## 동작 방식 {#how-it-works}

이 어댑터는 [AWS Simple Queue Service](https://aws.amazon.com/sqs/)를 사용해 Socket.IO 클러스터의 노드 간에 메시지를 전달합니다.

기존 [`socket.io-sqs`](https://github.com/thinkalpha/socket.io-sqs) 패키지와 달리 이 패키지는 바이너리 페이로드와 동적 네임스페이스를 지원합니다.

이 어댑터의 소스 코드는 다음 주소에서 확인할 수 있습니다: https://github.com/socketio/socket.io-aws-sqs-adapter

## 지원 기능 {#supported-features}

| 기능                            | `socket.io` 버전                    | 지원 여부                                      |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket 관리                     | `4.0.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 서버 간 통신                    | `4.1.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 확인 응답(acknowledgement)을 받는 브로드캐스트 | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 연결 상태 복구                  | [`4.6.0`](../../changelog/4.6.0.md) | :x: 아니요                                     |

## 설치 {#installation}

```
npm install @socket.io/aws-sqs-adapter
```

## 사용법 {#usage}

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

// SQS 큐가 생성될 때까지 기다립니다
await io.of("/").adapter.init();

const gracefulShutdown = async () => {
  // SQS 큐와 SNS 구독이 삭제될 때까지 기다립니다
  await io.close();
};

process.once("SIGINT", gracefulShutdown);
process.once("SIGTERM", gracefulShutdown);

io.listen(3000);
```

## 옵션 {#options}

| 이름                     | 설명                                                                                                | 기본값 |
|--------------------------|------------------------------------------------------------------------------------------------------------|---------------|
| `topicArn`               | 재사용할 기존 SNS 토픽의 ARN입니다.                                                                 | `-`           |
| `topicName`              | SNS 토픽의 이름입니다. `topicArn`을 지정하면 무시됩니다.                                              | `socket-io`   |
| `topicTags`              | 새 SNS 토픽에 적용할 태그입니다. `topicArn`을 지정하면 무시됩니다.                                 | `-`           |
| `queueName`              | 무작위 ID로 SQS 큐 이름을 생성하는 함수입니다.                                         | `-`           |
| `queuePrefix`            | SQS 큐의 접두사입니다. `queueName`을 지정하면 무시됩니다.                                           | `socket-io`   |
| `queueTags`              | 새 SQS 큐에 적용할 태그입니다.                                                                    | `-`           |
| `sqsMaxNumberOfMessages` | 반환할 메시지의 최대 개수입니다.                                                                  | `10`          |
| `sqsWaitTimeSeconds`     | 수신 호출이 반환되기 전에 큐에 메시지가 도착하기를 기다리는 시간(초)입니다.  | `5`           |
| `heartbeatInterval`      | 하트비트 간격(ms)입니다.                                                                   | `5_000`       |
| `heartbeatTimeout`       | 이 시간(ms) 동안 하트비트가 없으면 노드가 다운된 것으로 판단합니다.                                         | `10_000`      |

## 최신 릴리스 {#latest-releases}

| 버전 | 릴리스 날짜 | 릴리스 노트                                                                    | 비교                                                                                           |
|---------|----------------|----------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `0.2.0` | 2026년 9월 | [링크](https://github.com/socketio/socket.io-aws-sqs-adapter/releases/tag/0.2.0) | [`0.1.1...0.2.0`](https://github.com/socketio/socket.io-aws-sqs-adapter/compare/0.1.1...0.2.0) |
| `0.1.1` | 2024년 6월      | [링크](https://github.com/socketio/socket.io-aws-sqs-adapter/releases/tag/0.1.1) | [`0.1.0...0.1.1`](https://github.com/socketio/socket.io-aws-sqs-adapter/compare/0.1.0...0.1.1) |
| `0.1.0` | 2024년 3월     | [링크](https://github.com/socketio/socket.io-aws-sqs-adapter/releases/tag/0.1.0) | `-`                                                                                            |

[전체 변경 내역](https://github.com/socketio/socket.io-aws-sqs-adapter/blob/main/CHANGELOG.md)
