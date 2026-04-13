# Phase 14.7 ランブック：テナント別AI設定・AI機能実装

**Version:** 14.7.6
**Status:** ✅ 14.7-A〜C完了 → **14.7-D以降はPhase 19へ移行**
**Claude Code 用ランブック**

> **重要**: Phase 14.7-D〜Hは **Phase 19** に移行しました。
> 詳細は `docs/runbooks/PHASE19-AI-IMPLEMENTATION-RUNBOOK.md` を参照してください。

---

## Phase 14.7 DOD（完了定義）

本Phaseの完了条件：

- [ ] 全テナントで ai_settings が安全にマイグレーション済み（デフォルト disabled）
- [ ] SAダッシュボードから APIキー/モデル/クォータの設定・編集ができる
- [ ] AI無効テナントで AI UI が表示/動作しないことを保証
- [ ] UC-01/02/03/08 が AIチャットパネルから実行可能
- [ ] テナント別使用量の集計が API レベルでは取得可能（UIは簡易でも可）
- [ ] E2Eシナリオ #1〜#5 がすべてパスしていること（§9.3 ミニマムテストマトリクス参照）

### 初回ローンチ対象

- **先行検証テナント**: 自社テナント（AIFCC内部）
- **検証後**: 1社のパイロット顧客で本番検証 → 全テナント展開

---

## 0. 概要

Phase 14.6.5（AI利用設計）で定義したユースケース・プロンプト・UI設計に基づき、
**テナント別AI設定**と**AI機能の本格実装**を行うフェーズです。

### 0.1 Phase 14.7 の目的

1. **テナント別AI設定**: 各テナントが独自のOpenAI APIキーを設定し、AI機能のオン/オフを制御
2. **AI機能実装**: AI利用設計に基づいたUIコンポーネントの実装
3. **AI無効時制御**: AI機能が使えない場合の適切なUI表示

### 0.2 前提条件

| Phase | 内容 | 状態 |
|-------|------|------|
| Phase 14.4 | マルチテナント基盤 | ✅ 完了 |
| Phase 14.6-A | 監査ログ・ガバナンス | ✅ 完了 |
| Phase 14.6-B | データ整備・正規化 | ✅ 完了 |
| Phase 14.6-C | AIコンテキスト基盤 | ✅ 完了 |
| Phase 14.6-D | テンプレート・変数システム | ✅ 完了 |
| Phase 14.6.5 | AI利用設計 | ✅ 完了 |

### 0.2.1 テナント vs ワークスペースのスコープ

> **本Phaseのスコープ**: 「テナント単位のAI利用可否・キー設定」を扱う。
> ワークスペース単位の細分化（ワークスペースごとにAI ON/OFF等）は Phase 15 以降で検討。
> AIFCCではテナント = 契約単位、ワークスペース = プロジェクト単位であり、AI APIキー/課金は契約単位で管理する設計。

### 0.3 必読ドキュメント

- `docs/runbooks/PHASE14.6.5-AI-USAGE-DESIGN-RUNBOOK.md` - **AI利用設計（必読）**
- `docs/runbooks/PHASE14.6-AI-READINESS-RUNBOOK.md` - AI導入準備
- `lib/server/tenants.ts` - テナント解決レイヤー
- `lib/server/encryption.ts` - 暗号化ユーティリティ

### 0.4 ロール設計方針

| ロール | AI設定変更 | AI使用量閲覧 | AI機能利用 |
|--------|-----------|-------------|-----------|
| SA管理者 | ✅ 可 | ✅ 可（全テナント） | ✅ 可 |
| テナント管理者 | ❌ 不可（14.7時点） | 🔜 将来対応 | ✅ 可 |
| 一般ユーザー | ❌ 不可 | 🔜 残りクォータのみ | ✅ 可（有効時） |

> **Phase 14.7 時点では、AI設定変更は SA管理者のみ** に限定。
> テナント管理者による変更は将来フェーズで検討。
> テナント画面内には「AIが有効かどうか」「残りクォータ」の**閲覧のみ**を許可（編集不可）。

---

