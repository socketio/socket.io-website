---
title: FAQ
sidebar_position: 1
slug: /faq/
---

import TOCInline from '@theme/TOCInline';

Here is a list of common questions about Socket.IO:

<TOCInline toc={toc} />

## Something does not work properly, please help?

Please check the [Troubleshooting guide](../01-Documentation/troubleshooting.md).

## How does it work under the hood?

The Socket.IO connection can be established with different low-level transports:

- HTTP long-polling
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)

Socket.IO will automatically pick the best available option, depending on:

- the capabilities of the browser (see [here](https://caniuse.com/websockets) and [here](https://caniuse.com/webtransport))
- the network (some networks block WebSocket and/or WebTransport connections)

You can find more detail about that in the ["How it works" section](../01-Documentation/how-it-works.md).

## What are the features provided by Socket.IO over plain WebSocket?

WebSockets are awesome! No, really. They provide an efficient way for transferring data between a client and a server. Among the advantages:

- you don't need to rely on periodic polling to fetch data from the server
- you don't need to repeatedly send all the HTTP headers when sending data to the server

Which make them perfect for low-latency and data-intensive applications like games, chats, collaborative solutions...

That being said, WebSockets are also pretty low-level and developing a realtime applications with WebSockets often requires an additional layer over them:

- fallback to HTTP long-polling, in case the WebSocket connection can't be established
- automatic reconnection, in case the WebSocket connection gets closed
- acknowledgements, to send some data and expect a response from the other side
- broadcast to all or to a subset of connected clients
- scale up to multiple instances of the server
- connection recovery, for short periods of disconnection

As you might have guessed, this additional layer is implemented by the Socket.IO library.

## What is WebTransport?

In short, WebTransport is an alternative to WebSocket which fixes several performance issues that plague WebSockets like [head-of-line blocking](https://en.wikipedia.org/wiki/Head-of-line_blocking).

If you want more information about this new web API (which was included in Chrome in January 2022 and in Firefox in June 2023), please check those links:

- https://w3c.github.io/webtransport/
- https://developer.mozilla.org/en-US/docs/Web/API/WebTransport
- https://developer.chrome.com/articles/webtransport/

:::note

Support for WebTransport is not enabled by default in Socket.IO, as it requires a secure context (HTTPS). Please check the [dedicated tutorial](/get-started/webtransport) if you want to play with WebTransport.

:::

## Does Socket.IO store the messages?

The Socket.IO server does not store any message.

It is the duty of your application to persist those messages *somewhere* for the clients that are not currently connected.

:::tip

That being said, Socket.IO will store the messages for a brief period of time if you enable the [Connection state recovery feature](../01-Documentation/connection-state-recovery.md).

:::

## What are the delivery guarantees of Socket.IO?

Socket.IO **does guarantee message ordering**, no matter which low-level transport is used (even when switching between two transports).

Moreover, by default Socket.IO provides an **at most once** guarantee of delivery (also known as "fire and forget"), which means that under certain circumstances a message might get lost and no retry will be attempted.

More information about this [here](../01-Documentation/delivery-guarantees.md).

## How to identify a given user?

There is no concept of user in Socket.IO.

It is the duty of your application to link a given Socket.IO connection to a user account.

For Node.js applications, you can for example:

- reuse the user context provided by [Passport](https://www.passportjs.org/) (check [this tutorial](/how-to/use-with-express-session))
- or use the [`auth`](../../client-options.md#auth) option on the client side to send the user credentials and validate them in a [middleware](../02-Server/middlewares.md)

## Where can I find the changelog?

Please see [here](../../changelog/index.md).
