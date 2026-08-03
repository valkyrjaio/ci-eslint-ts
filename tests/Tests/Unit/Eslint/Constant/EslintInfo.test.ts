/*
 * This file is part of the Valkyrja ESLint package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { EslintInfo } from '../../../../../src/Eslint/Constant/EslintInfo.ts';

describe('EslintInfo', () => {
    // The release workflow rewrites both constants, so assert their shape and never an exact value.
    it('exposes the version', () => {
        expect(EslintInfo.VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('exposes the version build date time', () => {
        expect(EslintInfo.VERSION_BUILD_DATE_TIME).toMatch(/^[A-Z][a-z]+ \d{1,2} \d{4} \d{2}:\d{2}:\d{2} MST$/);
    });
});
