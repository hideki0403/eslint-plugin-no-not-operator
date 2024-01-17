import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from '../src/rules/no-not-operator'

const ruleTester = new RuleTester({
    parserOptions: {
        sourceType: 'module',
        project: ['./tsconfig.json'],
    },
    parser: '@typescript-eslint/parser',
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
})

ruleTester.run('no-not-operator', rule, {
    // 正常パターン
    valid: [
        {
            code: `
                const boolValue = true
                if (!boolValue) {}
            `,
            options: ['nullable'],
        },
        {
            code: `
                const boolObject = { value: true }
                if (!boolObject.value) {}
            `,
            options: ['nullable'],
        },
    ],
    // エラーパターン
    invalid: [
        {
            code: `
                const boolValue = false
                if (!boolValue) {}
            `,
            errors: [{
                messageId: 'disallowNotOperator',
            }],
            options: ['always'],
        },
        {
            code: `
                const boolObject = { value: false }
                if (!boolObject.value) {}
            `,
            errors: [{
                messageId: 'disallowNotOperator',
            }],
            options: ['always'],
        },
        {
            code: `
                const boolValue = true as boolean | undefined
                if (!boolValue) {}
            `,
            errors: [{
                messageId: 'disallowNotOperatorNullable',
            }],
            output: `
                const boolValue = true as boolean | undefined
                if (boolValue === undefined) {}
            `,
            options: ['nullable'],
        },
        {
            code: `
                const boolValue = true as boolean | null
                if (!boolValue) {}
            `,
            errors: [{
                messageId: 'disallowNotOperatorNullable',
            }],
            output: `
                const boolValue = true as boolean | null
                if (boolValue === null) {}
            `,
            options: ['nullable'],
        },
        {
            code: `
                const boolValue = true as boolean | undefined | null
                if (!boolValue) {}
            `,
            errors: [{
                messageId: 'disallowNotOperatorNullable',
            }],
            output: `
                const boolValue = true as boolean | undefined | null
                if (boolValue === null || boolValue === undefined) {}
            `,
            options: ['nullable'],
        },
        {
            code: `
                const boolObject: { value?: boolean } = { value: true }
                if (!boolObject.value) {}
            `,
            errors: [{
                messageId: 'disallowNotOperatorNullable',
            }],
            output: `
                const boolObject: { value?: boolean } = { value: true }
                if (boolObject.value === undefined) {}
            `,
            options: ['nullable'],
        },
    ],
})