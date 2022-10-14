---
title: Apache Cordova
---

Atualmente os aplicativos Apache Cordova são escritos principalmente em JS, é realmente muito fácil usar o Socket.IO! Vamo&#8217;s percorrer um pequeno exemplo.

Primeiro nós preparamos um servidor simples:

```js
var server = require('http').createServer();
var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {
    console.log('socket connected');

    socket.on('disconnect', function () {
        console.log('socket disconnected');
    });

    socket.emit('text', 'wow. such event. very real time.');
});

server.listen(3000);
```
Esté servidor irá simplesmente chamar as conexões do Socket.IO Client e irá emitir um texto para quando tem um evento chamado`text`.

Agora Vamos Pegar atê esse ponto. Queremos começar criando um novo projeto Cordova para começar a modificar. Vamos começar do zero.

Execute

```
npm install -g cordova
```
Quando instalamos a ferramenta Cordova cli, nós podemos criar nossos projetos, instalar/remover dependencias, e lançar nosso emulador entre outras coisas.

```
cordova create socket.io-example socket.io.example socket.io-example
```

Iremos fazer um nove projeto com template para começarmos a modifica-lo. sinta-se livre para explorar a pastas recém-criada, chamada `socket.io-example` e pegue para dar uma olhada em alguns dos arquivos criados.

Você deve agora estar na pasta do projeto. Se você ainda não navagou na linha de comando, faça agora com `cd socket.io-example`.

Já que estou desenvolvendo esse exemplo em OS X, irei agora buildar para IOS. Você pode fazer similar para Android. Para adicionar a  build target, rode o seguinte:


```
cordova platform add ios
```
Se Depois quisermos buildar para componentes nativos. Nós podemos fazer isso rodando:

```
cordova build ios
```

Agora vamos realmente rodar o template da aplicação para ver se tudo está funcionando. Se você tem o OS X, você pode instalar o emulador IOS assim: 

```
brew install ios-sim
```
Você pode ver o emulador aberto com algo assim  ao executar `cordova emulate ios`:

<img src="https://cloudup.com/cKoYEzCeKKY+" alt="null" />

Agora você pode ver tudo funcionando com o seu atual setup, vamos começar escrevendo alguns codigos. Abre o `www/index.html` no diretório do seu projeto. Deve ser algo assim:

```html
<!DOCTYPE html>
<!--
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
-->
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="format-detection" content="telephone=no" />
        <!-- WARNING: for iOS 7, remove the width=device-width and height=device-height attributes. See https://issues.apache.org/jira/browse/CB-4323 -->
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" />
        <link rel="stylesheet" type="text/css" href="css/index.css" />
        <meta name="msapplication-tap-highlight" content="no" />
        <title>Hello World</title>
    </head>
    <body>
        <div class="app">
            <h1>Apache Cordova</h1>
            <div id="deviceready" class="blink">
                <p class="event listening">Connecting to Device</p>
                <p class="event received">Device is Ready</p>
            </div>
        </div>
        <script type="text/javascript" src="cordova.js"></script>
        <script type="text/javascript" src="js/index.js"></script>
        <script type="text/javascript">
            app.initialize();
        </script>
    </body>
</html>
```

Para começarmos, nós precisamos obter o Socket.IO-client script. Nós podemos pegar ele por via CDN assim:

```html
<script type="text/javascript" src="cordova.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
<script type="text/javascript" src="js/index.js"></script>
```

Agora adicionaremos uma logíca, vamos escrever algumas coisas abaixo da chamada `app.initialize`. Podemos querer ter certeza de que o dispositivo carregou o aplicativo antes de executar qualquer código nosso. Podemos fazer assim:

```html
<script type="text/javascript">
  app.initialize();

  document.addEventListener('deviceready', function() {
    // code goes here
  });
</script>
```
Este evento vai disparar quando a aplicação estiver totalmente carregado. Para adicionar alguma logíca real, nós apenas precisamos preencher está função. Vamos fazer com que ela receba os dados emitidos pelo nosso servidor na conexão do socket, e trazer uma caixa de noticação para mostrar um texto. Aqui está o que você pode fazer:

```html
<script type="text/javascript">
  app.initialize();

  document.addEventListener('deviceready', function() {
    socket.on('connect', function() {
      socket.on('text', function(text) {
        alert(text);
       });
     });
  });
</script>
```

Vamos rodar o emulador novamente com `cordova emulate ios`, e aqui está o que devemos ver:

<img src="https://cloudup.com/cuIaVMrmcyP+" alt="null" />

E é isso! Eu espero que isso ajude você com seu inicio! Divirta-se hackeando!
