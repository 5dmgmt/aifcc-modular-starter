# AIFCC Cockpit 開発ガイド

**バージョン:** v6.2.0
**最終更新:** 2025-12-05（Phase 14 完了、Phase 19 AI実装予定）

## 0. ドキュメント概要

### 0.1 目的

このドキュメントは、AIFCC Cockpit（AIFCC）の開発・拡張を安全かつ一貫性をもって進めるための**AI・人間共通の開発規範**です。Claude Code、ChatGPT、Copilot等のAIを使用する場合は、必ず本ドキュメントを読み込み遵守してください。

### 0.2 現在の開発状況

**本番運用中 v2.9.2（2025-12-05）**

| フェーズ | 状態 | 概要 |
|---------|------|------|
| Phase 7 | ✅ 完了 | 認証・RBAC・監査ログ・レポート |
| Phase 8 | ✅ 完了 | Workspace管理・暗号化 |
| Phase 9 | ✅ 完了 | DB移行（Neon → Supabase） |
| Phase 9.5 | ✅ 完了 | 基盤整備・Cookie設定 |
| Phase 9.7 | ✅ 完了 | 技術負債ゼロ化 |
| Phase 9.8 | ✅ 完了 | AI基盤・楽観的排他制御 |
| Phase 9.9 | ✅ 完了 | バグ修正・ガバナンス |
| Phase 9.92 | ✅ 完了 | 全13タブ React 移行 |
| Phase 9.93-A | ✅ 完了 | レガシー隔離・CI自動化 |
| Phase 9.93-B | ✅ 完了 | パフォーマンス最適化 |
| Phase 9.94-A | ✅ 完了 | RSC導入・Lighthouse改善 |
| Phase 9.94-B | ✅ 完了 | WCAG 2.1 AA準拠 |
| Phase 9.94-C | ✅ 完了 | 型定義・オフライン戦略 |
| Phase 9.94-D | ✅ 完了 | CI/CD基盤 |
| Phase 9.97 | ✅ 完了 | 権限システム統一・バグ修正 |
| Phase 9.98 | ✅ 完了 | Web公開前チェックリスト |
| Phase 9.99 | ✅ 完了 | Phase 10開始前最終整備 |
| **Phase 10** | ✅ 完了 | **TODO機能拡張（4象限×習慣化×カレンダー連携）** |
| **Phase 11** | ✅ 完了 | **Action Map: 戦術レイヤー・カンバン・フォーカスモード** |
| **Phase 12** | ✅ 完了 | **OKR: 戦略レイヤー・N:M連携・3層アーキテクチャ完成** |
| **Phase 13** | ✅ 完了 | **AI機能・CSVインポート・セキュリティ強化** |
| **Phase 13.5** | ✅ 完了 | **レポートラインタブ・可視性/権限システム** |
| **Phase 14.1** | ✅ 完了 | **CSVインポート・エクスポート機能（管理者設定タブ集約）** |
| **Phase 14.2** | ✅ 完了 | **スケーラビリティ改善（同時20人→100人対応）** |
| **Phase 14.4** | ✅ 完了 | **運用監視強化・技術的負債解消** |
| **Phase 14.35** | ✅ 完了 | **巨大コンポーネント分割（28ファイル、500行以上0件）** |
| **Phase 14.6-I** | ✅ 完了 | **CSP強化（Nonceベース、unsafe-eval削除）** |
| **Phase 14.6.3-5** | ✅ 完了 | **大規模ファイル分割（61ファイル、hooks/csv/landing）** |
| **Phase 14.62** | ✅ 完了 | **命名・概念一貫性統一** |
| **Phase 14.6.5** | ✅ 完了 | **AI利用設計（UC/プロンプト/UI/UX設計）** |
| **Phase 14.7** | ✅ 完了 | **テナント別AI基盤（DB・型定義・pg_cron設定）** |
| **Phase 15-A/B** | ✅ 完了 | **Google Token暗号化・監査ログ** |
| **Phase 16** | 📐 設計完了 | **タスク＆習慣システム v4（DB正規化・習慣ゾーン）** |
| **Phase 19** | 🔜 予定 | **AI機能実装（チャットパネル・UC-01〜04）** |

**Phase 14完了:** ✅ 2025-12-05（AI基盤整備・pg_cron設定済み）
**現在のPhase:** Phase 16 設計中 / Phase 19 AI実装予定

### 3層アーキテクチャ（Phase 10〜12で完成）

```
戦略層: OKR (lib/types/okr.ts)
  ├─ Objective（定性目標: 会社/チーム/個人）
  └─ KeyResult（定量成果指標）N:M連携

戦術層: Action Map (lib/types/action-map.ts)
  ├─ ActionMap（上司作成の計画）
  └─ ActionItem（部下実行タスク）ツリー構造

実行層: Task (lib/types/task.ts)
  ├─ Task（4象限: ♠♥♦♣）
  ├─ SubTask（サブステップ）
  ├─ ElasticHabit（松竹梅習慣）
  └─ UmeHabit（梅習慣: 5分単位）
```

### Phase 10〜12 完了内容

**Phase 10（Task実行層）:**
- 4象限ボード: アイゼンハワーマトリクス（♠♥♦♣）
- Elastic Habits: 松竹梅システム
- TimeAllocationBar: 5色時間可視化
- Google連携: Calendar/Tasks API

**Phase 11（ActionMap戦術層）:**
- ActionMap: 上司→部下の戦術指示
- ActionItem: ツリー構造・カンバンボード
- フォーカスモード: 1アクション集中

**Phase 12（OKR戦略層）:**
- Objective: 定性目標（会社/チーム/個人）
- KeyResult: 定量成果指標
- N:M連携: ActionMap↔KR
- 進捗ロールアップ: Task→ActionItem→ActionMap→KR→Objective

## 1. プロジェクト構成

### 1.1 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js | 15.5.6 |
| UIライブラリ | React | 19.2.0 |
| 言語 | TypeScript | 5.9.3 |
| データベース | Supabase PostgreSQL | 17.6 |
| 認証 | Supabase Auth | - |
| AI | Vercel AI SDK | 5.0.100 |
| バリデーション | Zod | 4.1.12 |
| テスト | Playwright | 1.56.1 |
| ユニットテスト | Vitest | 2.1.0 |
| アイコン | Lucide React | 0.554.0 |

### 1.2 ディレクトリ構成（Phase 12 完了時点）

```
foundersdirect/
├── app/                              # Next.js 15 App Router
│   ├── (app)/                        # 認証後ページ（Route Group）
│   │   ├── dashboard/page.tsx        # ダッシュボード
│   │   ├── leads/page.tsx            # 見込み客管理
│   │   ├── clients/page.tsx          # 顧客管理
│   │   ├── reports/                  # レポート（RSC化済み）
│   │   │   ├── page.tsx              # Server Component
│   │   │   └── _components/          # Client Components
│   │   ├── settings/                 # 設定
│   │   ├── admin/                    # 管理者機能
│   │   └── layout.tsx                # 認証レイアウト
│   ├── _components/                  # UIコンポーネント（23ディレクトリ）
│   │   ├── todo/                     # TODOコンポーネント（23ファイル）【Phase 10】
│   │   │   ├── TaskBoardTab.tsx      # タブUIコンテナ
│   │   │   ├── TodoBoard.tsx         # 4象限ボード（D&D対応）
│   │   │   ├── TodoCard.tsx          # タスクカード
│   │   │   ├── TaskFormModal.tsx     # タスク作成・編集
│   │   │   ├── ElasticHabitsPanel.tsx # 松竹梅習慣パネル
│   │   │   ├── UmeHabitManager.tsx   # 梅習慣マスタ管理
│   │   │   └── TimeAllocationBar.tsx # 時間有効活用ダッシュボード
│   │   ├── action-map/               # ActionMapコンポーネント（19ファイル）【Phase 11】
│   │   │   ├── ActionMapTab.tsx      # タブUIコンテナ
│   │   │   ├── ActionMapList.tsx     # 左サイドバー
│   │   │   ├── ActionMapDetail.tsx   # 右詳細
│   │   │   ├── ActionItemTree.tsx    # ツリー表示
│   │   │   ├── ActionItemKanban.tsx  # カンバンボード
│   │   │   └── FocusMode.tsx         # 集中モード
│   │   ├── okr/                      # OKRコンポーネント（13ファイル）【Phase 12】
│   │   └── org-chart/                # 組織図コンポーネント（12ファイル）【Phase 13.5】
│   │       ├── OKRTab.tsx            # タブUIコンテナ
│   │       ├── ObjectiveList.tsx     # 左サイドバー
│   │       ├── ObjectiveDetail.tsx   # 右詳細+KRリスト
│   │       └── ActionMapLinkModal.tsx # KR↔AM連携
│   ├── api/                          # Route Handlers（API層）
│   │   └── google/                   # Google連携API【Phase 10】
│   │       └── tasks/                # Tasks API
│   ├── login/page.tsx                # ログインページ
│   ├── layout.tsx                    # ルートレイアウト
│   └── globals.css                   # グローバルCSS
│
├── lib/                              # 共通ライブラリ
│   ├── core/                         # 圧縮・AI・バリデーション
│   │   ├── action-map.ts             # ActionMap CRUD・進捗計算【Phase 11】
│   │   └── okr.ts                    # OKR CRUD・ロールアップ【Phase 12】
│   ├── hooks/                        # カスタムフック（Phase 14.6.3-5で分割）
│   │   ├── task/                     # Task関連（9ファイル）【Phase 10】
│   │   ├── okr/                      # OKR関連（7ファイル）【Phase 12】
│   │   ├── leads/                    # Leads関連（8ファイル）
│   │   ├── templates/                # Templates関連（7ファイル）
│   │   ├── settings/                 # Settings関連（7ファイル）
│   │   ├── action-map/               # ActionMap関連（7ファイル）【Phase 11】
│   │   └── useWorkspaceData.ts       # Context（APIコール削減）
│   ├── google/                       # Google API クライアント【Phase 10】
│   │   ├── calendar-client.ts        # Calendar API
│   │   └── tasks-client.ts           # Tasks API
│   ├── server/                       # サーバー専用
│   ├── client/                       # クライアント専用
│   ├── utils/                        # ユーティリティ
│   │   └── permissions.ts            # 権限チェック関数
│   └── types/                        # TypeScript 型定義（22ファイル）
│       ├── task.ts                   # Task, Suit, SubTask【Phase 10】
│       ├── elastic-habit.ts          # ElasticHabit, UmeHabit【Phase 10】
│       ├── calendar.ts               # カレンダー連携、ログ/サマリー【Phase 10】
│       ├── action-map.ts             # ActionMap, ActionItem【Phase 11】
│       └── okr.ts                    # Objective, KeyResult【Phase 12】
│
├── tests/                            # テスト
│   ├── e2e/                          # E2Eテスト（Playwright）
│   ├── unit/                         # ユニットテスト（Vitest）
│   ├── fixtures/                     # テストデータファクトリ
│   └── setup.ts                      # Vitest セットアップ
│
├── .github/workflows/                # CI/CD
│   └── quality-gate.yml              # GitHub Actions
│
├── migrations/                       # DBマイグレーション
├── scripts/                          # 運用スクリプト
├── .archive/                         # レガシーコード隔離（隠しフォルダ）
├── docs/                             # ドキュメント
│
├── middleware.ts                     # 認証ミドルウェア
├── next.config.mjs                   # Next.js 設定
├── tsconfig.json                     # TypeScript 設定
├── eslint.config.mjs                 # ESLint 設定
├── vitest.config.ts                  # Vitest 設定
├── playwright.config.ts              # Playwright 設定
└── package.json                      # 依存関係
```

