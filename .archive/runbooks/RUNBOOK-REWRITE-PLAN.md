# ランブック書き直し実行計画

## 目的

AIFCC Modular Starter の旧 PHASE ランブック群を、現在のスターター構成と
Course 3 の PART 301-305 に整合する形で再構成する。

この計画のゴールは、ランブック作成後に実施する最終監査で
`PASS` を積み上げ、総合判定 `GO` を取りにいくこと。

---

## 完了条件

以下をすべて満たしたら完了:

1. `docs/runbooks/` の正本が `PART-301` 〜 `PART-305` の 5 本になる
2. 各ランブックが `learns / prompt / checks / DoD` を持つ
3. スターター側の 7 タブ構成・プレースホルダー・ブランド定数が整合する
4. `npm run build && npm run lint && npm run type-check` が通る
5. 監査対象スコープから `fdc / FDC / Founders Direct / foundersdirect / #667eea / #764ba2` が消える

---

## 固定前提

### リポジトリ

- Starter: `~/projects/aifcc-modular-starter`
- Workshop: `~/プラグイン/aifcc-workshop`

### 変えてはいけない定数

| 項目 | 正 | 備考 |
|------|----|------|
| ブランド名 | `AIFCC` / `AIFCC Cockpit` | `FDC` は使わない |
| ログイン用パスワード | `aifcc` | デモ認証の正本 |
| 基本色 | `#31A9B8` | `--primary` |
| セッションキー | `aifcc_session` | cookie / localStorage |
| localStorage | `aifcc-tasks`, `aifcc-settings` | PART 301 |
| Supabase プロジェクト名 | `aifcc` | 「任意名」は不可 |
| 変数/識別子 | `aifcc_*` | `fdc_*` を残さない |

### 7タブ構成

`app/(app)/layout.tsx` の正解は次の 7 タブ:

1. ダッシュボード
2. タスク
3. 設定
4. Action Map
5. OKR
6. 既存客
7. 見込み客

`MVV` タブは廃止。新規追加タブもしない。

### 監査スコープに関する注意

最終監査プロンプトは `references/saas-docs/` と `.archive/` を除外するが、
それ以外の `references/` は監査対象に入る。

つまり、`references/api/` や `references/styles/` に `fdc` が残っていると
そのまま `FAIL` になる。現状そのリスクがあるため、以下のどちらかを必ずやる:

- その参照ファイルを AIFCC 表記に整える
- もう正本でない参照ファイルを `.archive/` 配下へ退避する

この判断を曖昧にしないこと。

---

## 作業範囲

### A. Workshop 側で直すもの

Course 3 Phase 30101-30902 のうち、FDC 残骸が確認できるのは次の 5 ファイル。

| ファイル | 修正内容 |
|----------|----------|
| `app/workshop/data/phases/course3/phase30101.ts` | `~/projects/fdc/` → `~/projects/aifcc-modular-starter/`、用語 `FDC` → `AIFCC Cockpit` |
| `app/workshop/data/phases/course3/phase30102.ts` | `fdc-tasks` → `aifcc-tasks` |
| `app/workshop/data/phases/course3/phase30103.ts` | `fdc-settings` → `aifcc-settings` |
| `app/workshop/data/phases/course3/phase30201.ts` | Supabase プロジェクト名 `fdc` → `aifcc` |
| `app/workshop/data/phases/course3/phase30902.ts` | `fdc_session` → `aifcc_session`、説明を Supabase Auth Cookie 前提に更新 |

### B. Starter 側で直すもの

| 対象 | 作業 |
|------|------|
| `app/(app)/layout.tsx` | MVV 削除、7タブに固定 |
| `app/(app)/mvv/` | 廃止 |
| `app/(app)/dashboard/page.tsx` | `--ancc-*` を `--primary` / `--text-dark` 等へ置換 |
| `proxy.ts` | 変数名 `fdcSession` を AIFCC 系に修正 |
| `components/landing/default/`, `components/landing/shared/` | `.archive/` へ退避 |
| `docs/runbooks/PHASE0-STARTER-SETUP.md` 〜 `PHASE2-SETTINGS-PAGE.md` | `.archive/` へ退避し、正本を PART 301-305 に切替 |
| `docs/runbooks/README.md` | PART 301-305 の一覧に更新 |
| `README.md`, `CLAUDE.md`, `docs/CHANGELOG.md`, `docs/AIFCC-MODULAR-GUIDE.md` | Node バージョン、PART 体系、ブランド表記、存在しないファイル参照を修正 |
| `references/` 配下の FDC 残骸 | 監査対象に残るものは AIFCC 化または `.archive/` へ退避 |

