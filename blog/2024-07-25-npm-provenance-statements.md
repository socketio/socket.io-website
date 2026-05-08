---
title: npm package provenance
slug: /npm-package-provenance/
authors:
  - darrachequesne
---

Hello everyone!

We are happy to announce that Socket.IO packages will now be published with a provenance statement.

<!--truncate-->

:::tip

Package provenance is a npm feature which was introduced last year to increase trust in the npm supply chain.

The idea is that the package is published and signed from a trusted CI/CD platform (such as GitHub Actions), so the code that ends up in the registry cannot be tampered with.

More info: https://github.blog/security/supply-chain-security/introducing-npm-package-provenance/

:::

Starting today, new Socket.IO versions will be published directly from GitHub Actions and no longer from a maintainer machine.

The publication workflow can be found here: [`publish.yml`](https://github.com/socketio/socket.io/blob/main/.github/workflows/publish.yml)

## Notes

There are a few notable differences from the [reference workflow](https://docs.npmjs.com/generating-provenance-statements):

### Workflow trigger

The workflow is triggered when pushing a tag to GitHub:

```yml
on:
  push:
    tags:
      - '**@*'
```

The expected format is `<package>@<version>`, for example:

- `socket.io@1.2.3`
- `@socket.io/redis-adapter@3.4.5` (hence the `**` to match the `/` char)

The `<package>` part is then used to select the right workspace (since we are using [a monorepo](/blog/monorepo/)):

```yml
jobs:
  publish:
    steps:
      # [...]

      - name: Publish package
        run: npm publish --workspace=${GITHUB_REF_NAME%@*} --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Reference: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

### Compilation step

A TypeScript compilation step is necessary, since some packages depend on the types of other packages:

```yml
jobs:
  publish:
    steps:
      # [...]

      - name: Compile each package
        run: npm run compile --workspaces --if-present

      - name: Publish package
      # [...]
```

## First verified version

The latest version of the `engine.io-parser` package has been released this way.

On the [npmjs.com](https://www.npmjs.com/package/engine.io-parser) website, you can find:

- the details of the build, at the bottom of the page:

![Provenance details on www.npmjs.com](/images/blog/npm-package-provenance/provenance-details.png)

- a checked badge, in the "Versions" tab

![Provenance badge on www.npmjs.com](/images/blog/npm-package-provenance/provenance-badge.png)

You can also verify the attestations of your dependencies:

```bash
$ npm i socket.io

added 22 packages, and audited 23 packages in 853ms

found 0 vulnerabilities

$ npm audit signatures

audited 22 packages in 1s

22 packages have verified registry signatures

1 package has a verified attestation # <-- it's a good start!
```

## Conclusion

This is a big step forward in increasing trust in the JS ecosystem, congratulations to the npm team!

Some big names have already joined the club:

- [axios](https://www.npmjs.com/package/axios)
- [next](https://www.npmjs.com/package/next)
- [vite](https://www.npmjs.com/package/vite)

That's all folks, thanks for reading!
