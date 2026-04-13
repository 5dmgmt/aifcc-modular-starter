# AIFCC Modular Starter - Claude Code 設定

コーディング前にこのファイルと参照ドキュメントを確認してください。

## 必読ドキュメント

- **`docs/guides/DEVELOPMENT.md`** — 技術スタック・コーディング規約・デザインガイドライン（最重要）
- **`docs/AIFCC-CORE.md`** — プロジェクト全体像・現在のPhase状況

## プロジェクト概要

- **名称**: AIFCC Modular Starter（学習用スターター）
- **技術スタック**: Next.js 16 / React 19 / TypeScript 5.x
- **Node.js**: 22.x 以上
- **コミット前必須**: `npm run type-check && npm run lint && npm run build`

## 禁止事項

1. **絵文字（Emoji）使用禁止** — SVGアイコン（Lucide React）を使用
2. **`any` 型の使用禁止** — 具体的な型を定義
3. **ブランドカラー以外の色追加禁止**

## カラーパレット（aifcc.jp 準拠）

| 用途 | CSS変数 | 値 |
|------|---------|------|
| テキスト | `--ancc-text` | #191918 |
| 背景 | `--ancc-bg` | #faf9f6 |
| 背景(alt) | `--ancc-bg-alt` | #f0eeeb |
| ボーダー | `--ancc-border` | #e5e3df |
| アクセント | `--ancc-accent` | #d4a27f（テラコッタ） |
| ボタン | `--ancc-btn-bg` | #000000 |

## Next.js 16 の注意点

必読: **`docs/guides/NEXTJS16-QUICK-REFERENCE.md`**

**重要な変更点（AIが間違えやすい）:**
- `proxy.ts` を使用（`middleware.ts` ではない）
- `params` / `searchParams` → `await` 必須（Server Component）
- `lint` スクリプトは `eslint .`（`next lint` ではない）

## 参照ファイルの使い方

`references/` ディレクトリには実装サンプルがあります：

| ディレクトリ | 内容 |
|-------------|------|
| `references/ui/` | UIコンポーネント参照 |
| `references/types/` | 型定義参照 |
| `references/contexts/` | Context 参照 |

「references/ui/task/ を参考にして」と指示すると、参照ファイルを読み込んで同様の実装を行います。
