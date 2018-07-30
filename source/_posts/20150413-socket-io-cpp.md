title: Socket.IO  —  Socket.IO C++
title_lite: Socket.IO C++
permalink: /blog/socket-io-cpp/
date: 2015-04-13
author_name: Melo Yao
author_link: https://twitter.com/melode111
---

I'm really proud to announce the first release of the <a href="https://github.com/socketio/socket.io-client-cpp">Socket.IO C++ Client</a> on GitHub!

Based on <a href="http://www.boost.org/">Boost</a> and <a href="https://github.com/zaphoyd/websocketpp">WebSocket++</a>, this full-featured Socket.IO 1.0 client has the fundamental advantage of working on **multiple platforms**. Check out the directory of <a href="https://github.com/socketio/socket.io-client-cpp/tree/master/examples">examples</a>. It contains examples of iOS, QT, and CLI chat clients!

To learn how to use this client, I put together a QT chat example that communicates using a <a href="https://github.com/Automattic/socket.io/tree/master/examples/chat">Socket.IO Node.JS chat server</a>. Keep reading for step-by-step instructions.

<p style="text-align: center">
<img src="https://cldup.com/98tHyoJJE7.gif">
</p>

## Introduction

If you’d like to follow along, begin by cloning the <a href="https://github.com/socketio/socket.io-client-cpp">socket.io-client-cpp</a> repository using the following:

```bash
git clone --recurse-submodules https://github.com/socketio/socket.io-client-cpp.git
```

The app includes the following features:

- Send messages to all users joining the room.
- Receive a notification when users join or leave the room.
- Receive notifications when a user starts typing a message.

Before you get started, visit the <a href="http://www.qt.io/download-open-source/#section-2">QT community</a> to download and install QT.

## Creating a QT GUI Application

Launch the QT Creator.

On the welcome page, select `New Project`, then create a `QT Widget Application.` Name it `SioChatDemo.`

The project structure should look like this:

```
SioChatDemo
    |__ SioChatDemo.pro
    |__Headers
    |   |__mainwindow.h
    |__Sources
    |   |__main.cpp
    |   |__mainwindow.cpp
    |__Forms
        |__mainwindow.ui
```

## Importing an SioClient

Lets copy the SioClient into the QT project under the subfolder `sioclient.`

Edit `SioChatDemo.pro` to configure paths and compile options by simply adding:

```bash
SOURCES += ./sioclient/src/sio_client.cpp
           ./sioclient/src/sio_packet.cpp

HEADERS  += ./sioclient/src/sio_client.h
            ./sioclient/src/sio_message.h

INCLUDEPATH += $$PWD/sioclient/lib/rapidjson/include
INCLUDEPATH += $$PWD/sioclient/lib/websocketpp
```

Add two additional compile options:

```bash
CONFIG+=no_keywords
CONFIG+=c++11
```

The `no_keywords` flag prevents `qmake` from treating some function names as `emit` as the keyword for the signal-slot mechanism.

Use `c++11` to ask for C++11 support.

## Importing Boost

We now have our boost `headers` and a fat boost `static lib` named `libboost.a`(non-win32) or `boost.lib`(win32).

To import them, we need to edit `SioChatDemo.pro` again by adding a header including the following:

```bash
INCLUDEPATH += `our boost headers folder`
```

Linker options:

```bash
win32:CONFIG(release, debug|release): LIBS += -L`our Win32 boost static lib folder` -lboost
else:win32:CONFIG(debug, debug|release): LIBS += -L`our Win32 boost static lib folder` -lboost
else:unix: LIBS += -L`our osx boost static lib folder` -lboost
```

## Create the Main Window UI

Create a simple UI by dragging and dropping a widget from the widget box on the left-hand side.

<p style="text-align: center">
<img src="https://cldup.com/RI98CYpYL5.png">
</p>

It contains the following:

