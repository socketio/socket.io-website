---
title: Socket.IO on Azure 
slug: /socket-io-on-azure-preview/
authors:
- kevinguo-ed
---
- [Overview of Socket.IO support on Azure](https://learn.microsoft.com/azure/azure-web-pubsub/socketio-overview)
- [Quickstarts of hosting a Socket.IO app on Azure](https://learn.microsoft.com/azure/azure-web-pubsub/socketio-quickstart)

Hello developers, 

Since we put up an invitation to participate in a user study, we collected **hundreds of responses** and had the chance to speak in depth with several Socket.IO users. Thank you for your interest in the user study and helping us understand your experience. 

In this post, I am going to share with you some notable learnings from the study. It’s our hope that such sharing can shed light on how we can build a stronger community as Socket.IO users, contributors, and cloud providers. 

<!--truncate-->

## Socket.IO is used in a wide range of app scenarios 
We were pleasantly surprised by the variety of applications built using Socket.IO. Although a fair number of users reported building chat apps using Socket.IO, many shared that they use Socket.IO for identity management to limit the number of active browser tabs, for robotics to control the movement of mobile robots, for multi-player mobile games and for collaborative apps where users can track work items in real-time.

## Overwhelmingly, users enjoy the “intuitive APIs”
Users seem to have exhausted the synonyms for “intuitive” in their responses. Once users have gone over the initial learning curve, it doesn’t take long before they can get productive with Socket.IO’s APIs, which are described as “simple”, “easy” and “plain”. Plains APIs are definitely a praise in this case.

## Some users seem to have doubts about Socket.IO’s viability for large projects
Users new to Socket.IO seem to have the impression that Socket.IO is for small-scale and toy projects and it would be necessary to find alternatives when an app needs to scale. I am happy to report that impression doesn’t reflect the reality; a few Socket.IO users shared that their apps handled 10s of thousand concurrent connections well, powered by running multiple Socket.IO instances behind a load balancer.  

## Scaling out a Socket.IO is where developers report the most pain
Scaling out a Socket.IO app requires a multi-server setup. Essentially, client connections are spread across several Socket.IO server instances. To emit an event to clients connected with different server instances, there needs to be a component to coordinate the message passing. While simple in broad-stroke description, implementation is not particularly straight-forward or familiar to most users. Deploying and maintaining a separate adapter component add additional complexity to the task. 

This is an area where we studied the most and thought we could bring the most value to developers. I am happy to share with you that with the input from the open-source community, we brought support for Socket.IO on Azure. With this support, Azure hosts and manages client connections; in other words, developers don’t need an “adapter” component. 

What’s more important is that server and client apps continue using the **same and familiar Socket.IO APIs**. With only a few lines of code, you can get any socket.io apps running locally to Azure. You can learn more about the support and try it out for free by following the links below.

- [Overview of Socket.IO support on Azure](https://learn.microsoft.com/azure/azure-web-pubsub/socketio-overview)
- [Quickstarts of hosting a Socket.IO app on Azure](https://learn.microsoft.com/azure/azure-web-pubsub/socketio-quickstart)