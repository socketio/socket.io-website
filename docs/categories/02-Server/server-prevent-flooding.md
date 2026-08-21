---
title: Prevent flooding
sidebar_position: 11
slug: /server-prevent-flooding/
---

## Prevent flooding

Limit number of events per period of time with [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible) package.

### Installation

<Tabs groupId="pm">
  <TabItem value="npm" label="NPM" default>

```sh
npm install rate-limiter-flexible
```

  </TabItem>
  <TabItem value="yarn" label="Yarn">

```sh
yarn add rate-limiter-flexible
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```sh
pnpm add rate-limiter-flexible
```

  </TabItem>
  <TabItem value="bun" label="Bun">

```sh
bun add rate-limiter-flexible
```

  </TabItem>
</Tabs>

### Configuration

Allow not more than 3 events per user per second.

```js
const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 1,
});
```

Configure settings according to your application's specific requirements.
For chat applications, users typically send no more than 3 messages per second, allowing for conservative rate limits.
However, browser-based online games demand significantly higher bandwidth to support real-time interactions.

### Rate limit incoming events

Consume points on socket `message` event.

```js
io.on('connection', (socket) => {
  socket.on('message', async (data) => {
    const authToken = socket.handshake.auth ? socket.handshake.auth.token : null;
    const uniqStr = authToken || socket.handshake.address;
    const pointsToConsume = authToken ? 1 : 3; // stricter limits for unauthenticated users

    try {
      const rateLimitResult = await rateLimiter.consume(uniqStr, pointsToConsume);

      // Optionally, send back success event and the remaining points info
      socket.emit('message-success', {
        message: data,
        remaining: rateLimitResult.remainingPoints,
      });
    } catch (error) {
      const secs = Math.round(error.msBeforeNext / 1000) || 1;

      socket.emit('rate-limit', {
        message: 'Too many messages',
        retryAfter: secs
      });
    }
  });
});
```

For distributed environments, use one of the store limiters from [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible).
