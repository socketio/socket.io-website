---
title: Google Cloud Pub/Sub 어댑터
sidebar_position: 7
slug: /gcp-pubsub-adapter/
---

## 동작 방식 {#how-it-works}

이 어댑터는 [Google Cloud Pub/Sub 서비스](https://docs.cloud.google.com/pubsub/docs/overview)를 사용해 Socket.IO 클러스터의 노드 간에 메시지를 전달합니다.

- 소스 코드: https://github.com/socketio/socket.io-gcp-pubsub-adapter
- NPM: https://www.npmjs.com/package/@socket.io/gcp-pubsub-adapter

## 지원 기능 {#supported-features}

| 기능                            | `socket.io` 버전                    | 지원 여부                                      |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket 관리                     | `4.0.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 서버 간 통신                    | `4.1.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 확인 응답(acknowledgement)을 받는 브로드캐스트 | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: 예 (`0.1.0` 버전부터) |
| 연결 상태 복구                  | [`4.6.0`](../../changelog/4.6.0.md) | :x: 아니요                                     |

## 설치 {#installation}

```
npm install @socket.io/gcp-pubsub-adapter
```

## 사용법 {#usage}

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

// Pub/Sub 구독이 생성될 때까지 기다립니다
await io.of("/").adapter.init();

io.listen(3000);
```

## 옵션 {#options}

| 이름                  | 설명                                                                                                       | 기본값         |
|-----------------------|-------------------------------------------------------------------------------------------------------------------|----------------|
| `subscriptionPrefix`  | 새로 생성할 구독의 접두사입니다.                                                                    | `socket.io`    |
| `subscriptionOptions` | 구독을 생성할 때 사용하는 옵션입니다.                                                                      | `-`            |
| `heartbeatInterval`   | 하트비트 간격(ms)입니다.                                                                          | `5_000`        |
| `heartbeatTimeout`    | 이 시간(ms) 동안 하트비트가 없으면 노드가 다운된 것으로 판단합니다.                                                | `10_000`       |

## 최신 릴리스 {#latest-releases}

| 버전 | 릴리스 날짜 | 릴리스 노트                                                                       | 비교                                                                                              |
|---------|----------------|-------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `0.1.1` | 2026년 9월 | [링크](https://github.com/socketio/socket.io-gcp-pubsub-adapter/releases/tag/0.1.1) | [`0.1.0...0.1.1`](https://github.com/socketio/socket.io-gcp-pubsub-adapter/compare/0.1.0...0.1.1) |
| `0.1.0` | 2024년 3월     | [링크](https://github.com/socketio/socket.io-gcp-pubsub-adapter/releases/tag/0.1.0) | `-`                                                                                               |

[전체 변경 내역](https://github.com/socketio/socket.io-gcp-pubsub-adapter/blob/main/CHANGELOG.md)
