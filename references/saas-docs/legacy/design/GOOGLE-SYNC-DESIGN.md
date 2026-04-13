# Google Tasks/Calendar 双方向同期設計書

> Phase 10-D-1: AIFCC と Google Tasks/Calendar の双方向同期

## 1. 概要

### 1.1 目的

AIFCC のタスクと Google Tasks/Calendar を双方向同期し、以下を実現する：

1. **AIFCC → Google Tasks**: タスク作成・更新・完了を同期
2. **Google Tasks → AIFCC**: 完了状態・変更を同期
3. **Google Calendar 連携**: 予定の4象限分類（色分け）

### 1.2 設計方針

```
┌─────────────────────────────────────────────────────────────────┐
│ AIFCC (AIFCC Connect)                                    │
│                                                                  │
│ ┌─────────────┐   ┌─────────────┐   ┌─────────────────────────┐ │
│ │  Tasks[]    │──▶│ SyncEngine  │──▶│ Google API Client       │ │
│ │ (AppData)   │◀──│             │◀──│ (Tasks + Calendar)      │ │
│ └─────────────┘   └─────────────┘   └─────────────────────────┘ │
│                         │                       │                │
│                         ▼                       ▼                │
│                   ┌───────────┐         ┌─────────────┐          │
│                   │SyncState  │         │ OAuth Token │          │
│                   │(metadata) │         │ (encrypted) │          │
│                   └───────────┘         └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Google Workspace                                                  │
│                                                                   │
│ ┌─────────────────┐       ┌───────────────────┐                  │
│ │ Google Tasks    │◀─────▶│ Google Calendar   │                  │
│ │ (Task List)     │       │ (Block off time)  │                  │
│ └─────────────────┘       └───────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. 認証設計

### 2.1 現状の認証フロー

現在の AIFCC は Supabase Auth 経由で Google ログインを行っているが、
**Google API 用のアクセストークンは保存していない**。

```
現状:
User → Supabase Auth (Google Provider) → AIFCC Session
       ↳ Google OAuth Token は Supabase が管理（AIFCC からアクセス不可）
```

### 2.2 新しい認証フロー（Google API 用）

Google Tasks/Calendar API を使用するため、追加の OAuth 認証が必要：

```
新フロー:
1. [AIFCC ログイン] Supabase Auth (既存)
2. [Google API 連携] 別途 OAuth 2.0 フローを追加
   - スコープ: tasks, calendar.readonly
   - トークンを暗号化して DB 保存
```

### 2.3 必要なスコープ

```typescript
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/tasks',           // Tasks 読み書き
  'https://www.googleapis.com/auth/calendar.readonly', // Calendar 読み取りのみ
  'https://www.googleapis.com/auth/calendar.events',  // Calendar イベント作成（オプション）
];
```

### 2.4 トークン管理

```typescript
// users テーブルに追加するカラム
interface GoogleTokens {
  google_access_token: string;      // AES-256 暗号化
  google_refresh_token: string;     // AES-256 暗号化
  google_token_expires_at: string;  // ISO8601
  google_scopes: string[];          // 付与されたスコープ
}
```

**セキュリティ考慮**:
- アクセストークンは暗号化して保存
- リフレッシュトークンは長期保存、アクセストークンは有効期限管理
- トークン更新は自動で行う

## 3. 同期設計

### 3.1 同期メタデータ

```typescript
// Task 型に追加するフィールド
interface TaskSyncMetadata {
  // Google Tasks 連携
  googleTaskId?: string;           // Google Tasks の ID
  googleTaskListId?: string;       // タスクリスト ID

  // 同期状態
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncedAt?: string;           // 最終同期日時
  localUpdatedAt: number;          // ローカル更新日時
  remoteUpdatedAt?: string;        // リモート更新日時（RFC3339）

