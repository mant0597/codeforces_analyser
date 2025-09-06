// eslint.config.js
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    },
  },
];
