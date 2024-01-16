module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es2021": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2021,
        "sourceType": "module",
        "project": "./tsconfig.json",
        "tsconfigRootDir": __dirname,
    },
    "plugins": [
        "@typescript-eslint",
    ],
};