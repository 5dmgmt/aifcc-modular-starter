# ランブック書き直し作業ランブック

## 目的

AIFCC Modular Starter のランブックと AIFCC Workshop の Phase プロンプトを、
現在のスターター構成に整合させる。

**原則**: ランブックは自己完結する。受講者はランブックだけを頼りに実装する。
Workshop の Phase ファイルは「ランブック執筆者の参照」であり、受講者に見せるものではない。

---

## 作業対象の全体像

### A. Workshop 側（~/プラグイン/aifcc-workshop/）

Course 3 の Phase ファイル 54本のうち、FDC 残骸がある **5ファイル** を修正。

| ファイル | 問題 | 修正内容 |
|----------|------|----------|
| `phase30101.ts` | `~/projects/fdc/`, `FDC` 用語定義 | パス → `~/projects/aifcc-modular-starter/`、用語 → `AIFCC Cockpit` |
| `phase30102.ts` | localStorage キー `fdc-tasks` | → `aifcc-tasks` |
| `phase30103.ts` | localStorage キー `fdc-settings` | → `aifcc-settings` |
| `phase30201.ts` | Supabase プロジェクト名 `fdc` | → `aifcc`（または任意名） |
| `phase30902.ts` | `fdc_session` Cookie 参照（4箇所） | → `aifcc_session` + Supabase Auth Cookie 説明 |

### B. スターター側（~/projects/aifcc-modular-starter/）

| 対象 | 作業 |
|------|------|
| `docs/runbooks/PHASE0-STARTER-SETUP.md` | 全面書き直し（下記参照） |
| `docs/runbooks/PHASE1-TASKS-PAGE.md` | 全面書き直し（下記参照） |
| `docs/runbooks/PHASE2-SETTINGS-PAGE.md` | 全面書き直し（下記参照） |
| `docs/runbooks/README.md` | PART 番号体系に合わせて書き直し |
| `CLAUDE.md` | カラーパレット表を `--primary: #31A9B8` に修正、Node バージョン修正 |
| `README.md` | Node バージョン修正、PART 体系の説明追加 |
| `app/(app)/dashboard/page.tsx` | 未定義トークン `--ancc-*` → `--primary` 等 |
| `app/(app)/mvv/page.tsx` | 削除（MVV タブ廃止） |
| `app/(app)/layout.tsx` | MVV タブを NAV_ITEMS から削除（7タブ構成に） |
| `components/landing/default/` | `.archive/` に移動 |
| `docs/CHANGELOG.md` | 存在しない `PHASE3-LEADS.md` への参照を削除 |
| `docs/AIFCC-MODULAR-GUIDE.md` | 同上 |

---

## 作業手順

### Step 1: Workshop の FDC 残骸修正（5ファイル）

```
cd ~/プラグイン/aifcc-workshop
```

1. `phase30101.ts` — `fdc` → `aifcc-modular-starter`、`FDC` 用語 → `AIFCC Cockpit`
2. `phase30102.ts` — `fdc-tasks` → `aifcc-tasks`
3. `phase30103.ts` — `fdc-settings` → `aifcc-settings`
4. `phase30201.ts` — Supabase プロジェクト名 `fdc` → `aifcc`
5. `phase30902.ts` — `fdc_session` → `aifcc_session`（4箇所）

**確認**: `grep -r 'fdc' app/workshop/data/phases/course3/ | grep -v node_modules` で残骸ゼロ。

**コミット**: `fix: Course 3 Phase ファイルの FDC 残骸を AIFCC に統一`

---

### Step 2: スターターの構造整理

```
cd ~/projects/aifcc-modular-starter
```

1. MVV タブ削除
   - `app/(app)/mvv/` ディレクトリ削除
   - `app/(app)/layout.tsx` の NAV_ITEMS から MVV 行を削除
   - 7タブ構成: ダッシュボード / タスク / 設定 / Action Map / OKR / 既存客 / 見込み客

2. 旧 LP コンポーネントをアーカイブ
   - `mkdir -p .archive`
   - `mv components/landing/default/ .archive/landing-default/`
   - `mv components/landing/shared/ .archive/landing-shared/`

3. ダッシュボードの未定義トークン修正
   - `app/(app)/dashboard/page.tsx` 内の `--ancc-black` → `var(--text-dark)` 等

4. CLAUDE.md 修正
   - カラーパレット表: `--primary: #31A9B8`（ティール）
   - Node.js: `22.x 以上` → `24.x（LTS）`
   - `docs/FDC-CORE.md` 参照 → `docs/AIFCC-CORE.md`

5. README.md 修正
   - Node.js バージョン修正
   - Workshop PART 体系の説明を追加
   - Phase 10101-10103 参照を削除

**確認**: `npm run build && npm run type-check` が通ること。

**コミット**: `refactor: MVV タブ削除 + 旧ファイルアーカイブ + ドキュメント整合`

---

### Step 3: eslint 修正

`npm run lint` が peer dependency 不整合で失敗している。

