---
title: 反向代理
sidebar_position: 6
slug: /reverse-proxy/
---

您将在下面找到在反向代理解决方案后面部署 Socket.IO 服务器所需的配置，例如：

- [NginX](#nginx)
- [Apache HTTPD](#apache-httpd)
- [Node.js `http-proxy`](#nodejs-http-proxy)

在多服务器设置中，请查看[此处](using-multiple-nodes.md)的文档。

## NginX {#nginx}

`/etc/nginx/nginx.conf`内容：

```nginx
http {
  server {
    listen 80;
    server_name example.com;

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

有关的：

- [proxy_pass 稳定](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
- [多服务器设置中的配置](using-multiple-nodes.md#nginx-configuration)

如果您只想转发 Socket.IO 请求（例如当 NginX 处理静态内容时）：

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

或使用自定义[路径](../../server-options.md#path):

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

在这种情况下，必须相应地配置服务器和客户端：

*服务器*

```js
import { Server } from "socket.io";

const io = new Server({
  path: "/my-custom-path/"
});
```

*客户端*

```js
import { io } from "socket.io-client";

const socket = io({
  path: "/my-custom-path/"
});
```

## Apache HTTPD {#apache-httpd}

`/usr/local/apache2/conf/httpd.conf`内容：

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

ProxyTimeout 3
```

有关的：

- [mod_proxy_wstunnel 文档](https://httpd.apache.org/docs/2.4/en/mod/mod_proxy_wstunnel.html)
- [多服务器设置中的配置](using-multiple-nodes.md#apache-httpd-configuration)

## Node.js `http-proxy` {#nodejs-http-proxy}

安装： `npm i http-proxy`

```js
const httpProxy = require("http-proxy");

httpProxy
  .createProxyServer({
    target: "http://localhost:3000",
    ws: true,
  })
  .listen(80);
```

[Documentation](https://github.com/http-party/node-http-proxy#readme)

## Caddy 2 {#caddy-2}

[Caddy 2](https://caddyserver.com/v2)中`Caddyfile`的内容

```
example.com {
  rewrite /path /path/
  handle /path/* {
    uri strip_prefix /path
    rewrite * /socket.io{path}
    reverse_proxy localhost:3000 {
      header_up Host {host}
      header_up X-Real-IP {remote}
    }
  }
}
```

有关的：

- [解决方案论坛帖子](https://caddy.community/t/i-cant-get-socket-io-proxy-to-work-on-v2/8703/2)
- [Caddyfile 指令](https://caddyserver.com/docs/caddyfile/directives)
