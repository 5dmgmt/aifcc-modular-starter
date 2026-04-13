# ランブック書き直し作業ランブック（v2）

## 目的

AIFCC Modular Starter のランブックと AIFCC Workshop の Phase プロンプトを、
現在のスターター構成に整合させる。

**原則**:
- ランブックは自己完結する。受講者はランブックだけを頼りに実装する
- Workshop の Phase ファイルは「ランブック執筆者の参照」であり、受講者に見せるものではない
- PART 301 の核心は「ランブックを AI に書かせる」体験。固定手順を渡すのではなく、プロンプトの書き方を教える
- スターターのルートは `/tasks`（フラット）。Workshop の `/workspace/[id]/tasks` とは異なる

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
| `docs/runbooks/PHASE0-*.md`, `PHASE1-*.md`, `PHASE2-*.md` | `.archive/runbooks/` に移動 |
| `docs/runbooks/README.md` | PART 番号体系に合わせて書き直し |
| `references/` | `.archive/references/` に移動（ランブックからは参照しない） |
| `components/landing/default/`, `components/landing/shared/` | `.archive/landing/` に移動 |
| `app/(app)/mvv/` | 削除（MVV タブ廃止） |
| `app/(app)/layout.tsx` | MVV タブを NAV_ITEMS から削除（7タブ構成に） |
| `app/(app)/dashboard/page.tsx` | 未定義トークン `--ancc-*` → `var(--primary)` 等、次のステップを PART 体系に |
| `CLAUDE.md` | カラーパレット `--primary: #31A9B8`、Node 24.x LTS |
| `README.md` | Node バージョン修正、PART 体系の説明、Phase 10101 参照削除 |
| `docs/CHANGELOG.md` | 存在しない `PHASE3-LEADS.md` への参照を削除 |
| `docs/AIFCC-MODULAR-GUIDE.md` | 同上 |

---

## PART とタブの対応表（確定版）

| PART | 名前 | 内容 | 対応タブ | 備考 |
|------|------|------|---------|------|
| 301 | Foundation | ランブック生成 + タスク CRUD + 設定ページ | タスク / 設定 | Phase 30101 は「ランブックを AI に書かせる」体験 |
| 302 | Database | Supabase + Auth + ワークスペース | （新タブなし） | 既存タブの裏側を localStorage → Supabase に移行 |
| 303 | CRM | リード + クライアント + アプローチ履歴 | 見込み客 / 既存客 | PART 302 完了が前提 |
| 304 | 3-Layer & Google | Task 4象限 + Action Map + OKR + Google連携 | Action Map / OKR | PART 303 完了が前提 |
| 305 | Admin & セキュリティ | Workspace Admin + セキュリティ | 設定（拡張） | PART 304 完了が前提 |

**注意**: Workshop は `/workspace/[id]/tasks` 形式だが、スターターは `/tasks` のフラットルート。
ランブックのプロンプトはスターターのルートで書く。

---

## 作業手順

### Step 1: Workshop の FDC 残骸修正（5ファイル）

```
cd ~/プラグイン/aifcc-workshop
```

1. `phase30101.ts` — `~/projects/fdc/` → `~/projects/aifcc-modular-starter/`、`FDC` 用語 → `AIFCC Cockpit`
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

#### 2.1 アーカイブ

```bash
mkdir -p .archive/runbooks .archive/landing .archive/references
mv docs/runbooks/PHASE0-STARTER-SETUP.md .archive/runbooks/
mv docs/runbooks/PHASE1-TASKS-PAGE.md .archive/runbooks/
mv docs/runbooks/PHASE2-SETTINGS-PAGE.md .archive/runbooks/
mv components/landing/default/ .archive/landing/default/
mv components/landing/shared/ .archive/landing/shared/
mv references/ .archive/references/
```

#### 2.2 MVV タブ削除

- `rm -rf app/(app)/mvv/`
- `app/(app)/layout.tsx` の NAV_ITEMS から MVV 行を削除
- 7タブ構成: ダッシュボード / タスク / 設定 / Action Map / OKR / 既存客 / 見込み客

#### 2.3 ダッシュボードの CSS トークン修正

