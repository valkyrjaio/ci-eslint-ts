<p align="center"><a href="https://valkyrja.io" target="_blank">
    <img src="https://raw.githubusercontent.com/valkyrjaio/art/refs/heads/master/long-banner/orange/typescript.png" width="100%">
</a></p>

# Valkyrja ESLint (TypeScript)

Shared ESLint configuration for the Valkyrja TypeScript repositories.

The package holds the copyright header that every Valkyrja TypeScript file
carries, and the ESLint rule that enforces it. A repository supplies only its own
package identifier. The header text lives here, in one place.

<p>
    <a href="https://www.npmjs.com/package/@valkyrjaio/ci-eslint"><img src="https://img.shields.io/npm/v/@valkyrjaio/ci-eslint.svg" alt="Latest Version on npm"></a>
    <a href="https://www.npmjs.com/package/@valkyrjaio/ci-eslint"><img src="https://img.shields.io/node/v/@valkyrjaio/ci-eslint.svg" alt="Supported Node.js Version"></a>
    <a href="https://github.com/valkyrjaio/ci-eslint-ts/blob/26.x/LICENSE.md"><img src="https://img.shields.io/github/license/valkyrjaio/ci-eslint-ts.svg" alt="License"></a>
    <a href="https://github.com/valkyrjaio/ci-eslint-ts/actions/workflows/ci.yml?query=branch%3A26.x"><img src="https://github.com/valkyrjaio/ci-eslint-ts/actions/workflows/ci.yml/badge.svg?branch=26.x" alt="CI Status"></a>
</p>

## Installation

```bash
npm install --save-dev @valkyrjaio/ci-eslint
```

Install it in the repository's `.github/ci/eslint/` directory, next to `eslint`
itself.

## Usage

Give `getRule` the repository's own package identifier, and register the rule
that it returns:

```js
import { CopyrightHeaderFactory } from '@valkyrjaio/ci-eslint';

export default tseslint.config(eslint.configs.recommended, {
    plugins: {
        local: { rules: { 'copyright-header': CopyrightHeaderFactory.getRule('Valkyrja Framework') } },
    },
    rules: {
        'local/copyright-header': 'error',
    },
});
```

`COPYRIGHT_HEADER.md` in the [`.github`][copyright header url] repository maps
every repository to its identifier. `valkyrja-ts` takes `Valkyrja Framework`,
`sindri-ts` takes `Sindri`, `valkyrja-starter-app-ts` takes
`Valkyrja Application`, and `project-template-ts` takes `Project Template`.

## The API

| Member                                    | Returns                                             |
| :---------------------------------------- | :-------------------------------------------------- |
| `CopyrightHeaderFactory.getRule(name)`    | the ESLint rule that requires the header            |
| `CopyrightHeaderFactory.getHeader(name)`  | the full block comment, and the blank line below it |
| `CopyrightHeaderFactory.getComment(name)` | the text between the two comment delimiters         |

Each member takes the package identifier, and each one rejects a value that
names no package.

## Why the package name is guarded

Warning: the rule is fixable. It rewrites the header of every file it reads, and
it then reports each file as correct, because the file and the configuration now
agree. A wrong package identifier therefore corrupts a repository behind a green
gate.

The PHP port shipped that defect. A function that took an assembled header was
changed to take a package name, one caller was not updated, and the formatter
wrote `This file is part of the ⟨whole five-line header⟩ package.` into every
file. Every check passed.

`getHeader` therefore rejects a name before it builds any text. It rejects a name
that spans more than one line, a name that carries the header's opening sentence,
and a name that holds no characters.

```js
// Wrong — the caller passes a built header, and the rule would rewrite every file.
CopyrightHeaderFactory.getRule(existingHeaderText); // throws EslintInvalidPackageNameException

// Right — the caller passes the identifier for this repository.
CopyrightHeaderFactory.getRule('Valkyrja Framework');
```

## Versioning and Release Process

This package follows [semantic versioning][semantic versioning url] with a major
release every year, and support for each major version for 2 years from the date
of release.

For more information see our
[Versioning and Release Process documentation][Versioning and Release Process url].

### Supported Versions

Bug fixes are provided until 3 months after the next major release. Security
fixes are provided for 2 years after the initial release.

| Version | Node | Release        | Bug Fixes Until | Security Fixes Until |
| :------ | :--- | :------------- | :-------------- | :------------------- |
| 26      | 22+  | March 31, 2026 | Q2 2027         | Q1 2028              |

## Contributing

See [`CONTRIBUTING.md`][contributing url] for the submission process and
[`VOCABULARY.md`][vocabulary url] for the terminology used across Valkyrja.

## Security Issues

If you discover a security vulnerability, please follow our
[disclosure procedure][security vulnerabilities url].

## License

This package is open-source software licensed under the
[MIT license][MIT license url]. See [`LICENSE.md`](./LICENSE.md).

[Valkyrja url]: https://valkyrja.io
[copyright header url]: https://github.com/valkyrjaio/.github/blob/master/COPYRIGHT_HEADER.md
[vocabulary url]: https://github.com/valkyrjaio/.github/blob/master/VOCABULARY.md
[contributing url]: https://github.com/valkyrjaio/.github/blob/master/CONTRIBUTING.md
[security vulnerabilities url]: https://github.com/valkyrjaio/.github/blob/master/SECURITY.md
[Versioning and Release Process url]: https://github.com/valkyrjaio/architecture/blob/master/VERSIONING.md
[semantic versioning url]: https://semver.org/
[MIT license url]: https://opensource.org/licenses/MIT