## 1. サブフェーズ一覧

| サブフェーズ | 内容 | 優先度 | 難易度 | ボリューム | 状態 |
|-------------|------|--------|--------|-----------|------|
| **14.7-A** | DBマイグレーション・型定義・サーバーサービス | 🔴 必須 | Low | S | ✅ 完了 |
| **14.7-B** | APIエンドポイント | 🔴 必須 | Mid | M | → Phase 19.1 |
| **14.7-C** | テナントAI設定UI | 🔴 必須 | Mid | M | → Phase 19.2 |
| **14.7-D** | AIチャットパネル（メイン機能） | 🔴 必須 | **High** | **L** | → Phase 19.3 |
| **14.7-E** | AI使用量モニタリング | 🟡 推奨 | Mid | M | → Phase 19.5 |
| **14.7-F** | AIコンテキストUI | 🟡 推奨 | Low | S | → Phase 19.6 |
| **14.7-G** | AI無効時のUI制御 | 🔴 必須 | Mid | M | → Phase 19.4 |
| **14.7-H** | E2Eテスト・品質保証 | 🟡 推奨 | Mid | M | → Phase 19.7 |

> **Phase 19へ移行済み**: `docs/runbooks/PHASE19-AI-IMPLEMENTATION-RUNBOOK.md` 参照

> **開発リスク集中**: 14.7-D（AIチャットパネル）が最も難易度・ボリュームが大きい。
> **おすすめ実行順**: B(API) → G(無効時制御最低限) → D(チャットパネル) → C(設定UI) → E,F,H

---

## 2. Phase 14.7-A: 基盤実装 ✅ 完了

### 2.1 DBマイグレーション

**ファイル:** `migrations/023-tenant-ai-settings.sql`

```sql
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_settings JSONB NOT NULL DEFAULT '{
  "enabled": false,
  "api_key_encrypted": null,
  "model": "gpt-4o-mini",
  "quota": {
    "maxRequestsPerMonth": 1000,
    "maxTokensPerMonth": 500000,
    "maxCostPerMonth": 10.0
  }
}'::jsonb;

COMMENT ON COLUMN tenants.ai_settings IS 'テナント別AI設定（Phase 14.7）';

CREATE INDEX IF NOT EXISTS idx_tenants_ai_enabled
  ON tenants ((ai_settings->>'enabled'));
```

### 2.2 型定義

**ファイル:** `lib/types/ai-settings.ts`

```typescript
interface TenantAISettings {
  enabled: boolean;
  api_key_encrypted: EncryptedData | null;
  model: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  quota: {
    maxRequestsPerMonth: number;
    maxTokensPerMonth: number;
    maxCostPerMonth: number;  // USD
  };
}

interface AIFeatureState {
  enabled: boolean;
  hasApiKey: boolean;
  available: boolean;
  disabledReason: 'none' | 'tenant_disabled' | 'no_api_key' | 'quota_exceeded';
}
```

**型の利用箇所:**

| 型 | 利用箇所 | 用途 |
|----|---------|------|
| `TenantAISettings` | DB / サーバーサービス / SAダッシュボード | 設定の保存・取得・更新の正規化型 |
| `AIFeatureState` | フロントエンド（`useAIFeature()`） | AIボタンのオン/オフ・エラーメッセージを制御する状態表現 |

### 2.3 サーバーサービス

**ファイル:** `lib/server/tenant-ai-settings.ts`

実装済み関数:
- `getTenantAISettings()` - 設定取得
- `getTenantApiKey()` - 復号済みキー取得
- `updateTenantAISettings()` - 設定更新
- `validateOpenAIApiKey()` - キー検証
- `isTenantAIAvailable()` - 利用可否判定

### 2.4 チェックリスト

- [x] ai_settings カラム追加
- [x] TenantAISettings 型定義
- [x] AIFeatureState 型定義
- [x] サーバーサービス実装
- [ ] 本番DB適用（手動実行必要）

### 2.5 本番ロールアウト手順

既存テナントがいる状態での安全な適用手順：

