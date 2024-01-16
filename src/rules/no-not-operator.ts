import { SyntaxKind } from 'typescript';
import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';

const createRule = ESLintUtils.RuleCreator(
    () => `https://github.com/hideki0403/eslint-plugin-no-not-operator/`
);

export const rule = createRule({
    name: 'no-not-operator-nullable',
    meta: {
        docs: {
            description: 'Disallow not operator.',
            recommended: 'warn',
        },
        fixable: 'code',
        schema: {
            type: 'array',
            items: {
                enum: ['always', 'nullable'],
            },
            additionalProperties: false,
        },
        messages: {
            disallowNotOperator: 'Disallow not operator. Please use comparison operator.',
            disallowNotOperatorNullable: 'Disallow not operator if the type may be undefined or null. Please use comparison operator.',
        },
        type: 'problem',
    },
    defaultOptions: [] as ('always' | 'nullable')[],
    create(context) {
        const config: string = context.options[0] ?? 'always';
        const parserServices = ESLintUtils.getParserServices(context);
        const typeChecker = parserServices.program.getTypeChecker();

        function getType(node: TSESTree.Node) {
            const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
            const nodeType = typeChecker.getTypeAtLocation(tsNode);
            const type = typeChecker.getBaseConstraintOfType(nodeType);
            return type !== null && type !== undefined ? type : nodeType;
        }

        function report(node: TSESTree.UnaryExpression, messageId: any, hasNull = false, hasUndefined = false) {
            context.report({
                node,
                messageId,
                fix: hasNull || hasUndefined ? (fixer) => {
                    const sourceCode = context.getSourceCode();
                    const token = sourceCode.getTokenAfter(node);
                    const plainText = sourceCode.getText(node.argument);

                    const replaceTexts: string[] = []
                    if (hasNull) replaceTexts.push(`${plainText} === null`);
                    if (hasUndefined) replaceTexts.push(`${plainText} === undefined`);

                    return fixer.replaceTextRange([node.range[0], token!.range[1] - 1], replaceTexts.join(' || '));
                } : undefined,
            });
        }

        return {
            UnaryExpression(node) {
                if (node.operator !== '!') return;

                if (config === 'always') {
                    return report(node, 'disallowNotOperator');
                }

                const type = getType(node.argument);
                const typeNode = typeChecker.typeToTypeNode(type, undefined, undefined);

                if (typeNode?.kind === SyntaxKind.UnionType) {
                    const syntaxKinds = (typeNode as any).types.map((item: any) => {
                        return item.kind === SyntaxKind.LiteralType ? item.literal.kind : item.kind;
                    }) as SyntaxKind[];
                    
                    const hasNull = syntaxKinds.includes(SyntaxKind.NullKeyword);
                    const hasUndefined = syntaxKinds.includes(SyntaxKind.UndefinedKeyword);

                    if (!hasUndefined && !hasNull) return;

                    return report(node, 'disallowNotOperatorNullable', hasNull, hasUndefined);
                }
            },
        };
    },
});