const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = {};

// Serve HTML direct
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Mini GTA</title>
</head>
<body style="margin:0; overflow:hidden;">
<canvas id="game"></canvas>

<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = {};

socket.on("currentPlayers", data => players = data);
socket.on("newPlayer", data => players[data.id] = data.player);
socket.on("updatePlayers", data => players = data);

document.addEventListener("keydown", e => {
    let move = { x: 0, y: 0 };

    if (e.key === "w") move.y = -5;
    if (e.key === "s") move.y = 5;
    if (e.key === "a") move.x = -5;
    if (e.key === "d") move.x = 5;

    socket.emit("move", move);
});

function draw() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let id in players) {
        let p = players[id];
        ctx.fillStyle = (id === socket.id) ? "red" : "white";
        ctx.fillRect(p.x, p.y, 20, 20);
    }

    requestAnimationFrame(draw);
}

draw();
</script>
</body>
</html>
    `);
});

// Socket logic
io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    players[socket.id] = {
        x: Math.random() * 500,
        y: Math.random() * 500
    };

    socket.emit("currentPlayers", players);
    socket.broadcast.emit("newPlayer", {
        id: socket.id,
        player: players[socket.id]
    });

    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].x += data.x;
            players[socket.id].y += data.y;
        }
        io.emit("updatePlayers", players);
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

server.listen(3000, () => {
    console.log("👉 http://localhost:3000");
});
