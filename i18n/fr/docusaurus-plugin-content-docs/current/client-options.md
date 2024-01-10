---
title: Options côté client
sidebar_label: Options
sidebar_position: 2
slug: /client-options/
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Options d'initialisation {#io-factory-options}

### `forceNew` {#forcenew}

Valeur par défaut : `false`

Indique s'il faut créer une nouvelle instance de *Manager*.

Un *Manager* est en charge de la connexion de bas niveau vers le serveur (établie avec le transport HTTP long-polling ou WebSocket). Il gère notamment la logique de reconnexion.

Un *Socket* est l'interface utilisée pour envoyer des événements au serveur et en recevoir. Il appartient à un [*Namespace*](categories/06-Advanced/namespaces.md) donné.

Un même *Manager* peut être rattaché à plusieurs *Sockets*.

Dans l'exemple suivant, un même *Manager* est utilisé pour les 3 *Sockets* (une seule connexion WebSocket) :

```js
const socket = io("https://example.com"); // le namespace principal
const productSocket = io("https://example.com/product"); // le namespace "product"
const orderSocket = io("https://example.com/order"); // le namespace "order"
```

Dans l'exemple suivant, 3 *Managers* différents sont créés (et donc 3 connexions WebSocket distinctes) :

```js
const socket = io("https://example.com"); // le namespace principal
const productSocket = io("https://example.com/product", { forceNew: true }); // le namespace "product"
const orderSocket = io("https://example.com/order", { forceNew: true }); // le namespace "order"
```

La réutilisation d'un *Namespace* existant créera également un nouveau *Manager* à chaque fois :

```js
const socket1 = io(); // création d'un 1er manager
const socket2 = io(); // création d'un 2ème manager
const socket3 = io("/admin"); // réutilisation du 1er manager
const socket4 = io("/admin"); // création d'un 3ème manager
```

### `multiplex` {#multiplex}

Valeur par défaut : `true`

L'opposé de `forceNew` : indique s'il faut réutiliser un *Manager* existant.

```js
const socket = io(); // création d'un 1er manager
const adminSocket = io("/admin", { multiplex: false }); // création d'un 2ème manager
```

## Options du client Engine.IO sous-jacent {#low-level-engine-options}

:::info

Ces paramètres seront communs à tous les *Sockets* rattachés à un même *Manager*.

:::

### `transports` {#transports}

Valeur par défaut : `["polling", "websocket"]`

La connexion de bas niveau au serveur Socket.IO peut être établie soit avec :

