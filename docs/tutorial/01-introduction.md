---mangodeer-mabar/
├─ server/
│  └─ server.js
├─ public/
│  ├─ index.html        (lobi + entry)
│  ├─ lobby.js          (lobby UI & socket)
│  ├─ game.html         (game canvas page)
│  ├─ game.js           (phaser client + room support)
│  ├─ phaser.min.js
│  └─ assets/
│     ├─ ... sprites ...
└─ package.jsonserver.jsindex.htmllobby.jsgame.htmlgame.jsphaser.min.js// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + '/../public'));

// Room model
// rooms: { roomId: { id, mode, players: [socketId,...], maxPlayers, state: 'waiting'|'playing' } }
const rooms = {};
const TICK = 60; // ms

// Simple players store (authoritative state)
const players = {}; // { socketId: { x,y,vx,vy,facing,hp,roomId,anim } }

function createRoom(mode) {
  const id = 'room-' + Math.random().toString(36).slice(2,9);
  const maxPlayers = mode === '1v1' ? 2 : 4;
  rooms[id] = { id, mode, players: [], maxPlayers, state: 'waiting' };
  return rooms[id];
}

io.on('connection', socket => {
  console.log('conn', socket.id);
  // send current rooms list
  socket.emit('lobby:rooms', Object.values(rooms).map(r => ({
    id: r.id, mode: r.mode, players: r.players.length, maxPlayers: r.maxPlayers, state: r.state
  })));

  // Create room
  socket.on('lobby:create', (mode, cb) => {
    if (!['1v1','2v2'].includes(mode)) return cb && cb({ ok:false, err:'bad-mode' });
    const room = createRoom(mode);
    console.log('room created', room.id, mode);
    io.emit('lobby:rooms', Object.values(rooms).map(r => ({
      id: r.id, mode: r.mode, players: r.players.length, maxPlayers: r.maxPlayers, state: r.state
    })));
    cb && cb({ ok:true, roomId: room.id });
  });

  // Join room
  socket.on('lobby:join', (roomId, cb) => {
    const room = rooms[roomId];
    if (!room) return cb && cb({ ok:false, err:'no-room' });
    if (room.players.length >= room.maxPlayers) return cb && cb({ ok:false, err:'full' });

    // add to room
    room.players.push(socket.id);
    socket.join(roomId);
    players[socket.id] = {
      x: 200 + Math.random()*200,
      y: 300,
      vx: 0, vy: 0,
      facing: 'right',
      hp: 100,
      anim: 'idle',
      roomId
    };
    console.log(`${socket.id} joined ${roomId}`);

    // notify room members
    io.to(roomId).emit('room:update', {
      id: room.id, players: room.players.slice(), maxPlayers: room.maxPlayers, mode: room.mode, state: room.state
    });
    io.emit('lobby:rooms', Object.values(rooms).map(r => ({
      id: r.id, mode: r.mode, players: r.players.length, maxPlayers: r.maxPlayers, state: r.state
    })));

    // auto-start when full
    if (room.players.length === room.maxPlayers) {
      room.state = 'playing';
      // announce start
      io.to(roomId).emit('room:start', { roomId: room.id, serverTick: Date.now() });
      console.log('room started', roomId);
    }

    cb && cb({ ok:true, roomId: room.id });
  });

  // Leave room
  socket.on('lobby:leave', (roomId, cb) => {
    const room = rooms[roomId];
    if (!room) return cb && cb({ ok:false, err:'no-room' });
    const idx = room.players.indexOf(socket.id);
    if (idx !== -1) room.players.splice(idx,1);
    socket.leave(roomId);
    if (players[socket.id]) delete players[socket.id];
    // if empty, delete room
    if (room.players.length === 0) {
      delete rooms[roomId];
    } else {
      room.state = 'waiting';
      io.to(roomId).emit('room:update', {
        id: room.id, players: room.players.slice(), maxPlayers: room.maxPlayers, mode: room.mode, state: room.state
      });
    }
    io.emit('lobby:rooms', Object.values(rooms).map(r => ({
      id: r.id, mode: r.mode, players: r.players.length, maxPlayers: r.maxPlayers, state: r.state
    })));
    cb && cb({ ok:true });
  });

  // client input (per-room) — minimal
  socket.on('input', data => {
    const p = players[socket.id];
    if (!p) return;
    // store last input on server-side for tick processing
    p.pendingInput = data; // { left, right, up, attack, timestamp }
  });

  socket.on('disconnect', () => {
    console.log('disc', socket.id);
    const p = players[socket.id];
    if (p && p.roomId) {
      const room = rooms[p.roomId];
      if (room) {
        const idx = room.players.indexOf(socket.id);
        if (idx !== -1) room.players.splice(idx,1);
        io.to(room.id).emit('room:update', {
          id: room.id, players: room.players.slice(), maxPlayers: room.maxPlayers, mode: room.mode, state: room.state
        });
        if (room.players.length === 0) delete rooms[room.id];
        else room.state = 'waiting';
      }
    }
    delete players[socket.id];
    io.emit('lobby:rooms', Object.values(rooms).map(r => ({
      id: r.id, mode: r.mode, players: r.players.length, maxPlayers: r.maxPlayers, state: r.state
    })));
  });
});

