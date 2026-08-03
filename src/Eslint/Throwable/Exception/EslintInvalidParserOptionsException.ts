/*
 * This file is part of the Valkyrja ESLint package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { EslintInvalidArgumentException } from './Abstract/EslintInvalidArgumentException.ts';

/**
 * The caller named neither, or both, of the two ways to find the TypeScript project.
 */
export class EslintInvalidParserOptionsException extends EslintInvalidArgumentException {
    constructor(message: string) {
        super(message);

        this.name = 'EslintInvalidParserOptionsException';
    }
}
