# <アプリ名> ランブック v0（YYYY-MM-DD）

> 書いたモデル: Fable（選べない場合は Opus）／実装: Sonnet／確認: Opus／画像: ChatGPT（Codex）
> 裁定ページ: <公開したら URL を書く>

## 1. 作りたいもの
誰が・何に困っていて・何ができれば嬉しいか（3 行）。作らないこと（1〜3 行）。

## 2. 参考にする本・サイト
書名・著者・URL。無ければ「なし」。

## 3. 技術スタック（正本: aifcc-modular-starter）
Next.js 16（App Router）／React 19／TypeScript（strict）／proxy.ts／Lucide／コミット前 `npm run type-check && npm run lint && npm run build`。
環境変数: 1Password が必須。`.env.tpl` から `op inject -i .env.tpl -o .env.local` で `.env.local` を生成する。
画像: ChatGPT の画像生成（codex exec）→ 検寸 → 縮小 → WebP → `public/`。原本 PNG はリポに入れない。

## 4. 画面と機能の一覧
| 画面 | できること | 誰が使う |
|------|-----------|---------|

## 5. データ
表（テーブル）と項目。個人情報の有無。

## 6. セキュリティ
ログイン方式／秘密の値の置き場／RLS（Supabase を使う場合）／レート制限。

## 7. 受け入れ基準
「できた」と言える客観の条件を箇条書き（動く・件数・検査が通る）。

## 8. 裁定（D01〜）
| # | 論点 | 選択肢（先頭がおすすめ） | 決定 | 決めた日 |
|---|------|------------------------|------|---------|
| D01 | | A. … ／ B. … | | |

裁定ページの db: collection `decisions`、doc id ＝ D01…、fields `choice`／`note`／`decidedAt`／`updatedAt`。全体メモは doc `memo`。

## 9. 未確認（U01〜）
調べてから決めること。推測で埋めない。