// physics & state tick per-room
setInterval(() => {
  // iterate rooms in playing state
  for (const roomId in rooms) {
    const room = rooms[roomId];
    if (room.state !== 'playing') continue;

    // step players that are in that room
    const dt = TICK/1000;
    // apply inputs
    for (const sid of room.players) {
      const p = players[sid];
      if (!p) continue;
      const inData = p.pendingInput || {};
      // movement
      const speed = 200;
      p.vx = (inData.left ? -speed : 0) + (inData.right ? speed : 0);
      if (p.vx < 0) p.facing = 'left'; else if (p.vx > 0) p.facing = 'right';
      // jump
      if (inData.up && Math.abs(p.vy) < 0.1) p.vy = -380;
      // simple attack handling
      if (inData.attack) {
        // mark as attack to show on client
        p.anim = 'attack';
        for (const sid2 of room.players) {
          if (sid2 === sid) continue;
          const q = players[ssocket.id2r.stater.id200room.idroom.stateio.top.pendingInputnowp.facingp.vxp.animp.vyq.hp7012000<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>MangoDeer Mabar — Lobby</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;margin:20px;}
    #rooms { margin-top: 12px; }
    .room { padding:8px;border:1px solid #ddd;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;}
    button { margin-left:8px;}
  </style>
</head>
<body>
  <h2>Mangodeer Mabar — Lobi</h2>
  <div>
    Buat bilik:
    <button id="create1v1">Create 1v1</button>
    <button id="create2v2">Create 2v2</button>
  </div>

  <div id="rooms"><em>Loading rooms...</em></div>

  <script src="/socket.io/socket.io.js"></script>
  <script src="lobby.js"></script>
</body>
</html>process.env.PORTsocket.io/socket.io.jsconst socket = io();
const roomsDiv = document.getElementById('rooms');

function renderRooms(list) {
  if (!list || list.length === 0) {
    roomsDiv.innerHTML = '<em>No rooms yet.</em>';
    return;
  }
  roomsDiv.innerHTML = '';
  list.forEach(r => {
    const div = document.createElement('div');
    div.className = 'room';
    div.innerHTML = `<div>
      <strong>${r.id}</strong> — ${r.mode} — ${r.players}/${r.maxPlayers} — ${r.state}
    </div>`;
    const controls = document.createElement('div');
    const joinBtn = document.createElement('button');
    joinBtn.textContent = 'Join';
    joinBtn.disabled = r.players >= r.maxPlayers || r.state !== 'waiting';
    joinBtn.onclick = () => {
      socket.emit('lobby:join', r.id, (res) => {
        if (res && res.ok) {
          // open game page with room param
          location.href = `game.html?room=${r.id}`;
        } else {
          alert('Gagal join: ' + (res.err||''));
        }
      });
    };
    controls.appendChild(joinBtn);
    div.appendChild(controls);
    roomsDiv.appendChild(div);
  });
}

socket.on('lobby:rooms', (list) => {
  renderRooms(list);
});

document.getElementById('create1v1').onclick = () => {
  socket.emit('lobby:create', '1v1', (res) => {
    if (res.ok) {
      location.href = `game.html?room=${res.roomId}`;
    } else alert('Gagal create: '+(res.err||''));
  });
};
document.getElementById('create2v2').onclick = () => {
  socket.emit('lobby:create', '2v2', (res) => {
    if (res.ok) location.href = `game.html?room=${res.roomId}`;
    else alert('Gagal create: '+(res.err||''));
  });
};list.lengthdiv.classNameroomsDiv.innerHTMLdiv.innerHTMLjoinBtn.textContentjoinBtn.disabledr.playersr.maxPlayersjoinBtn.onclicklocation.href<!doctype html>
<html>
<head><meta charset="utf-8"/><title>Game</title></head>
<body style="margin:0;">
  <div id="ui" style="position:fixed;left:10px;top:10px;z-index:50;background:rgba(255,255,255,0.8);padding:6px;border-radius:6px;">
    <button id="leave">Leave Room</button>
    <span id="roomInfo"></span>
  </div>

  <script src="phaser.min.js"></script>
  <script src="/socket.io/socket.io.js"></script>
  <script src="game.js"></script>
</body>
</html>id2];
          if (!q) continue;
          const dx = Math.abs(q.x - p.x);
          const dy = Math.abs(q.y - p.y);
          if (dx < 70 && dy < 50) {
            q.hp -= 30;
            if (q.hp < 0) q.hp = 0;
          }
        }
      } else {
        p.anim = Math.abs(p.vx) > 0 ? 'run' : 'idle';
      }
    }

    // integrate motion & gravity & ground
    for (const sid of room.players) {
      const p = players[sid];
      if (!p) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 1200 * dt; // gravity
      if (p.y > 300) { p.y = 300; p.vy = 0; }
      // bounds
      if (p.x < 0) p.x = 0;
      if (p.x > 760) p.x = 760;
    }

    // broadcast state snapshot for this room only
    const snapshot = {};
    for (const sid of room.players) {
      snapshot[sid] = {
        x: Math.round(players[sid].x),
        y: Math.round(players[sid].y),
        facing: players[sid].facing,
        hp: players[sid].hp,
        anim: players[sid].anim
      };
    }
    io.to(roomId).emit('state:sync', snapshot);
  }
}, TICK);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on', PORT));
title: Tutorial - Introduction
sidebar_label: Introduction
slug: introduction
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting started

