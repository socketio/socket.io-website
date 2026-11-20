---
title: 여러 노드 사용하기
sidebar_position: 7
slug: /using-multiple-nodes/
toc_max_heading_level: 5
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Socket.IO 서버를 여러 대 배포할 때는 두 가지를 신경 써야 합니다.

- 로드 밸런싱
- 서버 간 메시지 전달

## 로드 밸런싱 {#load-balancing}

연결 부하를 여러 프로세스나 머신에 분산하려면 특정 세션 ID에 속한 모든 요청이 그 세션을 만든 프로세스에 도달하도록 해야 합니다.

이렇게 하는 방법은 여러 가지입니다.

- [스티키 세션](#sticky-sessions)
- [HTTP 롱 폴링 비활성화](#disabling-http-long-polling)
- [클라이언트 측 로드 밸런싱](#client-side-load-balancing)

:::info

사실 아래 점선처럼 서버 간에 세션 상태를 동기화하면 기술적으로는 스티키 세션 없이도 Socket.IO가 동작할 수 있습니다.

<ThemedImage
  alt="스티키 세션 없이 여러 노드 사용하기"
  sources={{
    light: useBaseUrl('/images/mutiple-nodes-no-sticky.png'),
    dark: useBaseUrl('/images/multiple-nodes-no-sticky-dark.png'),
  }}
/>

구현할 수는 있지만 Socket.IO 팀은 이런 서버 간 동기화 과정이 애플리케이션 성능을 크게 떨어뜨린다고 봅니다.

:::

### 스티키 세션 {#sticky-sessions}

세션 어피니티(session affinity)라고도 하는 스티키 세션(sticky session)은 특정 클라이언트가 보내는 모든 HTTP 요청을
세션이 유지되는 동안 항상 같은 서버 인스턴스로 라우팅하는 로드 밸런싱 기법입니다.

Socket.IO에서 스티키 세션은 다음과 같이 동작합니다.

1. 클라이언트가 처음 연결하면 로드 밸런서가 그 클라이언트를 특정 Socket.IO 서버에 할당합니다
2. 이후 그 클라이언트가 보내는 모든 요청(HTTP 롱 폴링 요청 포함)은 같은 서버로 라우팅됩니다
3. 덕분에 서버는 클라이언트의 세션 상태를 유지하고 양방향 통신을 제대로 처리할 수 있습니다

로드 밸런서는 보통 다음 중 한 가지 방법을 씁니다.

- 클라이언트가 연결할 서버를 식별하는 쿠키 사용
- 클라이언트의 IP 주소를 기준으로 항상 같은 서버로 라우팅
- URL이나 헤더에 담긴 세션 식별자 사용

아래는 널리 쓰이는 로드 밸런싱 솔루션별 예시입니다.

- [nginx](#nginx-configuration) (IP 기반)
- [nginx Ingress (Kubernetes)](#nginx-ingress-kubernetes) (IP 기반)
- [Apache HTTPD](#apache-httpd-configuration) (쿠키 기반)
- [HAProxy](#haproxy-configuration) (쿠키 기반)
- [Traefik](#traefik) (쿠키 기반)
- [Node.js `cluster` 모듈](#using-nodejs-cluster)

다른 플랫폼은 아래 문서를 참고하세요.

- Kubernetes: https://kubernetes.github.io/ingress-nginx/examples/affinity/cookie/
- AWS (Application Load Balancers): https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html
- GCP: https://cloud.google.com/load-balancing/docs/backend-service#session_affinity
- Heroku: https://devcenter.heroku.com/articles/session-affinity

#### nginx 설정 {#nginx-configuration}

`nginx.conf` 파일의 `http { }` 섹션 안에 부하를 분산할 Socket.IO 프로세스 목록을 담은 `upstream` 섹션을 선언할 수 있습니다.

```nginx
http {
  server {
    listen 3000;
    server_name io.yourhost.com;

    location / {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://nodes;

      # WebSocket 활성화
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }

  upstream nodes {
    # "hash"(전체 IP 주소 사용)로 스티키 세션 활성화
    hash $remote_addr consistent;
    # 또는 "ip_hash"(클라이언트 IPv4 주소의 앞 세 옥텟 또는 IPv6 주소 전체 사용)
    # ip_hash;
    # 또는 "sticky"(상용 구독 필요)
    # sticky cookie srv_id expires=1h domain=.example.com path=/;

    server app01:3000;
    server app02:3000;
    server app03:3000;
  }
}
```

`hash` 지시어가 연결을 고정(sticky)한다는 점을 눈여겨보세요.

최상위 레벨에 `worker_processes`도 설정해서 nginx가 사용할 워커 수를 지정하세요. `events { }` 블록 안의 `worker_connections` 설정도 함께 조정해 볼 만합니다.

링크:

- [예시](https://github.com/socketio/socket.io/tree/main/examples/cluster-nginx)
- [nginx 문서](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#hash)

:::caution

nginx의 [`proxy_read_timeout`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout) 값(기본값 60초)은 Socket.IO의 [`pingInterval + pingTimeout`](../../server-options.md#pinginterval) 값(기본값 45초)보다 커야 합니다. 그렇지 않으면 `proxy_read_timeout` 시간 동안 데이터가 오가지 않을 때 nginx가 연결을 강제로 닫고, 클라이언트는 "transport close" 오류를 받습니다.

:::

#### nginx Ingress (Kubernetes) {#nginx-ingress-kubernetes}

Ingress 설정의 `annotations` 섹션에 클라이언트 IP 주소 기반의 업스트림 해싱을 선언할 수 있습니다. 그러면 Ingress 컨트롤러가 같은 IP 주소에서 온 요청을 항상 같은 Pod에 할당합니다.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: your-ingress
  namespace: your-namespace
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      set $forwarded_client_ip "";
      if ($http_x_forwarded_for ~ "^([^,]+)") {
        set $forwarded_client_ip $1;
      }
      set $client_ip $remote_addr;
      if ($forwarded_client_ip != "") {
        set $client_ip $forwarded_client_ip;
      }
    nginx.ingress.kubernetes.io/upstream-hash-by: "$client_ip"
spec:
  ingressClassName: nginx
  rules:
    - host: io.yourhost.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: your-service
                port:
                  number: 80
```

참고:

- `nginx.ingress.kubernetes.io/upstream-hash-by: "$client_ip"`

이 어노테이션은 NGINX Ingress Controller가 들어오는 트래픽을 클라이언트 IP 주소 기준으로 Kubernetes 클러스터의 특정 Pod로 라우팅하도록 합니다. 스티키 세션을 유지하는 데 꼭 필요합니다.

- `nginx.ingress.kubernetes.io/configuration-snippet`

이 커스텀 NGINX 설정 스니펫은 두 가지 역할을 합니다.

1. 요청이 업스트림 리버스 프록시나 API 게이트웨이를 거치면서 `X-Forwarded-For` 헤더가 붙었다면 이 헤더에서 첫 번째 IP 주소를 추출해 $client_ip를 갱신합니다.

2. 그런 프록시나 게이트웨이가 없으면 Ingress에 직접 연결된 클라이언트의 IP 주소인 remote_addr를 그대로 사용합니다.

덕분에 `nginx.ingress.kubernetes.io/upstream-hash-by: "$client_ip"` 어노테이션으로 활성화한 스티키 세션 로직에 올바른 클라이언트 IP가 쓰입니다. 리버스 프록시나 API 게이트웨이 같은 업스트림 네트워크 구성 요소가 있는 아키텍처라면 이 스니펫이 특히 중요합니다.

링크:

- [Ingress Nginx 문서](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#custom-nginx-upstream-hashing)
- [X-Forwarded-For 헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)

#### Apache HTTPD 설정 {#apache-httpd-configuration}

```apache
Header add Set-Cookie "SERVERID=sticky.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED

<Proxy "balancer://nodes_polling">
    BalancerMember "http://app01:3000" route=app01
    BalancerMember "http://app02:3000" route=app02
    BalancerMember "http://app03:3000" route=app03
    ProxySet stickysession=SERVERID
</Proxy>

<Proxy "balancer://nodes_ws">
    BalancerMember "ws://app01:3000" route=app01
    BalancerMember "ws://app02:3000" route=app02
    BalancerMember "ws://app03:3000" route=app03
    ProxySet stickysession=SERVERID
</Proxy>

RewriteEngine On
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule /(.*) balancer://nodes_ws/$1 [P,L]
RewriteCond %{HTTP:Upgrade} !=websocket [NC]
RewriteRule /(.*) balancer://nodes_polling/$1 [P,L]

# pingInterval(기본값 25초) + pingTimeout(기본값 20초)보다 커야 합니다
ProxyTimeout 60
```

링크:

- [예시](https://github.com/socketio/socket.io/tree/main/examples/cluster-httpd)
- [문서](https://httpd.apache.org/docs/2.4/en/mod/mod_proxy.html#proxypass)

#### HAProxy 설정 {#haproxy-configuration}

```
# 참고: http://blog.haproxy.com/2012/11/07/websockets-load-balancing-with-haproxy/

listen chat
  bind *:80
  default_backend nodes

backend nodes
  option httpchk HEAD /health
  http-check expect status 200
  cookie io prefix indirect nocache # 핸드셰이크 때 설정되는 `io` 쿠키 사용
  server app01 app01:3000 check cookie app01
  server app02 app02:3000 check cookie app02
  server app03 app03:3000 check cookie app03
```

링크:

- [예시](https://github.com/socketio/socket.io/tree/main/examples/cluster-haproxy)
- [문서](http://cbonte.github.io/haproxy-dconv/2.4/configuration.html#cookie)

#### Traefik {#traefik}

컨테이너 라벨 사용:

```yaml
# docker-compose.yml
services:
  traefik:
    image: traefik:2.4
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    links:
      - server

  server:
    image: my-image:latest
    labels:
      - "traefik.http.routers.my-service.rule=PathPrefix(`/`)"
      - traefik.http.services.my-service.loadBalancer.sticky.cookie.name=server_id
      - traefik.http.services.my-service.loadBalancer.sticky.cookie.httpOnly=true
```

[File provider](https://doc.traefik.io/traefik/v2.0/providers/file/) 사용:

```yaml
## 동적 설정
http:
  services:
    my-service:
      rule: "PathPrefix(`/`)"
      loadBalancer:
        sticky:
          cookie:
            name: server_id
            httpOnly: true
```

링크:

- [예시](https://github.com/socketio/socket.io/tree/main/examples/cluster-traefik)
- [문서](https://doc.traefik.io/traefik/v2.0/routing/services/#sticky-sessions)

#### Node.js 클러스터 사용하기 {#using-nodejs-cluster}

nginx와 마찬가지로 Node.js도 `cluster` 모듈로 클러스터링을 기본 지원합니다.

사용 사례에 따라 여러 솔루션이 있습니다.

| NPM 패키지 | 동작 방식 |
|:------:| ------------ |
| [`@socket.io/sticky`](https://github.com/darrachequesne/socket.io-sticky) | `sid` 쿼리 매개변수를 기준으로 라우팅 |
| [`sticky-session`](https://github.com/indutny/sticky-session) | `connection.remoteAddress`를 기준으로 라우팅 |
| [`socketio-sticky-session`](https://github.com/wzrdtales/socket-io-sticky-session) | `x-forwarded-for` 헤더를 기준으로 라우팅 |

`@socket.io/sticky` 예시:

```js
const cluster = require("cluster");
const http = require("http");
const { Server } = require("socket.io");
const numCPUs = require("os").cpus().length;
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  const httpServer = http.createServer();

  // 스티키 세션 설정
  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  // 워커 간 연결 설정
  setupPrimary();

  // 버퍼가 담긴 패킷에 필요합니다(일반 객체만 보낸다면 무시해도 됩니다)
  // Node.js < 16.0.0
  cluster.setupMaster({
    serialization: "advanced",
  });
  // Node.js > 16.0.0
  // cluster.setupPrimary({
  //   serialization: "advanced",
  // });

  httpServer.listen(3000);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const httpServer = http.createServer();
  const io = new Server(httpServer);

  // 클러스터 어댑터 사용
  io.adapter(createAdapter());

  // 프라이머리 프로세스와 연결 설정
  setupWorker(io);

  io.on("connection", (socket) => {
    /* ... */
  });
}
```

### HTTP 롱 폴링 비활성화 {#disabling-http-long-polling}

Socket.IO 클라이언트가 HTTP 롱 폴링을 쓰지 않도록(WebSocket이나 WebTransport만 쓰도록) 설정하면 스티키
세션이 더 이상 필요하지 않습니다. 이유는 다음과 같습니다.

1. **단일 지속 연결**: 세션 내내 HTTP 요청을 여러 번 보내는 HTTP 롱 폴링과 달리 WebSocket은 클라이언트와
   서버 사이에 오래 유지되는 TCP 연결 하나를 맺습니다.

2. **세션 라우팅 문제 없음**: 모든 통신이 TCP 연결 하나로 이루어지므로 이후 요청이 다른 서버로 라우팅될
   위험이 없습니다. 클라이언트는 세션이 끝날 때까지
   같은 서버와 연결을 유지합니다.

3. **인프라 단순화**: 스티키 세션을 설정할 필요 없이 단순한 라운드 로빈 로드 밸런싱을 쓸 수 있어
   로드 밸런서 설정이 덜 복잡해집니다.

예시(클라이언트):

```js
const socket = io({
  transports: ["websocket"]
  // 또는 WebTransport도 함께 사용(Socket.IO v4.6.0 이상)
  // transports: ["websocket", "webtransport"]
});
```

#### 장점 {#pros}

##### 스티키 세션이 필요 없음 {#no-sticky-sessions-required}

WebSocket이나 WebTransport만 쓰면 클라이언트는 지속 연결 하나만 사용합니다. HTTP 폴링 요청이 반복되지 않으므로 요청이 서로 다른 서버로 라우팅될 위험이 없습니다.

##### 성능 향상 {#better-performance}

WebSocket과 WebTransport는 폴링 주기마다 HTTP 요청과 헤더를 반복해서 보내는 오버헤드가 없습니다.

##### 지연 시간 감소 {#lower-latency}

폴링 요청 주기를 기다리지 않고 지속 연결로 메시지를 바로 보낼 수 있습니다.

#### 단점 {#cons}

##### 호환성 저하 {#reduced-compatibility}

HTTP 롱 폴링은 호환성이 가장 넓은 대체 수단(fallback)입니다. 이를 끄면 제한이 많은 네트워크에 있는 클라이언트는 연결에 실패할 수 있습니다.

### 클라이언트 측 로드 밸런싱 {#client-side-load-balancing}

클라이언트 측 로드 밸런싱은 로드 밸런서에 맡기지 않고 클라이언트 애플리케이션이 직접 연결할 서버를
정하는 방식입니다. 각 클라이언트가 스스로 고른 서버 하나와 지속 연결을 유지하므로
스티키 세션이 필요 없습니다.

이 방식은 다음과 같이 동작합니다.

1. 클라이언트에 사용 가능한 Socket.IO 서버 URL 목록을 제공합니다
2. 클라이언트가 목록에서 서버 하나를 고릅니다(무작위, 라운드 로빈 또는 커스텀 로직)
3. 클라이언트가 고른 서버에 직접 연결합니다
4. 이후 모든 통신은 그 서버와 이루어집니다

예시(클라이언트):

```js
const SERVERS = [
    "https://s1.example.com",
    "https://s2.example.com",
    "https://s3.example.com",
];

function pickServer() {
    return SERVERS[Math.floor(Math.random() * SERVERS.length)];
}

const socket = io(pickServer());

socket.io.on("reconnect_attempt", () => {
    socket.io.uri = pickServer();
});
```

#### 장점 {#pros-1}

##### 스티키 세션이 필요 없음 {#no-sticky-sessions-required-1}

각 클라이언트가 고른 서버 하나에 직접 연결해 그 연결을 계속 사용하므로 프록시나 로드 밸런서 단에서 세션 어피니티를 설정할 필요가 없습니다.

##### 라우팅 로직을 직접 제어 {#direct-control-over-routing-logic}

클라이언트는 무작위로, 또는 지역·지연 시간·우선순위나 커스텀 비즈니스 규칙에 따라 서버를 고를 수 있습니다.

#### 단점 {#cons-1}

##### 서버 토폴로지를 바꾸기 어려움 {#harder-to-update-server-topology}

서버를 추가·제거하거나 서버에서 트래픽을 빼려면(draining) 클라이언트 측 서버 목록을 갱신할 방법이 필요합니다. 보통 설정이나 디스커버리 엔드포인트를 이용합니다.

##### 고르지 않은 부하 분산 {#uneven-load-distribution}

무작위로 고르면 부하가 한쪽으로 쏠릴 수 있습니다. 클라이언트 수가 적거나 클라이언트마다 트래픽 양이 크게 다를 때 특히 그렇습니다.

## 서버 간 메시지 전달 {#forwarding-messages-between-the-servers}

이제 연결을 받는 Socket.IO 서버가 여러 대입니다. 따라서 모든 클라이언트(또는 특정 [룸](../04-Events/rooms.md)에 있는 클라이언트)에게 이벤트를 브로드캐스트하려면 프로세스나 컴퓨터 간에 메시지를 주고받을 방법이 필요합니다.

메시지 라우팅을 담당하는 인터페이스를 [어댑터](../05-Adapters/adapter.md)라고 합니다.

사용할 수 있는 어댑터는 다음과 같습니다.

- [Redis 어댑터](../05-Adapters/adapter-redis.md)
- [Redis Streams 어댑터](../05-Adapters/adapter-redis-streams.md)
- [MongoDB 어댑터](../05-Adapters/adapter-mongo.md)
- [Postgres 어댑터](../05-Adapters/adapter-postgres.md)
- [클러스터 어댑터](../05-Adapters/adapter-cluster.md)
- [Google Cloud Pub/Sub 어댑터](../05-Adapters/adapter-gcp-pubsub.md)
- [AWS SQS 어댑터](../05-Adapters/adapter-aws-sqs.md)
- [Azure Service Bus 어댑터](../05-Adapters/adapter-azure-service-bus.md)
