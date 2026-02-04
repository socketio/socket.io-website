---
title: API do Cliente
sidebar_label: API
sidebar_position: 1
slug: /client-api/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## IO {#io}

O método `io`  é vinculado com o escopo global na construção standalone:

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io("http://localhost");
</script>
```
No pacote ESM é tambem disponível na versão [4.3.0](/pt-br/blog/socket-io-4-3-0/) :

```html
<script type="module">
  import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";

  const socket = io();
</script>
```

com um [import map](https://caniuse.com/import-maps) :

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
Se não, em todos casos (com apenas ferramentas de build, em Node.Js ou React Native), é possivel importar o pacote `socket.io-client`:

```js
// syntaxe "import"
import { io } from "socket.io-client";

// syntaxe "require"
const { io } = require("socket.io-client");
```

### io.protocol {#ioprotocol}

  * [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number)

O número de revisão do protocolo (atualmente: 5).

O protocolo define o formato dos pacotes trocados entre cliente e servidor. Ambos o cliente e servidor devem usar a mesma revisão para entender para entender um ao outro.

Você pode encontrar mais informações [aqui](https://github.com/socketio/socket.io-protocol).

### io([url][, options]) {#iourl-options}

  - `url` [`<string>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_string) (padrão para `window.location`)
  - `options` [`<Object>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Object)
    - `forceNew` [`<boolean>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_boolean) se desejar criar uma nova conexão.
  - **Retorno** [`<Socket>`](#socket)

Cria um novo *Manager* para a sua URL, e tentativas de reuso um *Manager* existente para chamadas subseqüente, a não ser que a option `multiplex` seja passada como `false`. Passando essa opção é o equivalente a passar  `"force new connection": true` ou `forceNew: true`.

Uma nova instancia de *Socket* é retornada para o *Namespace* especificado pelo pathname da URL, padronizada por `/`. Por exemplo, si a `url` é `http://localhost/users`, um transporte de conexão irá se estabelecer em `http://localhost` e uma conexão Socket.IO irá se estabilizar em `/users`.

Parametros de Consulta (Query parameters) tambem podem ser fornecidos, sejá com uma opção `query` ou direcionando para a url (exemplo: `http://localhost/users?token=abc`).

Para entendermos o que está acontecendo debaixo dos panos, segue o exemplo:

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

é a versão curta de: 

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
A lista completa de opções disponiveis pode ser encontradas [aqui](client-options.md).

## Manager {#manager}

<ThemedImage
  alt="Manager em um diagrama de classe para o cliente"
  sources={{
    light: useBaseUrl('/images/client-class-diagram-manager.png'),
    dark: useBaseUrl('/images/client-class-diagram-manager-dark.png'),
  }}
/>

O *Manager* *gerencia* da instancia Engine.IO [client](https://github.com/socketio/engine.io-client/), que é o mecanismo de baixo-nível que estabelece a conexão com o servidor (usando tranporte com WebSocket ou HTTP long-polling).

O *Manager* manipula a logíca de reconexão.

Um unico *Manager* pode ser usado para varios [*Sockets*](#socket). Você pode encontrar mais informações sobre recursos de multiplexação [aqui](categories/06-Advanced/namespaces.md).

Por favor note isso, em muitos casos você podeusar o *Manager* diretamente, mas usará a instancia de [*Sockets*](#socket).

### new Manager(url[, options]) {#new-managerurl-options}

  - `url` [`<string>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_string)
  - `options` [`<Object>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - **Retorno** [`<Manager>`](#manager)

A lista completa de opções disponíveis pode ser encontrada [aqui](client-options.md).

```js
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com");

const socket = manager.socket("/"); // namespace principal
const adminSocket = manager.socket("/admin"); // namespace "admin"
```

### manager.reconnection([value]) {#managerreconnectionvalue}

  - `value` [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)
  - **Retorna** [`<Manager>`](#manager) | [`<boolean>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_boolean)

Define as opções de `reconnection`, ou retorna se nenhum parâmetro for passado.

### manager.reconnectionAttempts([value]) {#managerreconnectionattemptsvalue}

  - `value` [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number)
  - **Retorna** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number)

Define as opção de `reconnectionAttempts`,  ou retorna se nenhum parâmetro for passado.

### manager.reconnectionDelay([value]) {#managerreconnectiondelayvalue}

  - `value` [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number)
  - **Retorna** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number)

Define as opção de `reconnectionDelay`,  ou retorna se nenhum parâmetro for passado.

### manager.reconnectionDelayMax([value]) {#managerreconnectiondelaymaxvalue}

  - `value` [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number)
  - **Retorna** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number)

Define as opção de `reconnectionDelayMax` ou retorna se nenhum parâmetro for passado.

### manager.timeout([value]) {#managertimeoutvalue}

  - `value` [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number)
  - **Retorna** [`<Manager>`](#manager) | [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number)

Define as opção de `timeout` ou retorna se nenhum parâmetro for passado.
### manager.open([callback]) {#manageropencallback}

  - `callback` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retorna** [`<Manager>`](#manager)

Se o *Manager* For iniciatizado com `autoConnect` igual a `false`, inicia uma nova tentativa de conexão 

O argumento de  `callback` é opcional e pode ser chamado assim que uma nova tentativa falhar/passar.

```js
import { Manager } from "socket.io-client";

const manager = new Manager("https://example.com", {
  autoConnect: false
});

const socket = manager.socket("/");

manager.open((err) => {
  if (err) {
    // Ocorreu um erro
  } else {
    // a conexão foi estabelecida com sucesso
  }
});
```

### manager.connect([callback]) {#managerconnectcallback}

Sinônimo de [manager.open([callback])](#manageropencallback).

### manager.socket(nsp, options) {#managersocketnsp-options}

  - `nsp` [`<string>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_string)
  - `options` [`<Object>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - **Retorna** [`<Socket>`](#socket)

Cria um novo Socket para *Socket* os *Namespace* fornecidos. Apenas `auth` (`{ auth: {key: "value"} }`) é lido do `options`. Outra chave serão ignoradas e devem ser passadas quando instanciar um `new Manager(nsp, options)`.


### Event : 'error' {#event-error}

  - `error` [`<Error>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Error) error object

Disparado após um erro de conexão.

```js
socket.io.on("error", (error) => {
  // ...
});
```

### Event : 'reconnect' {#event-reconnect}

  - `attempt` [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number) número de tentativa de reconexão

Disparado após uma reconexão bem-sucedida.

```js
socket.io.on("reconnect", (attempt) => {
  // ...
});
```

### Event : 'reconnect_attempt' {#event-reconnect_attempt}

  - `attempt` [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number) le numéro de tentative de reconnexion

Disparado após uma tentativa de reconexão.


```js
socket.io.on("reconnect_attempt", (attempt) => {
  // ...
});
```

### Event : 'reconnect_error' {#event-reconnect_error}

  - `error` [`<Error>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Error) l'objet d'erreur

Disparado após um erro de tentativa de reconexão.

```js
socket.io.on("reconnect_error", (error) => {
  // ...
});
```

### Event : 'reconnect_failed' {#event-reconnect_failed}

Disparado quando não foi possível reconectar dentro de `reconnectionAttempts`.


```js
socket.io.on("reconnect_failed", () => {
  // ...
});
```

### Event : 'ping' {#event-ping}

Disparado quando um pacote de ping é recebido do servidor.

```js
socket.io.on("ping", () => {
  // ...
});
```

## Socket {#socket}

<ThemedImage
  alt="Soquete no diagrama de classes para o cliente"
  sources={{
    light: useBaseUrl('/images/client-class-diagram-socket.png'),
    dark: useBaseUrl('/images/client-class-diagram-socket-dark.png'),
  }}
/>

Um *Socket* é a classe fundamental para interagirmos com o servidor. Um Socket pertence a um certo [*Namespace*](categories/06-Advanced/namespaces.md) (por padrão `/`) e utiliza um [Manager](#manager) subjacente para se comunicar

Um *Socket* é basicamente um [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) que envia eventos para - e recebe eventos - do Servidor para a rede

```js
socket.emit("hello", { a: "b", c: [] });

socket.on("hey", (...args) => {
  // ...
});
```
Mais informações podem ser encontradas [aqui](categories/03-Client/client-socket-instance.md).

### socket.id {#socketid}

  - [`<string>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_string)

Um identificador exclusivo para sua sessão de socket. Definada após um evento de conexão for acionado e atualizado, após o evento `connect`

```js
const socket = io("http://localhost");

console.log(socket.id); // undefined

socket.on("connect", () => {
  console.log(socket.id); // "G5p5..."
});
```

### socket.connected {#socketconnected}

  - [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)

Indica se o *Socket* está ou não conectado ao servidor.

```js
const socket = io("http://localhost");

socket.on("connect", () => {
  console.log(socket.connected); // true
});
```

### socket.disconnected {#socketdisconnected}

  - [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)

  Indica se o *Socket* está ou não desconectado ao servidor.

```js
const socket = io("http://localhost");

socket.on("connect", () => {
  console.log(socket.disconnected); // false
});
```

### socket.io {#socketio}

  - [`<Manager>`](#manager)

Uma referência ao [*Manager*](#manager) subjacente.

```js
socket.on("connect", () => {
  const engine = socket.io.engine;
  console.log(engine.transport.name);  // na maioria dos casos imprime "polling"

  engine.once("upgrade", () => {
        // chamaodo quando o transporte é atualizado (exemplo: de HTTP long polling para WebSocket)
    console.log(engine.transport.name); // na maioria dos casos, imprime "websocket"
  });

  engine.on("packet", ({ type, data }) => {
      // chamado para cada pacote recebida
  });

  engine.on("packetCreate", ({ type, data }) => {
      // chamado para cada pacote criado recebida
  });

  engine.on("drain", () => {

    // chamado quando o buffer de gravação é drenado
  });

  engine.on("close", (reason) => {
    // chamado quando a conexão subjacente é fechada
  });
});
```

### socket.connect() {#socketconnect}

*Atualizado na v1.0.0*

  - **Retorna** *Socket*

Conecta manualmente o *Socket*.

```js
const socket = io({
  autoConnect: false
});

// ...
socket.connect();
```

Este método também pode ser usado para reconectar manualmente:

```js
socket.on("disconnect", () => {
  socket.connect();
});
```

### socket.open() {#socketopen}

*Atualizado na v1.0.0*

Sinônimo de [socket.connect()](#socketconnect).

### socket.send([...args][, ack]) {#socketsendargs-ack}

  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retorna** [`<Socket>`](#socket)

Envia um evento `message`. Veja [socket.emit(eventName[, ...args][, ack])](#socketemiteventname-args-ack).

### socket.emit(eventName[, ...args][, ack]) {#socketemiteventname-args-ack}

  - `eventName` [`<string>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_string) | [`<symbol>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_symbole)
  - `args` `<any[]>`
  - `ack` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)
  - **Retorna** `true`

Emite um evento para o identificar o socket pelo nome da string. Qualquer outro parâmentro pode ser incluido. Todas as estruturas de dados serializáveis ​​são suportadas, incluindo`Buffer`

```js
socket.emit("hello", "world");
socket.emit("with-binary", 1, "2", { 3: "4", 5: Buffer.from([6, 7, 8]) });
```

O argumento `ack` é opcional e pode ser chamado com a resposta do servidor.

*Client*

```js
socket.emit("hello", "world", (response) => {
  console.log(response); // "Entendi !"
});
```

*Server*

```js
io.on("connection", (socket) => {
  socket.on("bonjour", (arg, callback) => {
    console.log(arg); // "world"
    callback("Entendi !");
  });
});
```

### socket.on(eventName, callback) {#socketoneventname-callback}

*Herdado da classe [EventEmitter](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_string) | [`<symbol>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#symbol_type)
- `listener` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **Retorna** [`<Socket>`](#socket)

Registre um novo manipulador para o evento fornecido.

```js
socket.on("news", (data) => {
  console.log(data);
});

// com vários argumentos
socket.on("news", (arg1, arg2, arg3, arg4) => {
  // ...
});

// com callback
socket.on("news", (cb) => {
  cb(0);
});
```

### socket.once(eventName, callback) {#socketonceeventname-callback}

*Herdado da classe [EventEmitter](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_string) | [`<symbol>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#symbol_type)
- `listener` [`<Function>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Globa-Ul_Objects/Function)
- **Retorna** [`<Socket>`](#socket)

Ajoute la fonction `listener` au tableau des auditeurs pour l'événement nommé `eventName`. Cette fonction ne sera invoquée qu'une seule fois.

```js
socket.once("my-event", () => {
  // ...
});
```

### socket.off([eventName][, listener]) {#socketoffeventname-listener}

*Herdado da classe [EventEmitter](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_string) | [`<symbol>`](hhttps://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#symbol_type)
- `listener` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)
- **Retorna** [`<Socket>`](#socket)

Remove um especifico `listener` de um array ouvinte para o evento chamado `eventName`

```js
const myListener = () => {
  // ...
}

socket.on("my-event", myListener);

//então depois
socket.off("my-event", myListener);
```
O argumento `listener` também pode ser omitido:

```js
// remove todos os ouvintes desse evento
socket.off("my-event");

// remove todos os ouvintes de todos os eventos
socket.off();
```

### socket.listeners(eventName) {#socketlistenerseventname}

*Herdado da classe [EventEmitter](https://www.npmjs.com/package/@socket.io/component-emitter).*

- `eventName` [`<string>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_string) | [`<symbol>`](hhhttps://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#symbol_type)
- **Retorna** [`<Function[]>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)

Retorna o array de ouvintes para o evento nomeado de `eventName`

```js
socket.on("my-event", () => {
  // ...
});

console.log(socket.listeners("my-event"));// prints [ [Function] ]
```

### socket.onAny(callback) {#socketonanycallback}
  *Adicionado na v3.0.0*

  - `callback` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)
Registra um novo ouvinte abrangente

```js
socket.onAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.prependAny(callback) {#socketprependanycallback}
  *Adicionado na v3.0.0*

  - `callback` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)

Registra um novo ouvinte abrangente. O ouvinte é adicionado ao início a matriz de ouvintes
Ajoute un nouvel auditeur attrape-tout. La fonction est ajoutée au début du tableau des auditeurs.

```js
socket.prependAny((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.offAny([listener]) {#socketoffanylistener}
  *Adicionado na v3.0.0*

  - `listener` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)

Remove o ouvinte registrado anteriormente. Se nenhum listener for fornecido, todos os listeners catch-all serão removidos.


```js
const myListener = () => { /* ... */ };

socket.onAny(myListener);

// então, depois
socket.offAny(myListener);

socket.offAny();
```

### socket.listenersAny() {#socketlistenersany}
  *Adicionado na v3.0.0*

  - **Retorna** [`<Function[]>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)

Retorna a lista de listeners catch-all registrados.

```js
const listeners = socket.listenersAny();
```

### socket.onAnyOutgoing([listener]) {#socketoffanyoutgoinglistener}
  *Adicionado na v4.5.0*

  - `callback` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)

Registre um novo ouvinte catch-all para pacotes de saída.
```js
socket.onAnyOutgoing((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.prependAnyOutgoing() {#socketlistenersanyoutgoing}
  *Adicionado na v4.5.0*

  - `callback` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)

Registre um novo ouvinte catch-all para pacotes de saída. O ouvinte é adicionado ao início da matriz de ouvintes.

```js
socket.prependAnyOutgoing((event, ...args) => {
  console.log(`got ${event}`);
});
```

### socket.offAnyOutgoing([listener])  {#socketoffanyoutgoinglistener}
  *Adicionado na v4.5.0*

  - `listener` [`<Function>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)

Remove o ouvinte registrado anteriormente. Se nenhum listener for fornecido, todos os listeners catch-all serão removidos.

```js
const myListener = () => { /* ... */ };

socket.onAnyOutgoing(myListener);

// remove a single listener
socket.offAnyOutgoing(myListener);

// remove all listeners
socket.offAnyOutgoing();
```

### socket.listenersAnyOutgoing() {#socketlistenersanyoutgoing}
  *Adicionado na v4.5.0*

- **Retorna** [`<Function[]>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Function)
Retorna a lista de listeners catch-all registrados para pacotes de saída.

const listeners = socket.listenersAnyOutgoing();

### socket.compress(value) {#socketcompressvalue}

  - `value` [`<boolean>`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Data_structures#le_type_bool%C3%A9en)
  - **Retorna** [`<Socket>`](#socket)

Define um modificador para uma emissão evento subsequente em que os dados dos evento que serão _compactados_ apenas se o valor for `true`. O padrão é `true` qunado você não chama nenhum método.

```js
socket.compress(false).emit("an event", { some: "data" });
```

### socket.timeout(value) {#sockettimeoutvalue}

*Adicionado na v4.4.0*

- `value` [`<number>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_number)
- **Retorna** [`<Socket>`](#socket)

Define um modificador para uma emissão de evento subsequente em que o retorno de chamada será chamado com um erro quando o número de milissegundos especificado tiver decorrido sem uma confirmação do servidor:


```js
socket.timeout(5000).emit("my-event", (err) => {
  if (err) {
    // o servidor não reconheceu o evento no atraso dado
  }
});
```

### socket.disconnect() {#socketdisconnect}

*Adicionado na v1.0.0*

  - **Retorna** [`<Socket>`](#socket)
Desconecta manualmente um. E nesse caso, o socket não irá se reconectar novamente.

Motidvos Associados a desconeção:

- lado do cliente : `"io client disconnect"`
- lado do servidor : `"client namespace disconnect"`

Se esta for a última instância de Socket ativa do Manager, a conexão de baixo nível será fechada.

### socket.close() {#socketclose}

*Adicionado na v1.0.0*

Sinônimo de [socket.disconnect()](#socketdisconnect).

### Flag: 'volatile {#flag-volatile}

*Adicionado na v3.0.0*

Define um modificador para um evento de emissão subsequente indicando que o pacote pode ser descartado se:

- o Socket não está conectado.
- o transporte de baixo nível não é gravável (por exemplo, quando uma solicitação `POST` já está em execução no modo de pesquisa longa HTTP)

```js
socket.volatile.emit(/* ... */); // o servidor pode ou não receber
```

### Event : 'connect' {#event-connect}

Emite após a conexão com o NameSpace (incluindo uma reconexão bem-sucedida).

```js
socket.on("connect", () => {
  // ...
});
```

:::Cuidado

Por favor note que você não deve registrar manipuladores de eventos no `connect` no próprio manipulador, pois um novo manipulador será registrado toda vez que o *Socket*  se reconectar:

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

### Event : 'disconnect' {#event-disconnect}

  - `reason` [`<string>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Data_structures#tipo_string)

Dispara quando desconecta. A lista de possiveis motivos de desconexão:

| Raison                 | Description                                                                                                                 |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `io server disconnect` | O servidor foi forçado a desligar com [socket.disconnect()](server-api.md#socketdisconnectclose)                            |
| `io client disconnect` | O *Socket* foi desconectado manualmente usando [socket.disconnect()](client-api.md#socketdisconnect)                        |
| `ping timeout`         | O servidor não enviou um PING dentro do intervalo `pingInterval + pingTimeout`                                              |
| `transport close`      | A conexão foi encerrada (exemplo : o usuário perdeu a conexão ou a rede foi alterada de WiFi para 4G)                       |
| `transport error`      | A conexão encontrou um erro (exemplo : lo servidor foi encerrado durante um longo ciclo de HTTP long-polling                |

Nos dois primeiros casos (Desconexão explicita), o cliente não tentou se reconectar e você precisará chamar manualmente a chamada `socket.connect()`.

Em todos os outros casos, o cliente aguardará um pequeno [Delay aleatório](client-options.md#reconnectiondelay) e tentará se reconectar:

```js
socket.on("disconnect", (reason) => {
  if (reason === "io server disconnect") {
    // a desconexão foi iniciada pelo servidor, você precisa reconectar manualmente
    socket.connect();
  }
  // se não o socket irá automaticamente tentar se reconectar
});
```

### Event : 'connect_error' {#event-connect_error}

  - `connect_error` [`<Error>`](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Error) objeto de erro

Acionado quando ocorre um erro de middleware de namespace.

```js
socket.on("connect_error", (error) => {
  // ...
});
```