`app/(app)/dashboard/page.tsx` 内:
- `--ancc-black` → `var(--text-dark)`
- `rgba(25, 25, 24, ...)` はそのまま（CSS変数に依存していないので問題なし）
- 「次のステップ」を修正:
  - PART 301: タスク・設定を追加 ← 済み
  - PART 302: DB・認証に移行
  - PART 303: 顧客管理を追加

#### 2.4 ドキュメント修正

**CLAUDE.md**:
- カラーパレット表: `--primary: #31A9B8`（ティール）
- Node.js: → `24.x（LTS）`
- `docs/FDC-CORE.md` 参照 → `docs/AIFCC-CORE.md`

**README.md**:
- Node.js バージョン → 24.x
- Phase 10101-10103 のワークショップ参照を削除
- PART 体系の説明を追加

**docs/CHANGELOG.md**, **docs/AIFCC-MODULAR-GUIDE.md**:
- 存在しない `PHASE3-LEADS.md` 等への参照を削除

#### 2.5 .gitignore に .archive 追加

```
# Archive
.archive/
```

**確認**: `npm run build && npm run type-check` が通ること。

**コミット**: `refactor: 旧ファイルアーカイブ + MVV削除 + ドキュメント整合`

---

### Step 3: eslint 修正

`npm run lint` が peer dependency 不整合で失敗している。

```bash
npm install eslint@9 --save-dev
```

**確認**: `npm run lint` がエラーなしで通ること。

**コミット**: `fix: eslint を 9.x に戻して lint 復旧`

---

### Step 4: ランブック新規作成

**重要**: 1セッションで全部書こうとしない。**PART 301 を最初に書き、動作検証してから 302 以降に進む。**

#### 命名規則

| ファイル名 | PART |
|-----------|------|
| `PART-301-FOUNDATION.md` | 301 |
| `PART-302-DATABASE.md` | 302 |
| `PART-303-CRM.md` | 303 |
| `PART-304-THREE-LAYER.md` | 304 |
| `PART-305-ADMIN.md` | 305 |

#### 各ランブックの構成

```markdown
# PART 30X: タイトル

## 概要
- 所要時間: XX分
- 前提: PART 30(X-1) 完了
- 成果物: 何ができるようになるか
- ルート構造: /tasks（フラットルート。Workshop の /workspace/[id]/tasks とは異なる）

## Phase 30X01: サブタイトル

### 学ぶこと（learns）
- 概念の説明（なぜ必要か）
- 覚えておくべきポイント

### 実装手順（prompt）
Claude Code への依頼文をそのまま記載。
受講者はこれをコピーして Claude Code に渡す。

### 確認（checks）
- [ ] チェックリスト
- [ ] ブラウザで http://localhost:3000/xxx を開いて動作確認

## Phase 30X02: ...
（同構造で繰り返し）

## DoD（Definition of Done）
- [ ] 全体の完了チェックリスト
- [ ] npm run build が通る
- [ ] ブラウザで全タブの動作を確認
```

#### PART 301 の特殊性

Phase 30101 は「ランブックを AI に書かせる」フェーズ。他の Phase とは性質が異なる。

```markdown
## Phase 30101: ランブック生成

### 学ぶこと
- ランブック駆動開発とは何か
- AI に要件を伝えるプロンプトの書き方
- 生成されたランブックのレビュー方法

### 実装手順（prompt）
「自社の業務データ（Excel 等）をもとに、AIFCC Cockpit の開発ランブックを
RUNBOOK.md として作成して。以下の構成で: ...」

### 確認
- [ ] RUNBOOK.md が生成された
- [ ] データ構造・画面一覧・機能一覧が含まれている
- [ ] 自分の業務に合っている
```

受講者が Excel を持っていない場合のフォールバック手順も記載する。

#### 書き直しの注意点

1. **参照コードを書かない** — Claude Code への prompt だけ書く
2. **FDC 用語ゼロ** — パスワード `aifcc`、カラー `#31A9B8`、変数名 `aifcc_*`
3. **スターターの現状を前提** — 7タブ、ティールカラー、Noto Sans JP、フラットルート
4. **依存関係を明示** — 「PART 302 完了が前提」
5. **Workshop Phase を参考にするがコピーしない** — ルート構造が違う
6. **各 Phase 末尾にブラウザ確認** — `localhost:3000` で動作確認

#### 参考にする Workshop Phase ファイル

