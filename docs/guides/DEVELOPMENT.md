# AIFCC Modular 開発ガイド

**バージョン:** v1.0.0
**最終更新:** 2026-04-27

## 0. ドキュメント概要

### 0.1 目的

このドキュメントは、AIFCC Modular Starter の開発・拡張を安全かつ一貫性をもって進めるための
**AI・人間共通の開発規範**です。

Claude Code を使用する場合は、必ず本ドキュメントを読み込み遵守してください。

### 0.2 現在の開発状況

**学習用スターター v2.3.0（2026-04-27 時点）** — 実バージョンは `package.json` を参照

| PART | 状態 | 概要 |
|------|------|------|
| 301 | 次に実行 | タスク CRUD + 設定 |
| 302 | 予定 | Supabase + Auth + Workspace |
| 303 | 予定 | 見込み客 / 既存客（CRM） |
| 304 | 予定 | Action Map + OKR |
| 305 | 予定 | Admin + セキュリティ |

---

## 1. プロジェクト構成

### 1.1 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js | ^16.1.7 |
| UIライブラリ | React | ^19.2.4 |
| 言語 | TypeScript | ^5.9.3 |
| Node.js | - | >=24.0.0 |

> 実バージョンは `package.json` が一次情報。上記は更新時点のスナップショット。

### 1.2 ディレクトリ構成

```
aifcc-modular-starter/
├── app/                    # Next.js App Router
│   ├── (app)/              # 認証済みルート（7 タブ）
│   │   ├── dashboard/      # ダッシュボード
│   │   ├── tasks/          # タスク（PART 301）
│   │   ├── settings/       # 設定（PART 301）
│   │   ├── action-map/     # Action Map（PART 304）
│   │   ├── okr/            # OKR（PART 304）
│   │   ├── clients/        # 既存客（PART 303）
│   │   ├── leads/          # 見込み客（PART 303）
│   │   └── layout.tsx      # 認証レイアウト
│   ├── api/contact/        # お問い合わせ API
│   ├── login/              # ログインページ
│   ├── globals.css         # グローバル CSS
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # エントリー
│
├── lib/                    # 共通ライブラリ
│   ├── contexts/           # React Context
│   └── types/              # 型定義
│
├── references/             # 実装サンプル（import しない）
│
├── docs/                   # ドキュメント
│   ├── AIFCC-MODULAR-GUIDE.md
│   ├── AIFCC-CORE.md
│   ├── CHANGELOG.md
│   ├── guides/
│   │   └── DEVELOPMENT.md  # 本ファイル
│   └── runbooks/
│       ├── README.md
│       ├── PART-301-FOUNDATION.md
│       ├── PART-302-DATABASE.md
│       ├── PART-303-CRM.md
│       ├── PART-304-THREE-LAYER.md
│       └── PART-305-ADMIN.md
│
├── proxy.ts                # 認証プロキシ（Next.js 16）
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 2. コーディング規約

### 2.1 TypeScript

```typescript
// ✅ 正しい: 明示的な型定義
function getData(key: string): AppData | null { ... }

// ❌ 禁止: any 型
function getData(key: any): any { ... }
```

### 2.2 React コンポーネント

```typescript
// ✅ 正しい: 'use client' を最上部に記載
'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState('');
  return <div>{state}</div>;
}
```

### 2.3 Context 使用

```typescript
// ✅ 正しい: AuthContext を使用
import { useAuth } from '@/lib/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading } = useAuth();
  // ...
}
```

---

## 3. 状態管理パターン

### 3.1 現在の構成

- **認証状態**: `AuthContext`（`lib/contexts/AuthContext.tsx`）
- **タスクデータ**: localStorage（`aifcc-tasks`）— PART 301 で実装
- **設定データ**: localStorage（`aifcc-settings`）— PART 301 で実装
- **DB 移行**: PART 302 で Supabase に移行予定

### 3.2 新しいデータの追加手順

1. `lib/types/index.ts` に型を追加
2. localStorage のキーを決める（PART 301）または Supabase テーブルを作成（PART 302+）
3. カスタムフック（`useTaskReducer` 等）で CRUD を管理

---

## 4. ファイル追加パターン

### 4.1 新規ページ追加

```
app/(app)/新機能/
└── page.tsx    # 'use client' を含む Client Component
```

### 4.2 ナビゲーション更新

`app/(app)/layout.tsx` の `NAV_ITEMS` に追加:

```typescript
const NAV_ITEMS = [
  { href: '/dashboard', label: 'ダッシュボード' },
  { href: '/tasks', label: 'タスク' },
  { href: '/新機能', label: '新機能' },  // 追加
];
```

---

## 5. ドキュメント更新ルール

### 5.1 更新タイミング

| イベント | 更新対象 |
|---------|---------|
| 機能追加 | CHANGELOG.md, AIFCC-CORE.md |
| バグ修正 | CHANGELOG.md |
| アーキテクチャ変更 | DEVELOPMENT.md, AIFCC-CORE.md |
| 新規ランブック作成 | runbooks/README.md |

### 5.2 CHANGELOG 形式

```markdown
## [2.5.0] - YYYY-MM-DD - PART 301

