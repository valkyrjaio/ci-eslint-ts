/*
 * This file is part of the Valkyrja ESLint package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { EslintInvalidArgumentException } from './Abstract/EslintInvalidArgumentException.ts';

/**
 * The package name that a caller gave does not name a package.
 */
export class EslintInvalidPackageNameException extends EslintInvalidArgumentException {
    constructor(message: string) {
        super(message);

        this.name = 'EslintInvalidPackageNameException';
    }
}
