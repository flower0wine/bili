import antfu from "@antfu/eslint-config";

const eslintConfig = antfu({
  nextjs: true,
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  stylistic: {
    indent: 2,
    quotes: "double",
    semi: true,
  },
  unocss: true,
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ],
  formatters: {
    css: true,
    html: true,
    markdown: "prettier",
  },

  rules: {
    // 放宽严格的 TypeScript 规则
    "ts/strict-boolean-expressions": "off",
    "ts/no-unsafe-assignment": "off",
    "ts/no-unsafe-member-access": "off",
    "ts/no-unsafe-argument": "off",
    "ts/no-unsafe-call": "off",
    "ts/no-unsafe-return": "off",
    "ts/no-floating-promises": "off",
    "ts/switch-exhaustiveness-check": "off",

    // 放宽其他严格规则
    "unicorn/prefer-number-properties": "off",
    "style/eol-last": "off",
    "style/comma-dangle": "off",
    "style/no-multiple-empty-lines": "off",
    "prefer-promise-reject-errors": "off",
    "node/prefer-global/process": "off",

    // 允许 console，但警告
    "no-console": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
  },
});

export default eslintConfig;
