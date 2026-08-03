/*
 * This file is part of the Valkyrja ESLint package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { Rule } from 'eslint';

import { EslintInvalidPackageNameException } from '../Throwable/Exception/EslintInvalidPackageNameException.ts';

/**
 * The header body, one entry per line, with `{package}` where the package identifier goes.
 *
 * COPYRIGHT_HEADER.md in the `.github` repository holds the same text, and it maps every
 * repository to its own identifier. An empty entry renders as a bare ` *` line.
 */
const LINES = [
    'This file is part of the {package} package.',
    '',
    'Copyright (c) 2016-present Melech Mizrachi',
    '',
    'Released under the MIT License. See LICENSE.md for details.',
] as const;

/**
 * The sentence that opens the header.
 *
 * A caller that passes a whole assembled header where a package identifier belongs builds
 * `This file is part of the ⟨whole header⟩ package.`, so the factory rejects a name that
 * carries this sentence. See `validatePackageName`.
 */
const OPENING_SENTENCE = 'This file is part of the';

/**
 * Builds the copyright header, and the ESLint rule that enforces it.
 *
 * Every Valkyrja TypeScript repository takes its header from this factory and supplies only its
 * own package identifier, so the text lives in one place.
 */
export class CopyrightHeaderFactory {
    /**
     * Gets the text that sits between the two block comment delimiters.
     *
     * The rule compares the first comment of a file against this, so a file whose header body is
     * wrong fails too, and not only a file that carries no header at all.
     */
    static getComment(packageName: string): string {
        CopyrightHeaderFactory.validatePackageName(packageName);

        const body = LINES.map((line) => (line === '' ? ' *' : ` * ${line.replace('{package}', packageName)}`)).join(
            '\n',
        );

        return `\n${body}\n `;
    }

    /**
     * Gets the full header block, and the empty line that separates it from the code below it.
     */
    static getHeader(packageName: string): string {
        return `/*${CopyrightHeaderFactory.getComment(packageName)}*/\n\n`;
    }

    /**
     * Gets the ESLint rule that requires the header at the top of each linted file.
     */
    static getRule(packageName: string): Rule.RuleModule {
        const header = CopyrightHeaderFactory.getHeader(packageName);
        const comment = CopyrightHeaderFactory.getComment(packageName);

        return {
            meta: {
                type: 'layout',
                fixable: 'code',
                schema: [],
                messages: {
                    missing: 'Missing copyright header. Add the standard block comment at the top of the file.',
                    incorrect: 'Incorrect copyright header. The block comment must match the standard header exactly.',
                },
            },
            create(context: Rule.RuleContext): Rule.RuleListener {
                return {
                    Program(node): void {
                        // `getAllComments` returns the comments in source order, so the first block
                        // comment is the one that a header occupies.
                        const first = context.sourceCode.getAllComments().find((c) => c.type === 'Block');
                        const loc = first?.loc;

                        if (first === undefined || loc == null || loc.start.line !== 1) {
                            context.report({
                                node,
                                messageId: 'missing',
                                fix: (fixer) => fixer.insertTextBefore(node, header),
                            });

                            return;
                        }

                        if (first.value === comment) {
                            return;
                        }

                        // The file carries a header whose text differs. Replace that comment. An
                        // insert would put a second header above the first one.
                        context.report({
                            loc,
                            messageId: 'incorrect',
                            fix: (fixer) => fixer.replaceText(first, header.trimEnd()),
                        });
                    },
                };
            },
        };
    }

    /**
     * Rejects a value that names no package.
     *
     * Warning: the rule rewrites the header of every file it reads, and it then reports the file
     * as correct, because the file and the configuration agree. A wrong package name therefore
     * corrupts a repository behind a green gate, so this guard runs before any text is built.
     * The same defect landed in the PHP port, where a caller passed the assembled header to an
     * argument that had become the package name.
     */
    private static validatePackageName(packageName: string): void {
        if (packageName.includes('\n') || packageName.includes('\r')) {
            throw new EslintInvalidPackageNameException(
                `A package name is one line. Got ${JSON.stringify(packageName)}.`,
            );
        }

        if (packageName.includes(OPENING_SENTENCE)) {
            throw new EslintInvalidPackageNameException(
                `A package name is an identifier such as 'Valkyrja Framework', not a built header. ` +
                    `Got ${JSON.stringify(packageName)}.`,
            );
        }

        if (packageName.trim() === '') {
            throw new EslintInvalidPackageNameException('A package name holds at least one character.');
        }
    }
}