1. [ ] **本番DBバックアップ取得**
2. [ ] Staging環境で `023-tenant-ai-settings.sql` を適用・動作確認
3. [ ] **本番適用**: `psql` で手動実行
4. [ ] **検証**: 既存テナントの `ai_settings.enabled` が全て `false` であることを確認
   ```sql
   SELECT id, name, ai_settings->>'enabled' as ai_enabled
   FROM tenants;
   ```
5. [ ] SAダッシュボードで1テナント分を手動設定し、E2Eテストを実行

---

## 3. Phase 14.7-B: APIエンドポイント 🔜 予定

### 3.1 エンドポイント一覧

**ファイル:** `app/api/admin/tenants/[id]/ai/route.ts`

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/admin/tenants/[id]/ai` | AI設定取得 |
| PUT | `/api/admin/tenants/[id]/ai` | AI設定更新 |
| POST | `/api/admin/tenants/[id]/ai/validate` | APIキー検証 |

### 3.2 API仕様

#### GET /api/admin/tenants/[id]/ai

**認証:** SA管理者のみ

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "hasApiKey": true,
    "model": "gpt-4o-mini",
    "quota": {
      "maxRequestsPerMonth": 1000,
      "maxTokensPerMonth": 500000,
      "maxCostPerMonth": 10.0
    }
  }
}
```

#### PUT /api/admin/tenants/[id]/ai

**認証:** SA管理者のみ

**リクエスト:**
```json
{
  "enabled": true,
  "apiKey": "sk-...",
  "model": "gpt-4o-mini",
  "quota": {
    "maxRequestsPerMonth": 2000
  }
}
```

#### POST /api/admin/tenants/[id]/ai/validate

**認証:** SA管理者のみ

**リクエスト:**
```json
{
  "apiKey": "sk-..."
}
```

**レスポンス:**
```json
{
  "valid": true,
  "models": ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"]
}
```

### 3.3 エラーレスポンス

| disabledReason | HTTPステータス | レスポンス例 |
|----------------|---------------|-------------|
| `no_api_key` | 403 Forbidden | `{ "error": "no_api_key", "message": "APIキーが設定されていません" }` |
| `tenant_disabled` | 403 Forbidden | `{ "error": "tenant_disabled", "message": "AI機能はこのテナントでは無効です" }` |
| `quota_exceeded` | 429 Too Many Requests | `{ "error": "quota_exceeded", "message": "月間使用量の上限に達しました", "resetAt": "2025-01-01T00:00:00Z" }` |

> **UI との連携**: Phase 14.7-G（AI無効時UI制御）でこのエラーを `useAIFeature()` が解釈し、適切なメッセージを表示する。

### 3.4 チェックリスト

- [ ] GET エンドポイント実装
- [ ] PUT エンドポイント実装
- [ ] POST /validate エンドポイント実装
- [ ] 認証・認可チェック
- [ ] バリデーション（Zod）
- [ ] エラーレスポンス実装（上記3パターン）

---

## 4. Phase 14.7-C: テナントAI設定UI 🔜 予定

### 4.1 コンポーネント

**ファイル:**
- `app/_components/admin/sa-dashboard/TenantAISettingsPanel.tsx`（新規）
- `app/_components/admin/sa-dashboard/EditTenantModal.tsx`（拡張）

### 4.2 UI設計

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 AI設定                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ AI機能を有効にする        [====ON=====]                  │
│                                                         │
│ ─────────────────────────────────────────────────────   │
│                                                         │
│ OpenAI APIキー                                          │
│ ┌─────────────────────────────────────────────┐ [検証]  │
│ │ sk-••••••••••••••••••••••••••••••••       │         │
│ └─────────────────────────────────────────────┘         │
│ ✅ APIキー検証済み                                       │
│                                                         │
│ モデル                                                  │
│ ┌─────────────────────────────────────────────┐         │
│ │ gpt-4o-mini (推奨)                     ▼  │         │
│ └─────────────────────────────────────────────┘         │
│                                                         │
│ 使用量制限（月間）                                       │
│   リクエスト数  ┌────────────┐                          │
│                │ 1000       │ 回                       │
│                └────────────┘                          │
│   トークン数    ┌────────────┐                          │
│                │ 500000     │ トークン                  │
│                └────────────┘                          │
│   コスト上限    ┌────────────┐                          │
│                │ 10.00      │ USD                      │
│                └────────────┘                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.3 チェックリスト

