---
title: 동작 원리
sidebar_position: 2
slug: /how-it-works/
toc_max_heading_level: 4
---

Socket.IO 서버와 Socket.IO 클라이언트는 다음 중 하나로 양방향 연결을 맺습니다.

- [WebTransport 양방향 스트림](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)
- [WebSocket 연결](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- 최악의 경우 HTTP 롱 폴링

Socket.IO 코드베이스는 두 계층으로 나뉩니다.

- 저수준 기반 계층: Socket.IO 내부의 엔진인 Engine.IO
- 고수준 API: Socket.IO 자체

## Engine.IO {#engineio}

Engine.IO는 서버와 클라이언트 사이의 저수준 연결을 맺고, 다음을 처리합니다.

- 여러 [전송 방식](#transports)과 [업그레이드 메커니즘](#upgrade-mechanism)
- [연결 끊김 감지](#disconnection-detection)

Engine.IO 프로토콜의 자세한 내용은 [여기](../08-Miscellaneous/eio-protocol.md)에서 확인하세요.

TypeScript로 작성된 참조 구현의 소스 코드는 Socket.IO 모노레포에 있습니다.

| 구성 요소  | 패키지             | 링크                                                                      |
|-----------|--------------------|---------------------------------------------------------------------------|
| 서버      | `engine.io`        | https://github.com/socketio/socket.io/tree/main/packages/engine.io        |
| 클라이언트 | `engine.io-client` | https://github.com/socketio/socket.io/tree/main/packages/engine.io-client |
| 파서      | `engine.io-parser` | https://github.com/socketio/socket.io/tree/main/packages/engine.io-parser |

### 전송 방식 {#transports}

현재 기본으로 제공하는 전송 방식(transport)은 세 가지입니다.

- [HTTP 롱 폴링](#http-long-polling)
- [WebSocket](#websocket)
- [WebTransport](#webtransport)

#### HTTP 롱 폴링 {#http-long-polling}

HTTP 롱 폴링 전송 방식(간단히 "polling"이라고도 합니다)은 연속된 HTTP 요청으로 이루어집니다.

- 서버에서 데이터를 받기 위한, 오래 유지되는 `GET` 요청
- 서버로 데이터를 보내기 위한, 짧게 끝나는 `POST` 요청

모든 플랫폼에서 사용할 수 있지만 패킷마다 새 HTTP 요청(헤더 포함)이 필요하므로 성능은 가장 떨어집니다.

| 지표   | 값           |
|-------------|--------------|
| 지원   | `Best`       |
| 성능   | `Acceptable` |

#### WebSocket {#websocket}

WebSocket 전송 방식은 WebSocket 연결로 데이터를 주고받습니다.

참고 자료:

- MDN: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- 명세: https://datatracker.ietf.org/doc/html/rfc6455 (2011년 12월 발표)
- Can I use: https://caniuse.com/mdn-api_websocket (2026년 초 기준, 집계 대상 전체의 `99.84%`)

모든 플랫폼에서 사용할 수 있고 성능도 뛰어납니다. HTTP 롱 폴링과 달리 HTTP 헤더를 세션을 시작할 때 한 번만 보내기 때문입니다. 다만 일부 프록시에서는 여전히 차단될 수 있습니다.

| 지표   | 값      |
|-------------|---------|
| 지원   | `Great` |
| 성능   | `Great` |

#### WebTransport {#webtransport}

WebTransport 전송 방식은 WebTransport 양방향 스트림으로 데이터를 주고받습니다.

참고 자료:

- MDN: https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API
- 명세(초안): https://datatracker.ietf.org/doc/html/draft-ietf-webtrans-http3/
- Can I use: https://caniuse.com/mdn-api_webtransport (2026년 초 기준, 집계 대상 전체의 `84.48%`)

사용할 수 있는 환경은 아직 제한적입니다(Safari에서는 현재 기술 미리 보기 단계). 하지만 가장 효율적인 전송 방식이며 특히 패킷 손실이 잦은 환경에서 효과가 큽니다.

| 지표   | 값            |
|-------------|---------------|
| 지원   | `In progress` |
| 성능   | `Best`        |

### 핸드셰이크 {#handshake}

Engine.IO 연결이 시작되면 서버는 다음 정보를 보냅니다.

```json
{
  "sid": "FSDjX-WRwSA4zTZMALqx",
  "upgrades": ["websocket"],
  "pingInterval": 25000,
  "pingTimeout": 20000,
  "maxPayload": 1000000
}
```

- `sid`는 세션 ID이며, 클라이언트는 이후 모든 HTTP 요청에 이 값을 `sid` 쿼리 파라미터로 넣어야 합니다
- `upgrades` 배열에는 서버가 지원하는 "더 나은" 전송 방식이 모두 담겨 있습니다
- `pingInterval`과 `pingTimeout` 값은 하트비트 메커니즘에 쓰입니다
- `maxPayload` 값은 서버가 받아들이는 패킷당 최대 바이트 수입니다

### 업그레이드 메커니즘 {#upgrade-mechanism}

기본적으로 클라이언트는 HTTP 롱 폴링 전송 방식으로 연결을 맺습니다.

**왜 그럴까요?**

양방향 통신에는 분명 WebSocket이 가장 좋은 방법입니다. 하지만 경험상 회사 프록시, 개인 방화벽, 백신 소프트웨어 등 때문에 WebSocket 연결을 맺지 못하는 경우가 있습니다.

사용자 입장에서 WebSocket 연결에 실패하면 실시간 애플리케이션이 데이터를 주고받기 시작하기까지 최대 10초를 기다려야 할 수 있습니다. 이렇게 기다리면 사용자 경험이 **눈에 띄게** 나빠집니다.

정리하면 Engine.IO는 안정성과 사용자 경험을 최우선으로 둡니다. 사용자 경험을 조금 더 끌어올릴 여지나 서버 성능 향상은 그다음입니다.

업그레이드할 때 클라이언트는 다음 순서로 진행합니다.

- 송신 버퍼가 비어 있는지 확인합니다
- 현재 전송 방식을 읽기 전용 모드로 바꿉니다
- 다른 전송 방식으로 연결을 시도합니다
- 성공하면 처음에 쓰던 전송 방식을 닫습니다

업그레이드 과정은 브라우저의 네트워크 모니터에서 확인할 수 있습니다.

![업그레이드 성공](/images/network-monitor.png)

1. 핸드셰이크(이후 요청에 쓰이는 세션 ID가 들어 있습니다. 여기서는 `zBjrh...AAAK`)
2. 데이터 전송(HTTP 롱 폴링)
3. 데이터 수신(HTTP 롱 폴링)
4. 업그레이드(WebSocket)
5. 데이터 수신(HTTP 롱 폴링, 4번에서 WebSocket 연결이 맺어지면 닫힘)

### 연결 끊김 감지 {#disconnection-detection}

다음과 같은 경우 Engine.IO 연결은 닫힌 것으로 봅니다.

- HTTP 요청(GET 또는 POST)이 하나라도 실패한 경우(예: 서버가 종료되었을 때)
- WebSocket 연결이 닫힌 경우(예: 사용자가 브라우저에서 탭을 닫았을 때)
- 서버나 클라이언트에서 `socket.disconnect()`를 호출한 경우

서버와 클라이언트 사이의 연결이 여전히 살아 있는지 확인하는 하트비트 메커니즘도 있습니다.

서버는 일정한 간격(핸드셰이크에서 보낸 `pingInterval` 값)마다 PING 패킷을 보내고, 클라이언트는 몇 초(`pingTimeout` 값) 안에 PONG 패킷을 돌려보내야 합니다. 서버가 PONG 패킷을 받지 못하면 연결이 닫혔다고 판단합니다. 반대로 클라이언트도 `pingInterval + pingTimeout` 안에 PING 패킷을 받지 못하면 연결이 닫힌 것으로 봅니다.

연결이 끊기는 이유는 [서버 측](../02-Server/server-socket-instance.md#disconnect)과 [클라이언트 측](../03-Client/client-socket-instance.md#disconnect) 문서에 정리되어 있습니다.


## Socket.IO {#socketio}

Socket.IO는 Engine.IO 연결 위에 다음 기능을 추가로 제공합니다.

- 자동 재연결
- [패킷 버퍼링](../03-Client/client-offline-behavior.md#buffered-events)
- [확인 응답(acknowledgement)](../04-Events/emitting-events.md#acknowledgements)
- [모든 클라이언트](../04-Events/broadcasting-events.md)나 [일부 클라이언트](../04-Events/rooms.md)("룸"이라고 부릅니다)에게 보내는 브로드캐스팅
- 일시적인 연결 끊김에 대비한 [연결 상태 복구](../01-Documentation/connection-state-recovery.md)
- [멀티플렉싱](../06-Advanced/namespaces.md)("네임스페이스"라고 부릅니다)

Socket.IO 프로토콜의 자세한 내용은 [여기](../08-Miscellaneous/sio-protocol.md)에서 확인하세요.

TypeScript로 작성된 참조 구현의 소스 코드는 Socket.IO 모노레포에 있습니다.

| 구성 요소  | 패키지             | 링크                                                                      |
|-----------|--------------------|---------------------------------------------------------------------------|
| 서버      | `socket.io`        | https://github.com/socketio/socket.io/tree/main/packages/socket.io        |
| 클라이언트 | `socket.io-client` | https://github.com/socketio/socket.io/tree/main/packages/socket.io-client |
| 파서      | `socket.io-parser` | https://github.com/socketio/socket.io/tree/main/packages/socket.io-parser |
