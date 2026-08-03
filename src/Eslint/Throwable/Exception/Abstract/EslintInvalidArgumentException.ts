/*
 * This file is part of the Valkyrja ESLint package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

/**
 * The base for every exception this package throws for a bad argument.
 *
 * The chain roots in the native `Error` rather than in `ValkyrjaInvalidArgumentException`. An
 * ESLint configuration is plain JavaScript that Node loads directly, so this package cannot
 * depend on `@valkyrjaio/valkyrja`, which ships TypeScript source that Node does not compile.
 */
export abstract class EslintInvalidArgumentException extends Error {}
