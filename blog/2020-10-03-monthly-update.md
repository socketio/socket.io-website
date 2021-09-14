---
title: "Monthly update #1"
slug: /monthly-update-1/
authors: darrachequesne
---

Hi everyone!

Here's the #1 edition of our Monthly update. This is a new experiment, we will try to stick to this frequency in order to keep you updated of the work that is in progress and the directions the project is taking.

<!--truncate-->

So, what's new in the Socket.IO ecosystem?

## Socket.IO v3 (WIP)

The work on Socket.IO v3 has started (let's be honest and not say resumed).

This major version bump is mandated by several necessary changes in the Engine.IO protocol. You can find more information about these changes in the [Engine.IO v4 release notes](/blog/engine-io-4-release/).

It mostly impacts the way packets are encoded when sent over the wire (in the request/response body in case of HTTP long-polling, or in the WebSocket frames), so the public API of Socket.IO should not be impacted that much.

We will also take advantage of this new version to migrate the codebase to Typescript, so the typings which are currently hosted in the [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) will now always be in sync with the actual code.

You can follow the progress [here](https://github.com/socketio/socket.io/projects/2).

If you have any feedback/feature that you would like to see included, please comment [here](https://github.com/socketio/socket.io/issues/3250).

## Engine.IO v4

As part of the work towards Socket v3, Engine.IO v4 has been released.

The list of breaking changes can be found in the [release notes](/blog/engine-io-4-release/).

## Protocol documentation

The documentation of the [Engine.IO](https://github.com/socketio/engine.io-protocol) and the [Socket.IO](https://github.com/socketio/socket.io-protocol) protocols has been edited with additional details/examples.

This should help greatly when implementing a client in another programming language.

If you find that something is not clear/is missing, please open an issue in the repository.

For reference, here's the current list of clients in other languages:

- Java: https://github.com/socketio/socket.io-client-java
- C++: https://github.com/socketio/socket.io-client-cpp
- Swift: https://github.com/socketio/socket.io-client-swift
- Dart: https://github.com/rikulo/socket.io-client-dart
- Python: https://github.com/miguelgrinberg/python-socketio
- .Net: https://github.com/Quobject/SocketIoClientDotNet


## GitHub discussions

The project is now part of the beta of Github Discussions. Depending on the feedback of the community, it might replace the Slack channel in the future.

So, let's [discuss](https://github.com/socketio/socket.io/discussions)!

## Minor bumps

- [socket.io-client@2.3.1](https://github.com/socketio/socket.io-client/releases/tag/2.3.1) ([release notes](/blog/socket-io-2-3-1/))
  - [engine.io-parser@2.2.1](https://github.com/socketio/engine.io-parser/releases/tag/2.2.1) (included in `socket.io-client{% raw %}@{% endraw %}2.3.1`)
  - [engine.io-client@3.4.4](https://github.com/socketio/engine.io-client/releases/tag/3.4.4) (included in `socket.io-client{% raw %}@{% endraw %}2.3.1`)
  - [socket.io-parser@3.3.1](https://github.com/socketio/socket.io-parser/releases/tag/3.3.1) (included in `socket.io-client{% raw %}@{% endraw %}2.3.1`)

- [socket.io-json-parser@2.1.1](https://github.com/darrachequesne/socket.io-json-parser/releases/tag/2.1.1)
- [socket.io-msgpack-parser@2.2.1](https://github.com/darrachequesne/socket.io-msgpack-parser/releases/tag/2.2.1)

More information about how to use those custom parsers can be found [here](https://github.com/socketio/socket.io/tree/master/examples/custom-parsers).

## Going forward

As announced at the bottom of the Engine.IO v4 [release notes](/blog/engine-io-4-release/#What’s-next), I ([@darrachequesne](https://github.com/darrachequesne/)) am now dedicated full time to the project since the beginning of September. This wouldn't be possible without our [sponsors](https://opencollective.com/socketio/#section-contributors), so again, a big thanks to them!


Stay safe!
