---
title: How to use with React hooks
---

# How to use with React hooks

Here's how you can use React hooks with Socket.IO:

```js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('pong', () => {
      setLastPong(new Date().toISOString());
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, []);

  const sendPing = () => {
    socket.emit('ping');
  }

  return (
    <div>
      <p>Connected: { '' + isConnected }</p>
      <p>Last pong: { lastPong || '-' }</p>
      <button onClick={ sendPing }>Send ping</button>
    </div>
  );
}

export default App;
```

Notes:

- the 2nd argument of the `useEffect()` method must be `[]`, or else the hook will be triggered every time a new message arrives

```js
useEffect(() => {
  // ...
}, []);
```

- the listeners must be removed in the cleanup step, in order to prevent multiple event registrations

```js
useEffect(() => {
  // ...
  return () => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('pong');
  };
}, []);
```

That's all folks!

Documentation: https://reactjs.org/docs/hooks-effect.html
