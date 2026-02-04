---
title: API côté client
sidebar_label: API
sidebar_position: 1
slug: /client-api/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## IO {#io}

La méthode `io` est attachée au contexte global dans le « bundle » client :

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io("http://localhost");
</script>
```

Un « bundle » au format ESM est également disponible depuis la version [4.3.0](/fr/blog/socket-io-4-3-0/) :

```html
<script type="module">
  import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";

  const socket = io();
</script>
```

Avec une [map d'imports](https://caniuse.com/import-maps) :

```html
<script type="importmap">
  {
    "imports": {
      "socket.io-client": "https://cdn.socket.io/4.8.3/socket.io.esm.min.js"
    }
  }
</script>

<script type="module">
  import { io } from "socket.io-client";

  const socket = io();
</script>
```

Dans tous les autres cas (avec des outils de build, en Node.js ou React Native), la méthode `io` peut être importée à partir du module `socket.io-client` :

```js
// syntaxe "import"
import { io } from "socket.io-client";

// syntaxe "require"
const { io } = require("socket.io-client");
```

### io.protocol {#ioprotocol}

  * [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre)

Le numéro de révision du protocole (actuellement : 5).

Le protocole définit le format des paquets échangés entre le client et le serveur. Le client et le serveur doivent utiliser la même révision pour se comprendre.

Vous pourrez trouver plus d'informations [ici](https://github.com/socketio/socket.io-protocol).

### io([url][, options]) {#iourl-options}

  - `url` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) (`window.location` par défaut)
  - `options` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object)
    - `forceNew` [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en) s'il faut créer un nouveau *Manager*
  - **Retourne** [`<Socket>`](#socket)

Crée un nouveau *Manager* pour l'URL donnée et tente de réutiliser un *Manager* existant pour les appels suivants, à moins que l'option `multiplex` ne soit passée avec `false`. Passer cette option équivaut à passer `"force new connection": true` ou `forceNew: true`.

Un nouveau *Socket* est renvoyé pour le *Namespace* spécifié par le chemin d'accès dans l'URL, par défaut `/`. Par exemple, si `url` est `http://localhost/users`, une connexion de transport sera établie vers `http://localhost` et une connexion Socket.IO sera établie vers le *Namespace* `/users`.

Des paramètres de requête HTTP peuvent également être fournis, soit avec l'option `query`, soit directement dans l'URL (exemple : `http://localhost/users?token=abc`).

Pour bien comprendre ce qu'il se passe, l'exemple suivant :

```js
import { io } from "socket.io-client";

const socket = io("ws://example.com/my-namespace", {
  reconnectionDelayMax: 10000,
  auth: {
    token: "123"
  },
  query: {
    "my-key": "my-value"
  }
});
```

est la version simplifiée de :

```js
import { Manager } from "socket.io-client";

const manager = new Manager("ws://example.com", {
  reconnectionDelayMax: 10000,
  query: {
    "my-key": "my-value"
  }
});

const socket = manager.socket("/my-namespace", {
  auth: {
    token: "123"
  }
});
```

La liste complète des options disponibles se trouve [ici](client-options.md).

## Manager {#manager}

<ThemedImage
  alt="Manager dans le diagramme de classe de la partie client"
  sources={{
    light: useBaseUrl('/images/client-class-diagram-manager.png'),
    dark: useBaseUrl('/images/client-class-diagram-manager-dark.png'),
  }}
/>

