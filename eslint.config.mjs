import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import nextPlugin from "@next/eslint-plugin-next";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,

      // ═══════════════════════════════════════════════════════════════
      // REACT - Reglas de React
      // ═══════════════════════════════════════════════════════════════
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "warn",

      // ═══════════════════════════════════════════════════════════════
      // TYPESCRIPT - Reglas de TypeScript
      // ═══════════════════════════════════════════════════════════════
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/triple-slash-reference": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // Prettier config - desactiva reglas de ESLint que conflictúan con Prettier
  // (NO ejecuta Prettier, solo evita conflictos)
  prettierConfig,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "dist/**",
      "*.config.js",
      "*.config.mjs",
      "next-env.d.ts",
      "workspace/**",
    ],
  },
];
