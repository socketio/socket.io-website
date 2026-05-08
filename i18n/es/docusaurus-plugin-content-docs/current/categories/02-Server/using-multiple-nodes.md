---
title: Usando múltiples nodos
sidebar_position: 7
slug: /using-multiple-nodes/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Al desplegar múltiples servidores Socket.IO, hay dos cosas que tener en cuenta:

- habilitar sesiones sticky, si HTTP long-polling está habilitado (que es el predeterminado): ver [abajo](#habilitando-sesiones-sticky)
- usar un adaptador compatible, ver [aquí](../05-Adapters/adapter.md)

## Balanceo de carga sticky

Si planeas distribuir la carga de conexiones entre diferentes procesos o máquinas, tienes que asegurarte de que todas las solicitudes asociadas con un ID de sesión particular lleguen al proceso que las originó.

### Por qué se requiere sesión sticky

Esto es porque el transporte HTTP long-polling envía múltiples solicitudes HTTP durante la vida útil de la sesión Socket.IO.

De hecho, Socket.IO podría técnicamente funcionar sin sesiones sticky, con la siguiente sincronización (en líneas punteadas):

<ThemedImage
  alt="Usando múltiples nodos sin sesiones sticky"
  sources={{
    light: useBaseUrl('/images/mutiple-nodes-no-sticky.png'),
    dark: useBaseUrl('/images/multiple-nodes-no-sticky-dark.png'),
  }}
/>

Aunque obviamente es posible de implementar, creemos que este proceso de sincronización entre los servidores Socket.IO resultaría en un gran impacto en el rendimiento de tu aplicación.

Notas:

- sin habilitar sesión sticky, experimentarás errores HTTP 400 debido a "Session ID unknown"
- el transporte WebSocket no tiene esta limitación, ya que depende de una única conexión TCP para toda la sesión. Lo que significa que si deshabilitas el transporte HTTP long-polling (que es una elección perfectamente válida en 2021), no necesitarás sesiones sticky:

```js
const socket = io("https://io.yourhost.com", {
  // ADVERTENCIA: en ese caso, no hay fallback a long-polling
  transports: [ "websocket" ] // o [ "websocket", "polling" ] (el orden importa)
});
```

Documentación: [`transports`](../../client-options.md#transports)

### Habilitando sesiones sticky

Para lograr sesión sticky, hay dos soluciones principales:

- enrutar clientes basándose en una cookie (solución recomendada)
- enrutar clientes basándose en su dirección de origen

Encontrarás a continuación algunos ejemplos con soluciones comunes de balanceo de carga:

- [nginx](#configuración-de-nginx) (basado en IP)
- [nginx Ingress (Kubernetes)](#nginx-ingress-kubernetes) (basado en IP)
- [Apache HTTPD](#configuración-de-apache-httpd) (basado en cookie)
- [HAProxy](#configuración-de-haproxy) (basado en cookie)
- [Traefik](#traefik) (basado en cookie)
- [Módulo `cluster` de Node.js](#usando-cluster-de-nodejs)

Para otras plataformas, por favor consulta la documentación relevante:

- Kubernetes: https://kubernetes.github.io/ingress-nginx/examples/affinity/cookie/
- AWS (Application Load Balancers): https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html
- GCP: https://cloud.google.com/load-balancing/docs/backend-service#session_affinity
- Heroku: https://devcenter.heroku.com/articles/session-affinity

**Nota importante**: si estás en una situación de CORS (el dominio del frontend es diferente del dominio del servidor) y la afinidad de sesión se logra con una cookie, necesitas permitir credenciales:

*Servidor*

```js
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "https://front-domain.com",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

*Cliente*

```js
const io = require("socket.io-client");
const socket = io("https://server-domain.com", {
  withCredentials: true
});
```

Sin esto, la cookie no será enviada por el navegador y experimentarás respuestas HTTP 400 "Session ID unknown". Más información [aquí](https://developer.mozilla.org/es/docs/Web/API/XMLHttpRequest/withCredentials).

### Configuración de nginx

Dentro de la sección `http { }` de tu archivo `nginx.conf`, puedes declarar una sección `upstream` con una lista de procesos Socket.IO entre los cuales quieres balancear la carga:

```nginx
http {
  server {
    listen 3000;
    server_name io.yourhost.com;

    location / {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://nodes;

      # habilitar WebSockets
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }

  upstream nodes {
    # habilitar sesión sticky con "hash" (usa la dirección IP completa)
    hash $remote_addr consistent;
    # o "ip_hash" (usa los primeros tres octetos de la dirección IPv4 del cliente, o la dirección IPv6 completa)
    # ip_hash;
    # o "sticky" (necesita suscripción comercial)
    # sticky cookie srv_id expires=1h domain=.example.com path=/;

    server app01:3000;
    server app02:3000;
    server app03:3000;
  }
}
```

Nota la instrucción `hash` que indica que las conexiones serán sticky.

Asegúrate de también configurar `worker_processes` en el nivel más alto para indicar cuántos workers debe usar nginx. También podrías querer ajustar la configuración `worker_connections` dentro del bloque `events { }`.

Enlaces:

- [Ejemplo](https://github.com/socketio/socket.io/tree/main/examples/cluster-nginx)
- [Documentación de nginx](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#hash)

:::caution

El valor de [`proxy_read_timeout`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout) de nginx (60 segundos por defecto) debe ser mayor que [`pingInterval + pingTimeout`](../../server-options.md#pinginterval) de Socket.IO (45 segundos por defecto), de lo contrario nginx cerrará forzosamente la conexión si no se envían datos después del retraso dado y el cliente obtendrá un error "transport close".

:::

### nginx Ingress (Kubernetes)

Dentro de la sección `annotations` de tu configuración de Ingress, puedes declarar un hash upstream basado en la dirección IP del cliente, para que el controlador Ingress siempre asigne las solicitudes de una dirección IP dada al mismo pod:

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

Notas:

- `nginx.ingress.kubernetes.io/upstream-hash-by: "$client_ip"`

Esta anotación instruye al controlador NGINX Ingress a usar la dirección IP del cliente para enrutar el tráfico entrante a un Pod específico en tu clúster de Kubernetes. Esto es crucial para mantener sesiones sticky.

- `nginx.ingress.kubernetes.io/configuration-snippet`

Este fragmento de configuración NGINX personalizado sirve un doble propósito:

1. Si la solicitud pasa a través de proxies inversos o API gateways upstream que añaden un encabezado `X-Forwarded-For`, este fragmento extrae la primera dirección IP de ese encabezado y la usa para actualizar $client_ip.

2. En ausencia de tales proxies o gateways, el fragmento simplemente usa remote_addr, que es la dirección IP del cliente directamente conectado al ingress.

Esto asegura que la IP del cliente correcta se use para la lógica de sesión sticky, habilitada por la anotación `nginx.ingress.kubernetes.io/upstream-hash-by: "$client_ip"`. El fragmento es particularmente importante cuando tu arquitectura incluye componentes de red upstream como proxies inversos o API gateways.

Enlaces:

- [Documentación de Ingress Nginx](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#custom-nginx-upstream-hashing)
- [Encabezado X-Forwarded-For](https://developer.mozilla.org/es/docs/Web/HTTP/Headers/X-Forwarded-For)

### Configuración de Apache HTTPD

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

# debe ser mayor que pingInterval (25s por defecto) + pingTimeout (20s por defecto)
ProxyTimeout 60
```

Enlaces:

- [Ejemplo](https://github.com/socketio/socket.io/tree/main/examples/cluster-httpd)
- [Documentación](https://httpd.apache.org/docs/2.4/en/mod/mod_proxy.html#proxypass)

### Configuración de HAProxy

```
# Referencia: http://blog.haproxy.com/2012/11/07/websockets-load-balancing-with-haproxy/

listen chat
  bind *:80
  default_backend nodes

backend nodes
  option httpchk HEAD /health
  http-check expect status 200
  cookie io prefix indirect nocache # usando la cookie `io` establecida en el handshake
  server app01 app01:3000 check cookie app01
  server app02 app02:3000 check cookie app02
  server app03 app03:3000 check cookie app03
```

Enlaces:

- [Ejemplo](https://github.com/socketio/socket.io/tree/main/examples/cluster-haproxy)
- [Documentación](http://cbonte.github.io/haproxy-dconv/2.4/configuration.html#cookie)

### Traefik

Usando etiquetas de contenedor:

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

Con el [proveedor de archivo](https://doc.traefik.io/traefik/v2.0/providers/file/):

```yaml
## Configuración dinámica
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

Enlaces:

- [Ejemplo](https://github.com/socketio/socket.io/tree/main/examples/cluster-traefik)
- [Documentación](https://doc.traefik.io/traefik/v2.0/routing/services/#sticky-sessions)

### Usando cluster de Node.js

Al igual que nginx, Node.js viene con soporte de clustering incorporado a través del módulo `cluster`.

Hay varias soluciones, dependiendo de tu caso de uso:

| Paquete NPM | Cómo funciona |
|:------:| ------------ |
| [`@socket.io/sticky`](https://github.com/darrachequesne/socket.io-sticky) | el enrutamiento se basa en el parámetro de consulta `sid` |
| [`sticky-session`](https://github.com/indutny/sticky-session) | el enrutamiento se basa en `connection.remoteAddress` |
| [`socketio-sticky-session`](https://github.com/wzrdtales/socket-io-sticky-session) | el enrutamiento basado en el encabezado `x-forwarded-for` |

Ejemplo con `@socket.io/sticky`:

```js
const cluster = require("cluster");
const http = require("http");
const { Server } = require("socket.io");
const numCPUs = require("os").cpus().length;
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");

if (cluster.isMaster) {
  console.log(`Master ${process.pid} está ejecutándose`);

  const httpServer = http.createServer();

  // configurar sesiones sticky
  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  // configurar conexiones entre los workers
  setupPrimary();

  // necesario para paquetes que contienen buffers (puedes ignorarlo si solo envías objetos de texto plano)
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
    console.log(`Worker ${worker.process.pid} murió`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} iniciado`);

  const httpServer = http.createServer();
  const io = new Server(httpServer);

  // usar el adaptador cluster
  io.adapter(createAdapter());

  // configurar conexión con el proceso primario
  setupWorker(io);

  io.on("connection", (socket) => {
    /* ... */
  });
}
```

## Pasar eventos entre nodos

Ahora que tienes múltiples nodos Socket.IO aceptando conexiones, si quieres transmitir eventos a todos los clientes (o a los clientes en una cierta [sala](../04-Events/rooms.md)) necesitarás alguna forma de pasar mensajes entre procesos o computadoras.

La interfaz encargada de enrutar mensajes es lo que llamamos el [Adaptador](../05-Adapters/adapter.md).