| ランブック | 参照する Workshop Phase | 注意点 |
|-----------|----------------------|--------|
| PART-301 | phase30101, phase30102, phase30103 | 30101 はランブック生成。ルート `/tasks` |
| PART-302 | phase30201, phase30202, phase30203 | Supabase プロジェクト名 `aifcc` |
| PART-303 | phase30301, phase30302, phase30303 | ルート `/leads`, `/clients`（フラット） |
| PART-304 | phase30401, phase30402, phase30403 | ルート `/action-map`, `/okr`（フラット） |
| PART-305 | phase30501, phase30502, phase30503 | 設定タブ内に Admin セクション追加 |

---

### Step 4.5: ランブック動作検証

**各 PART のランブック完成後に必ず実施。**

```bash
# 検証用にスターターを別ディレクトリにクローン
cd /tmp
gh repo clone 5dmgmt/aifcc-modular-starter aifcc-test
cd aifcc-test
npm install
npm run dev
```

1. ランブックの Phase 30X01 から順に、プロンプトを Claude Code にそのまま渡す
2. 生成されたコードが正しく動くか確認
3. checks のチェックリストがすべて通るか確認
4. 詰まったポイントがあればランブックを修正

**検証に失敗したランブックは push しない。**

---

### Step 5: プレースホルダー最終整合

ランブック完成 + 動作検証後に、各タブのプレースホルダーを更新。

| タブ | 表示テキスト |
|------|------------|
| タスク | `PART 301 で実装 → docs/runbooks/PART-301-FOUNDATION.md` |
| 設定 | `PART 301 で実装 → docs/runbooks/PART-301-FOUNDATION.md` |
| 既存客 | `PART 303 で実装 → docs/runbooks/PART-303-CRM.md` |
| 見込み客 | `PART 303 で実装 → docs/runbooks/PART-303-CRM.md` |
| Action Map | `PART 304 で実装 → docs/runbooks/PART-304-THREE-LAYER.md` |
| OKR | `PART 304 で実装 → docs/runbooks/PART-304-THREE-LAYER.md` |

**コミット**: 各 PART ごとに「`docs: PART-30X ランブック追加 + プレースホルダー更新`」

---

### Step 6: 最終検証

```bash
# ビルド・型・lint
npm run build && npm run type-check && npm run lint

# FDC 残骸ゼロ確認（.archive, references/saas-docs は除外）
grep -r --include='*.ts' --include='*.tsx' --include='*.css' \
  'fdc\|FDC\|Founders Direct\|#667eea\|#764ba2' \
  --exclude-dir=node_modules --exclude-dir=.next \
  --exclude-dir=.archive --exclude-dir=.git

# ランブック内の FDC 残骸ゼロ確認
grep -r 'fdc\|FDC\|Founders Direct' docs/runbooks/

# 全タブのプレースホルダーが PART 番号を参照しているか
grep -r 'Phase [0-9]' app/\(app\)/

# 存在しないファイルへの参照がないか
grep -r 'PHASE[0-9]' docs/ --include='*.md' | grep -v .archive
```

すべてクリアなら `git push origin main`。

---

## 作業スケジュール

| セッション | Step | 内容 | 見積もり |
|-----------|------|------|---------|
| **今セッション** | — | この計画を push して終了 | 完了済み |
| **次セッション** | 1, 2, 3 | Workshop FDC修正 + 構造整理 + eslint | 30分 |
| **次セッション** | 4 (PART 301のみ) | PART-301-FOUNDATION.md 執筆 | 主作業 |
| **次セッション** | 4.5 | PART 301 動作検証 | 15分 |
| **別セッション** | 4 (PART 302) | PART-302-DATABASE.md 執筆 + 検証 | 1セッション |
| **別セッション** | 4 (PART 303) | PART-303-CRM.md 執筆 + 検証 | 1セッション |
| **別セッション** | 4 (PART 304) | PART-304-THREE-LAYER.md 執筆 + 検証 | 1セッション |
| **別セッション** | 4 (PART 305) | PART-305-ADMIN.md 執筆 + 検証 | 1セッション |
| **最終セッション** | 5, 6 | プレースホルダー整合 + 最終検証 + Codex 再監査 | 30分 |

**1 PART = 1 セッション** が現実的。全完了まで約 6 セッション。
