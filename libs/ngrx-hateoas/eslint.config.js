// @ts-check
const tseslint = require("typescript-eslint");
const rootConfig = require("../../eslint.config.js");

module.exports = tseslint.config(
  ...rootConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "hat",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "hat",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    rules: {},
  }
);