### 1.3 レガシーコード

**重要:** `.archive/` ディレクトリのコードは**参照禁止**です。

```
.archive/
├── phase9-legacy/          # Phase 9 以前のフロントエンド
├── phase9-api-legacy/      # Phase 9 以前のAPI（6,009行）
├── phase9-legacy-js/       # 旧 JS ファイル（tabs/*.ts）
├── phase9-legacy-root/     # 旧ルートファイル
└── phase9-tests-legacy/    # 旧テストファイル
```

ESLint の `no-restricted-imports` ルールで `.archive/` へのインポートは禁止されています。

## 2. 開発ルール

### 2.1 npm スクリプト

```bash
# 開発
npm run dev           # 開発サーバー起動
npm run build         # 本番ビルド
npm run start         # 本番サーバー起動

# 品質チェック
npm run type-check    # TypeScript 型チェック
npm run lint          # ESLint

# テスト
npm test              # E2Eテスト
npm run test:headed   # ブラウザ表示モード
npm run test:ui       # Playwright UI
npm run test:visual   # Visual Regression テスト
npm run test:visual:ci    # Visual Regression（CI用）
npm run test:e2e:ci       # E2E テスト（CI用）
npm run test:unit         # ユニットテスト（Vitest）
npm run test:unit:watch   # ユニットテスト（ウォッチモード）

# メンテナンス
npm run verify:debt-free  # 技術負債チェック
npm run check:bundle      # バンドルサイズ確認
npm run check:legacy      # レガシーインポート検出
npm run report:tech-debt  # 技術負債レポート生成
```

### 2.2 コーディング規約

**ファイル命名:**
- コンポーネント: `PascalCase.tsx`（例: `KPICards.tsx`）
- フック: `useCamelCase.ts`（例: `useDashboardStats.ts`）
- API: `route.ts`（Next.js Route Handlers）

**インポート順序:**
1. React / Next.js
2. 外部ライブラリ
3. 内部モジュール（`@/lib/*`）
4. 型定義
5. スタイル

**禁止事項:**
- `.archive/` からのインポート
- `any` 型の乱用（可能な限り具体的な型を使用）
- DOM 直接操作（React の state/props を使用）

### 2.3 コンポーネント設計

**ViewModel パターン:**
```typescript
// lib/hooks/useXxxViewModel.ts
export function useXxxViewModel() {
  const [data, setData] = useState<XxxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // データ取得
  useEffect(() => { /* ... */ }, []);

  // アクション
  const handleAction = async () => { /* ... */ };

  return { data, loading, error, handleAction };
}

// app/_components/xxx/XxxComponent.tsx
export function XxxComponent() {
  const { data, loading, error, handleAction } = useXxxViewModel();

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <div>{/* UI */}</div>;
}
```

**遅延ロード:**
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/app/_components/xxx/HeavyComponent'),
  { loading: () => <Loading /> }
);
```

## 3. API 設計

### 3.1 Route Handlers

```
app/api/
├── auth/                 # 認証
│   ├── callback/route.ts # OAuth コールバック
│   ├── session/route.ts  # セッション取得
│   └── logout/route.ts   # ログアウト
├── workspaces/           # ワークスペース
│   └── [workspaceId]/
│       └── data/route.ts # データ CRUD（圧縮・楽観的排他）
├── admin/                # 管理者
│   ├── users/route.ts
│   ├── sa-workspaces/route.ts
│   └── system-stats/route.ts
├── ai/                   # AI
│   └── chat/route.ts     # レート制限 5req/min
├── leads/route.ts
├── clients/route.ts
├── reports/route.ts
├── analyze/route.ts
└── audit-logs/route.ts
```

### 3.2 レスポンス形式

```typescript
// 成功
{ success: true, data: {...}, version?: number }

// エラー
{ success: false, error: string, code?: string }

