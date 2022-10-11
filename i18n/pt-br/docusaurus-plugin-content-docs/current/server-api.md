---
title: API para Servidpr
sidebar_label: API
sidebar_position: 1
slug: /server-api/
---


 import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## Servidor {#server}

### Em breve

<ThemedImage
  alt="Server dans le diagramme de classe de la partie serveur"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-server.png'),
    dark: useBaseUrl('/images/server-class-diagram-server-dark.png'),
  }}
/>

<!--
Pages de documentation liées :

- [installation du serveur](categories/02-Server/server-installation.md)
- [initialisation du serveur](categories/02-Server/server-initialization.md)
- [détails de l'instance de serveur](categories/02-Server/server-instance.md)

### new Server(httpServer[, options]) {#new-serverhttpserver-options}

- `httpServer` [`<http.Server>`](https://nodejs.org/api/http.html#class-httpserver) | [`<https.Server>`](https://nodejs.org/api/https.html#class-httpsserver)
- `options` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object)

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

La liste complète des options disponibles se trouve [ici](server-options.md).

### new Server(port[, options]) {#new-serverport-options}

- `port` [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#number_type)
- `options` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object)

```js
import { Server } from "socket.io";

const io = new Server(3000, {
  // options
});

io.on("connection", (socket) => {
  // ...
});
```

La liste complète des options disponibles se trouve [ici](server-options.md).

### new Server(options) {#new-serveroptions}

  - `options` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object)

```js
import { Server } from "socket.io";

const io = new Server({
  // options
});

io.on("connection", (socket) => {
  // ...
});

io.listen(3000);
```

La liste complète des options disponibles se trouve [ici](server-options.md).