- [ ] TenantAISettingsPanel コンポーネント
- [ ] EditTenantModal にAI設定セクション追加
- [ ] APIキー入力（マスク表示）
- [ ] キー検証ボタン + 結果表示
- [ ] オン/オフトグル
- [ ] モデル選択ドロップダウン
- [ ] クォータ設定入力

---

## 5. Phase 14.7-D: AIチャットパネル 🔜 予定

### 5.1 概要

Phase 14.6.5 で設計したAIチャットパネル（サイドパネル）を実装します。

### 5.1.1 UC ↔ クイックアクション対応表

| クイックアクション | UC | UseCaseKey | contextLevel |
|-------------------|-----|------------|--------------|
| 「初回コンタクト」ボタン | UC-01 | `initial_contact` | entity |
| 「フォローアップ」ボタン | UC-02 | `follow_up` | entity |
| 「反論対応」ボタン | UC-03 | `objection_handling` | entity |
| 「次アクション」ボタン | UC-08 | `next_action` | standard |

> **参照**: Phase 14.6.5 ランブック §2.1, §11.2

### 5.2 コンポーネント

**ファイル:**
- `app/_components/ai/AIChatPanel.tsx`（新規）
- `app/_components/ai/AIChatMessage.tsx`（新規）
- `app/_components/ai/QuickActions.tsx`（新規）

### 5.3 UI設計（実装観点の補足）

> **UI 正本**: レイアウト・要素の定義は Phase 14.6.5 §5.2 を正とする。
> 本ランブックでは実装観点での補足（クイックアクション、状態管理など）のみを記載。

```
┌─────────────────────────────────────────┐
│ ✨ AIFCCアシスタント            [×]      │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📊 コンテキスト                      │ │
│ │ 見込み客: 株式会社サンプル           │ │
│ │ ステータス: 提案中                   │ │
│ │ [コンテキスト編集]                   │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  [会話メッセージ...]                     │
│                                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 質問を入力...                       │ │
│ └─────────────────────────────────────┘ │
│ [📎] [送信 ➤]                          │
├─────────────────────────────────────────┤
│ 💡 クイックアクション                   │
│ [初回コンタクト] [フォローアップ]       │
│ [反論対応] [次アクション]               │
└─────────────────────────────────────────┘
```

### 5.4 機能要件

| 機能 | 説明 |
|------|------|
| ストリーミング応答 | AIの応答をリアルタイム表示 |
| コンテキスト表示 | 現在のコンテキストを表示・編集可能 |
| クイックアクション | ワンクリックで定型プロンプト実行 |
| コピー機能 | AI出力をコピー |
| 再生成 | 別パターンで再生成 |

### 5.5 チェックリスト

- [ ] AIChatPanel 基本実装
- [ ] ストリーミング応答表示
- [ ] コンテキスト表示セクション
- [ ] メッセージ入力・送信
- [ ] クイックアクションボタン
- [ ] コピー・再生成ボタン
- [ ] ローディング状態
- [ ] エラー表示

---

## 6. Phase 14.7-E: AI使用量モニタリング 🔜 予定

### 6.1 コンポーネント

**ファイル:**
- `app/api/ai/usage/route.ts`（拡張）
- `app/_components/admin/AIUsagePanel.tsx`（新規）

### 6.2 機能

- ユーザー別/テナント別のAI使用量表示
- 日次/週次/月次集計
- コスト推定表示
- クォータ超過警告

### 6.3 チェックリスト

- [ ] 使用量API拡張
- [ ] AIUsagePanel UI実装
- [ ] グラフ表示（使用量推移）
- [ ] クォータ進捗バー
- [ ] 警告表示

---

## 7. Phase 14.7-F: AIコンテキストUI 🔜 予定

