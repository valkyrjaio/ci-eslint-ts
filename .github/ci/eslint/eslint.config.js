/*
 * This file is part of the Valkyrja ESLint package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import path from 'path';

// This package lints itself with the artifact it publishes, rather than with its own source, so a
// broken build fails this repository's lint before it can reach a consuming repository. The eslint
// scripts build `dist` first, which is why this import resolves.
import { Rules } from '../../../dist/index.js';

export default Rules.getConfig({
    packageName: 'Valkyrja ESLint',
    tsconfigRootDir: path.resolve(import.meta.dirname, '../../..'),
    // tsconfig.tests.json spans both src and tests, so a single project covers everything linted.
    // projectService would only discover tsconfig.json, which excludes tests, leaving every test
    // file unparseable.
    project: ['./tsconfig.tests.json'],
});