  // 競合解決
  conflictData?: {
    localVersion: Partial<Task>;
    remoteVersion: Partial<Task>;
    detectedAt: string;
  };
}
```

### 3.2 同期方向とトリガー

| 方向 | トリガー | 処理 |
|------|----------|------|
| AIFCC → Google | タスク作成 | Google Tasks に INSERT |
| AIFCC → Google | タスク更新 | Google Tasks を UPDATE |
| AIFCC → Google | タスク完了 | Google Tasks を COMPLETE |
| Google → AIFCC | ポーリング（5分） | 変更を検知して AIFCC を UPDATE |
| Google → AIFCC | 手動リフレッシュ | 即時同期 |

### 3.3 同期アルゴリズム

```typescript
async function syncTask(task: Task): Promise<SyncResult> {
  // 1. Google Tasks から最新を取得
  const remoteTask = await googleTasksClient.get(task.googleTaskId);

  // 2. 競合検知
  if (remoteTask.updated > task.lastSyncedAt && task.localUpdatedAt > task.lastSyncedAt) {
    // 両方で更新されている → 競合
    return {
      status: 'conflict',
      localVersion: task,
      remoteVersion: remoteTask,
    };
  }

  // 3. 同期方向を決定
  if (task.localUpdatedAt > new Date(remoteTask.updated).getTime()) {
    // ローカルが新しい → Google に PUSH
    await googleTasksClient.update(task.googleTaskId, toGoogleTask(task));
    return { status: 'pushed' };
  } else {
    // リモートが新しい → AIFCC を UPDATE
    return {
      status: 'pulled',
      updates: fromGoogleTask(remoteTask),
    };
  }
}
```

### 3.4 競合解決 UI

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ 同期競合が発生しました                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ タスク: 「プレゼン資料作成」                                      │
│                                                                 │
│ ┌─────────────────────┐   ┌─────────────────────┐              │
│ │ 📱 AIFCC の変更        │   │ 📅 Google の変更    │              │
│ ├─────────────────────┤   ├─────────────────────┤              │
│ │ タイトル: プレゼン〜 │   │ タイトル: プレゼン〜│              │
│ │ 状態: 進行中        │   │ 状態: 完了 ✅       │              │
│ │ 更新: 10:30         │   │ 更新: 10:45        │              │
│ └─────────────────────┘   └─────────────────────┘              │
│                                                                 │
│ [AIFCC を優先] [Google を優先] [両方を確認して選択]                │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Google Tasks 連携

### 4.1 タスクリスト戦略

**方針**: AIFCC 専用のタスクリストを作成

```typescript
const AIFCC_TASK_LIST_TITLE = 'AIFCC Tasks';

async function ensureFdcTaskList(): Promise<string> {
  const lists = await googleTasksClient.listTaskLists();
  const fdcList = lists.find(l => l.title === AIFCC_TASK_LIST_TITLE);

  if (fdcList) {
    return fdcList.id;
  }

  // 存在しない場合は作成
  const newList = await googleTasksClient.createTaskList({ title: AIFCC_TASK_LIST_TITLE });
  return newList.id;
}
```

### 4.2 タスクマッピング

```typescript
// AIFCC Task → Google Task
function toGoogleTask(task: Task): GoogleTaskInput {
  return {
    title: `[${SUIT_CONFIG[task.suit].symbol}] ${task.title}`,
    notes: task.description,
    due: task.dueDate ? `${task.dueDate}T00:00:00.000Z` : undefined,
    status: task.status === 'done' ? 'completed' : 'needsAction',
  };
}

