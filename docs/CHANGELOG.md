# Changelog

All notable changes to AIFCC Modular Starter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
