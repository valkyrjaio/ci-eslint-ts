<p align="center"><a href="https://valkyrja.io" target="_blank">
    <img src="https://raw.githubusercontent.com/valkyrjaio/art/refs/heads/master/long-banner/orange/typescript.png" width="100%">
</a></p>

# Project Template (TypeScript)

A starter template for creating new TypeScript repositories in the Valkyrjaio
organization.

This template ships with the full Valkyrja CI pipeline pre-wired (TypeScript,
ESLint, Prettier, Vitest), a minimal npm setup, and the repository conventions
used across the rest of the org. Use it as the starting point for any new
TypeScript package, CI tool config, or integration repo — not for end-user
applications built on the Valkyrja framework (use
[`valkyrja-starter-app-ts`][starter url] for that).

<p>
    <a href="https://www.npmjs.com/package/@valkyrjaio/ts-template"><img src="https://img.shields.io/npm/v/@valkyrjaio/ts-template.svg" alt="Latest Version on npm"></a>
    <a href="https://www.npmjs.com/package/@valkyrjaio/ts-template"><img src="https://img.shields.io/node/v/@valkyrjaio/ts-template.svg" alt="Supported Node.js Version"></a>
    <a href="https://github.com/valkyrjaio/project-template-ts/blob/26.x/LICENSE.md"><img src="https://img.shields.io/github/license/valkyrjaio/project-template-ts.svg" alt="License"></a>
    <a href="https://github.com/valkyrjaio/project-template-ts/actions/workflows/ci.yml?query=branch%3A26.x"><img src="https://github.com/valkyrjaio/project-template-ts/actions/workflows/ci.yml/badge.svg?branch=26.x" alt="CI Status"></a>
</p>

## Usage

### Use this template _(recommended)_

This repository is a GitHub template. Click the **Use this template** button
at the top of the repo to create a new repository in the Valkyrjaio
organization, pre-populated with the template's structure and CI.

### After Creating Your Repo

1. Update `package.json` with your package's name, description, and exports
2. Replace the contents of `src/` with your package's source code
3. Update this `README.md` to describe the new package
4. Configure the required secrets and variables — see
   [`REPOSITORY_NAMING.md`][repository naming url] for naming guidance and
   `.github`'s workflow documentation for secret requirements
5. Verify CI passes on the first commit

## What's Included

- **Full CI pipeline** — the same TypeScript, ESLint, Prettier, and Vitest
  configuration used across every Valkyrjaio TypeScript repo
- **npm configuration** — `package.json` with scripts for each CI tool,
  matching the org convention
- **Repository conventions** — aligned with
  [`REPOSITORY_NAMING.md`][repository naming url] and
  [`VOCABULARY.md`][vocabulary url]

## Versioning and Release Process

This template follows [semantic versioning][semantic versioning url] with a
major release every year, and support for each major version for 2 years
from the date of release.

For more information see our
[Versioning and Release Process documentation][Versioning and Release Process url].

### Supported Versions

Bug fixes are provided until 3 months after the next major release. Security
fixes are provided for 2 years after the initial release.

| Version | Node | Release        | Bug Fixes Until | Security Fixes Until |
| :------ | :--- | :------------- | :-------------- | :------------------- |
| 26      | 22+  | March 31, 2026 | Q2 2027         | Q1 2028              |

## Contributing

This template is an open-source, community-driven project. Improvements to
the template itself — refinements to the included CI configuration, npm
setup, or documentation — are welcome.

See [`CONTRIBUTING.md`][contributing url] for the submission process and
[`VOCABULARY.md`][vocabulary url] for the terminology used across Valkyrja.

## Security Issues

If you discover a security vulnerability, please follow our
[disclosure procedure][security vulnerabilities url].

## License

This template is open-source software licensed under the
[MIT license][MIT license url]. See [`LICENSE.md`](./LICENSE.md).

[Valkyrja url]: https://valkyrja.io
[starter url]: https://github.com/valkyrjaio/valkyrja-starter-app-ts
[repository naming url]: https://github.com/valkyrjaio/.github/blob/master/REPOSITORY_NAMING.md
[vocabulary url]: https://github.com/valkyrjaio/.github/blob/master/VOCABULARY.md
[contributing url]: https://github.com/valkyrjaio/.github/blob/master/CONTRIBUTING.md
[security vulnerabilities url]: https://github.com/valkyrjaio/.github/blob/master/SECURITY.md
[Versioning and Release Process url]: https://github.com/valkyrjaio/.github/blob/master/VERSIONING_AND_RELEASE_PROCESS.md
[semantic versioning url]: https://semver.org/
[MIT license url]: https://opensource.org/licenses/MIT
[license url]: ./LICENSE.md
