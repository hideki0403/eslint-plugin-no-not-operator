import { SyntaxKind } from 'typescript';
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
    () => `https://github.com/hideki0403/eslint-plugin-no-not-operator/`
);

type Options = ['always' | 'nullable'];
type MessageIds = 'disallowNotOperator' | 'disallowNotOperatorNullable';

export default createRule<Options, MessageIds>({
    name: 'no-not-operator-nullable',
    meta: {
        docs: {
            description: 'Disallow not operator.',
            recommended: 'recommended',
        },
        fixable: 'code',
        schema: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['always', 'nullable'],
            },
        },
        messages: {
            disallowNotOperator: 'Disallow not operator. Please use comparison operator.',
            disallowNotOperatorNullable: 'Disallow not operator if the type may be undefined or null. Please use comparison operator.',
        },
        type: 'problem',
    },
    defaultOptions: ['always'],
    create(context) {
        const config = context.options[0];
        const parserServices = ESLintUtils.getParserServices(context);
        const typeChecker = parserServices.program.getTypeChecker();

        function getType(node: TSESTree.Node) {
            const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
            const nodeType = typeChecker.getTypeAtLocation(tsNode);
            const type = typeChecker.getBaseConstraintOfType(nodeType);
            return type !== null && type !== undefined ? type : nodeType;
        }

        function report(node: TSESTree.UnaryExpression, messageId: MessageIds, fixable = false) {
            context.report({
                node,
                messageId,
                fix: fixable ? (fixer) => {
                    const sourceCode = context.sourceCode;
                    const plainText = sourceCode.getText(node.argument);
                    return fixer.replaceTextRange(node.range, `${plainText} == null`);
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

                    return report(node, 'disallowNotOperatorNullable', true);
                }
            },
        };
    },
});