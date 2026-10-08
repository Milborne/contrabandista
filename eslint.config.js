import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
export default [
 { ignores: ["dist/**", "node_modules/**", "research/.venv/**"] },
 { files: ["**/*.ts"], languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: 2022, sourceType: "module" } }, plugins: { "@typescript-eslint": tsPlugin }, rules: { ...tsPlugin.configs.recommended.rules, "@typescript-eslint/no-explicit-any": "error" } },
 { files: ["**/*.js"], languageOptions: { ecmaVersion: 2022, sourceType: "module" } }, prettier
];