### Added
- タスク CRUD（`app/(app)/tasks/page.tsx`）
- 設定ページ（`app/(app)/settings/page.tsx`）

### Changed
- ナビゲーション更新
```

### 5.3 AIFCC-CORE.md 更新

PART 完了時に以下を更新:
1. 「現在の開発状況」セクション
2. AIFCC-CORE.md の「PART 完了状況」テーブル

---

## 6. Claude Code 運用ルール

### 6.1 セッション開始プロンプト

```
このプロジェクトの開発を行います。

以下のファイルを読み込んでください:
- docs/AIFCC-CORE.md
- docs/guides/DEVELOPMENT.md

プロジェクトパス: ~/projects/aifcc-modular-starter
```

### 6.2 機能追加プロンプト

```
PART 30X を実行してください。

ランブック: docs/runbooks/PART-30X-XXX.md

実行後、以下を更新してください:
1. docs/CHANGELOG.md に変更内容を追記
2. docs/AIFCC-CORE.md の PART 状況を更新
3. package.json のバージョンを更新（minor バージョンアップ）
```

### 6.3 作業完了確認プロンプト

```
作業完了を確認してください:

1. npm run build が成功するか
2. npm run type-check が成功するか
3. ドキュメントが更新されているか
   - CHANGELOG.md
   - AIFCC-CORE.md
```

---

## 7. デザイン一貫性ガイドライン（⚠️ 重要）

### 7.1 アイコン

- **絵文字（Emoji）は使用禁止** — 必ずSVGアイコンを使用する
- お祝い演出のみ例外的に絵文字許可
- 新規アイコンは `lib/icons.tsx` 等に集約

### 7.2 カラーパレット（globals.css 準拠）

> **基本方針:** 学習用スターターの初期配色は ティール基本＋テラコッタアクセント。受講者は自社ブランドに合わせて `app/globals.css` の CSS 変数を書き換える前提。
> 配色を選び直す場合の参考: [Canva 100の配色アイデア](https://www.canva.com/ja_jp/learn/100-color-combinations/) や [Coolors](https://coolors.co/)。

**ブランド色（globals.css の `:root` 定義）:**

| 用途 | 色 | CSS変数 | 役割 |
|------|-----|---------|------|
| プライマリ | `#31A9B8` | `--primary` | メインアクション・リンク（ティール） |
| アクセント | `#d4a27f` | `--accent` | 強調・装飾（テラコッタ） |

**機能色（状態表示専用）:**

| 用途 | 色 | CSS変数 |
|------|-----|---------|
| 成功 | `#4a7c59` | `--success` |
| 警告 | `#c49a3c` | `--warning` |
| エラー | `#c44536` | `--error` |
| 情報 | `#5a7fa8` | `--info` |

- **上記以外のブランドカラー追加は禁止**
- グレー系（テキスト・ボーダー）は globals.css の `--text-*` / `--border` 系変数を使用
- 新しい色が必要な場合は、既存色のバリエーション（透明度変更等）で対応

### 7.3 背景色（globals.css 準拠）

| 用途 | 色/変数 | 説明 |
|------|---------|------|
| 基本背景 | `var(--bg-base)` / `#faf9f6` | ページ背景 |
| セカンダリ背景 | `var(--bg-gray)` / `#f0eeeb` | グレー背景、説明エリア |
| カード背景 | `var(--bg-white)` / `#FFFFFF` | カード内要素、入力フィールド |
| コードブロック | `#000` | ターミナル風コード表示 |

- **グラデーション背景は使用禁止**
- **色付き背景（赤系・緑系・黄系）は使用禁止** — 代わりに `border-left: 3px solid #色` で区別

### 7.4 違反発見時の対応

- 絵文字 → SVGアイコンに即時置換
- 4色以外のブランドカラー → 最も近い指定色に変更
- コードレビューで必ずチェック

---

## 8. テスト

### 8.1 手動テスト

```bash
# 開発サーバー起動
npm run dev

# ブラウザで確認
# http://localhost:3000
# パスワード: aifcc
```

### 8.2 ビルドテスト

```bash
# 型チェック
npm run type-check

# プロダクションビルド
npm run build
```

---

## 9. SaaS版への移行パス

このスターターで学習した後、以下の手順でSaaS版に移行できます:

| Modular 版 | SaaS 版 | 変換内容 |
|------------|---------|---------|
| localStorage | Supabase | データ永続化層 |
| 簡易認証 | Supabase Auth | Google OAuth |
| AuthContext + localStorage | WorkspaceDataContext | マルチテナント対応 |
| 単一テナント | マルチテナント | tenants テーブル追加 |

---

**Last Updated**: 2026-04-27
**Version**: 実バージョンは `package.json` 参照（執筆時点 v2.3.0）
**Maintained by**: AIFCC Development Team
