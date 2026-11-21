# Changelog

All notable changes to AIFCC Modular Starter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.3.2] - 2026-11-21 - 実情合わせと片付け

- `app/api/contact`: 設定が無いときの応答から設定の名前を外す（503）・件名の改行を空白に・公開前の注意をファイルの先頭に
- README「公開する前に知っておくこと」: ログインはデモ（実データは Phase 30202 のあと）・問い合わせの入口は Phase 20404 で守りを足す・セキュリティヘッダは 20404 で自分で入れる
- CI（Quality Gate）の Node を 22 → 24（`engines` の `>=24` に合わせる）
- 使っていない `.archive/`（旧ランブック・旧参照・旧 LP）を削除。過去の版は git の履歴に残っている
- `docs/AIFCC-CORE.md`・`docs/AIFCC-MODULAR-GUIDE.md` の版の表記（v2.4.0）を、package.json を正とする書き方に

---

## [2.3.1] - 2026-11-10 - 公開ページを /login に回さない

- `proxy.ts`: 守る経路（`app/(app)/` の 7 画面とその下）だけ `/login` へ回し、それ以外は通す。`/` はログイン済みでも転送しない
- `.env.example` を削除（`.env.tpl` から `op inject` で `.env.local` を作る道に一本化）。`.gitignore` に `private/`・`knowledge-vault/private/`・`CLAUDE.local.md` を追加
- `package.json` の `description` と `CLAUDE.md` の分業の文言を Claude Code 基礎コース・Pro の呼び方に合わせた

---

## [2.3.0] - 2026-02-22 - Next.js 16 Migration

### 概要

Next.js 15.5.7 から Next.js 16.0.10 への移行。Workshop 教材との整合性を確保。

### Changed

| 変更 | 内容 |
|------|------|
| `middleware.ts` → `proxy.ts` | ファイル名・関数名を Next.js 16 に準拠 |
| `package.json` | next 16.0.10, eslint-config-next 16.0.10, lint: "eslint ." |
| `next.config.ts` | コメント更新 |
| 全ドキュメント | Next.js 15 表記を 16 に統一 |

### 技術スタック

| 技術 | バージョン |
|------|-----------|
| Next.js | 16.0.10 |
| React | 19.2.1 |
| TypeScript | 5.7.2 |
| Node.js | 22.x |

---

## [Unreleased]

### Changed

| 変更 | 内容 |
|------|------|
| Node.js engines | `>=22.0.0` → `>=24.0.0`（package.json） |
| 依存パッケージ | next ^16.1.7, react ^19.2.4, typescript ^5.9.3, eslint ^9.27.0 にバンプ |
| ドキュメント | DEVELOPMENT.md の技術スタック表を package.json と同期 |

### 予定

| PART | 内容 |
|------|------|
| PART 301 | タスク CRUD + 設定ページ |
| PART 302 | Supabase + Auth + Workspace 基盤 |
| PART 303 | 見込み客 / 既存客（CRM） |
| PART 304 | Action Map + OKR |
| PART 305 | Admin + セキュリティ |

---

## [1.0.0] - 2025-12-06 - Phase 0: スターター構築

### 概要

AIFCC Cockpit のミニマルスターターの初期リリース。
Next.js 16 + React 19 + TypeScript 構成で、SaaS版と同じアーキテクチャパターンを使用。

### Added

| ファイル | 内容 |
|---------|------|
| `app/layout.tsx` | ルートレイアウト |
| `app/page.tsx` | エントリーポイント（/login へリダイレクト） |
| `app/login/page.tsx` | ログインページ（デモ認証） |
| `app/(app)/layout.tsx` | 認証済みレイアウト（ヘッダー + ナビ） |
| `app/(app)/dashboard/page.tsx` | ダッシュボード（統計 + タスク管理） |
| `app/globals.css` | グローバルスタイル（SaaS版互換） |
| `lib/types/index.ts` | 型定義（User, Task, AppData） |
| `lib/contexts/AuthContext.tsx` | 認証コンテキスト |
| `lib/contexts/DataContext.tsx` | データコンテキスト（localStorage 永続化） |

### ドキュメント

| ファイル | 内容 |
|---------|------|
| `docs/AIFCC-MODULAR-GUIDE.md` | メインガイド（インデックス） |
| `docs/AIFCC-CORE.md` | 開発コアガイド |
| `docs/CHANGELOG.md` | 本ファイル |
| `docs/guides/DEVELOPMENT.md` | 開発者・AI向け技術ガイド |
| `docs/runbooks/README.md` | ランブック一覧 |
| `docs/runbooks/PART-301-FOUNDATION.md` | PART 301 ランブック |
| `docs/runbooks/PART-302-DATABASE.md` | PART 302 ランブック |
| `docs/runbooks/PART-303-CRM.md` | PART 303 ランブック |
| `docs/runbooks/PART-304-THREE-LAYER.md` | PART 304 ランブック |
| `docs/runbooks/PART-305-ADMIN.md` | PART 305 ランブック |

### 技術スタック

| 技術 | バージョン |
|------|-----------|
| Next.js | 15.1.0 (当時) |
| React | 19.0.0 (当時) |
| TypeScript | 5.7.2 |
| Node.js | 22.x |

---

## 更新ルール

### 新しいエントリの追加方法

1. `[Unreleased]` セクションに変更内容を追記
2. リリース時に日付とバージョンを確定
3. 新しい `[Unreleased]` セクションを作成

### フォーマット

```markdown
## [X.Y.Z] - YYYY-MM-DD - Phase N: タイトル

### 概要
簡潔な説明

### Added
- 追加した機能/ファイル

### Changed
- 変更した機能/ファイル

### Fixed
- 修正したバグ

### Removed
- 削除した機能/ファイル
```

---

**Last Updated**: 2026-02-22
**Maintained by**: AIFCC Development Team
