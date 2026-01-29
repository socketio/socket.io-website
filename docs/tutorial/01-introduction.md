<!DOCTYPE html>
<html>
<head>
    <title>MeetingChitChat</title>
    <style>
        body { font-family: Arial; background:#f2f2f2; padding:20px; }
        #chatBox { width:100%; height:300px; background:white; border:1px solid #ccc; padding:10px; overflow-y:scroll; }
        #msg { width:80%; padding:10px; }
        #sendBtn { padding:10px 20px; }
    </style>
</head>
<body>

<h2>MeetingChitChat – Simple Chat</h2>

<div id="chatBox"></div>

<br>

<input id="msg" type="text" placeholder="Type a message...">
<button id="sendBtn">Send</button>

<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
<script src="script.js"></script>

</body>
</html> 
// Basic Node + Socket.io chat server

import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("."));

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("chatMessage", (msg) => {
        io.emit("chatMessage", msg);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
const socket = io();

const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");

sendBtn.onclick = () => {
    const message = msgInput.value.trim();
    if (message === "") return;

    socket.emit("chatMessage", message);
    msgInput.value = "";
};

socket.on("chatMessage", (message) => {
    chatBox.innerHTML += `<p>${message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
})js
npm init -y
npm install express socket.io
node server.js
http://localhost:3000
