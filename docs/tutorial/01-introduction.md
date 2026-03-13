const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Staff member connected');

  // When a customer taps and clicks "Call Waiter"
  socket.on('customer_request', (data) => {
    // data = { table: 12, type: 'service' }
    io.emit('waiter_alert', data); 
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));
