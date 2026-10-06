---
title: How to handle BigInts
---

# How to handle BigInts

:::info

A `BigInt` is a built-in JavaScript object that provides a way to represent whole numbers larger than `2^53 - 1`, which is the largest number
JavaScript can safely represent with the `Number` primitive.

Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt

:::

By default, Socket.IO uses `JSON.stringify()` to serialize the packets, and `JSON.parse()` to deserialize them.

However, `JSON.stringify()` does not know how to serialize a `BigInt`:

```js
const data = {
  id: 1n
};

JSON.stringify(data); // TypeError: Do not know how to serialize a BigInt
```

Here are four ways to handle BigInts in your application:

## Manual conversion (recommended)

The simplest way is to manually convert the `BigInt` to a string (or a number) before sending it:

```js
const data = {
  id: 1n
};

socket.emit("hello", {
  ...data,
  id: data.id.toString()
});
```

On the other side, you will need to convert the string back to a `BigInt`:

```js
socket.on("hello", (data) => {
  data.id = BigInt(data.id);
});
```

:::caution

Converting a `BigInt` to a `Number` may result in a loss of precision:

```js
const value = 2n ** 53n;
console.log(Number(value) === Number(value + 1n)); // true
```

:::

## Extending the default built-in parser

The default built-in parser does not support BigInts out of the box but can be extended to support them:

```js
import { Encoder, Decoder } from "socket.io-parser";

const replacer = (key, value) => {
  if (typeof value === "bigint") {
    return {
      _type: "BigInt",
      value: value.toString()
    };
  }

  return value;
};

const reviver = (key, value) => {
  if (value && value._type === "BigInt") {
    return BigInt(value.value);
  }

  return value;
};

const parser = {
  Encoder: class extends Encoder {
    constructor() {
      super(replacer);
    }
  },
  Decoder: class extends Decoder {
    constructor() {
      super(reviver);
    }
  }
};
```

Then use it on both sides:

*Server*

```js
import { Server } from "socket.io";

const io = new Server({
  parser
});
```

*Client*

```js
import { io } from "socket.io-client";

const socket = io({
  parser
});
```

## Custom parser

Instead of extending the default parser, you can also replace it entirely with a custom parser that supports BigInts, such as the [MessagePack parser](/docs/v4/custom-parser/#the-msgpack-parser):

*Server*

```js
import { Server } from "socket.io";
import customParser from "socket.io-msgpack-parser";

const io = new Server({
  parser: customParser
});
```

*Client*

```js
import { io } from "socket.io-client";
import customParser from "socket.io-msgpack-parser";

const socket = io({
  parser: customParser
});
```

Reference: [Custom parser](/docs/v4/custom-parser/)

## `toJSON()` method

Finally, you can also add a `toJSON()` method to the `BigInt` prototype:

```js
BigInt.prototype.toJSON = function() {
  return this.toString();
};
```

This will be called by `JSON.stringify()` whenever it encounters a `BigInt`.

However, please note that:

- this is a global change, which might affect other parts of your application
- the value will be received as a string on the other side, so you will still need to convert it back to a `BigInt`

[Back to the list of examples](/get-started/)