// 競合（楽観的排他）
{ success: false, error: 'Version conflict', code: 'VERSION_CONFLICT', currentVersion: number }
```

## 4. データベース

### 4.1 主要テーブル

| テーブル | 説明 |
|---------|------|
| users | ユーザー情報 |
| workspaces | ワークスペース |
| workspace_members | メンバーシップ |
| workspace_data | アプリデータ（JSONB、圧縮） |
| workspace_keys | 暗号鍵 |
| sessions | セッション |
| audit_logs | 監査ログ |

### 4.2 楽観的排他制御

```typescript
// PUT /api/workspaces/[id]/data
// リクエスト: { data, version }
// version 不一致 → 409 応答
```

詳細は `docs/AIFCC-GRAND-GUIDE.md` を参照。

---

**旧コンテンツ（参考用）:**
<!-- 以下は旧アーキテクチャの参考情報です -->
<!--
├── 📂 api/                         # サーバーサイドAPI（Vercel Serverless Functions）
│   ├── _lib/                       # API共通ライブラリ
│   │   ├── db.ts                   # データベースアクセス層（Supabase PostgreSQL 17.6、pg パッケージ、653行）
│   │   ├── auth.ts                 # 認証・認可ヘルパー
│   │   ├── middleware.ts           # 認証ミドルウェア（Supabase Auth検証）
│   │   ├── session.ts              # セッション管理（Cookie読み取り、DB検証）
│   │   ├── types.ts                # API型定義
│   │   ├── response.ts             # レスポンスヘルパー
│   │   ├── encryption.ts           # 暗号化・復号モジュール（AES-256-GCM、Phase 8-2）
│   │   ├── keyManagement.ts        # 暗号鍵管理（Phase 8-2）
│   │   └── rate-limit.ts           # レート制限
│   ├── auth/                       # 認証関連API
│   │   ├── google.ts               # Google OAuth認証
│   │   ├── token.ts                # セッション/JWTトークン発行
│   │   ├── session.ts              # セッション検証・現在ユーザー情報
│   │   ├── logout.ts               # ログアウト・セッション無効化
│   │   ├── me.ts                   # 現在のユーザー情報取得
│   │   └── roles.ts                # ロール管理（Phase 7-8）
│   ├── workspaces/                 # Workspace管理API
│   │   ├── index.ts                # Workspace一覧・作成
│   │   └── [workspaceId]/
│   │       ├── data.ts             # Workspaceデータ保存・取得（暗号化対応）
│   │       └── members.ts          # メンバー管理（Phase 7-10）
│   ├── reports/                    # レポート生成API（Phase 7-11）
│   │   ├── summary.ts              # ロール別レポートサマリ
│   │   ├── cross-workspace.ts      # Cross-Workspaceレポート
│   │   └── export.ts               # CSVエクスポート
│   ├── audit-logs/                 # 監査ログAPI（Phase 7-10）
│   │   └── index.ts                # 監査ログ取得
│   └── analyze/                    # データ分析API
│       └── index.ts                # KPI分析
│
├── 📦 dist/                        # ビルド成果物（本番配信用・コミット対象）
│   ├── main.js                     # コンパイル済みエントリーポイント
│   ├── core/                       # コンパイル済みコアモジュール
│   │   ├── state.js
│   │   ├── storage.js
│   │   ├── domCache.js
│   │   ├── utils.js
│   │   ├── apiClient.js
│   │   ├── supabase.js
│   │   └── googleCalendar.js
│   └── tabs/                       # コンパイル済みタブモジュール
│       ├── dashboard.js
│       ├── mvvOkr.js
│       ├── brand.js
│       ├── leanCanvas.js
│       ├── todo.js
│       ├── leads.js
│       ├── clients.js
│       ├── zoomMeetings.js
│       ├── templates.js
│       ├── settings.js
│       └── admin.js
│
├── 🧪 tests/                       # E2Eテスト（Playwright）
│   └── e2e/
│       ├── auth.spec.ts            # 認証機能テスト（4テストケース）
│       ├── todo.spec.ts            # TODO管理テスト（8テストケース）
│       ├── leads.spec.ts           # 見込み客管理テスト（8テストケース）
│       ├── templates.spec.ts       # テンプレート集テスト（12テストケース）
│       ├── roles.spec.ts           # ロール機能テスト（Phase 7-10）
│       ├── workspace.spec.ts       # Workspace機能テスト（Phase 7-10）
│       └── reports.spec.ts         # レポート機能テスト（Phase 7-11）
│
├── 📂 migrations/                  # データベースマイグレーション（Phase 8-7、Phase 9）
│   ├── 000-base-schema.sql         # ベーススキーマ定義（6テーブル）
│   ├── 001-rls-policies.sql        # RLS（Row Level Security）ポリシー（11ポリシー + 7インデックス）
│   ├── 002-workspace-keys.sql      # Workspace暗号鍵テーブル
│   └── 003-sessions-table.sql      # セッション管理テーブル（Phase 9追加）
│
├── 📂 scripts/                     # 運用スクリプト
│   └── phase-8-7/                  # Phase 8-7 RLS適用スクリプト
│       ├── verify-rls-test.sql     # TEST DB検証
│       ├── verify-rls-prod.sql     # 本番DB検証
│       ├── backup-prod-db.sh       # 本番DBバックアップ
│       └── rollback-rls.sql        # RLSロールバック
│
└── 📦 node_modules/                # npm依存パッケージ（.gitignore対象）
    ├── typescript/                 # TypeScriptコンパイラ
    ├── @playwright/test/           # Playwrightテストフレームワーク
    └── @types/node/                # Node.js型定義

1.2 重要なポイント

✅ 依存方向：core → tabs → main の一方向依存

⛔ 循環参照禁止：tabs から core のみ呼び出し可能、逆は禁止

📝 開発フロー：js/*.ts を編集 → npm run build → dist/*.js 生成

🌐 本番配信：index.html は dist/main.js を読み込み（ES Modules）

🧪 テスト実行：npm test でE2Eテスト実行（32テストケース、100%成功）

🚀 本番運用：v2.8.0 が本番環境で稼働中（2025-11-18デプロイ完了）

1.3 .gitignore 対象ファイル（自動生成・除外）
node_modules/          # npm依存パッケージ
playwright-report/     # テストレポート（実行時に自動生成）
test-results/          # テスト結果（実行時に自動生成）
*.log                  # ログファイル（server.log, test-output.log等）
.DS_Store              # macOS一時ファイル

1.4 開発の変遷（v1.4.0 → v2.8.0）
項目	JavaScript版 (v1.4.0)	TypeScript版 (v2.0.0)	本番版 (v2.8.0)
ソースコード	js/*.js	js/*.ts	js/*.ts
ビルド	不要	npm run build	npm run build
型チェック	なし	npm run type-check	npm run type-check
index.html	./js/main.js	./dist/main.js	./dist/main.js
E2Eテスト	未実装	Playwright（32テスト、90成功）	Playwright（32テスト、100%成功）
API連携	なし	なし	Google API、サーバーAPI
管理機能	なし	なし	管理者タブ、Supabase連携
データベース	なし	なし	Supabase PostgreSQL 17.6
認証方式	なし	なし	Supabase Auth + セッション管理
本番環境	未デプロイ	未デプロイ	✅ デプロイ完了（Phase 9完了）
2. フェーズ完了と承認フロー

本プロジェクトでは、すべてのフェーズ完了後に
Claude Code（実装エージェント） が「完了報告」を行い、
ChatGPT（統合エージェント） が「承認」または「修正指示」を返信する。

2.1 完了報告テンプレート（Claude Code用）

各フェーズ終了時は、必ず以下の形式で出力してください：

✅ Phase X 完了報告

**実施内容概要:**
- 〇〇機能の実装
- △△の修正

**変更ファイル一覧:**
- `js/tabs/xxx.ts` - 主要機能追加
- `js/core/yyy.ts` - ユーティリティ拡張

**修正理由:**
- 〇〇を実現するため
- △△の整合性を保つため

**検証結果:**
- ✅ TypeScript型チェック: `npm run type-check` 成功
- ✅ ビルド: `npm run build` 成功
- ⚠️ E2Eテスト: 未実施（手動確認推奨）

**影響範囲:**
- 既存データ構造: 変更なし / 拡張のみ
- 既存機能: 影響なし / 一部修正

**次フェーズ提案（任意）:**
- Phase X+1: 〇〇の実装を推奨

2.2 承認フロー（業務プロセス）

Claude Code → 完了報告を提出

ChatGPT → 承認 or 修正指示を返信

人間開発者 → 最終確認・コメント

Claude Code → （承認後）次フェーズ開始

重要: ChatGPTの承認が出るまで、次フェーズには進まないこと。
承認されるまで再実行・修正を繰り返す。

3. 基本ルール & 性能要件（全AI・開発者共通）

3.1 基本ルール

1. 本ファイルを読まずに改修・追加実装しないこと。
2. TypeScript必須ルール（⭐ 重要）
   - 新規ファイルは必ず .ts 拡張子で作成
   - .js ファイルの作成は禁止（dist/ は自動生成なので除く）
   - js/*.ts を編集 → npm run build → dist/*.js 生成
   - 型定義を必ず記述（any 型の乱用禁止）
   - ビルド前に npm run type-check で型エラーがないことを確認
3. localStorage への直接アクセス禁止（core/storage.ts の loadData / saveData / resetData を使用）
4. イベント登録ルール
   - initXxxTab() → 初期化のみ
   - renderXxxTab() → 描画・更新のみ
5. window 公開関数ルール（⭐ 重要）
   - HTMLから直接呼ばれる関数（onclick, onchange等）のみ window に公開
   - タブ内部で完結する関数、他の window 公開関数から呼ばれる補助関数は window に出さない
   - グローバル汚染を最小限に抑える
6. 変更範囲を最小限にする（他タブ・他coreファイルへ影響を与えない）
7. 全自動リライト禁止（AIによる全ファイル再整形・一括リファクタは禁止）
8. 変更箇所の報告義務（修正したファイル・関数・目的を箇条書きで残す）
9. 互換性を壊す変更は禁止（appData構造・既存key名を勝手に変更しない）

3.2 React 実装ルール（Phase 9.92 以降の必須ガードレール）

Phase 9.92 以降の UI 実装は、すべて次のルールに従うこと。これを外れた実装は禁止。場当たり的な React 化を防ぐための最低条件とする。

#### 3.2.1 画面とロジックの分離ルール

1. **1画面 = 1 ViewModel Hook**
   - 例：ダッシュボード → `useDashboardViewModel()`
   - 例：見込み客管理 → `useLeadsViewModel()`
   - 例：既存客管理 → `useClientsViewModel()`

2. **ViewModel Hook の責務**
   - API 呼び出し（fetch / Supabase クエリ）
   - データ整形・集計ロジック
   - イベントハンドラ定義（ボタン押下時に何をするか）
   - ローディング・エラー状態の管理

3. **画面コンポーネントの責務**
   - ViewModel から渡された値を表示するだけ
   - イベントハンドラを props 経由で子コンポーネントに渡す
   - コンポーネント内で直接 fetch しない

#### 3.2.2 型と API 契約のルール

1. **API 入出力型は 1 ファイルに集約**
   - 例：`lib/types/api.ts` または `lib/types/index.ts`
   - ここに `DashboardStats`, `Lead`, `Client`, `TodoItem` などを定義する。

2. **Route Handler（`app/api/**/route.ts`）と ViewModel は、必ず同じ型定義を import して使う。**
   - 片方だけ `any` や独自の型を書かない。

3. **Zod 等のスキーマを使う場合も、型定義と同じファイルで管理する。**

4. **`any`, `unknown` を暫定的に使った場合は、必ず `// TODO: 型を具体化（Phase x.x）` を付けて技術負債として明示する。**

#### 3.2.3 DOM 直接操作・副作用のルール

1. **DOM 直接操作禁止**
   - `document.getElementById`, `querySelector`, `innerHTML`, `classList.add/remove` は原則禁止。
   - どうしても必要な場合（サードパーティライブラリ等）は、専用のラッパーコンポーネントを作り、`useEffect` 内で局所的に閉じる。

2. **`window`, `document` へのアクセスは**
   - `typeof window !== 'undefined'` ガード付き、
   - かつ `useEffect` 内に限定する。

3. **副作用（データ保存・ログ出力など）はすべて ViewModel Hook 内に集約し、UI コンポーネント側では副作用を持たない。**

#### 3.2.4 データフローと状態管理のルール

1. **状態は原則 `useState` / `useReducer` で ViewModel 内に保持し、props で下に流す。**

2. **画面をまたぐグローバル状態が必要な場合のみ、Context や Zustand 等の利用を検討する。**
   - それでも「どこからでも書き換え可能」な設計にはしない。

3. **「一時的に main.js のロジックを呼び出すブリッジ」は Phase 9.92 では使用禁止。**
   - すべて React の state/props に完全移行するフェーズとする。

#### 3.2.5 実装単位と完了条件のルール

1. **1タブずつ完全移行**
   - ダッシュボードが 100% 完了するまでは、他タブに着手しない。

2. **各タブは次の 3 レイヤが揃って Definition of Done (DOD) とみなす。**
   - ViewModel Hook（ロジック）
   - Presentational Components（UI）
   - API + 型定義（契約）

3. **各タブ完了時に必ず**
   - `npm run type-check`
   - `npm run build`
   - 対象タブに関係する Playwright テスト
   を通すこと（テスト未整備なら TODO として明記する）。

#### 3.2.6 window 公開関数の廃止方針

**旧実装**: HTML の `onclick` 属性から直接 `window.functionName()` を呼び出していた。

**React 実装**: すべて React イベントハンドラに置き換える。

**移行手順**:
1. 旧実装で `window.xxx = function() { ... }` としていた関数を特定
2. ViewModel Hook 内で同等の関数を定義
3. UI コンポーネントで `onClick={handleXxx}` として props で渡す
4. HTML の `onclick="window.xxx()"` を削除

#### 3.2.7 core 層の再利用方法

**`lib/core/*` の既存ロジック**（`apiClient.ts`, `auth.ts` など）は、React Hooks でラップして使用する。

**例**:
```typescript
// lib/core/apiClient.ts（既存）
export async function fetchWorkspaceData(workspaceId: string) { ... }

// lib/hooks/useDashboardViewModel.ts（新規）
import { fetchWorkspaceData } from '@/lib/core/apiClient';

export function useDashboardViewModel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const result = await fetchWorkspaceData('xxx');
      setData(result);
    }
    load();
  }, []);

  return { data };
}
```

#### 3.2.8 Supabase Auth / APIClient の React 統合方法

**Supabase Auth**:
- `lib/client/supabase.ts` で初期化されたクライアントを使用
- ログイン状態は `app/(app)/layout.tsx` で管理し、Context 経由で各ページに渡す

**APIClient**:
- `lib/core/apiClient.ts` の既存関数を ViewModel Hook 内で呼び出す
- Cookie（`aifcc_session`）は自動的に送信される（`credentials: 'include'`）

#### 3.2.9 React Component の完了定義（DOD）

各タブの React 化が「完了」とみなされる条件：

**機能要件**:
- 旧 UI の機能がすべて React で動作する
- DOM 直接操作を一切使用していない
- 旧 `js/tabs/*.ts` のロジックが漏れなく移管されている

**非機能要件**:
- レスポンシブ（モバイル・タブレット・デスクトップ）
- 旧 UI とスクリーンショット比較で 95% 以上一致する

**技術要件**:
- `npm run type-check` が通る
- `npm run build` が成功する
- 対象タブに関係する Playwright テストが通る
- すべてのロジックが ViewModel Hook に集約されている
- API 型定義が `lib/types/*.ts` で管理されている

3.3 性能要件（Performance Requirements）— Phase 9 以降の必須基準

すべての機能追加は以下の NFR を満たし、計測結果と影響範囲をレポートして「パフォーマンス承認」を受けること。詳細な測定手順・追加メトリクスは `DOCS/Performance-Specification-v1.0.md` を参照する。