### 7.1 コンポーネント

**ファイル:**
- `app/_components/ai/ContextPreview.tsx`（新規）
- `app/_components/settings/AIContextSettings.tsx`（新規）

### 7.2 機能

- 現在のコンテキスト表示
- トークン数表示
- コンテキストレベル設定（minimal / standard / detailed）
- 含めるデータの選択

### 7.3 チェックリスト

- [ ] ContextPreview 実装
- [ ] AIContextSettings 実装
- [ ] レベル選択UI
- [ ] トークン数カウント表示

---

## 8. Phase 14.7-G: AI無効時のUI制御 🔜 予定

### 8.1 概要

テナントでAIが無効の場合、関連UIを適切に制御します。

### 8.2 コンポーネント

**ファイル:**
- `lib/contexts/AIFeatureContext.tsx`（新規）
- `lib/hooks/useAIFeature.ts`（新規）

### 8.3 影響を受けるコンポーネント

- `app/_components/ai/*` - AIチャット関連
- `app/_components/okr/*` - OKR AI提案
- `app/_components/todo/*` - TODO AI機能
- `app/_components/dashboard/*` - ダッシュボードAI

### 8.4 無効時の表示パターン

**パターン1: グレーアウト + メッセージ**
```
┌─────────────────────────────────────────┐
│ 🤖 AI アシスタント                       │
├─────────────────────────────────────────┤
│                                         │
│   🔒 AI機能はオフです                    │
│   管理者に連絡してください               │
│                                         │
└─────────────────────────────────────────┘
```

**パターン2: 非表示**
- AIタブ自体を表示しない
- AI関連ボタンを非表示

### 8.5 無効理由別メッセージ

| 理由 | メッセージ |
|------|-----------|
| `tenant_disabled` | AI機能はこのテナントでは無効です |
| `no_api_key` | APIキーが設定されていません |
| `quota_exceeded` | 月間使用量の上限に達しました。来月○日以降に再度利用可能です |

### 8.5.1 UI要素別の無効時挙動

| UI要素 | 無効時の挙動 |
|--------|------------|
| グローバルAIボタン（ヘッダー） | ホバー時にツールチップで理由表示。クリック不可（disabled） |
| 見込み客詳細の「AIで文章作成」ボタン | disabled + ヘルプテキスト表示 |
| クイックアクションボタン | 非表示（AIパネルが開けないため） |
| quota超過時 | エラーメッセージ + 「来月○日以降に再度利用可能」の日付表示 |

### 8.6 useAIFeature() 仕様

```typescript
// lib/hooks/useAIFeature.ts

interface UseAIFeatureResult {
  // AIFeatureState（2.2 の型と整合）
  enabled: boolean;          // ai_settings.enabled
  hasApiKey: boolean;        // api_key_encrypted !== null
  available: boolean;        // enabled && hasApiKey && !quotaExceeded
  disabledReason: 'none' | 'tenant_disabled' | 'no_api_key' | 'quota_exceeded';

  // UI制御用ヘルパー
  canUseFeature: (feature: 'chat' | 'suggestion') => boolean;
  getDisabledMessage: () => string | null;
}

function useAIFeature(): UseAIFeatureResult;
```

**UI側の責務**:
- `available === false` のとき、ボタン disable or カード非表示
- `disabledReason !== 'none'` のとき、`getDisabledMessage()` でツールチップ or メッセージを表示
- 各コンポーネントは**自分でロジックを解釈しない**（フックの返り値をそのまま使う）

### 8.7 チェックリスト

- [ ] AIFeatureContext 作成
- [ ] useAIFeature() フック
- [ ] 各コンポーネントの無効時表示
- [ ] 理由別メッセージ表示

---

## 9. Phase 14.7-H: E2Eテスト・品質保証 🔜 予定

### 9.1 テストファイル

**ファイル:** `tests/e2e/ai-features.spec.ts`

### 9.2 テストケース

