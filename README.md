# @hideki0403/eslint-plugin-no-not-operator

An ESLint plugin to disallow the use of the not operator.

## Installation

```sh
npm install --save-dev eslint @hideki0403/eslint-plugin-no-not-operator
```

## Usage

```js
// .eslintrc.js
module.exports = {
  plugins: ['@hideki0403/no-not-operator'],
  rules: {
    '@hideki0403/no-not-operator/no-not-operator': ['error', OPTION], // OPTION: 'always' or 'nullable'
  },
};
```

## Rule options
#### `always` (default)
not operator is always disallowed.

```ts
// Error
const foo = true;
if (!foo) {
  // ^~~ Error: Disallow not operator. Please use comparison operator.
}
```

#### `nullable`
not operator is disallowed only if the type may be undefined or null.

```ts
// OK
const foo = true;
if (!foo) {
  // ...
}

// Error
const foo = true as true | null | undefined;
if (!foo) {
  // ^~~ Error: Disallow not operator if the type may be undefined or null. Please use comparison operator.
}
```