---
title: 使用多个节点
sidebar_position: 7
slug: /using-multiple-nodes/
---

部署多个 Socket.IO 服务器时，需要注意两件事：

- 如果启用了 HTTP 长轮询（这是默认设置），则启用粘性会话：见[下文](#enabling-sticky-session)
- 使用兼容的适配器，请参见[此处](../05-Adapters/adapter.md)

## 粘性负载平衡 {#sticky-load-balancing}

如果您计划在不同的进程或机器之间分配连接负载，则必须确保与特定会话 ID 关联的所有请求都到达发起它们的进程。

### 为什么需要粘性会话 {#why-is-sticky-session-required}

这是因为 HTTP 长轮询传输在 Socket.IO 会话的生命周期内发送多个 HTTP 请求。

事实上，Socket.IO 在技术上可以在没有粘性会话的情况下工作，具有以下同步（虚线）：

![Using multiple nodes without sticky sessions](/images/mutiple-nodes-no-sticky.png)

虽然显然可以实现，但我们认为 Socket.IO 服务器之间的这种同步过程会对您的应用程序造成很大的性能影响。

评论：

- 如果不启用粘性会话，由于“会话 ID 未知”，您将遇到 HTTP 400 错误
- WebSocket 传输没有这个限制，因为它依赖于整个会话的单个 TCP 连接。这意味着如果您禁用 HTTP 长轮询传输（这在 2021 年是一个完全有效的选择），您将不需要粘性会话：

```js
const socket = io("https://io.yourhost.com", {
  // WARNING: in that case, there is no fallback to long-polling
  transports: [ "websocket" ] // or [ "websocket", "polling" ] (the order matters)
});
```

文档：[`transports`](../../client-options.md#transports)

### 启用粘性会话 {#enabling-sticky-session}

要实现粘性会话，主要有两种解决方案：

- 基于 cookie 路由客户端（推荐解决方案）
- 根据客户端的原始地址路由客户端

您将在下面找到一些常见负载平衡解决方案的示例：

- [NginX](#nginx-configuration) (基于IP)
- [Apache HTTPD](#apache-httpd-configuration) (基于cookie)
- [HAProxy](#haproxy-configuration) (基于cookie)
- [Traefik](#traefik) (基于cookie)
- [Node.js `cluster` module](#using-nodejs-cluster)

其他平台请参考相关文档：

- Kubernetes: https://kubernetes.github.io/ingress-nginx/examples/affinity/cookie/
- AWS (Application Load Balancers): https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html
- GCP: https://cloud.google.com/load-balancing/docs/backend-service#session_affinity
- Heroku: https://devcenter.heroku.com/articles/session-affinity

**重要提示**：如果您处于 CORS 情况（前端域与服务器域不同）并且会话亲和性是通过 cookie 实现的，则需要允许凭据：

*服务器*

```js
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "https://front-domain.com",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

*客户端*

```js
const io = require("socket.io-client");
const socket = io("https://server-domain.com", {
  withCredentials: true
});
```

没有它，浏览器将不会发送 cookie，您将遇到 HTTP 400“会话 ID 未知”响应。更多信息[在这里](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).

### NginX 配置 {#nginx-configuration}

在文件的`http { }`部分中`nginx.conf`，您可以声明一个`upstream`包含要平衡负载的 Socket.IO 进程列表的部分：

```nginx
http {
  server {
    listen 3000;
    server_name io.yourhost.com;

    location / {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://nodes;

      # enable WebSockets
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }

  upstream nodes {
    # enable sticky session with either "hash" (uses the complete IP address)
    hash $remote_addr consistent;
    # or "ip_hash" (uses the first three octets of the client IPv4 address, or the entire IPv6 address)
    # ip_hash;
    # or "sticky" (needs commercial subscription)
    # sticky cookie srv_id expires=1h domain=.example.com path=/;

    server app01:3000;
    server app02:3000;
    server app03:3000;
  }
}
```

请注意`hash`指示连接将是粘性的说明。

确保您还在`worker_processes`最顶层配置以指示 NginX 应该使用多少工作人员。您可能还想研究调整块`worker_connections`内的设置`events { }`。

链接：

- [例子](https://github.com/socketio/socket.io/tree/main/examples/cluster-nginx)
- [NginX 文档](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#hash)

### Apache HTTPD 配置 {#apache-httpd-configuration}

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

ProxyTimeout 3
```

链接：

- [例子](https://github.com/socketio/socket.io/tree/main/examples/cluster-httpd)
- [文档](https://httpd.apache.org/docs/2.4/en/mod/mod_proxy.html#proxypass)

### HAProxy 配置 {#haproxy-configuration}

```
# Reference: http://blog.haproxy.com/2012/11/07/websockets-load-balancing-with-haproxy/

listen chat
  bind *:80
  default_backend nodes

backend nodes
  option httpchk HEAD /health
  http-check expect status 200
  cookie io prefix indirect nocache # using the `io` cookie set upon handshake
  server app01 app01:3000 check cookie app01
  server app02 app02:3000 check cookie app02
  server app03 app03:3000 check cookie app03
```

链接：

- [例子](https://github.com/socketio/socket.io/tree/main/examples/cluster-haproxy)
- [文档](http://cbonte.github.io/haproxy-dconv/2.4/configuration.html#cookie)

### Traefik {#traefik}

使用容器标签：

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

使用[文件提供程序](https://doc.traefik.io/traefik/v2.0/providers/file/)：

```yaml
## Dynamic configuration
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

链接：

- [例子](https://github.com/socketio/socket.io/tree/main/examples/cluster-traefik)
- [文档](https://doc.traefik.io/traefik/v2.0/routing/services/#sticky-sessions)

### 使用 Node.js 集群 {#using-nodejs-cluster}

就像 NginX 一样，Node.js 通过`cluster`模块提供了内置的集群支持。

有几种解决方案，具体取决于您的用例：

| NPM 包 | 这个怎么运作 |
|:------:| ------------ |
| [`@socket.io/sticky`](https://github.com/darrachequesne/socket.io-sticky) | 路由基于`sid`查询参数 |
| [`sticky-session`](https://github.com/indutny/sticky-session) | 路由是基于`connection.remoteAddress` |
| [`socketio-sticky-session`](https://github.com/wzrdtales/socket-io-sticky-session) | 基于`x-forwarded-for`报头的路由） |

示例`@socket.io/sticky`:

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

  // setup sticky sessions
  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  // setup connections between the workers
  setupPrimary();

  // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
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

  // use the cluster adapter
  io.adapter(createAdapter());

  // setup connection with the primary process
  setupWorker(io);

  io.on("connection", (socket) => {
    /* ... */
  });
}
```

## 在节点之间传递事件 {#passing-events-between-nodes}

既然您有多个接受连接的Socket.IO 节点，如果您想向所有客户端（或某个[房间](../04-Events/rooms.md)中的客户端）广播事件，您将需要某种方式在进程或计算机之间传递消息。

负责路由消息的接口就是我们所说的[Adapter](../05-Adapters/adapter.md)。

