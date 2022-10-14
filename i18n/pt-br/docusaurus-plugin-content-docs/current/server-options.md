---
title: Opções do Servidor
sidebar_label: Opções
sidebar_position: 2
slug: /server-options/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Socket.IO Opções de servidor

### `path`

Valor padrão: `/socket.io/`

Esse é o nome do caminho e é aquele que é capturada do lado do servidor.

:::Cuidado

Os valores do Servidor do Cliente devem corresponder (a menos que você esteja usando um proxy de reescrita de caminho entre).

:::

*Servidor*

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/my-custom-path/"
});
```

*Cliente*

```js
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  path: "/my-custom-path/"
});
```

### `serveClient`

Valor padrão: `true`

Seja para servidor e arquivos de cliente. Se `true`, diferentes pacotes irão ser servidos para a seguinte localização:

- `<url>/socket.io/socket.io.js`
- `<url>/socket.io/socket.io.min.js`
- `<url>/socket.io/socket.io.msgpack.min.js`

(incluindo seus mapas de origem assossiados)

Veja tambem [aqui](categories/03-Client/client-installation.md#standalone-build).

### `adapter`

Valor padrão: `require("socket.io-adapter")` (in-memory adapter, cujo código fonte pode ser encontrado [aqui](https://github.com/socketio/socket.io-adapter/))

O ["Adapter"](categories/08-Miscellaneous/glossary.md#adapter) utiliza.

Exemplo com o [Redis adapter](categories/05-Adapters/adapter-redis.md):

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

const io = new Server({
  adapter: createAdapter(pubClient, subClient)
});

io.listen(3000);
```

  </TabItem>
</Tabs>

### `parser`

Valor padrão: `socket.io-parser`

O parser a ser utilizado. Por favor veja a documentação [aqui](categories/06-Advanced/custom-parser.md).

### `connectTimeout`

Valor padrão: `45000`

O numero de milissegundos antes de desconectar um cliente que não ingressou com sucesso em um namespace.

## Opções de motor de baixo nível
### `pingTimeout`

Valor padrão: `20000`

Esse valor é usado em um mecanimos heartbeat, que periodicamente checa se a conexão continua viva entre o servidor e o cliente,

O servidor envia um ping, e se o cliente não responder com um pong dentro de `pingTimeout` milissegundos, o sividor considera que a conexão foi encerrada.

De forma similar, se o cliente nãp receber um ping do servidor dentro de `pingInterval + pingTimeout` milissegundos, o clinete tambem considera que a conexão está encerrada

Em ambos os casos, é desconectador por causa do `ping timeout`

```js
socket.on("disconnect", (reason) => {
  console.log(reason); // "ping timeout"
});
```

Nota: o valor padrão pode ser um pouco baixo se você precisar enviar arquivos grandes em seu aplicativo. Aumente-o se for esse o caso:

```js
const io = new Server(httpServer, {
  pingTimeout: 30000
});
```

### `pingInterval`

Valor padrão: `25000`

