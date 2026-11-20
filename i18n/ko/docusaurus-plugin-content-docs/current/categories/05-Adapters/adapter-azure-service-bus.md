---
title: Azure Service Bus 어댑터
sidebar_position: 9
slug: /azure-service-bus-adapter/
---

## 동작 방식 {#how-it-works}

이 어댑터는 [Azure Service Bus](https://learn.microsoft.com/en-us/azure/service-bus-messaging)를 사용해 Socket.IO 클러스터의 노드 간에 메시지를 전달합니다.

이 어댑터의 소스 코드는 [여기](https://github.com/socketio/socket.io-azure-service-bus-adapter)에서 확인할 수 있습니다.

## 지원 기능 {#supported-features}

| 기능                            | `socket.io` 버전                    | 지원 여부                                      |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket 관리                     | `4.0.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 서버 간 통신                    | `4.1.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 확인 응답(acknowledgement)을 받는 브로드캐스트 | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 연결 상태 복구                  | [`4.6.0`](../../changelog/4.6.0.md) | :x: 아니요                                     |

## 설치 {#installation}

```
npm install @socket.io/azure-service-bus-adapter
```

## 사용법 {#usage}

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

// 구독이 생성될 때까지 기다립니다
await io.of("/").adapter.init();

io.listen(3000);
```

## 옵션 {#options}

| 이름                 | 설명                                                                                            | 기본값 |
|----------------------|--------------------------------------------------------------------------------------------------------|---------------|
| `topicName`          | 토픽의 이름입니다.                                                                                 | `socket.io`   |
| `topicOptions`       | 토픽을 생성할 때 사용하는 옵션입니다.                                                                  | `-`           |
| `subscriptionPrefix` | 구독의 접두사입니다. 클러스터의 Socket.IO 서버마다 구독이 하나씩 생성됩니다. | `socket.io`   |
| `receiverOptions`    | 구독을 생성할 때 사용하는 옵션입니다.                                                           | `-`           |
| `topicOptions`       | 수신자(receiver)를 생성할 때 사용하는 옵션입니다.                                                               | `-`           |
| `heartbeatInterval`  | 하트비트 간격(ms)입니다.                                                               | `5_000`       |
| `heartbeatTimeout`   | 이 시간(ms) 동안 하트비트가 없으면 노드가 다운된 것으로 판단합니다.                                     | `10_000`      |

## 최신 릴리스 {#latest-releases}

| 버전 | 릴리스 날짜 | 릴리스 노트                                                                              | 비교 |
|---------|--------------|--------------------------------------------------------------------------------------------|------|
| `0.1.0` | 2024년 3월   | [링크](https://github.com/socketio/socket.io-azure-service-bus-adapter/releases/tag/0.1.0) | `-`  |

[전체 변경 내역](https://github.com/socketio/socket.io-azure-service-bus-adapter/blob/main/CHANGELOG.md)
