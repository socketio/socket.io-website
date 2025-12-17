---
title: Detrás de un proxy inverso
sidebar_position: 6
slug: /reverse-proxy/
---

A continuación encontrarás la configuración necesaria para desplegar un servidor Socket.IO detrás de una solución de proxy inverso, como:

- [nginx](#nginx)
- [Apache HTTPD](#apache-httpd)
- [Node.js `http-proxy`](#nodejs-http-proxy)
- [Caddy 2](#caddy-2)

En una configuración de múltiples servidores, por favor revisa la documentación [aquí](using-multiple-nodes.md).

## nginx

Contenido de `/etc/nginx/nginx.conf`:

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

Relacionado:

- [documentación de proxy_pass](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
- [configuración en una configuración de múltiples servidores](using-multiple-nodes.md#nginx-configuration)

:::caution

El valor de [`proxy_read_timeout`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout) de nginx (60 segundos por defecto) debe ser mayor que [`pingInterval + pingTimeout`](../../server-options.md#pinginterval) de Socket.IO (45 segundos por defecto), de lo contrario nginx cerrará forzosamente la conexión si no se envían datos después del retraso dado y el cliente obtendrá un error "transport close".

:::

Si solo quieres reenviar las solicitudes de Socket.IO (por ejemplo cuando nginx maneja el contenido estático):

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

O con una [ruta](../../server-options.md#path) personalizada:

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

En ese caso, el servidor y el cliente deben configurarse en consecuencia:

*Servidor*

```js
import { Server } from "socket.io";

const io = new Server({
  path: "/my-custom-path/"
});
```

*Cliente*

```js
import { io } from "socket.io-client";

const socket = io({
  path: "/my-custom-path/"
});
```

## Apache HTTPD

Contenido de `/usr/local/apache2/conf/httpd.conf`:

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

# debe ser mayor que pingInterval (25s por defecto) + pingTimeout (20s por defecto)
ProxyTimeout 60
```

Relacionado:

- [documentación de mod_proxy_wstunnel](https://httpd.apache.org/docs/2.4/en/mod/mod_proxy_wstunnel.html)
- [configuración en una configuración de múltiples servidores](using-multiple-nodes.md#apache-httpd-configuration)

## Node.js `http-proxy`

Instalación: `npm i http-proxy`

```js
const httpProxy = require("http-proxy");

httpProxy
  .createProxyServer({
    target: "http://localhost:3000",
    ws: true,
  })
  .listen(80);
```

[Documentación](https://github.com/http-party/node-http-proxy#readme)

## Caddy 2

Contenido de `Caddyfile` para [Caddy 2](https://caddyserver.com/v2), si solo quieres reenviar las solicitudes de Socket.IO

```
example.com {
    reverse_proxy /socket.io/* localhost:3000
}
```

O, si quieres una ruta personalizada:

```
example.com {
  rewrite /path /path/
  handle_path /path/* {
    rewrite * /socket.io{path}
    reverse_proxy localhost:3000
  }
}
```

Relacionado

- [Publicación en el foro de la solución](https://caddy.community/t/i-cant-get-socket-io-proxy-to-work-on-v2/8703/2)
- [Caddyfile reverse proxy](https://caddyserver.com/docs/caddyfile/patterns#reverse-proxy)
- [Directivas de Caddyfile](https://caddyserver.com/docs/caddyfile/directives)