- HTTP long-polling : requêtes HTTP successives (`POST` pour l'écriture, `GET` pour la lecture)
- [WebSocket](https://fr.wikipedia.org/wiki/WebSocket)

Dans l'exemple suivant, le transport HTTP long-polling est désactivé :

```js
const socket = io("https://example.com", { transports: ["websocket"] });
```

Note : dans ce cas, les sessions persistantes (« sticky sessions ») ne sont pas nécessaires côté serveur (plus d'informations [ici](categories/02-Server/using-multiple-nodes.md)).

Par défaut, une connexion HTTP long-polling est établie en premier, puis une mise à niveau vers WebSocket est tentée (ce mécanisme est expliqué [ici](categories/01-Documentation/how-it-works.md#upgrade-mechanism)). Vous pouvez forcer l'utilisation du transport WebSocket en premier avec :

```js
const socket = io("https://example.com", {
  transports: ["websocket", "polling"] // utilisation du transport WebSocket en premier, si possible
});

socket.on("connect_error", () => {
  // retour au fonctionnement classique en cas d'erreur
  socket.io.opts.transports = ["polling", "websocket"];
});
```

:::caution

Dans ce cas, la validité de votre [configuration CORS](categories/02-Server/handling-cors.md) ne sera vérifiée que dans les rares cas où la connexion WebSocket ne parvient pas à être établie.

:::

### `upgrade` {#upgrade}

Valeur par défaut : `true`

Indique si le client doit tenter de mettre à niveau le transport utilisé pour la connexion vers le serveur (HTTP long-polling vers WebSocket par exemple).

### `rememberUpgrade` {#rememberupgrade}

Valeur par défaut : `false`

Si cette option est activée et si la connexion WebSocket précédente a réussi, alors la tentative de reconnexion contournera le processus de mise à niveau normal et essaiera d'établir une connexion WebSocket directement. Une tentative de connexion suite à une erreur de transport utilisera le processus de mise à niveau normal.

Il est recommandé d'activer cette option uniquement lorsque vous utilisez des connexions SSL/TLS ou si vous savez que votre réseau ne bloque pas les WebSockets.

### `path` {#path}

Valeur par défaut : `/socket.io/`

Il s'agit du chemin qui est capturé côté serveur.

:::caution

Les valeurs côté serveur et côté client doivent correspondre (sauf si vous utilisez un proxy effectuant une réécriture de chemin entre les deux).

:::

*Client*

```js
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  path: "/my-custom-path/"
});
```

*Serveur*

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/my-custom-path/"
});
```

Veuillez noter que ceci est différent du chemin dans l'URI, qui représente le [*Namespace*](categories/06-Advanced/namespaces.md).

Exemple :

```js
import { io } from "socket.io-client";

const socket = io("https://example.com/order", {
  path: "/my-custom-path/"
});
```

- le *Socket* est rattaché au *Namespace* "order"
- les requêtes HTTP ressembleront à : `GET https://example.com/my-custom-path/?EIO=4&transport=polling&t=ML4jUwU`

### `query` {#query}

Valeur par défaut : -

Paramètres de requête HTTP additionnels (que l'on retrouve ensuite dans l'objet `socket.handshake.query` côté serveur).

Exemple :

*Client*

```js
import { io } from "socket.io-client";

const socket = io({
  query: {
    x: 42
  }
});
```

*Serveur*

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.query); // affiche { x: "42", EIO: "4", transport: "polling" }
});
```

Les paramètres de requête HTTP ne peuvent pas être mis à jour pendant la durée de la session, donc la modification de l'option `query` côté client ne sera effective que lorsque la session en cours sera fermée et qu'une nouvelle sera créée :

```js
socket.io.on("reconnect_attempt", () => {
  socket.io.opts.query.x++;
});
```

:::info

Les paramètres de requête HTTP suivants sont réservés et ne peuvent pas être utilisés dans votre application :

- `EIO`: la version du protocole ("4" actuellement)
- `transport`: le nom du transport ("polling" ou "websocket")
- `sid`: l'ID de session
- `j`: si une réponse JSONP est requise
- `t`: un horodatage haché utilisé pour le contournement du cache (« cache busting »)

:::

### `extraHeaders` {#extraheaders}

Valeur par défaut : -

En-têtes HTTP additionnels (que l'on retrouve ensuite dans l'objet `socket.handshake.headers` côté serveur).

Exemple :

*Client*

```js
import { io } from "socket.io-client";

const socket = io({
  extraHeaders: {
    "my-custom-header": "1234"
  }
});
```

*Serveur*

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.headers); // un objet contenant "my-custom-header": "1234"
});
```

:::caution

Dans un navigateur, l'option `extraHeaders` sera ignorée si vous activez uniquement le transport WebSocket, car l'API WebSocket ne permet pas de fournir des en-têtes HTTP personnalisés dans le navigateur.

```js
import { io } from "socket.io-client";

const socket = io({
  transports: ["websocket"],
  extraHeaders: {
    "my-custom-header": "1234" // ignored
  }
});
```

Par contre, cela fonctionnera pour un client Node.js ou en React-Native.

:::

