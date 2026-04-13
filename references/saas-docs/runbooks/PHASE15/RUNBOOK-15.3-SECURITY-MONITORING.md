# セキュリティ監視ログ機能 ランブック

## 概要

SAタブに追加するセキュリティ監視ログ機能の実装計画。
悪意のある攻撃や異常な動作を検知し、管理者にメールで通知する。

---

## 1. 検知対象イベント

### 1.1 認証関連

| イベント | 検知条件 | 重要度 |
|---------|---------|--------|
| ブルートフォース攻撃 | 同一IP/ユーザーから5分間に10回以上の認証失敗 | Critical |
| 不正セッション | 無効なセッショントークンでのアクセス試行 | Warning |
| セッション乗っ取り | 異なるIP/UAからの同一セッション使用 | Critical |
| 大量ログアウト | 5分間に同一ユーザーの10回以上のログアウト | Warning |

### 1.2 API不正利用

| イベント | 検知条件 | 重要度 |
|---------|---------|--------|
| レート制限超過 | 1分間に100リクエスト超過 | Warning |
| 権限昇格試行 | 権限外エンドポイントへのアクセス試行 | Critical |
| SQLインジェクション | 入力値に危険なパターン検出 | Critical |
| パストラバーサル | `../` を含むパラメータ | Critical |

### 1.3 データアクセス異常

| イベント | 検知条件 | 重要度 |
|---------|---------|--------|
| 大量データ取得 | 1時間に1000件以上のレコード取得 | Warning |
| クロステナントアクセス | 他ワークスペースのデータアクセス試行 | Critical |
| 一括削除 | 5分間に50件以上の削除操作 | Warning |
| 管理者操作異常 | 深夜帯(0-5時)の管理者権限操作 | Info |

### 1.4 システム異常

| イベント | 検知条件 | 重要度 |
|---------|---------|--------|
| エラー率急増 | 5分間でエラー率5%超過 | Critical |
| レスポンス遅延 | 平均レスポンス1000ms超過 | Warning |
| DB接続障害 | Supabase接続失敗 | Critical |

---

## 2. データベース設計

### 2.1 security_events テーブル

```sql
CREATE TABLE security_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  source_ip INET,
  user_id INTEGER REFERENCES users(id),
  workspace_id INTEGER REFERENCES workspaces(id),
  endpoint TEXT,
  user_agent TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by INTEGER REFERENCES users(id)
);

-- インデックス
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX idx_security_events_source_ip ON security_events(source_ip);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_unnotified ON security_events(severity)
  WHERE notified_at IS NULL;
```

### 2.2 rate_limit_tracking テーブル

```sql
CREATE TABLE rate_limit_tracking (
  id SERIAL PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP or user_id
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'user', 'session')),
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  first_request_at TIMESTAMPTZ DEFAULT NOW(),
  last_request_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,

  UNIQUE(identifier, identifier_type, endpoint)
);

-- 自動クリーンアップ（1時間経過で削除）
CREATE INDEX idx_rate_limit_cleanup ON rate_limit_tracking(last_request_at);
```

---

## 3. API設計

### 3.1 セキュリティイベントAPI

```
GET  /api/admin/security-events     # イベント一覧取得（SA専用）
POST /api/admin/security-events/:id/acknowledge  # 確認済みマーク
GET  /api/admin/security-events/stats  # 統計情報
```

### 3.2 レスポンス例

```json
{
  "events": [
    {
      "id": 1,
      "eventType": "brute_force_attempt",
      "severity": "critical",
      "sourceIp": "203.0.113.45",
      "userId": null,
      "endpoint": "/api/auth/login",
      "details": {
        "attemptCount": 15,
        "windowMinutes": 5,
        "targetEmail": "admin@example.com"
      },
      "createdAt": "2025-12-04T10:30:00Z",
      "notifiedAt": "2025-12-04T10:30:05Z",
      "acknowledgedAt": null
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 4. 通知設定

### 4.1 メール通知ルール

| 重要度 | 通知タイミング | 集約 |
|--------|---------------|------|
| Critical | 即座に送信 | なし（個別送信） |
| Warning | 5分間隔で集約 | 同一タイプをまとめる |
| Info | 日次ダイジェスト | 24時間分をまとめる |

### 4.2 通知先設定

```typescript
// 環境変数
ALERT_EMAIL=admin@example.com  // プライマリ
ALERT_EMAIL_CC=security@example.com  // オプション

