---
title: FAQ
sidebar_position: 1
slug: /faq/
---

import TOCInline from '@theme/TOCInline';

Socket.IO에 관해 자주 묻는 질문을 모았습니다.

<TOCInline toc={toc} />

## 뭔가 제대로 동작하지 않아요. 도와주세요! {#something-does-not-work-properly-please-help}

[연결 문제 해결](../01-Documentation/troubleshooting.md) 가이드를 확인하세요.

## 내부적으로는 어떻게 동작하나요? {#how-does-it-work-under-the-hood}

Socket.IO 연결은 여러 가지 저수준 전송 방식(transport)으로 맺을 수 있습니다.

- HTTP 롱 폴링
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)

Socket.IO는 다음 조건에 따라 사용할 수 있는 가장 좋은 방식을 자동으로 고릅니다.

- 브라우저 지원 범위([WebSocket](https://caniuse.com/websockets), [WebTransport](https://caniuse.com/webtransport) 참고)
- 네트워크 환경(일부 네트워크는 WebSocket이나 WebTransport 연결을 차단합니다)

자세한 내용은 [동작 원리](../01-Documentation/how-it-works.md) 문서를 참고하세요.

## Socket.IO는 일반 WebSocket에 비해 어떤 기능을 제공하나요? {#what-are-the-features-provided-by-socketio-over-plain-websocket}

WebSocket은 훌륭합니다! 빈말이 아닙니다. 클라이언트와 서버 사이에서 데이터를 효율적으로 주고받을 수 있게 해 줍니다. 장점은 다음과 같습니다.

- 서버에서 데이터를 가져오려고 주기적으로 폴링할 필요가 없습니다
- 서버로 데이터를 보낼 때마다 HTTP 헤더 전체를 반복해서 보낼 필요가 없습니다

그래서 게임, 채팅, 협업 도구처럼 지연 시간이 짧아야 하고 데이터를 많이 주고받는 애플리케이션에 안성맞춤입니다.

다만 WebSocket은 꽤 저수준이어서 실시간 애플리케이션을 개발하려면 그 위에 추가 계층이 필요한 경우가 많습니다.

- WebSocket 연결을 맺을 수 없을 때 HTTP 롱 폴링으로 대체
- WebSocket 연결이 닫혔을 때 자동 재연결
- 데이터를 보내고 상대편의 응답을 기다리는 확인 응답(acknowledgement)
- 연결된 모든 클라이언트 또는 일부 클라이언트에게 브로드캐스트
- 서버 인스턴스를 여러 대로 확장
- 짧은 연결 끊김에 대비한 연결 복구

짐작했겠지만 이 추가 계층을 구현한 것이 바로 Socket.IO 라이브러리입니다.

## WebTransport는 무엇인가요? {#what-is-webtransport}

간단히 말해 WebTransport는 WebSocket의 대안입니다. [HOL 블로킹](https://en.wikipedia.org/wiki/Head-of-line_blocking)(head-of-line blocking)처럼 WebSocket이 안고 있는 여러 성능 문제를 해결합니다.

이 새로운 웹 API는 2022년 1월 Chrome에, 2023년 6월 Firefox에 포함되었습니다. 더 자세한 내용은 다음 링크를 확인하세요.

- https://w3c.github.io/webtransport/
- https://developer.mozilla.org/en-US/docs/Web/API/WebTransport
- https://developer.chrome.com/articles/webtransport/

:::note

WebTransport는 보안 컨텍스트(HTTPS)가 필요하기 때문에 Socket.IO에서 기본적으로 꺼져 있습니다. WebTransport를 직접 써 보고 싶다면 [전용 튜토리얼](/get-started/webtransport)을 확인하세요.

:::

## Socket.IO는 메시지를 저장하나요? {#does-socketio-store-the-messages}

Socket.IO 서버는 메시지를 전혀 저장하지 않습니다.

현재 연결되어 있지 않은 클라이언트를 위해 메시지를 *어딘가에* 보관하는 일은 애플리케이션이 맡아야 합니다.

:::tip

다만 [연결 상태 복구](../01-Documentation/connection-state-recovery.md) 기능을 켜면 Socket.IO가 짧은 시간 동안 메시지를 저장합니다.

:::

## Socket.IO는 어떤 전달 보장을 제공하나요? {#what-are-the-delivery-guarantees-of-socketio}

Socket.IO는 어떤 저수준 전송 방식을 쓰든(두 전송 방식 사이를 전환할 때도) **메시지 순서를 보장합니다**.

또한 Socket.IO는 기본적으로 **최대 한 번(at most once)** 전달("fire and forget"이라고도 합니다)을 보장합니다. 즉 특정 상황에서는 메시지가 유실될 수 있으며 재시도하지 않습니다.

자세한 내용은 [전달 보장](../01-Documentation/delivery-guarantees.md) 문서를 참고하세요.

## 특정 사용자를 어떻게 식별하나요? {#how-to-identify-a-given-user}

Socket.IO에는 사용자라는 개념이 없습니다.

Socket.IO 연결을 사용자 계정과 매핑하는 일은 애플리케이션이 맡아야 합니다.

예를 들어 Node.js 애플리케이션에서는 다음과 같이 할 수 있습니다.

- [Passport](https://www.passportjs.org/)가 제공하는 사용자 컨텍스트를 재사용합니다([이 튜토리얼](/how-to/use-with-express-session) 참고)
- 또는 클라이언트 측에서 [`auth`](../../client-options.md#auth) 옵션으로 사용자 자격 증명을 보내고 [미들웨어](../02-Server/middlewares.md)에서 검증합니다

## 변경 내역은 어디에서 볼 수 있나요? {#where-can-i-find-the-changelog}

[변경 내역](../../changelog/index.md)을 참고하세요.
