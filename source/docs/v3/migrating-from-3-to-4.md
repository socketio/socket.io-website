title: Migrating from 3.x to 4.0
permalink: /docs/v3/migrating-from-3-x-to-4-0/
alias: /docs/migrating-from-3-x-to-4-0/
release: v3
type: docs
order: 502
---

The 4.0.0 release adds quite a lot of new features, which are detailed [below](#New-features), but it also contains a few API breaking changes (hence the major bump).

Please note that these breaking changes only impact the API on the server side. The Socket.IO protocol itself was not updated, so a v3 client **will** be able to reach a v4 server and vice-versa. Besides, the compatibility mode ([`allowEIO3: true`](/docs/v3/server-initialization/#allowEIO3)) is still available between a Socket.IO v2 client and a Socket.IO v4 server.

Here is the complete list of changes:

- [Breaking changes](#Breaking-changes)
  - [`io.to()` is now immutable](#io-to-is-now-immutable)
  - [`wsEngine` option](#wsEngine-option)
- [New features](#New-features) (WIP)

### Breaking changes

#### `io.to()` is now immutable

Previously, broadcasting to a given room (by calling `io.to()`) would mutate the io instance, which could lead to surprising behaviors, like:

```js
io.to("room1");
io.to("room2").emit(/* ... */); // also sent to room1

// or with async/await
io.to("room3").emit("details", await fetchDetails()); // random behavior: maybe in room3, maybe to all clients
```

Calling `io.to()` (or any other broadcast modifier) will now return an immutable instance.

#### `wsEngine` option

The format of the [`wsEngine`](/docs/v3/server-initialization/#wsEngine) option was updated in order to get rid of the following error:

`Critical dependency: the request of a dependency is an expression`

when bundling the server with webpack.

Before:

```js
const io = require("socket.io")(httpServer, {
  wsEngine: "eiows"
});
```

After:

```js
const io = require("socket.io")(httpServer, {
  wsEngine: require("eiows").Server
});
```

### New features

(WIP)
