title: Socket.IO  —  Native Socket.IO and Android
title_lite: Native Socket.IO and Android
permalink: /blog/native-socket-io-and-android/
date: 2015-01-20
author_name: Naoyuki Kanezawa
author_link: https://twitter.com/nkzawa
---

<img class="aligncenter size-full wp-image-626" src="/images/androidchat.gif" alt="android chat demo" width="338" height="600"/>

In this tutorial well learn how to create a chat client that communicates with a Socket.IO <a href="https://github.com/Automattic/socket.io/blob/master/examples/chat/index.js">Node.JS chat server</a>, with our <a href="https://github.com/nkzawa/socket.io-client.java">native Android Client</a>! If you want to jump straight to the code, its on <a href="https://github.com/nkzawa/socket.io-android-chat">GitHub</a>. Otherwise, read on!

## Introduction

To follow along, start by cloning the repository: <a title="socket.io-android-chat" href="https://github.com/nkzawa/socket.io-android-chat" target="_blank">socket.io-android-chat</a>.

The app has the following features:

- Sending a message to all users joining to the room.
- Notifies when each user joins or leaves.
- Notifies when an user start typing a message.

Socket.IO provides an event-oriented API that works across all networks, devices and browsers. Its incredibly robust (works even behind corporate proxies!) and highly performant, which is very suitable for multiplayer games or realtime communication.

## Installing the Dependencies

The first step is to install the Java Socket.IO client with <a href="https://developer.android.com/tools/building/configuring-gradle.html" target="_blank">Gradle</a>.

For this app, we just add the dependency to `build.gradle`:

```gradle
// app/build.gradle
dependencies {
    ...
    implementation 'com.github.nkzawa:socket.io-client:0.6.0'
}
```

We must remember adding the internet permission to `AndroidManifest.xml`.

```xml
<!-- app/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    ...
</manifest>
```

Now we can use Socket.IO on Android!

## Using socket in Activity and Fragment

First, we have to initialize a new instance of Socket.IO as follows:

```java
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

private Socket mSocket;
{
    try {
        mSocket = IO.socket("http://chat.socket.io");
    } catch (URISyntaxException e) {}
}

@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    mSocket.connect();
}
```

`IO.socket()` returns a socket for `http://chat.socket.io` with the default options. Notice that the method caches the result, so you can always get a same `Socket` instance for an url from any Activity or Fragment.
And we explicitly call `connect()` to establish the connection here (unlike the JavaScript client). In this app, we use `onCreate` lifecycle callback for that, but it actually depends on your application.

## Emitting events

Sending data looks as follows. In this case, we send a string but you can do JSON data too with the <a href="http://developer.android.com/reference/org/json/package-summary.html" target="_blank">org.json</a> package, and even binary data is supported as well!

```java
private EditText mInputMessageView;

private void attemptSend() {
    String message = mInputMessageView.getText().toString().trim();
    if (TextUtils.isEmpty(message)) {
        return;
    }

    mInputMessageView.setText("");
    mSocket.emit("new message", message);
}
```

## Listening on events

Like I mentioned earlier, Socket.IO is **bidirectional**, which means we can send events to the server, but also at any time during the communication the server can send events to us.

We then can make the socket listen an event on `onCreate` lifecycle callback.

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    mSocket.on("new message", onNewMessage);
    mSocket.connect();
}
```

With this we listen on the `new message` event to receive messages from other users.

```java
import com.github.nkzawa.emitter.Emitter;

private Emitter.Listener onNewMessage = new Emitter.Listener() {
    @Override
    public void call(final Object... args) {
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                JSONObject data = (JSONObject) args[0];
                String username;
                String message;
                try {
                    username = data.getString("username");
                    message = data.getString("message");
                } catch (JSONException e) {
                    return;
                }

                // add the message to view
                addMessage(username, message);
            }
        });
    }
};
```

This is what `onNewMessage` looks like. A listener is an instance of `Emitter.Listener` and must be implemented the `call` method. Youll notice that inside of `call()` is wrapped by `Activity#runOnUiThread()`, that is because the callback is always called on another thread from Android UI thread, thus we have to make sure that adding a message to view happens on the UI thread.

## Managing Socket State

Since an Android Activity has its own lifecycle, we should carefully manage the state of the socket also to avoid problems like memory leaks. In this app, we’ll close the socket connection and remove all listeners on `onDestroy` callback of Activity.

```java
@Override
public void onDestroy() {
    super.onDestroy();

    mSocket.disconnect();
    mSocket.off("new message", onNewMessage);
}
```

Calling `off()` removes the listener of the `new message` event.

## Further reading

If you want to explore more, I recommend you look into:

- Other features of this app. They are just implemented with `emit()`, `on()` and `off()`.

- The details of Socket.IO Java Client. It supports all the features JS client does.

- Many other great Socket.IO implementations created by the community!