---

## 作業順序

### Step 1: Workshop の FDC 残骸修正

```bash
cd ~/プラグイン/aifcc-workshop
```

修正後の確認:

```bash
rg -n 'fdc|FDC|Founders Direct|foundersdirect|fdc_session|fdc-tasks|fdc-settings' \
  app/workshop/data/phases/course3/phase3{01,02,03,04,05,06,07,08,09}*.ts
```

期待値: ヒット 0。

---

### Step 2: Starter の構造整理と残骸掃除

```bash
cd ~/projects/aifcc-modular-starter
```

やること:

1. `MVV` タブと `app/(app)/mvv/` を削除
2. `app/(app)/layout.tsx` を 7 タブ構成に更新
3. `app/(app)/dashboard/page.tsx` の `--ancc-*` を除去
4. `proxy.ts` の `fdc*` 変数名を除去
5. `components/landing/default/` と `components/landing/shared/` を `.archive/` へ退避
6. 旧 `PHASE0-2` ランブックを `.archive/` へ退避
7. `README.md` / `CLAUDE.md` / `docs/CHANGELOG.md` / `docs/AIFCC-MODULAR-GUIDE.md` を更新
8. `references/` 配下の監査対象ファイルを整理

この Step での重要ルール:

- `docs/runbooks/` の正本は PART 301-305 のみ
- 旧 PHASE ファイルは「共存」ではなく「退避」
- `references/saas-docs/` 以外の `references/` は放置しない

---

### Step 3: eslint 修正

現状の `npm run lint` は `eslint 10.x` と `eslint-config-next 16.x` の組み合わせで
`react/display-name` 読み込みエラーが出ている。

対応方針は固定:

- `eslint` を `9.x` に戻す
- `package-lock.json` も更新する
- `lint` スクリプトは `eslint .` のまま維持する

「待つ」「一時回避スクリプトにする」は採らない。

確認:

```bash
npm run lint
```

期待値: エラー 0。

---

### Step 4: PART 301-305 ランブック新規作成

ここが主作業。新規作成する正本は次の 5 本。

| ファイル | PART | 役割 | 対応タブ |
|---------|------|------|---------|
| `docs/runbooks/PART-301-FOUNDATION.md` | 301 | タスク CRUD + 設定 | タスク / 設定 |
| `docs/runbooks/PART-302-DATABASE.md` | 302 | Supabase + Auth + Workspace 基盤 | DB 基盤 |
| `docs/runbooks/PART-303-CRM.md` | 303 | リード + クライアント管理 | 見込み客 / 既存客 |
| `docs/runbooks/PART-304-THREE-LAYER.md` | 304 | Action Map + OKR + 連携 | Action Map / OKR |
| `docs/runbooks/PART-305-ADMIN.md` | 305 | Admin + セキュリティ | 設定拡張 |

### PART ごとの必須スコープ

#### PART 301

- Phase 30101: タスクの型・保存方式・localStorage 方針
- Phase 30102: タスク CRUD UI
- Phase 30103: 設定ページ（例: エクスポート/インポート/リセット）

#### PART 302

- Phase 30201: Supabase プロジェクト作成、環境変数、初期スキーマ
- Phase 30202: Auth 導入、ログインフロー更新
- Phase 30203: workspace / role の基盤整備

#### PART 303

- Phase 30301: 見込み客タブ
- Phase 30302: 既存客タブ
- Phase 30303: リード→クライアント変換、履歴や補助データの整理

#### PART 304

- Phase 30401: Action Map ページ
- Phase 30402: OKR ページ
- Phase 30403: タスク/Action Map/OKR の紐付けと進捗反映

`Task 4象限` の独立 UI と `Google 連携` は今回はスコープ外。
理由: 現在のスターター監査対象は `Action Map` と `OKR` の 2 タブだから。

#### PART 305

- Phase 30501: Workspace Admin UI
- Phase 30502: 権限・危険操作・セキュリティ
- Phase 30503: 監査ログ・運用ルール・保守導線

