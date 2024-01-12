---
title: Chat platform
slug: /chat-platform/
authors:
  - darrachequesne
---

Hello everyone!

A new sample project is available: the **Chat platform**.

The source code can be found [here](https://github.com/socketio/socket.io-chat-platform).

<!--truncate-->

:::note for newcomers

Socket.IO is a library that enables low-latency, bidirectional and event-based communication between a client and a server.

To achieve this, it automatically selects the best available low-level transport between [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API), [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) and HTTP long-polling, based on the capabilities of the client platform and the network.

:::

## Goal

The goal of this project is to provide a full-blown project based on Socket.IO with:

- authentication/user registration
- public and private messaging
- proper reconnection management
- presence management

The source code is provided with a permissive MIT license, so that you can use it/extend it to your will.

## How to use

Check out the code [here](https://github.com/socketio/socket.io-chat-platform) and follow the instructions in the README.

## Features

### Channel-based messages

![Screenshot of a public channel](/images/channel_based_messages.png)

### Private messages

![Screenshot of a private channel](/images/private_messages.png)

## Tools

### Server

The server is written in plain JavaScript, with the [`express`](https://expressjs.com/), `express-session` and [`passport`](https://www.passportjs.org/) packages. The database is [PostgreSQL](https://www.postgresql.org/).

### Client

The client is a [Vue.js](https://vuejs.org/) single-page application, with the [`vue-router`](https://router.vuejs.org/) and [`pinia`](https://pinia.vuejs.org/) packages. It uses [Bootstrap v5](https://getbootstrap.com/) for the styles.

## Roadmap

- React client ([link](https://github.com/socketio/socket.io-chat-platform/issues/1))
- MongoDB server ([link](https://github.com/socketio/socket.io-chat-platform/issues/2))

Any additional suggestion is welcome!