Documentation : [WebSocket API](https://developer.mozilla.org/fr/docs/Web/API/WebSockets_API)

### `withCredentials` {#withcredentials}

<details className="changelog">
    <summary>Historique</summary>

| Version | Changements                                                     |
|---------|-----------------------------------------------------------------|
| v4.7.0  | Le client Node.js honore maintenant l'option `withCredentials`. |
| v3.0.0  | `withCredentials` vaut maintenant `false` par défaut.           |
| v1.0.0  | Implémentation initiale.                                        |

</details>

Valeur par défaut : `false`

Si les demandes intersites doivent ou non être effectuées à l'aide d'informations d'identification telles que des cookies, des en-têtes d'autorisation ou des certificats client TLS.

L'option `withCredentials` n'a aucun effet sur les requêtes effectuées sur un même site.

```js
import { io } from "socket.io-client";

const socket = io("https://my-backend.com", {
  withCredentials: true
});
```

Le serveur doit envoyer les bons en-têtes `Access-Control-Allow-* ` pour autoriser la connexion :

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://my-frontend.com",
    credentials: true
  }
});
```

:::caution

Vous ne pouvez pas utiliser `origin: *` lorsque vous définissez `withCredentials` sur `true`. Cela déclenchera l'erreur suivante :

> <i>Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ‘.../socket.io/?EIO=4&transport=polling&t=NvQfU77’. (Reason: Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’)</i>

:::

Documentation:

- [XMLHttpRequest.withCredentials](https://developer.mozilla.org/fr/docs/Web/API/XMLHttpRequest/withCredentials)
- [Configuration CORS](categories/02-Server/handling-cors.md)

:::info

À partir de la version `4.7.0`, en passant l'option `withCredentials` à `true`, le client Node.js incluera les cookies dans les requêtes HTTP, afin de faciliter son utilisation avec des *sticky-sessions* basées sur les cookies.

:::

### `forceBase64` {#forcebase64}

Valeur par défaut : `false`

S'il faut forcer l'encodage base64 pour le contenu binaire envoyé via WebSocket (toujours activé pour le transport HTTP long-polling).

### `timestampRequests` {#timestamprequests}

Valeur par défaut : `true`

S'il faut ajouter le paramètre de requête HTTP d'horodatage à chaque requête pour le contournement du cache (« cache busting »).

### `timestampParam` {#timestampparam}

Valeur par défaut : `"t"`

Le nom du paramètre de requête HTTP à utiliser comme clé d'horodatage.

### `closeOnBeforeunload` {#closeonbeforeunload}

*Ajouté en v4.1.0*

Valeur par défaut : `true`

Indique s'il faut (silencieusement) fermer la connexion lorsque l'événement [`beforeunload`](https://developer.mozilla.org/fr/docs/Web/API/Window/beforeunload_event) est émis dans le navigateur.

Avec `closeOnBeforeunload` défini à `false`, un événement `disconnect` sera émis par le *Socket* lorsque l'utilisateur rechargera la page sur Firefox (mais pas sur Chrome ou Safari).

Avec `closeOnBeforeunload` défini à `true`, tous les navigateurs auront le même comportement (pas d'événement `disconnect` lors du rechargement de la page).

:::caution

Si vous utilisez l'événement `beforeunload` dans votre application, pensez à désactiver cette option.

:::

### `protocols` {#protocols}

*Ajouté en v2.0.0*

Valeur par défaut : -

Une valeur qui est une chaîne de caractères représentant un seul protocole ou un tableau de chaînes de caractères représentant une liste de protocoles. Ces chaînes de caractères indiquent des sous-protocoles : un serveur donné pourra implémenter différents sous-protocoles WebSocket (on peut vouloir qu'un serveur soit capable de gérer différents types d'intéraction selon le protocol indiqué).

```js
import { io } from "socket.io-client";

const socket = io({
  transports: ["websocket"],
  protocols: ["my-protocol-v1"]
});
```

*Serveur*

```js
io.on("connection", (socket) => {
  const transport = socket.conn.transport;
  console.log(transport.socket.protocol); // affiche "my-protocol-v1"
});
```

Références :

- https://datatracker.ietf.org/doc/html/rfc6455#section-1.9
- https://developer.mozilla.org/fr/docs/Web/API/WebSocket/WebSocket

### `autoUnref` {#autounref}

*Ajouté en v4.0.0*

Valeur par défaut : `false`

Avec `autoUnref` défini à `true`, le client Socket.IO autorisera le programme à se fermer s'il n'y a pas d'autre timer ou socket TCP actif dans le système d'événements (même si le client est connecté) :

```js
import { io } from "socket.io-client";

const socket = io({
  autoUnref: true
});
```

Voir également : https://nodejs.org/api/timers.html#timeoutunref


### Options spécifiques à Node.js {#nodejs-specific-options}

Les options suivantes sont prises en charge :

- `agent`
- `pfx`
- `key`
- `passphrase`
- `cert`
- `ca`
- `ciphers`
- `rejectUnauthorized`

Veuillez vous référer à la documentation de Node.js :

- [tls.connect(options[, callback])](https://nodejs.org/dist/latest/docs/api/tls.html#tls_tls_connect_options_callback)
- [tls.createSecureContext([options])](https://nodejs.org/dist/latest/docs/api/tls.html#tls_tls_createsecurecontext_options)

Exemple avec un certificat auto-signé :

*Client*

```js
import { readFileSync } from "fs";
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  ca: readFileSync("./cert.pem")
});
```

*Serveur*

```js
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpServer = createServer({
  cert: readFileSync("./cert.pem"),
  key: readFileSync("./key.pem")
});
const io = new Server(httpServer);
```

Exemple avec authentification par certificat client :

*Client*

```js
import { readFileSync } from "fs";
import { io } from "socket.io-client";

const socket = io("https://example.com", {
  ca: readFileSync("./server-cert.pem"),
  cert: readFileSync("./client-cert.pem"),
  key: readFileSync("./client-key.pem"),
});
```

*Serveur*

```js
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

