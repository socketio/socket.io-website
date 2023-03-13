---
title: How to use with React
---

# How to use with React

This guide shows how to use Socket.IO within a [React](https://beta.reactjs.org/) application.

## Example

Structure:

```
src
├── App.js
├── components
│   ├── ConnectionManager.js
│   ├── ConnectionState.js
│   ├── MyEvents.js
│   └── MyForm.js
└── socket.js
```

The Socket.IO client is initialized in the `src/socket.js` file:

`src/socket.js`

```js
import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';

export const socket = io(URL);
```

:::tip

By default, the Socket.IO client opens a connection to the server right away. You can prevent this behavior with the [`autoConnect`](/docs/v4/client-options/#autoconnect) option:

```js
export const socket = io(URL, {
  autoConnect: false
});
```

In that case, you will need to call `socket.connect()` to make the Socket.IO client connect. This can be useful for example when the user must provide some kind of credentials before connecting.

:::

:::info

During development, you need to enable CORS on your server:

```js
const io = new Server({
  cors: {
    origin: "http://localhost:3000"
  }
});

io.listen(4000);
```

Reference: [Handling CORS](/docs/v4/handling-cors)

:::

The events listeners are then registered in the `App` component, which stores the state and pass it down to its child components via props.

See also: https://beta.reactjs.org/learn/sharing-state-between-components

`src/App.js`

```js
import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { ConnectionState } from './components/ConnectionState';
import { ConnectionManager } from './components/ConnectionManager';
import { MyForm } from './components/MyForm';

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value) {
      setFooEvents(previous => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
    };
  }, []);

  return (
    <div className="App">
      <ConnectionState isConnected={ isConnected } />
      <Events events={ fooEvents } />
      <ConnectionManager />
      <MyForm />
    </div>
  );
}
```

:::tip

A few remarks about the usage of the [`useEffect`](https://beta.reactjs.org/reference/react/useEffect) hook can be found [below](#remarks-about-the-useeffect-hook).

:::

The child components can then use the state and the `socket` object like this:

- `src/components/ConnectionState.js`

```js
import React from 'react';

export function ConnectionState({ isConnected }) {
  return <p>State: { '' + isConnected }</p>;
}
```

- `src/components/Events.js`

```js
import React from 'react';

export function Events({ events }) {
  return (
    <ul>
    {
      events.map((event, index) =>
        <li key={ index }>{ event }</li>
      )
    }
    </ul>
  );
}
```

- `src/components/ConnectionManager.js`

```js
import React from 'react';
import { socket } from '../socket';

export function ConnectionManager() {
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <>
      <button onClick={ connect }>Connect</button>
      <button onClick={ disconnect }>Disconnect</button>
    </>
  );
}
```

- `src/components/MyForm.js`

```js
import React, { useState } from 'react';
import { socket } from '../socket';

export function MyForm() {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    socket.timeout(5000).emit('create-something', value, () => {
      setIsLoading(false);
    });
  }

  return (
    <form onSubmit={ onSubmit }>
      <input onChange={ e => setValue(e.target.value) } />

      <button type="submit" disabled={ isLoading }>Submit</button>
    </form>
  );
}
```

## Remarks about the `useEffect` hook

### Cleanup

Any event listeners registered in the setup function must be removed in the cleanup callback in order to prevent duplicate event registrations.

```js
useEffect(() => {
  function onFooEvent(value) {
    // ...
  }

  socket.on('foo', onFooEvent);

  return () => {
    // BAD: missing event registration cleanup
  };
}, []);
```

Also, the event listeners are named functions, so calling `socket.off()` only removes this specific listener:

```js
useEffect(() => {
  socket.on('foo', (value) => {
    // ...
  });

  return () => {
    // BAD: this will remove all listeners for the 'foo' event, which may
    // include the ones registered in another component
    socket.off('foo');
  };
}, []);
```

### Dependencies

The `onFooEvent` function could also have been written like this:

```js
useEffect(() => {
  function onFooEvent(value) {
    setFooEvents(fooEvents.concat(value));
  }

  socket.on('foo', onFooEvent);

  return () => {
    socket.off('foo', onFooEvent);
  };
}, [fooEvents]);
```

This works too, but please note that in that case, the `onFooEvent` listener will be unregistered then registered again on each render.

### Disconnection

If you need to close the Socket.IO client when your component is unmounted (for example, if the connection is only needed in a specific part of your application), you should:

- ensure `socket.connect()` is called in the setup phase:

```js
useEffect(() => {
  // no-op if the socket is already connected
  socket.connect();

  return () => {
    socket.disconnect();
  };
}, []);
```

:::info

In [Strict Mode](https://beta.reactjs.org/reference/react/StrictMode), every Effect is run twice in order to catch bugs during development, so you will see:

- setup: `socket.connect()`
- cleanup: `socket.disconnect()`
- setup: `socket.connect()`

:::

- have no dependency for this Effect in order to prevent a reconnection on each render:

```js
useEffect(() => {
  socket.connect();

  function onFooEvent(value) {
    setFooEvents(fooEvents.concat(value));
  }

  socket.on('foo', onFooEvent);

  return () => {
    socket.off('foo', onFooEvent);
    // BAD: the Socket.IO client will reconnect every time the fooEvents array
    // is updated
    socket.disconnect();
  };
}, [fooEvents]);
```

You could have two Effects instead:

```js
import React, { useState, useEffect } from 'react';
import { socket } from './socket';

function App() {
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    // no-op if the socket is already connected
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    function onFooEvent(value) {
      setFooEvents(fooEvents.concat(value));
    }

    socket.on('foo', onFooEvent);

    return () => {
      socket.off('foo', onFooEvent);
    };
  }, [fooEvents]);

  // ...
}
```

## Important notes

:::info

These remarks are valid for any front-end framework.

:::

### Hot module reloading

The hot reloading of a file that contains the initialization of a Socket.IO client (i.e. the `src/socket.js` file in the example above) might leave the previous Socket.IO connection alive, which means that:

- you might have multiple connections on your Socket.IO server
- you might receive events from the previous connection

The only known workaround is to do a **full-page reload** when this specific file is updated (or disable hot reloading altogether, but that might be a bit extreme).

Reference: https://webpack.js.org/concepts/hot-module-replacement/

### Listeners in a child component

We strongly advise against registering event listeners in your child components, because it ties the state of the UI with the time of reception of the events: if the component is not mounted, then some messages might be missed.

`src/components/MyComponent.js`

```js
import React from 'react';

export default function MyComponent() {
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    function onFooEvent(value) {
      setFooEvents(previous => [...previous, value]);
    }

    // BAD: this ties the state of the UI with the time of reception of the
    // 'foo' events
    socket.on('foo', onFooEvent);

    return () => {
      socket.off('foo', onFooEvent);
    };
  }, []);

  // ...
}
```

### Temporary disconnections

While very powerful, WebSocket connections are not always up and running:

- anything between the user and the Socket.IO server may encounter a temporary failure or be restarted
- the server itself may be killed as part of an autoscaling policy
- the user may lose connection or switch from Wi-Fi to 4G, in case of a mobile browser

Which means you will need to properly handle the temporary disconnections, in order to provide a great experience to your users.

The good news is that Socket.IO includes some features that can help you. Please check:

- [Connection state recovery](/docs/v4/connection-state-recovery)
- [Delivery guarantees](/docs/v4/delivery-guarantees)


[Back to the list of examples](/get-started/)
