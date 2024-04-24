
```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
let gameData = {
  players: []
};
io.on('connection', (socket) => {
  console.log('A new player has connected');
  socket.emit('gameState', gameData);
  socket.on('move', (direction) => {
    // ... socket.broadcast.emit('gameState', gameData);
  });
  socket.on('disconnect', () => {
    console.log('A player has disconnected');  socket.broadcast.emit('gameState', gameData);
  });
});