- UI 操作（P95 = 全計測の 95% が基準未満）
  - 初回ログイン → Dashboard 表示: P95 < 2.0 秒
  - タブ切替（Dashboard / Leads / Clients / Reports）: P95 < 1.2 秒
  - Workspace 切替: P95 < 2.2 秒（ブラウザキャッシュあり / 4G 回線でも満たす）
- API レスポンス SLA
  - 読み取り系（GET）: P95 < 350ms
  - 作成・更新系（POST/PUT）: P95 < 450ms
  - 重処理（レポート生成）: P95 < 800ms（最大 1.2s）
- 暗号化／復号時間（AES-256-GCM 想定）
  - Workspace データ復号: P95 < 280ms
  - 保存時暗号化: P95 < 180ms
- JSON / LocalStorage / キャッシュ
  - workspace_data JSON サイズ上限: 最大 250KB / workspace
  - 不必要な再保存・deep copy は禁止（必要最小限）
- UI レンダリング
  - DOM 再描画によるフレーム落ち: 0
  - Leads 300件等の長いリストでもスクロール 60fps を維持
  - state 更新は 1 タブ 1 回に集約し、不要な再レンダリングを防ぐ
- バックエンド負荷
  - Prisma Query の N+1: 0
  - RLS 付きクエリ: 1 ユーザー操作あたり最大 3 クエリ
  - DB 接続数（Vercel Postgres）: P95 < 15 connections
- エラー率（SLO）
  - 全体エラー率（5xx）: 0.10% 以下
  - 認証・暗号化系（401/403/422）: 0.20% 以下
- デグレ防止
  - すべての新機能は上記基準への影響を測定し、比較・影響範囲レポートを添付すること（Performance Specification v1.0 の提出物チェックリストに従う）

4. Claude / ChatGPT サブエージェント運用ルール（正式正本）
4.1 必須読込

すべてのエージェント（Claude Code / ChatGPT / Copilot 等）は、作業開始前に HOW-TO-DEVELOP.md を読み込み、このルールに従うこと。

4.2 役割分担（分散並列）

大きめの開発タスクでは、必要に応じて以下の「サブエージェント」を起動してよい：

🧩 設計エージェント: 要件整理・型定義・データ構造

🔧 実装エージェント: 該当タブ / core の実装

🧪 テストエージェント: Playwright / 手動確認観点の生成

📘 ドキュメントエージェント: HOW-TO-USE.md / CHANGELOG.md 更新案の作成

ただし各サブエージェントは担当ファイルを明示し、他エージェントの担当領域を勝手に書き換えないこと。

4.3 出力フォーマット統一（DOD準備）

各サブエージェントは作業完了時に、必ず次の形式でレポートを出力する：

変更ファイル

修正内容

理由

影響範囲

推奨ビルド／テストコマンド（例: npm run build, npm test）

4.4 統合エージェントの存在

分散出力は、必ず「統合役エージェント（または人間）」がレビューし、コンフリクト解消・最終判断を行う。
統合前に main ブランチへ直接反映しない。

5. 機能追加ルール（新規機能の設計・実装・統合）

※この章は、Phase 9 以降の機能追加・最適化を安全に行うための追加ガイドラインです。
基本ルール（第3章）と合わせて必ず遵守してください。

5.1 事前整理（Why / Who / What）

新しい機能を追加する前に、必ず以下を短く整理すること（AIに書かせてもよい）：

目的（Why）

どの課題を解決したいのか

どのメトリクス（KPI・UX・運用負荷・セキュリティ等）を改善したいのか

対象ユーザー（Who）

SA / OWNER / ADMIN / MEMBER のどこ向けか（Phase 9.97 で権限体系を簡素化）

どのタブ（leads / clients / dashboard / …）で使うのか

機能の範囲（What / Non-Goal）

機能のスコープ（必須要件）

今回は扱わないもの（Non-Goal）

この整理は、PRやフェーズ完了報告の「実施内容概要」にそのまま流用できるレベルで書く。

5.2 変更対象の境界を明示する

機能追加時は、どのレイヤー／ファイルまで手を伸ばすかを明示すること。

例：

UIのみ（js/tabs/leads.ts 内で完結）

core + UI（js/core/state.ts に型追加 ＋ js/tabs/reports.ts で利用）

API + core + UI（api/reports/detail.ts 新設＋apiClient.ts＋reports.ts）

境界を曖昧にしたまま広範囲を触らない。
「触るファイル一覧」を先に列挙してから実装に入る。

5.3 データ構造変更ルール（appData / DB / API）

後方互換性を優先する

既存フィールドの削除・名前変更は原則禁止

新フィールド追加を基本とし、必要なら「version」フィールドで扱う

appData 変更の指針

js/core/state.ts で型定義を更新し、初期値を必ず定義

loadData / saveData との整合性を確認

既存データをマイグレーションする必要がある場合は、

一度「読み込み時に補完するコード」で吸収

その後、必要であれば専用マイグレーションフェーズ（例：Phase 9-1）で整理

DBスキーマ変更の指針

