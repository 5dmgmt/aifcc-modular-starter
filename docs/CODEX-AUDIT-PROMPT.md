# AIFCC Modular Starter — CODEX 5軸監査プロンプト

> **使い方**: このファイルの「監査プロンプト」セクション以降を丸ごとコピーして Codex に貼る。

---

## 監査プロンプト

あなたは AIFCC Modular Starter の最終監査を行うシニアレビュアーです。
以下の 5 軸で評価し、各項目に **PASS / WARN / FAIL** を付けてください。

### コンテキスト

- **リポジトリ**: `~/projects/aifcc-modular-starter`
- **技術スタック**: Next.js 16 / React 19 / TypeScript 5.x / Node.js 24+
- **目的**: AIFCC Workshop 受講者が Phase（PART 301-305）を順に実行して経営コックピット SaaS を構築するためのスターターテンプレート
- **直前の作業**: FDC（旧ブランド）→ AIFCC リブランド、ランブック PART 301-305 新規作成、eslint 修正、構造整理

### 監査対象スコープ

以下を **除外** する:
- `node_modules/`、`.next/`、`.git/`
- `.archive/`（退避済みファイル）
- `references/saas-docs/`（旧 SaaS ドキュメント）
- `package-lock.json`
- `docs/CODEX-AUDIT-PROMPT.md`（本ファイル自体。検索キーワードを含むため偽陽性になる）

以下を **対象に含める**:
- `app/` 全体
- `components/`
- `lib/`
- `proxy.ts`
- `docs/`（runbooks, guides, CHANGELOG 等）
- `references/`（saas-docs 以外）
- `CLAUDE.md`、`README.md`
- `eslint.config.mjs`、`next.config.ts`、`tsconfig.json`、`package.json`

---

## 軸1: 正確性（Accuracy）

> ドキュメント・コード・設定に事実誤認や不整合がないか

### チェック項目

1. **FDC 残骸ゼロ**: 監査対象スコープ内に以下が存在しないこと
   ```
   fdc, FDC, Founders Direct, foundersdirect,
   #667eea, #764ba2,
   fdc_session, fdc_admin, fdc_app_data,
   fdc-tasks, fdc-settings,
   --ancc-
   ```
   検証コマンド:
   ```bash
   rg -n 'fdc|FDC|Founders Direct|foundersdirect|founders-direct-modular|#667eea|#764ba2|fdc_session|fdc_admin|fdc_app_data|fdc-tasks|fdc-settings|--ancc-' \
     --glob '!node_modules/**' --glob '!.next/**' --glob '!.git/**' \
     --glob '!.archive/**' --glob '!references/saas-docs/**' --glob '!package-lock.json' \
     --glob '!docs/CODEX-AUDIT-PROMPT.md'
   ```

2. **ブランド定数の正確性**:
   | 項目 | 正解値 |
   |------|--------|
   | ブランド名 | `AIFCC` / `AIFCC Cockpit` |
   | ログイン用パスワード | `aifcc` |
   | 基本色 | `#31A9B8`（`--primary`） |
   | セッションキー | `aifcc_session` |
   | localStorage キー | `aifcc-tasks`, `aifcc-settings` |
   | Supabase プロジェクト名 | `aifcc` |

3. **7 タブ構成の正確性**: `app/(app)/layout.tsx` のナビゲーションが以下の 7 つであること
   - ダッシュボード、タスク、設定、Action Map、OKR、既存客、見込み客
   - MVV タブが存在しないこと

4. **ランブック存在**: `docs/runbooks/` に以下の 5 本が存在すること
   - `PART-301-FOUNDATION.md`
   - `PART-302-DATABASE.md`
   - `PART-303-CRM.md`
   - `PART-304-THREE-LAYER.md`
   - `PART-305-ADMIN.md`

5. **旧ランブック不在**: `docs/runbooks/` に `PHASE0-*`, `PHASE1-*`, `PHASE2-*` が存在しないこと

6. **プレースホルダー整合**: 各タブページの placeholder テキストが PART 番号 + ランブックファイル名を含むこと
   | タブ | 正解パターン |
   |------|-------------|
   | タスク / 設定 | `PART 301 で実装 → docs/runbooks/PART-301-FOUNDATION.md` |
   | 見込み客 / 既存客 | `PART 303 で実装 → docs/runbooks/PART-303-CRM.md` |
   | Action Map / OKR | `PART 304 で実装 → docs/runbooks/PART-304-THREE-LAYER.md` |

7. **ドキュメント間の相互参照**: README.md、CLAUDE.md、AIFCC-MODULAR-GUIDE.md、CHANGELOG.md、runbooks/README.md が互いに矛盾していないこと
   - 存在しないファイルへの参照がないこと
   - Node.js バージョン表記が一致していること
   - PART 体系（301-305）で統一されていること（旧 Phase 0-2 の記述が残っていないこと）

8. **CSS 変数の実在性**: コード中で参照している CSS 変数が `app/globals.css` の `:root` に定義されていること

---

## 軸2: 可読性（Readability）

> 受講者（非エンジニア経営者）がランブックだけで実装を進められるか

### チェック項目

1. **ランブック構造**: 全 5 本が以下の構成を持つこと
   - `## 概要`（所要時間、前提、成果物）
   - 各 Phase に `### learns`, `### prompt`, `### checks`
   - `## DoD`（PART 全体の完了条件）

2. **prompt の自己完結性**: prompt セクションに「参照コード」や「完成コードの埋め込み」がないこと。Claude Code への依頼文のみで構成されていること

