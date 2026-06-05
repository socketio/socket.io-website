---
title: How to emit to a list of sockets
---

# How to emit to a list of sockets

In Socket.IO, there are several ways to emit an event to a specific subset of connected sockets:

- [with a room](#room)
- [with a namespace](#namespace)
- [with a dynamic subset of sockets](#dynamic-subset-of-sockets)

## Room

In most applications, the recommended approach is to use **rooms**: create rooms based on your domain model, such as user IDs, organizations, projects, conversations, or subscriptions, then emit to those rooms.

Reference: [Rooms](/docs/v4/rooms/)

Example targeting a specific user:

```js
function computeUserId(handshake) {
  // compute the user ID based on the headers/cookies/etc.
}

io.use(async (socket, next) => {
  const userId = await computeUserId(socket.handshake);

  socket.join(`user:${userId}`);

  next();
});

// then later
io.to("user:123").emit("event", "to this specific user");
```

Similarly, to target a specific project:

```js
function computeUserId(handshake) {
  // compute the user ID based on the headers/cookies/etc.
}

io.use(async (socket, next) => {
  const userId = await computeUserId(socket.handshake);
  const projects = await getProjectsForUser(userId);

  for (const project of projects) {
    socket.join(`project:${project.id}`);
  }

  next();
});

// then later
io.to("project:123").emit("event", "to all users working on this project");
```

### Pros

- easy to implement
- performant

### Cons

- you need to keep the rooms up-to-date:
  - call [`socket.join()`](/docs/v4/server-api/#socketjoinroom) or [`io.socketsJoin()`](/docs/v4/server-api/#serversocketsjoinrooms) (in the example above, when the user is assigned to a project)
  - call [`socket.leave()`](/docs/v4/server-api/#socketleaveroom) or [`io.socketsLeave()`](/docs/v4/server-api/#serversocketsleaverooms) (when the user is unassigned)

- there is no way to do an intersection between rooms (for example, all sockets with a specific role in the organization *and* assigned to a particular project)

:::info

`io.to("org:123:manager").to("project:456").emit("event")` will do a union of the rooms and emit to all sockets which are in *either* the `org:123:manager` or `project:456` rooms (or both).

:::

## Namespace

Namespaces are another way to organize your Socket.IO server into logical groups.

Reference: [Namespaces](/docs/v4/namespaces/)

Example with a namespace for admin users:

```js
const adminNamespace = io.of("/admin");

async function isAdmin(handshake) {
  // ...
}

adminNamespace.use(async (socket, next) => {
  if (await isAdmin(socket.handshake)) {
    next();
  } else {
    next(new Error("not authorized"));
  }
});

// then later
adminNamespace.emit("event", "to all admin users");
```

Or with one namespace per organization:

```js
const namespaces = io.of(/^\/org:\d+$/);

async function isMemberOfOrganization(handshake, orgId) {
  // ...
}

namespaces.use(async (socket, next) => {
  const orgId = socket.nsp.name.slice("/org:".length);
  
  if (await isMemberOfOrganization(socket.handshake, orgId)) {
    next();
  } else {
    next(new Error("not authorized"));
  }
});

namespaces.on("connection", (socket) => {
  const namespace = socket.nsp;

  namespace.emit("event", "to all users in this organization");
});
```

### Pros

- easy to implement
- performant

### Cons

- you need to keep the namespaces up-to-date:
  - call [`socket.disconnect()`](/docs/v4/server-api/#socketdisconnectclose) or [`io.disconnectSockets()`](/docs/v4/server-api/#serverdisconnectsocketsclose) (in the example above, when the user is removed from an organization)
  - connect to the namespace from the client side when the user is added to an organization

## Dynamic subset of sockets

If the solutions above don't suit your needs, you can always loop through all connected sockets and filter the sockets you want to emit to:

### Standalone version

Example if you have a single Socket.IO server:

```js
function emitToMatchingSockets(filter, event, arg) {
  for (const socket of io.of("/").sockets.values()) {
    if (filter(socket)) {
      socket.emit(event, arg);
    }
  }
}

emitToMatchingSockets(
  (socket) => {
    return (
      socket.data.orgId === 123 &&
      socket.data.role === "manager" &&
      socket.data.projectIds.includes(456)
    );
  },
  "event",
  "to this specific subset of users",
);
```

### Cluster version

Example if you have multiple Socket.IO servers:

```js
function localEmit({ orgId, role, projectId }, event, arg) {
  function filter(socket) {
    return (
      socket.data.orgId === orgId &&
      socket.data.role === role &&
      socket.data.projectIds.includes(projectId)
    );
  }

  for (const socket of io.of("/").sockets.values()) {
    if (filter(socket)) {
      socket.emit(event, arg);
    }
  }
}

io.on("emitToMatchingSockets", (filters, event, arg) => {
  localEmit(filters, event, arg);
});

function emitToMatchingSockets(filters, event, arg) {
  // emit to sockets connected on this server
  localEmit(filters, event, arg);

  // notify the other servers
  io.serverSideEmit("emitToMatchingSockets", filters, event, arg);
}

emitToMatchingSockets(
  {
    orgId: 123,
    role: "manager",
    projectId: 456,
  },
  "event",
  "to this specific subset of users",
);
```

References:

- [io.serverSideEmit()](/docs/v4/server-api/#serverserversideemiteventname-args)
- [Using multiple nodes](/docs/v4/using-multiple-nodes/)

### Pros

- you can apply any filter

### Cons

- a bit less performant, since the payload will be encoded for each socket


That's all folks, thanks for reading!

[Back to the list of examples](/get-started/)