Veja [acima](#pingtimeout).

### `upgradeTimeout`

Valor padrão: `10000`

É um delay em milissegundos antes que uma atualização de transporte imcompleta seja cancelada.

### `maxHttpBufferSize`

Valor padrão: `1e6` (1 MB)

Isso define quantos bytes uma mensagem unica pode ir, antes do fechamente do socket. Você pode incrementar ou decrementar esta valor dependendo da sua necessidade.

```js
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e8
});
```

Ele corresponde a opção [maxPayload](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback) do pacote ws.

### `allowRequest`

Padrão: `-`

Uma função que recebe um dado handshake ou se solicitação de atualização como seu primeiro parâmetro, e pode decidir se continua ou não

Example:

```js
const io = new Server(httpServer, {
  allowRequest: (req, callback) => {
    const isOriginValid = check(req);
    callback(null, isOriginValid);
  }
});
```

Isso pode tambem ser usado em conjunto com o evento [`initial_headers`](./server-api.md#event-initial_headers), enviando um cookie para o cliente

```js
import { serialize } from "cookie";

const io = new Server(httpServer, {
  allowRequest: async (req, callback) => {
    const session = await fetchSession(req);
    req.session = session;
    callback(null, true);
  }
});

io.engine.on("initial_headers", (headers, req) => {
  if (req.session) {
    headers["set-cookie"] = serialize("sid", req.session.id, { sameSite: "strict" });
  }
});
```

Veja tambem:

- [Como utilizar com `express-session`](/how-to/use-with-express-session)
- [Como lidar com cookies](/how-to/deal-with-cookies)

### `transports`

Valor padrão: `["polling", "websocket"]`

O transporte de baixo-nível que são permitido do lado do cliente

Veja tambem: Lado do cliente [`transports`](client-options.md#transports)

### `allowUpgrades`

Valor padrão: `true`

Se permiti atualizações de transporte.

### `perMessageDeflate`

<details className="changelog">
    <summary>Historico</summary>

| Version | Changes |
| ------- | ------- |
| v3.0.0 | A extensão permessage-deflate agora está desabilitada por padrão.
| v1.4.0 | Primeira implementação

</details>

Valor padrão: `false`

Quer habilitar o [permessage-deflate extension](https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression-19) para o transporte do Websocket. Este consumo de memoria, nós sugerimos que apenas permita se isso for realmente necessario 

Observe que se `perMessageDeflate` é definido `false`  (que é o padrão), o compress flag usado ao emitir (`socket.compress(true).emit(...)`) será ignorado quando a conexão está esbilizada com WebSockets, pois a extensão permessage-deflate não pode ser habilitada por mensagem.

Todas as opção para o [`ws` module](https://github.com/websockets/ws/blob/master/README.md#websocket-compression) são suportadas:

```js
const io = new Server(httpServer, {
  perMessageDeflate: {
    threshold: 2048, // Padrão é 1024

    zlibDeflateOptions: {
      chunkSize: 8 * 1024, // Padrão é 16 * 1024
    },

    zlibInflateOptions: {
      windowBits: 14, // Padrão é  15
      memLevel: 7, // Padrão é  8
    },

    clientNoContextTakeover: true, // Padrão é valor negociado.
    serverNoContextTakeover: true, // Padrão é  valor negociado.
    serverMaxWindowBits: 10, // Padrão é  valor negociado..

    concurrencyLimit: 20, // Padrão é 20.
  }
});
```

### `httpCompression`

*Adiconada na v1.4.0*

Valor padrão: `true`

Se deve habilitar a compactação para o transporte de HTTP long-polling.

Observe que se `httpCompression` é definido como `false`, a flag de compactação usando quando emitimos (`socket.compress(true).emit(...)`) irá ser ignorada quando a coenxão é estabilizada com requisições HTTP long-polling.

Todas as opções para o Node.js [modulo `zlib`](https://nodejs.org/api/zlib.html#zlib_class_options) são suportadas.

Exemplo:

```js
const io = new Server(httpServer, {
  httpCompression: {
    // Engine.IO options
    threshold: 2048, // Padrão é 1024
    // Node.js zlib options
    chunkSize: 8 * 1024, // Padrão é 16 * 1024
    windowBits: 14, // Padrão é 15
    memLevel: 7, // Padrão é  8
  }
});
```

### `wsEngine`

Valor padrão: `require("ws").Server` (codígo fontr pode ser encontrado [aqui](https://github.com/websockets/ws))

A implamentação do WebSocket server para uso. Por favor veja a documentação [aqui](categories/02-Server/server-installation.md#other-websocket-server-implementations).

Exemplo:

```js
const io = new Server(httpServer, {
  wsEngine: require("eiows").Server
});
```

### `cors`

Valor padrão: `-`

A lista de opções 
The list of options que será encaminhado ao modulo[`cors`](https://www.npmjs.com/package/cors). Mais ifformações você pode encontrar [aqui](categories/02-Server/handling-cors.md).

Exemplo:

```js
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com", "https://dev.example.com"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
```

Opções disponiveis:

| Opções                 | Descrições                                                                                                                                                                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `origin`               | Configura o **Access-Control-Allow-Origin** CORS header.                                                                                                                                                                                                                                                        |
| `methods`              | Configura o **Access-Control-Allow-Methods** CORS header. Espera uma string delimitada por vírgula (ex: 'GET,PUT,POST') ou um array (ex: `['GET', 'PUT', 'POST']`).                                                                                                                                                     |
| `allowedHeaders`       | Configura o **Access-Control-Allow-Headers** CORS header. Espera uma string delimitada por vírgula (ex: 'Content-Type,Authorization') ou um array (ex: `['Content-Type', 'Authorization']`). Se não especificado, seu padrão irá refletir os headers especificados nos header do **Access-Control-Request-Headers** requesitado. |
| `exposedHeaders`       | Configura o **Access-Control-Expose-Headers** CORS header.  Espera uma string delimitada por vírgula (ex: 'Content-Range,X-Content-Range') ou um array (ex: `['Content-Range', 'X-Content-Range']`). Se não especificado, nenhum cabeçalho personalizado é exposto.
| `credentials`          | Configura o **Access-Control-Allow-Credentials** CORS header. Define se `true` para passar o cabeçalho, caso contrário é omitido.                                                  |
| `maxAge`               | Configura o **Access-Control-Max-Age** CORS header. Define um integer para passar o cabeçalho, caso contrário é omitido.                                                                                                  |
| `preflightContinue`    | Passa o CORS resposta de comprovação para o próximo manipulador.                                                                                                                                                                                                   |
| `optionsSuccessStatus` | Fornece um código de status a ser usado para requisições `OPTIONS`, já que alguns navegadores legados (IE11, várias SmartTVs) engasgam `204`.                                                                                                                                                                               |

Possiveis valores para a opção `origin`:

- `Boolean` - Define `origin` para `true` para refletir no [request origin](http://tools.ietf.org/html/draft-abarth-origin-09), e é definido por `req.header('Origin')`, ou define isso `false` para desabilitar CORS.
- `String` - Define `origin` para uma origem especifica. Por exemplo se você define isso para `"http://example.com"` apenas requisições para "http://example.com" serão permitidas.
- `RegExp` - Define `origin` para uma expressão regular padrão que irá ser usada para testar a requisição de origem. Se isso é uma correspondência, a origem da solicitação será refletida. Por exemplo, o padrão `/example\.com$/` refletirá qualquer solicitação proveniente de uma origem que termine com "example.com"
- `Array` - Define `origin` para um array para origens validas. Cada origem pode ser uma `String` ou um  `RegExp`. Por exemplo `["http://example1.com", /\.example2\.com$/]` será aceito qualquer requisição para "http://example1.com" ou padra um subdominio do  "example2.com".
- `Function` - Define `origin` para uma função implementando alguma logiva customizada. A Função pega a origim da requisição como o primeiro parâmetro e o callback (que espera uma assinatura `err [object], allow [bool]`) como o segundo.

### `cookie`

Valor padrão: `-`

A lista de opções que será encaminhado para o modulo do [`cookie`](https://github.com/jshttp/cookie/). Opções disponíveis:

- domain
- encode
- expires
- httpOnly
- maxAge
- path
- sameSite
- secure

Exemplo:

```js
import { Server } from "socket.io";

const io = new Server(httpServer, {
  cookie: {
    name: "my-cookie",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400
  }
});
```

:::info

Desde Socket.IO v3, não a mais cookies enviados por padrão ([reference](categories/07-Migrations/migrating-from-2-to-3.md#no-more-cookie-by-default)).

:::

### `allowEIO3`

Valor padrão: `false`

Se a compatibilidade for permitido com Socket.IO v2 client

Veja sobre: [Migrating from 2.x to 3.0](categories/07-Migrations/migrating-from-2-to-3.md#how-to-upgrade-an-existing-production-deployment)

Exemplo:

```js
const io = new Server(httpServer, {
  allowEIO3: true // false é o padrão
});
```
