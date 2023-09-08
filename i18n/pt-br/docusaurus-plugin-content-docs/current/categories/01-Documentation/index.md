---
title: Introdução
sidebar_position: 1
slug: /
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

## O que o Socket.IO é {#o-que-o-socketio-é}

Socket.IO é uma biblioteca que permite **baixa-latência**, **bidirecional** e **baseado em eventos** de comunicação entre cliente e um servidor.

<ThemedImage
  alt="Diagram of a communication between a server and a client"
  sources={{
    light: useBaseUrl('/images/bidirectional-communication2.png'),
    dark: useBaseUrl('/images/bidirectional-communication2-dark.png'),
  }}
/>

Ele é construído em cima do protocolo [WebSocket](https://en.wikipedia.org/wiki/WebSocket) e fornece adicionais garantias como retorno para HTTP long-polling ou reconexões automaticas.

:::info

WebSocket é um protocolo de comunicação que fornece um canal full-duplex e baixa latência entre o servidor e o brower. Mais informações podem ser encontradas [aqui](https://en.wikipedia.org/wiki/WebSocket).

:::

Existem várias implementações de servidor Socket.IO disponíveis:

- JavaScript (Node.js) (cuja documentação pode ser encontrada aqui neste site)
  - [Passo a passo de instalação](../02-Server/server-installation.md)
  - [API](../../server-api.md)
  - [Código fonte](https://github.com/socketio/socket.io)
- JavaScript (Deno): https://github.com/socketio/socket.io-deno
- Java: https://github.com/mrniko/netty-socketio
- Java: https://github.com/trinopoty/socket.io-server-java
- Python: https://github.com/miguelgrinberg/python-socketio
- Golang: https://github.com/googollee/go-socket.io

E implementações do cliente na maioria das principais linguagens:

- JavaScript (que pode ser executado no navegador, em Node.js ou em React Native)
  - [Passo a passo de instalação](../03-Client/client-installation.md)
  - [API](../../client-api.md)
  - [Código font](https://github.com/socketio/socket.io-client)
- Java: https://github.com/socketio/socket.io-client-java
- C++: https://github.com/socketio/socket.io-client-cpp
- Swift: https://github.com/socketio/socket.io-client-swift
- Dart: https://github.com/rikulo/socket.io-client-dart
- Python: https://github.com/miguelgrinberg/python-socketio
- .Net: https://github.com/doghappy/socket.io-client-csharp
- Rust: https://github.com/1c3t3a/rust-socketio
- Kotlin: https://github.com/icerockdev/moko-socket-io

Aqui é um exemplo basíco com a um WebSockets simples:

*Servidor* (baseado em [ws](https://github.com/websockets/ws))

```js
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 3000 });

server.on("connection", (socket) => {
  // Envia uma messagem para o cliente
  socket.send(JSON.stringify({
    type: "hello from server",
    content: [ 1, "2" ]
  }));

  //recebe uma mensagem do cliente
  socket.on("message", (data) => {
    const packet = JSON.parse(data);

    switch (packet.type) {
      case "hello from client":
        // ...
        break;
    }
  });
});
```

*Cliente*

```js
const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("open", () => {
  // Envia uma messagem para o servidor
  socket.send(JSON.stringify({
    type: "hello from client",
    content: [ 3, "4" ]
  }));
});

// recebe uma mensagem do servidor
socket.addEventListener("message", ({ data }) => {
  const packet = JSON.parse(data);

  switch (packet.type) {
    case "hello from server":
      // ...
      break;
  }
});
```
E aqui o mesmo exemplo com o Socket.IO:

*Servidor*

```js
import { Server } from "socket.io";

const io = new Server(3000);

io.on("connection", (socket) => {
  // Envia uma messagem para o cliente
  socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });

  //recebe uma mensagem do cliente
  socket.on("hello from client", (...args) => {
    // ...
  });
});
```

*Cliente*

```js
import { io } from "socket.io-client";

const socket = io("ws://localhost:3000");

// Envia uma messagem para o servidor
socket.emit("hello from client", 5, "6", { 7: Uint8Array.from([8]) });

// recebe uma mensagem do servidor
socket.on("hello from server", (...args) => {
  // ...
});
```

Both examples looks really similar, but under the hood Socket.IO provides additional features that hide the complexity of running an application based on WebSockets in production. Those features are listed [below](#features).

But first, let's make it clear what Socket.IO is not.

## O que o Socket.IO não é {#o-que-o-socketio-não-é}

:::atenção

Socket.IO  **NÃO** é uma implementação WebSocket.

:::

Embora o Socket.IO realmente use o WebSocket para transporte quando possível, ele adiciona metadados adicionais a cada pacote. É por isso que um cliente WebSocket não poderá se conectar com êxito a um servidor Socket.IO, e um cliente Socket.IO também não poderá se conectar a um servidor WebSocket simples.

```js
// ATENÇÃO: o cliente NÃO poderá se conectar!
const socket = io("ws://echo.websocket.org");
```

Se você estiver procurando por um servidor WebSocket simples, dê uma olhada em [ws](https://github.com/websockets/ws) ou [µWebSockets.js](https://github.com/uNetworking/uWebSockets.js).

Há também [discussões](https://github.com/nodejs/node/issues/19308) para incluir um servidor WebSocket no núcleo do Node.js.

No lado do cliente, você pode estar interessado no pacote [robust-websocket](https://github.com/nathanboktae/robust-websocket).

:::atenção

Socket.IO is not meant to be used in a background service for mobile applications.

:::

The Socket.IO library keeps an open TCP connection to the server, which may result in a high battery drain for your users. Please use a dedicated messaging platform like [FCM](https://firebase.google.com/docs/cloud-messaging) for this use case.

## Recursos {#recursos}

Aqui estão os recursos fornecidos pelo Socket.IO sobre WebSockets simples:

### HTTP long-polling fallback {#http-long-polling-fallback}

A conexão retornará à sondagem longa HTTP caso a conexão WebSocket não possa ser estabelecida.

Esse recurso foi o motivo número 1 pelo qual as pessoas usaram o Socket.IO quando o projeto foi criado há mais de dez anos (!), pois o suporte do navegador para WebSockets ainda estava em seu inicio.

Mesmo que a maioria dos navegadores agora suporte WebSockets (mais que [97%](https://caniuse.com/mdn-api_websocket)), ainda é um ótimo recurso, pois ainda recebemos relatórios de usuários que não conseguem estabelecer uma conexão WebSocket porque estão atrás de algum proxy mal configurado.
### Reconexão Automatica {#reconexão-automatica}

Sob algumas condições particulares, a conexão WebSocket entre o servidor e o cliente pode ser interrompida com ambos os lados desconhecendo o estado quebrado do link.

É por isso que o Socket.IO inclui um mecanismo de pulsação, que verifica periodicamente o status da conexão.

E quando o cliente eventualmente é desconectado, ele se reconecta automaticamente com um atraso exponencial de back-off, para não sobrecarregar o servidor.
### Buffer de pacote {#buffer-de-pacote}

Os pacotes são automaticamente armazenados em buffer quando o cliente é desconectado e serão enviados na reconexão.

Mais informações [aqui](../03-Client/client-offline-behavior.md#buffered-events).

### Acknowledgements {#acknowledgements}

O Socket.IO oferece uma maneira conveniente de enviar um evento e receber uma resposta:

*Remetente*

```js
socket.emit("hello", "world", (response) => {
  console.log(response); // "conseguiu"
});
```

*Receptor*

```js
socket.on("hello", (arg, callback) => {
  console.log(arg); // "world"
  callback("got it");
});
```

Você também pode adionar um timeout:

```js
socket.timeout(5000).emit("hello", "world", (err, response) => {
  if (err) {
// o outro lado não reconheceu o evento no atraso determinado
  } else {
    console.log(response); // "conseguiu"
  }
});
```

### Transmissão {#transmissão}

No lado do servidor, você pode enviar um evento para [todos os clientes conectados](../04-Events/broadcasting-events.md) ou [para um subconjunto de clientes](../04-Events/rooms.md):

```js
// para todos os clientes
io.emit("hello");

// para todos os clientes conectados no room "news"
io.to("news").emit("hello");
```

Isso também funciona ao [escalar para vários nós](../02-Server/using-multiple-nodes.md).

### Multiplexing {#multiplexing}

Os namespaces permitem que você divida a lógica do seu aplicativo em uma única conexão compartilhada. Isso pode ser útil, por exemplo, se você quiser criar um canal "admin" no qual somente usuários autorizados possam participar.

```js
io.on("connection", (socket) => {
  // classic users
});

io.of("/admin").on("connection", (socket) => {
  // admin users
});
```

Mais sobre isso [aqui](../06-Advanced/namespaces.md).

## Questões comuns {#questões-comuns}

### O Socket.IO ainda é necessário hoje? {#o-socketio-ainda-é-necessário-hoje}

Essa é uma pergunta justa, já que os WebSockets são suportados [quase em todos os lugares](https://caniuse.com/mdn-api_websocket) nesse momento.

Dito isto, acreditamos que, se você usar WebSockets simples para seu aplicativo, eventualmente precisará implementar a maioria dos recursos que já estão incluídos (e battle-tested) no Socket.IO, como
[reconexão](#automatic-reconnection), [acknowledgements](#acknowledgements) ou [transmissão](#broadcasting).

### qual é a sobrecarga do protocolo Socket.IO? {#qual-é-a-sobrecarga-do-protocolo-socketio}

`socket.emit("hello", "world")` será enviado como um único WebSocket frame contendo `42["hello","world"]` com:

- `4` ser Engine.IO "message" tipo de pacote
- `2` ser Socket.IO "message" tipo de pacote
- `["hello","world"]` sendo o `JSON.stringify()` versão do array de argumentos.

Assim, alguns bytes adicionais para cada mensagem, que podem ser ainda mais reduzidos pelo uso de um [parser customizado](../06-Advanced/custom-parser.md).

:::info

O tamanho do pacote de navegador em si é [`10.4 kB`](https://bundlephobia.com/package/socket.io-client) (minificado e gzipado)

:::

### Algumas coisas não estão funcionando devidamente, por favor me ajude? {#algumas-coisas-não-estão-funcionando-devidamente-por-favor-me-ajude}


Por favor, cheque o [Guia de solução de problemas](../01-Documentation/troubleshooting.md).

## Proximos passos {#proximos-passos}

- [Exemplo de introdução](/get-started/chat)
- [Instalação do servidor](../02-Server/server-installation.md)
- [Installação do cliente](../03-Client/client-installation.md)