3. **曖昧表現の排除**: ランブック内に以下のような表現が残っていないこと
   - 「任意名」「適宜変更」「必要なら」「お好みで」

4. **依存関係の明示**: 各 PART が前提条件（どの PART を先に完了すべきか）を明記していること

5. **localhost 動作確認**: 各 Phase 末尾に `http://localhost:3000` での具体的な動作確認手順があること

6. **用語の一貫性**: ランブック全体で以下が統一されていること
   - 「見込み客」= leads タブ = prospects テーブル
   - 「既存客」= clients タブ = clients テーブル
   - 「AIFCC Cockpit」= アプリ名（「FDC」「経営コックピット SaaS」等が混在していないこと）

---

## 軸3: アーキテクチャ（Architecture）

> スターターとしての設計品質

### チェック項目

1. **ディレクトリ構成**: App Router 規約に準拠していること
   - `app/(app)/` にレイアウト + 各ページ
   - `lib/` に共通ロジック
   - `components/` に再利用コンポーネント
   - `references/` は実装コードに import されていないこと

2. **proxy.ts**: Next.js 16 の Proxy 規約に準拠していること（`middleware.ts` ではない）

3. **認証フロー**: proxy.ts が `aifcc_session` Cookie をチェックしていること。変数名に `fdc` が残っていないこと

4. **型安全性**: `lib/types/` の型定義が `any` を使っていないこと

5. **eslint 設定**: `eslint.config.mjs` が以下を満たすこと
   - `eslint-config-next` の core-web-vitals + typescript を使用
   - `.archive/`、`references/`、`node_modules/`、`.next/` を ignore
   - `npm run lint` がエラー 0 で通ること

6. **ビルド**: `npm run build && npm run type-check && npm run lint` が全て通ること

7. **不要ファイル**: 以下が監査対象スコープに残っていないこと
   - `app/(app)/mvv/` ディレクトリ
   - `components/landing/default/`, `components/landing/shared/`
   - 旧 `PHASE0-STARTER-SETUP.md`, `PHASE1-TASKS-PAGE.md`, `PHASE2-SETTINGS-PAGE.md`

---

## 軸4: セキュリティ（Security）

> SaaS スターターとしてのセキュリティ基準

### チェック項目

1. **シークレット非露出**: 監査対象に以下が含まれていないこと
   - `.env`、`.env.local` ファイル
   - ハードコードされた API キー、パスワード（`aifcc` のデモパスワードは許容）
   - `process.env.*` の値をログ出力・ファイル書き込みするコード

2. **CLAUDE.md のセキュリティ指示**: 1Password CLI でのシークレット管理が記載されていること

3. **ランブック PART 302 のセキュリティ**: 以下が含まれていること
   - RLS（Row Level Security）の設定手順
   - 環境変数を 1Password CLI で管理する指示
   - SERVICE_ROLE_KEY を公開しない注意書き

4. **ランブック PART 305 のセキュリティ**: 以下が含まれていること
   - サーバーサイド権限チェック
   - 危険操作の確認ダイアログ
   - セキュリティヘッダー
   - 監査ログ

5. **XSS 対策**: JSX 内で `dangerouslySetInnerHTML` を使っていないこと

---

## 軸5: パフォーマンス（Performance）

> スターターテンプレートとしての軽量性

### チェック項目

1. **依存関係の最小性**: `package.json` の dependencies が必要最小限であること
   - `next`, `react`, `react-dom` は必須
   - `lucide-react` はアイコン用で許容
   - 不要な依存（使われていないパッケージ）がないこと

2. **バンドルサイズ**: `references/` が `eslint.config.mjs` で ignore されており、ビルドに含まれないこと

3. **静的レンダリング**: `npm run build` の出力で、プレースホルダーページ（tasks, settings, leads, clients, action-map, okr）が `○ (Static)` であること

4. **不要な `'use client'`**: Server Component で十分なページに `'use client'` が不要に付いていないか確認（ただし現状のプレースホルダーページは `'use client'` でも許容 — PART 実装時に最適化する前提）

---

## 出力フォーマット

以下の形式でレポートしてください:

```
# CODEX 5軸監査レポート — AIFCC Modular Starter

## サマリー

| 軸 | 判定 | 重大指摘数 | 軽微指摘数 |
|----|------|-----------|-----------|
| 正確性 | PASS/WARN/FAIL | N | N |
| 可読性 | PASS/WARN/FAIL | N | N |
| アーキテクチャ | PASS/WARN/FAIL | N | N |
| セキュリティ | PASS/WARN/FAIL | N | N |
| パフォーマンス | PASS/WARN/FAIL | N | N |

**総合判定: GO / REWORK**

GO 条件: 全軸 PASS または WARN（重大指摘 0）

## 詳細

### 軸1: 正確性
- [PASS/WARN/FAIL] チェック項目名: 説明
- ...

### 軸2: 可読性
...

（以下同様）

## 修正が必要な項目（REWORK の場合）

1. [ファイル名:行番号] 内容
2. ...
```

---

## 判定基準

| 判定 | 条件 |
|------|------|
| **PASS** | 全チェック項目をクリア |
| **WARN** | 軽微な指摘あり（機能に影響なし、ドキュメントの微修正レベル） |
| **FAIL** | 重大な指摘あり（ビルド失敗、FDC 残骸、セキュリティ問題、構造不整合） |

| 総合判定 | 条件 |
|---------|------|
| **GO** | 全 5 軸が PASS または WARN |
| **REWORK** | 1 軸でも FAIL がある |
