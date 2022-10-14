---
title: Como funciona
sidebar_position: 2
slug: /how-it-works/
---

O cabal bidirectional entre o servidor Socket.IO (Node.js) e o cliente Socket.IO (browser, Node.js, ou [outra linguagem de programação](index.md#what-socketio-is)) é estabilizada com uma [conexão WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) sempre que possível, e usará a HTTP long-polling como fallback.

O base de código Socket.IO é dividido em duas camadas distintas:

- O plumbing baixo-nível: o que chamamos de Engine.IO, o mecanismo dentro do Socket.IO.
- A API alto-nível: Socket.IO em si.

## Engine.IO {#engineio}

Engine.IO é responsavel por estabelecer a conexão de baixo-nivel entre o servidor e o cliente. Ele lida com:

- os varíos [transports](#transports) e o [upgrade mechanism](#upgrade-mechanism)
- a [detecção de disconecção](#disconnection-detection)

O cod;igo fonte pode ser encontrado aqui:

- servidor: https://github.com/socketio/engine.io
- cliente: https://github.com/socketio/engine.io-client
- parser: https://github.com/socketio/engine.io-parser
- descrição de protocolo: https://github.com/socketio/engine.io-protocol

### Transports {#transports}

Existem atualmente dois transportes implementados:

- [HTTP long-polling](#http-long-polling)
- [WebSocket](#websocket)

#### HTTP long-polling {#http-long-polling}

O transporte HTTP long-polling (também simplesmente referido como "polling") consiste em sucessivas solicitações HTTP:

- long-running `GET` requests, para receber dados do servidor
- short-running `POST` requests, para enviar dados do servidor

Devido à natureza do transporte, emissões sucessivas podem ser concatenadas e enviadas dentro de uma mesma requisição HTTP.
#### WebSocket {#websocket}

O transporte WebSocket consite em um [WebSocket connection](https://developer.mozilla.org/pt-BR/docs/Web/API/WebSockets_API), que fornece um canal de comunicação bidirecional e de baixa latência entre o servidor e o cliente.

Devido à natureza do transporte, cada emissão é enviada em seu próprio quadro WebSocket (algumas emissões podem até resultar em dois quadros WebSocket distintos, mais informações [aqui](../06-Advanced/custom-parser.md#the-default-parser)).

### Handshake {#handshake}

No início da conexão Engine.IO, o servidor envia algumas informações

```json
{
  "sid": "FSDjX-WRwSA4zTZMALqx",
  "upgrades": ["websocket"],
  "pingInterval": 25000,
  "pingTimeout": 20000
}
```

- O `sid` é o ID da sessão, deve ser incluído no parâmetro de consulta (query parameter) `sid` e todas subsequentes requisições HTTP.
- O `upgrades` array qe contém uma lista de todos transportes os "melhores" transportes que são suportados pelo servidor.
- O `pingInterval` e `pingTimeout` valores são usados em um mecanismo de heartbeat

### Atualizando mecanismos {#upgrade-mechanism}

Por padrão, o cliente estabelece uma conexão com o transporte HTTP long-polling.

**Mas, por que?**

Embora WebSocket é claramente o melhor que há para estabelecer uma comunicação bidirecional, experiencias mostraram que nem sempre é possivel estabelecer uma conexão WebSocket, devido a proxies corporativos, firewall pessoal, softwares de antivirus...

Do ponto de vista do usuário, uma conexão WebSocket malsucedida pode ser traduzida em até 10 segundos de espera para que o aplicativo em tempo real comece a trocar dados. Isso **perceptivelmente** prejudica a experiência do usuário.

Para resumir, Engine.IO foca em confiabilidade e experiência do usuário em primeiro lugar, melhorias de UX potenciais marginais e aumentar o desempenho do servidor em segundo lugar.

Para atualizar, o cliente vai:

- certifique-se de que seu buffer de saída esteja vazio
-coloque o transporte atual em modo somente leitura
- tente estabelecer uma conexão com o outro transporte
- se for bem sucedido, feche o primeiro transporte

You can check in the Network Monitor of your browser:

![Successful upgrade](/images/network-monitor.png)

1. handshake (contém a sessão ID — aqui, `zBjrh...AAAK` — que é usada em uma requisição subsequente)
2. envio de daods (HTTP long-polling)
3. recebimento de dados (HTTP long-polling)
4. atualizações (WebSocket)
5. recebimento de dados (HTTP long-polling, fechado uma vez que a conexão WebSocket é 4. E estabelecido com sucesso)

### Detecção de disconexão {#disconnection-detection}

A conexão Engine.IO é considerada encerrada quando:

- um request HTTP (qualquer GET ou POST) falha (por exemplo, quando o servidor é desligado)
- a conexão do WebSocket é encerrada (por exemplo, quando o usuario uma aba em seu browser)
- `socket.disconnect()` é chamada no lado do servidor ou no lado do cliente.

Há também um mecanismo de heartbeat que verifica se a conexão entre o servidor e o cliente ainda está funcionando:

Em um determinado intervalo (o valor `pingInterval` enviado no handshake) o servidor envia um pacote PING e o cliente tem alguns segundos (o valor `pingTimeout`) para enviar um pacote PONG de volta. Se o servidor não receber um pacote PONG de volta, ele considerará que a conexão foi encerrada. Por outro lado, se o cliente não receber um pacote PING dentro de `pingInterval + pingTimeout`, ele considerará que a conexão foi encerrada.

Os motivos de disconexão são listados [aqui](../02-Server/server-socket-instance.md#disconnect) (lado do servidor) e [aqui](../03-Client/client-socket-instance.md#disconnect) (lado do cliente).


## Socket.IO {#socketio}

Socket.IO fornece alguns recursos adicionais sobre a conexão Engine.IO:

- Reconexão automatica
- [buffer de pacotes](../03-Client/client-offline-behavior.md#buffered-events)
- [acknowledgments](../04-Events/emitting-events.md#acknowledgements)
- transmissão [para todos os clientes](../04-Events/broadcasting-events.md) ou [um subconjunto de clientes](../04-Events/rooms.md) (que nós chamamos de "Room")
- [multiplexação](../06-Advanced/namespaces.md) (aue nós chamamos de "Namespace")

O código fonte pode ser encontrado aqui:

- servidor: https://github.com/socketio/socket.io
- cliente: https://github.com/socketio/socket.io-client
- parser: https://github.com/socketio/socket.io-parser
- descrição de protocolo: https://github.com/socketio/socket.io-protocol
