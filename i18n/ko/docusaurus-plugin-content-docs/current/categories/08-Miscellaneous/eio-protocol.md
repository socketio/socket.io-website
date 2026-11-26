---
title: Engine.IO 프로토콜
sidebar_position: 3
slug: /engine-io-protocol/
---

이 문서는 Engine.IO 프로토콜 버전 4.1을 설명합니다.

**목차**

<!-- TOC -->
  * [소개](#introduction)
  * [전송 방식](#transports)
    * [HTTP 롱 폴링](#http-long-polling)
      * [요청 경로](#request-path)
      * [쿼리 매개변수](#query-parameters)
      * [헤더](#headers)
      * [데이터 보내기와 받기](#sending-and-receiving-data)
        * [데이터 보내기](#sending-data)
        * [데이터 받기](#receiving-data)
    * [WebSocket](#websocket)
    * [WebTransport](#webtransport)
  * [프로토콜](#protocol)
    * [핸드셰이크](#handshake)
    * [하트비트](#heartbeat)
    * [업그레이드](#upgrade)
    * [메시지](#message)
  * [패킷 인코딩](#packet-encoding)
    * [HTTP 롱 폴링](#http-long-polling-1)
    * [WebSocket](#websocket-1)
    * [WebTransport](#webtransport-1)
  * [변경 내역](#history)
    * [v2에서 v3으로](#from-v2-to-v3)
    * [v3에서 v4로](#from-v3-to-v4)
    * [v4에서 v4.1로](#from-v4-to-v41)
  * [테스트 스위트](#test-suite)
<!-- TOC -->


## 소개 {#introduction}

Engine.IO 프로토콜을 사용하면 클라이언트와 서버가 오버헤드가 적은 [전이중(full-duplex)](https://en.wikipedia.org/wiki/Duplex_(telecommunications)#FULL-DUPLEX) 방식으로 통신할 수 있습니다.

이 프로토콜은 [WebSocket 프로토콜](https://en.wikipedia.org/wiki/WebSocket)을 기반으로 하며, WebSocket 연결을 맺을 수 없을 때는 [HTTP 롱 폴링](https://en.wikipedia.org/wiki/Push_technology#Long_polling)을 대체 수단(fallback)으로 사용합니다.

레퍼런스 구현은 [TypeScript](https://www.typescriptlang.org/)로 작성되었습니다.

- 서버: https://github.com/socketio/socket.io/tree/main/packages/engine.io
- 클라이언트: https://github.com/socketio/socket.io/tree/main/packages/engine.io-client

[Socket.IO 프로토콜](https://github.com/socketio/socket.io/blob/main/docs/socket.io-protocol/v5-current.md)은 이 기반 위에 만들어졌으며, Engine.IO 프로토콜이 제공하는 통신 채널 위에 추가 기능을 더합니다.

## 전송 방식 {#transports}

Engine.IO 클라이언트와 Engine.IO 서버 사이의 연결은 다음 방식으로 맺을 수 있습니다.

- [HTTP 롱 폴링](#http-long-polling)
- [WebSocket](#websocket)
- [WebTransport](#webtransport)

### HTTP 롱 폴링 {#http-long-polling}

HTTP 롱 폴링 전송 방식(transport)은 간단히 "polling"이라고도 부르며, 다음과 같은 연속된 HTTP 요청으로 이루어집니다.

- 서버에서 데이터를 받는 데 쓰는, 오래 유지되는 `GET` 요청
- 서버로 데이터를 보내는 데 쓰는, 짧게 끝나는 `POST` 요청

#### 요청 경로 {#request-path}

HTTP 요청 경로는 기본적으로 `/engine.io/`입니다.

이 프로토콜 위에 만들어진 라이브러리는 경로를 바꿀 수 있습니다. 예를 들어 Socket.IO 프로토콜은 `/socket.io/`를 사용합니다.

#### 쿼리 매개변수 {#query-parameters}

다음 쿼리 매개변수를 사용합니다.

| 이름        | 값        | 설명                                                               |
|-------------|-----------|--------------------------------------------------------------------|
| `EIO`       | `4`       | 필수. 프로토콜 버전입니다.                                         | 
| `transport` | `polling` | 필수. 전송 방식 이름입니다.                                        |
| `sid`       | `<sid>`   | 세션이 만들어진 뒤에는 필수. 세션 식별자입니다.                    |

필수 쿼리 매개변수가 없으면 서버는 반드시 HTTP 400 오류 상태로 응답해야 합니다.

#### 헤더 {#headers}

바이너리 데이터를 보낼 때 송신자(클라이언트 또는 서버)는 반드시 `Content-Type: application/octet-stream` 헤더를 포함해야 합니다.

`Content-Type` 헤더가 명시되지 않았으면 수신자는 데이터를 일반 텍스트(plaintext)로 간주하는 것이 좋습니다(SHOULD).

참고: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type

#### 데이터 보내기와 받기 {#sending-and-receiving-data}

##### 데이터 보내기 {#sending-data}

패킷을 보내려면 클라이언트는 반드시 패킷을 인코딩해 요청 본문에 담은 HTTP `POST` 요청을 만들어야 합니다.

```
CLIENT                                                 SERVER

  │                                                      │
  │   POST /engine.io/?EIO=4&transport=polling&sid=...   │
  │ ───────────────────────────────────────────────────► │
  │ ◄──────────────────────────────────────────────────┘ │
  │                        HTTP 200                      │
  │                                                      │
```

서버는 `sid` 쿼리 매개변수로 받은 세션 ID를 모르면 반드시 HTTP 400 응답을 반환해야 합니다.

성공했음을 알리려면 서버는 반드시 응답 본문에 문자열 `ok`를 담아 HTTP 200 응답을 반환해야 합니다.

패킷 순서를 보장하려면 클라이언트에서 진행 중인 `POST` 요청이 동시에 두 개 이상 있어서는 안 됩니다. 이런 상황이 생기면 서버는 반드시 HTTP 400 오류 상태를 반환하고 세션을 닫아야 합니다.

##### 데이터 받기 {#receiving-data}

패킷을 받으려면 클라이언트는 반드시 HTTP `GET` 요청을 만들어야 합니다.

```
CLIENT                                                SERVER

  │   GET /engine.io/?EIO=4&transport=polling&sid=...   │
  │ ──────────────────────────────────────────────────► │
  │                                                   . │
  │                                                   . │
  │                                                   . │
  │                                                   . │
  │ ◄─────────────────────────────────────────────────┘ │
  │                       HTTP 200                      │
```

서버는 `sid` 쿼리 매개변수로 받은 세션 ID를 모르면 반드시 HTTP 400 응답을 반환해야 합니다.

그 세션의 버퍼에 쌓인 패킷이 없으면 서버는 바로 응답하지 않고 기다릴 수 있습니다(MAY). 보낼 패킷이 생기면 서버는 패킷을 인코딩해([패킷 인코딩](#packet-encoding) 참고) HTTP 요청의 응답 본문에 담아 보내는 것이 좋습니다(SHOULD).

패킷 순서를 보장하려면 클라이언트에서 진행 중인 `GET` 요청이 동시에 두 개 이상 있어서는 안 됩니다. 이런 상황이 생기면 서버는 반드시 HTTP 400 오류 상태를 반환하고 세션을 닫아야 합니다.

### WebSocket {#websocket}

WebSocket 전송 방식은 [WebSocket 연결](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)로 이루어지며, 이 연결은 서버와 클라이언트 사이에 지연 시간이 짧은 양방향 통신 채널을 제공합니다.

다음 쿼리 매개변수를 사용합니다.

| 이름        | 값          | 설명                                                                          |
|-------------|-------------|-------------------------------------------------------------------------------|
| `EIO`       | `4`         | 필수. 프로토콜 버전입니다.                                                    | 
| `transport` | `websocket` | 필수. 전송 방식 이름입니다.                                                   |
| `sid`       | `<sid>`     | 선택. HTTP 롱 폴링에서 업그레이드하는지에 따라 다릅니다.                     |

필수 쿼리 매개변수가 없으면 서버는 반드시 WebSocket 연결을 닫아야 합니다.

각 패킷(읽기 또는 쓰기)은 별도의 [WebSocket 프레임](https://datatracker.ietf.org/doc/html/rfc6455#section-5)으로 전송됩니다.

클라이언트는 세션당 WebSocket 연결을 두 개 이상 열어서는 안 됩니다. 이런 상황이 생기면 서버는 반드시 WebSocket 연결을 닫아야 합니다.

### WebTransport {#webtransport}

WebTransport 전송 방식은 [WebTransport 양방향 스트림](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)으로 이루어지며, 이 스트림은 서버와 클라이언트 사이에 지연 시간이 짧은 양방향 통신 채널을 제공합니다.

[MDN 문서](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)의 설명은 다음과 같습니다.

> WebTransport API는 WebSocket을 현대적으로 개선한 API로, [HTTP/3 Transport](https://datatracker.ietf.org/doc/html/draft-ietf-webtrans-http3/)를 사용해 클라이언트와 서버 사이에 데이터를 전송합니다. WebTransport는 다중 스트림, 단방향 스트림, 순서가 보장되지 않는 전달(out-of-order delivery)을 지원합니다. 스트림으로는 신뢰성 있는 전송을, UDP와 비슷한 데이터그램으로는 신뢰성 없는 전송을 할 수 있습니다.

클라이언트는 세션당 WebTransport 스트림을 두 개 이상 열어서는 안 됩니다. 이런 상황이 생기면 서버는 반드시 WebTransport 세션을 닫아야 합니다.

참고: 쿼리 매개변수는 WebTransport 명세에 포함되지 않는 구현 세부 사항이므로 현재 버전의 프로토콜은 쿼리 매개변수를 사용하지 않습니다. 이 부분은 앞으로 바뀔 수 있습니다.


## 프로토콜 {#protocol}

Engine.IO 패킷은 다음으로 구성됩니다.

- 패킷 타입
- 패킷 페이로드(선택)

사용할 수 있는 패킷 타입은 다음과 같습니다.

| 타입    | ID  | 용도                                             |
|---------|-----|--------------------------------------------------|
| open    | 0   | [핸드셰이크](#handshake) 중에 사용합니다.        | 
| close   | 1   | 전송 방식을 닫아도 된다는 것을 알릴 때 사용합니다. |
| ping    | 2   | [하트비트 메커니즘](#heartbeat)에서 사용합니다.  |
| pong    | 3   | [하트비트 메커니즘](#heartbeat)에서 사용합니다.  |
| message | 4   | 상대편에 페이로드를 보낼 때 사용합니다.          |
| upgrade | 5   | [업그레이드 과정](#upgrade)에서 사용합니다.      |
| noop    | 6   | [업그레이드 과정](#upgrade)에서 사용합니다.      |

### 핸드셰이크 {#handshake}

연결을 맺으려면 클라이언트는 반드시 서버에 HTTP `GET` 요청을 보내야 합니다.

- HTTP 롱 폴링으로 먼저 연결하는 경우(기본값)

```
CLIENT                                                    SERVER

  │                                                          │
  │        GET /engine.io/?EIO=4&transport=polling           │
  │ ───────────────────────────────────────────────────────► │
  │ ◄──────────────────────────────────────────────────────┘ │
  │                        HTTP 200                          │
  │                                                          │
```

- WebSocket만 사용하는 경우

```
CLIENT                                                    SERVER

  │                                                          │
  │        GET /engine.io/?EIO=4&transport=websocket         │
  │ ───────────────────────────────────────────────────────► │
  │ ◄──────────────────────────────────────────────────────┘ │
  │               HTTP 101 Switching Protocols               │
  │                                                          │
```

- WebTransport만 사용하는 경우

WebTransport만 사용하는 세션에서는 클라이언트가 반드시 양방향 스트림으로 `open` 패킷을 먼저 보내야 합니다.

```
CLIENT                                                    SERVER

  │        (WebTransport session + bidirectional stream)     │
  │ ───────────────────────────────────────────────────────► │
  │                                                          │
  │                       0 (open packet)                    │
  │ ───────────────────────────────────────────────────────► │
  │ ◄──────────────────────────────────────────────────────  │
  │                        0{"sid":"..."}                    │
  │                                                          │
```

서버는 연결을 수락하면 반드시 다음 내용을 JSON으로 인코딩해 페이로드에 담은 `open` 패킷으로 응답해야 합니다.

| 키             | 타입       | 설명                                                                                                              |
|----------------|------------|-------------------------------------------------------------------------------------------------------------------|
| `sid`          | `string`   | 세션 ID입니다.                                                                                                    |
| `upgrades`     | `string[]` | 사용할 수 있는 [전송 방식 업그레이드](#upgrade) 목록입니다.                                                       |
| `pingInterval` | `number`   | [하트비트 메커니즘](#heartbeat)에서 사용하는 ping 간격입니다(밀리초 단위).                                        |
| `pingTimeout`  | `number`   | [하트비트 메커니즘](#heartbeat)에서 사용하는 ping 타임아웃입니다(밀리초 단위).                                    |
| `maxPayload`   | `number`   | 청크당 최대 바이트 수입니다. 클라이언트가 패킷을 모아 [페이로드](#packet-encoding)로 합칠 때 사용합니다.          |

예시:

```json
{
  "sid": "lv_VI97HAXpY6yYWAAAC",
  "upgrades": ["websocket"],
  "pingInterval": 25000,
  "pingTimeout": 20000,
  "maxPayload": 1000000
}
```

클라이언트는 이후 모든 요청의 쿼리 매개변수에 반드시 `sid` 값을 담아 보내야 합니다.

### 하트비트 {#heartbeat}

[핸드셰이크](#handshake)가 끝나면 연결이 살아 있는지 확인하는 하트비트 메커니즘이 시작됩니다.

```
CLIENT                                                 SERVER

  │                   *** Handshake ***                  │
  │                                                      │
  │  ◄─────────────────────────────────────────────────  │
  │                           2                          │  (ping packet)
  │  ─────────────────────────────────────────────────►  │
  │                           3                          │  (pong packet)
```

서버는 핸드셰이크에서 보낸 `pingInterval` 값의 간격으로 `ping` 패킷을 보내고, 클라이언트는 `pingTimeout` 값으로 정해진 몇 초 안에 `pong` 패킷을 돌려보내야 합니다.

서버가 `pong` 패킷을 돌려받지 못하면 연결이 닫혔다고 간주하는 것이 좋습니다(SHOULD).

반대로 클라이언트가 `pingInterval + pingTimeout` 안에 `ping` 패킷을 받지 못하면 연결이 닫혔다고 간주하는 것이 좋습니다(SHOULD).

### 업그레이드 {#upgrade}

기본적으로 클라이언트는 먼저 HTTP 롱 폴링 연결을 만든 다음, 더 나은 전송 방식을 사용할 수 있으면 그 방식으로 업그레이드하는 것이 좋습니다(SHOULD).

WebSocket(또는 WebTransport)으로 업그레이드하려면 클라이언트는 반드시 다음과 같이 해야 합니다.

- 패킷이 유실되지 않도록 HTTP 롱 폴링 전송 방식을 일시 중지합니다(더 이상 HTTP 요청을 보내지 않습니다)
- 같은 세션 ID로 WebSocket 연결(또는 WebTransport 양방향 스트림)을 엽니다
- 페이로드에 문자열 `probe`를 담은 `ping` 패킷을 보냅니다

서버는 반드시 다음과 같이 해야 합니다.

- 대기 중인 `GET` 요청이 있으면 그 요청에 `noop` 패킷을 보내 HTTP 롱 폴링 전송 방식을 깔끔하게 닫습니다
- 페이로드에 문자열 `probe`를 담은 `pong` 패킷으로 응답합니다

마지막으로 클라이언트는 반드시 `upgrade` 패킷을 보내 업그레이드를 완료해야 합니다.

```
CLIENT                                                 SERVER

  │                                                      │
  │   GET /engine.io/?EIO=4&transport=websocket&sid=...  │
  │ ───────────────────────────────────────────────────► │
  │  ◄─────────────────────────────────────────────────┘ │
  │            HTTP 101 (WebSocket handshake)            │
  │                                                      │
  │            -----  WebSocket frames -----             │
  │  ─────────────────────────────────────────────────►  │
  │                         2probe                       │ (ping packet)
  │  ◄─────────────────────────────────────────────────  │
  │                         3probe                       │ (pong packet)
  │  ─────────────────────────────────────────────────►  │
  │                         5                            │ (upgrade packet)
  │                                                      │
```

### 메시지 {#message}

[핸드셰이크](#handshake)가 끝나면 클라이언트와 서버는 데이터를 `message` 패킷에 담아 주고받을 수 있습니다.


## 패킷 인코딩 {#packet-encoding}

Engine.IO 패킷의 직렬화 방식은 페이로드 종류(일반 텍스트 또는 바이너리)와 전송 방식에 따라 다릅니다.

일반 텍스트와 base64로 인코딩된 바이너리 페이로드의 문자 인코딩은 UTF-8입니다.

### HTTP 롱 폴링 {#http-long-polling-1}

HTTP 롱 폴링 전송 방식의 특성상 처리량을 높이려고 여러 패킷을 페이로드 하나로 이어 붙일 수 있습니다.

형식:

```
<packet type>[<data>]<separator><packet type>[<data>]<separator><packet type>[<data>][...]
```

예시:

```
4hello\x1e2\x1e4world

with:

4      => message packet type
hello  => message payload
\x1e   => separator
2      => ping packet type
\x1e   => separator
4      => message packet type
world  => message payload
```

패킷은 [레코드 구분 문자](https://en.wikipedia.org/wiki/C0_and_C1_control_codes#Field_separators)인 `\x1e`로 구분합니다.

바이너리 페이로드는 반드시 base64로 인코딩하고 앞에 `b` 문자를 붙여야 합니다.

예시:

```
4hello\x1ebAQIDBA==

with:

4         => message packet type
hello     => message payload
\x1e      => separator
b         => binary prefix
AQIDBA==  => buffer <01 02 03 04> encoded as base64
```

클라이언트는 [핸드셰이크](#handshake) 중에 받은 `maxPayload` 값을 기준으로 이어 붙일 패킷 수를 정하는 것이 좋습니다(SHOULD).

### WebSocket {#websocket-1}

각 Engine.IO 패킷은 별도의 [WebSocket 프레임](https://datatracker.ietf.org/doc/html/rfc6455#section-5)으로 전송됩니다.

형식:

```
<packet type>[<data>]
```

예시:

```
4hello

with:

4      => message packet type
hello  => message payload (UTF-8 encoded)
```

바이너리 페이로드는 수정 없이 그대로 전송됩니다.

### WebTransport {#webtransport-1}

WebTransport는 스트림 기반 전송 방식이므로 페이로드를 보내기 전에 페이로드 정보를 담은 헤더를 먼저 보냅니다.

헤더 구조는 [WebSocket 프레이밍](https://datatracker.ietf.org/doc/html/rfc6455#section-5.2)에서 많은 영향을 받았습니다.

헤더는 페이로드 길이에 따라 달라집니다.

| 페이로드 길이(바이트)     | 헤더 길이(바이트)        | 세부 사항                                    |
|---------------------------|--------------------------|----------------------------------------------|
| `<= 125`                  | 1                        | `x` + 7비트로 인코딩한 길이                  |
| `> 125`이고 `<= 65 535`   | 3                        | `x1111110` + 2바이트로 인코딩한 길이         |
| `> 65 535`                | 9                        | `x1111111` + 8바이트로 인코딩한 길이         |

`x` 비트는 페이로드가 일반 텍스트(`0`) 데이터인지 바이너리(`1`) 데이터인지 나타냅니다.

예시:

`socket.send("hello")`는 다음과 같이 전송됩니다.

```
header: buffer <06>

with:

0       => plaintext payload
0000110 => 6 bytes

payload: buffer <34 68 65 6c 6c 6f>

with:

0x34 = ASCII "4", the Engine.IO MESSAGE packet type
0x68 = "h"
0x65 = "e"
0x6c = "l"
0x6c = "l"
0x6f = "o"
```

## 변경 내역 {#history}

### v2에서 v3으로 {#from-v2-to-v3}

- 바이너리 데이터 지원 추가

프로토콜 [버전 2](https://github.com/socketio/engine.io-protocol/tree/v2)는 Socket.IO `v0.9` 이하에서 사용됩니다.

프로토콜 [버전 3](https://github.com/socketio/engine.io-protocol/tree/v3)은 Socket.IO `v1`과 `v2`에서 사용됩니다.

### v3에서 v4로 {#from-v3-to-v4}

- ping/pong 방향 반전

이제 ping 패킷은 서버가 보냅니다. 브라우저에서 설정한 타이머를 충분히 신뢰할 수 없기 때문입니다. 타임아웃 문제 중 상당수는
클라이언트 측 타이머가 지연되어 생긴 것으로 추정됩니다.

- 바이너리 데이터가 포함된 페이로드를 인코딩할 때 항상 base64 사용

이 변경으로 바이너리 포함 여부와 관계없이 모든 페이로드를 같은 방식으로 처리할 수 있습니다. 클라이언트나 현재 전송 방식이
바이너리 데이터를 지원하는지 따질 필요가 없습니다.

참고로 이 내용은 HTTP 롱 폴링에만 적용됩니다. WebSocket 프레임에서는 바이너리 데이터를 별도 변환 없이 보냅니다.

- 문자 수를 세는 대신 레코드 구분 문자(`\x1e`) 사용

문자 수를 세는 방식 때문에 UTF-16 인코딩을 사용하지 않을 수도 있는 다른 언어로는 프로토콜을 구현할 수 없거나
적어도 구현하기가 어려웠습니다.

예를 들어 `€`는 `2:4€`로 인코딩되었지만 실제로는 `Buffer.byteLength('€') === 3`입니다.

참고: 이 방식은 데이터 안에 레코드 구분 문자가 쓰이지 않는다고 가정합니다.

버전 4는 Socket.IO `v3.0.0`(2020년 11월) 이상에 포함되어 있습니다.

### v4에서 v4.1로 {#from-v4-to-v41}

WebTransport 지원이 추가되었습니다.

버전 4.1은 Socket.IO `v4.6.0`(2023년 6월)에 포함되어 있습니다.

## 테스트 스위트 {#test-suite}

`test-suite/` 디렉터리에 있는 테스트 스위트로 서버 구현이 프로토콜을 준수하는지 확인할 수 있습니다.

사용법:

- Node.js에서: `npm ci && npm test`
- 브라우저에서: 브라우저로 `index.html` 파일을 열기만 하면 됩니다

참고로 모든 테스트를 통과하는 데 필요한 JavaScript 서버 설정은 다음과 같습니다.

```js
import { listen } from "engine.io";

const server = listen(3000, {
  pingInterval: 300,
  pingTimeout: 200,
  maxPayload: 1e6,
  cors: {
    origin: "*"
  }
});

server.on("connection", socket => {
  socket.on("data", (...args) => {
    socket.send(...args);
  });
});
```
