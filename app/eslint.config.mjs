// app/eslint.config.mjs
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs", // so require/module are allowed
      globals: {
        // Node globals so 'no-undef' doesn't complain
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
      },
    },
    rules: {
      // keep whatever rules you want; this is just an example
      "no-undef": "error",
    },
  },
];
