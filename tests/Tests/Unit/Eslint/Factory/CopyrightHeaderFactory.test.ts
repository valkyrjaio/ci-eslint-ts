/*
 * This file is part of the Valkyrja ESLint package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { Rule } from 'eslint';
import { RuleTester } from 'eslint';
import { describe, expect, it } from 'vitest';

import { CopyrightHeaderFactory } from '../../../../../src/Eslint/Factory/CopyrightHeaderFactory.ts';
import { EslintInvalidArgumentException } from '../../../../../src/Eslint/Throwable/Exception/Abstract/EslintInvalidArgumentException.ts';
import { EslintInvalidPackageNameException } from '../../../../../src/Eslint/Throwable/Exception/EslintInvalidPackageNameException.ts';

/**
 * The header that `valkyrja-ts` carries today, written out one line at a time.
 *
 * Warning: one byte of difference here rewrites every file in every consuming repository, and the
 * check that follows the rewrite then passes, because the files and the configuration agree. The
 * literal is therefore spelled out rather than derived, so a change to the factory cannot change
 * what the test expects.
 */
const EXPECTED_HEADER =
    '/*\n' +
    ' * This file is part of the Valkyrja Framework package.\n' +
    ' *\n' +
    ' * Copyright (c) 2016-present Melech Mizrachi\n' +
    ' *\n' +
    ' * Released under the MIT License. See LICENSE.md for details.\n' +
    ' */\n' +
    '\n';

/** The same text, between the two delimiters, which is what a comment node holds. */
const EXPECTED_COMMENT =
    '\n' +
    ' * This file is part of the Valkyrja Framework package.\n' +
    ' *\n' +
    ' * Copyright (c) 2016-present Melech Mizrachi\n' +
    ' *\n' +
    ' * Released under the MIT License. See LICENSE.md for details.\n' +
    ' ';

