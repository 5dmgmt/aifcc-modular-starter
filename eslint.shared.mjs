/**
 * eslint.shared.mjs — 共通 ESLint ルール(aifccシリーズ)
 *
 * 正本: aifcc-shared/shared/eslint.shared.mjs(このファイルは同期コピー。直接編集しない)
 * リポジトリ固有の ignores は各リポジトリの eslint.config.mjs 側に書く。
 * ルール内容は 2026-07-02 時点の run 版(最新強化版)を正とした。
 */
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export const sharedConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_"
    }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/preserve-manual-memoization": "warn",
    "react-hooks/purity": "warn",
  },
}, {
  // scripts/ は CLI レポート用途のため console.log を許可（D-08: 常時 27 warnings の解消）
  files: ["scripts/**"],
  rules: {
    "no-console": "off",
  },
}];
