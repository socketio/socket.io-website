---
title: MongoDB 어댑터
sidebar_position: 4
slug: /mongo-adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## 동작 방식 {#how-it-works}

MongoDB 어댑터는 MongoDB의 [변경 스트림(Change Streams)](https://docs.mongodb.com/manual/changeStreams/)을 기반으로 동작합니다. 따라서 레플리카 세트나 샤딩된 클러스터가 필요합니다.

여러 클라이언트에게 보내는 모든 패킷(예: `io.to("room1").emit()`, `socket.broadcast.emit()`)은 다음과 같이 처리됩니다.

- 현재 서버에 연결된 대상 클라이언트 모두에게 전송됩니다
- MongoDB 고정 크기 컬렉션(capped collection)에 삽입되고, 클러스터의 다른 Socket.IO 서버가 이 패킷을 받습니다

<ThemedImage
  alt="MongoDB 어댑터의 동작 방식을 나타낸 다이어그램"
  sources={{
    light: useBaseUrl('/images/mongo-adapter.png'),
    dark: useBaseUrl('/images/mongo-adapter-dark.png'),
  }}
/>

이 어댑터의 소스 코드는 [여기](https://github.com/socketio/socket.io-mongo-adapter)에서 확인할 수 있습니다.

## 지원 기능 {#supported-features}

| 기능                             | `socket.io` 버전                     | 지원 여부                                       |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket 관리                      | `4.0.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터)    |
| 서버 간 통신                       | `4.1.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터)    |
| 확인 응답(acknowledgement)을 받는 브로드캐스트 | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: 예 (`0.2.0` 버전부터)    |
| 연결 상태 복구                      | [`4.6.0`](../../changelog/4.6.0.md) | :white_check_mark: 예 (`0.3.0` 버전부터)    |

## 설치 {#installation}

```
npm install @socket.io/mongo-adapter mongodb
```

TypeScript를 사용한다면 `@types/mongodb`도 필요할 수 있습니다.

## 사용법 {#usage}

Socket.IO 클러스터 안에서 패킷을 브로드캐스트할 때는 MongoDB 문서를 만들고, 각 Socket.IO 서버에서 [변경 스트림](https://docs.mongodb.com/manual/changeStreams/)을 사용합니다.

MongoDB에 쌓인 문서를 정리하는 방법은 두 가지입니다.

- [고정 크기 컬렉션](https://www.mongodb.com/docs/manual/core/capped-collections/)
- [TTL 인덱스](https://www.mongodb.com/docs/manual/core/index-ttl/)

### 고정 크기 컬렉션 사용 {#usage-with-a-capped-collection}

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/mongo-adapter";
import { MongoClient } from "mongodb";

const DB = "mydb";
const COLLECTION = "socket.io-adapter-events";

const io = new Server();

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0");

await mongoClient.connect();

try {
  await mongoClient.db(DB).createCollection(COLLECTION, {
    capped: true,
    size: 1e6
  });
} catch (e) {
  // 컬렉션이 이미 있는 경우
}
const mongoCollection = mongoClient.db(DB).collection(COLLECTION);

io.adapter(createAdapter(mongoCollection));
io.listen(3000);
```

### TTL 인덱스 사용 {#usage-with-a-ttl-index}

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/mongo-adapter";
import { MongoClient } from "mongodb";

const DB = "mydb";
const COLLECTION = "socket.io-adapter-events";

const io = new Server();

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0");

await mongoClient.connect();

const mongoCollection = mongoClient.db(DB).collection(COLLECTION);

await mongoCollection.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600, background: true }
);

io.adapter(createAdapter(mongoCollection, {
  addCreatedAtField: true
}));

io.listen(3000);
```

## 옵션 {#options}

| 이름                   | 설명                                                                                            | 기본값         | 추가된 버전 |
|-----------------------|-----------------------------------------------------------------------------------------------|---------------|----------|
| `uid`                 | 이 노드의 ID입니다. | 임의의 ID | `v0.1.0` |
| `requestsTimeout`     | `fetchSockets()`나 확인 응답을 받는 `serverSideEmit()` 같은 서버 간 요청의 타임아웃입니다. | `5000`        | `v0.1.0` |
| `heartbeatInterval`   | 하트비트 간격(ms)입니다. | `5000`        | `v0.1.0` |
| `heartbeatTimeout`    | 이 시간(ms) 동안 하트비트가 없으면 노드가 다운된 것으로 판단합니다. | `10000`       | `v0.1.0` |
| `addCreatedAtField`   | 각 MongoDB 문서에 `createdAt` 필드를 추가할지 여부입니다. | `false`       | `v0.2.0` |
| `changeStreamOptions` | MongoDB 변경 스트림에 전달할 옵션입니다. | `{}`          | `v0.4.0` |

## 자주 묻는 질문 {#common-questions}

### MongoDB 어댑터를 사용해도 스티키 세션을 활성화해야 하나요? {#do-i-still-need-to-enable-sticky-sessions-when-using-the-mongodb-adapter}

네. 활성화하지 않으면 HTTP 400 응답을 받습니다. 요청이 그 Socket.IO 세션을 모르는 서버에 도달하기 때문입니다.

자세한 내용은 [여러 노드 사용하기](../02-Server/using-multiple-nodes.md)를 참고하세요.

### MongoDB 클러스터가 다운되면 어떻게 되나요? {#what-happens-when-the-mongodb-cluster-is-down}

MongoDB 클러스터와의 연결이 끊기면 MongoDB 클라이언트의 `bufferMaxEntries` 옵션 값에 따라 동작이 달라집니다.

- 값이 `-1`(기본값)이면 재연결될 때까지 패킷이 버퍼에 쌓입니다.
- 값이 `0`이면 패킷은 현재 서버에 연결된 클라이언트에게만 전송됩니다.

문서: http://mongodb.github.io/node-mongodb-native/3.6/api/global.html#MongoClientOptions

## 최신 릴리스 {#latest-releases}

| 버전     | 릴리스 날짜     | 릴리스 노트                                                                  | 비교                                                                                           |
|---------|---------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `0.4.0` | 2025년 8월     | [링크](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.4.0) | [`0.3.2...0.4.0`](https://github.com/socketio/socket.io-mongo-adapter/compare/0.3.2...0.4.0) |
| `0.3.2` | 2024년 1월     | [링크](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.3.2) | [`0.3.1...0.3.2`](https://github.com/socketio/socket.io-mongo-adapter/compare/0.3.1...0.3.2) |
| `0.3.1` | 2024년 1월     | [링크](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.3.1) | [`0.3.0...0.3.1`](https://github.com/socketio/socket.io-mongo-adapter/compare/0.3.0...0.3.1) |
| `0.3.0` | 2023년 2월     | [링크](https://github.com/socketio/socket.io-mongo-adapter/releases/tag/0.3.0) | [`0.2.1...0.3.0`](https://github.com/socketio/socket.io-mongo-adapter/compare/0.2.1...0.3.0) |

[전체 변경 내역](https://github.com/socketio/socket.io-mongo-adapter/blob/main/CHANGELOG.md)

## 이미터 {#emitter}

MongoDB 이미터(emitter)를 사용하면 다른 Node.js 프로세스에서 연결된 클라이언트에게 패킷을 보낼 수 있습니다.

<ThemedImage
  alt="MongoDB 어댑터의 동작 방식을 나타낸 다이어그램"
  sources={{
    light: useBaseUrl('/images/mongo-emitter.png'),
    dark: useBaseUrl('/images/mongo-emitter-dark.png'),
  }}
/>

### 설치 {#installation-1}

```
npm install @socket.io/mongo-emitter mongodb
```

### 사용법 {#usage-1}

```js
const { Emitter } = require("@socket.io/mongo-emitter");
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0");

const main = async () => {
  await mongoClient.connect();

  const mongoCollection = mongoClient.db("mydb").collection("socket.io-adapter-events");
  const emitter = new Emitter(mongoCollection);

  setInterval(() => {
    emitter.emit("ping", new Date());
  }, 1000);
}

main();
```

[이미터 치트 시트](adapter.md#emitter-cheatsheet)를 참고하세요.
