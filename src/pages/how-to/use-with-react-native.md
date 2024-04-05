---
title: How to use with React Native
---

# How to use with React Native

:::note

React Native is an open source framework for building Android and iOS applications using [React](https://react.dev/) and the app platform’s native capabilities. With React Native, you use JavaScript to access your platform’s APIs as well as to describe the appearance and behavior of your UI using React components: bundles of reusable, nestable code.

Reference: https://reactnative.dev/

:::

All tips from our [React guide](/how-to/use-with-react) can be applied with React Native as well.

## Connection URL

The URL to reach your Socket.IO server during development varies depending on your platform:

| Platform          | URL                                                                |
|-------------------|--------------------------------------------------------------------|
| Web browser       | `localhost`                                                        |
| iOS simulator     | `localhost`                                                        |
| Android simulator | `10.0.2.2`                                                         |
| Real device       | the IP of your machine (provided that you are on the same network) |

Example with a real device:

```js title="socket.js"
import { io } from "socket.io-client";

export const socket = io("http://192.168.0.10:3000");
```

:::tip

When developing an application in the browser, you will also need to enable CORS on the server side:

```js
const io = new Server({
  cors: {
    origin: ["http://localhost:8081"],
  }
});
```

Reference: [Handling CORS](/docs/v4/handling-cors/)

:::

## Common issues

### Cleartext traffic blocked on Android

Starting with API level 28 (Android 9 and higher), cleartext traffic is blocked by default, which means you won't be able to reach a server without SSL (`http://`).

You can add the following configuration to allow it during development:

```xml title="res/xml/network_security_config.xml"
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

```xml title="AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest ... >
    <application
        android:networkSecurityConfig="@xml/network_security_config"
        ... >
        ...
    </application>
</manifest>
```

Reference: https://developer.android.com/privacy-and-security/security-config


## Sample projects

- [Expo Go](https://docs.expo.dev/): https://github.com/socketio/socket.io/tree/main/examples/expo-example
- React Native CLI: https://github.com/socketio/socket.io/tree/main/examples/ReactNativeExample

That's all folks, thanks for reading!

[Back to the list of examples](/get-started/)