**選択肢**:
- A) eslint を 9.x に戻す（`npm install eslint@9 --save-dev`）
- B) eslint-config-next が eslint 10 に対応するのを待つ
- C) lint スクリプトを一時的に `eslint . --no-error-on-unmatched-pattern` に変更

**推奨**: A（eslint 9.x に戻す）が最も安全。

**確認**: `npm run lint` がエラーなしで通ること。

**コミット**: `fix: eslint バージョンを 9.x に戻して lint 復旧`

---

### Step 4: ランブック全面書き直し

**命名規則**: 旧 `PHASE0/1/2` → 新 `PART-301/302/303...`

#### 新ランブック一覧

| ファイル名 | PART | 内容 | 対応タブ |
|-----------|------|------|---------|
| `PART-301-FOUNDATION.md` | 301 | タスク CRUD + 設定ページ + localStorage | タスク / 設定 |
| `PART-302-DATABASE.md` | 302 | Supabase セットアップ + Auth + ワークスペース | （DB 基盤） |
| `PART-303-CRM.md` | 303 | リード管理 + クライアント管理 + アプローチ履歴 | 見込み客 / 既存客 |
| `PART-304-THREE-LAYER.md` | 304 | Task 4象限 + Action Map + OKR + Google連携 | Action Map / OKR |
| `PART-305-ADMIN.md` | 305 | Workspace Admin + セキュリティ | 設定（拡張） |

#### 各ランブックの構成（Workshop Phase 品質基準に準拠）

```markdown
# PART 30X: タイトル

## 概要
- 所要時間: XX分
- 前提: PART 30(X-1) 完了
- 成果物: 何ができるようになるか

## Phase 30X01: サブタイトル

### 学ぶこと（learns）
- 概念の説明（なぜ必要か）
- 覚えておくべきポイント

### 実装手順（prompt）
Claude Code への依頼文をそのまま記載。
受講者はこれをコピーして Claude Code に渡す。

### 確認（checks）
- [ ] チェックリスト
- [ ] 動作確認手順

## Phase 30X02: ...
（同構造で繰り返し）

## DoD（Definition of Done）
- [ ] 全体の完了チェックリスト
```

#### 書き直しの注意点

1. **参照コードを書かない** — Claude Code への prompt だけ書く。受講者は prompt を渡して AI に実装させる
2. **FDC 用語ゼロ** — パスワード `aifcc`、カラー `#31A9B8`、変数名 `aifcc_*`
3. **スターターの現状を前提にする** — 8→7タブ、ティールカラー、Noto Sans JP
4. **依存関係を明示** — 「PART 302 完了が前提」のように
5. **Workshop Phase ファイルを参考にする** — learns/prompt/checks の品質を揃える。ただしそのままコピーしない（ルート構造が違うため）
6. **localhost で動作確認** — 各 Phase 末尾に「ブラウザで確認」ステップを入れる

---

### Step 5: プレースホルダー最終整合

ランブック完成後、各タブのプレースホルダーを更新。

| タブ | 表示テキスト |
|------|------------|
| タスク | `PART 301 で実装 → docs/runbooks/PART-301-FOUNDATION.md` |
| 設定 | `PART 301 で実装 → docs/runbooks/PART-301-FOUNDATION.md` |
| 既存客 | `PART 303 で実装 → docs/runbooks/PART-303-CRM.md` |
| 見込み客 | `PART 303 で実装 → docs/runbooks/PART-303-CRM.md` |
| Action Map | `PART 304 で実装 → docs/runbooks/PART-304-THREE-LAYER.md` |
| OKR | `PART 304 で実装 → docs/runbooks/PART-304-THREE-LAYER.md` |

**コミット**: `docs: PART 301-305 ランブック新規作成 + プレースホルダー整合`

---

### Step 6: 最終検証

```bash
# ビルド・型・lint
npm run build && npm run type-check && npm run lint

# FDC 残骸ゼロ確認（references/saas-docs は除外）
grep -r --include='*.ts' --include='*.tsx' --include='*.css' \
  'fdc\|FDC\|Founders Direct\|#667eea\|#764ba2' \
  --exclude-dir=node_modules --exclude-dir=.next \
  --exclude-dir=.archive --exclude-dir=.git

# ランブック内の FDC 残骸ゼロ確認
grep -r 'fdc\|FDC\|Founders Direct' docs/runbooks/

# 全タブのプレースホルダーが PART 番号を参照しているか
grep -r 'Phase [0-9]' app/\(app\)/
```

すべてクリアなら `git push origin main`。

---

## 作業見積もり

| Step | 作業量 | 目安 |
|------|--------|------|
| 1. Workshop FDC 修正 | 5ファイル・軽微 | 10分 |
| 2. スターター構造整理 | ファイル移動 + 小修正 | 15分 |
| 3. eslint 修正 | パッケージ変更 | 5分 |
| 4. ランブック書き直し | **5本新規作成** | 主作業・次セッション |
| 5. プレースホルダー整合 | 6ファイル | 5分 |
| 6. 最終検証 | テスト | 10分 |

**Step 1-3, 5-6 は今のセッションで完了可能。Step 4（ランブック 5本）は次セッション。**