```typescript
test.describe('AI機能', () => {
  test('AI有効時にチャットが使用できる', async ({ page }) => {
    // ...
  });

  test('AI無効時に適切なメッセージが表示される', async ({ page }) => {
    // ...
  });

  test('レート制限が機能する', async ({ page }) => {
    // ...
  });

  test('APIキー検証が機能する', async ({ page }) => {
    // ...
  });
});
```

### 9.3 ミニマムテストマトリクス（必須）

| # | シナリオ | 前提条件 | 期待結果 |
|---|---------|---------|---------|
| 1 | APIキー設定 → validate成功 → enabled=true | SAログイン済み | テナントユーザーがAIチャットを開ける |
| 2 | APIキー未設定 → AIボタン押下 | テナントユーザーログイン | 「APIキーが設定されていません」表示 |
| 3 | quota超過状態 → AIチャット実行 | 月間上限到達 | 429エラー + 「来月○日以降に再度利用可能」表示 |
| 4 | AI無効テナント → 各画面確認 | enabled=false | 全AI要素がdisabled/非表示 |
| 5 | クイックアクション実行 | AI有効 | UC-01/02/03/08 が正常に実行される |

> Playwright等でE2Eを書く際は、この5シナリオを最低限カバーすること。

### 9.4 チェックリスト

- [ ] AIチャット機能テスト
- [ ] AI無効時の動作テスト
- [ ] レート制限テスト
- [ ] APIキー設定テスト
- [ ] コンテキストレベルテスト
- [ ] ミニマムテストマトリクス5シナリオ

---

## 10. セキュリティ

### 10.1 APIキー保護

| 対策 | 実装 |
|------|------|
| 暗号化保存 | AES-256-GCM（MASTER_ENCRYPTION_KEY使用） |
| ログ除外 | APIキーはログに出力しない |
| レスポンス除外 | hasApiKey フラグのみ返す |
| 復号はサーバーのみ | クライアントには一切送信しない |

### 10.2 APIキーのライフサイクル

| 操作 | Phase 14.7 対応 | 備考 |
|------|----------------|------|
| **設定** | ✅ 対応 | SA管理者がダッシュボードから設定 |
| **更新** | ✅ 対応 | 既存キーを上書き。古いキーは即時無効 |
| **削除** | ✅ 対応 | `api_key_encrypted = null` に設定 |
| **ローテーション** | 🔜 将来 | 履歴管理・猶予期間は将来フェーズ |

### 10.3 ログポリシー

| 項目 | ログ出力 | 備考 |
|------|---------|------|
| APIキー生値 | ❌ 絶対NG | |
| APIキー先頭4桁 | ❌ NG | 部分的にも出さない |
| `sk-***...***` 形式 | ✅ OK | 設定有無の確認用 |
| validate結果 | ✅ OK | `{ valid: true/false }` のみ |
| DBには暗号化形式のみ | ✅ | AES-256-GCM で暗号化された形式のみ保存 |

### 10.4 アクセス制御

| 操作 | 必要権限 |
|------|---------|
| AI設定閲覧 | SA管理者 |
| AI設定更新 | SA管理者 |
| APIキー設定 | SA管理者 |
| AI機能利用 | テナントメンバー（enabled && hasApiKey時） |

---

## 11. 既存features.enableAIとの関係

| 設定 | 場所 | 用途 |
|------|------|------|
| `features.enableAI` | tenants.features | 機能フラグ（UI表示/非表示） |
| `ai_settings.enabled` | tenants.ai_settings | 実際のAI有効/無効 |

**統合ロジック:**
```typescript
const canUseAI =
  tenant.features.enableAI &&      // UIに表示される
  tenant.ai_settings.enabled &&    // 設定で有効
  tenant.ai_settings.api_key_encrypted !== null;  // キー設定済み
```

### 11.1 AI有効/無効 状態マトリクス（真理値表）

