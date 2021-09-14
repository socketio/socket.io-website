---
title: "Monthly update #2"
slug: /monthly-update-2/
authors: darrachequesne
---

Hi everyone!

Here's the #2 edition of our Monthly update. This is a new experiment, we will try to stick to this frequency in order to keep you updated of the work in progress and the directions the project is taking.

<!--truncate-->

So, what's new in the Socket.IO ecosystem?

## Socket.IO v3

As announced in the [previous](/blog/monthly-update-2/) monthly update, Socket.IO v3 has been released a few days ago.

This major version bump is mandated by several necessary changes in the Engine.IO protocol. You can find more information about these changes in the [Engine.IO v4 release notes](/blog/engine-io-4-release/).

You can find the release notes [here](/blog/socket-io-3-release/) and the migration guide [here](/docs/v3/migrating-from-2-x-to-3-0/).

Let's discuss about this release here: https://github.com/socketio/socket.io/discussions/3674

## Redis Adapter v6

Following the [release of Socket.IO v3.0.0](/blog/socket-io-3-release/), the Redis Adapter was updated and a new release is out: [6.0.0](https://github.com/socketio/socket.io-redis/releases/tag/6.0.0)

You can find the release notes [here](/blog/socket-io-redis-adapter-6-release/).

## Documentation

The documentation has always been a weak point of the project, leading to a lot of issues opened on GitHub and questions on StackOverflow.

Now that v3 is out, we will focus on this. The following pages have already been created:

- [Emitting events](/docs/v3/emitting-events/)
- [Broadcasting events](/docs/v3/broadcasting-events/)
- [The Socket instance / server-side](/docs/v3/server-socket-instance/)
- [Middlewares](/docs/v3/middlewares/)
- [Handling CORS](/docs/v3/handling-cors/)

If you find a typo, please open an issue here: https://github.com/socketio/socket.io-website

## Minor bumps

- [socket.io@3.0.3](https://github.com/socketio/socket.io/releases/tag/3.0.3) ([release notes](/blog/socket-io-3-release/))
  - [engine.io-parser@4.0.1](https://github.com/socketio/engine.io-parser/releases/tag/4.0.1) (included in `socket.io{% raw %}@{% endraw %}3.0.3`)
  - [engine.io@4.0.4](https://github.com/socketio/engine.io/releases/tag/4.0.4) (included in `socket.io{% raw %}@{% endraw %}3.0.3`)
  - [socket.io-parser@4.0.1](https://github.com/socketio/socket.io-parser/releases/tag/4.0.1) (included in `socket.io{% raw %}@{% endraw %}3.0.3`)

- [socket.io-client@3.0.3](https://github.com/socketio/socket.io-client/releases/tag/3.0.3)
  - [engine.io-parser@4.0.1](https://github.com/socketio/engine.io-parser/releases/tag/4.0.1) (included in `socket.io-client{% raw %}@{% endraw %}3.0.3`)
  - [engine.io-client@4.0.4](https://github.com/socketio/engine.io-client/releases/tag/4.0.4) (included in `socket.io-client{% raw %}@{% endraw %}3.0.3`)
  - [socket.io-parser@4.0.1](https://github.com/socketio/socket.io-parser/releases/tag/4.0.1) (included in `socket.io-client{% raw %}@{% endraw %}3.0.3`)

- [socket.io-redis@6.0.1](https://github.com/socketio/socket.io-redis/releases/tag/6.0.1)

- [socket.io-msgpack-parser@3.0.1](https://github.com/darrachequesne/socket.io-msgpack-parser/releases/tag/3.0.1)

More information about how to use those custom parsers can be found [here](https://github.com/socketio/socket.io/tree/master/examples/custom-parsers).

## What's next

- the client implementations in other languages will be updated as well

- a big focus on the documentation (additional code examples, extended guide, ...)

- additional tooling around Socket.IO

Stay safe!
