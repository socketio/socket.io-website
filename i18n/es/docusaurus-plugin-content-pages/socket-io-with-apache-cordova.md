---
title: Apache Cordova
---

Dado que las aplicaciones de Apache Cordova están escritas principalmente en JS, ¡es realmente fácil usar Socket.IO! Vamos a recorrer un pequeño ejemplo.

Primero preparamos un servidor simple:

```js
var server = require('http').createServer();
var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {
    console.log('socket conectado');

    socket.on('disconnect', function () {
        console.log('socket desconectado');
    });

    socket.emit('text', 'wow. qué evento. muy tiempo real.');
});

server.listen(3000);
```

Este servidor simplemente escuchará conexiones de clientes Socket.IO, y emitirá algo de texto a través de un evento `text`.

Ahora vayamos al punto. Queremos comenzar creando un nuevo proyecto Cordova para empezar a modificar. Empecemos desde cero.

Ejecutando

```
npm install -g cordova
```

se instalará la herramienta cli de Cordova que usamos para crear proyectos, instalar/eliminar dependencias, y lanzar nuestro emulador entre otras cosas.

```
cordova create socket.io-example socket.io.example socket.io-example
```

creará una nueva plantilla de proyecto para que empecemos a modificar. Siéntete libre de explorar la carpeta recién creada, llamada `socket.io-example` y echar un vistazo a algunos de los archivos creados.

Ahora deberías estar en la carpeta del proyecto. Si aún no has navegado hasta allí en la línea de comandos, hazlo ahora con `cd socket.io-example`.

Como estoy desarrollando este ejemplo en OS X, voy a compilar para iOS. Podrías hacerlo de manera similar para Android. Para añadir el objetivo de compilación, ejecuta lo siguiente:

```
cordova platform add ios
```

A continuación queremos compilar todos los componentes nativos. Podemos hacer esto ejecutando

```
cordova build ios
```

Ahora ejecutemos la aplicación de plantilla para ver que todo está funcionando. Si estás en OS X, puedes instalar el emulador de iOS así

```
brew install ios-sim
```

Deberías ver el emulador abrirse con algo como esto cuando ejecutes `cordova emulate ios`:

<img src="https://cloudup.com/cKoYEzCeKKY+" alt="null" />

Ahora que ves todo funcionando con la configuración actual, empecemos a escribir algo de código. Abre `www/index.html` en el directorio de tu proyecto. Debería verse algo así:

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

Para empezar, necesitamos obtener el script del cliente Socket.IO. Podemos tomarlo del CDN así:

```html
<script type="text/javascript" src="cordova.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
<script type="text/javascript" src="js/index.js"></script>
```

Ahora para añadir la lógica real, escribamos cosas debajo de la llamada `app.initialize`. Podemos querer asegurarnos de que el dispositivo ha cargado la aplicación antes de ejecutar cualquier código nuestro. Podemos hacer esto así:

```html
<script type="text/javascript">
  app.initialize();

  document.addEventListener('deviceready', function() {
    // el código va aquí
  });
</script>
```

Este evento se disparará cuando la aplicación se haya cargado completamente. Para añadir algo de lógica real, solo necesitamos llenar esa función. Hagamos algo que reciba los datos emitidos por nuestro servidor al conectar el socket, y muestre una caja de notificación para mostrar ese texto. Esto es lo que podrías hacer:

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

Ejecutemos el emulador de nuevo con `cordova emulate ios`, y esto es lo que deberías ver:

<img src="https://cloudup.com/cuIaVMrmcyP+" alt="null" />

¡Eso es todo! ¡Espero que esto te ayude a empezar! ¡Diviértete programando!