| features.enableAI | ai_settings.enabled | api_key | quota | canUseAI | disabledReason | UI挙動 |
|-------------------|---------------------|---------|-------|----------|----------------|--------|
| `false` | `false` | なし | OK | `false` | `tenant_disabled` | AI関連UIを**非表示** |
| `true` | `false` | なし | OK | `false` | `tenant_disabled` | グレーアウト + メッセージ |
| `true` | `true` | なし | OK | `false` | `no_api_key` | グレーアウト + メッセージ |
| `true` | `true` | あり | 超過 | `false` | `quota_exceeded` | グレーアウト + 次月リセット日表示 |
| `true` | `true` | あり | OK | `true` | `none` | **正常利用可能** |

> **活用**: `useAIFeature()` の実装検証、「ONにしたのに使えない」問い合わせ時の切り分けに使用。

---

## 12. 成果物一覧

| ファイル | 説明 | 状態 |
|----------|------|------|
| `migrations/023-tenant-ai-settings.sql` | DBマイグレーション | ✅ |
| `lib/types/ai-settings.ts` | 型定義 | ✅ |
| `lib/server/tenant-ai-settings.ts` | サーバーサービス | ✅ |
| `app/api/admin/tenants/[id]/ai/route.ts` | API | 🔜 |
| `app/_components/admin/sa-dashboard/TenantAISettingsPanel.tsx` | 設定UI | 🔜 |
| `app/_components/ai/AIChatPanel.tsx` | チャットパネル | 🔜 |
| `app/_components/ai/ContextPreview.tsx` | コンテキストプレビュー | 🔜 |
| `app/_components/admin/AIUsagePanel.tsx` | 使用量ダッシュボード | 🔜 |
| `lib/hooks/useAIFeature.ts` | カスタムフック | 🔜 |
| `lib/contexts/AIFeatureContext.tsx` | Context | 🔜 |
| `tests/e2e/ai-features.spec.ts` | E2Eテスト | 🔜 |

---

## 13. 環境変数

```bash
# 必須（既存）
MASTER_ENCRYPTION_KEY=<base64 or hex 32bytes>

# オプション（フォールバック用）
OPENAI_API_KEY=sk-...        # テナントキー未設定時のフォールバック
AI_ENABLED=true              # グローバルAI有効フラグ
```

---

## 14. 依存関係

### 14.1 前提Phase

- Phase 14.4: マルチテナント基盤 ✅
- Phase 14.6: AI導入準備 ✅
- Phase 14.6.5: AI利用設計 ✅

### 14.2 後続Phase

- Phase 14.8: OKR AI統合（分析・提案）
- Phase 14.9: Action Map AI統合（自動生成）
- Phase 14.10: TODO AI統合（優先順位・習慣コーチ）

---

## 15. 検証・受け入れ基準

| 項目 | 基準 |
|------|------|
| 機能テスト | AIエンドポイントが99.9%稼働率で応答 |
| パフォーマンス | 平均レイテンシ ≤ 200ms（AI応答除く） |
| セキュリティ | APIキーが正しく暗号化・保存されている |
| UI | AI無効時に適切なメッセージが表示される |
| ドキュメント | AI利用規約がリンクされている |

---

## 16. ロールバック手順

1. **デプロイ前**: `git tag v14.7-release` を作成
2. **障害検知**: AIエンドポイントのエラーレート5%超過でアラート
3. **ロールバック**: `git revert` で前バージョンに戻す
4. **データロールバック**: マイグレーションは分離して管理

### 16.1 DBロールバック方針（最終手段）

物理的なカラム削除は行わない。論理的に無効化して将来の再有効化に備える：

```sql
-- 全テナントのAI機能を論理的に無効化
UPDATE tenants
SET ai_settings = jsonb_set(
  jsonb_set(ai_settings, '{enabled}', 'false'),
  '{api_key_encrypted}', 'null'
);

-- 確認
SELECT id, name, ai_settings->>'enabled' as ai_enabled
FROM tenants;
```

> **注意**: `api_key_encrypted` を null にすることで、キー情報も論理削除される。
> カラム自体は残し、Phase 14.8 以降での再有効化を前提とする。

---

**作成日:** 2025-12-02
**最終更新:** 2025-12-05
**ステータス:** ✅ 14.7-A〜C完了（14.7-D以降はPhase 19へ移行）
**バージョン:** 14.7.6