変更は必ず migrations/*.sql 経由で行う

ALTER TABLE よりも「列追加＋旧列は将来削除候補として扱う」方針を優先

RLSポリシーへの影響を最初に確認（SELECT/INSERT/UPDATE の権限が崩れないか）

API スキーマ変更の指針

レスポンスフィールドの削除は極力避ける

追加フィールドにはデフォルト値を与え、旧クライアントでも破綻しないようにする

互換性を壊す変更が必要な場合は、/v1/… /v2/… のようにバージョン分岐を検討

5.4 API 追加ルール

新規 API を追加する場合は、少なくとも以下を満たす：

役割の明確化

リソース単位で URL を設計（例：/api/reports/detail, /api/leads/bulk-update）

一つのエンドポイントで「読み取り」と「書き込み」を混在させない

統一されたレスポンス形式

成功：{ success: true, data: ... }

失敗：{ success: false, error: { code, message } } のような形に統一することを推奨

認証・認可の一貫性

api/_lib/auth.ts のヘルパーを経由して、必ず

Google OAuth の検証

Workspace メンバーシップ

ロール（OWNER / ADMIN / MEMBER）（Phase 9.97 更新）
をチェック

サーバーサイドで権限チェックを実施（SERVICE_ROLE_KEY でDBアクセス）

テスト

可能な限り、対象エンドポイントを叩く E2E テストケースを 1 つ以上追加

少なくとも Happy Path + 代表的なエラーケース（認可エラーなど）を含める

5.5 UI / UX 変更ルール

既存のUXを壊さない

既存タブの主要なボタン配置・キーボード操作は維持する

大きなレイアウト変更が必要な場合は、Phase 単位で切り出す（「レイアウト刷新フェーズ」など）

タブ間の一貫性

フィルタ・ソート・検索などの UI は、可能な限り既存タブと揃える

ボタンラベル・アイコンも可能な範囲で再利用する

パフォーマンス意識

不必要な再描画を避ける（renderXxxTab() の呼び出し頻度を抑える）

大量データのテーブル表示が必要な場合は、ページング or チャンクロードを検討する

5.6 パフォーマンス・セキュリティ・監視

パフォーマンス

ネットワーク往復回数を増やさないように、APIの粒度を調整

大量ループ・頻繁な DOM 操作は domCache.ts を経由し、キャッシュを最大限活用

将来の Phase 9 での最適化対象になり得る箇所には、コメントでメモを残す（例：// TODO: Phase9: optimize rendering）

セキュリティ

暗号化／復号処理は必ず api/_lib/encryption.ts 経由で行う

Workspace のアクセス権はサーバーサイドで auth.ts にてチェック（SERVICE_ROLE_KEY でDBアクセス）

ログに機密情報（生データや鍵情報）を書き出さない

監視・ログ

重要な操作（大量更新・エクスポート・権限変更等）は audit_logs に記録されるよう API 側で実装

エラー時には、ユーザー向けメッセージと内部ログ向けメッセージを分離する

5.7 テスト・ドキュメント更新

機能追加が完了したら、以下を「セット」で行う：

テスト

npm run type-check

npm run build

関連する tests/e2e/*.spec.ts の更新 or 追加

手動確認が必要な場合は、観点を箇条書きで残す

ドキュメント

ユーザー向け：HOW-TO-USE.md

開発向け：HOW-TO-DEVELOP.md（このファイル）、AIFCC-GRAND-GUIDE.md（必要に応じて）、SERVER-API-SPEC.md

変更履歴：CHANGELOG.md

フェーズとの紐付け

機能追加がどの Phase / Step に属するのかを明示する（例：Phase 9-2: leads パフォーマンス最適化）

6. プロジェクト統計情報（2025-11-14 最新版）
6.1 コードベース規模
区分	ファイル数	総行数
TypeScript (Source)	20ファイル	約8,200行
├─ core/	8ファイル	約2,200行
├─ tabs/	12ファイル	約5,600行
└─ main.ts	1ファイル	約400行
API (Serverless)	18ファイル	約3,800行
├─ _lib/	6ファイル	約1,200行
├─ auth/	3ファイル	約600行
├─ workspaces/	3ファイル	約800行
├─ reports/	3ファイル	約900行
└─ その他	3ファイル	約300行
JavaScript (Build)	20ファイル	約8,200行
HTML	1ファイル	約3,200行
E2Eテスト	7ファイル	約1,200行
マイグレーション	3ファイル	約500行
ドキュメント	21ファイル	約12,000行
総計	70ファイル	約37,100行
6.2 ファイル別詳細（TypeScript Source）

core層（共通基盤）

state.ts: 約750行 - 型定義・設定・データ構造（RBAC、CurrentUser等含む）

storage.ts: 約250行 - localStorage管理

apiClient.ts: 約300行 - サーバーAPI通信

supabase.ts: 約100行 - Supabase Auth 認証（Phase 9-7）

googleCalendar.ts: 約200行 - Googleカレンダー連携

auth.ts: 約430行 - RBAC権限チェック（Phase 7-8）

utils.ts: 約100行 - ユーティリティ関数

domCache.ts: 約60行 - DOM要素キャッシュ

tabs層（機能モジュール）

leads.ts: 約1,100行 - 見込み客管理（最大）

templates.ts: 約650行 - テンプレート集

leanCanvas.ts: 約580行 - リーンキャンバス

dashboard.ts: 約520行 - ダッシュボード（KPI・ファネル）

clients.ts: 約460行 - 既存客管理

reports.ts: 約450行 - レポート（Phase 7-11）

brand.ts: 約450行 - ブランド指針

mvvOkr.ts: 約400行 - MVV・OKR

zoomMeetings.ts: 約360行 - Zoom面談

todo.ts: 約340行 - TODO管理

admin.ts: 約280行 - 管理者機能（Phase 7-10）

settings.ts: 約160行 - 設定

API層（Serverless Functions）

api/_lib/db.ts: 約650行 - データベースアクセス（Vercel Postgres）

api/_lib/encryption.ts: 約300行 - 暗号化・復号（Phase 8-2）

api/_lib/auth.ts: 約200行 - 認証・認可ヘルパー

api/workspaces/[workspaceId]/data.ts: 約250行 - Workspaceデータ保存・取得

api/reports/summary.ts: 約350行 - ロール別レポート生成（Phase 7-11）

その他各種APIエンドポイント

6.3 プロジェクトメトリクス
項目	値
バージョン	2.3.1 ✅ 本番運用中
Gitコミット数	150件以上
ブランチ	main
TypeScript化完了率	100% ✅
E2Eテストカバレッジ	7タブ（50+テスト、100%成功）
ドキュメント整備率	100% ✅
本番デプロイ	✅ 完了（2025-11-12）
開発フェーズ	Phase 7 完了 / Phase 8 進行中（8-7まで完了）
API統合	Vercel Postgres（Neon）、Google API、サーバーAPI
セキュリティ	サーバーサイドアクセス制御、暗号化、監査ログ
認証・認可	Google OAuth、RBAC（3ロールモデル）
6.4 主要機能数

タブ数: 12タブ（ダッシュボード、MVV、ブランド、リーンキャンバス、TODO、見込み客、既存客、Zoom、テンプレート、レポート、設定、管理者）

アプローチチャネル: 7チャネル（リアル、HP、メルマガ、メッセンジャー、X、電話・SMS、WEBアプリ）

ステータス種別: 6種類（未接触、反応あり、商談中、成約、既存先、契約満了、失注）

テンプレートタイプ: 4種類（messenger、email、proposal、closing）

初期ABCテンプレート: 6件（messenger 3件、email 3件）

ユーザーロール: システムロール（SA / USER）+ ワークスペースロール（OWNER / ADMIN / MEMBER）（Phase 9.97 更新）

データベーステーブル: 6テーブル（users, workspaces, workspace_members, workspace_data, audit_logs, workspace_keys）

外部連携: Google OAuth、Googleカレンダー、Vercel Postgres、独自サーバーAPI

セキュリティ機能: サーバーサイドアクセス制御（SERVICE_ROLE_KEY）、AES-256-GCM暗号化、監査ログ、レート制限

7. Phase 7 & 8: セキュリティ・認証・暗号化（実装完了 / 進行中）
7.1 Phase 7: セキュリティ・認証・ロール運用（✅ 完了）

目的: ローカル中心から、サーバー認証・ロール管理を軸に再構成。

完了内容:

✅ Phase 7-1〜7-7: ロール設計・権限マトリクス整備、Google OAuth連携

✅ Phase 7-8: ロール統合API拡張（/api/auth/roles）

✅ Phase 7-9: CurrentUser管理統合（js/core/state.ts）

✅ Phase 7-10: Workspace権限・監査ログ・RBAC実装

Workspace メンバー管理API（/api/workspaces/[workspaceId]/members）

監査ログAPI（/api/audit-logs）- DB永続化対応

ロール管理API（/api/auth/roles）

RBAC権限チェック（js/core/auth.ts）- canEditLead, canViewClient等

管理UIの実装（js/tabs/admin.ts）

E2Eテスト（tests/e2e/roles.spec.ts, workspace.spec.ts）

✅ Phase 7-11: ロール別レポート生成 / 組織横断ビュー構築

ロール別レポートAPI（/api/reports/summary.ts）

SA/OWNER: 全体KPI / ファネル / チャネル統計 / チームパフォーマンス / Cross-WS レポート

ADMIN: ワークスペースKPI / ファネル / チームパフォーマンス

MEMBER: 個人パフォーマンス / 自分のタスク・リード・クライアント

（Phase 9.97 で EXEC/MANAGER → OWNER/ADMIN に統合）

Cross-Workspace集計API（/api/reports/cross-workspace.ts）

レポートエクスポートAPI（/api/reports/export.ts）- CSV形式

レポートタブUI（js/tabs/reports.ts）

✅ Phase 7-12: ロール同期安定化・Phase8ブリッジ

成果:

認証とロール制御を完全にサーバーサイドへ移行

ログイン状態・ユーザー切替・アクセス権限が全てGoogle OAuth + DB管理下に統一

localStorage はキャッシュ層としてのみ機能

7.2 Phase 8: Workspace管理・暗号化・完全サーバー化（🚧 進行中）

目的: 完全サーバー化・暗号化保存・自動同期を実現。

完了内容:

✅ Phase 8-1: Workspace暗号化方針の設計（マスター鍵 + Workspace鍵の二層暗号化）

✅ Phase 8-2: 暗号鍵管理モジュール実装（api/_lib/encryption.ts, api/_lib/keyManagement.ts）

✅ Phase 8-3: サーバー保存プロトコル整備（AppData → 暗号化JSON）

✅ Phase 8-4: フロント復号処理・同期Worker統合

✅ Phase 8-5: Workspace切替・データ同期安定化

✅ Phase 8-6: セキュリティ検証・暗号化統合レビュー

✅ Phase 8-7: RLSマイグレーション適用 & TEST_DB切替

migrations/000-base-schema.sql: ベーススキーマ（6テーブル）

migrations/001-rls-policies.sql: RLSポリシー（11ポリシー、7インデックス）

migrations/002-workspace-keys.sql: Workspace鍵テーブル

TEST DB検証完了（scripts/phase-8-7/verify-rls-test.sql）

🚧 Phase 8-8: E2E Testing（Google Login → Workspace作成 → RLS操作確認）- 次のステップ

🔜 Phase 8-9: Production Cutover & Monitoring（本番切替＋監視）

🔜 Phase 9-1: Legacy Data Migration（旧・平文データの移行）

データベーススキーマ（Phase 8-7）:

users (id, google_sub, email, name, picture, system_role, account_type, created_at, updated_at)  -- Phase 9.97: global_role → system_role
workspaces (id, name, created_by, created_at)
workspace_members (id, workspace_id, user_id, role, joined_at)
workspace_data (workspace_id, data, updated_at) -- JSONB暗号化データ
audit_logs (id, workspace_id, user_id, action, resource_type, resource_id, details, created_at)
workspace_keys (workspace_id, encrypted_key, created_at, updated_at) -- 暗号化されたWorkspace鍵


RLSポリシー:

users: 自分のレコードのみ閲覧・更新可能（users_select_self, users_update_self）

workspaces: 所属Workspaceのみ閲覧可能（workspaces_select_member）、OWNER/ADMINのみ更新可能（workspaces_update_admin）（Phase 9.97 更新）

workspace_members: 所属Workspaceのメンバー閲覧可能（workspace_members_select）、admin以上が管理可能（workspace_members_modify_admin）

workspace_data: 所属Workspaceのデータのみ閲覧・変更可能（workspace_data_select_member, workspace_data_modify_member）

audit_logs: admin以上が閲覧可能（audit_logs_select_admin）、全メンバーが作成可能（audit_logs_insert_member）

暗号化仕様:

アルゴリズム: AES-256-GCM

二層暗号化: マスター鍵（環境変数 MASTER_ENCRYPTION_KEY）+ Workspace鍵（workspace_keys テーブル）

データ形式: {"version":"1", "iv":"...", "authTag":"...", "ciphertext":"..."}

---

## 8. Phase 9-12: 継続的パフォーマンス維持開発ガイド（⚠️ 重要）

### 8.1 Phase 9-12 の基本方針

Phase 9〜12 では、**継続的にパフォーマンス基準と容量制限を守りながら順次機能を追加していく**アプローチを採用する。

**「後で一括最適化」は行わない。各Phase完了時に必ずパフォーマンス基準と容量制限を満たす。満たさない場合は次Phaseへ進まない。**

### 8.2 Phase 9-12 実施順序

```
Phase 9: 暗号化基盤 + 既存API完成 + 基準確定
  ↓ 完了確認チェックリスト（必須）
Phase 10: TODO拡張（4象限 + カレンダー + 松竹梅習慣）
  ↓ 完了確認チェックリスト（必須）
Phase 11: Action Map（戦術レイヤー）
  ↓ 完了確認チェックリスト（必須）
Phase 12: OKR（戦略レイヤー）
  ↓
✅ 本番運用開始可能
```

### 8.3 各Phase共通の開発ルール

#### 8.3.1 容量制限ポリシー（workspace_data JSON）

| Phase | 目標容量 | ハード上限 | 対策 |
|-------|---------|-----------|------|
| **Phase 9** | 150KB | 250KB | 基準確定 |
| **Phase 10** | 225KB以下（90%） | 250KB | 初期値30分推奨、subTasks最大10件 |
| **Phase 11** | 200KB以下推奨（80%） | 250KB | アーカイブ機能実装（必須） |
| **Phase 12** | 200KB以下推奨（80%） | 250KB | OKRアーカイブポリシー実装 |

**データ最適化（上限値・Phase 10〜12 共通）**:

| データ種別 | フィールド | 上限値 | 超過時の動作 |
|-----------|-----------|--------|-------------|
| Task | subTasks | 10件 | UI警告、保存不可 |
| Task | title | 200文字 | UI警告、保存不可 |
| ActionItem | linkedTaskIds | 20件 | UI警告、保存不可 |
| ActionItem | description | 500文字 | UI警告、保存不可 |
| KeyResult | linkedActionMapIds | 10件 | UI警告、保存不可 |
| Objective | description | 1000文字 | UI警告、保存不可 |

#### 8.3.2 パフォーマンス基準（Phase 9で確定、10〜12で維持）

| 区分 | 指標 | 基準 |
|------|------|------|
| UI 操作 | 初回 Dashboard 表示 | P95 < 2.0 秒 |
| UI 操作 | タブ切替（Dash/Leads/Clients/Reports） | P95 < 1.2 秒 |
| UI 操作 | Workspace 切替 | P95 < 2.8 秒 |
| API | GET 系 | P95 < 350ms |
| API | POST/PUT 系 | P95 < 450ms |
| API | 重処理（レポート生成） | P95 < 800ms（最大 1.2s） |
| 暗号化 | Workspace 復号 | P95 < 280ms |
| 暗号化 | 保存時暗号化 | P95 < 180ms |
| データ | workspace_data JSON | 1 Workspace 250KB 以下 |

**Phase 10 追加基準**:
- 4象限ボード表示: P95 < 1.2秒
- TODO作成・編集: P95 < 800ms
- カレンダー連携: P95 < 1.5秒

**Phase 11 追加基準**:
- Action Map タブ表示: P95 < 1.5秒
- Action Item 進捗計算: P95 < 100ms
- Phase 10基準も維持

**Phase 12 追加基準**:
- OKRタブ表示: P95 < 1.5秒
- ロールアップ処理: P95 < 100ms
- Phase 9〜11基準もすべて維持

#### 8.3.3 各Phase完了時の必須チェック

**Phase X-0: 容量計測（すべてのPhaseで実施）**
```bash
# 現在の workspace_data サイズを計測
- 全Workspaceの容量を確認
- 最大・平均・P95サイズを算出
- Phase X 追加容量の見積もり
- 250KB制限に対する余裕を確認
- 超過リスクがある場合は軽量化策を検討
```

**Phase X-6/7: パフォーマンステスト（すべてのPhaseで実施）**
```bash
# パフォーマンス基準を満たすまで改善
- 新機能のパフォーマンス計測
- 既存機能のパフォーマンス回帰確認
- ボトルネック特定
- 改善実施
- 再計測
- 基準を満たさない限り次Phaseへ進まない
```

### 8.4 Phase 9: 暗号化基盤 + 既存API完成 + 基準確定（✅ 完了 - 92%達成）

**目的**: Phase 10以降の機能拡張に耐える安定した基盤を確立

**スコープ**:
- 既存API（Phase 8まで）の完成のみ
- `/api/auth/*`, `/api/workspaces/*`, `/api/audit-logs`, `/api/reports/*`, `/api/leads/*`, `/api/clients/*`
- **対象外**: `/api/todos/*`, `/api/action-maps/*`, `/api/objectives/*`（Phase 10〜12で実装）

**完了基準（Phase 9 + Phase 9.5 完了）**:
- ✅ サーバーセッション認証が動作（dev / 本番）
- ✅ 暗号化割当表（Encryption Allocation Table）確定
- ✅ Performance Specification v1.0 確定
- ✅ workspace_data 250KB容量制限ポリシー確定
- ✅ **Cookie設定完全実装（読み取り・送信・生成すべて完了、Phase 9.5-A-0）**
- ✅ DB移行完了（Neon → Supabase PostgreSQL 17.6）
- ✅ 認証レイヤー移行完了（JWT → Supabase Auth + セッション管理）
- ✅ **環境変数の完全整備完了（Phase 9.5-A-3）**
- ✅ **型エラー解消完了（User.id 等を number に統一、TypeScript エラー 50件 → 0件）**
- ✅ **スキップテスト完全カタログ化完了（54件、Phase 9.5-C-2）**
- ✅ **Phase 9.5 基盤整備完了（進捗率 96%）**
- 📋 **E2E 完全化タスク（スキップテスト 54件）を Phase 9.7 へ正式移管（2025-11-18）**

**完了実績**:
- ✅ DB基盤移行（Neon → Supabase）: 100% 完了（2025-11-17）
- ✅ 認証レイヤー移行（JWT → Supabase Auth + セッション）: 100% 完了（2025-11-17）
- ✅ 暗号化API統合（workspace_data / Leads / Clients）: 100% 完了
- ✅ Phase 9-7: Google OAuth リダイレクト問題修正（localhost → 本番URL）
- ✅ Phase 9-7: Supabase Auth完全移行（旧認証コード削除）
- ✅ Phase 9-7: Supabase CDN対応
- ✅ Phase 9-7: パフォーマンス改善（ログイン後1秒以内表示）
- ✅ Phase 9-7: Cookie設定最適化（Domain属性削除、SameSite=Lax統一）

**詳細**: `DOCS/legacy/PHASE9-ENCRYPTION-AND-API-RUNBOOK.md`（レガシー）、`DOCS/Phase9-DB-Migration-Progress.md` 参照

---

### 8.5 Phase 9.5: Core Hardening（✅ 完了 - E2E 完全化は Phase 9.7 へ移管）

**目的**: Phase 9 の成果を基盤に、基盤整備（Cookie, 環境変数, 型整合）を完了し、Phase 10 以降の安全な機能拡張を可能にする。

**完了日**: 2025-11-18
**進捗率**: 92% → 96% 達成
**移管**: E2E テスト完全化タスク（スキップテスト 54件）を Phase 9.7 へ正式移管

**スコープ（3つのサブフェーズ）**:

**9.5-A: Core Hardening（基盤強化）**
- **A-0: Cookie設定処理の完成（✅ 完了）**
  - ✅ `api/_lib/session.ts` に `setCookieHeader()` 関数を実装完了
  - ✅ `api/auth/token.ts` でセッション作成時に Set-Cookie ヘッダーを返却
  - ✅ Cookie 仕様: HttpOnly, Path=/, Max-Age=604800, SameSite=Lax, Secure（本番のみ）
  - ✅ Domain 属性削除（ブラウザが自動設定）
- **A-3: 環境変数の完全整備（✅ 完了）**
  - ✅ `.env.example` を "Supabase PostgreSQL 17.6" 前提に全面更新
  - ✅ 必須環境変数（9項目）と任意環境変数（18項目）の明示
  - ✅ `scripts/verify-env.sh` で全必須環境変数の存在確認スクリプト作成
- **型整合（✅ 完了）**
  - ✅ User.id, Workspace.ownerUserId, Session.userId を number に統一
  - ✅ URL パラメータは parseInt で number に変換してから DB 関数に渡す
  - ✅ TypeScript エラー 50件 → 0件
- 暗号化レイヤーのフィールド単位化・破損耐性
- 容量管理ポリシーの確定（workspace_data 250KB制限運用）
- Dev / Prod / Local の環境整合性確保
- CI/CD安定化（Vercel デプロイの安定化）

**9.5-B: Next.js 15 への全面移行**
- Next.js 15 プロジェクト初期化（App Router）
- **APIエンドポイントの正確なカタログ化（Phase 9 残債の解消）**
  - 現状: "概算 25-28エンドポイント"（正確なカウント未実施）
  - 対応: 全APIエンドポイントの正確なカウントと完全なカタログ作成
- API Route Handlers 化（`api/*` → `app/api/**/route.ts`）
- フロントエンドReact化（`js/tabs/*` → `app/(app)/*/page.tsx`）
- 認証フローNext.js統合

**9.5-C: テスト・ドキュメント対応**
- E2E/Integration/Unitテスト更新（Next App Router対応）
- スキップテスト解消（21件の棚卸し）
- ドキュメントNext対応（GRAND-GUIDE / HOW-TO-DEVELOP / Performance Spec）

**完了基準**:
- ✅ 暗号化レイヤーがフィールド単位（またはロジカルセクション単位）で復号エラーに耐えられること
- ✅ 容量管理ポリシーが Performance Spec と整合し、最低限の実装が入っていること
- ✅ Dev / Prod / Local の挙動差分が既知の範囲に収束していること
- ✅ CI/CD（Git → Vercel）が安定して成功すること
- ✅ フロントエンドが Next App Router ベースで動作していること
- ✅ API が `app/api/**/route.ts` に統一されていること
- ✅ 旧構成（独自 `js/` エントリ、旧 `api/` ルート）が削除されていること
- ✅ 認証フローが Next ベースの統一ロジックに移行済みであること
- ✅ 主要な E2E / Integration / Unit テストが Next 構成で PASS していること
- ✅ スキップテストが原則ゼロ（または理由付きで明示的に残されている）であること
- ✅ GRAND-GUIDE / HOW-TO-DEVELOP / Performance Spec など主要ドキュメントが最新版になっていること

**Phase 9 からの引き継ぎ事項（残り8%の仕上げタスク）**:
- ✅ DB移行完了（Neon → Supabase PostgreSQL 17.6）
- ✅ 認証レイヤー移行完了（JWT → Supabase Auth + セッション管理）
- ✅ 暗号化統合完了（workspace_data / Leads / Clients）
- ✅ Cookie設定基盤（読み取り・送信）: 実装済み
- ⚠️ **Cookie設定処理の完成（約50% → 100%へ）**
  - Set-Cookie ヘッダー生成関数が未実装
  - Phase 9.5-A-0 で `setCookieHeader()` を実装
- ⚠️ **環境変数の完全整備（65% → 100%へ）**
  - `.env.example` が古い情報（"Vercel Postgres"記載）
  - Phase 9.5-A-3 で全必須・任意環境変数を明示
- ⚠️ **APIエンドポイントの正確なカタログ化**
  - 現状は"概算 25-28エンドポイント"
  - Phase 9.5-B-2 で正確なカウントとカタログ作成
- ⚠️ **スキップテスト解消（47件を段階的に対応）**
  - Phase 9.5: 18件、Phase 9.7: 12件、Phase 10: 17件
- ⚠️ **Next.js 15 移行準備（現在は TypeScript + Vercel Functions 構成）**
  - Phase 9.5-B で App Router ベースに全面移行

**Phase 9.7への引き継ぎ事項**:
- Next.js 15 + Supabase + AES基盤完成
- スキップテスト削減（Phase 9.7で0件達成）
- 環境差分解消
- CI/CD安定化

**詳細**: `DOCS/Phase9.5-Core-Hardening-Next-Ready-Migration-Design.md` 参照

---

### 8.6 Phase 9.7: 最終ハードニング（🚧 準備中）

**目的**: AIFCC Cockpit を「技術負債ゼロの状態」へ完全に整え、Phase 10〜12 の大規模拡張に備える最終ハードニングフェーズ。

**スコープ**:
- Next.js App Router への完全整合
- 9.3〜9.5 に残存するレガシー構造の全廃
- API/E2E/Unit 全テストの完全成功
- 環境変数ガバナンスの確立
- 暗号化データの完全安定化

**完了基準（DOD）**:

**API層の完全整合**
- ✅ 認証ミドルウェアの統合・共通化
- ✅ セッションCookieの厳格検証
- ✅ 401/403/404レスポンスの正規化
- ✅ 入力バリデーションの共通化
- ✅ HTTP動詞の誤用排除（GET/POST/PUT/DELETE）

**暗号化層の完全安定化**
- ✅ Master Keyの取り扱い標準化
- ✅ AES-256-GCM decrypt の全エンドポイント検証
- ✅ Nonce再利用禁止・検証
- ✅ Workspace Key生成フローの一貫化

**Supabase RLS完全検証**
- ✅ `workspace_data` RLSポリシー確認
- ✅ `workspace_keys` RLSポリシー確認
- ✅ ユーザー別行レベルアクセスの正常性

**レガシー構造の全廃**
- ✅ レガシー `unlockApp()` の全削除
- ✅ localStorage フォールバックの廃止
- ✅ エラーフォーマットの標準化
- ✅ AppData整合性バリデータの導入
- ✅ 9.3〜9.5残存レガシーコードの完全削除

**全テスト成功**
- ✅ E2Eテスト全成功（ログイン、WS切替、CRUD、リロード永続化、RLS境界）
- ✅ Unitテスト全成功（暗号化ヘルパー、APIClient、状態管理）
- ✅ Integrationテスト全成功（DBマイグレーション、`/api/workspaces/*`）
- ✅ スキップテスト0件達成（Phase 9時点47件から完全解消）

**パフォーマンス基準達成**
- ✅ Dashboard初期表示: P95 < 2s
- ✅ API応答: P95 < 300ms
- ✅ WorkspaceData サイズ: P95 < 250KB
- ✅ Google SDK読み込みレース条件解決

**環境変数ガバナンス**
- ✅ 全必須環境変数の設定確認（JWT_SECRET, MASTER_ENCRYPTION_KEY, SUPABASE_URL等）
- ✅ Vercel環境変数の完全整合
- ✅ Dev/Prod/Local環境の完全一致

**Phase 10 への GO/NO-GO 条件**:

**GO 条件**
1. すべてのテストが成功
2. Performance Spec v1.0 に準拠
3. 暗号化エラーが 0 件
4. DB schema が凍結（変更完了）
5. スキップテスト0件
6. Next.js/Vercel Serverless制約に完全準拠
7. Vercel環境変数が完全設定・整合済み

**NO-GO 条件**
1. ログインループ（session flapping）が発生
2. リロード後の永続化が不安定
3. WorkspaceData が 250KB を超過
4. スキップテストが1件でも残存

**Phase 10への引き継ぎ事項**:
- 技術負債ゼロの状態達成
- 全テスト成功（スキップテスト0件）
- Next.js App Router完全整合
- 環境変数ガバナンス確立

**詳細**: `DOCS/PHASE9.7-RUNBOOK.md` 参照

---

### 8.7 Phase 10〜12 の重要ポイント

Phase 9.7 完了後、以下のフェーズへ順次移行:
- **Phase 10**: TODO拡張（4象限 + カレンダー + Elastic Habits）
- **Phase 11**: Action Map（戦術レイヤー）
- **Phase 12**: OKR（戦略レイヤー）

各Phase開始前に必ず以下を確認:
1. 前Phaseの完了基準（DOD）全項目達成
2. GO/NO-GO条件のクリア
3. スキップテスト0件
4. パフォーマンス基準維持

### 8.8 Phase 10: TODO拡張（4象限 + カレンダー + 松竹梅習慣）

**目的**: コビーの「緊急 × 重要」マトリクスを実装し、時間の質を可視化

**主要機能**:
- 4象限ボード（♠♥♦♣）
- 15分単位時間管理（基本は30分以上ブロック）
- Googleカレンダー連携
- Elastic Habits（松竹梅習慣）

**完了基準**:
- ✅ 機能実装完了（4象限ボード、カレンダー連携、Elastic Habits）
- ✅ workspace_data 225KB以下（250KB制限の90%以内）
- ✅ パフォーマンス基準を満たす（4象限ボード P95 < 1.2秒 等）
- ✅ E2Eテスト全てpass（既存機能回帰含む）

**詳細**: `DOCS/PHASE10-TODO-ELASTIC-RUNBOOK.md` 参照

### 8.9 Phase 11: Action Map（戦術レイヤー）

**目的**: 上司→部下の戦術指示レイヤーを実装し、TODO と連携

**主要機能**:
- Action Map CRUD（戦術計画）
- Action Item ツリー構造（担当アサイン）
- TODO連携（生成/紐付け）
- 進捗集計（ロールアップ）
- アーカイブ機能（容量対策）

**完了基準**:
- ✅ 機能実装完了（Action Map、Action Item、TODO連携、進捗集計）
- ✅ workspace_data 200KB以下推奨（アーカイブ実装済み）
- ✅ パフォーマンス基準を満たす（Action Map表示 P95 < 1.5秒、Phase 10基準も維持）
- ✅ E2Eテスト全てpass（Phase 10回帰含む）

**詳細**: `DOCS/PHASE11-ACTION-MAP-RUNBOOK.md` 参照

### 8.10 Phase 12: OKR（戦略レイヤー）

**目的**: 戦略（OKR）→ 戦術（Action Map）→ 実行（TODO）の一気通貫を完成

**主要機能**:
- Objective / Key Result CRUD
- KR ↔ ActionMap 連携（N:M対応）
- ロールアップ処理（Task → ActionItem → ActionMap → KR → Objective）
- Dashboard OKRウィジェット

**完了基準（本番運用開始）**:
- ✅ 機能実装完了（OKR CRUD、ロールアップ、Dashboard連携）
- ✅ workspace_data 250KB以下（ハード上限）、200KB以下推奨
- ✅ パフォーマンス基準を満たす（Phase 9〜11の全基準も維持）
- ✅ E2Eテスト全てpass（統合E2E含む）
- ✅ 既存機能に破壊的変更がない

**詳細**: `DOCS/PHASE12-OKR-RUNBOOK.md` 参照

### 8.11 Phase 9-12 開発時の注意事項

#### サブフェーズ進行ルール
- 各Phaseは **X-0〜X-7** のサブフェーズ単位で進行
- 各サブフェーズごとに**レポートして一度停止し、人間の承認なしに次へ進まない**
- **Design → Implement → Test → Refine → Report** の順番を必ず守る

#### AI開発者への指示
```
Phase X 開発時は、必ず以下を読み込んでから開始すること：
- DOCS/HOW-TO-DEVELOP.md（本ファイル）
- DOCS/AIFCC-GRAND-GUIDE.md
- DOCS/PHASEXX-RUNBOOK.md（該当Phase）
- DOCS/Performance-Specification-v1.0.md

変更ファイル、修正内容、理由、影響範囲を必ず明示し、
パフォーマンス計測結果を提出すること。
```

### 8.12 技術負債管理プロセス（Phase 9.92/9.93）

#### 背景と目的

Phase 9.92（全タブReact移行）では、**「機能移行を最優先」** し、パフォーマンス最適化や将来の拡張性確保は Phase 9.93 に先送りします。これにより、技術負債が発生しますが、**意図的かつ管理された形で負債を記録・追跡** することで、Phase 9.93 での計画的な解消を可能にします。

#### 技術負債の3カテゴリ

Phase 9.92 では、以下の3つのカテゴリで技術負債を記録します：

| カテゴリ | TODO コメント | 対象 | Phase 9.93 での対処 |
|---------|--------------|------|-------------------|
| **コード分割** | `// TODO: Phase 9.93 - dynamic import 検討（バンドルサイズ最適化）` | Reports, ZoomScript, Templates, LeanCanvas タブ | `next/dynamic` による遅延ロード |
| **RSC/SSR化** | `// TODO: Phase 9.93+ - RSC化検討（サーバーサイドフェッチ移行）` | 集計系API呼び出し | Reports タブで RSC PoC 実施 |
| **CSS スコープ化** | `/* TODO: Phase 9.93 - Tailwind/CSS Modules 移行対象 */` | レガシーCSSブロック（globals.css） | CSS Modules への移行 |

#### Phase 9.92 での実装ルール

1. **TODO コメントの記載**
   - 上記3カテゴリに該当するコードには、**必ず TODO コメントを記載**
   - コメントには Phase 番号と対処内容を明記
   - コードレビュー時に TODO コメントの有無を確認

2. **技術負債インベントリの作成**
   - Phase 9.92 完了時に `docs/TECH-DEBT-INVENTORY.md` を作成
   - すべての TODO コメントを一覧化（ファイル名、行番号、優先度）
   - Phase 9.93 での解消進捗を追跡

3. **完了条件への組み込み**
   - Phase 9.92 の DOD に「技術負債ドキュメント作成」を含める
   - TODO コメント記載漏れがないことを確認
   - Phase 9.93 への引き継ぎ事項を明確化

#### Phase 9.93 での解消プロセス

**技術負債解消フレームワーク**（`docs/PHASE9.93-BUGFIX-RUNBOOK.md` セクション 2.5）:

1. **コード分割戦略の実装**（セクション 2.5.1）
   - **方針決定**: `next/dynamic` による遅延ロード vs route 分割
   - **実装対象**: Reports（高）、ZoomScript（高）、Templates（中）、LeanCanvas（中）
   - **完了条件**: 初期バンドルサイズ 30% 削減、Lighthouse Performance 80以上

2. **RSC/SSR 部分導入 PoC**（セクション 2.5.2）
   - **対象**: Reports タブ（集計データ取得）
   - **PoC ステップ**:
     1. 現状分析（API レスポンスサイズ、取得頻度）
     2. Server Action 移行（`lib/actions/reports.ts`）
     3. Server Component 化（`app/(app)/reports/page.tsx`）
     4. パフォーマンス比較（TTFB, LCP, バンドルサイズ）
     5. 結果ドキュメント化（`docs/RSC-POC-REPORT.md`）
   - **Phase 10 への展開**: PoC 結果に基づき、Reports → Dashboard → Clients の優先順位で適用

3. **CSS レイヤー出口戦略**（セクション 2.5.3）
   - **方針決定**: Tailwind CSS vs CSS Modules の二択
   - **推奨**: 短期的には CSS Modules、中長期的に Tailwind への移行
   - **移行ステップ**:
     1. 新規コンポーネントは CSS Modules で実装
     2. 既存コンポーネントを優先度順に移行（KPICards → ConversionFunnel → LeadKanban）
     3. globals.css の該当ブロックを削除
   - **完了条件**: globals.css のレガシーCSSブロック 50% 削減

#### 技術負債解消の進捗管理

**`docs/TECH-DEBT-INVENTORY.md` の構成**:

```markdown
## 1. コード分割対象（`next/dynamic` 検討）

