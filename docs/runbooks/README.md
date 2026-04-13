# AIFCC Modular ランブック

このディレクトリには、AIFCC Modular Starter に機能を追加するためのランブックが含まれています。

---

## 学習の進め方

1. `docs/AIFCC-CORE.md` を読んで全体像を理解
2. 各 PART のランブックを順番に実行
3. コードを理解しながら実装
4. ビルドが通ることを確認
5. ドキュメントを更新

---

## PART 一覧

| PART | ファイル | 内容 | 対応タブ |
|------|----------|------|---------|
| 301 | [PART-301-FOUNDATION.md](PART-301-FOUNDATION.md) | タスク CRUD + 設定 | タスク / 設定 |
| 302 | [PART-302-DATABASE.md](PART-302-DATABASE.md) | Supabase + Auth + Workspace 基盤 | DB 基盤 |
| 303 | [PART-303-CRM.md](PART-303-CRM.md) | リード + クライアント管理 | 見込み客 / 既存客 |
| 304 | [PART-304-THREE-LAYER.md](PART-304-THREE-LAYER.md) | Action Map + OKR + 連携 | Action Map / OKR |
| 305 | [PART-305-ADMIN.md](PART-305-ADMIN.md) | Admin + セキュリティ | 設定拡張 |

---

## 参照ファイルの場所

ランブック実行に必要な参照ファイルは `references/` に含まれています：

```
references/
├── ui/          # UIコンポーネント（各機能別）
├── types/       # 型定義ファイル
└── contexts/    # Context（状態管理）
```

---

## Claude Code 運用プロンプト

### PART 実行時

```
PART 30X を実行してください。

ランブック: docs/runbooks/PART-30X-XXX.md

完了後、以下を更新してください:
1. docs/CHANGELOG.md に変更内容を追記
2. docs/AIFCC-CORE.md の状況を更新
3. package.json のバージョンを更新

最後に npm run build && npm run type-check && npm run lint で確認してください。
```

---

**Last Updated**: 2026-04-13
**Maintained by**: AIFCC Development Team
