---
title: 리버스 프록시 뒤에서 사용하기
sidebar_position: 6
slug: /reverse-proxy/
---

Socket.IO 서버를 다음과 같은 리버스 프록시 뒤에 배포할 때 필요한 설정을 소개합니다.

- [nginx](#nginx)
- [Apache HTTPD](#apache-httpd)
- [Node.js `http-proxy`](#nodejs-http-proxy)
- [Caddy 2](#caddy-2)
- [Google Cloud Application Load Balancer](#google-cloud-application-load-balancer)

서버를 여러 대 구성할 때는 [여러 노드 사용하기](using-multiple-nodes.md) 문서를 참고하세요.

## nginx {#nginx}

`/etc/nginx/nginx.conf`의 내용:

```nginx
http {
  server {
    listen 80;

    location / {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://localhost:3000;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }
}
```

관련 문서:

- [proxy_pass 문서](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
- [여러 서버 구성에서의 설정](using-multiple-nodes.md#nginx-configuration)

:::caution

nginx의 [`proxy_read_timeout`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout) 값(기본값 60초)은 Socket.IO의 [`pingInterval + pingTimeout`](../../server-options.md#pinginterval) 값(기본값 45초)보다 커야 합니다. 그렇지 않으면 `proxy_read_timeout` 시간 동안 데이터가 오가지 않을 때 nginx가 연결을 강제로 닫고, 클라이언트는 "transport close" 오류를 받습니다.

:::

Socket.IO 요청만 전달하려면(예를 들어 정적 콘텐츠는 nginx가 처리하는 경우) 다음과 같이 설정합니다.

```
http {
  server {
    listen 80;
    root /var/www/html;

    location /socket.io/ {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://localhost:3000;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }
}
```

커스텀 [경로](../../server-options.md#path)를 쓸 때는 다음과 같습니다.

```
http {
  server {
    listen 80;
    root /var/www/html;

    location /my-custom-path/ {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://localhost:3000;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }
}
```

이 경우 서버와 클라이언트도 그에 맞게 설정해야 합니다.

*서버*

```js
import { Server } from "socket.io";

const io = new Server({
  path: "/my-custom-path/"
});
```

*클라이언트*

```js
import { io } from "socket.io-client";

const socket = io({
  path: "/my-custom-path/"
});
```

## Apache HTTPD {#apache-httpd}

`/usr/local/apache2/conf/httpd.conf`의 내용:

```apache
Listen 80

ServerName example.com

LoadModule mpm_event_module             modules/mod_mpm_event.so

LoadModule authn_file_module            modules/mod_authn_file.so
LoadModule authn_core_module            modules/mod_authn_core.so
LoadModule authz_host_module            modules/mod_authz_host.so
LoadModule authz_groupfile_module       modules/mod_authz_groupfile.so
LoadModule authz_user_module            modules/mod_authz_user.so
LoadModule authz_core_module            modules/mod_authz_core.so

LoadModule headers_module               modules/mod_headers.so
LoadModule lbmethod_byrequests_module   modules/mod_lbmethod_byrequests.so
LoadModule proxy_module                 modules/mod_proxy.so
LoadModule proxy_balancer_module        modules/mod_proxy_balancer.so
LoadModule proxy_http_module            modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module        modules/mod_proxy_wstunnel.so
LoadModule rewrite_module               modules/mod_rewrite.so
LoadModule slotmem_shm_module           modules/mod_slotmem_shm.so
LoadModule unixd_module                 modules/mod_unixd.so

User daemon
Group daemon

ProxyPass / http://localhost:3000/
RewriteEngine on
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]

# pingInterval(기본값 25초) + pingTimeout(기본값 20초)보다 커야 합니다
ProxyTimeout 60
```

관련 문서:

- [mod_proxy_wstunnel 문서](https://httpd.apache.org/docs/2.4/en/mod/mod_proxy_wstunnel.html)
- [여러 서버 구성에서의 설정](using-multiple-nodes.md#apache-httpd-configuration)

## Node.js `http-proxy` {#nodejs-http-proxy}

설치: `npm i http-proxy`

```js
const httpProxy = require("http-proxy");

httpProxy
  .createProxyServer({
    target: "http://localhost:3000",
    ws: true,
  })
  .listen(80);
```

[문서](https://github.com/http-party/node-http-proxy#readme)

## Caddy 2 {#caddy-2}

Socket.IO 요청만 전달하려면 [Caddy 2](https://caddyserver.com/v2)의 `Caddyfile`을 다음과 같이 작성합니다.

```
example.com {
    reverse_proxy /socket.io/* localhost:3000
}
```

커스텀 경로를 쓰려면 다음과 같이 작성합니다.

```
example.com {
  rewrite /path /path/
  handle_path /path/* {
    rewrite * /socket.io{path}
    reverse_proxy localhost:3000
  }
}
```

관련 문서

- [해결 방법이 담긴 포럼 글](https://caddy.community/t/i-cant-get-socket-io-proxy-to-work-on-v2/8703/2)
- [Caddyfile 리버스 프록시](https://caddyserver.com/docs/caddyfile/patterns#reverse-proxy)
- [Caddyfile 지시어](https://caddyserver.com/docs/caddyfile/directives)

## Google Cloud Application Load Balancer {#google-cloud-application-load-balancer}

Google Cloud에서 Application Load Balancer를 사용한다면 **백엔드 서비스 타임아웃**(backend service timeout)을 늘려야 할 수 있습니다.

:::info

설정할 수 있는 *백엔드 서비스 타임아웃*은 백엔드가 HTTP 요청을 처리하고 그에 맞는 HTTP 응답을 돌려줄 때까지 로드 밸런서가 기다리는 최대 시간입니다. 서버리스 NEG를 제외하면 백엔드 서비스 타임아웃의 기본값은 30초입니다.

:::

이 타임아웃은 WebSocket 연결에도 적용됩니다.

- **classic Application Load Balancer**에서는 WebSocket 연결이 유휴 상태든 활성 상태든 백엔드 서비스 타임아웃이 지나면 닫힙니다.
- **global external** 및 **regional external Application Load Balancer**에서는 유휴 상태인 WebSocket 연결이 백엔드 서비스 타임아웃이 지나면 닫힙니다.

이 타임아웃을 `pingInterval + pingTimeout`(기본값 45초)보다 큰 값으로 늘리세요.

Google Cloud Console에서 백엔드 서비스의 "Timeout" 필드를 수정하거나 `gcloud` CLI로 설정할 수 있습니다.

```bash
gcloud compute backend-services update <BACKEND_SERVICE_NAME> \
    --global \
    --timeout=60
```

출처: https://docs.cloud.google.com/load-balancing/docs/https/request-distribution#timeout-bes
