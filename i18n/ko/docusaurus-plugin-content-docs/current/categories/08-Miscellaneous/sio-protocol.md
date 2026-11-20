---
title: Socket.IO 프로토콜
sidebar_position: 4
slug: /socket-io-protocol/
---

이 문서는 Socket.IO 프로토콜 버전 5를 설명합니다.

이 문서의 원본은 [socket.io-protocol 저장소](https://github.com/socketio/socket.io-protocol)에 있습니다.

**목차**

- [소개](#introduction)
- [교환 프로토콜](#exchange-protocol)
  - [네임스페이스 연결](#connection-to-a-namespace)
  - [데이터 보내기와 받기](#sending-and-receiving-data)
  - [확인 응답](#acknowledgement)
  - [네임스페이스 연결 해제](#disconnection-from-a-namespace)
- [패킷 인코딩](#packet-encoding)
  - [형식](#format)
  - [예시](#examples)
    - [네임스페이스 연결](#connection-to-a-namespace-1)
    - [데이터 보내기와 받기](#sending-and-receiving-data-1)
    - [확인 응답](#acknowledgement-1)
    - [네임스페이스 연결 해제](#disconnection-from-a-namespace-1)
- [세션 예시](#sample-session)
- [변경 내역](#history)
  - [v5와 v4의 차이](#difference-between-v5-and-v4)
  - [v4와 v3의 차이](#difference-between-v4-and-v3)
  - [v3과 v2의 차이](#difference-between-v3-and-v2)
  - [v2와 v1의 차이](#difference-between-v2-and-v1)
  - [초기 리비전](#initial-revision)
- [테스트 스위트](#test-suite)


## 소개 {#introduction}

Socket.IO 프로토콜을 사용하면 클라이언트와 서버가 오버헤드가 적은 [전이중(full-duplex)](https://en.wikipedia.org/wiki/Duplex_(telecommunications)#FULL-DUPLEX) 방식으로 통신할 수 있습니다.

이 프로토콜은 [Engine.IO 프로토콜](https://github.com/socketio/engine.io-protocol) 위에 만들어졌으며, WebSocket과 HTTP 롱 폴링을 이용한 저수준 처리는 Engine.IO 프로토콜이 담당합니다.

Socket.IO 프로토콜은 다음 기능을 추가합니다.

- 멀티플렉싱(Socket.IO 용어로는 ["네임스페이스"](https://socket.io/docs/v4/namespaces)라고 부릅니다)

JavaScript API를 사용한 예시:

*서버*

```js
// 네임스페이스 선언
const namespace = io.of("/admin");
// 네임스페이스 연결 처리
namespace.on("connection", (socket) => {
  // ...
});
```

*클라이언트*

```js
// 메인 네임스페이스에 연결
const socket1 = io();
// "/admin" 네임스페이스에 연결(기반이 되는 WebSocket 연결은 같음)
const socket2 = io("/admin");
// 네임스페이스 연결 처리
socket2.on("connect", () => {
  // ...
});
```

- 패킷 확인 응답(acknowledgement)

JavaScript API를 사용한 예시:

```js
// 한쪽에서
socket.emit("hello", "foo", (arg) => {
  console.log("received", arg);
});

// 다른 쪽에서
socket.on("hello", (arg, ack) => {
  ack("bar");
});
```

레퍼런스 구현은 [TypeScript](https://www.typescriptlang.org/)로 작성되었습니다.

- 서버: https://github.com/socketio/socket.io
- 클라이언트: https://github.com/socketio/socket.io-client


## 교환 프로토콜 {#exchange-protocol}

Socket.IO 패킷은 다음 필드로 이루어집니다.

- 패킷 타입(정수)
- 네임스페이스(문자열)
- 페이로드(Object | Array, 선택)
- 확인 응답 ID(정수, 선택)

사용할 수 있는 패킷 타입은 다음과 같습니다.

| 타입          | ID  | 용도                                                                                  |
|---------------|-----|---------------------------------------------------------------------------------------|
| CONNECT       | 0   | [네임스페이스 연결](#connection-to-a-namespace) 중에 사용합니다.                      |
| DISCONNECT    | 1   | [네임스페이스 연결을 해제](#disconnection-from-a-namespace)할 때 사용합니다.          |
| EVENT         | 2   | 상대편에 [데이터를 보낼](#sending-and-receiving-data) 때 사용합니다.                  |
| ACK           | 3   | 이벤트에 [확인 응답](#acknowledgement)을 보낼 때 사용합니다.                          |
| CONNECT_ERROR | 4   | [네임스페이스 연결](#connection-to-a-namespace) 중에 사용합니다.                      |
| BINARY_EVENT  | 5   | 상대편에 [바이너리 데이터를 보낼](#sending-and-receiving-data) 때 사용합니다.         |
| BINARY_ACK    | 6   | 이벤트에 [확인 응답](#acknowledgement)을 보낼 때 사용합니다(응답에 바이너리 데이터 포함). |


### 네임스페이스 연결 {#connection-to-a-namespace}

Socket.IO 세션을 시작할 때 클라이언트는 반드시 `CONNECT` 패킷을 보내야 합니다.

서버는 반드시 다음 중 하나로 응답해야 합니다.

- 연결에 성공하면 페이로드에 세션 ID를 담은 `CONNECT` 패킷
- 연결이 허용되지 않으면 `CONNECT_ERROR` 패킷

```
CLIENT                                                      SERVER

  │  ───────────────────────────────────────────────────────►  │
  │             { type: CONNECT, namespace: "/" }              │
  │  ◄───────────────────────────────────────────────────────  │
  │   { type: CONNECT, namespace: "/", data: { sid: "..." } }  │
```

첫 패킷으로 `CONNECT` 패킷을 받지 못하면 서버는 반드시 즉시 연결을 닫아야 합니다.

클라이언트는 기반이 되는 같은 WebSocket 연결을 공유하면서 여러 네임스페이스에 동시에 연결될 수 있습니다(MAY).

예시:

- 메인 네임스페이스(이름은 `"/"`)

```
Client > { type: CONNECT, namespace: "/" }
Server > { type: CONNECT, namespace: "/", data: { sid: "wZX3oN0bSVIhsaknAAAI" } }
```

- 커스텀 네임스페이스

```
Client > { type: CONNECT, namespace: "/admin" }
Server > { type: CONNECT, namespace: "/admin", data: { sid: "oSO0OpakMV_3jnilAAAA" } }
```

- 추가 페이로드가 있는 경우

```
Client > { type: CONNECT, namespace: "/admin", data: { "token": "123" } }
Server > { type: CONNECT, namespace: "/admin", data: { sid: "iLnRaVGHY4B75TeVAAAB" } }
```

- 연결이 거부된 경우

```
Client > { type: CONNECT, namespace: "/" }
Server > { type: CONNECT_ERROR, namespace: "/", data: { message: "Not authorized" } }
```

### 데이터 보내기와 받기 {#sending-and-receiving-data}

[네임스페이스 연결](#connection-to-a-namespace)이 맺어지면 클라이언트와 서버는 데이터를 주고받기 시작할 수 있습니다.

```
CLIENT                                                      SERVER

  │  ───────────────────────────────────────────────────────►  │
  │        { type: EVENT, namespace: "/", data: ["foo"] }      │
  │                                                            │
  │  ◄───────────────────────────────────────────────────────  │
  │        { type: EVENT, namespace: "/", data: ["bar"] }      │
```

페이로드는 필수이며 반드시 비어 있지 않은 배열이어야 합니다. 그렇지 않으면 수신자는 반드시 연결을 닫아야 합니다.

예시:

- 메인 네임스페이스

```
Client > { type: EVENT, namespace: "/", data: ["foo"] }
```

- 커스텀 네임스페이스

```
Server > { type: EVENT, namespace: "/admin", data: ["bar"] }
```

- 바이너리 데이터가 있는 경우

```
Client > { type: BINARY_EVENT, namespace: "/", data: ["baz", <Buffer <01 02 03 04>> ] }
```

### 확인 응답 {#acknowledgement}

송신자는 수신자에게 확인 응답을 요청하려고 이벤트 ID를 포함할 수 있습니다(MAY).

```
CLIENT                                                      SERVER

  │  ───────────────────────────────────────────────────────►  │
  │   { type: EVENT, namespace: "/", data: ["foo"], id: 12 }   │
  │  ◄───────────────────────────────────────────────────────  │
  │    { type: ACK, namespace: "/", data: ["bar"], id: 12 }    │
```

수신자는 반드시 같은 이벤트 ID를 담은 `ACK` 패킷으로 응답해야 합니다.

페이로드는 필수이며 반드시 배열이어야 합니다(빈 배열도 됩니다).

예시:

- 메인 네임스페이스

```
Client > { type: EVENT, namespace: "/", data: ["foo"], id: 12 }
Server > { type: ACK, namespace: "/", data: [], id: 12 }
```

- 커스텀 네임스페이스

```
Server > { type: EVENT, namespace: "/admin", data: ["foo"], id: 13 }
Client > { type: ACK, namespace: "/admin", data: ["bar"], id: 13 }
```

- 바이너리 데이터가 있는 경우

```
Client > { type: BINARY_EVENT, namespace: "/", data: ["foo", <buffer <01 02 03 04> ], id: 14 }
Server > { type: ACK, namespace: "/", data: ["bar"], id: 14 }

or

Server > { type: EVENT, namespace: "/", data: ["foo" ], id: 15 }
Client > { type: BINARY_ACK, namespace: "/", data: ["bar", <buffer <01 02 03 04>], id: 15 }
```

### 네임스페이스 연결 해제 {#disconnection-from-a-namespace}

어느 쪽이든 언제든지 `DISCONNECT` 패킷을 보내 네임스페이스 연결을 끝낼 수 있습니다.

```
CLIENT                                                      SERVER

  │  ───────────────────────────────────────────────────────►  │
  │           { type: DISCONNECT, namespace: "/" }             │
```

상대편의 응답은 필요하지 않습니다. 클라이언트가 다른 네임스페이스에 연결되어 있으면 저수준 연결은 유지될 수 있습니다(MAY).


## 패킷 인코딩 {#packet-encoding}

이 절에서는 Socket.IO 서버와 클라이언트에 포함된 기본 파서의 인코딩 방식을 자세히 설명합니다. 이 파서의 소스는
[socket.io-parser 저장소](https://github.com/socketio/socket.io-parser)에 있습니다.

JavaScript 서버와 클라이언트 구현은 커스텀 파서도 지원합니다. 커스텀 파서는 저마다 장단점이 다르며 특정 종류의
애플리케이션에 유용할 수 있습니다. 예시로 [socket.io-json-parser](https://github.com/socketio/socket.io-json-parser)
또는 [socket.io-msgpack-parser](https://github.com/socketio/socket.io-msgpack-parser)를 참고하세요.

참고로 각 Socket.IO 패킷은 Engine.IO `message` 패킷으로 전송됩니다(자세한 내용은 [Engine.IO 프로토콜](https://github.com/socketio/engine.io-protocol) 참고).
그래서 인코딩 결과를 HTTP 롱 폴링의 요청/응답 본문이나 WebSocket
프레임에 담아 네트워크로 보낼 때는 앞에 문자 `"4"`가 붙습니다.

### 형식 {#format}

```
<packet type>[<# of binary attachments>-][<namespace>,][<acknowledgment id>][JSON-stringified payload without binary]

+ binary attachments extracted
```

참고 사항:

- 네임스페이스는 메인 네임스페이스(`/`)와 다를 때만 포함됩니다
- 내장 파서는 네임스페이스를 쉼표로 구분하고 이스케이프 시퀀스가 없으므로, 이 파서로 인코딩하는 네임스페이스에는 쉼표가 들어가서는 안 됩니다. 커스텀 파서는 다른 규칙을 정의할 수 있습니다(MAY).

### 예시 {#examples}

#### 네임스페이스 연결 {#connection-to-a-namespace-1}

- 메인 네임스페이스

*패킷*

```
{ type: CONNECT, namespace: "/" }
```

*인코딩 결과*

```
0
```

- 커스텀 네임스페이스

*패킷*

```
{ type: CONNECT, namespace: "/admin", data: { sid: "oSO0OpakMV_3jnilAAAA" } }
```

*인코딩 결과*

```
0/admin,{"sid":"oSO0OpakMV_3jnilAAAA"}
```

- 연결이 거부된 경우

*패킷*

```
{ type: CONNECT_ERROR, namespace: "/", data: { message: "Not authorized" } }
```

*인코딩 결과*

```
4{"message":"Not authorized"}
```

#### 데이터 보내기와 받기 {#sending-and-receiving-data-1}

- 메인 네임스페이스

*패킷*

```
{ type: EVENT, namespace: "/", data: ["foo"] }
```

*인코딩 결과*

```
2["foo"]
```

- 커스텀 네임스페이스

*패킷*

```
{ type: EVENT, namespace: "/admin", data: ["bar"] }
```

*인코딩 결과*

```
2/admin,["bar"]
```

- 바이너리 데이터가 있는 경우

*패킷*

```
{ type: BINARY_EVENT, namespace: "/", data: ["baz", <Buffer <01 02 03 04>> ] }
```

*인코딩 결과*

```
51-["baz",{"_placeholder":true,"num":0}]

+ <Buffer <01 02 03 04>>
```

- 첨부 데이터가 여러 개인 경우

*패킷*

```
{ type: BINARY_EVENT, namespace: "/admin", data: ["baz", <Buffer <01 02>>, <Buffer <03 04>> ] }
```

*인코딩 결과*

```
52-/admin,["baz",{"_placeholder":true,"num":0},{"_placeholder":true,"num":1}]

+ <Buffer <01 02>>
+ <Buffer <03 04>>
```

각 Socket.IO 패킷은 Engine.IO `message` 패킷으로 감싸지므로 네트워크로 전송될 때 앞에 문자 `"4"`가 붙는다는 점을 기억하세요.

예시: `{ type: EVENT, namespace: "/", data: ["foo"] }`는 `42["foo"]`로 전송됩니다.

#### 확인 응답 {#acknowledgement-1}

- 메인 네임스페이스

*패킷*

```
{ type: EVENT, namespace: "/", data: ["foo"], id: 12 }
```

*인코딩 결과*

```
212["foo"]
```

- 커스텀 네임스페이스

*패킷*

```
{ type: ACK, namespace: "/admin", data: ["bar"], id: 13 }
```

*인코딩 결과*

```
3/admin,13["bar"]`
```

- 바이너리 데이터가 있는 경우

*패킷*

```
{ type: BINARY_ACK, namespace: "/", data: ["bar", <Buffer <01 02 03 04>>], id: 15 }
```

*인코딩 결과*

```
61-15["bar",{"_placeholder":true,"num":0}]

+ <Buffer <01 02 03 04>>
```

#### 네임스페이스 연결 해제 {#disconnection-from-a-namespace-1}

- 메인 네임스페이스

*패킷*

```
{ type: DISCONNECT, namespace: "/" }
```

*인코딩 결과*

```
1
```

- 커스텀 네임스페이스

```
{ type: DISCONNECT, namespace: "/admin" }
```

*인코딩 결과*

```
1/admin,
```


## 세션 예시 {#sample-session}

다음은 Engine.IO 프로토콜과 Socket.IO 프로토콜을 함께 사용할 때 네트워크로 전송되는 내용의 예시입니다.

- 1번 요청(open 패킷)

```
GET /socket.io/?EIO=4&transport=polling&t=N8hyd6w
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
0{"sid":"lv_VI97HAXpY6yYWAAAC","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":5000,"maxPayload":1000000}
```

세부 내용:

```
0           => Engine.IO "open" packet type
{"sid":...  => the Engine.IO handshake data
```

참고: `t` 쿼리 매개변수는 브라우저가 요청을 캐시하지 않도록 하는 데 사용합니다.

- 2번 요청(네임스페이스 연결 요청):

```
POST /socket.io/?EIO=4&transport=polling&t=N8hyd7H&sid=lv_VI97HAXpY6yYWAAAC
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
40
```

세부 내용:

```
4           => Engine.IO "message" packet type
0           => Socket.IO "CONNECT" packet type
```

- 3번 요청(네임스페이스 연결 승인)

```
GET /socket.io/?EIO=4&transport=polling&t=N8hyd7H&sid=lv_VI97HAXpY6yYWAAAC
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
40{"sid":"wZX3oN0bSVIhsaknAAAI"}
```

- 4번 요청

서버에서 `socket.emit('hey', 'Jude')`를 실행합니다.

```
GET /socket.io/?EIO=4&transport=polling&t=N8hyd7H&sid=lv_VI97HAXpY6yYWAAAC
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
42["hey","Jude"]
```

세부 내용:

```
4           => Engine.IO "message" packet type
2           => Socket.IO "EVENT" packet type
[...]       => content
```

- 5번 요청(클라이언트가 보내는 메시지)

클라이언트에서 `socket.emit('hello'); socket.emit('world');`를 실행합니다.

```
POST /socket.io/?EIO=4&transport=polling&t=N8hzxke&sid=lv_VI97HAXpY6yYWAAAC
> Content-Type: text/plain; charset=UTF-8
42["hello"]\x1e42["world"]
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
ok
```

세부 내용:

```
4           => Engine.IO "message" packet type
2           => Socket.IO "EVENT" packet type
["hello"]   => the 1st content
\x1e        => separator
4           => Engine.IO "message" packet type
2           => Socket.IO "EVENT" packet type
["world"]   => the 2nd content
```

- 6번 요청(WebSocket 업그레이드)

```
GET /socket.io/?EIO=4&transport=websocket&sid=lv_VI97HAXpY6yYWAAAC
< HTTP/1.1 101 Switching Protocols
```

WebSocket 프레임:

```
< 2probe                                        => Engine.IO probe request
> 3probe                                        => Engine.IO probe response
> 5                                             => Engine.IO "upgrade" packet type
> 42["hello"]
> 42["world"]
> 40/admin,                                     => request access to the admin namespace (Socket.IO "CONNECT" packet)
< 40/admin,{"sid":"-G5j-67EZFp-q59rADQM"}       => grant access to the admin namespace
> 42/admin,1["tellme"]                          => Socket.IO "EVENT" packet with acknowledgement
< 461-/admin,1[{"_placeholder":true,"num":0}]   => Socket.IO "BINARY_ACK" packet with a placeholder
< <binary>                                      => the binary attachment (sent in the following frame)
... after a while without message
> 2                                             => Engine.IO "ping" packet type
< 3                                             => Engine.IO "pong" packet type
> 1                                             => Engine.IO "close" packet type
```

## 변경 내역 {#history}

### v5와 v4의 차이 {#difference-between-v5-and-v4}

Socket.IO 프로토콜의 5번째 리비전(현재)은 Socket.IO v3 이상에서 사용됩니다(`v3.0.0`은 2020년 11월에 출시되었습니다).

이 리비전은 [Engine.IO 프로토콜](https://github.com/socketio/engine.io-protocol)의 4번째 리비전 위에 만들어졌습니다. 그래서 `EIO=4` 쿼리 매개변수를 사용합니다.

변경 사항:

- 기본 네임스페이스에 암묵적으로 연결되던 동작 제거

이전 버전에서는 클라이언트가 다른 네임스페이스에 접근을 요청하더라도 항상 기본 네임스페이스에 연결되었습니다.

이제는 그렇지 않으며, 클라이언트는 어떤 경우에도 `CONNECT` 패킷을 보내야 합니다.

커밋: [09b6f23](https://github.com/socketio/socket.io/commit/09b6f2333950b8afc8c1400b504b01ad757876bd) (서버), [249e0be](https://github.com/socketio/socket.io-client/commit/249e0bef9071e7afd785485961c4eef0094254e8) (클라이언트)


- `ERROR`를 `CONNECT_ERROR`로 이름 변경

의미와 코드 번호(4)는 바뀌지 않았습니다. 이 패킷 타입은 여전히 네임스페이스 연결이 거부되었을 때 서버가 사용합니다. 다만 새 이름이 의미를 더 잘 드러낸다고 판단했습니다.

커밋: [d16c035](https://github.com/socketio/socket.io/commit/d16c035d258b8deb138f71801cb5aeedcdb3f002) (서버), [13e1db7c](https://github.com/socketio/socket.io-client/commit/13e1db7c94291c583d843beaa9e06ee041ae4f26) (클라이언트).


- 이제 `CONNECT` 패킷에 페이로드를 담을 수 있음

클라이언트는 인증/인가 목적으로 페이로드를 보낼 수 있습니다. 예시:

```json
{
  "type": 0,
  "nsp": "/admin",
  "data": {
    "token": "123"
  }
}
```

성공하면 서버는 Socket의 ID를 담은 페이로드로 응답합니다. 예시:

```json
{
  "type": 0,
  "nsp": "/admin",
  "data": {
    "sid": "CjdVH4TQvovi1VvgAC5Z"
  }
}
```

이 변경으로 이제 Socket.IO 연결의 ID는 기반이 되는 Engine.IO 연결의 ID(HTTP 요청의 쿼리 매개변수에 있는 ID)와 달라집니다.

커밋: [2875d2c](https://github.com/socketio/socket.io/commit/2875d2cfdfa463e64cb520099749f543bbc4eb15) (서버), [bbe94ad](https://github.com/socketio/socket.io-client/commit/bbe94adb822a306c6272e977d394e3e203cae25d) (클라이언트)


- `CONNECT_ERROR` 패킷의 페이로드가 이제 일반 문자열이 아닌 객체임

커밋: [54bf4a4](https://github.com/socketio/socket.io/commit/54bf4a44e9e896dfb64764ee7bd4e8823eb7dc7b) (서버), [0939395](https://github.com/socketio/socket.io-client/commit/09393952e3397a0c71f239ea983f8ec1623b7c21) (클라이언트)


### v4와 v3의 차이 {#difference-between-v4-and-v3}

Socket.IO 프로토콜의 4번째 리비전은 Socket.IO v1(`v1.0.3`은 2014년 6월에 출시)과 v2(`v2.0.0`은 2017년 5월에 출시)에서 사용됩니다.

이 리비전의 자세한 내용은 다음에서 볼 수 있습니다: https://github.com/socketio/socket.io-protocol/tree/v4

이 리비전은 [Engine.IO 프로토콜](https://github.com/socketio/engine.io-protocol)의 3번째 리비전 위에 만들어졌습니다. 그래서 `EIO=3` 쿼리 매개변수를 사용합니다.

변경 사항:

- `BINARY_ACK` 패킷 타입 추가

이전에는 `ACK` 패킷에 바이너리 객체가 들어 있을 수 있다고 항상 가정하고 그런 객체를 재귀적으로
탐색했기 때문에 성능이 떨어질 수 있었습니다.

참고: https://github.com/socketio/socket.io-parser/commit/ca4f42a922ba7078e840b1bc09fe3ad618acc065

### v3과 v2의 차이 {#difference-between-v3-and-v2}

Socket.IO 프로토콜의 3번째 리비전은 2014년 5월에 출시된 초기 Socket.IO v1 버전(`socket.io@1.0.0...1.0.2`)에서 사용됩니다.

이 리비전의 자세한 내용은 다음에서 볼 수 있습니다: https://github.com/socketio/socket.io-protocol/tree/v3

변경 사항:

- 바이너리 객체가 포함된 패킷을 인코딩할 때 msgpack을 더 이상 사용하지 않음([299849b](https://github.com/socketio/socket.io-parser/commit/299849b00294c3bc95817572441f3aca8ffb1f65)도 참고)

### v2와 v1의 차이 {#difference-between-v2-and-v1}

변경 사항:

- `BINARY_EVENT` 패킷 타입 추가

바이너리 객체를 지원하려고 Socket.IO 1.0 작업 중에 추가되었습니다. `BINARY_EVENT`
패킷은 [msgpack](https://msgpack.org/)으로 인코딩되었습니다.

### 초기 리비전 {#initial-revision}

이 첫 리비전은 Engine.IO 프로토콜(WebSocket / HTTP 롱 폴링, 하트비트 같은 저수준 처리)과 Socket.IO 프로토콜이
분리되면서 나온 결과물입니다. Socket.IO 릴리스에 포함된 적은 없지만
이후 리비전의 토대가 되었습니다.

## 테스트 스위트 {#test-suite}

[`test-suite/`](https://github.com/socketio/socket.io-protocol/tree/main/test-suite) 디렉터리에 있는 테스트 스위트로 서버 구현이 프로토콜을 준수하는지 확인할 수 있습니다.

사용법:

- Node.js에서: `npm ci && npm test`
- 브라우저에서: 브라우저로 `index.html` 파일을 열기만 하면 됩니다

참고로 모든 테스트를 통과하는 데 필요한 JavaScript 서버 설정은 다음과 같습니다.

```js
import { Server } from "socket.io";

const io = new Server(3000, {
  pingInterval: 300,
  pingTimeout: 200,
  maxPayload: 1000000,
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  socket.emit("auth", socket.handshake.auth);

  socket.on("message", (...args) => {
    socket.emit.apply(socket, ["message-back", ...args]);
  });

  socket.on("message-with-ack", (...args) => {
    const ack = args.pop();
    ack(...args);
  })
});

io.of("/custom").on("connection", (socket) => {
  socket.emit("auth", socket.handshake.auth);
});
```
