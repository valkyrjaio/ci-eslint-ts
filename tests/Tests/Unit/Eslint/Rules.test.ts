/*
 * This file is part of the Valkyrja ESLint package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';

import { Rules } from '../../../../src/Eslint/Rules.ts';
import { EslintInvalidArgumentException } from '../../../../src/Eslint/Throwable/Exception/Abstract/EslintInvalidArgumentException.ts';
import { EslintInvalidPackageNameException } from '../../../../src/Eslint/Throwable/Exception/EslintInvalidPackageNameException.ts';
import { EslintInvalidParserOptionsException } from '../../../../src/Eslint/Throwable/Exception/EslintInvalidParserOptionsException.ts';

/** The options `valkyrja-ts` gives, which is the shape that names its tsconfig files. */
const PROJECT_OPTIONS = {
    packageName: 'Valkyrja Framework',
    tsconfigRootDir: '/repo',
    project: ['./tsconfig.tests.json'],
};

/** The options `sindri-ts` gives, which is the shape that lets typescript-eslint find the project. */
const SERVICE_OPTIONS = {
    packageName: 'Sindri',
    tsconfigRootDir: '/repo',
    projectService: true,
};

// `tseslint.config` flattens each preset into its own entry, and a preset carries plugins of its
// own, so "the entry that has plugins" is not this package's entry. Match the `local` plugin, which
// only this package registers.
const mainEntry = (config: Linter.Config[]): Linter.Config =>
    config.find((entry) => entry.plugins?.['local'] !== undefined) as Linter.Config;

// `strictTypeChecked` also sets `unbound-method`, so match the entry by the files it scopes to.
const testEntry = (config: Linter.Config[]): Linter.Config | undefined =>
    config.find((entry) => JSON.stringify(entry.files) === JSON.stringify(['tests/**/*.ts']));

describe('Rules', () => {
    describe('getRules', () => {
        it('turns the copyright header rule on', () => {
            expect(Rules.getRules()['local/copyright-header']).toBe('error');
        });

        // Warning: these six entries were identical in four repositories, and a repository that
        // edits its own copy drifts with no failure. Pin them, so a change here is deliberate.
        it('holds exactly the rules the repositories shared', () => {
            expect(Rules.getRules()).toStrictEqual({
                'local/copyright-header': 'error',
                '@typescript-eslint/no-namespace': 'off',
                '@typescript-eslint/no-extraneous-class': 'off',
                '@typescript-eslint/no-unnecessary-type-parameters': 'off',
                '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
                '@typescript-eslint/no-invalid-void-type': ['error', { allowAsThisParameter: true }],
            });
        });
    });

    describe('getTestRules', () => {
        it('turns off the rule that a vitest stub always trips', () => {
            expect(Rules.getTestRules()).toStrictEqual({ '@typescript-eslint/unbound-method': 'off' });
        });
    });

    describe('getParserOptions', () => {
        it('names the tsconfig files when the caller gives project', () => {
            expect(Rules.getParserOptions(PROJECT_OPTIONS)).toStrictEqual({
                project: ['./tsconfig.tests.json'],
                tsconfigRootDir: '/repo',
            });
        });

        it('lets typescript-eslint find the project when the caller gives projectService', () => {
            expect(Rules.getParserOptions(SERVICE_OPTIONS)).toStrictEqual({
                projectService: true,
                tsconfigRootDir: '/repo',
            });
        });

        // Warning: with neither option typescript-eslint reads no type information, every
        // type-aware rule goes quiet, and the run still reports success. That is a gate that
        // passes while it checks far less than the repository expects.
        it('rejects a caller that names neither', () => {
            expect(() => Rules.getParserOptions({ packageName: 'Sindri', tsconfigRootDir: '/repo' })).toThrow(
                EslintInvalidParserOptionsException,
            );
        });

        it('says which mistake the caller made when it names neither', () => {
            expect(() => Rules.getParserOptions({ packageName: 'Sindri', tsconfigRootDir: '/repo' })).toThrow(
                /neither\./,
            );
        });

        it('rejects a caller that names both', () => {
            expect(() => Rules.getParserOptions({ ...PROJECT_OPTIONS, projectService: true })).toThrow(
                EslintInvalidParserOptionsException,
            );
        });

        it('says which mistake the caller made when it names both', () => {
            expect(() => Rules.getParserOptions({ ...PROJECT_OPTIONS, projectService: true })).toThrow(/both\./);
        });

        // Both `getConfig` and `getParserOptions` are public and reach this guard, so a method name
        // in the message is wrong for one of the two callers. The message names the options.
        it('names the options rather than a method, because two methods reach the guard', () => {
            const read = (call: () => unknown): string => {
                try {
                    call();
                } catch (error) {
                    return (error as Error).message;
                }

                throw new Error('The call was expected to throw.');
            };

            const fromParserOptions = read(() =>
                Rules.getParserOptions({ packageName: 'Sindri', tsconfigRootDir: '/repo' }),
            );
            const fromConfig = read(() => Rules.getConfig({ packageName: 'Sindri', tsconfigRootDir: '/repo' }));

            expect(fromParserOptions).toBe(fromConfig);
            expect(fromParserOptions).not.toMatch(/getConfig|getParserOptions/);
        });

        it('throws an exception the package can catch by its base', () => {
            expect(() => Rules.getParserOptions({ packageName: 'Sindri', tsconfigRootDir: '/repo' })).toThrow(
                EslintInvalidArgumentException,
            );
        });
    });

    describe('getConfig', () => {
        it('carries the copyright header rule, built for the package the caller named', () => {
            const plugins = mainEntry(Rules.getConfig(PROJECT_OPTIONS)).plugins;
            const rule = plugins?.['local']?.rules?.['copyright-header'];

            expect(rule).toBeDefined();
            expect(typeof rule === 'object' && rule.meta?.fixable).toBe('code');
        });

        it('passes the parser options through', () => {
            const entry = mainEntry(Rules.getConfig(SERVICE_OPTIONS));

            expect(entry.languageOptions?.parserOptions).toStrictEqual({
                projectService: true,
                tsconfigRootDir: '/repo',
            });
        });

        it('applies the shared rules', () => {
            expect(mainEntry(Rules.getConfig(PROJECT_OPTIONS)).rules).toStrictEqual(Rules.getRules());
        });

        it('scopes the test rules to the test files', () => {
            const entry = testEntry(Rules.getConfig(PROJECT_OPTIONS));

            expect(entry?.rules).toStrictEqual(Rules.getTestRules());
        });

        it('appends what the repository adds, after the shared entries', () => {
            const override = { files: ['bin/**/*.ts'], rules: { 'no-console': 'off' } } as Linter.Config;
            const config = Rules.getConfig({ ...PROJECT_OPTIONS, overrides: [override] });

            expect(config[config.length - 1]?.files).toStrictEqual(['bin/**/*.ts']);
        });

        it('adds nothing when the repository adds nothing', () => {
            const withOverride = Rules.getConfig({ ...PROJECT_OPTIONS, overrides: [] });

            expect(withOverride).toHaveLength(Rules.getConfig(PROJECT_OPTIONS).length);
        });

        it('rejects a package name that names no package', () => {
            expect(() => Rules.getConfig({ ...PROJECT_OPTIONS, packageName: '' })).toThrow(
                EslintInvalidPackageNameException,
            );
        });

        it('rejects the parser options before it builds anything', () => {
            expect(() => Rules.getConfig({ packageName: 'Sindri', tsconfigRootDir: '/repo' })).toThrow(
                EslintInvalidParserOptionsException,
            );
        });
    });
});