// 重要度別の通知先（将来拡張）
CRITICAL_ALERT_EMAIL=urgent@example.com
```

### 4.3 メールテンプレート

**件名フォーマット:**
- Critical: `🚨 [AIFCC CRITICAL] ブルートフォース攻撃を検知`
- Warning: `⚠️ [AIFCC WARNING] レート制限超過 (3件)`
- Info: `ℹ️ [AIFCC] セキュリティ日次レポート`

---

## 5. UI設計（SAタブ）

### 5.1 セキュリティダッシュボード

```
┌─────────────────────────────────────────────────────────────┐
│ セキュリティ監視                              [更新] [設定]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│  │ 🚨 Critical│ │ ⚠️ Warning │ │ ℹ️ Info    │ │ 📊 今日計  ││
│  │     3      │ │    12      │ │    45      │ │    60      ││
│  │ 未対応:2   │ │ 未対応:5   │ │            │ │            ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘│
│                                                              │
│  最近のセキュリティイベント                                   │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🚨 ブルートフォース攻撃     203.0.113.45    10:30  [対応]││
│  │ ⚠️ レート制限超過          user123         10:25  [対応]││
│  │ ⚠️ 権限昇格試行            192.168.1.50    10:20  [✓]  ││
│  │ ℹ️ 深夜管理者操作          admin@test.com  03:15        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  攻撃元IP Top5 (24h)           失敗認証 Top5 (24h)          │
│  ┌─────────────────────┐       ┌─────────────────────────┐  │
│  │ 203.0.113.45   45回 │       │ unknown@test.com  23回  │  │
│  │ 198.51.100.22  23回 │       │ admin@fake.com    15回  │  │
│  │ ...                 │       │ ...                     │  │
│  └─────────────────────┘       └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 イベント詳細モーダル

```
┌─────────────────────────────────────────────────────────────┐
│ セキュリティイベント詳細                              [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  タイプ: ブルートフォース攻撃                               │
│  重要度: 🚨 Critical                                        │
│  発生日時: 2025-12-04 10:30:00 JST                          │
│                                                              │
│  ───────────────────────────────────────────────────────    │
│  送信元IP: 203.0.113.45                                     │
│  対象エンドポイント: /api/auth/login                        │
│  User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...   │
│                                                              │
│  詳細情報:                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ {                                                     │   │
│  │   "attemptCount": 15,                                │   │
│  │   "windowMinutes": 5,                                │   │
│  │   "targetEmail": "admin@example.com",                │   │
│  │   "failedPasswords": ["***", "***", "***"]           │   │
│  │ }                                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  対応履歴:                                                   │
│  - 2025-12-04 10:30:05 メール通知送信                       │
│  - 未対応                                                   │
│                                                              │
│  ┌────────────┐ ┌──────────────────┐ ┌─────────────────┐   │
│  │ 確認済み   │ │ IPをブロック     │ │ 誤検知として除外│   │
│  └────────────┘ └──────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 実装ファイル構成

```
app/
├── api/
│   ├── auth/
│   │   ├── session/route.ts      # セキュリティ監視統合済み
│   │   ├── callback/route.ts     # セキュリティ監視統合済み
│   │   └── logout/route.ts       # セキュリティ監視統合済み
│   └── admin/
│       └── security-events/
│           ├── route.ts          # GET: イベント一覧, PATCH: 一括確認
│           ├── [id]/
│           │   └── route.ts      # GET: 詳細, PATCH: 確認済みマーク
│           └── stats/
│               └── route.ts      # GET: 統計情報
├── _components/admin/
│   └── sa-dashboard/
│       ├── index.ts              # エクスポート
│       └── SecurityMonitor.tsx   # 監視UIコンポーネント
lib/
└── server/
    ├── security-monitor.ts       # 検知ロジック・イベント記録
    ├── security-middleware.ts    # APIラッパー・自動監視
    └── security-notifier.ts      # メール通知送信
