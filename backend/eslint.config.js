module.exports = [
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
