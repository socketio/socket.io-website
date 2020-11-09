title: Logging and debugging
permalink: /docs/v3/logging-and-debugging/
alias: /docs/logging-and-debugging/
release: v3
type: docs
order: 3
---

Socket.IO is now completely instrumented by a minimalistic yet tremendously powerful utility called [debug](https://github.com/visionmedia/debug) by TJ Holowaychuk.

Before 1.0, the Socket.IO server would default to logging everything out to the console. This turned out to be annoyingly verbose for many users (although extremely useful for others), so now we default to being completely silent by default.

The basic idea is that each module used by Socket.IO provides different debugging scopes that give you insight into the internals. By default, all output is suppressed, and you can opt into seeing messages by supplying the `DEBUG` env variable (Node.JS) or the `localStorage.debug` property (Browsers).

You can see it in action for example on our homepage:

<video id="debugging-vid" data-setup='{"autoplay":true,"loop":true, "techOrder": ["html5", "flash"], "height": 300}' class="video-js vjs-default-skin" autoplay loop width="100%"><source src="https://i.cloudup.com/transcoded/IL9alTr0eO.mp4" type="video/mp4"></video>

## Available debugging scopes

The best way to see what information is available is to use the `*`:

```
DEBUG=* node yourfile.js
```

or in the browser:

```
localStorage.debug = '*';
```

And then filter by the scopes you&#8217;re interested in. You can prefix the `*` with scopes, separated by comma if there is more than one. For example, to only see debug statements from the socket.io client on Node.js try this:

```
DEBUG=socket.io:client* node yourfile.js
```

To see all debug messages from the engine *and* socket.io:

```
DEBUG=engine,socket.io* node yourfile.js
```


## Removing debug from your browser bundle

While useful during development, the debug package adds an extra weight to the final bundle (about 4KB minified and gzipped), that's why it is excluded from the slim bundle (more details about the various browser bundles can be found [here](/docs/client-installation/#From-a-CDN)).

If you are using webpack, you can remove it with [webpack-remove-debug](https://github.com/johngodley/webpack-remove-debug):

```js
{
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'webpack-remove-debug'
      }
    ]
  }
}
```
