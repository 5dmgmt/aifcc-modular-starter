# AIFCC-CORE.md（v2.4 - 2026-04-13）

## 0. 位置づけ

本ドキュメントは AIFCC Modular Starter の
**開発・拡張に関わるすべての人間開発者とAIエージェントの起点**となる規範書である。

- すべての開発セッションは本ガイドを前提として開始する。
- 技術詳細は `docs/guides/DEVELOPMENT.md` を正とし、本ガイドはその上位コンパスとする。
- 矛盾が生じた場合は、本ガイド → DEVELOPMENT の順で整合を取る。

**現在の開発状況（2026-04-13）**:
- **バージョン**: v2.4.0
- **フロントエンド構成**: Next.js 16 + App Router + React 19
- **TypeScript**: 5.x（strict mode）
- **Node.js**: 24.x
- **データ永続化**: localStorage（学習用。PART 302 で Supabase に移行）
- **現在のステータス**: スターター構築完了、7 タブ構成確定
- **次のステップ**: PART 301（タスク CRUD + 設定）
- **ランブック体系**: PART 301-305（`docs/runbooks/`）

---

## 1. アーキテクチャ概要

### 1.1 ディレクトリ構成

```
aifcc-modular-starter/
├── app/                    # Next.js App Router
│   ├── (app)/              # 認証済みユーザー用ルート（7 タブ）
│   │   ├── dashboard/      # ダッシュボード
│   │   ├── tasks/          # タスク（PART 301）
│   │   ├── settings/       # 設定（PART 301）
│   │   ├── action-map/     # Action Map（PART 304）
│   │   ├── okr/            # OKR（PART 304）
│   │   ├── clients/        # 既存客（PART 303）
│   │   ├── leads/          # 見込み客（PART 303）
│   │   └── layout.tsx      # 認証レイアウト（7 タブナビ）
│   ├── api/contact/        # お問い合わせ API
│   ├── login/              # ログインページ
│   ├── globals.css         # グローバルスタイル
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # エントリー（LP 表示）
├── components/             # UI コンポーネント
│   └── landing/            # ランディングページ
├── lib/                    # 共通ライブラリ
│   ├── contexts/           # React Context
│   └── types/              # 型定義
├── references/             # 実装サンプル（import しない）
├── docs/                   # ドキュメント
│   ├── runbooks/           # PART 301-305 ランブック
│   └── guides/             # 開発ガイド
├── proxy.ts                # 認証プロキシ（Next.js 16）
├── package.json
├── tsconfig.json
└── next.config.ts
```

### 1.2 レイヤー構成

```
┌─────────────────────────────────────────┐
│ UI Layer: React Components              │
│  └─ app/(app)/ 配下のページコンポーネント │
├─────────────────────────────────────────┤
│ State Layer: React Context              │
│  └─ AuthContext（認証状態）              │
├─────────────────────────────────────────┤
│ Storage Layer: localStorage             │
│  ├─ aifcc-tasks（タスクデータ）          │
│  └─ aifcc-settings（設定データ）        │
│  ※ PART 302 で Supabase に移行          │
└─────────────────────────────────────────┘
```

---

## 2. 開発理念と AI チーム体制

本プロジェクトでは、Claude Code を**開発パートナー**として扱い、
ランブック単位のタスク実行 + ドキュメント更新を必須プロセスとする。

### 2.1 運用原則

- すべての開発セッションは `docs/AIFCC-CORE.md` の読み込みから開始
- 機能追加は PART ランブック（`docs/runbooks/PART-30X-*.md`）に従って実行
- 作業完了後は必ずドキュメントを更新

### 2.2 ドキュメント更新ルール

| タイミング | 更新対象 |
|-----------|---------|
| 機能追加時 | CHANGELOG.md, AIFCC-CORE.md |
| バグ修正時 | CHANGELOG.md |
| アーキテクチャ変更時 | DEVELOPMENT.md, AIFCC-CORE.md |

---

## 3. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js | 16.x |
| UI ライブラリ | React | 19.x |
| 言語 | TypeScript | 5.x |
| Node.js | - | 24.x |
| データ永続化 | localStorage | PART 302 で Supabase へ |

---

## 4. PART 完了状況

| PART | 状態 | 概要 | ランブック |
|------|------|------|----------|
| 301 | 次に実行 | タスク CRUD + 設定 | `PART-301-FOUNDATION.md` |
| 302 | 予定 | Supabase + Auth + Workspace | `PART-302-DATABASE.md` |
| 303 | 予定 | 見込み客 / 既存客（CRM） | `PART-303-CRM.md` |
| 304 | 予定 | Action Map + OKR | `PART-304-THREE-LAYER.md` |
| 305 | 予定 | Admin + セキュリティ | `PART-305-ADMIN.md` |

---

## 5. 開発フロー

```
1. ランブック確認: docs/runbooks/PART-30X-*.md を読む
2. 実装: ランブックの prompt を Claude Code に渡して実装
3. ビルド確認: npm run build && npm run type-check && npm run lint
4. ドキュメント更新:
   - CHANGELOG.md に変更内容を追記
   - AIFCC-CORE.md の PART 状況を更新
5. コミット
```

---

## 6. 用語集

| 用語 | 説明 |
|-----|------|
| AIFCC Cockpit | このコースで作る経営コックピット SaaS |
| PART | 開発パート（機能追加の単位、301-305） |
| Runbook | 実装手順書（learns / prompt / checks / DoD） |
| Context | React Context（状態管理） |

---

**Last Updated**: 2026-04-13
**Version**: v2.4
**Maintained by**: AIFCC Development Team
