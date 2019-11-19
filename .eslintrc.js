module.exports = {
    env: {
        es6: true,
        node: true
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint'],
    rules: {
        // code
        'max-params': ['warn', 3],
        'max-depth': ['error', 3],
        'max-statements-per-line': ['error', { max: 1 }],
        'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
        '@typescript-eslint/ban-ts-ignore': ['warn'],
        '@typescript-eslint/interface-name-prefix': [0, 'never'],
        'arrow-parens': ['error'],
        'quote-props': ['error', 'consistent-as-needed', { numbers: true }],

        // Style
        'max-len': [`error`, { code: 200 }],
        indent: ['error', 4],
        'linebreak-style': ['error', 'windows'],
        quotes: ['error', 'double'],
        semi: ['error', 'always'],
        'brace-style': ['error', 'stroustrup'],
        'object-curly-spacing': ['error', 'always'],
        'no-mixed-spaces-and-tabs': 'error',
        'arrow-spacing': ['error'],
        'comma-dangle': ['error', 'never'],
        'comma-style': ['error']
    }
};
