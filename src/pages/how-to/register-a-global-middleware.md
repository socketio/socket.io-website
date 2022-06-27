---
title: How to register a global middleware
---

# How to register a global middleware

In Socket.IO v2, a middleware that was registered for the main namespace would act as a global middleware, applying to all namespaces, since a client would first connect to the main namespace, and then to the custom namespace:

```js
// Socket.IO v2

io.use((socket, next) => {
  // always triggered, even if the client tries to reach the custom namespace
  next();
});

io.of("/my-custom-namespace").use((socket, next) => {
  // triggered after the global middleware
  next();
});
```

This is not the case any more starting with Socket.IO v3: a middleware attached to the main namespace is only called when a client tries to reach the main namespace:

```js
// Socket.IO v3 and above

io.use((socket, next) => {
  // only triggered when the client tries to reach the main namespace
  next();
});

io.of("/my-custom-namespace").use((socket, next) => {
  // only triggered when the client tries to reach this custom namespace
  next();
});
```

To create a global middleware in newer versions, you need to attach your middleware to all namespaces:

- either manually:

```js
const myGlobalMiddleware = (socket, next) => {
  next();
}

io.use(myGlobalMiddleware);
io.of("/my-custom-namespace").use(myGlobalMiddleware);
```

- or by using the [`new_namespace`](/docs/v4/server-api/#event-new_namespace) event:

```js
const myGlobalMiddleware = (socket, next) => {
  next();
}

io.use(myGlobalMiddleware);

io.on("new_namespace", (namespace) => {
  namespace.use(myGlobalMiddleware);
});

// and then declare the namespaces
io.of("/my-custom-namespace");
```

:::caution

The namespaces that are registered before the `new_namespace` listener won't be affected.

:::

- or, when using [dynamic namespaces](/docs/v4/namespaces/#dynamic-namespaces), by registering a middleware on the parent namespace:

```js
const myGlobalMiddleware = (socket, next) => {
  next();
}

io.use(myGlobalMiddleware);

const parentNamespace = io.of(/^\/dynamic-\d+$/);

parentNamespace.use(myGlobalMiddleware);
```

:::caution

Existing namespaces always have priority over dynamic namespaces. For example:

```js
io.of("/admin");

io.of(/.*/).use((socket, next) => {
  // won't be called for the main namespace nor for the "/admin" namespace
  next();
});
```

:::

Related:

- [Middleware documentation](/docs/v4/middlewares/)
- [v2 to v3 migration](/docs/v4/migrating-from-2-x-to-3-0/#no-more-implicit-connection-to-the-default-namespace)
