/*
 * This file is part of the Valkyrja ESLint package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { EslintInvalidArgumentException } from '../../../../../../src/Eslint/Throwable/Exception/Abstract/EslintInvalidArgumentException.ts';
import { EslintInvalidPackageNameException } from '../../../../../../src/Eslint/Throwable/Exception/EslintInvalidPackageNameException.ts';

describe('EslintInvalidPackageNameException', () => {
    it('carries the message it is given', () => {
        expect(new EslintInvalidPackageNameException('a reason').message).toBe('a reason');
    });

    it('names itself, so a stack trace reads as this exception', () => {
        expect(new EslintInvalidPackageNameException('a reason').name).toBe('EslintInvalidPackageNameException');
    });

    it('extends the base for a bad argument', () => {
        expect(new EslintInvalidPackageNameException('a reason')).toBeInstanceOf(EslintInvalidArgumentException);
    });

    it('extends the native error, so any caller can catch it', () => {
        expect(new EslintInvalidPackageNameException('a reason')).toBeInstanceOf(Error);
    });
});
