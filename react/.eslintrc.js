module.exports = {
    env: {
        browser: true,
        es6: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/react',
        'prettier/@typescript-eslint',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        project: './tsconfig.json',
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    plugins: ['react', 'prettier', '@typescript-eslint', 'react-hooks'],
    rules: {
        'prettier/prettier': [
            0,
            {
                semi: true,
                singleQuote: true,
                trailingComma: 'es5',
                printWidth: 100,
                tabWidth: 2,
                arrowParens: 'avoid',
                jsxSingleQuote: false,
                jsxBracketSameLine: true,
            },
        ],
        'no-plusplus': 0,
        'no-unused-vars': 'off',
        'import/prefer-default-export': 0,
        'import/no-unresolved': 0,
        'react/jsx-filename-extension': 0,
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-use-before-define': ["error", { "functions": false }]
    },
};