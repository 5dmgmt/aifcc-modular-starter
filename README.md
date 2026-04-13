# AIFCC Modular Starter

AIフルーエントCEOクラブ（AIFCC）ワークショップのCC基礎コース用スターターキットです。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 + App Router |
| UI | React 19 |
| 言語 | TypeScript 5.x (strict mode) |
| Node.js | 24.x 以上 |

## クイックスタート

```bash
# クローン
gh repo clone 5dmgmt/aifcc-modular-starter
cd aifcc-modular-starter

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開いてアプリが表示されればOK。

## ワークショップでの使い方

### 初回セットアップ（Workshop PART 101）

1. このスターターをクローンしてローカルで起動
2. 自分の GitHub リポジトリを作成して Vercel にデプロイ
3. Claude Code で初めての修正を体験

### 機能追加（PART 301-305）

セットアップ後、`docs/runbooks/` のランブックに従って機能を追加していきます。

| PART | 内容 | ランブック |
|------|------|----------|
| 301 | タスク CRUD + 設定 | `PART-301-FOUNDATION.md` |
| 302 | Supabase + Auth | `PART-302-DATABASE.md` |
| 303 | 見込み客 / 既存客 | `PART-303-CRM.md` |
| 304 | Action Map + OKR | `PART-304-THREE-LAYER.md` |
| 305 | Admin + セキュリティ | `PART-305-ADMIN.md` |

## フォルダ構造

```
aifcc-modular-starter/
├── app/ .................... Next.js App Router
├── components/ ............. UIコンポーネント
│   └── landing/ ............ ランディングページ
├── lib/ .................... 共通ライブラリ
├── public/ ................. 静的ファイル
└── proxy.ts ............... 認証プロキシ（Next.js 16）
```

## コマンド

```bash
npm run dev        # 開発サーバー
npm run build      # プロダクションビルド
npm run start      # プロダクション実行
npm run type-check # 型チェック
npm run lint       # Lint実行（eslint .）
```

## ライセンス

Private - AIFCC Workshop 受講者向け