### server.sockets {#serversockets}

  * [`<Namespace>`](#namespace)

Un alias pour le *Namespace* principal (`/`).

```js
io.sockets.emit("hi", "everyone");
// is equivalent to
io.of("/").emit("hi", "everyone");
```

### server.serveClient([value]) {#serverserveclientvalue}

  - `value` [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)
  - **Retourne** [`<Server>`](#server) | [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)

Si `value` est `true` alors le serveur servira les fichiers client. Cette méthode n'a aucun effet après l'appel de `listen()`.

Si aucun argument n'est fourni, cette méthode renvoie la valeur actuelle.

```js
import { Server } from "socket.io";

const io = new Server();

io.serveClient(false);

io.listen(3000);
```

### server.path([value]) {#serverpathvalue}

  - `value` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - **Retourne** [`<Server>`](#server) | [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)

Définit le chemin `value` sous lequel `engine.io` et les fichiers statiques seront servis. La valeur par défaut est `/socket.io/`.

Si aucun argument n'est fourni, cette méthode renvoie la valeur actuelle.

```js
import { Server } from "socket.io";

const io = new Server();

io.path("/myownpath");
```

:::warning

La valeur `path` doit correspondre à celle côté client :

```js
import { io } from "socket.io-client";

const socket = io({
  path: "/myownpath"
});
```

:::

### server.adapter([value]) {#serveradaptervalue}

  - `value` [`<Adapter>`](categories/05-Adapters/adapter.md)
  - **Retourne** [`<Server>`](#server) | [`<Adapter>`](categories/05-Adapters/adapter.md)

Définit l'*Adapter* qui sera utilisé par le serveur. Par défaut, il s'agira d'une instance d'*Adapter* basée sur la mémoire. Voir [socket.io-adapter](https://github.com/socketio/socket.io-adapter).

Si aucun argument n'est fourni, cette méthode renvoie la valeur actuelle.

```js
import { Server } from "socket.io"; sur la
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const io = new Server();

const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// redis@3
io.listen(3000);

// redis@4
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.listen(3000);
});
```

### server.attach(httpServer[, options]) {#serverattachhttpserver-options}

- `httpServer` [`<http.Server>`](https://nodejs.org/api/http.html#class-httpserver) | [`<https.Server>`](https://nodejs.org/api/https.html#class-httpsserver)
- `options` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object)

Attache le serveur à un serveur HTTP Node.js avec les options fournies.

```js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server();

io.attach(httpServer);

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
```

### server.attach(port[, options]) {#serverattachport-options}

- `port` [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#number_type)
- `options` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object)

Attache le serveur sur le `port` donné avec les `options` fournies.

```js
import { Server } from "socket.io";

const io = new Server();

io.attach(3000);

io.on("connection", (socket) => {
  // ...
});
```

### server.attachApp(app[, options]) {#serverattachappapp-options}

- `app` [`<uws.App>`](https://unetworking.github.io/uWebSockets.js/generated/interfaces/TemplatedApp.html)
- `options` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object)

Associe le serveur Socket.IO à une application [µWebSockets.js](https://github.com/uNetworking/uWebSockets.js) :

```js
import { App } from "uWebSockets.js";
import { Server } from "socket.io";

const app = new App();
const io = new Server();

io.attachApp(app);

io.on("connection", (socket) => {
  // ...
});

app.listen(3000, (token) => {
  if (!token) {
    console.warn("port already in use");
  }
});
```

### server.listen(httpServer[, options]) {#serverlistenhttpserver-options}

Synonyme de [server.attach(httpServer[, options])](#serverattachhttpserver-options).

### server.listen(port[, options]) {#serverlistenport-options}

Synonyme de [server.attach(port[, options])](#serverattachport-options).

### server.on(eventName, listener) {#serveroneventname-listener}

*Héritée de la [classe EventEmitter](https://nodejs.org/api/events.html#class-eventemitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<symbol>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#symbol_type)
- `listener` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **Retourne** [`<Server>`](#server)

Ajoute la fonction `listener` à la fin du tableau des auditeurs pour l'événement nommé `eventName`.

Événements disponibles :

- [`connection`](#event-connection)
- [`new_namespace`](#event-new_namespace)
- tout événement utilisé avec la function [`serverSideEmit()`](#namespaceserversideemiteventname-args)

```js
io.on("connection", (socket) => {
  // ...
});
```

### server.bind(engine) {#serverbindengine}

- `engine` `<engine.Server>`
- **Retourne** [`<Server>`](#server)

Utilisation avancée uniquement. Lie le serveur à une instance Engine.IO (ou API compatible).

```js
import { Server } from "socket.io";
import { Server as Engine } from "engine.io";

const engine = new Engine();
const io = new Server();

io.bind(engine);

engine.listen(3000);
```

### server.onconnection(socket) {#serveronconnectionsocket}

- `socket` `<engine.Socket>`
- **Retourne** [`<Server>`](#server)

Utilisation avancée uniquement. Crée un nouveau client Socket.IO à partir d'une connexion Engine.IO (ou API compatible).

```js
import { Server } from "socket.io";
import { Server as Engine } from "engine.io";

const engine = new Engine();
const io = new Server();

engine.on("connection", (socket) => {
  io.onconnection(socket);
});

engine.listen(3000);
```

### server.of(nsp) {#serverofnsp}

  - `nsp` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<RegExp>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/RegExp) | [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retourne** [`<Namespace>`](#namespace)

Initialise et récupère le [*Namespace*](#namespace) à partir de son identifiant `nsp`. Si le *Namespace* a déjà été initialisé, il est retourné directement.

```js
const adminNamespace = io.of("/admin");
```

Une expression régulière ou une fonction peut également être fournie, afin de créer un *Namespace* de manière dynamique :

```js
const dynamicNsp = io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
  const newNamespace = socket.nsp; // newNamespace.name === "/dynamic-101"

  // émission à tous les clients dans le namespace enfant donné
  newNamespace.emit("hello");
});

// côté client
const socket = io("/dynamic-101");

// émission à tous les clients dans chaque namespace enfant
dynamicNsp.emit("hello");

// utilisation d'un middleware commun à tous les namespaces enfant
dynamicNsp.use((socket, next) => { /* ... */ });
```

Avec une function :

```js
io.of((name, query, next) => {
  // la méthode checkToken doit retourner un booléen indiquant si le client est autorisé à se connecter
  next(null, checkToken(query.token));
}).on("connection", (socket) => { /* ... */ });
```

### server.close([callback]) {#serverclosecallback}

  - `callback` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

Ferme le serveur Socket.IO et déconnecte tous les clients. L'argument `callback` est facultatif et sera invoqué lorsque toutes les connexions seront fermées.

:::info

Cela ferme également le serveur HTTP sous-jacent.

:::

```js
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3030;
const io = new Server(PORT);

io.close();

const httpServer = createServer();

httpServer.listen(PORT); // PORT peut être réutilisé

io.attach(httpServer);
```

:::note

La fermeture du serveur HTTP sous-jacent n'est pas suffisante, car cela empêchera uniquement le serveur d'accepter de nouvelles connexions, mais les clients connectés via WebSocket ne seront pas déconnectés immédiatement.

Référence : https://nodejs.org/api/http.html#serverclosecallback

:::

### server.engine {#serverengine}

Une référence au serveur Engine.IO sous-jacent. Voir [ici](#engine).

### server.socketsJoin(rooms) {#serversocketsjoinrooms}

*Ajoutée en v4.0.0*

Alias de [`io.of("/").socketsJoin(rooms)`](#namespacesocketsjoinrooms).

```js
// toutes les instances de Socket rejoignent la room "room1"
io.socketsJoin("room1");

// toutes les instances de Socket présentes dans la room "room1" rejoignent les rooms "room2" et "room3"
io.in("room1").socketsJoin(["room2", "room3"]);

// cela fonctionne également avec un socket ID
io.in(theSocketId).socketsJoin("room1");
```

Voir [ici](categories/02-Server/server-instance.md#utility-methods).

### server.socketsLeave(rooms) {#serversocketsleaverooms}

*Ajoutée en v4.0.0*

Alias de [`io.of("/").socketsLeave(rooms)`](#namespacesocketsleaverooms).

```js
// toutes les instances de Socket quittent la room "room1"
io.socketsLeave("room1");

// toutes les instances de Socket présentes dans la room "room1" quittent les rooms "room2" et "room3"
io.in("room1").socketsLeave(["room2", "room3"]);

// cela fonctionne également avec un socket ID
io.in(theSocketId).socketsLeave("room1");
```

Voir [ici](categories/02-Server/server-instance.md#utility-methods).

### server.disconnectSockets([close]) {#serverdisconnectsocketsclose}

*Ajoutée en v4.0.0*

Alias de [`io.of("/").disconnectSockets(close)`](#namespacedisconnectsocketsclose).

```js
// toutes les instances de Socket sont déconnectées
io.disconnectSockets();

// toutes les instances de Socket présentes dans la room "room1" sont déconnectées (et la connexion de bas niveau est fermée)
io.in("room1").disconnectSockets(true);
```

Voir [ici](categories/02-Server/server-instance.md#utility-methods).

### server.fetchSockets() {#serverfetchsockets}

*Ajoutée en v4.0.0*

Alias de [`io.of("/").fetchSocket()`](#namespacefetchsockets).

```js
// récupère tous les sockets dans le namespace principal
const sockets = await io.fetchSockets();

// récupère tous les sockets dans la room "room1" du namespace principal
const sockets = await io.in("room1").fetchSockets();
```

Exemple d'utilisation :

```js
io.on("connection", (socket) => {
  const userId = computeUserId(socket);

  socket.join(userId);

  socket.on("disconnect", async () => {
    const sockets = await io.in(userId).fetchSockets();
    if (socket.length === 0) {
      // plus de connexion active pour l'utilisateur donné
    }
  });
});
```

Voir [ici](categories/02-Server/server-instance.md#utility-methods).

### server.serverSideEmit(eventName[, ...args][, ack]) {#serverserversideemiteventname-args-ack}

*Ajoutée en v4.1.0*

Alias de : [`io.of("/").serverSideEmit(/* ... */);`](#namespaceserversideemiteventname-args)

### Événement : `connection` {#event-connection}

  - `socket` _(Socket)_ inst

Émis lors d'une connexion.

```js
io.on("connection", (socket) => {
  // ...
});
```

### Événement : `connect` {#event-connect}

Synonyme de [Événement : "connection"](#event-connection).

### Événement : `new_namespace` {#event-new_namespace}

  - `namespace` [`Namespace`](#namespace)

Émis lorsqu'un nouveau *Namespace* est créé :

```js
io.on("new_namespace", (namespace) => {
  // ...
});
```

Cela peut être utile par exemple :

- pour attacher un middleware commun à tous les *Namespaces*

```js
io.on("new_namespace", (namespace) => {
  namespace.use(myMiddleware);
});
```

- pour suivre les *Namespaces* [créés dynamiquement](categories/06-Advanced/namespaces.md#dynamic-namespaces)

```js
io.of(/\/nsp-\w+/);

io.on("new_namespace", (namespace) => {
  console.log(namespace.name);
});
```

## Namespace {#namespace}

<ThemedImage
  alt="Namespace dans le diagramme de classe de la partie serveur"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-namespace.png'),
    dark: useBaseUrl('/images/server-class-diagram-namespace-dark.png'),
  }}
/>

// TODO
Représente un ensemble de connexions connectés sous une portée donnée identifiée par un nom de chemin (ex : `/chat`).

Represents a pool of sockets connected under a given scope identified by a pathname (eg: `/chat`).

Plus de détails [ici](categories/06-Advanced/namespaces.md).

### namespace.name {#namespacename}

  * [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)

L'identifiant du *Namespace*.

### namespace.sockets {#namespacesockets}

  * [`Map<SocketId, Socket>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Map)

Une [Map](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Map) de *Sockets* qui sont actuellement connectés à ce *Namespace*.

```js
// nombre de sockets dans ce namespace (pour ce serveur)
const socketCount = io.of("/admin").sockets.size;
```

### namespace.adapter {#namespaceadapter}

  * [`<Adapter>`](categories/05-Adapters/adapter.md)

L'[*Adapter*](categories/08-Miscellaneous/glossary.md#adapter) utilisé par le *Namespace*.

**Note :** l'*Adapter* pour le *Namespace* principal est accessible via `io.of("/").adapter`.

Plus d'informations à ce sujet [ici](categories/05-Adapters/adapter.md).

```js
const adapter = io.of("/my-namespace").adapter;
```

### namespace.to(room) {#namespacetoroom}

<details className="changelog">
    <summary>History</summary>

| Version | Changes                                                   |
|---------|-----------------------------------------------------------|
| v4.0.0  | Ajout de la possibilité de fournir un tableau de *Rooms*. |
| v1.0.0  | Implémentation initiale.                                  |

</details>

  - `room` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<string[]>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - **Retourne** `BroadcastOperator` pour l'enchaînement

Définit un modificateur pour une émission d'événement ultérieure selon laquelle l'événement ne sera _diffusé_ qu'aux clients qui ont rejoint la *Room* donnée.

Pour émettre vers plusieurs *Rooms*, vous pouvez appeler `to` plusieurs fois.

```js
const io = require("socket.io")();
const adminNamespace = io.of("/admin");

adminNamespace.to("level1").emit("an event", { some: "data" });

// rooms multiples
io.to("room1").to("room2").emit(/* ... */);

// ou avec un tableau
io.to(["room1", "room2"]).emit(/* ... */);
```

### namespace.in(room) {#namespaceinroom}

*Ajoutée en v1.0.0*

Synonyme de [namespace.to(room)](#namespacetoroom).

### namespace.except(rooms) {#namespaceexceptrooms}

*Ajoutée en v4.0.0*

  - `rooms` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<string[]>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - **Retourne** `BroadcastOperator`

Définit un modificateur pour une émission d'événement ultérieure selon laquelle l'événement ne sera _diffusé_ qu'aux clients qui n'ont pas rejoint les *Rooms* données.

```js
// à tous les clients exceptés ceux dans la room "room1"
io.except("room1").emit(/* ... */);

// à tous les clients présents dans la room "room2" exceptés ceux dans la room "room3"
io.to("room2").except("room3").emit(/* ... */);
```

### namespace.emit(eventName[, ...args]) {#namespaceemiteventname-args}

  - `eventName` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<symbol>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#symbol_type)
  - `args` `any[]`
  - **Retourne** `true`

Émet un événement à tous les clients connectés dans le *Namespace* donné.

```js
io.emit("un événement envoyé à tous les clients connectés"); // namespace principal

const chat = io.of("/chat");
chat.emit("un événement envoyé à tous les clients connectés dans le namespace 'chat'");
```

:::info

Les accusés de réception ne sont actuellement pas pris en charge lors de l'émission à partir d'un *Namespace*.

:::

### namespace.allSockets() {#namespaceallsockets}

  - **Retourne** `Promise<Set<SocketId>>`

Obtient une liste des ID de *Socket* connectés à ce *Namespace* (pour tous les serveurs du cluster, le cas échéant).

```js
// tous les sockets du namespace principal
const ids = await io.allSockets();

// tous les sockets dans la room "user:1234" du namespace principal
const ids = await io.in("user:1234").allSockets();

// tous les sockets du namespace "chat"
const ids = await io.of("/chat").allSockets();

// tous les sockets dans la room "general" du namespace "chat"
const ids = await io.of("/chat").in("general").allSockets();
```

### namespace.use(fn) {#namespaceusefn}

  - `fn` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

Ajoute un middleware, qui sera exécuté pour chaque `Socket` entrant, et reçoit comme paramètres le *Socket* et une fonction pour différer éventuellement l'exécution au prochain middleware enregistré.

Les erreurs transmises aux fonctions rappels (« callback ») du middleware sont envoyées sous forme de paquets spéciaux `connect_error` aux clients.

*Serveur*

```js
io.use((socket, next) => {
  const err = new Error("pas autorisé");
  err.data = { content: "Merci de réessayer plus tard" }; // détails additionnels
  next(err);
});
```

*Client*

```js
socket.on("connect_error", err => {
  console.log(err instanceof Error); // true
  console.log(err.message); // "pas autorisé"
  console.log(err.data); // { content: "Merci de réessayer plus tard" }
});
```

Plus d'informations à ce sujet [ici](categories/02-Server/middlewares.md).

### namespace.socketsJoin(rooms) {#namespacesocketsjoinrooms}

*Ajoutée en v4.0.0*

  - `rooms` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<string[]>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - **Retourne** `void`

Fait en sorte que les instances Socket correspondantes rejoignent les *Rooms* spécifiées :

```js
// tous les sockets rejoignent la room "room1"
io.socketsJoin("room1");

// tous les sockets présents dans la room "room1" rejoignent les rooms "room2" et "room3"
io.in("room1").socketsJoin(["room2", "room3"]);

// tous les sockets présents dans la room "room1" du namespace "admin" rejoignent la room "room2"
io.of("/admin").in("room1").socketsJoin("room2");

// cela fonctionne également avec un seul ID de socket
io.in(theSocketId).socketsJoin("room1");
```

Plus d'informations à ce sujet [ici](categories/02-Server/server-instance.md#utility-methods).

### namespace.socketsLeave(rooms) {#namespacesocketsleaverooms}

*Ajoutée en v4.0.0*

  - `rooms` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<string[]>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - **Retourne** `void`

Fait en sorte que les instances Socket correspondantes quittent les *Rooms* spécifiées :

```js
// tous les sockets quittent la room "room1"
io.socketsLeave("room1");

// tous les sockets présents dans la room "room1" quittent les rooms "room2" et "room3"
io.in("room1").socketsLeave(["room2", "room3"]);

// tous les sockets présents dans la room "room1" du namespace "admin" quittent la room "room2"
io.of("/admin").in("room1").socketsLeave("room2");

// cela fonctionne également avec un seul ID de socket
io.in(theSocketId).socketsLeave("room1");
```

### namespace.disconnectSockets([close]) {#namespacedisconnectsocketsclose}

*Ajoutée en v4.0.0*

  - `close` [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en) s'il faut clore la connexion sous-jacente
  - **Retourne** `void`

Déconnecte les *Sockets* correspondants.

```js
// tous les sockets sont déconnectés
io.disconnectSockets();

// tous les sockets présents dans la room "room1" sont déconnectés (et la connexion bas niveau est close)
io.in("room1").disconnectSockets(true);

// tous les sockets présents dans la room "room1" du namespace "admin" sont déconnectés
io.of("/admin").in("room1").disconnectSockets();

// cela fonctionne également avec un seul ID de socket
io.of("/admin").in(theSocketId).disconnectSockets();
```

### namespace.fetchSockets() {#namespacefetchsockets}

*Ajoutée en v4.0.0*

- **Retourne** [`Socket[]`](#socket) | `RemoteSocket[]`

Récupère les *Sockets* correspondants :

```js
// récupère tous les sockets dans le namespace principal
const sockets = await io.fetchSockets();

// récupère tous les sockets présents dans la room "room1" du namespace principal
const sockets = await io.in("room1").fetchSockets();

// récupère tous les sockets présents dans la room "room1" du namespace "admin"
const sockets = await io.of("/admin").in("room1").fetchSockets();

// cela fonctionne également avec un seul ID de socket
const sockets = await io.in(theSocketId).fetchSockets();
```

La variable `sockets` dans l'exemple ci-dessus est un tableau d'objets exposant un sous-ensemble de la classe Socket habituelle :

```js
for (const socket of sockets) {
  console.log(socket.id);
  console.log(socket.handshake);
  console.log(socket.rooms);
  console.log(socket.data);
  socket.emit(/* ... */);
  socket.join(/* ... */);
  socket.leave(/* ... */);
  socket.disconnect(/* ... */);
}
```

L'attribut `data` est un objet arbitraire qui peut être utilisé pour partager des informations entre les serveurs Socket.IO :

```js
// serveur A
io.on("connection", (socket) => {
  socket.data.username = "alice";
});

// serveyr B
const sockets = await io.fetchSockets();
console.log(sockets[0].data.username); // "alice"
```

:::info::

Cette méthode (ainsi que `socketsJoin`, `socketsLeave` et `disconnectSockets`) est compatible avec l'*Adapter* Redis (à partir de `socket.io-redis@6.1.0`), ce qui signifie qu'ils fonctionneront également pour un cluster de serveurs Socket.IO.

:::

### namespace.serverSideEmit(eventName[, ...args][, ack]) {#namespaceserversideemiteventname-args-ack}

*Ajoutée en v4.1.0*

  - `eventName` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retourne** `true`

Envoie un message aux autres serveurs Socket.IO du [cluster](categories/02-Server/using-multiple-nodes.md).

Syntaxe :

```js
io.serverSideEmit("bonjour", "ô monde");
```

Et côté réception :

```js
io.on("bonjour", (arg1) => {
  console.log(arg1); // affiche "ô monde"
});
```

Les accusés de réception sont également pris en charge :

```js
// serveur A
io.serverSideEmit("ping", (err, responses) => {
  console.log(responses[0]); // affiche "pong"
});

// serveur B
io.on("ping", (cb) => {
  cb("pong");
});
```

Notes :

- les chaînes de caractères `connection`, `connect` et `new_namespace` sont réservées et ne peuvent pas être utilisées dans votre application.

- vous pouvez envoyer n'importe quel nombre d'arguments, mais les structures binaires ne sont actuellement pas prises en charge (le tableau d'arguments sera `JSON.stringify`-é)

Exemple :

```js
io.serverSideEmit("bonjour", "ô monde", 1, "2", { 3: "4" });
```

- la fonction rappel peut être invoquée avec une erreur, si les autres serveurs Socket.IO ne répondent pas après un délai donné

```js
io.serverSideEmit("ping", (err, responses) => {
  if (err) {
    // au moins un serveur Socket.IO n'a pas répondu dans le temps imparti
    // mais le tableau 'responses' contient toutes les réponses déjà reçues
  } else {
    // Succès ! le tableau 'responses' contient un objet pour chaque serveur Socket.IO dans le cluster 
  }
});
```

### Événement : 'connection' {#event-connection-1}

  - `socket` [`<Socket>`](#socket)

Émis lors d'une connexion :

```js
// namespace principal
io.on("connection", (socket) => {
  // ...
});

// namespace spécifique
io.of("/admin").on("connection", (socket) => {
  // ...
});
```

### Événement : 'connect' {#event-connect-1}

Synonyme de [Événement : "connection"](#event-connection-1).

### Drapeau : 'volatile' {#flag-volatile}

Définit un modificateur pour une émission d'événement ultérieure selon lequel l'événement peut être perdu si les clients ne sont pas prêts à recevoir des messages (à cause de la lenteur du réseau ou d'autres problèmes, ou parce qu'ils sont connectés via une longue interrogation et sont au milieu d'un cycle de réponse).

```js
io.volatile.emit("an event", { some: "data" }); // les clients pourront peut-être le recevoir
```

### Drapeau : 'local' {#flag-local}

Définit un modificateur pour une émission d'événement ultérieure selon lequel l'événement ne sera _diffusé_ qu'au nœud actuel (lors de la [mise en place d'un cluster](categories/02-Server/using-multiple-nodes.md)).

```js
io.local.emit("an event", { some: "data" });
```

## Socket {#socket}

<ThemedImage
  alt="Socket dans le diagramme de classe de la partie serveur"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-socket.png'),
    dark: useBaseUrl('/images/server-class-diagram-socket-dark.png'),
  }}
/>

A `Socket` is the fundamental class for interacting with browser clients. A `Socket` belongs to a certain `Namespace` (by default `/`) and uses an underlying `Client` to communicate.

It should be noted the `Socket` doesn't relate directly to the actual underlying TCP/IP `socket` and it is only the name of the class.

Within each `Namespace`, you can also define arbitrary channels (called `room`) that the `Socket` can join and leave. That provides a convenient way to broadcast to a group of `Socket`s (see `Socket#to` below).

The `Socket` class inherits from [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter). The `Socket` class overrides the `emit` method, and does not modify any other `EventEmitter` method. All methods documented here which also appear as `EventEmitter` methods (apart from `emit`) are implemented by `EventEmitter`, and documentation for `EventEmitter` applies.

More information can be found [here](categories/02-Server/server-socket-instance.md).

### socket.id {#socketid}

  * [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)

Un identifiant unique pour la session.

### socket.rooms {#socketrooms}

  * [`Set<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Set)

Un ensemble de chaînes de caractères identifiant les *Rooms* dans lesquelles se trouve ce *Socket*.

```js
io.on("connection", (socket) => {

  console.log(socket.rooms); // Set { <socket.id> }

  socket.join("room1");

  console.log(socket.rooms); // Set { <socket.id>, "room1" }

});
```

### socket.client {#socketclient}

  * [`<Client>`](#client)

Une référence à l'objet *Client* sous-jacent.

### socket.conn {#socketconn}

  * `<engine.Socket>`

Une référence au client de connexion sous-jacent (objet `Socket` côté Engine.IO). Cela permet d'accéder à la couche de transport qui gère la connexion TCP.

```js
io.on("connection", (socket) => {
  console.log("initial transport", socket.conn.transport.name); // affiche "polling"

  socket.conn.once("upgrade", () => {
    // émis lorsque le transport est mis à jour (exemple : de HTTP long-polling vers WebSocket)
    console.log("upgraded transport", socket.conn.transport.name); // affiche "websocket"
  });

  socket.conn.on("packet", ({ type, data }) => {
    // émis pour chaque paquet reçu
  });

  socket.conn.on("packetCreate", ({ type, data }) => {
    // appelé pour chaque paquet envoyé
  });

  socket.conn.on("drain", () => {
    // appelé lorsque le tampon d'écriture est vidé
  });

  socket.conn.on("close", (reason) => {
    // appelé lorsque la connexion sous-jacente est fermée
  });
});
```

### socket.request {#socketrequest}

  * [`<http.IncomingMessage>`](https://nodejs.org/api/http.html#class-httpincomingmessage)

Une référence à la première requête HTTP du client. Utile pour accéder aux en-têtes HTTP tels que `Cookie` ou `User-Agent`.

```js
import { parse } from "cookie";

io.on("connection", (socket) => {
  const cookies = parse(socket.request.headers.cookie || "");
});
```

### socket.handshake {#sockethandshake}

  * [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object)

Les détails de la poignée de main (« handshake ») :

```js
{
  headers: /* les en-têtes envoyés dans le cadre de la poignée de main */,
  time: /* la date de création (sous forme de chaîne de caractère) */,
  address: /* l'adresse IP du client */,
  xdomain: /* si la connexion est interdomaine */,
  secure: /* si la connexion est sécurisée */,
  issued: /* la date de création (sous forme d'horodatage unix)  */,
  url: /* l'URL de la première requête HTTP */,
  query: /* les paramètres de requête de la première requête HTTP */,
  auth: /* les données d'authentification */
}
```

Utilisation :

```js
io.use((socket, next) => {
  let handshake = socket.handshake;
  // ...
});

io.on("connection", (socket) => {
  let handshake = socket.handshake;
  // ...
});
```

### socket.use(fn) {#socketusefn}

<details className="changelog">
    <summary>History</summary>

| Version | Changements                                           |
|---------|-------------------------------------------------------|
| v3.0.5  | Restauration de la première implémentation.           |
| v3.0.0  | Suppression en facteur de `socket.onAny()`.           |
| v1.7.2  | L'événement `error` est envoyé directement au client. |
| v1.6.0  | Première implémentation.                              |

</details>

  - `fn` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

Ajoute un middleware, qui sera exécuté pour chaque paquet entrant et reçoit en paramètre le paquet et une fonction pour différer éventuellement l'exécution au prochain middleware enregistré.

Les erreurs transmises à la fonction rappel (« callback ») du middleware sont ensuite émises en tant qu'événements "error" côté serveur :

```js
io.on("connection", (socket) => {
  socket.use(([event, ...args], next) => {
    if (isUnauthorized(event)) {
      return next(new Error("unauthorized event"));
    }
    // ne pas oublier d'appeler next()
    next();
  });

  socket.on("error", (err) => {
    if (err && err.message === "unauthorized event") {
      socket.disconnect();
    }
  });
});
```

### socket.send([...args][, ack]) {#socketsendargs-ack}

  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retourne** [`Socket`](#socket)

Envoie un événement `message`. Voir [socket.emit(eventName[, ...args][, ack])](#socketemiteventname-args-ack).

### socket.emit(eventName[, ...args][, ack]) {#socketemiteventname-args-ack}

*(surcharge `EventEmitter.emit`)*
  - `eventName` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<symbol>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#symbol_type)
  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retourne** `true`

Émet un événement. Tout autre paramètre peut être inclus. Toutes les structures de données sérialisables sont prises en charge, y compris `Buffer` et `TypedArray`.

```js
socket.emit("hello", "world");
socket.emit("with-binary", 1, "2", { 3: "4", 5: Buffer.from([6]) });
```

L'argument `ack` est facultatif et sera appelé avec l'accusé de réception du client.

*Server*

```js
io.on("connection", (socket) => {
  socket.on("bonjour", (arg, callback) => {
    console.log(arg); // "ô monde"
    callback("bien reçu !");
  });
});
```

*Client*

```js
socket.emit("bonjour", "ô monde", (response) => {
  console.log(response); // "bien reçu !"
});
```

### socket.on(eventName, callback) {#socketoneventname-callback}

*Héritée de la classe [EventEmitter](https://nodejs.org/api/events.html#class-eventemitter).*

  - `eventName` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<symbol>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#symbol_type)
  - `callback` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retourne** [`<Socket>`](#socket)

Ajoute un nouvel auditeur pour l'événement donné.

```js
socket.on("news", (data) => {
  console.log(data);
});

// avec plusieurs arguments
socket.on("news", (arg1, arg2, arg3) => {
  // ...
});

// avec un accusé de réception
socket.on("news", (data, callback) => {
  callback(0);
});
```

### socket.once(eventName, listener) {#socketonceeventname-listener}
### socket.removeListener(eventName, listener) {#socketremovelistenereventname-listener}
### socket.removeAllListeners([eventName]) {#socketremovealllistenerseventname}
### socket.eventNames() {#socketeventnames}

Héritées de la classe `EventEmitter` (ainsi que d'autres méthodes non mentionnées ici). Cf. la documentation Node.js du module [events](https://nodejs.org/docs/latest/api/events.html).

### socket.onAny(callback) {#socketonanycallback}

  - `callback` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

Ajoute un nouvel auditeur attrape-tout (« catch-all »).

```js
socket.onAny((event, ...args) => {
  console.log(`reçu ${event}`);
});
```

### socket.prependAny(callback) {#socketprependanycallback}

  - `callback` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

Ajoute un nouvel auditeur attrape-tout. La fonction est ajoutée au début du tableau des auditeurs.

```js
socket.prependAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.offAny([listener]) {#socketoffanylistener}

  - `listener` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

Supprime l'auditeur attrape-tout donné. Si aucun auditeur n'est fourni, tous les auditeurs attrape-tout sont supprimés.

```js
const myListener = () => { /* ... */ };

socket.onAny(myListener);

// then, later
socket.offAny(myListener);

socket.offAny();
```

### socket.listenersAny() {#socketlistenersany}

  - **Retourne** [`<Function[]>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

Renvoie le tableau des auditeurs attrape-tout.

```js
const listeners = socket.listenersAny();
```

### socket.join(room) {#socketjoinroom}

  - `room` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<string[]>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - **Retourne** `void` | `Promise`

Ajoute le *Socket* à la *Room* ou au tableau de *Rooms*.

```js
io.on("connection", (socket) => {
  socket.join("room 237");
  
  console.log(socket.rooms); // Set { <socket.id>, "room 237" }

  socket.join(["room 237", "room 238"]);

  io.to("room 237").emit("a new user has joined the room"); // diffusion à tous ceux présents dans la room
});
```

Les mécanismes de connexion des *Rooms* sont gérés par l'*Adapter* qui a été configuré (voir `Server#adapter` ci-dessus), par défaut [socket.io-adapter](https://github.com/socketio/socket.io-adapter).

Par commodité, chaque *Socket* rejoint automatiquement une *Room* identifiée par son identifiant (voir `Socket#id`). Cela facilite la diffusion de messages vers d'autres *Sockets* :

```js
io.on("connection", (socket) => {
  socket.on("say to someone", (id, msg) => {
    // envoyer un message privé au socket avec l'identifiant donné
    socket.to(id).emit("my message", msg);
  });
});
```

### socket.leave(room) {#socketleaveroom}

  - `room` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - **Retourne** `void` | `Promise`

Supprime le *Socket* de la *Room*.

```js
io.on("connection", (socket) => {
  socket.leave("room 237");

  io.to("room 237").emit(`user ${socket.id} has left the room`);
});
```

:::info

Le *Socket* est supprimé automatiquement de toutes les *Rooms* lors de la déconnexion.

:::

### socket.to(room) {#sockettoroom}

<details className="changelog">
    <summary>History</summary>

| Version | Changes |
| ------- | ------- |
| v4.0.0 | Ajout de la possibilité de passer un tableau de *Rooms*.
| v1.0.0 | Première implémentation.

</details>

  - `room` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<string[]>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - **Retourne** `Socket` pour l'enchaînement

Définit un modificateur pour une émission d'événement ultérieure selon lequel l'événement ne sera _diffusé_ qu'aux clients qui ont rejoint la *Room* donnée (le *Socket* lui-même étant exclu).

Pour émettre vers plusieurs *Rooms*, vous pouvez appeler `to` plusieurs fois.

```js
io.on("connection", (socket) => {

  // vers une room
  socket.to("others").emit("an event", { some: "data" });

  // vers plusieurs rooms
  socket.to("room1").to("room2").emit("hello");

  // avec un tableau
  socket.to(["room1", "room2"]).emit("hello");

  // message privé vers un autre socket
  socket.to(/* another socket id */).emit("hey");

  // Attention ! `socket.to(socket.id).emit()` ne fonctionnera pas. Merci d'utiliser `socket.emit()` à la place.
});
```

:::info

Les accusés de réception ne sont actuellement pas pris en charge par la diffusion d'événements.

:::

### socket.in(room) {#socketinroom}

*Ajoutée en v1.0.0*

Synonyme de [socket.to(room)](#sockettoroom).

### socket.except(rooms) {#socketexceptrooms}

*Ajoutée en v4.0.0*

  - `rooms` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<string[]>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - **Retourne** `BroadcastOperator`

Définit un modificateur pour une émission d'événement ultérieure selon lequel l'événement ne sera _diffusé_ qu'aux clients qui n'ont pas rejoint les *Rooms* données (le *Socket* lui-même étant exclu).

```js
// à tous les clients sauf ceux dans la room "room1" (ainsi que l'émetteur)
socket.broadcast.except("room1").emit(/* ... */);

// même chose qu'au dessus
socket.except("room1").emit(/* ... */);

// à tous les clients dans la room "room4" sauf ceux dans la room "room1" (ainsi que l'émetteur)
socket.to("room4").except("room5").emit(/* ... */);
```

### socket.compress(value) {#socketcompressvalue}

  - `value` [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en) whether to following packet will be compressed
  - **Retourne** `Socket` pour l'enchaînement

Définit un modificateur pour une émission d'événement ultérieure selon lequel les données d'événement ne seront _compressées_ que si la valeur est "true". La valeur par défaut est `true` lorsque vous n'appelez pas la méthode.

```js
io.on("connection", (socket) => {
  socket.compress(false).emit("uncompressed", "that's rough");
});
```

### socket.timeout(value) {#sockettimeoutvalue}

*Ajoutée en v4.4.0*

- `value` [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#number_type)
- **Retourne** [`<Socket>`](#socket)

Définit un modificateur pour une émission d'événement ultérieure selon lequel la fonction rappel (« callback ») sera invoquée avec une erreur lorsqu'un certain nombre de millisecondes se seront écoulées sans accusé de réception de la part du client :

```js
socket.timeout(5000).emit("my-event", (err) => {
  if (err) {
    // le client n'a pas accusé réception de l'événement dans le délai imparti
  }
});
```

### socket.disconnect(close) {#socketdisconnectclose}

  - `close` [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en) whether to close the underlying connection
  - **Retourne** [`Socket`](#socket)

Déconnecte ce *Socket*. Si la valeur de `close` est `true`, ferme la connexion sous-jacente. Sinon, il déconnecte unique le *Namespace*.

```js
io.on("connection", (socket) => {
  setTimeout(() => socket.disconnect(true), 5000);
});
```

### Drapeau : 'broadcast' {#flag-broadcast}

Définit un modificateur pour une émission d'événement ultérieure selon lequel l'événement sera diffusé à tous les *Sockets* (en excluant le *Socket* émetteur).

```js
io.on("connection", (socket) => {
  socket.broadcast.emit("an event", { some: "data" }); // tous les clients le reçoivent sauf l'émetteur
});
```

### Drapeau : 'volatile' {#flag-volatile-1}

Définit un modificateur pour une émission d'événement ultérieure selon lequel l'événement peut être perdu si les clients ne sont pas prêts à recevoir des messages (à cause de la lenteur du réseau ou d'autres problèmes, ou parce qu'ils sont connectés via une longue interrogation et sont au milieu d'un cycle de réponse).

```js
io.on("connection", (socket) => {
  socket.volatile.emit("an event", { some: "data" }); // le client le recevra peut-être
});
```

### Événement : 'disconnect' {#event-disconnect}

  - `reason` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) the reason of the disconnection (either client or server-side)

Émis lors de la déconnexion.

```js
io.on("connection", (socket) => {
  socket.on("disconnect", (reason) => {
    // ...
  });
});
```

Raisons possibles :

| Raison                        | Description                                                                                                           |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `server namespace disconnect` | Le *Socket* a été manuellement déconnecté avec la méthode [socket.disconnect()](server-api.md#socketdisconnectclose)  |
| `client namespace disconnect` | Le client a manuellement déconnecté le *Socket* avec la méthode [socket.disconnect()](client-api.md#socketdisconnect) |
| `server shutting down`        | Le serveur est en train de s'arrêter                                                                                  |
| `ping timeout`                | Le client n'a pas envoyé de paquet PONG dans le délai `pingTimeout` imparti                                           |
| `transport close`             | La connexion a été interrompue (exemple : l'utilisateur a perdu la connexion, ou le réseau est passé du WiFi à la 4G) |
| `transport error`             | La connexion a rencontré une erreur                                                                                   |

### Événement : 'disconnecting' {#event-disconnecting}

  - `reason` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) the reason of the disconnection (either client or server-side)

Émis lorsque le client est sur le point d'être déconnecté (mais qu'il n'a pas encore quitté ses *Rooms*).

```js
io.on("connection", (socket) => {
  socket.on("disconnecting", (reason) => {
    console.log(socket.rooms); // Set { ... }
  });
});
```

Remarque : ces événements, ainsi que `connect`, `connect_error`, `newListener` et `removeListener`, sont des événements spéciaux qui ne doivent pas être utilisés dans votre application :
```js
// INCORRECT, une exception sera levée 
socket.emit("disconnect");
```

## Client {#client}

<ThemedImage
  alt="Client dans le diagramme de classe de la partie serveur"
  sources={{
    light: useBaseUrl('/images/server-class-diagram-client.png'),
    dark: useBaseUrl('/images/server-class-diagram-client-dark.png'),
  }}
/>

La classe `Client` représente une connexion de transport entrante (engine.io). Un `Client` peut être associé à plusieurs *Sockets* multiplexés appartenant à différents *Namespaces*.

### client.conn {#clientconn}

  * `<engine.Socket>`

Une référence au client de connexion sous-jacent (objet `Socket` côté Engine.IO)

### client.request {#clientrequest}

  * [`<http.IncomingMessage>`](https://nodejs.org/api/http.html#class-httpincomingmessage)

Une référence à la première requête HTTP du client. Utile pour accéder aux en-têtes HTTP tels que `Cookie` ou `User-Agent`.

## Engine {#engine}

Le serveur Engine.IO, qui gère les connexions WebSocket / HTTP long-polling. Plus d'informations [ici](categories/01-Documentation/how-it-works.md).

Son code source se trouve ici : https://github.com/socketio/engine.io

### engine.clientsCount {#engineclientscount}

*Ajoutée en v1.0.0*

  - [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#number_type)

Le nombre de clients actuellement connectés.

```js
const count = io.engine.clientsCount;
// peut potentiellement être similaire au nombre de sockets dans le namespace principal, selon votre utilisation 
const count2 = io.of("/").sockets.size;
```

### engine.generateId {#enginegenerateid}

  - [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

La fonction utilisée pour générer un nouvel ID de session. Utilise [base64id](https://github.com/faeldt/base64id) par défaut.

```js
const uuid = require("uuid");

io.engine.generateId = () => {
  return uuid.v4(); // doit être unique au sein d'un cluster de serveurs Socket.IO 
}
```

### engine.handleUpgrade(request, socket, head) {#enginehandleupgraderequest-socket-head}

*Ajoutée en v1.0.0*

  - `request` [`<http.IncomingMessage>`](https://nodejs.org/docs/latest/api/http.html#http_class_http_incomingmessage) la requête entrante
  - `socket` [`<stream.Duplex>`](https://nodejs.org/docs/latest/api/stream.html#stream_class_stream_duplex) la connexion TCP entre le serveur et le client
  - `head` [`<Buffer>`](https://nodejs.org/docs/latest/api/buffer.html#buffer_class_buffer) le premier paquet du flux de mise à jour (peut être vide)

Cette méthode peut être utilisée pour injecter une mise à niveau HTTP.

Exemple avec un serveur Socket.IO et un serveur WebSocket classique :

```js
import { createServer } from "http";
import { Server as WsServer } from "ws";
import { Server } from "socket.io";

const httpServer = createServer();
const wss = new WsServer({ noServer: true });
const io = new Server(httpServer);

httpServer.removeAllListeners("upgrade");

httpServer.on("upgrade", (req, socket, head) => {
  if (req.url === "/") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else if (req.url.startsWith("/socket.io/")) {
    io.engine.handleUpgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

httpServer.listen(3000);
```

### Événement : 'initial_headers' {#event-initial_headers}

*Ajoutée en v4.1.0*

  - `headers` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object) a hash of headers, indexed by header name
  - `request` [`<http.IncomingMessage>`](https://nodejs.org/docs/latest/api/http.html#http_class_http_incomingmessage) the incoming request

Cet événement sera émis juste avant d'écrire les en-têtes de réponse de la **première** requête HTTP de la session (la poignée de main), vous permettant de les personnaliser.

```js
import { serialize } from "cookie";

io.engine.on("initial_headers", (headers, request) => {
  headers["set-cookie"] = serialize("uid", "1234", { sameSite: "strict" });
});
```

### Événement : 'headers' {#event-headers}

*Ajoutée en v4.1.0*

  - `headers` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object) a hash of headers, indexed by header name
  - `request` [`<http.IncomingMessage>`](https://nodejs.org/docs/latest/api/http.html#http_class_http_incomingmessage) the incoming request

Cet événement sera émis juste avant d'écrire les en-têtes de réponse de **chaque** requête HTTP de la session (y compris la mise à jour WebSocket), vous permettant de les personnaliser.

```js
import { serialize, parse } from "cookie";

io.engine.on("headers", (headers, request) => {
  if (!request.headers.cookie) return;
  const cookies = parse(request.headers.cookie);
  if (!cookies.randomId) {
    headers["set-cookie"] = serialize("randomId", "abc", { maxAge: 86400 });
  }
});
```

### Événement : 'connection_error' {#event-connection_error}

*Ajoutée en v4.1.0*

  - `error` [`<Error>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Error)

```js
io.engine.on("connection_error", (err) => {
  console.log(err.req);	     // la requête
  console.log(err.code);     // le code d'erreur, par exemple "1"
  console.log(err.message);  // le message d'erreur, par exemple "Session ID unknown"
  console.log(err.context);  // un contexte d'erreur supplémentaire
});
```

Cet événement sera émis lorsqu'une connexion est anormalement fermée. Voici la liste des codes d'erreur possibles :

| Code |            Message             |
|:----:|:------------------------------:|
|  0   |      "Transport unknown"       |
|  1   |      "Session ID unknown"      |
|  2   |     "Bad handshake method"     |
|  3   |         "Bad request"          |
|  4   |          "Forbidden"           |
|  5   | "Unsupported protocol version" | -->
