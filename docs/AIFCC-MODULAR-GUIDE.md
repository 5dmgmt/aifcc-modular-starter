# AIFCC-MODULAR-GUIDE.md（v1.0 - 2025-12-06）

> **AIFCC Cockpit - Modular Starter ガイド**
>
> このドキュメントは、AIFCC Modular Starter の開発ガイドのインデックスです。

---

## 概要

AIFCC Modular Starter は、AIFCC Cockpit の
学習用ミニマル版です。同じアーキテクチャ・パターンを使用しているため、
学習後にスムーズに本番版の開発に移行できます。

### プロジェクト情報

| 項目 | 値 |
|------|-----|
| **バージョン** | v1.0.0 |
| **対応Node.js** | 24.x |
| **フレームワーク** | Next.js 16 + React 19 |
| **言語** | TypeScript 5.x (strict mode) |

### SaaS版との関係

```
┌─────────────────────────────────────────┐
│  AIFCC Modular Starter (本プロジェクト)    │
│  - ミニマル構成                          │
│  - localStorage ベース                   │
│  - 学習・プロトタイプ用                  │
└─────────────────┬───────────────────────┘
                  │ 学習後に拡張
                  ▼
┌─────────────────────────────────────────┐
│  AIFCC SaaS (本番版)                       │
│  - フル機能（OKR / ActionMap / Task）    │
│  - Supabase PostgreSQL                  │
│  - マルチテナント対応                    │
└─────────────────────────────────────────┘
```

---

## ドキュメント構造

```
docs/
├── AIFCC-MODULAR-GUIDE.md ......... 本ファイル（インデックス）
├── AIFCC-CORE.md .................. 開発コアガイド ⭐ 開発時はこちら
├── CHANGELOG.md ................. 変更履歴
│
├── guides/ ...................... ガイドドキュメント
│   └── DEVELOPMENT.md ........... 開発者・AI向け技術ガイド
│
└── runbooks/ .................... PART別ランブック
    ├── README.md ................ ランブック一覧
    ├── PART-301-FOUNDATION.md ... タスク CRUD + 設定
    ├── PART-302-DATABASE.md ..... Supabase + Auth
    ├── PART-303-CRM.md .......... 見込み客 / 既存客
    ├── PART-304-THREE-LAYER.md .. Action Map + OKR
    └── PART-305-ADMIN.md ........ Admin + セキュリティ
```

---

## クイックスタート

### 1. プロジェクトを開始

```bash
cd ~/projects/aifcc-modular-starter
npm install
npm run dev
# http://localhost:3000 → パスワード: aifcc
```

### 2. 開発ガイドを読む

```bash
# コアガイド（開発の起点）
cat docs/AIFCC-CORE.md

# 技術詳細ガイド
cat docs/guides/DEVELOPMENT.md
```

### 3. ランブックで機能追加

```bash
# PART 301: タスク CRUD + 設定
cat docs/runbooks/PART-301-FOUNDATION.md
```

---

## 学習の進め方

1. **スターター起動** → ログイン → ダッシュボード確認
2. **AIFCC-CORE.md** を読んで全体像を理解
3. **PART 301** → タスク CRUD + 設定ページ
4. **PART 302** → Supabase + Auth + Workspace
5. **PART 303** → 見込み客 / 既存客（CRM）
6. **PART 304** → Action Map + OKR
7. **PART 305** → Admin + セキュリティ

---

## Claude Code 運用プロンプト

### セッション開始時

```
このプロジェクトの開発を行います。

以下のファイルを読み込んでください:
- docs/AIFCC-CORE.md（開発コアガイド）
- docs/guides/DEVELOPMENT.md（技術詳細）

プロジェクトパス: ~/projects/aifcc-modular-starter
```

### 機能追加時

```
PART 30X を実行してください。
ランブック: docs/runbooks/PART-30X-XXX.md

完了後、以下を更新してください:
1. docs/CHANGELOG.md に変更内容を追記
2. docs/AIFCC-CORE.md のフェーズ状況を更新
3. package.json のバージョンを更新
```

### ドキュメント更新プロンプト

```
作業完了後、以下のドキュメントを更新してください:

1. CHANGELOG.md
   - 今回の変更内容を [Unreleased] セクションに追記
   - Added/Changed/Fixed の形式で記載

2. AIFCC-CORE.md
   - フェーズ完了状況を更新
   - 技術スタック変更があれば更新

3. guides/DEVELOPMENT.md（必要に応じて）
   - ディレクトリ構成変更があれば更新
   - 新規パターン追加があれば記載
```

---

## 現在の状態（2026-04-13）

- **バージョン**: v2.4.0
- **7タブ構成確定**: ダッシュボード / タスク / 設定 / Action Map / OKR / 既存客 / 見込み客
- **次のステップ**: PART 301（タスク CRUD + 設定）

---

**Last Updated**: 2026-04-13
**Version**: v2.4
**Maintained by**: AIFCC Development Team (Human + Claude Code)
