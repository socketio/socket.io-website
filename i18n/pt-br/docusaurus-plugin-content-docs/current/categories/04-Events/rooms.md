---
title: Rooms
sidebar_position: 4
slug: /rooms/
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

Uma *sala* é um canal arbitrário ao qual os sockets podem `entrar` e `sair`. Ela pode ser usada para transmitir eventos para um subconjunto de clientes:

<ThemedImage
  alt="Transmitindo para todos os clientes em uma sala"
  sources={{
    light: useBaseUrl('/images/rooms.png'),
    dark: useBaseUrl('/images/rooms-dark.png'),
  }}
/>

:::info

Por favor, observe que as salas são um conceito **apenas do servidor** (ou seja, o cliente não tem acesso à lista de salas às quais se juntou).

:::

## Entrando e saindo {#entrando-e-saindo}

Você pode chamar `join` para inscrever o socket em um canal específico:

```js
io.on("connection", (socket) => {
  socket.join("some room");
});
```

E então, simplesmente use `to` ou `in` (eles são equivalentes) ao transmitir ou emitir:

```js
io.to("some room").emit("some event");
```

Você pode emitir para várias salas ao mesmo tempo:

```js
io.to("room1").to("room2").to("room3").emit("some event");
```

Nesse caso, uma <a href="https://pt.wikipedia.org/wiki/Uni%C3%A3o_(teoria_dos_conjuntos)">união</a> é realizada: todo socket que está pelo menos em uma das salas receberá o evento **uma vez** (mesmo que o socket esteja em duas ou mais salas).

Você também pode transmitir para uma sala a partir de um socket específico:

```js
io.on("connection", (socket) => {
  socket.to("some room").emit("some event");
});
```

Nesse caso, todos os sockets na sala, **exceto** o remetente, receberão o evento.

<ThemedImage
  alt="Transmitindo para todos os clientes em uma sala, excluindo o remetente."
  sources={{
    light: useBaseUrl('/images/rooms2.png'),
    dark: useBaseUrl('/images/rooms2-dark.png'),
  }}
/>

Para sair de um canal, você chama `leave` da mesma forma que `join`.

## Sala padrão {#sala-padrão}

Cada `Socket` no Socket.IO é identificado por um identificador único, aleatório e imprevisível [Socket#id](../02-Server/server-socket-instance.md#socketid). Para sua conveniência, cada socket automaticamente entra em uma sala identificada pelo seu próprio ID.

Isso torna fácil implementar mensagens privadas:

```js
io.on("connection", (socket) => {
  socket.on("private message", (anotherSocketId, msg) => {
    socket.to(anotherSocketId).emit("private message", socket.id, msg);
  });
});
```

## Exemplos de casos de uso {#exemplos-de-casos-de-uso}

- Transmitir dados para cada dispositivo / aba de um usuário específico.

```js
io.on("connection", async (socket) => {
  const userId = await computeUserIdFromHeaders(socket);

  socket.join(userId);

  // and then later
  io.to(userId).emit("hi");
});
```

- Enviar notificações sobre uma entidade específica.

```js
io.on("connection", async (socket) => {
  const projects = await fetchProjects(socket);

  projects.forEach(project => socket.join("project:" + project.id));

  // and then later
  io.to("project:4321").emit("project updated");
});
```

## Desconexão {#desconexão}

Após a desconexão, os sockets saem automaticamente de todos os canais dos quais faziam parte, e você não precisa fazer nenhuma desmontagem especial.

Você pode obter as salas nas quais o Socket estava ouvindo o evento `disconnecting`:

```js
io.on("connection", socket => {
  socket.on("disconnecting", () => {
    console.log(socket.rooms); // the Set contains at least the socket ID
  });

  socket.on("disconnect", () => {
    // socket.rooms.size === 0
  });
});
```

## Com múltiplos servidores Socket.IO {#com-múltiplos-servidores-socketio}

Assim como [transmissão global](broadcasting-events.md#com-múltiplos-servidores-socketio), a transmissão para salas também funciona com múltiplos servidores Socket.IO.

Você só precisa substituir o [Adaptador](../08-Miscellaneous/glossary.md#adapter) padrão pelo Adaptador Redis. Mais informações sobre isso [aqui](../05-Adapters/adapter-redis.md).

<ThemedImage
  alt="Broadcasting to all clients in a room with Redis"
  sources={{
    light: useBaseUrl('/images/rooms-redis.png'),
    dark: useBaseUrl('/images/rooms-redis-dark.png'),
  }}
/>

## Detalhes de implementação {#detalhes-de-implementação}

O recurso de "sala" é implementado pelo que chamamos de Adaptador. Este Adaptador é um componente do lado do servidor que é responsável por:

- armazenar as relações entre as instâncias de Socket e as salas
- transmitir eventos para todos (ou um subconjunto de) clientes

Você pode encontrar o código do adaptador padrão em memória [aqui](https://github.com/socketio/socket.io-adapter).

Basicamente, ele consiste em dois [ES6 Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map):

- `sids`: `Map<SocketId, Set<Room>>`
- `rooms`: `Map<Room, Set<SocketId>>`

Chamar `socket.join("the-room")` resultará em:

- no `Map` `sids`, adicionando "the-room" ao conjunto identificado pelo ID do socket
- no `Map` `rooms`, adicionando o ID do socket ao conjunto identificado pela string "the-room"

Esses dois mapas são então usados ao transmitir:

- uma transmissão para todos os sockets (`io.emit()`) percorre o `Map` `sids` e envia o pacote para todos os sockets
- uma transmissão para uma sala específica (`io.to("room21").emit()`) percorre o conjunto no `Map` `rooms` e envia o pacote para todos os sockets correspondentes

Você pode acessar esses objetos com:

```js
// main namespace
const rooms = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

// custom namespace
const rooms = io.of("/my-namespace").adapter.rooms;
const sids = io.of("/my-namespace").adapter.sids;
```

Observações:

- Esses objetos não devem ser modificados diretamente; você deve sempre usar [`socket.join(...)`](../../server-api.md#socketjoinroom) e [`socket.leave(...)`](../../server-api.md#socketleaveroom) em vez disso.
- Em uma configuração [multi-servidor](../02-Server/using-multiple-nodes.md), os objetos `rooms` e `sids` não são compartilhados entre os servidores Socket.IO (uma sala pode "existir" apenas em um servidor e não em outro).

## Eventos de sala {#eventos-de-sala}

A partir do `socket.io@3.1.0`, o Adaptador subjacente emitirá os seguintes eventos:

- `create-room` (argumento: sala)
- `delete-room` (argumento: sala)
- `join-room` (argumento: sala, id)
- `leave-room` (argumento: sala, id)

Exemplo:

```js
io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
```
