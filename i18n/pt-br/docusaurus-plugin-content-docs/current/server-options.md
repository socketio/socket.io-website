---
title: Options côté serveur
sidebar_label: Options
sidebar_position: 2
slug: /server-options/
---

## Options du serveur Socket.IO {#socketio-server-options}

### `path` {#path}

Valeur par défaut : `/socket.io/`

Il s'agit du chemin qui est capturé côté serveur.

:::caution

Les valeurs côté serveur et côté client doivent correspondre (sauf si vous utilisez un proxy effectuant une réécriture de chemin entre les deux).

:::

*Server*

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/my-custom-path/"
});
```

*Client*

```js
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  path: "/my-custom-path/"
});
```

### `serveClient` {#serveclient}

Valeur par défaut : `true`

Détermine si les fichiers client sont servis. Le cas échéant, les fichiers client seront servis à l'emplacement suivant :

- `<url>/socket.io/socket.io.js`
- `<url>/socket.io/socket.io.min.js`
- `<url>/socket.io/socket.io.msgpack.min.js`

Ainsi que les cartographies de code source (source maps) associées.

Plus d'informations [ici](categories/03-Client/client-installation.md#standalone-build).

### `adapter` {#adapter}

Valeur par défaut : `require("socket.io-adapter")` (*adapter* basé en mémoire, dont le code source se trouve [ici](https://github.com/socketio/socket.io-adapter/))

L'[*adapter*](categories/08-Miscellaneous/glossary.md#adapter) à utiliser.

Exemple avec l'[*adapter* Redis](categories/05-Adapters/adapter-redis.md):

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

### `parser` {#parser}

Valeur par défaut : `require("socket.io-parser")`

Le *parser* utilisé pour sérialiser/désérialiser les messages. Veuillez consulter la documentation [ici](categories/06-Advanced/custom-parser.md).

### `connectTimeout` {#connecttimeout}

Valeur par défaut : `45000`

Le nombre de millisecondes avant de déconnecter un client qui n'a pas réussi à rejoindre un *namespace*.

## Options du serveur Engine.IO sous-jacent {#low-level-engine-options}

### `pingTimeout` {#pingtimeout}

Valeur par défaut : `20000`

Cette valeur est utilisée dans le mécanisme de ping/pong, qui vérifie périodiquement si la connexion est toujours active entre le serveur et le client.

Le serveur envoie un ping, et si le client ne répond pas par un pong dans les `pingTimeout` millisecondes, le serveur considère que la connexion est fermée.

De même, si le client ne reçoit pas de ping du serveur dans les `pingInterval + pingTimeout` millisecondes, il considère également que la connexion est fermée.

Dans les deux cas, la raison de la déconnexion sera : `ping timeout`

```js
socket.on("disconnect", (reason) => {
  console.log(reason); // "ping timeout"
});
```

Remarque : la valeur par défaut peut être un peu faible si vous devez envoyer de gros fichiers dans votre application. Veuillez l'augmenter si c'est le cas :

```js
const io = new Server(httpServer, {
  pingTimeout: 30000
});
```

### `pingInterval` {#pinginterval}

Valeur par défaut : `25000`

Voir [ci-dessus](#pingtimeout).

### `upgradeTimeout` {#upgradetimeout}

Valeur par défaut : `10000`

Il s'agit du délai en millisecondes avant l'annulation d'une mise à niveau de transport inachevée.

### `maxHttpBufferSize` {#maxhttpbuffersize}

Valeur par défaut : `1e6` (1 MB)

Définit le nombre d'octets qu'un seul message peut contenir, avant de fermer la connexion. Vous pouvez augmenter ou diminuer cette valeur selon vos besoins :

```js
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e8
});
```

Cela correspond à l'option [maxPayload](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback) du module `ws`.

### `allowRequest` {#allowrequest}

Default: `-`

Une fonction qui reçoit une poignée de main ou une demande de mise à niveau comme premier paramètre, et peut décider de continuer ou non.

Exemple :

```js
const io = new Server(httpServer, {
  allowRequest: (req, callback) => {
    const isOriginValid = check(req);
    callback(null, isOriginValid);
  }
});
```

### `transports` {#transports}

Valeur par défaut : `["polling", "websocket"]`

Les transports de bas niveau autorisés côté serveur.

Voir aussi : [`transports`](client-options.md#transports) côté client

### `allowUpgrades` {#allowupgrades}

Valeur par défaut : `true`

Indique s'il faut autoriser les mises à niveau de transport (de HTTP long-polling vers WebSocket par exemple).

### `perMessageDeflate` {#permessagedeflate}

<details className="changelog">
    <summary>History</summary>

| Version | Changes |
| ------- | ------- |
| v3.0.0 | L'extension "permessage-deflate" est maintenant désactivée par défaut. |
| v1.4.0 | Première implémentation. |

</details>

Valeur par défaut : `false`

Indique s'il faut activer [l'extension "permessage-deflate"](https://tools.ietf.org/html/draft-ietf-hybi-permessage-compression-19) pour le transport WebSocket. Cette extension est connue pour ajouter une surcharge importante en termes de performances et de consommation de mémoire, nous suggérons donc de ne l'activer que si elle est vraiment nécessaire.

Veuillez noter que si `perMessageDeflate` est désactivé (la valeur par défaut), le drapeau de compression utilisé lors de l'émission (`socket.compress(true).emit(...)`) sera ignoré lorsque la connexion est établie avec WebSockets, car l'extension "permessage-deflate" ne peut pas être activée pour un message spécifique.

Toutes les options du module [`ws`](https://github.com/websockets/ws/blob/master/README.md#websocket-compression) sont supportées :

```js
const io = new Server(httpServer, {
  perMessageDeflate: {
    threshold: 2048, // 1024 par défaut

    zlibDeflateOptions: {
      chunkSize: 8 * 1024, // 16 * 1024 par défaut
    },

    zlibInflateOptions: {
      windowBits: 14, // 15 par défaut
      memLevel: 7, // 8 par défaut
    },

    clientNoContextTakeover: true, // valeur négociée lors de l'initialisation de la connexion client-serveur
    serverNoContextTakeover: true, // valeur négociée lors de l'initialisation de la connexion client-serveur
    serverMaxWindowBits: 10, // valeur négociée lors de l'initialisation de la connexion client-serveur

    concurrencyLimit: 20, // 10 par défaut
  }
});
```

### `httpCompression` {#httpcompression}

*Ajouté en v1.4.0*

Valeur par défaut : `true`

Indique s'il faut activer la compression pour le transport HTTP long-polling.

Veuillez noter que si la compression est désactivée, le drapeau de compression utilisé lors de l'émission (`socket.compress(true).emit(...)`) sera ignoré lorsque la connexion est établie avec le transport HTTP long-polling.

L'ensemble des options du module Node.js [`zlib`](https://nodejs.org/api/zlib.html#zlib_class_options) est supporté.

Exemple :

```js
const io = new Server(httpServer, {
  httpCompression: {
    // options du serveur Engine.IO
    threshold: 2048, // 1024 par défaut

    // option du module Node.js zlib
    chunkSize: 8 * 1024, // 16 * 1024 par défaut
    windowBits: 14, // 15 par défaut
    memLevel: 7, // 8 par défaut
  }
});
```

### `wsEngine` {#wsengine}

Valeur par défaut : `require("ws").Server` (le code source se trouve [ici](https://github.com/websockets/ws))

L'implémentation du serveur WebSocket à utiliser. Veuillez consulter la documentation [ici](categories/02-Server/server-installation.md#other-websocket-server-implementations).

Exemple :

```js
const io = new Server(httpServer, {
  wsEngine: require("eiows").Server
});
```

### `cors` {#cors}

Valeur par défaut : `-`

La liste des options qui sera transmise au module [`cors`](https://www.npmjs.com/package/cors). Plus d'informations [ici](categories/02-Server/handling-cors.md).

Exemple :

```js
const io = new Server(httpServer, {
  cors: {
    origin: ["https://example.com", "https://dev.example.com"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
```

### `cookie` {#cookie}

Valeur par défaut : `-`

La liste des options qui sera transmise au module [`cookie`](https://github.com/jshttp/cookie/). Options disponibles :

- `domain`
- `encode`
- `expires`
- `httpOnly`
- `maxAge`
- `path`
- `sameSite`
- `secure`

Exemple :

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

Depuis Socket.IO v3, il n'y a plus de cookie envoyé par défaut ([référence](categories/07-Migrations/migrating-from-2-to-3.md#no-more-cookie-by-default)).

:::

### `allowEIO3` {#alloweio3}

Valeur par défaut : `false`

Indique s'il faut activer la compatibilité avec les clients Socket.IO v2.

Voir aussi : [Migration de 2.x vers 3.0](categories/07-Migrations/migrating-from-2-to-3.md#how-to-upgrade-an-existing-production-deployment)

Exemple :

```js
const io = new Server(httpServer, {
  allowEIO3: true // false par défaut
});
```