### ランブック執筆ルール

各ランブックは以下を必須とする。

```md
# PART 30X: タイトル

## 概要
- 所要時間
- 前提
- 成果物

## Phase 30X01: サブタイトル

### learns
- なぜ必要か
- 何を理解するか

### prompt
- 受講者が Claude Code にそのまま貼る依頼文

### checks
- [ ] 実装チェック
- [ ] localhost 動作確認

## DoD
- [ ] PART 全体の完了条件
```

追加ルール:

1. `prompt` には参照コードを書かない
2. `prompt` はスターター内の実在パスだけを参照する
3. Workshop の Phase ファイルは品質参考に使うが、runbook 本文からは参照しない
4. `FDC` / `foundersdirect` / 旧紫色 / `fdc_*` を書かない
5. 依存関係を明示する
6. 各 Phase の末尾に `http://localhost:3000` での確認手順を入れる

---

### Step 5: プレースホルダー最終整合

正解テキストをファイル名込みで揃える:

| タブ | 正解 |
|------|------|
| タスク | `PART 301 で実装 → docs/runbooks/PART-301-FOUNDATION.md` |
| 設定 | `PART 301 で実装 → docs/runbooks/PART-301-FOUNDATION.md` |
| 見込み客 | `PART 303 で実装 → docs/runbooks/PART-303-CRM.md` |
| 既存客 | `PART 303 で実装 → docs/runbooks/PART-303-CRM.md` |
| Action Map | `PART 304 で実装 → docs/runbooks/PART-304-THREE-LAYER.md` |
| OKR | `PART 304 で実装 → docs/runbooks/PART-304-THREE-LAYER.md` |

`PART 305` は専用タブを増やさない。設定拡張として扱う。

---

### Step 6: 最終検証

```bash
# 1. ビルド / lint / 型
npm run build
npm run lint
npm run type-check

# 2. FDC 残骸ゼロ確認
rg -n 'fdc|FDC|Founders Direct|foundersdirect|#667eea|#764ba2|fdc_session|fdc_admin|fdc_app_data|fdc-tasks|fdc-settings|--ancc-' \
  . \
  --glob '!node_modules/**' \
  --glob '!.next/**' \
  --glob '!.git/**' \
  --glob '!.archive/**' \
  --glob '!references/saas-docs/**'

# 3. 新ランブック存在確認
ls docs/runbooks/PART-30*.md

# 4. MVV 残骸確認
rg -n 'MVV|/mvv' app docs README.md CLAUDE.md

# 5. プレースホルダー確認
rg -n 'PART 30[1-5].*docs/runbooks/' app/'(app)'
```

期待値:

- build / lint / type-check がすべて通る
- FDC 残骸検索が 0 件
- `PART-301` 〜 `PART-305` が存在
- `MVV` が新構成に残っていない

---

## 監査プロンプトとの整合ポイント

後続の最終監査で見られるポイントを、ここで先に満たしておく。

| 監査観点 | この計画で先回りすること |
|---------|------------------------|
| FDC 残骸ゼロ | app / docs / references / workshop を事前に掃除 |
| eslint 失敗 | Step 3 で `eslint 9.x` に固定 |
| 7タブ構成 | Step 2 で MVV 廃止 |
| ランブック整合 | Step 4 で PART 301-305 を正本化 |
| プレースホルダー | Step 5 でファイル名込みに統一 |
| ドキュメント正確性 | README / CLAUDE / GUIDE / CHANGELOG を更新 |
| デザイン一貫性 | `--primary: #31A9B8`、`--ancc-*` 除去 |

---

## 実装時の禁止事項

- 旧 `PHASE0-2` を正本として残さない
- `PART 304` に Google 連携や別タブ要件を膨らませない
- runbook の `prompt` に完成コードを埋め込まない
- 「任意名」「適宜変更」「必要なら」など監査をぶらす表現を残さない

---

## 作業見積もり

| Step | 目安 |
|------|------|
| 1. Workshop 修正 | 10分 |
| 2. Starter 整理 | 20分 |
| 3. eslint 修正 | 10分 |
| 4. ランブック 5本作成 | 主作業 |
| 5. プレースホルダー整合 | 5分 |
| 6. 最終検証 | 10分 |

主作業は Step 4。Step 1-3 と Step 5-6 は、Step 4 を通すための前提整備として扱う。
