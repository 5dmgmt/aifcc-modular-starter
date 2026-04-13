# Phase 14.6: AI導入準備ランブック

## 概要

AI機能の本格導入前に完了させておくべき全作業を網羅した実装ガイドです。
技術的負債の解消、データ基盤の整備、セキュリティ強化、テスト拡充を行います。

**Phase**: 14.6
**対象バージョン**: v2.8.4
**最終更新**: 2025-12-02
**ステータス**: ✅ 完了

---

## 目次

1. [Phase 14.6 の位置づけ](#1-phase-146-の位置づけ)
2. [サブフェーズ一覧](#2-サブフェーズ一覧)
3. [Phase 14.6-A: 監査ログ・ガバナンス完成](#phase-146-a-監査ログガバナンス完成)
4. [Phase 14.6-B: データ整備・正規化](#phase-146-b-データ整備正規化)
5. [Phase 14.6-C: AIコンテキスト基盤強化](#phase-146-c-aiコンテキスト基盤強化)
6. [Phase 14.6-D: テンプレート・変数システム](#phase-146-d-テンプレート変数システム)
7. [Phase 14.6-E: 営業プロセス可視化](#phase-146-e-営業プロセス可視化)
8. [Phase 14.6-F: テスト・品質強化](#phase-146-f-テスト品質強化)
9. [Phase 14.6-G: ドキュメント・法務整備](#phase-146-g-ドキュメント法務整備)
10. [実装スケジュール](#10-実装スケジュール)
11. [品質ゲート](#11-品質ゲート)
12. [ロールバック手順](#12-ロールバック手順)

---

## 1. Phase 14.6 の位置づけ

### 1.1 背景

Phase 14.5（パフォーマンス最適化）完了後、AI機能の本格導入（Phase 15）の前に
以下の課題を解決する必要がある：

| カテゴリ | 課題 | AI導入との関連 |
|---------|------|----------------|
| 監査ログ | AI使用記録が未実装（TODOコメント状態） | 必須 |
| データ整備 | タグ・ステータスが未標準化 | 必須 |
| コンテキスト | ビジネスサマリー自動生成なし | 必須 |
| テンプレート | 変数プレースホルダー未定義 | 推奨 |
| テスト | 68件のスキップテスト | 推奨 |
| ドキュメント | AI利用規約・ガイド未整備 | 必須 |

### 1.2 Phase 14.6 の目標

**「AIが最大限に活躍できる基盤を整える」**

- AIが参照するデータの品質を担保
- AIの使用状況を完全に追跡可能に
- ユーザーがAIを安心して使える法的・UX的基盤を構築
- 品質テストを充実させ、回帰リスクを最小化

---

## 2. サブフェーズ一覧

| サブフェーズ | 内容 | 優先度 | 推定工数 | 依存関係 |
|-------------|------|--------|----------|----------|
| **14.6-A** | 監査ログ・ガバナンス完成 | 🔴 必須 | 小 | なし |
| **14.6-B** | データ整備・正規化 | 🔴 必須 | 中 | なし |
| **14.6-C** | AIコンテキスト基盤強化 | 🔴 必須 | 中 | 14.6-B |
| **14.6-D** | テンプレート・変数システム | 🟡 推奨 | 中 | 14.6-B |
| **14.6-E** | 営業プロセス可視化 | 🟡 推奨 | 中 | 14.6-B |
| **14.6-F** | テスト・品質強化 | 🟡 推奨 | 大 | なし |
| **14.6-G** | ドキュメント・法務整備 | 🔴 必須 | 中 | なし |

---

## Phase 14.6-A: 監査ログ・ガバナンス完成

### A.1 目的

- AI使用履歴の完全な追跡
- コスト管理・使用量把握
- 監査対応・コンプライアンス

### A.2 現状の問題

```typescript
// app/api/ai/chat/route.ts:98
// TODO: 実際の audit_logs テーブルへの挿入

// app/api/ai/chat/route.ts:225
// TODO: 認証実装後、実際のユーザーIDを取得
```

### A.3 ワークストリーム WS-AUDIT

```
WS-AUDIT-1: AI監査ログ実装
            app/api/ai/chat/route.ts
            - audit_logs テーブルへの挿入実装
            - ユーザーID取得（セッションから）
            - トークン数・コスト推定の記録

WS-AUDIT-2: pg_cron ジョブ設定
            Supabase Dashboard で手動設定
            - archive-audit-logs: 毎日 AM3:00 JST
            - purge-archived-logs: 毎月1日 AM4:00 JST

WS-AUDIT-3: AI使用量ダッシュボード
            app/_components/admin/AIUsagePanel.tsx
            - ユーザー別使用量表示
            - 日次/週次/月次集計
            - コスト推定表示
            - クォータ警告

WS-AUDIT-4: AI使用量API
            app/api/ai/usage/route.ts
            - GET: 使用量統計取得
            - ユーザー別・期間別集計
```

### A.4 実装詳細

#### Step 1: audit_logs への AI 使用記録

```typescript
// app/api/ai/chat/route.ts に追加
import { createAuditLog } from '@/lib/server/audit';

// リクエスト処理後
await createAuditLog({
  user_id: session.userId,
  workspace_id: workspaceId,
  action: 'ai_chat',
  entity_type: 'ai_conversation',
  entity_id: conversationId,
  details: {
    model: 'gpt-4o-mini',
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    total_tokens: usage.total_tokens,
    estimated_cost_usd: calculateCost(usage),
    context_level: contextLevel,
  },
});
```

#### Step 2: pg_cron 設定（Supabase Dashboard）

```sql
-- 毎日 AM3:00 JST にアーカイブ実行（UTC 18:00）
SELECT cron.schedule(
  'archive-audit-logs',
  '0 18 * * *',
  'SELECT archive_old_audit_logs()'
);

-- 毎月1日 AM4:00 JST に5年超のアーカイブを削除（UTC 19:00）
SELECT cron.schedule(
  'purge-archived-logs',
  '0 19 1 * *',
  'SELECT purge_archived_audit_logs(5)'
);
```

### A.5 成果物

- `app/api/ai/chat/route.ts`（修正）
- `app/api/ai/usage/route.ts`（新規）
- `app/_components/admin/AIUsagePanel.tsx`（新規）
- `lib/server/ai-cost.ts`（新規: コスト計算）
- pg_cron ジョブ設定（Supabase Dashboard）

### A.6 チェックリスト

- [x] audit_logs への AI 使用記録実装
- [x] ユーザーID取得をセッションから実装
- [x] pg_cron ジョブ設定完了（2025-12-05 CLI設定済み）
- [x] AI使用量ダッシュボード実装（AIUsagePanel.tsx）
- [x] コスト推定ロジック実装（ai-cost.ts）

---

## Phase 14.6-B: データ整備・正規化

### B.1 目的

- AIが参照するデータの品質向上
- タグ・ステータスの標準化
- 必須フィールドの明確化

### B.2 現状の問題

| 項目 | 現状 | 問題 |
|------|------|------|
| タグ | 自由入力 | 表記揺れ、重複 |
| ステータス | エンティティごとに異なる | 統一性なし |
| 必須フィールド | 定義あいまい | AI参照時に欠損データ |

### B.3 ワークストリーム WS-DATA

```
WS-DATA-1: タグマスタ定義
           lib/types/tag-master.ts
           - 見込み客タグカテゴリ（業種、規模、ソース等）
           - 既存客タグカテゴリ（契約種別、利用状況等）
           - タスクタグカテゴリ（プロジェクト、担当等）

WS-DATA-2: タグ正規化マイグレーション
           supabase/migrations/023_normalize_tags.sql
           - 既存タグの分析・集計
           - 類似タグの統合ルール
           - マスタテーブル作成（オプション）

WS-DATA-3: ステータス統一定義
           lib/types/status-master.ts
           - 共通ステータス定義
           - エンティティ別マッピング
           - カスタマージャーニーとの紐付け

WS-DATA-4: 必須フィールド定義
           lib/types/required-fields.ts
           - AI参照時の必須フィールド定義
           - フィールド欠損時のフォールバック

WS-DATA-5: データ品質チェッカー
           lib/core/data-quality.ts
           - 欠損フィールドチェック
           - タグ正規化サジェスト
           - 品質スコア算出

WS-DATA-6: データ品質ダッシュボード
           app/_components/admin/DataQualityPanel.tsx
           - 品質スコア表示
           - 改善提案リスト
           - 一括修正機能
```

### B.4 タグマスタ定義案

```typescript
// lib/types/tag-master.ts

export const TAG_CATEGORIES = {
  // 見込み客用タグ
  lead: {
    industry: ['IT', 'SaaS', '製造業', '金融', '不動産', '小売', 'その他'],
    company_size: ['1-10名', '11-50名', '51-200名', '201-1000名', '1001名以上'],
    source: ['Web問合せ', '紹介', '展示会', 'セミナー', '広告', 'SNS', 'その他'],
    urgency: ['即時', '3ヶ月以内', '半年以内', '1年以内', '情報収集'],
  },

  // 既存客用タグ
  client: {
    contract_type: ['月額', '年額', 'スポット', 'エンタープライズ'],
    usage_status: ['アクティブ', '休眠', '解約予定', '拡大見込'],
    satisfaction: ['高', '中', '低', '要フォロー'],
  },

  // タスク用タグ
  task: {
    project: [], // ワークスペース単位で定義
    priority_label: ['緊急', '重要', '通常', '低'],
  },
} as const;

export type TagCategory = keyof typeof TAG_CATEGORIES;
```

### B.5 ステータス統一定義案

```typescript
// lib/types/status-master.ts

// カスタマージャーニー基準のステータス
export const CUSTOMER_JOURNEY_STAGES = [
  'awareness',      // 認知
  'interest',       // 興味
  'consideration',  // 検討
  'intent',         // 意向
  'evaluation',     // 評価
  'purchase',       // 購入
  'retention',      // 継続
  'advocacy',       // 推奨
] as const;

// 見込み客ステータス → ジャーニーマッピング
export const LEAD_STATUS_JOURNEY_MAP = {
  new: 'awareness',
  contacted: 'interest',
  qualified: 'consideration',
  proposal: 'intent',
  negotiation: 'evaluation',
  won: 'purchase',
  lost: null, // ジャーニー離脱
} as const;

// 次アクション推奨マスタ
export const RECOMMENDED_ACTIONS = {
  new: ['初回コンタクト', 'ニーズヒアリング'],
  contacted: ['課題の深掘り', '事例紹介'],
  qualified: ['提案書作成', 'デモ実施'],
  proposal: ['価格交渉', '導入スケジュール調整'],
  negotiation: ['最終条件提示', '決裁者アプローチ'],
} as const;
```

### B.6 成果物

- `lib/types/tag-master.ts`
- `lib/types/status-master.ts`
- `lib/types/required-fields.ts`
- `lib/core/data-quality.ts`
- `app/_components/admin/DataQualityPanel.tsx`
- `supabase/migrations/023_normalize_tags.sql`（オプション）

### B.7 チェックリスト

- [x] タグマスタ定義完了（tag-master.ts）
- [x] ステータス統一定義完了（status-master.ts）
- [x] 必須フィールド定義完了（required-fields.ts）
- [x] データ品質チェッカー実装（data-quality.ts）
- [ ] データ品質ダッシュボード実装（DataQualityPanel.tsx）

---

## Phase 14.6-C: AIコンテキスト基盤強化

### C.1 目的

- AIが参照するコンテキストの品質向上
- ビジネス情報の自動要約
- ペルソナ・ターゲット情報の構造化

### C.2 ワークストリーム WS-CONTEXT

```
WS-CONTEXT-1: ビジネスサマリー自動生成
              lib/core/business-summary.ts
              - MVV（Mission/Vision/Values）からの抽出
              - LeanCanvasからの抽出
              - OKRからの抽出
              - 統合サマリー生成

WS-CONTEXT-2: ペルソナ構造化
              lib/core/persona-extractor.ts
              - LeanCanvas.customer_segment からの抽出
              - 見込み客データからのパターン分析
              - ペルソナ定義の構造化

WS-CONTEXT-3: AIプロンプトテンプレート
              lib/core/ai-prompt-templates.ts
              - システムプロンプトテンプレート
              - コンテキスト注入ヘルパー
              - プロンプトバージョン管理

WS-CONTEXT-4: コンテキストプレビュー
              app/_components/ai/ContextPreview.tsx
              - 現在のコンテキスト表示
              - トークン数表示
              - レベル別プレビュー

WS-CONTEXT-5: AIコンテキスト設定UI
              app/_components/settings/AIContextSettings.tsx
              - コンテキストレベル選択
              - 含めるデータの選択
              - カスタムコンテキスト追加
```

### C.3 ビジネスサマリー生成ロジック

```typescript
// lib/core/business-summary.ts

export interface BusinessSummary {
  // 基本情報
  companyOverview: string;
  targetCustomer: string;
  valueProposition: string;

  // 戦略情報
  currentObjectives: string[];
  keyMetrics: string[];

  // 営業情報
  salesStages: string[];
  commonObjections: string[];
  successCases: string[];
}

export function generateBusinessSummary(
  workspaceData: WorkspaceData
): BusinessSummary {
  const { mvv, leanCanvas, okr, clients, leads } = workspaceData;

  return {
    companyOverview: extractCompanyOverview(mvv),
    targetCustomer: extractTargetCustomer(leanCanvas),
    valueProposition: extractValueProposition(leanCanvas),
    currentObjectives: extractCurrentObjectives(okr),
    keyMetrics: extractKeyMetrics(okr),
    salesStages: extractSalesStages(leads),
    commonObjections: extractCommonObjections(leads),
    successCases: extractSuccessCases(clients),
  };
}

// AIプロンプト用のテキスト変換
export function summaryToPromptText(summary: BusinessSummary): string {
  return `
## このビジネスについて

**会社概要**: ${summary.companyOverview}

**ターゲット顧客**: ${summary.targetCustomer}

**提供価値**: ${summary.valueProposition}

**現在の目標**:
${summary.currentObjectives.map(o => `- ${o}`).join('\n')}

**主要指標**:
${summary.keyMetrics.map(m => `- ${m}`).join('\n')}
`.trim();
}
```

### C.4 成果物

- `lib/core/business-summary.ts`
- `lib/core/persona-extractor.ts`
- `lib/core/ai-prompt-templates.ts`
- `app/_components/ai/ContextPreview.tsx`
- `app/_components/settings/AIContextSettings.tsx`

### C.5 チェックリスト

- [x] ビジネスサマリー自動生成実装（business-summary.ts）
- [x] ペルソナ抽出ロジック実装（business-summary.ts に統合）
- [x] AIプロンプトテンプレート整備（ai-prompt-templates.ts）
- [ ] コンテキストプレビュー実装（ContextPreview.tsx）→ **Phase 14.7（AI関連）に移行**
- [ ] AIコンテキスト設定UI実装（AIContextSettings.tsx）→ **Phase 14.7（AI関連）に移行**

---

## Phase 14.6-D: テンプレート・変数システム

### D.1 目的

- AI生成テキストのカスタマイズ性向上
- 変数プレースホルダーによる自動置換
- 営業フェーズ別テンプレート管理

### D.2 ワークストリーム WS-TEMPLATE

```
WS-TEMPLATE-1: 変数プレースホルダー定義
              lib/types/template-variables.ts
              - 顧客情報変数（{{顧客名}}, {{会社名}}等）
              - 商談情報変数（{{課題}}, {{提案内容}}等）
              - 日付・期限変数
              - カスタム変数

WS-TEMPLATE-2: テンプレートエンジン
              lib/core/template-engine.ts
              - 変数置換処理
              - 条件分岐（{{#if}}）
              - ループ（{{#each}}）
              - フォールバック値

WS-TEMPLATE-3: テンプレートカテゴリ定義
              lib/types/template-categories.ts
              - messenger: メッセージテンプレート
              - email: メールテンプレート
              - proposal: 提案書テンプレート
              - closing: クロージングテンプレート
              - follow_up: フォローアップテンプレート

WS-TEMPLATE-4: テンプレート管理UI
              app/_components/settings/TemplateManager.tsx
              - テンプレート一覧
              - 新規作成・編集
              - カテゴリ別フィルタ
              - 変数挿入ヘルパー

WS-TEMPLATE-5: テンプレート適用UI
              app/_components/ai/TemplateApplicator.tsx
              - テンプレート選択
              - 変数プレビュー
              - AI補完との連携
```

### D.3 変数プレースホルダー定義案

```typescript
// lib/types/template-variables.ts

export const TEMPLATE_VARIABLES = {
  // 顧客情報
  customer: {
    '{{顧客名}}': { path: 'lead.name', fallback: 'お客様' },
    '{{会社名}}': { path: 'lead.company', fallback: '御社' },
    '{{役職}}': { path: 'lead.position', fallback: '' },
    '{{業種}}': { path: 'lead.industry', fallback: '' },
  },

  // 商談情報
  deal: {
    '{{課題}}': { path: 'lead.notes.challenge', fallback: '課題' },
    '{{提案内容}}': { path: 'proposal.summary', fallback: '' },
    '{{見積金額}}': { path: 'proposal.amount', format: 'currency' },
    '{{導入予定日}}': { path: 'proposal.startDate', format: 'date' },
  },

  // 自社情報
  company: {
    '{{自社名}}': { path: 'workspace.company_name', fallback: '' },
    '{{担当者名}}': { path: 'user.name', fallback: '' },
    '{{担当者メール}}': { path: 'user.email', fallback: '' },
  },

  // 日付
  date: {
    '{{今日}}': { type: 'dynamic', value: () => formatDate(new Date()) },
    '{{明日}}': { type: 'dynamic', value: () => formatDate(addDays(new Date(), 1)) },
    '{{来週}}': { type: 'dynamic', value: () => formatDate(addWeeks(new Date(), 1)) },
  },
} as const;
```

### D.4 テンプレート例

```typescript
// メッセージテンプレート例
const MESSAGE_TEMPLATES = {
  initial_contact: {
    name: '初回コンタクト',
    category: 'messenger',
    content: `
{{会社名}} {{顧客名}}様

お世話になっております。
{{自社名}}の{{担当者名}}です。

先日は{{ソース}}にてお問い合わせいただき、
誠にありがとうございます。

{{課題}}について、ぜひお話をお聞かせください。
{{来週}}あたりで30分ほどお時間いただけますでしょうか？

ご都合の良い日時をお知らせいただけますと幸いです。
    `.trim(),
  },

  follow_up: {
    name: 'フォローアップ',
    category: 'follow_up',
    content: `
{{顧客名}}様

先日はお時間いただきありがとうございました。

{{提案内容}}について、ご検討状況はいかがでしょうか？
ご不明点やご質問がございましたら、お気軽にお申し付けください。

{{#if 導入予定日}}
{{導入予定日}}のお打ち合わせに向けて、準備を進めております。
{{/if}}
    `.trim(),
  },
};
```

### D.5 成果物

- `lib/types/template-variables.ts`
- `lib/types/template-categories.ts`
- `lib/core/template-engine.ts`
- `app/_components/settings/TemplateManager.tsx`
- `app/_components/ai/TemplateApplicator.tsx`

### D.6 チェックリスト

- [x] 変数プレースホルダー定義完了（template-variables.ts）
- [x] テンプレートエンジン実装（template-engine.ts）
- [x] テンプレートカテゴリ定義（template-categories.ts）
- [ ] テンプレート管理UI実装（TemplateManager.tsx）
- [ ] テンプレート適用UI実装（TemplateApplicator.tsx）→ **Phase 14.7（AI関連）に移行**

---

## Phase 14.6-E: 営業プロセス可視化

### E.1 目的

- カスタマージャーニーの明確化
- ステータスとフェーズの紐付け
- 次アクション提案の基盤構築

### E.2 ワークストリーム WS-PROCESS

```
WS-PROCESS-1: カスタマージャーニー定義
              lib/types/customer-journey.ts
              - ジャーニーステージ定義
              - ステージ別KPI
              - 遷移条件

WS-PROCESS-2: ステータス-ジャーニーマッピング
              lib/core/journey-mapping.ts
              - 見込み客ステータス → ジャーニー
              - 既存客ステータス → ジャーニー
              - マッピング更新ロジック

WS-PROCESS-3: 次アクション推奨エンジン
              lib/core/action-recommender.ts
              - ステータス別推奨アクション
              - 滞留日数考慮
              - AI提案連携

WS-PROCESS-4: ジャーニーファネル可視化
              app/_components/reports/JourneyFunnel.tsx
              - ステージ別件数表示
              - コンバージョン率
              - ボトルネック特定

WS-PROCESS-5: 次アクション提案UI
              app/_components/leads/NextActionSuggestion.tsx
              - 推奨アクション表示
              - ワンクリック実行
              - AI生成オプション
```

### E.3 カスタマージャーニー可視化イメージ

```
┌─────────────────────────────────────────────────────────────┐
│                    カスタマージャーニー                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  認知      興味      検討      意向      評価      購入       │
│  ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐          │
│  │150│ → │ 80│ → │ 45│ → │ 25│ → │ 15│ → │ 10│          │
│  └───┘   └───┘   └───┘   └───┘   └───┘   └───┘          │
│         53%      56%      56%      60%      67%           │
│                                                             │
│  ボトルネック: 認知→興味 (47%離脱)                            │
│  推奨改善: 初回コンタクトの質向上                              │
└─────────────────────────────────────────────────────────────┘
```

### E.4 成果物

- `lib/types/customer-journey.ts`
- `lib/core/journey-mapping.ts`
- `lib/core/action-recommender.ts`
- `app/_components/reports/JourneyFunnel.tsx`
- `app/_components/leads/NextActionSuggestion.tsx`

### E.5 チェックリスト

- [x] カスタマージャーニー定義完了（customer-journey.ts）
- [x] ステータス-ジャーニーマッピング実装（customer-journey.ts 内）
- [x] 次アクション推奨エンジン実装（action-recommender.ts）
- [ ] ジャーニーファネル可視化実装（JourneyFunnel.tsx）
- [ ] 次アクション提案UI実装（NextActionSuggestion.tsx）

---

## Phase 14.6-F: テスト・品質強化

### F.1 目的

- スキップテストの実装
- AI関連E2Eテストの追加
- テストカバレッジの向上

### F.2 現状のスキップテスト（68件）

| ファイル | スキップ数 | 内容 |
|----------|-----------|------|
| `tests/unit/phase10/streak-calculator.test.ts` | 6 | ストリーク計算 |
| `tests/unit/phase11/progress-calculator.test.ts` | 5 | 進捗計算 |
| `tests/unit/phase12/kr-calculator.test.ts` | 7 | KR計算 |
| その他 | 50+ | 各種ユニットテスト |

### F.3 ワークストリーム WS-TEST

```
WS-TEST-1: Phase 10 スキップテスト実装
           tests/unit/phase10/
           - streak-calculator.test.ts の実装
           - habit-tracker.test.ts の実装

WS-TEST-2: Phase 11 スキップテスト実装
           tests/unit/phase11/
           - progress-calculator.test.ts の実装
           - action-item.test.ts の実装

WS-TEST-3: Phase 12 スキップテスト実装
           tests/unit/phase12/
           - kr-calculator.test.ts の実装
           - objective-progress.test.ts の実装

WS-TEST-4: AI関連E2Eテスト追加
           tests/e2e/ai-features.spec.ts
           - AIチャット機能テスト
           - AI無効時の動作テスト
           - レート制限テスト
           - コンテキストレベルテスト

WS-TEST-5: データ品質テスト
           tests/unit/data-quality/
           - タグ正規化テスト
           - ステータスマッピングテスト
           - 必須フィールドテスト

WS-TEST-6: テンプレートエンジンテスト
           tests/unit/template-engine/
           - 変数置換テスト
           - 条件分岐テスト
           - エッジケーステスト
```

### F.4 AI関連E2Eテスト例

```typescript
// tests/e2e/ai-features.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AI機能', () => {
  test('AI有効時にチャットが使用できる', async ({ page }) => {
    // AIチャットパネルを開く
    await page.click('[data-testid="ai-chat-button"]');

    // メッセージを送信
    await page.fill('[data-testid="ai-chat-input"]', 'こんにちは');
    await page.click('[data-testid="ai-chat-send"]');

    // レスポンスを待つ
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({
      timeout: 10000,
    });
  });

  test('AI無効時に適切なメッセージが表示される', async ({ page }) => {
    // AI無効設定
    await page.goto('/settings');
    await page.click('[data-testid="ai-toggle"]');

    // チャットパネルを開く
    await page.click('[data-testid="ai-chat-button"]');

    // 無効メッセージを確認
    await expect(page.locator('text=AI機能はオフです')).toBeVisible();
  });

  test('レート制限が機能する', async ({ page }) => {
    // 6回連続でリクエスト（制限は5回/分）
    for (let i = 0; i < 6; i++) {
      await page.fill('[data-testid="ai-chat-input"]', `テスト${i}`);
      await page.click('[data-testid="ai-chat-send"]');
    }

    // レート制限メッセージを確認
    await expect(page.locator('text=リクエスト制限')).toBeVisible();
  });
});
```

### F.5 成果物

- `tests/unit/phase10/*.test.ts`（修正）
- `tests/unit/phase11/*.test.ts`（修正）
- `tests/unit/phase12/*.test.ts`（修正）
- `tests/e2e/ai-features.spec.ts`（新規）
- `tests/unit/data-quality/*.test.ts`（新規）
- `tests/unit/template-engine/*.test.ts`（新規）

### F.6 チェックリスト

- [x] Phase 10 スキップテスト実装（6件）→ 全て解除・パス
- [x] Phase 11 スキップテスト実装（7件）→ 全て解除・パス
- [x] Phase 12 スキップテスト実装（9件）→ 全て解除・パス
- [ ] AI関連E2Eテスト追加 → Phase 14.7（AI本格導入）に移行
- [x] データ品質テスト追加（19件パス: tests/unit/phase14.6/data-quality.test.ts）
- [x] テンプレートエンジンテスト追加（18件パス: tests/unit/phase14.6/template-engine.test.ts）
- [x] Unitテスト全パス確認（129件パス、スキップ0件）

**E2Eテスト skip 状況（バックログ）:**
- 107件のE2E skipテストはPhase 15以降で段階的に解消予定
- 致命的な技術負債はゼロ、Phase 14.7 進行可能

---

## Phase 14.6-G: ドキュメント・法務整備

### G.1 目的

- AI利用規約の明確化
- ユーザー向けガイドの作成
- プライバシーポリシーの更新

### G.2 ワークストリーム WS-DOC

```
WS-DOC-1: AI利用規約
          docs/legal/AI-TERMS.md
          - AI機能の範囲
          - データの取り扱い
          - 免責事項
          - 禁止事項

WS-DOC-2: AI機能ユーザーガイド
          docs/guides/AI-USER-GUIDE.md
          - AI機能の使い方
          - コンテキストレベルの説明
          - ベストプラクティス
          - トラブルシューティング

WS-DOC-3: プライバシーポリシー更新
          app/(marketing)/privacy/page.tsx
          - AI機能に関する追記
          - データ処理の明確化
          - オプトアウト方法

WS-DOC-4: LPへのAI機能説明追加
          app/(marketing)/LandingPage.tsx
          - AI機能の紹介セクション
          - 利用例
          - セキュリティ説明

WS-DOC-5: FAQ更新
          app/(marketing)/sections/FAQSection.tsx
          - AI関連FAQ追加
          - データセキュリティFAQ
          - 料金・制限FAQ
```

### G.3 AI利用規約（草案）

```markdown
# AI機能利用規約

## 1. AI機能の範囲

AIFCCのAI機能は以下のサービスを提供します：
- 営業戦略に関するアドバイス
- タスク優先順位の提案
- テキスト生成・編集支援
- データ分析・要約

## 2. データの取り扱い

- AIへの入力データはOpenAI APIに送信されます
- 個人情報（メール、電話番号、氏名）は自動的にマスクされます
- AIとの会話履歴はワークスペースデータとして保存されます
- コンテキストレベルにより送信データ量を調整できます

## 3. 免責事項

- AI生成コンテンツは参考情報であり、最終判断はユーザーが行ってください
- AIの回答の正確性、完全性は保証されません
- AIの回答に基づく行動による損害について、当社は責任を負いません

## 4. 禁止事項

- 違法行為を目的としたAI利用
- 第三者の権利を侵害するコンテンツの生成
- AI機能の逆アセンブル・リバースエンジニアリング
```

### G.4 成果物

- `docs/legal/AI-TERMS.md`（新規）
- `docs/guides/AI-USER-GUIDE.md`（新規）
- `app/(marketing)/privacy/page.tsx`（修正）
- `app/(marketing)/LandingPage.tsx`（修正）
- `app/(marketing)/sections/FAQSection.tsx`（修正）

### G.5 チェックリスト

- [x] AI利用規約作成（docs/規約/AI利用規約.md）
- [ ] AI機能ユーザーガイド作成（docs/guides/AI-USER-GUIDE.md）
- [x] プライバシーポリシー更新（既存で対応済み）
- [x] LP AI機能説明追加（LandingPage.tsx にリンク追加）
- [x] AI利用規約ページ作成（app/ai-terms/page.tsx）
- [ ] FAQ更新（オプション - 必要に応じて）

---

## 10. 実装スケジュール

### 10.1 推奨実装順序

```
Week 1: Phase 14.6-A（監査ログ）+ 14.6-G（ドキュメント）
        - 最優先の監査ログ実装
        - 法務・ドキュメント並行作業

Week 2: Phase 14.6-B（データ整備）
        - タグマスタ定義
        - ステータス統一
        - データ品質チェッカー

Week 3: Phase 14.6-C（AIコンテキスト）+ 14.6-E（営業プロセス）
        - ビジネスサマリー生成
        - カスタマージャーニー
        - 次アクション推奨

Week 4: Phase 14.6-D（テンプレート）
        - 変数システム
        - テンプレートエンジン
        - 管理UI

Week 5: Phase 14.6-F（テスト）
        - スキップテスト実装
        - AI関連E2Eテスト
        - 総合テスト

Week 6: 統合テスト・バグ修正・リリース準備
```

### 10.2 依存関係図

```
14.6-A (監査ログ) ────────────────────────────────────────┐
                                                          │
14.6-B (データ整備) ──┬── 14.6-C (AIコンテキスト) ───────┤
                      │                                   │
                      ├── 14.6-D (テンプレート) ──────────┤
                      │                                   │
                      └── 14.6-E (営業プロセス) ──────────┤
                                                          │
14.6-F (テスト) ──────────────────────────────────────────┤
                                                          │
14.6-G (ドキュメント) ────────────────────────────────────┤
                                                          ▼
                                                   Phase 14.6 完了
                                                          │
                                                          ▼
                                                   Phase 15 (AI本格導入)
```

---

## 11. 品質ゲート

### 11.1 Phase 14.6 完了条件

| カテゴリ | 条件 | 検証方法 |
|---------|------|----------|
| **監査ログ** | | |
| AI使用記録 | 全AIリクエストが記録される | audit_logs確認 |
| pg_cronジョブ | アーカイブ・削除が動作 | Supabase logs確認 |
| 使用量ダッシュボード | 正常表示 | E2Eテスト |
| **データ整備** | | |
| タグマスタ | 定義完了、UIで選択可能 | 手動テスト |
| ステータス統一 | マッピング完了 | ユニットテスト |
| データ品質 | スコア表示、改善提案表示 | E2Eテスト |
| **AIコンテキスト** | | |
| ビジネスサマリー | 自動生成される | ユニットテスト |
| コンテキストプレビュー | 正常表示 | E2Eテスト |
| **テンプレート** | | |
| 変数置換 | 正常動作 | ユニットテスト |
| テンプレート管理UI | CRUD動作 | E2Eテスト |
| **営業プロセス** | | |
| ジャーニーファネル | 正常表示 | E2Eテスト |
| 次アクション提案 | 正常表示 | E2Eテスト |
| **テスト** | | |
| スキップテスト | 0件 | `npm run test:unit` |
| AI E2Eテスト | 全パス | `npm run test:e2e` |
| **ドキュメント** | | |
| AI利用規約 | 作成完了、リンク設置 | 手動確認 |
| ユーザーガイド | 作成完了 | 手動確認 |
| プライバシーポリシー | 更新完了 | 手動確認 |

### 11.2 セキュリティチェックリスト

- [ ] AI使用ログに個人情報が含まれていない
- [ ] コンテキストのPIIマスキングが動作
- [ ] レート制限が全AIエンドポイントに適用
- [ ] APIキー暗号化が正常動作
- [ ] AI無効時のグレースフルデグレード

### 11.3 パフォーマンス基準

| 指標 | 目標 |
|------|------|
| ビジネスサマリー生成 | < 500ms |
| テンプレート変数置換 | < 100ms |
| データ品質スコア算出 | < 1s |
| ジャーニーファネル表示 | < 2s |

---

## 12. ロールバック手順

### 12.1 各サブフェーズのロールバック

#### Phase 14.6-A（監査ログ）

```bash
# 変更をリバート
git checkout HEAD~1 -- app/api/ai/chat/route.ts
git checkout HEAD~1 -- app/api/ai/usage/

# pg_cronジョブを削除
SELECT cron.unschedule('archive-audit-logs');
SELECT cron.unschedule('purge-archived-logs');
```

#### Phase 14.6-B（データ整備）

```bash
# 型定義をリバート
git checkout HEAD~1 -- lib/types/tag-master.ts
git checkout HEAD~1 -- lib/types/status-master.ts

# マイグレーションをロールバック（必要な場合）
# ※データ正規化は破壊的変更のため慎重に
```

#### Phase 14.6-C〜G

```bash
# 該当ファイルをリバート
git checkout HEAD~1 -- lib/core/business-summary.ts
git checkout HEAD~1 -- lib/core/template-engine.ts
# ...
```

### 12.2 完全ロールバック

```bash
# Phase 14.6 開始前のコミットに戻す
git log --oneline  # Phase 14.6 開始前のコミットを確認
git revert --no-commit <phase-14.6-commits>
git commit -m "Revert Phase 14.6"
```

---

## 参考資料

- `docs/runbooks/PHASE14-AI-RUNBOOK.md` - AI機能詳細設計
- `docs/runbooks/PHASE14.5-PERFORMANCE-RUNBOOK.md` - 前Phase
- `docs/guides/SECURITY.md` - セキュリティガイド
- `lib/core/ai-context.ts` - 既存AIコンテキスト基盤

---

---

## 13. Phase 14.6 残タスク一覧

### コアロジック ✅ 完了

| ファイル | 内容 | ステータス |
|----------|------|-----------|
| `lib/server/ai-cost.ts` | コスト計算 | ✅ |
| `lib/server/audit.ts` | 監査ログ | ✅ |
| `lib/types/tag-master.ts` | タグマスタ | ✅ |
| `lib/types/status-master.ts` | ステータス統一 | ✅ |
| `lib/types/required-fields.ts` | 必須フィールド | ✅ |
| `lib/core/data-quality.ts` | データ品質チェッカー | ✅ |
| `lib/core/business-summary.ts` | ビジネスサマリー | ✅ |
| `lib/core/ai-prompt-templates.ts` | AIプロンプトテンプレート | ✅ |
| `lib/types/template-variables.ts` | 変数プレースホルダー | ✅ |
| `lib/types/template-categories.ts` | テンプレートカテゴリ | ✅ |
| `lib/core/template-engine.ts` | テンプレートエンジン | ✅ |
| `lib/types/customer-journey.ts` | カスタマージャーニー | ✅ |
| `lib/core/action-recommender.ts` | 次アクション推奨 | ✅ |

### UIコンポーネント ✅ 完了

| ファイル | 用途 | ステータス |
|----------|------|-----------|
| `app/_components/admin/DataQualityPanel.tsx` | データ品質ダッシュボード | ✅ 実装済み（222行） |
| `app/_components/settings/TemplateManager.tsx` | テンプレート管理 | ✅ 実装済み（560行） |
| `app/_components/reports/JourneyFunnel.tsx` | ジャーニーファネル可視化 | ✅ 実装済み（405行） |
| `app/_components/prospects/NextActionSuggestion.tsx` | 次アクション提案 | ✅ 実装済み（373行） |

### Phase 14.7（AI関連）に移行

| ファイル | 用途 | 移行理由 |
|----------|------|----------|
| `app/_components/admin/AIUsagePanel.tsx` | AI使用量ダッシュボード | AI機能に直接依存 |
| `app/_components/ai/ContextPreview.tsx` | コンテキストプレビュー | AI機能に直接依存 |
| `app/_components/settings/AIContextSettings.tsx` | AIコンテキスト設定 | AI機能に直接依存 |
| `app/_components/ai/TemplateApplicator.tsx` | テンプレート適用（AI連携） | AI機能に直接依存 |

### ドキュメント ✅ 完了

| ファイル | 用途 | ステータス |
|----------|------|-----------|
| `docs/規約/AI利用規約.md` | AI利用規約 | ✅ |
| `app/ai-terms/page.tsx` | AI利用規約ページ | ✅ |
| `docs/guides/AI-USER-GUIDE.md` | AI機能ユーザーガイド | ✅ 作成済み（298行） |

---

**作成日**: 2025-12-02
**最終更新**: 2025-12-05
**ステータス**: ✅ 完了（pg_cron設定完了）
