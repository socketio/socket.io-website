---
title: How to use with Vue 3
---

# How to use with Vue 3

This guide shows how to use Socket.IO within a [Vue 3](https://vuejs.org/) application.

## Example

Structure:

```
src
├── App.vue
├── components
│   ├── ConnectionManager.vue
│   ├── ConnectionState.vue
│   └── MyForm.vue
├── main.js
└── socket.js
```

The Socket.IO client is initialized in the `src/socket.js` file:

`src/socket.js`

```js
import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  fooEvents: [],
  barEvents: []
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

export const socket = io(URL);

socket.on("connect", () => {
  state.connected = true;
});

socket.on("disconnect", () => {
  state.connected = false;
});

socket.on("foo", (...args) => {
  state.fooEvents.push(args);
});

socket.on("bar", (...args) => {
  state.barEvents.push(args);
});
```

:::info

During development, you will need to enable CORS on your server:

```js
const io = new Server({
  cors: {
    origin: "http://localhost:8080"
  }
});
```

Reference: [Handling CORS](/docs/v4/handling-cors)

:::

:::tip

The event listeners are registered in the `src/socket.js` file, as we strongly advise against registering listeners in your components. More on that [below](#listeners-in-a-component).

:::

You can then use it in your components:

- `src/components/ConnectionState.vue`

```html
<template>
  <p>State: {{ connected }}</p>
</template>

<script>
import { state } from "@/socket";

export default {
  name: "ConnectionState",

  computed: {
    connected() {
      return state.connected;
    }
  }
}
</script>
```

- `src/components/ConnectionManager.vue`

```html
<template>
  <button @click="connect()">Connect</button>
  <button @click="disconnect()">Disconnect</button>
</template>

<script>
import { socket } from "@/socket";

export default {
  name: "ConnectionManager",

  methods: {
    connect() {
      socket.connect();
    },
    disconnect() {
      socket.disconnect();
    }
  }
}
</script>
```

:::tip

The `socket` object can also be initialized without connecting right away with the [`autoConnect`](/docs/v4/client-options/#autoconnect) option:

```js
export const socket = io(URL, {
  autoConnect: false
});
```

This can be useful for example when the user must provide some credentials before connecting.

:::

- `src/components/MyForm.vue`

```html
<template>
  <form @submit.prevent="onSubmit">
    <input v-model="value" />

    <button type="submit" :disabled="isLoading">Submit</button>
  </form>
</template>

<script>
import { socket } from "@/socket";

export default {
  name: "MyForm",

  data() {
    return {
      isLoading: false,
      value: ""
    }
  },

  methods: {
    onSubmit() {
      this.isLoading = true;

      socket.timeout(5000).emit("create-something", this.value, () => {
        this.isLoading = false;
      });
    },
  }
}
</script>
```

Reference: https://vuejs.org/guide/scaling-up/state-management.html

## Important notes

:::info

These remarks are valid for any front-end framework.

:::

### Hot module reloading

The hot reloading of a file that contains the initialization of a Socket.IO client (i.e. the `src/socket.js` file in the example above) might leave the previous Socket.IO connection alive, which means that:

- you might have multiple connections on your Socket.IO server
- you might receive events from the previous connection

The only known workaround is to do a **full-page reload** when this specific file is updated (or disable hot reloading altogether, but that might be a bit extreme).

Reference: https://vue-loader.vuejs.org/guide/hot-reload.html

### Listeners in a child component

We strongly advise against registering event listeners in your child components, because it ties the state of the UI with the time of reception of the events: if the component is not mounted, then some messages might be missed.

`src/components/MyComponent.vue`

```html
<script>
import { socket } from "@/socket";

export default {
  name: "MyComponent",

  data() {
    return {
      fooEvents: []
    }
  },

  mounted() {
    // BAD
    socket.on("foo", (...args) => {
      this.fooEvents.push(args);
    });
  }
}
</script>
```

:::note

This is fine in your root component though (since it is always mounted).

:::

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