| # | ファイル | 行番号 | 対象コンポーネント | 優先度 | Phase 9.93 対応状況 |
|---|---------|-------|-------------------|-------|-------------------|
| 1 | `app/(app)/reports/page.tsx` | XX | `ReportsPage` | 高 | [ ] 未対応 |

## 5. 解消進捗サマリー

| カテゴリ | 総数 | 解消済み | 解消率 | 目標（Phase 9.93 DOD） |
|---------|------|---------|-------|----------------------|
| コード分割 | 4 | 0 | 0% | 100% |
| RSC化 | 2 | 0 | 0% | PoC完了 |
| CSS移行 | X | 0 | 0% | 50%以上 |
| **合計** | XX | 0 | 0% | **50%以上** |
```

#### Phase 10 への引き継ぎ

Phase 9.93 完了時に、以下を Phase 10 へ引き継ぎます：

1. **RSC 展開計画**: PoC 結果に基づき、Reports → Dashboard → Clients の優先順位で適用
2. **CSS 移行の残作業**: globals.css 残り50%を段階的に移行
3. **TODO機能との統合**: Elastic Search 統合時に RSC を活用する余地を検討

#### AI開発者への指示

```
Phase 9.92 実装時:
- 重いタブ（Reports, ZoomScript, Templates, LeanCanvas）に `// TODO: Phase 9.93 - dynamic import 検討` を記載
- 集計系API呼び出しに `// TODO: Phase 9.93+ - RSC化検討` を記載
- レガシーCSSブロックに `/* TODO: Phase 9.93 - Tailwind/CSS Modules 移行対象 */` を記載
- Phase 9.92 完了時に `docs/TECH-DEBT-INVENTORY.md` を作成

