# AIFCC Modular Starter

AIフルーエントCEOクラブ（AIFCC）ワークショップのCC基礎コース用スターターキットです。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 + App Router |
| UI | React 19 |
| 言語 | TypeScript 5.x (strict mode) |
| Node.js | 22.x 以上 |

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

このスターターは **AIFCC Workshop CC基礎コース PART 101「今日デプロイする」** で使います。

1. **Phase 10101**: このスターターをクローンしてローカルで起動
2. **Phase 10102**: 自分のGitHubリポジトリを作成してVercelにデプロイ
3. **Phase 10103**: Claude Codeで初めての修正を体験

詳しい手順はワークショップの各Phaseを参照してください。

## フォルダ構造

```
aifcc-modular-starter/
├── app/ .................... Next.js App Router
├── components/ ............. UIコンポーネント
│   └── landing/ ............ ランディングページ
│       ├── default/ ........ デフォルトLP（カスタマイズベース）
│       └── shared/ ......... 共通コンポーネント
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