Le *Manager* *gère* le [client Engine.IO](https://github.com/socketio/engine.io-client/) sous-jacent, qui est le moteur de bas niveau qui établit la connexion au serveur (en utilisant des transports comme WebSocket ou HTTP long-polling).

Le *Manager* gère la logique de reconnexion.

Un même *Manager* peut être utilisé par plusieurs [*Sockets*](#socket). Vous pouvez trouver plus d'informations sur cette fonctionnalité de multiplexage [ici](categories/06-Advanced/namespaces.md).

Veuillez noter que, dans la plupart des cas, vous n'utiliserez pas directement le *Manager*, mais utiliserez plutôt les [*Sockets*](#socket).

### new Manager(url[, options]) {#new-managerurl-options}

  - `url` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - `options` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - **Retourne** [`<Manager>`](#manager)

La liste complète des options disponibles se trouve [ici](client-options.md).

```js
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com");

const socket = manager.socket("/"); // namespace principal
const adminSocket = manager.socket("/admin"); // namespace "admin"
```

### manager.reconnection([value]) {#managerreconnectionvalue}

  - `value` [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)
  - **Retourne** [`<Manager>`](#manager) | [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)

Définit l'option `reconnection` ou renvoie la valeur actuelle si aucun paramètre n'est passé.

### manager.reconnectionAttempts([value]) {#managerreconnectionattemptsvalue}

  - `value` [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre)
  - **Retourne** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre)

Définit l'option `reconnectionAttempts` ou renvoie la valeur actuelle si aucun paramètre n'est passé.

### manager.reconnectionDelay([value]) {#managerreconnectiondelayvalue}

  - `value` [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre)
  - **Retourne** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre)

Définit l'option `reconnectionDelay` ou renvoie la valeur actuelle si aucun paramètre n'est passé.

### manager.reconnectionDelayMax([value]) {#managerreconnectiondelaymaxvalue}

  - `value` [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre)
  - **Retourne** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre)

Définit l'option `reconnectionDelayMax` ou renvoie la valeur actuelle si aucun paramètre n'est passé.

### manager.timeout([value]) {#managertimeoutvalue}

  - `value` [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre)
  - **Retourne** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre)

Définit l'option `timeout` ou renvoie la valeur actuelle si aucun paramètre n'est passé.

