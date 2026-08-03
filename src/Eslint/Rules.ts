/*
 * This file is part of the Valkyrja ESLint package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import eslint from '@eslint/js';
import type { Linter } from 'eslint';
// `defineConfig` comes from ESLint core. `tseslint.config` did the same job and is deprecated.
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import { CopyrightHeaderFactory } from './Factory/CopyrightHeaderFactory.ts';
import { EslintInvalidParserOptionsException } from './Throwable/Exception/EslintInvalidParserOptionsException.ts';

/**
 * What a repository states about itself.
 *
 * Every other part of the configuration is the same in each repository, so this package holds it.
 */
export interface RulesOptions {
    /** The package identifier the header states, such as `Valkyrja Framework`. */
    packageName: string;
    /** The absolute directory that a `project` path resolves from. */
    tsconfigRootDir: string;
    /** The TypeScript projects to read. Give this, or `projectService`, and never both. */
    project?: string[];
    /** Let typescript-eslint find the project. Give this, or `project`, and never both. */
    projectService?: boolean;
    /** Flat configuration entries this repository adds after the shared ones. */
    overrides?: Linter.Config[];
}

/**
 * Builds the ESLint configuration that every Valkyrja TypeScript repository runs.
 *
 * A repository that keeps its own copy of these rules drifts from the others, and no tool reports
 * the drift. This class therefore holds the rules, and a repository states only what is true of
 * itself: its package identifier, and how to find its TypeScript project.
 */
export class Rules {
    /**
     * Builds the whole configuration.
     *
     * @throws EslintInvalidParserOptionsException When the caller names neither `project` nor
     *                                             `projectService`, or names both
     */
    static getConfig(options: RulesOptions): Linter.Config[] {
        return defineConfig([
            eslint.configs.recommended,
            tseslint.configs.strictTypeChecked,
            {
                languageOptions: {
                    parserOptions: Rules.getParserOptions(options),
                },
                plugins: {
                    local: { rules: { 'copyright-header': CopyrightHeaderFactory.getRule(options.packageName) } },
                },
                rules: Rules.getRules(),
            },
            {
                files: ['tests/**/*.ts'],
                rules: Rules.getTestRules(),
            },
            ...(options.overrides ?? []),
        ]);
    }

    /**
     * The rules that apply to every linted file.
     */
    static getRules(): Linter.RulesRecord {
        return {
            'local/copyright-header': 'error',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-extraneous-class': 'off',
            '@typescript-eslint/no-unnecessary-type-parameters': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-invalid-void-type': ['error', { allowAsThisParameter: true }],
        };
    }

    /**
     * The rules that apply to a test file only.
     *
     * A test builds a stub as `{ method: vi.fn() } as unknown as SomeContract`, so
     * `expect(stub.method)` reads the method off the contract type purely to assert on the spy. The
     * test never invokes the method unbound. `unbound-method` sees the declared contract type only,
     * and it cannot tell the two apart, so it reports every such assertion. The rule still applies
     * in full to `src`.
     */
    static getTestRules(): Linter.RulesRecord {
        return {
            '@typescript-eslint/unbound-method': 'off',
        };
    }

    /**
     * The parser options that find the repository's TypeScript project.
     *
     * A repository picks one of the two ways. `project` names the tsconfig files to read, which a
     * repository needs when one tsconfig spans both `src` and `tests`. `projectService` lets
     * typescript-eslint find the project, which reads `tsconfig.json` only.
     *
     * @throws EslintInvalidParserOptionsException When the caller names neither, or both
     */
    static getParserOptions(options: RulesOptions): Record<string, unknown> {
        const hasProject = options.project !== undefined;
        const hasProjectService = options.projectService !== undefined;

        // Warning: neither option set means typescript-eslint parses no type information, and every
        // type-aware rule goes quiet while the run still reports success. Both set is ambiguous.
        // Stop on each, rather than pick one and lint less than the repository expects.
        if (hasProject === hasProjectService) {
            // The message names the options rather than a method. Both `getConfig` and
            // `getParserOptions` are public and reach this guard, so a method name in the text is
            // wrong for one of the two callers.
            throw new EslintInvalidParserOptionsException(
                'The options take either `project` or `projectService`, and they name ' +
                    (hasProject ? 'both.' : 'neither.'),
            );
        }

        if (options.project !== undefined) {
            return { project: options.project, tsconfigRootDir: options.tsconfigRootDir };
        }

        return { projectService: options.projectService, tsconfigRootDir: options.tsconfigRootDir };
    }
}
