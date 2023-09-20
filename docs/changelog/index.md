---
title: Changelog
sidebar_position: 1
---

## Versioning Policy

Socket.IO releases closely follow [Semantic Versioning](https://semver.org/).

That means that with a version number `x.y.z`:

- when releasing critical bug fixes, we make a patch release by increasing the `z` number (ex: `1.2.3` to `1.2.4`).
- when releasing new features or non-critical fixes, we make a minor release by increasing the `y` number (ex: `1.2.3` to `1.3.0`).
- when releasing breaking changes, we make a major release by increasing the `x` number (ex: `1.2.3` to `2.0.0`).

## Breaking changes

Breaking changes are inconvenient for everyone, so we try to minimize the number of major releases.

We have had two major breaking changes impacting the Socket.IO protocol over the years:

- Socket.IO v2 was released in **May 2017**
- Socket.IO v3 was released in **November 2020**

:::info

Socket.IO v4 (released in March 2021) did not include any update to the Socket.IO protocol (only a couple of breaking changes in the Node.js server API), so it isn't counted here.

Reference: [Migrating from 3.x to 4.0](../categories/07-Migrations/migrating-from-3-to-4.md)

:::

## Important milestones

Aside from the breaking changes listed above, here are the latest important changes in Socket.IO:

| Version             | Date          | Description                                                                                              |
|---------------------|---------------|----------------------------------------------------------------------------------------------------------|
| [`4.7.0`](4.7.0.md) | June 2023     | Support for WebTransport                                                                                 |
| [`4.6.0`](4.6.0.md) | February 2023 | Introduction of [Connection state recovery](../categories/01-Documentation/connection-state-recovery.md) |
| `4.4.0`             | November 2021 | Support for [uWebSockets.js](../categories/02-Server/server-installation.md#usage-with-uwebsockets)      |
| `4.1.0`             | May 2021      | Introduction of [`serverSideEmit()`](../categories/02-Server/server-instance.md#serversideemit)          |
| `4.0.0`             | March 2021    | Rewrite to [TypeScript](https://www.typescriptlang.org/)                                                 |
