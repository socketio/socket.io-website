title: Connection lifecycle
permalink: /docs/client-connection-lifecycle/
type: docs
order: 301
---

## Connection status

On the client-side, the `connected` attribute of the Socket object returns the current state of the connection:

```js
import io from 'socket.io-client';

const socket = io();

console.log(socket.connected); // false

socket.on('connect', () => {
  console.log(socket.connected); // true
});

socket.on('disconnect', () => {
  console.log(socket.connected); // false
});
```

## Lifecycle diagram

Below is a diagram of the socket lifecycle. It includes the different events emitted by the socket.

![Lifecycle diagram](/images/client_connection_lifecycle.png)

## Events

This is the list of events that can be emitted by the Socket object.

| Event | Description |
| ----- | ----------- |
| connect | Fired upon connection (including a successful reconnection) |
| disconnect | Fired upon disconnection |
| connect_error | Fired upon a connection error |
| connect_timeout | Fired upon a connection timeout |
| reconnect_attempt | Fired upon an attempt to reconnect |
| reconnect_error | Fired upon a reconnection attempt error |
| reconnect_failed | Fired when the client couldn't reconnect within `reconnectionAttempts` |
| reconnecting | Alias for "reconnect_attempt" |
| reconnect | Fired upon a successful reconnection |
| ping | Fired when a ping is sent to the server |
| pong | Fired when a pong is received from the server |

Please note that you can't reuse those event names in your application:

```js
socket.emit('reconnect_attempt'); // WARNING: will be silently discarded
```

## Reconnection

By default, the client will try to reconnect forever.

Here is the default configuration:

```js
const socket = io({
  reconnection: true,             // whether to reconnect automatically
  reconnectionAttempts: Infinity, // number of reconnection attempts before giving up
  reconnectionDelay: 1000,        // how long to initially wait before attempting a new reconnection
  reconnectionDelayMax: 5000,     // maximum amount of time to wait between reconnection attempts. Each attempt increases the reconnection delay by 2x along with a randomization factor
  randomizationFactor: 0.5
});
```

Delay between two consecutive attempts:

- 1st attempt: `1000 +/- 500 ms`
- 2nd attempt: `2000 +/- 1000 ms`
- 3nd attempt: `4000 +/- 2000 ms`
- following attempts: `5000 +/- 2500 ms`

The randomization factor helps smooth the load induced by the reconnection attempts of multiple clients, in case a server goes down.

Sample lifecycle:

```
- connect            // the client successfully establishes a connection to the server.
- disconnect         // some bad thing happens (the server crashes, for example).
- reconnect_attempt  // after a given delay, the client tries to reconnect.
- reconnect_error    // the first attempt fails.
- reconnect_attempt  // after a given delay, the client tries to reconnect again
- connect            // the client successfully restore the connection to the server
```

Example with `reconnectionAttempts: 3`:

```
- connect            // the client successfully establishes a connection to the server
- disconnect         // some bad thing happens (the client goes offline, for example)
- reconnect_attempt  // after a given delay, the client tries to reconnect
- reconnect_error    // the first attempt fails
- reconnect_attempt  // after a given delay, the client tries to reconnect
- reconnect_error    // the second attempt fails
- reconnect_attempt  // after a given delay, the client tries to reconnect
- reconnect_error    // the third attempt fails
- reconnect_failed   // the client won't try to reconnect anymore
```

## Disabling the default reconnection logic

Reconnection can be disabled, in case you want to provide your own reconnection logic:

```js
const socket = io({
  reconnection: false
});

socket.on('connect_error', () => {
  setTimeout(() => {
    socket.connect();
  }, 2000);
});

socket.on('disconnect', () => {
  setTimeout(() => {
    socket.connect();
  }, 500);
});
```