### manager.open([callback]) {#manageropencallback}

  - `callback` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retourne** [`<Manager>`](#manager)

Si le *Manager* a été initié avec `autoConnect` à `false`, cette méthode initie une nouvelle tentative de connexion.

L'argument `callback` est facultatif et sera appelé une fois que la tentative échoue/réussit.

```js
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com", {
  autoConnect: false
});

const socket = manager.socket("/");

manager.open((err) => {
  if (err) {
    // une erreur est survenue
  } else {
    // la connexion a été établie avec succès
  }
});
```

### manager.connect([callback]) {#managerconnectcallback}

Synonyme de [manager.open([callback])](#manageropencallback).

### manager.socket(nsp, options) {#managersocketnsp-options}

  - `nsp` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)
  - `options` [`<Object>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - **Retourne** [`<Socket>`](#socket)

Crée un nouveau *Socket* pour le *Namespace* donné. Seule l'option `auth` est lue à partir de l'objet `options`. Les autres clés seront ignorées et doivent être transmises lors de l'instanciation d'un `new Manager(nsp, options)`.

### Événement : 'error' {#event-error}

  - `error` [`<Error>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Error) l'objet d'erreur

Émis lors d'une erreur de connexion :

```js
socket.io.on("error", (error) => {
  // ...
});
```

### Événement : 'reconnect' {#event-reconnect}

  - `attempt` [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre) le numéro de tentative de reconnexion

Émis après une reconnexion réussie.

```js
socket.io.on("reconnect", (attempt) => {
  // ...
});
```

### Événement : 'reconnect_attempt' {#event-reconnect_attempt}

  - `attempt` [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre) le numéro de tentative de reconnexion

Émis lors d'une tentative de reconnexion.

```js
socket.io.on("reconnect_attempt", (attempt) => {
  // ...
});
```

### Événement : 'reconnect_error' {#event-reconnect_error}

  - `error` [`<Error>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Error) l'objet d'erreur

Émis après une erreur lors d'une tentative de reconnexion.

```js
socket.io.on("reconnect_error", (error) => {
  // ...
});
```

### Événement : 'reconnect_failed' {#event-reconnect_failed}

Émis lorsque le *Manager* n'est pas parvenu à se reconnecter après `reconnectionAttempts` tentatives de reconnexion.

```js
socket.io.on("reconnect_failed", () => {
  // ...
});
```

### Événement : 'ping' {#event-ping}

Émis lorsqu'un ping est reçu du serveur.

```js
socket.io.on("ping", () => {
  // ...
});
```

## Socket {#socket}

<ThemedImage
  alt="Socket dans le diagramme de classe de la partie client"
  sources={{
    light: useBaseUrl('/images/client-class-diagram-socket.png'),
    dark: useBaseUrl('/images/client-class-diagram-socket-dark.png'),
  }}
/>

Un *Socket* est la classe fondamentale pour interagir avec le serveur. Un *Socket* appartient à un certain [*Namespace*](categories/06-Advanced/namespaces.md) (par défaut `/`) et utilise un [Manager](#manager) sous-jacent pour communiquer.

Un *Socket* est essentiellement un [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) qui envoie des événements à - et reçoit des événements depuis - le serveur sur le réseau.

```js
socket.emit("hello", { a: "b", c: [] });

socket.on("hey", (...args) => {
  // ...
});
```

Plus d'informations pourront être trouvées [ici](categories/03-Client/client-socket-instance.md).

### socket.id {#socketid}

  - [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)

Un identifiant unique pour la session. Défini après l'émission de l'événement `connect`.

```js
const socket = io("http://localhost");

console.log(socket.id); // undefined

socket.on("connect", () => {
  console.log(socket.id); // "G5p5..."
});
```

### socket.connected {#socketconnected}

  - [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)

Indique si le *Socket* est actuellement connecté au serveur.

```js
const socket = io("http://localhost");

socket.on("connect", () => {
  console.log(socket.connected); // true
});
```

### socket.disconnected {#socketdisconnected}

  - [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)

Indique si le *Socket* est actuellement déconnecté du serveur.

```js
const socket = io("http://localhost");

socket.on("connect", () => {
  console.log(socket.disconnected); // false
});
```

### socket.io {#socketio}

  - [`<Manager>`](#manager)

Une référence au [*Manager*](#manager) sous-jacent.

```js
socket.on("connect", () => {
  const engine = socket.io.engine;
  console.log(engine.transport.name); // dans la plupart des cas, affiche "polling"

  engine.once("upgrade", () => {
    // émis lorsque le transport est mis à jour (exemple : de HTTP long-polling vers WebSocket)
    console.log(engine.transport.name); // dans la plupart des cas, affiche "websocket"
  });

  engine.on("packet", ({ type, data }) => {
    // émis pour chaque paquet reçu
  });

  engine.on("packetCreate", ({ type, data }) => {
    // appelé pour chaque paquet envoyé
  });

  engine.on("drain", () => {
    // appelé lorsque le tampon d'écriture est vidé
  });

  engine.on("close", (reason) => {
    // appelé lorsque la connexion sous-jacente est fermée
  });
});
```

### socket.connect() {#socketconnect}

*Ajoutée en v1.0.0*

  - **Retourne** *Socket*

Connecte manuellement le *Socket*.

```js
const socket = io({
  autoConnect: false
});

// ...
socket.connect();
```

Cette méthode peut également être utilisée pour se reconnecter manuellement :

```js
socket.on("disconnect", () => {
  socket.connect();
});
```

### socket.open() {#socketopen}

*Ajoutée en v1.0.0*

Synonyme de [socket.connect()](#socketconnect).

### socket.send([...args][, ack]) {#socketsendargs-ack}

  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retourne** [`<Socket>`](#socket)

Envoie un événement `message`. Voir [socket.emit(eventName[, ...args][, ack])](#socketemiteventname-args-ack).

### socket.emit(eventName[, ...args][, ack]) {#socketemiteventname-args-ack}

  - `eventName` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<symbol>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_symbole)
  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retourne** `true`

Émet un événement. Tout autre paramètre peut être inclus. Toutes les structures de données sérialisables sont prises en charge, y compris `Buffer` et `TypedArray`.

```js
socket.emit("hello", "world");
socket.emit("with-binary", 1, "2", { 3: "4", 5: Buffer.from([6, 7, 8]) });
```

L'argument `ack` est facultatif et sera appelé avec l'accusé de réception du serveur.

*Client*

```js
socket.emit("bonjour", "ô monde", (response) => {
  console.log(response); // "bien reçu !"
});
```

*Server*

```js
io.on("connection", (socket) => {
  socket.on("bonjour", (arg, callback) => {
    console.log(arg); // "ô monde"
    callback("bien reçu !");
  });
});
```

### socket.on(eventName, callback) {#socketoneventname-callback}

*Héritée de la classe [EventEmitter](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<symbol>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_symbole)
- `listener` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **Retourne** [`<Socket>`](#socket)

Ajoute la fonction `listener` au tableau des auditeurs pour l'événement nommé `eventName`.

```js
socket.on("news", (data) => {
  console.log(data);
});

// avec plusieurs arguments
socket.on("news", (arg1, arg2, arg3, arg4) => {
  // ...
});

// avec un accusé de réception
socket.on("news", (cb) => {
  cb(0);
});
```

### socket.once(eventName, callback) {#socketonceeventname-callback}

*Héritée de la classe [EventEmitter](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<symbol>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_symbole)
- `listener` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Globa-Ul_Objects/Function)
- **Retourne** [`<Socket>`](#socket)

Ajoute la fonction `listener` au tableau des auditeurs pour l'événement nommé `eventName`. Cette fonction ne sera invoquée qu'une seule fois.

```js
socket.once("my-event", () => {
  // ...
});
```

### socket.off([eventName][, listener]) {#socketoffeventname-listener}

*Héritée de la classe [EventEmitter](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<symbol>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_symbole)
- `listener` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **Retourne** [`<Socket>`](#socket)

Supprime la fonction `listener` spécifiée du tableau des auditeurs pour l'événement nommé `eventName`.

```js
const myListener = () => {
  // ...
}

socket.on("my-event", myListener);

// puis plus tard
socket.off("my-event", myListener);
```

L'argument `listener` peut également être omis :

```js
// supprime tous les auditeurs pour cet événement
socket.off("my-event");

// supprime tous les auditeurs pour tous les événements
socket.off();
```

### socket.listeners(eventName) {#socketlistenerseventname}

*Héritée de la classe [EventEmitter](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string) | [`<symbol>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_symbole)
- **Retourne** [`<Function[]>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

Renvoie le tableau des auditeurs pour l'événement nommé `eventName`.

```js
socket.on("my-event", () => {
  // ...
});

console.log(socket.listeners("my-event")); // affiche [ [Function] ]
```

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
  console.log(`reçu ${event}`);
});
```

### socket.offAny([listener]) {#socketoffanylistener}

  - `listener` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

Supprime l'auditeur attrape-tout donné. Si aucun auditeur n'est fourni, tous les auditeurs attrape-tout sont supprimés.

```js
const myListener = () => { /* ... */ };

socket.onAny(myListener);

// puis plus tard
socket.offAny(myListener);

socket.offAny();
```

### socket.listenersAny() {#socketlistenersany}

  - **Retourne** [`<Function[]>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function)

Renvoie le tableau des auditeurs attrape-tout.

```js
const listeners = socket.listenersAny();
```

### socket.compress(value) {#socketcompressvalue}

  - `value` [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)
  - **Retourne** [`<Socket>`](#socket)

Définit un modificateur pour une émission d'événement ultérieure selon lequel les données d'événement ne seront _compressées_ que si la valeur est "true". La valeur par défaut est `true` lorsque vous n'appelez pas la méthode.

```js
socket.compress(false).emit("an event", { some: "data" });
```

### socket.timeout(value) {#sockettimeoutvalue}

*Ajoutée en v4.4.0*

- `value` [`<number>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_nombre)
- **Retourne** [`<Socket>`](#socket)

Définit un modificateur pour une émission d'événement ultérieure selon lequel la fonction rappel (« callback ») sera invoquée avec une erreur lorsqu'un certain nombre de millisecondes se seront écoulées sans accusé de réception de la part du serveur :

```js
socket.timeout(5000).emit("my-event", (err) => {
  if (err) {
    // le serveur n'a pas accusé réception de l'événement dans le délai imparti
  }
});
```

### socket.disconnect() {#socketdisconnect}

*Ajoutée en v1.0.0*

  - **Retourne** [`<Socket>`](#socket)

Déconnecte manuellement le *Socket*. Dans ce cas, le *Socket* n'essaiera pas de se reconnecter.

Raison de déconnexion associée :

- côté client : `"io client disconnect"`
- côté serveur : `"client namespace disconnect"`

S'il s'agit du dernier *Socket* actif du *Manager*, la connexion de bas niveau sera également fermée.

### socket.close() {#socketclose}

*Ajoutée en v1.0.0*

Synonyme de [socket.disconnect()](#socketdisconnect).

### Drapeau : 'volatile' {#flag-volatile}

*Ajouté en v3.0.0*

Définit un modificateur pour l'émission d'événement ultérieure indiquant que le paquet peut être abandonné si :

- le *Socket* n'est pas connecté
- le transport de bas niveau n'est pas accessible en écriture (par exemple, lorsqu'une requête "POST" est déjà en cours d'exécution en mode HTTP long-polling)

```js
socket.volatile.emit(/* ... */); // le serveur recevra peut-être ce paquet
```

### Événement : 'connect' {#event-connect}

Émis lors de la connexion au *Namespace* (y compris après une reconnexion réussie).

```js
socket.on("connect", () => {
  // ...
});
```

:::caution

Vous ne devez pas ajouter d'auditeur lors de l'évènement `connect`, car un nouvel auditeur sera ajouté à chaque fois que le *Socket* se reconnectera :

```js
// BAD
socket.on("connect", () => {
  socket.on("data", () => { /* ... */ });
});

// GOOD
socket.on("connect", () => { /* ... */ });
socket.on("data", () => { /* ... */ });
```

:::

### Événement : 'disconnect' {#event-disconnect}

  - `reason` [`<string>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_cha%C3%AEne_de_caract%C3%A8res_string)

Émis lors d'une déconnexion. Vous trouverez ci-dessous la liste des raisons possibles de déconnexion :

| Raison                 | Description                                                                                                                 |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `io server disconnect` | Le serveur a manuellement déconnecté le *Socket* avec la méthode [socket.disconnect()](server-api.md#socketdisconnectclose) |
| `io client disconnect` | Le *Socket* a été manuellement déconnecté avec la méthode [socket.disconnect()](client-api.md#socketdisconnect)             |
| `ping timeout`         | Le serveur n'a pas envoyé de PING dans la plage `pingInterval + pingTimeout`                                                |
| `transport close`      | La connexion a été interrompue (exemple : l'utilisateur a perdu la connexion, ou le réseau est passé du WiFi à la 4G)       |
| `transport error`      | La connexion a rencontré une erreur (exemple : le serveur a été stoppé lors d'une requête HTTP long-polling)                |

Dans les deux premiers cas (déconnexion explicite), le client n'essaiera pas de se reconnecter et vous devrez appeler manuellement `socket.connect()`.

Dans tous les autres cas, le client attendra un petit [délai aléatoire](client-options.md#reconnectiondelay) puis essaiera de se reconnecter :

```js
socket.on("disconnect", (reason) => {
  if (reason === "io server disconnect") {
    // la déconnexion a été initiée par le serveur, vous devez vous reconnecter manuellement
    socket.connect();
  }
  // sinon la reconnexion est automatique 
});
```

### Événement : 'connect_error' {#event-connect_error}

  - `connect_error` [`<Error>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Error) objet d'erreur

Émis après une erreur lors de la connexion au *Namespace*.

```js
socket.on("connect_error", (error) => {
  // ...
});
```
