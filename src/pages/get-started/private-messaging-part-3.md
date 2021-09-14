---
title: Private messaging - Part III
---

# Private messaging - Part III

This guide has four distinct parts:

- [Part I](/get-started/private-messaging-part-1/): initial implementation
- [Part II](/get-started/private-messaging-part-2/) : persistent user ID
- Part III **(current)**: persistent messages
- [Part IV](/get-started/private-messaging-part-4/): scaling up

Here's where we were at the end of the [2nd part](/get-started/private-messaging-part-2/):

<img src="/images/private-messaging-part-2-chat.gif" alt="Chat (v2)" />

All is working pretty well, but there is a last issue which is quite annoying:

- when the sender gets disconnected, all the packets it sends are [buffered](/docs/v4/client-offline-behavior/#Buffered-events) until reconnection (which is great in this case)

<img src="/images/private-messaging-part-2-sender-offline.gif" alt="Chat with sender that gets disconnected" />

- but when the recipient gets disconnected, the packets are lost, since there is no listening Socket instance in the given room

<img src="/images/private-messaging-part-2-recipient-offline.gif" alt="Chat with recipient that gets disconnected" />

There are multiple solutions to this problem, and we will go for the easiest to implement: store all the messages on the server-side.

Note: this 3rd part will be brief, but it underlines an important property of Socket.IO: you cannot rely on the status of the connection. It should be up most of the time but there is a myriad of things that can kill a TCP connection (this is particularly true on mobile browsers).

## Installation

Let's checkout the branch for part III:

```
git checkout examples/private-messaging-part-3
```

Here's what you should see in the current directory:

```
├── babel.config.js
├── package.json
├── public
│   ├── favicon.ico
│   ├── fonts
│   │   └── Lato-Regular.ttf
│   └── index.html
├── README.md
├── server
│   ├── index.js (updated)
│   ├── messageStore.js (created)
│   ├── package.json
│   └── sessionStore.js
└── src
    ├── App.vue
    ├── components
    │   ├── Chat.vue (updated)
    │   ├── MessagePanel.vue
    │   ├── SelectUsername.vue
    │   ├── StatusIcon.vue
    │   └── User.vue
    ├── main.js
    └── socket.js
```

The complete diff can be found [here](https://github.com/socketio/socket.io/compare/examples/private-messaging-part-2...examples/private-messaging-part-3).

## How it works

### Persistent messages

On the server-side (`server/index.js`), we now persist the message in our new store:

```js
io.on("connection", (socket) => {
  // ...
  socket.on("private message", ({ content, to }) => {
    const message = {
      content,
      from: socket.userID,
      to,
    };
    socket.to(to).to(socket.userID).emit("private message", message);
    messageStore.saveMessage(message);
  });
  // ...
});
```

And we fetch the list of messages upon connection:

```js
io.on("connection", (socket) => {
  // ...
  const users = [];
  const messagesPerUser = new Map();
  messageStore.findMessagesForUser(socket.userID).forEach((message) => {
    const { from, to } = message;
    const otherUser = socket.userID === from ? to : from;
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message]);
    }
  });
  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
      messages: messagesPerUser.get(session.userID) || [],
    });
  });
  socket.emit("users", users);
  // ...
});
```

The code is quite straightforward. We shouldn't lose messages upon disconnection anymore:

<img src="/images/private-messaging-part-3-chat.gif" alt="Chat (v3)" />

## Review

Now that we have a functional chat, we will see in the [4th part](/get-started/private-messaging-part-4/) of this guide how to scale to multiple Socket.IO servers.

Thanks for reading!
