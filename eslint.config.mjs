/**
 * eslint.config.mjs — AIFCC Modular Starter
 * 共通ルールは eslint.shared.mjs(正本: aifcc-shared、同期コピー)。
 * ここにはリポジトリ固有の ignores のみを書く。
 */
import { sharedConfig } from "./eslint.shared.mjs";

const eslintConfig = [...sharedConfig, {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "references/**",
    ".archive/**",
  ]
}];

export default eslintConfig;