const httpServer = createServer({
  cert: readFileSync("./server-cert.pem"),
  key: readFileSync("./server-key.pem"),
  requestCert: true,
  ca: [
    readFileSync("client-cert.pem")
  ]
});
const io = new Server(httpServer);
```

:::caution

`rejectUnauthorized` is a Node.js-only option, it will not bypass the security check in the browser:

![Security warning in the browser](/images/self-signed-certificate.png)

:::

## Options du *Manager* {#manager-options}

:::info

Ces paramètres seront communs à tous les *Sockets* rattachés à un même *Manager*.

:::

### `reconnection` {#reconnection}

Valeur par défaut : `true`

Si la reconnexion est activée ou non. Si la valeur est `false`, vous devrez vous reconnecter manuellement :

```js
import { io } from "socket.io-client";

const socket = io({
  reconnection: false
});

const tryReconnect = () => {
  setTimeout(() => {
    socket.io.open((err) => {
      if (err) {
        tryReconnect();
      }
    });
  }, 2000);
}

socket.io.on("close", tryReconnect);
```

### `reconnectionAttempts` {#reconnectionattempts}

Valeur par défaut : `Infinity`

Le nombre de tentatives de reconnexion avant abandon.

### `reconnectionDelay` {#reconnectiondelay}

Valeur par défaut : `1000`

Le délai initial en millisecondes avant la reconnexion (affecté par la valeur [randomizationFactor](#randomizationfactor)).

### `reconnectionDelayMax` {#reconnectiondelaymax}

Valeur par défaut : `5000`

Le délai maximal entre deux tentatives de reconnexion. Chaque tentative multiplie le délai de reconnexion par 2.

### `randomizationFactor` {#randomizationfactor}

Valeur par défaut : `0.5`

Le facteur de randomisation utilisé lors de la reconnexion, afin que les clients ne se reconnectent pas exactement au même moment après un redémarrage du serveur par exemple.

Exemple avec les valeurs par défaut :

- la 1ère tentative de reconnexion se produit après 500 à 1500 ms (`1000 * 2^0 * (<un nombre entre -0.5 and 1.5>)`)
- la 2ème tentative de reconnexion se produit après 1000 et 3000 ms (`1000 * 2^1 * (<un nombre entre -0.5 and 1.5>)`)
- la 2ème tentative de reconnexion se produit après 2000 et 5000 ms (`1000 * 2^2 * (<un nombre entre -0.5 and 1.5>)`)
- les tentatives suivantes se produisent après 5000 ms

### `timeout` {#timeout}

Valeur par défaut : `20000`

Délai d'attente en millisecondes pour chaque tentative de connexion.

### `autoConnect` {#autoconnect}

Valeur par défaut : `true`

Indique si le *Manager* se connecte automatiquement lors de la création. Dans le cas contraire, vous devrez vous connecter manuellement :

```js
import { io } from "socket.io-client";

const socket = io({
  autoConnect: false
});

socket.connect();
// or
socket.io.open();
```

### `parser` {#parser}

*Ajouté en v2.2.0*

Valeur par défaut : `require("socket.io-parser")`

Le *parser* utilisé pour sérialiser/désérialiser les messages. Veuillez consulter la documentation [ici](categories/06-Advanced/custom-parser.md) pour plus d'informations.

## Options du *Socket* {#socket-options}

:::info

Ces paramètres seront spécifiques au *Socket*.

:::

### `auth` {#auth}

*Ajouté en v3.0.0*

Valeur par défaut : -

Données envoyées lors de l'accès à un *Namespace* (voir aussi [ici](categories/02-Server/middlewares.md#sending-credentials)).

Exemple :

*Client*

```js
import { io } from "socket.io-client";

const socket = io({
  auth: {
    token: "abcd"
  }
});

// ou avec une fonction
const socket = io({
  auth: (cb) => {
    cb({ token: localStorage.token })
  }
});
```

*Serveur*

```js
io.on("connection", (socket) => {
  console.log(socket.handshake.auth); // affiche { token: "abcd" }
});
```

Vous pouvez mettre à jour l'objet `auth` lorsque l'accès au *Namespace* est refusé :

```js
socket.on("connect_error", (err) => {
  if (err.message === "invalid credentials") {
    socket.auth.token = "efgh";
    socket.connect();
  }
});
```

Ou forcer manuellement le *Socket* à se reconnecter :

```js
socket.auth.token = "efgh";
socket.disconnect().connect();
```