Phase 9.93 実装時:
- `docs/TECH-DEBT-INVENTORY.md` を参照して技術負債を解消
- コード分割戦略（`next/dynamic` or route 分割）を決定・実装
- Reports タブで RSC PoC を実施、`docs/RSC-POC-REPORT.md` を作成
- CSS 移行方針（Tailwind or CSS Modules）を決定・実装
- 解消進捗を `docs/TECH-DEBT-INVENTORY.md` に記録
```

---

## 9. テストガイド

### 9.1 E2Eテスト実行ガイド

**テストフレームワーク:** Playwright 1.56 + TypeScript

#### テストスイート一覧

| スイート | ファイル | ステータス |
|----------|---------|-----------|
| 認証 | `tests/e2e/auth.spec.ts` | ✅ 実装済み（Google OAuth統合） |
| TODO | `tests/e2e/todo.spec.ts` | ✅ 実装済み（暗号化保存検証） |
| 見込み客 (Leads) | `tests/e2e/leads.spec.ts` | ✅ 実装済み（RBAC対応） |
| テンプレート | `tests/e2e/templates.spec.ts` | ✅ 実装済み |
| ワークスペース | `tests/e2e/workspace.spec.ts` | ✅ 実装済み（暗号化キー生成検証） |
| レポート | `tests/e2e/reports.spec.ts` | ✅ 実装済み（CSVダウンロード） |
| API Analyze | `tests/e2e/api-analyze.spec.ts` | ✅ 実装済み（認証・認可・バリデーション） |
| セキュリティ・RLS | `tests/e2e/security-rls.spec.ts` | ✅ 実装済み（Phase 9.7完了） |
| アーキテクチャ | `tests/e2e/architecture.spec.ts` | ✅ 実装済み（Phase 9.7完了） |
| Worker 統合 | `tests/e2e/worker-integration.spec.ts` | 🟡 一部スキップ（Phase 10 対応予定） |
| Phase 8-8 Suite | `tests/e2e/phase-8-8/*.spec.ts` | 🟡 一部スキップ（Phase 10 対応予定） |

#### 実行手順

**全テストをヘッドレス実行:**
```bash
npm test
```

**プロジェクト単位での実行:**
```bash
npx playwright test --project OWNER-chromium
npx playwright test tests/e2e/leads.spec.ts --project MEMBER-chromium
# 注: Phase 9.97 で EXEC → OWNER, MANAGER → ADMIN に変更
```

**ヘッドフル / UI モード:**
```bash
npx playwright test --headed
npx playwright test --ui
```

**レポート表示:**
```bash
npx playwright show-report
```

#### 前提条件

- Node.js 22.x 以上
- `npm install` 完了
- Playwright ブラウザのセットアップ: `npx playwright install --with-deps`
- **必須環境変数（`.env.local`）:**
  - `MASTER_ENCRYPTION_KEY` - AES-256-GCM 暗号化マスターキー
  - `JWT_SECRET` - Cookie署名用シークレット
  - `SUPABASE_URL` - Supabase プロジェクトURL
  - `SUPABASE_SERVICE_ROLE` - Supabase 管理操作用キー
  - `DATABASE_URL` - Transaction Pooler 接続（API routes用）
  - `DIRECT_DATABASE_URL` - Direct Connection（マイグレーション用）
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth認証
  - `OPENAI_API_KEY` - AI機能テスト用（Phase 9.8-B）
  - `AI_ENABLED=true` - AI機能有効化フラグ（Phase 9.8-B）

#### トラブルシューティング

| 症状 | 対処 |
|------|------|
| `EADDRINUSE 8888` | 既存の `python3 -m http.server 8888` を停止 (`pkill -f http.server`) |
| Google OAuth のモック失敗 | `.env` の `GOOGLE_CLIENT_*` 変数を再設定 |
| 暗号化テストの decrypt error | `MASTER_ENCRYPTION_KEY` が `.env` に設定されているか確認 |
| テストがローカルだけ失敗 | `npx playwright test --headed --debug` で再実行 |

---

### 9.2 手動テストチェックリスト

**Phase 9.8 完了時点で自動化が困難な機能について、手動テスト項目を実施**

#### ワークスペース暗号化・復号の完全性テスト

**手順:**
1. Workspace を作成し、Leads/Clients/Tasks を各10件追加
2. データを保存（暗号化）
3. ブラウザをリロード
4. データが正しく復号され、全項目が表示されることを確認

**検証項目:**
- [ ] Leads 10件すべて表示される
- [ ] Clients 10件すべて表示される
- [ ] Tasks 10件すべて表示される
- [ ] データ内容（名前、金額、日付等）が一致する
- [ ] 日本語・特殊文字が文字化けしていない

**合格基準:** すべての検証項目が ✅ であること

---

#### 暗号化データ破損時のエラーハンドリングテスト

**手順:**
1. Supabase ダッシュボードで workspaces テーブルを開く
2. 既存レコードの `workspace_data` カラムを直接編集し、破損データを挿入
3. ブラウザで該当ワークスペースにアクセス

**検証項目:**
- [ ] サーバーがクラッシュせず、エラーレスポンスを返す
- [ ] HTTP ステータスコード 422 (Unprocessable Entity) が返る
- [ ] エラーメッセージ `{ "error": "Failed to decrypt workspace data" }` が表示される
- [ ] UI に「データの復号に失敗しました」のようなメッセージが表示される

---

#### マルチワークスペース切替時の暗号化境界テスト

**手順:**
1. Workspace A を作成し、Lead "A-Lead-1" を追加
2. Workspace B を作成し、Lead "B-Lead-1" を追加
3. Workspace A に切り替え

**検証項目:**
- [ ] "A-Lead-1" が表示される
- [ ] "B-Lead-1" が表示されない

**Workspace B に切り替え:**
- [ ] "B-Lead-1" が表示される
- [ ] "A-Lead-1" が表示されない

---

#### 大容量データ（200KB近辺）の暗号化・復号パフォーマンステスト

**手順:**
1. Workspace を作成
2. Leads を 200件、Clients を 100件、Tasks を 300件追加（合計 ~180KB想定）
3. データを保存
4. ブラウザをリロード

**検証項目:**
- [ ] 保存時間: P95 < 450ms（Performance Specification準拠）
- [ ] 復号時間: P95 < 280ms（Performance Specification準拠）
- [ ] UI がフリーズしない
- [ ] ブラウザ DevTools の Network タブでタイムアウトが発生しない

**合格基準:** すべての検証項目が ✅ であること

**計測方法:**
- Chrome DevTools の Performance タブで計測
- 5回実行し、P95（95パーセンタイル）を算出

---

#### AI機能テスト（Phase 9.8-B完了）

**手順:**
1. Workspace を作成し、Leads/Clients データを追加（個人情報含む）
2. AI分析機能を使用（`/api/ai/chat` へリクエスト）

**検証項目:**
- [ ] AIContextLevel.MINIMAL では PII（メール・電話）が除外される
- [ ] AIContextLevel.STANDARD では個人名がマスキングされる（例: "山田太郎" → "山田**"）
- [ ] レート制限（5req/min）が正常に機能する（6回目のリクエストで 429 エラー）
- [ ] AI利用が `audit_logs` に記録される（action: 'ai_request'）
- [ ] `AI_ENABLED=false` の場合、AI機能が無効化される（403 エラー）

**合格基準:** すべての検証項目が ✅ であること

**実装状況:** ✅ Phase 9.8-B 完了（2025-01-24）

---

#### DB接続二重化テスト（Phase 9.8-A完了）

**手順:**
1. マイグレーションスクリプトを実行
   ```bash
   npx tsx scripts/run-migration.ts
   ```
2. API経由でデータを保存・取得
   ```bash
   curl -X POST http://localhost:3000/api/workspaces
   ```

**検証項目:**
- [ ] マイグレーションが Direct Connection（port 5432）経由で実行される
- [ ] API リクエストが Transaction Pooler（port 6543）経由で処理される
- [ ] マイグレーション実行時にユーザー名 `postgres` が使用される
- [ ] API実行時にユーザー名 `postgres.PROJECT_REF` が使用される
- [ ] 両方の接続が独立して正常に動作する

**合格基準:** すべての検証項目が ✅ であること

**実装状況:** ✅ Phase 9.8-A 部分完了（2025-01-24）

---

#### Phase 10 移行判定

**総合判定: ⚠️ 条件付き移行可能**

**GO条件を満たしている項目:**
- ✅ AI基盤完全実装（Phase 9.8-B: 100%）
- ✅ DB マイグレーション完了
- ✅ Type Check 完全Pass
- ✅ 既存テスト（認証、セキュリティ、RLS）正常動作

**Phase 10 並行実装が推奨される項目:**
- 🟡 楽観的ロックAPI実装（Phase 10-3）
- 🟡 Validator 実装（Phase 10-3）
- 🟡 Conflict UI 実装（Phase 10-4）
- 🟡 データ圧縮実装（Phase 10-4）
- 🟡 ガバナンスUI実装（Phase 10-5）

**推奨アプローチ:**
- Phase 10-0〜10-2: TODO基礎機能実装
- Phase 10-3: Phase 9.8-A 残タスク（楽観的ロック、Validator）
- Phase 10-4: Phase 9.8-A 残タスク（Conflict UI、Compression）
- Phase 10-5: Phase 9.8-C 残タスク（ガバナンスUI）
- Phase 10-6: TODO拡張機能 + 統合テスト

---

**Last Updated**: 2025-11-24
**Version**: 4.0（DOCS統廃合版 - guides/DEVELOPMENT.md統合版）