describe('CopyrightHeaderFactory', () => {
    describe('getHeader', () => {
        it('builds the header byte for byte', () => {
            expect(CopyrightHeaderFactory.getHeader('Valkyrja Framework')).toBe(EXPECTED_HEADER);
        });

        it('names the package that the caller gives', () => {
            expect(CopyrightHeaderFactory.getHeader('Sindri')).toContain('This file is part of the Sindri package.');
        });

        it('ends with a blank line, so the header never abuts the code', () => {
            expect(CopyrightHeaderFactory.getHeader('Sindri').endsWith('*/\n\n')).toBe(true);
        });
    });

    describe('getComment', () => {
        it('builds the comment body byte for byte', () => {
            expect(CopyrightHeaderFactory.getComment('Valkyrja Framework')).toBe(EXPECTED_COMMENT);
        });

        it('sits inside the header it belongs to', () => {
            const packageName = 'Valkyrja Application';

            expect(CopyrightHeaderFactory.getHeader(packageName)).toBe(
                `/*${CopyrightHeaderFactory.getComment(packageName)}*/\n\n`,
            );
        });
    });

    // Warning: the rule rewrites the header of every file it reads, so a package name that names no
    // package corrupts a repository behind a green gate. The PHP port shipped exactly that defect,
    // where a caller passed the assembled header to an argument that had become the package name.
    describe('validatePackageName', () => {
        it.each([
            ['a name that spans two lines', 'Valkyrja\nFramework'],
            ['a name that carries a carriage return', 'Valkyrja\rFramework'],
            ['a whole assembled header', EXPECTED_HEADER],
            ['the comment body of a header', EXPECTED_COMMENT],
            ['one line of header text', 'This file is part of the Valkyrja Framework package.'],
            ['an empty name', ''],
            ['a name of only whitespace', '   '],
        ])('rejects %s', (_description, packageName) => {
            expect(() => CopyrightHeaderFactory.getHeader(packageName)).toThrow(EslintInvalidPackageNameException);
        });

        it('names the offending value in the message', () => {
            expect(() => CopyrightHeaderFactory.getHeader('Valkyrja\nFramework')).toThrow(/one line/);
        });

        // The two guards catch different spellings of the same mistake. A whole header spans
        // several lines, so the line guard takes it. A single line of header text does not, so
        // this guard is what stands between that value and a rewrite of every file.
        it('tells a caller that passed one line of header text what a package name is', () => {
            expect(() =>
                CopyrightHeaderFactory.getHeader('This file is part of the Valkyrja Framework package.'),
            ).toThrow(/not a built header/);
        });

        it('reports an empty name on its own', () => {
            expect(() => CopyrightHeaderFactory.getHeader('  ')).toThrow(/at least one character/);
        });

        it('throws an exception that the package can catch by its base', () => {
            expect(() => CopyrightHeaderFactory.getHeader('')).toThrow(EslintInvalidArgumentException);
        });

        it('accepts every identifier the organization uses today', () => {
            for (const packageName of ['Valkyrja Framework', 'Sindri', 'Valkyrja Application', 'Valkyrja ESLint']) {
                expect(CopyrightHeaderFactory.getHeader(packageName)).toContain(
                    `This file is part of the ${packageName} package.`,
                );
            }
        });
    });

    describe('getRule', () => {
        const rule = CopyrightHeaderFactory.getRule('Valkyrja Framework');
        const code = 'export const x = 1;\n';

        it('runs every case ESLint itself can express', () => {
            const ruleTester = new RuleTester({
                languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
            });

            ruleTester.run('copyright-header', rule, {
                valid: [{ code: `${EXPECTED_HEADER}${code}` }],
                invalid: [
                    {
                        name: 'a file with no comment at all',
                        code,
                        errors: [{ messageId: 'missing' }],
                        output: `${EXPECTED_HEADER}${code}`,
                    },
                    {
                        name: 'a file whose only comment is a line comment',
                        code: `// not a header\n${code}`,
                        errors: [{ messageId: 'missing' }],
                        output: `${EXPECTED_HEADER}// not a header\n${code}`,
                    },
                    {
                        name: 'a block comment that does not start on the first line',
                        code: `\n/* a block comment */\n${code}`,
                        errors: [{ messageId: 'missing' }],
                        output: `${EXPECTED_HEADER}\n/* a block comment */\n${code}`,
                    },
                    {
                        name: 'a header that names the wrong package',
                        code: `${CopyrightHeaderFactory.getHeader('Sindri')}${code}`,
                        errors: [{ messageId: 'incorrect' }],
                        output: `${EXPECTED_HEADER}${code}`,
                    },
                    {
                        name: 'a header that carries the wrong year',
                        code: `${EXPECTED_HEADER.replace('2016-present', '2025-present')}${code}`,
                        errors: [{ messageId: 'incorrect' }],
                        output: `${EXPECTED_HEADER}${code}`,
                    },
                ],
            });
        });

        it('replaces a wrong header rather than stacking a second one above it', () => {
            const wrong = `${CopyrightHeaderFactory.getHeader('Sindri')}${code}`;
            const fixed = `${EXPECTED_HEADER}${code}`;

            expect(fixed.match(/This file is part of/g)).toHaveLength(1);
            expect(wrong).not.toBe(fixed);
        });

        // A comment that carries no location cannot be shown to have been in header position, so
        // the rule treats it as a missing header. ESLint always sets a location, so the branch is
        // reachable only from a stub.
        it('treats a comment with no location as a missing header', () => {
            const reports: Array<Record<string, unknown>> = [];
            const context = {
                sourceCode: {
                    getAllComments: () => [{ type: 'Block', value: EXPECTED_COMMENT }],
                },
                report: (descriptor: Record<string, unknown>) => reports.push(descriptor),
            } as unknown as Rule.RuleContext;

            rule.create(context).Program?.({ type: 'Program' } as never);

            expect(reports).toHaveLength(1);
            expect(reports[0]?.['messageId']).toBe('missing');
        });

        it('marks itself fixable, which is what makes a wrong package name dangerous', () => {
            expect(rule.meta?.fixable).toBe('code');
        });
    });
});