Welcome to the Socket.IO tutorial!

In this tutorial we'll create a basic chat application. It requires almost no basic prior knowledge of Node.JS or Socket.IO, so it’s ideal for users of all knowledge levels.

## Introduction

Writing a chat application with popular web applications stacks like LAMP (PHP) has normally been very hard. It involves polling the server for changes, keeping track of timestamps, and it’s a lot slower than it should be.

Sockets have traditionally been the solution around which most real-time chat systems are architected, providing a bi-directional communication channel between a client and a server.

This means that the server can *push* messages to clients. Whenever you write a chat message, the idea is that the server will get it and push it to all other connected clients.

## How to use this tutorial

### Tooling

Any text editor (from a basic text editor to a complete IDE such as [VS Code](https://code.visualstudio.com/)) should be sufficient to complete this tutorial.

Additionally, at the end of each step you will find a link to some online platforms ([CodeSandbox](https://codesandbox.io) and [StackBlitz](https://stackblitz.com), namely), allowing you to run the code directly from your browser:

![Screenshot of the CodeSandbox platform](/images/codesandbox.png)

### Syntax settings

In the Node.js world, there are two ways to import modules:

- the standard way: ECMAScript modules (or ESM)

```js
import { Server } from "socket.io";
```

Reference: https://nodejs.org/api/esm.html

- the legacy way: CommonJS

```js
const { Server } = require("socket.io");
```

Reference: https://nodejs.org/api/modules.html

Socket.IO supports both syntax. 

:::tip

We recommend using the ESM syntax in your project, though this might not always be feasible due to some packages not supporting this syntax.

:::

For your convenience, throughout the tutorial, each code block allows you to select your preferred syntax:

<Tabs groupId="lang">
  <TabItem value="cjs" label="CommonJS" default>

```js
const { Server } = require("socket.io");
```

  </TabItem>
  <TabItem value="mjs" label="ES modules">

```js
import { Server } from "socket.io";
```

  </TabItem>
</Tabs>


Ready? Click "Next" to get started.
