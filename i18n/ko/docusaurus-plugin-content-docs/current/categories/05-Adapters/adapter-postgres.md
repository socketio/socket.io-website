---
title: Postgres 어댑터
sidebar_position: 5
slug: /postgres-adapter/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## 동작 방식 {#how-it-works}

Postgres 어댑터는 [NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)와 [LISTEN](https://www.postgresql.org/docs/current/sql-listen.html) 명령을 기반으로 동작합니다.

여러 클라이언트에게 보내는 모든 패킷(예: `io.to("room1").emit()`, `socket.broadcast.emit()`)은 다음과 같이 처리됩니다.

- 현재 서버에 연결된 대상 클라이언트 모두에게 전송됩니다
- 패킷에 바이너리 데이터가 있거나 크기가 8000바이트 제한을 넘으면:
  - [msgpack](https://msgpack.org/)으로 인코딩해 보조 테이블에 삽입합니다
  - 그 행의 ID를 NOTIFY 명령에 담아 보냅니다
  - 클러스터의 다른 Socket.IO 서버는 이 행 ID를 받아 테이블에서 패킷을 조회해 디코딩한 다음, 자신에게 연결된 클라이언트에게 브로드캐스트합니다
- 그렇지 않으면 패킷을 NOTIFY 명령에 그대로 담아 보내고, 클러스터의 다른 Socket.IO 서버가 이 패킷을 받습니다

<ThemedImage
  alt="Postgres 어댑터의 동작 방식을 나타낸 다이어그램"
  sources={{
    light: useBaseUrl('/images/postgres-adapter.png'),
    dark: useBaseUrl('/images/postgres-adapter-dark.png'),
  }}
/>

이 어댑터의 소스 코드는 [여기](https://github.com/socketio/socket.io-postgres-adapter)에서 확인할 수 있습니다.

## 지원 기능 {#supported-features}

| 기능                             | `socket.io` 버전                     | 지원 여부                                       |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Socket 관리                      | `4.0.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터)    |
| 서버 간 통신                       | `4.1.0`                             | :white_check_mark: 예 (`0.1.0` 버전부터)    |
| 확인 응답(acknowledgement)을 받는 브로드캐스트 | [`4.5.0`](../../changelog/4.5.0.md) | :white_check_mark: 예 (`0.3.0` 버전부터)    |
| 연결 상태 복구                      | [`4.6.0`](../../changelog/4.6.0.md) | :x: 아니요                                      |

## 설치 {#installation}

```
npm install @socket.io/postgres-adapter pg
```

TypeScript를 사용한다면 `@types/pg`도 필요할 수 있습니다.

## 사용법 {#usage}

### 독립 실행형 {#standalone}

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/postgres-adapter";
import pg from "pg";

const io = new Server();

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "changeit",
  port: 5432,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS socket_io_attachments (
      id          bigserial UNIQUE,
      created_at  timestamptz DEFAULT NOW(),
      payload     bytea
  );
`);

pool.on("error", (err) => {
  console.error("Postgres error", err);
});

io.adapter(createAdapter(pool));
io.listen(3000);
```

## 옵션 {#options}

| 이름                 | 설명                                                                                            | 기본값                   |
|---------------------|-----------------------------------------------------------------------------------------------|-------------------------|
| `channelPrefix`     | 알림 채널의 접두사입니다. | `socket.io`             |
| `tableName`         | 8000바이트 제한을 넘거나 바이너리 데이터가 있는 페이로드를 저장할 테이블의 이름입니다. | `socket_io_attachments` |
| `payloadThreshold`  | 페이로드 크기 임곗값(바이트)입니다. | `8_000`                 |
| `cleanupInterval`   | 정리 쿼리 실행 간격(ms)입니다. | `30_000`                |
| `heartbeatInterval` | 하트비트 간격(ms)입니다. | `5_000`                 |
| `heartbeatTimeout`  | 이 시간(ms) 동안 하트비트가 없으면 노드가 다운된 것으로 판단합니다. | `10_000`                |

## 자주 묻는 질문 {#common-questions}

### Postgres 어댑터를 사용해도 스티키 세션을 활성화해야 하나요? {#do-i-still-need-to-enable-sticky-sessions-when-using-the-postgres-adapter}

네. 활성화하지 않으면 HTTP 400 응답을 받습니다. 요청이 그 Socket.IO 세션을 모르는 서버에 도달하기 때문입니다.

자세한 내용은 [여러 노드 사용하기](../02-Server/using-multiple-nodes.md)를 참고하세요.

### Postgres 서버가 다운되면 어떻게 되나요? {#what-happens-when-the-postgres-server-is-down}

Postgres 서버와의 연결이 끊기면 패킷은 현재 서버에 연결된 클라이언트에게만 전송됩니다.

## 최신 릴리스 {#latest-releases}

| 버전     | 릴리스 날짜     | 릴리스 노트                                                                     | 비교                                                                                              |
|---------|---------------|-----------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| `0.5.0` | 2025년 11월     | [링크](https://github.com/socketio/socket.io-postgres-adapter/releases/tag/0.5.0) | [`0.4.0...0.5.0`](https://github.com/socketio/socket.io-postgres-adapter/compare/0.4.0...0.5.0) |
| `0.4.0` | 2024년 7월     | [링크](https://github.com/socketio/socket.io-postgres-adapter/releases/tag/0.4.0) | [`0.3.1...0.4.0`](https://github.com/socketio/socket.io-postgres-adapter/compare/0.3.1...0.4.0) |
| `0.3.1` | 2023년 2월     | [링크](https://github.com/socketio/socket.io-postgres-adapter/releases/tag/0.3.1) | [`0.3.0...0.3.1`](https://github.com/socketio/socket.io-postgres-adapter/compare/0.3.0...0.3.1) |
| `0.3.0` | 2022년 4월     | [링크](https://github.com/socketio/socket.io-postgres-adapter/releases/tag/0.3.0) | [`0.2.0...0.3.0`](https://github.com/socketio/socket.io-postgres-adapter/compare/0.2.0...0.3.0) |
| `0.2.0` | 2021년 12월     | [링크](https://github.com/socketio/socket.io-postgres-adapter/releases/tag/0.2.0) | [`0.1.1...0.2.0`](https://github.com/socketio/socket.io-postgres-adapter/compare/0.1.1...0.2.0) |

[전체 변경 내역](https://github.com/socketio/socket.io-postgres-adapter/blob/main/CHANGELOG.md)

## 이미터 {#emitter}

Postgres 이미터(emitter)를 사용하면 다른 Node.js 프로세스에서 연결된 클라이언트에게 패킷을 보낼 수 있습니다.

<ThemedImage
  alt="Postgres 이미터의 동작 방식을 나타낸 다이어그램"
  sources={{
    light: useBaseUrl('/images/postgres-emitter.png'),
    dark: useBaseUrl('/images/postgres-emitter-dark.png'),
  }}
/>

### 설치 {#installation-1}

```
npm install @socket.io/postgres-emitter pg
```

### 사용법 {#usage-1}

```js
import { Emitter } from "@socket.io/postgres-emitter";
import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  password: "changeit",
});

const emitter = new Emitter(pool);

setInterval(() => {
  emitter.emit("ping", new Date());
}, 1000);
```

[이미터 치트 시트](adapter.md#emitter-cheatsheet)를 참고하세요.

### 최신 릴리스 {#latest-releases-1}

| 버전     | 릴리스 날짜    | 릴리스 노트                                                                     | 비교   |
|---------|--------------|-----------------------------------------------------------------------------------|------|
| `0.1.0` | 2021년 6월    | [링크](https://github.com/socketio/socket.io-postgres-emitter/releases/tag/0.1.0) |      |

[전체 변경 내역](https://github.com/socketio/socket.io/blob/main/packages/socket.io-postgres-emitter/CHANGELOG.md)