migrations/
└── 026-security-events.sql       # DBスキーマ（テーブル・関数・RLS）
```

---

## 7. 実装手順

### Phase 1: 基盤整備 ✅ 完了
1. [x] `security_events` テーブル作成（マイグレーション `026-security-events.sql`）
2. [x] `rate_limit_tracking` テーブル作成
3. [x] `ip_blocklist` テーブル作成
4. [x] 基本的なセキュリティイベント記録関数

### Phase 2: 検知ロジック ✅ 完了
5. [x] ブルートフォース検知（`trackAuthFailure`）
6. [x] レート制限検知（`checkRateLimit` - インメモリ実装）
7. [x] 権限昇格試行検知（`recordPrivilegeEscalation`）
8. [x] SQLインジェクション検知（`detectSqlInjection`）
9. [x] パストラバーサル検知（`detectPathTraversal`）
10. [x] 不審なUserAgent検知（`detectSuspiciousUserAgent`）
11. [x] クロステナントアクセス検知（`recordCrossTenantAccess`）

### Phase 3: API統合 ✅ 完了
12. [x] セキュリティミドルウェア作成（`lib/server/security-middleware.ts`）
13. [x] `/api/auth/session` - レート制限・入力検証
14. [x] `/api/auth/callback` - レート制限・入力検証・認証失敗追跡
15. [x] `/api/auth/logout` - レート制限
16. [x] `/api/admin/security-events` - レート制限・権限昇格検知
17. [x] `/api/admin/security-events/[id]` - レート制限・権限昇格検知
18. [x] `/api/contact` - 入力検証（SQLi/パストラバーサル検知）
19. [x] `/api/google/auth` - レート制限
20. [x] `/api/google/sync` - 入力検証
21. [x] `/api/ai/chat` - 入力検証（SQLi検知）
22. [x] `/api/invitations` - レート制限・入力検証
23. [x] `/api/admin/users` - レート制限・入力検証
24. [x] `/api/admin/tenants` - レート制限・入力検証

### Phase 4: 通知機能 ✅ 完了
25. [x] Critical即時通知（`sendSecurityAlertEmail`）
26. [x] 日次ダイジェスト（`sendDailySecurityDigest`）
27. [ ] Warning集約通知（将来実装）

### Phase 4.5: 追加セキュリティ機能 ✅ 完了
28. [x] CSRF保護（`lib/server/csrf.ts` - Double Submit Cookie方式）
29. [x] セッション乗っ取り検知（IP/UA変更検知）
30. [x] セッションフィンガープリント（`migrations/027-session-fingerprint.sql`）

### Phase 5: UI実装 ✅ 完了
31. [x] SAタブにセキュリティセクション追加
32. [x] イベント一覧テーブル（フィルタ機能付き）
33. [x] 統計カード（Critical/Warning/Info/今日計）
34. [x] 確認済みマーク機能（個別・一括）
35. [x] CSSをメインカラー（CSS変数）に統一

### Phase 6: テスト・運用
36. [ ] E2Eテスト
37. [ ] 負荷テスト（誤検知確認）
38. [ ] 運用ドキュメント作成

---

## 8. 既存システムとの連携

### 8.1 利用する既存機能

| 機能 | ファイル | 利用方法 |
|------|---------|---------|
| アラート送信 | `lib/server/alerting.ts` | `sendManualAlert()` |
| ログ出力 | `lib/server/logger.ts` | `apiLogger.warn/error()` |
| 認証 | `lib/server/auth.ts` | `getSession()` |
| 監査ログ | `audit_logs` テーブル | 関連付け |

### 8.2 ミドルウェア統合

```typescript
// middleware.ts に追加
import { recordSecurityEvent } from '@/lib/server/security-monitor';

// 各APIルートで使用
export async function POST(request: NextRequest) {
  // 認証失敗時
  await recordSecurityEvent({
    eventType: 'auth_failure',
    severity: 'info',
    sourceIp: request.ip,
    endpoint: '/api/auth/login',
    details: { reason: 'invalid_credentials' }
  });
}
```

---

## 9. 運用ガイド

### 9.1 アラート対応フロー

```
Critical検知
    ↓
メール受信
    ↓
SAダッシュボードで詳細確認
    ↓
┌─────────────────────────────────────┐
│ 対応判断                             │
│ ├─ 攻撃確定 → IPブロック/報告        │
│ ├─ 誤検知   → 除外設定               │
│ └─ 要調査   → ログ詳細分析           │
└─────────────────────────────────────┘
    ↓
確認済みマーク
    ↓
必要に応じてインシデント報告
```

### 9.2 閾値チューニング

運用開始後、誤検知が多い場合は閾値を調整:

```typescript
// lib/server/security-monitor.ts
export const SECURITY_THRESHOLDS = {
  bruteForce: {
    attempts: 10,      // 10回 → 15回に調整可能
    windowMinutes: 5,
  },
  rateLimit: {
    requestsPerMinute: 100,
    burstLimit: 20,
  },
  // ...
};
```

---

## 10. 将来拡張

- [ ] Slack/Discord通知対応
- [ ] IPブロックリスト自動更新
- [ ] 機械学習による異常検知
- [ ] SOC連携（Webhook）
- [ ] GeoIP情報の付与
- [ ] リアルタイムダッシュボード（WebSocket）

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2025-12-04 | 1.0 | 初版作成 |
| 2025-12-04 | 2.0 | Phase 1-5 実装完了、API統合、UI完成 |
| 2025-12-04 | 2.1 | CSRF保護、セッション乗っ取り検知追加、全APIにミドルウェア拡大適用 |
| 2025-12-05 | 2.2 | 実装状況確認、全Phase完了確認 |

---

## 実装ファイル一覧（2025-12-05 確認済み）

| ファイル | 役割 | 確認状況 |
|---------|------|----------|
| `lib/server/security-monitor.ts` | 検知ロジック・イベント記録 | ✅ 699行 |
| `lib/server/security-middleware.ts` | APIラッパー・自動監視 | ✅ |
| `lib/server/security-notifier.ts` | メール通知送信 | ✅ |
| `migrations/026-security-events.sql` | DBスキーマ（テーブル・関数・RLS） | ✅ 349行 |
| `migrations/027-session-fingerprint.sql` | セッションフィンガープリント | ✅ |