// Google Task → AIFCC Task Updates
function fromGoogleTask(googleTask: GoogleTask): Partial<Task> {
  // タイトルからスートを抽出
  const suitMatch = googleTask.title?.match(/^\[([♠♥♦♣])\]\s*/);
  const suit = suitMatch ? symbolToSuit(suitMatch[1]) : undefined;
  const title = suitMatch ? googleTask.title.replace(suitMatch[0], '') : googleTask.title;

  return {
    title,
    suit,
    description: googleTask.notes,
    status: googleTask.status === 'completed' ? 'done' : 'not_started',
  };
}
```

### 4.3 同期タイミング

| イベント | 処理 |
|----------|------|
| タスク作成 | 即時同期（debounce 1秒） |
| タスク更新 | 即時同期（debounce 1秒） |
| タスク完了 | 即時同期 |
| アプリ起動 | 全タスク同期 |
| 5分経過 | バックグラウンド同期 |
| 手動リフレッシュ | 全タスク同期 |

## 5. Google Calendar 連携

### 5.1 読み取り専用連携

**方針**: Calendar は読み取りのみ。「いつやるか」は Google Calendar で管理。

```typescript
// Calendar イベントを取得して4象限分類
async function fetchCalendarEventsWithSuit(
  date: string,
  accessToken: string
): Promise<CalendarEventWithSuit[]> {
  const events = await googleCalendarClient.listEvents({
    calendarId: 'primary',
    timeMin: `${date}T00:00:00+09:00`,
    timeMax: `${date}T23:59:59+09:00`,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return events.map(event => ({
    ...event,
    suit: classifyEventSuit(event),
    durationMinutes: calculateDuration(event),
  }));
}
```

### 5.2 イベントの4象限分類

```typescript
// colorId → Suit マッピング
const COLOR_TO_SUIT: Record<string, Suit | 'joker'> = {
  '8':  'spade',    // Graphite（黒系）
  '11': 'heart',    // Tomato（赤）
  '5':  'diamond',  // Banana（黄）
  '9':  'club',     // Blueberry（青）
};

function classifyEventSuit(event: CalendarEvent): Suit | 'joker' {
  // 1. タイトルプレフィックスをチェック
  const suitMatch = event.summary?.match(/^\[([♠♥♦♣])\]/);
  if (suitMatch) {
    return symbolToSuit(suitMatch[1]);
  }

  // 2. colorId をチェック
  if (event.colorId && COLOR_TO_SUIT[event.colorId]) {
    return COLOR_TO_SUIT[event.colorId];
  }

  // 3. 分類できない → Joker
  return 'joker';
}
```

## 6. 実装計画

### Phase 1: OAuth 認証基盤（10-D-1a）

1. **Google Cloud Console 設定**
   - OAuth 2.0 クライアント作成
   - スコープ設定（tasks, calendar.readonly）
   - リダイレクト URI 設定

2. **DB スキーマ更新**
   ```sql
   ALTER TABLE users ADD COLUMN google_access_token TEXT;
   ALTER TABLE users ADD COLUMN google_refresh_token TEXT;
   ALTER TABLE users ADD COLUMN google_token_expires_at TIMESTAMPTZ;
   ALTER TABLE users ADD COLUMN google_scopes TEXT[];
   ```

3. **OAuth フロー実装**
   - `/api/google/auth` - 認証開始
   - `/api/google/callback` - コールバック処理
   - `/api/google/refresh` - トークン更新

### Phase 2: Google Tasks 連携（10-D-1b）

1. **Google Tasks API クライアント**
   - `lib/google/tasks-client.ts`
   - CRUD 操作のラッパー

2. **同期エンジン**
   - `lib/google/sync-engine.ts`
   - 双方向同期ロジック

3. **競合解決 UI**
   - `app/_components/sync/SyncConflictModal.tsx`

### Phase 3: Google Calendar 連携（10-D-1c）

1. **Google Calendar API クライアント**
   - `lib/google/calendar-client.ts`
   - イベント取得・分類

2. **時間配分計算**
   - `lib/types/time-allocation.ts` との統合
   - Calendar イベントを TimeAllocation に反映

## 7. API 設計

### 7.1 認証エンドポイント

```typescript
// POST /api/google/auth
// Google OAuth 認証を開始
// Response: { authUrl: string }

// GET /api/google/callback
// OAuth コールバック処理
// Query: { code: string, state: string }

// POST /api/google/refresh
// トークン更新
// Response: { success: boolean }

// DELETE /api/google/disconnect
// Google 連携解除
```

### 7.2 同期エンドポイント

```typescript
// POST /api/google/sync
// 手動同期実行
// Response: { synced: number, conflicts: number }

// GET /api/google/sync/status
// 同期状態取得
// Response: { lastSyncedAt: string, pendingCount: number, conflictCount: number }

// POST /api/google/sync/resolve
// 競合解決
// Body: { taskId: string, resolution: 'local' | 'remote' | 'manual', data?: Partial<Task> }
```

## 8. セキュリティ考慮事項

1. **トークン暗号化**: AES-256-GCM で暗号化して保存
2. **スコープ最小化**: 必要最小限のスコープのみ要求
3. **トークン更新**: 有効期限前に自動更新
4. **エラーハンドリング**: トークン無効時は再認証フローへ誘導
5. **レート制限**: Google API のクォータを考慮

## 9. エラーハンドリング

| エラー | 対処 |
|--------|------|
| 401 Unauthorized | トークン更新 → 失敗なら再認証 |
| 403 Forbidden | スコープ不足 → 再認証（追加スコープ） |
| 429 Rate Limit | 指数バックオフで再試行 |
| Network Error | オフラインキューに追加 |
| Conflict | 競合解決 UI を表示 |

## 10. 今後の拡張

1. **Webhook 対応**: Google Tasks の変更をリアルタイム通知（Push Notifications）
2. **Calendar 書き込み**: AIFCC からカレンダーイベント作成
3. **複数カレンダー対応**: 仕事/プライベートカレンダーの統合
4. **オフライン対応**: 同期キューとバックグラウンド同期