- A `QLineEdit` at the top to input a nickname: `nickNameEdit`
- A `QPushButton` at the top right for login: `loginBtn`
- A `QListWidget` in the center for showing messages: `listView`
- A `QLineEdit` at the bottom for typing messages: `messageEdit`
- A `QPushButton` at the bottom right for sending messages: `sendBtn`

## Add Slots in the Main Window

The following slots need to be added in the `mainwindow` class to handle UI events:

- Click ‘Login’ button
- Click ‘Send Message’ button
- Text change in message editing (to show typing status)
- Return message editing (for sending responses)

Insert the following code into the `MainWindow` class in `mainwindow.h`:

```cpp
public Q_SLOTS:
    void SendBtnClicked();
    void TypingChanged();
    void LoginClicked();
    void OnMessageReturn();
```

## Connect the UI Event Signal and Slots

Open `mainwindow.ui` in the design mode. Switch to the `signals/slots` mode using `Menu->Edit->Edit Signals/Slots`.

Click and hold the widget and drag it to the window (the cursor will become an electrical ground symbol) to open the connection editor.

In the connection editor, edit the main window slots on the right side. Add the slot function names added in `mainwindow.h` before.

Then we can connect the event signal to the widget with our own slots. The result should look like this:

<p style="text-align: center">
<img src="https://cldup.com/Vsb-UXG3FC.jpg">
</p>

## Adding UI Refresh Signals/Slots

The `sio::client` callbacks are not in the UI thread. However, the UI must be updated with those callbacks, so we need a signal for the non-UI thread to request the `slots` functions in the UI thread. To signal that `QListWidgetItem` has been added, insert the following:

```cpp
// in mainwindow.h
Q_SIGNALS:
    void RequestAddListItem(QListWidgetItem *item);
private Q_SLOTS:
    void AddListItem(QListWidgetItem *item);
```

```cpp
//In mainwindow.cpp
void MainWindow::AddListItem(QListWidgetItem* item)
{
    this->findChild&lt;QListWidget*>("listView")->addItem(item);
}
```

Then connect them in the `MainWindow` constructor.

```cpp
connect(this,SIGNAL(RequestAddListItem(QListWidgetItem*)),this,SLOT(AddListItem(QListWidgetItem*)));
```

## Setting up the Socket

For single-window applications, simply let `MainWindow` class hold the `sio::client` object by declaring a `unique_ptr` member of the `sio::client` and several event handling functions in `mainwindow.h`.

```cpp
private:
    void OnNewMessage(std::string const& name,message::ptr const& data,bool hasAck,message::ptr &ack_resp);
    void OnUserJoined(std::string const& name,message::ptr const& data,bool hasAck,message::ptr &ack_resp);
    void OnUserLeft(std::string const& name,message::ptr const& data,bool hasAck,message::ptr &ack_resp);
    void OnTyping(std::string const& name,message::ptr const& data,bool hasAck,message::ptr &ack_resp);
    void OnStopTyping(std::string const& name,message::ptr const& data,bool hasAck,message::ptr &ack_resp);
    void OnLogin(std::string const& name,message::ptr const& data,bool hasAck,message::ptr &ack_resp);
    void OnConnected();
    void OnClosed(client::close_reason const& reason);
    void OnFailed();

    std::unique_ptr&lt;client> _io;
```

Initialize `sio::client` and setup event bindings for the default `socket` in the `MainWindow` constructor.

We also need to handle connectivity and disconnect events.

Add the following to the `MainWindow` constructor:

