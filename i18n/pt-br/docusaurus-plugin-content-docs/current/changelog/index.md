---
title: Changelog
sidebar_position: 1
---

## Versioning Policy {#versioning-policy}

Socket.IO releases closely follow [Semantic Versioning](https://semver.org/).

That means that with a version number `x.y.z`:

- when releasing critical bug fixes, we make a patch release by increasing the `z` number (ex: `1.2.3` to `1.2.4`).
- when releasing new features or non-critical fixes, we make a minor release by increasing the `y` number (ex: `1.2.3` to `1.3.0`).
- when releasing breaking changes, we make a major release by increasing the `x` number (ex: `1.2.3` to `2.0.0`).

## Breaking changes {#breaking-changes}

Breaking changes are inconvenient for everyone, so we try to minimize the number of major releases.

We have had two major breaking changes impacting the Socket.IO protocol over the years:

- Socket.IO v2 was released in **May 2017**
- Socket.IO v3 was released in **November 2020**

:::info

Socket.IO v4 (released in March 2021) did not include any update to the Socket.IO protocol (only a couple of breaking changes in the Node.js server API), so it isn't counted here.

Reference: [Migrating from 3.x to 4.0](../categories/07-Migrations/migrating-from-3-to-4.md)

:::
