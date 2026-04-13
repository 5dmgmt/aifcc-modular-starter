# ⚙️ 設定値リファレンス

**最終更新**: 2025年11月11日 14:30

> **⚠️ このドキュメントはアーカイブされています**
>
> **アーカイブ日**: 2025-11-16
> **理由**: 情報が古く、現在の実装と一部不一致があるため。
>
> - 最新の設定値 → `js/core/state.ts` を直接参照
> - 環境変数 → [`../SECURITY.md`](../SECURITY.md) の「環境変数の管理」セクション
>
> このドキュメントは Phase 5-6 時点の情報として保管されています。

---

## 📋 Google API 設定

### Google Cloud Console

- **プロジェクト**: AIFCC Cockpit
- **コンソールURL**: https://console.cloud.google.com/apis/credentials

### OAuth 2.0 クライアント

- **クライアントID**: `xxx-xxx.apps.googleusercontent.com`
- **タイプ**: ウェブアプリケーション

### 承認済みのJavaScript生成元

```
http://localhost:3000
```

### 承認済みのリダイレクトURI

```
http://localhost:3000
```

### 有効化が必要なAPI

1. **Google Calendar API**
2. **Google People API**（ユーザー情報取得用）

### OAuth スコープ（実装済み）

```typescript
// js/core/googleAuth.ts:168-174
scope: [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ')
```

---

## 🔧 アプリケーション設定（state.ts）

### 認証設定（L396-400）

```typescript
auth: {
  password: '0358',  // Phase 6で廃止予定
  sessionKey: 'fd_founders_direct_session',
  googleClientId: 'xxx-xxx.apps.googleusercontent.com'
}
```

### サーバーAPI設定（L456-464）

```typescript
api: {
  baseUrl: '',  // Phase 6で 'https://api.foundersdirect.jp' に変更予定
  timeout: 30000,
  retryAttempts: 3,
  enableServerMode: false  // Phase 6で true に変更予定
}
```

### ストレージ設定（L402-406）

```typescript
storage: {
  key: 'foundersDirectData',
  maxSize: 5 * 1024 * 1024  // 5MB制限
}
```

---

## 🗂️ データ構造

### AppData インターフェース（state.ts）

```typescript
interface AppData {
  // 基本情報
  projectName: string;
  userName: string;

  // ワークスペース情報（Phase 1で追加）
  workspaceId?: string;
  workspaceName?: string;

  // Google認証情報（Phase 3で追加）
  googleAuth?: {
    connected: boolean;
    googleUserId?: string;
    email?: string;
    role?: 'owner' | 'member' | 'viewer';
    globalRole?: 'aifcc_admin' | 'normal';
  };

  // 見込み客データ
  prospects: Prospect[];

  // TODOデータ
  todos: Todo[];

  // その他...
}
```

---

## 📁 ファイル構造

### Core層（/js/core/）

| ファイル | 役割 | 主要関数 |
|---------|------|---------|
| `state.ts` | 設定・型定義 | `APP_CONFIG`, `AppData` |
| `googleAuth.ts` | Google認証 | `initGoogleAuth()`, `signInWithGoogle()`, `getAccessToken()` |
| `googleCalendar.ts` | カレンダーAPI | `fetchCalendarList()`, `createEvent()` |
| `apiClient.ts` | データ永続化 | `loadWorkspaceData()`, `saveWorkspaceData()` |
| `storage.ts` | localStorage操作 | `getData()`, `saveData()` |

### Tabs層（/js/tabs/）

| ファイル | 役割 | 主要関数 |
|---------|------|---------|
| `settings.ts` | 設定UI | `initSettingsTab()`, `handleConnectCalendar()` |
| `prospects.ts` | 見込み客管理UI | `initProspectsTab()` |
| `todos.ts` | TODO管理UI | `initTodosTab()` |
| `matrix.ts` | マトリクス分析UI | `initMatrixTab()` |

### Main層（/js/）

| ファイル | 役割 | 主要関数 |
|---------|------|---------|
| `main.ts` | アプリ起動・タブ切替 | `initializeApp()`, `switchTab()` |

---

## 🔑 ローカルストレージキー

### 認証関連

- **セッション**: `fd_founders_direct_session`
- **Googleユーザー**: `google_user_info`（予定）

### データ関連

- **メインデータ**: `foundersDirectData`
- **ワークスペースデータ**: `foundersDirectData_{workspaceId}`（Phase 6で実装予定）

---

## 🌐 外部URL

### ロゴ・画像

- **ロゴ**: `https://www.foundersdirect.jp/wp-content/uploads/2025/11/FD.png`
- **ランディングページ**: `https://www.foundersdirect.jp/lp.html`

### Google SDK

```html
<!-- index.html:861 -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Google Calendar API

- **Base URL**: `https://www.googleapis.com/calendar/v3`
- **エンドポイント**:
  - カレンダー一覧: `/users/me/calendarList`
  - イベント作成: `/calendars/{calendarId}/events`

---

## 🚦 デバッグフラグ

### コンソールログ

現在、以下の箇所でデバッグログを出力中：

1. **Google SDK読み込み**（settings.ts:510-530）
   ```
   ⏳ Waiting for Google SDK to load...
   ✅ Google SDK loaded successfully
   ```

2. **Google認証初期化**（googleAuth.ts:156-207）
   ```
   Google Auth initialized
   ```

3. **カレンダー取得**（settings.ts:340-350）
   ```
   Fetching calendar list...
   Calendar list fetched successfully
   ```

### エラーハンドリング

すべてのAPI呼び出しで `try-catch` を実装済み。
エラー時はコンソールとアラートで通知。

---

## 🔐 セキュリティ設定

### HTTPS必須（本番環境）

Phase 6以降、以下の理由でHTTPS必須：
- Google OAuth 2.0 はHTTPSを推奨
- Secure Cookie の使用
- カレンダーデータの保護

### CORS設定（本番環境）

サーバー側で以下のヘッダー設定が必要：

```
Access-Control-Allow-Origin: https://www.foundersdirect.jp
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📊 Phase進捗管理

| Phase | ステータス | 完了日 |
|-------|-----------|--------|
| Phase 0 | ✅ 完了 | 2025-11-10 |
| Phase 1 | ✅ 完了 | 2025-11-10 |
| Phase 2 | ✅ 完了 | 2025-11-10 |
| Phase 3 | ✅ 完了 | 2025-11-11 |
| Phase 4 | ✅ 完了 | 2025-11-11 |
| Phase 5 | ⚠️ 実装完了・要デバッグ | 2025-11-11 |
| Phase 6 | ⏳ 未着手 | - |

---

## 📝 次の変更予定

### Phase 6で変更する設定値

1. **state.ts:463**
   ```typescript
   enableServerMode: false → true
   ```

2. **state.ts:460**
   ```typescript
   baseUrl: '' → 'https://api.foundersdirect.jp'
   ```

3. **state.ts:397**（削除予定）
   ```typescript
   password: '0358' → 削除
   ```

### 新規追加予定の設定

```typescript
// state.ts に追加予定
workspace: {
  defaultWorkspaceId: 'demo',
  allowMultipleWorkspaces: true
}
```

---

**参考**: この設定ファイルは `state.ts` の設定値を抽出したものです。実際の設定変更は `state.ts` を直接編集してください。