```cpp
MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow),
    _io(new client())
{
    ui->setupUi(this);
    using std::placeholders::_1;
    using std::placeholders::_2;
    using std::placeholders::_3;
    using std::placeholders::_4;
    socket::ptr sock = _io->socket();
    sock->on("new message",std::bind(&MainWindow::OnNewMessage,this,_1,_2,_3,_4));
    sock->on("user joined",std::bind(&MainWindow::OnUserJoined,this,_1,_2,_3,_4));
    sock->on("user left",std::bind(&MainWindow::OnUserLeft,this,_1,_2,_3,_4));
    sock->on("typing",std::bind(&MainWindow::OnTyping,this,_1,_2,_3,_4));
    sock->on("stop typing",std::bind(&MainWindow::OnStopTyping,this,_1,_2,_3,_4));
    sock->on("login",std::bind(&MainWindow::OnLogin,this,_1,_2,_3,_4));
    //default socket opened, also we have "set_open_listener" for monitoring physical connection opened.
    _io->set_socket_open_listener(std::bind(&MainWindow::OnConnected,this,std::placeholders::_1));
    //physical connection closed or drop.
    _io->set_close_listener(std::bind(&MainWindow::OnClosed,this,_1));
    //physical connection fail to establish.
    _io->set_fail_listener(std::bind(&MainWindow::OnFailed,this));
    connect(this,SIGNAL(RequestAddListItem(QListWidgetItem*)),this,SLOT(AddListItem(QListWidgetItem*)));
}
```

## Managing Connection State

We have several connection listeners for connection events.

First, we want to send a login message when were connected; we get the default `socket` from the `client` to do that.

```cpp
void MainWindow::OnConnected()
{
    QByteArray bytes = m_name.toUtf8();
    std::string nickName(bytes.data(),bytes.length());
    _io->socket()->emit("add user", nickName);
}
```

If the connection closes or fails, we need to restore the UI before we connect.

````cpp
void MainWindow::OnClosed(client::close_reason const& reason)
{
    //restore UI to pre-login state
}

void MainWindow::OnFailed()
{
    //restore UI to pre-login state
}
```

If we exit the `MainWindow`, we need to clear the event bindings and listeners.

The `sio::client` object will be destroyed using `unique_ptr`.

```cpp
MainWindow::~MainWindow()
{
    _io->socket()->off_all();
    _io->socket()->off_error();
    delete ui;
}
```

## Handling Socket.IO Events

We'll need to handle socket.io events in our functions they are bound to.

For example, we need to show received messages in the list view.

```cpp
void MainWindow::OnNewMessage(std::string const& name,message::ptr const& data,bool hasAck,message::ptr &ack_resp)
{
    if(data->get_flag() == message::flag_object)
    {
        std::string msg = data->get_map()["message"]->get_string();
        std::string name = data->get_map()["username"]->get_string();
        QString label = QString::fromUtf8(name.data(),name.length());
        label.append(':');
        label.append(QString::fromUtf8(msg.data(),msg.length()));
        QListWidgetItem *item= new QListWidgetItem(label);
        //emit RequestAddListItem signal
        //so that 'AddListItem' will be executed in UI thread.
        Q_EMIT RequestAddListItem(item);
    }
}
```

## Wrapping Up: Sending the Message

When `sendBtn` is clicked, we need to send the text in `messageEdit` to the chatroom.

Add the following code to `SendBtnClicked()`:

```cpp
void MainWindow::SendBtnClicked()
{
    QLineEdit* messageEdit = this->findChild&lt;QLineEdit*>("messageEdit");
    QString text = messageEdit->text();
    if(text.length()>0)
    {
        QByteArray bytes = text.toUtf8();
        std::string msg(bytes.data(),bytes.length());
        _io->socket()->emit("new message",msg);//emit new message
        text.append(":You");
        QListWidgetItem *item = new QListWidgetItem(text);
        item->setTextAlignment(Qt::AlignRight);
        Q_EMIT RequestAddListItem(item);
        messageEdit->clear();
    }
}
```

## Further Reading

You can run the <a href="https://github.com/socketio/socket.io-client-cpp/tree/master/examples/QT/SioChatDemo">demo project</a> to get a closer look. Before you run it, please follow the <a href="https://github.com/socketio/socket.io-client-cpp#-with-cmake">instructions</a> to make the Socket.io client library.

Don't forget to <a href="https://github.com/socketio/socket.io-client-cpp">star the project</a> on GitHub to get updates!
