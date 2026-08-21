<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <title>Chat dos Amigos</title>
  <style>
    body {
      background-color: #222;
      color: #eee;
      font-family: 'Comic Sans MS';
      text-align: center;
    }
    #chat {
      max-width: 600px;
      margin: auto;
      border: 1px solid #555;
      padding: 10px;
      background-color: #333;
    }
    input, button {
      padding: 10px;
      margin: 5px;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>Chat dos Amigos 💬</h1>
  <div id="chat">
    <input id="nickname" placeholder="Apelido" />
    <div id="messages"></div>
    <input id="message" placeholder="Digite sua mensagem..." />
    <button onclick="sendMessage()">Enviar</button>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();
    const nicknameInput = document.getElementById('nickname');
    const messageInput = document.getElementById('message');
    const messagesDiv = document.getElementById('messages');

    function sendMessage() {
      const nickname = nicknameInput.value.trim();
      const message = messageInput.value.trim();
      if (nickname && message) {
        socket.emit('chat message', { nickname, message });
        messageInput.value = '';
      }
    }

    socket.on('chat message', (data) => {
      const msg = document.createElement('p');
      msg.textContent = `${data.nickname}: ${data.message}`;
      messagesDiv.appendChild(msg);
    });
  </script>
</body>
</html>
