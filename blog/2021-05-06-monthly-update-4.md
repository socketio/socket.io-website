---
title: "Monthly update #4"
slug: /monthly-update-4/
authors: darrachequesne
---

Hi everyone!

Here's the #4 edition of our Monthly update.

<!--truncate-->

So, what's new in the Socket.IO ecosystem?

- [A new Admin UI](#A-new-Admin-UI)
- [A new guide](#A-new-guide)
- [Version updates](#Version-updates)
- [What's next](#What’s-next)

## A new Admin UI

Following our focus on tooling, we have published a first release of the Socket.IO Admin UI:

![admin UI screenshot](/images/admin-ui-dashboard.png)

This Admin UI is meant to give you an overview of your Socket.IO deployment.

Here is the list of the current features:

- overview of the servers and the clients that are currently connected
- details of each socket instance (active transport, handshake, rooms, ...)
- details of each room
- administrative operations (join, leave, disconnect)

And the features which will be added in the near future:

- overview of the number of packets/bytes sent and received per second
- emitting an event to all clients, a room or a particular Socket instance

The installation steps can be found [here](/docs/v4/admin-ui/).

The source code can be found here: https://github.com/socketio/socket.io-admin-ui/

If you have any feedback / suggestions, do not hesitate!

Please note that the Admin UI does support a cluster of several Socket.IO servers too.

## A new guide

We have added a new guide ([here](/get-started/basic-crud-application/)), using Socket.IO to create a basic CRUD application.

![Video of the application in action](/images/basic-crud-app.gif)

## Version updates

- [socket.io@4.0.2](https://github.com/socketio/socket.io/releases/tag/4.0.2)
- [socket.io-client@4.0.2](https://github.com/socketio/socket.io-client/releases/tag/4.0.2)

## What's next

- a continuous focus on the documentation (additional code examples, extended guide, ...)
- additional tooling around Socket.IO

Happy coding!
