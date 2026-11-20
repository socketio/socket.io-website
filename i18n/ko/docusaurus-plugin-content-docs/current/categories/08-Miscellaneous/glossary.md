---
title: 용어집
sidebar_position: 2
slug: /glossary/
---

Socket.IO 생태계와 관련된 용어를 정리합니다.

- [어댑터](#adapter)
- [Engine.IO](#engineio)
- [네임스페이스](#namespace)
- [룸](#room)
- [전송 방식](#transport)

## 어댑터 {#adapter}

어댑터(adapter)는 다음 역할을 맡는 서버 측 구성 요소입니다.

- Socket 인스턴스와 [룸](../04-Events/rooms.md) 사이의 관계 저장
- [모든 클라이언트](../04-Events/broadcasting-events.md)(또는 일부 클라이언트)에게 이벤트 브로드캐스트

Socket.IO 서버에 기본으로 포함된 [인메모리 어댑터](https://github.com/socketio/socket.io-adapter/) 외에 현재 공식 어댑터가 5개 있습니다.

- [Redis 어댑터](../05-Adapters/adapter-redis.md)
- [Redis Streams 어댑터](../05-Adapters/adapter-redis-streams.md)
- [MongoDB 어댑터](../05-Adapters/adapter-mongo.md)
- [Postgres 어댑터](../05-Adapters/adapter-postgres.md)
- [클러스터 어댑터](../05-Adapters/adapter-cluster.md)

인메모리 어댑터를 확장하면 RabbitMQ나 Google Pub/Sub 같은 다른 메시징 시스템도 지원할 수 있습니다.

자세한 내용은 [어댑터 문서](../05-Adapters/adapter.md)를 참고하세요.

## Engine.IO {#engineio}

Engine.IO는 Socket.IO의 내부 구성 요소로, 서버와 클라이언트 사이에 저수준 연결을 맺는 역할을 맡습니다.

자세한 내용은 [동작 원리 문서](../01-Documentation/how-it-works.md)를 참고하세요.

## 네임스페이스 {#namespace}

네임스페이스(namespace)는 서버 측에서 애플리케이션 로직을 나누는 데 쓰는 개념입니다.

자세한 내용은 [네임스페이스 문서](../06-Advanced/namespaces.md)를 참고하세요.

## 룸 {#room}

룸(room)은 일부 클라이언트에게만 데이터를 브로드캐스트할 때 쓰는 서버 측 개념입니다.

자세한 내용은 [룸 문서](../04-Events/rooms.md)를 참고하세요.

## 전송 방식 {#transport}

전송 방식(transport)은 서버와 클라이언트 사이에 연결을 맺는 저수준 방법을 말합니다.

현재 구현된 전송 방식은 세 가지입니다.

- HTTP 롱 폴링
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)

자세한 내용은 [동작 원리 문서](../01-Documentation/how-it-works.md#transports)를 참고하세요.
