# AIFCC Cockpit (AIFCC) Phase 9 認証問題まとめ

## 📋 現在の症状

### 主症状
**Google ログインボタンをクリックしても、画面が変わらない**
- Google OAuth ポップアップは表示される
- Google アカウント選択・認証は成功する
- しかし、その後も認証ガード（ログイン画面）のまま
- Dashboard に遷移しない

### コンソールログ
```
👤 [Phase 7-9] Fetching current user with role from /api/auth/roles
❌ [Phase 7-9] Failed to fetch current user with role: API request timeout (5000ms)
```

---

## 🏗️ 認証フローの設計

### 想定される正常フロー

1. **ユーザーが Google ログインボタンをクリック**
2. **Google OAuth ポップアップで認証**
3. **フロントエンドが Access Token を取得**
4. **POST /api/auth/google に Access Token を送信**
   - `credentials: 'include'` 付き
5. **サーバーが Access Token を検証**
6. **サーバーが JWT を発行し、Cookie にセット**
   - `Set-Cookie: fdc_jwt=...; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure`
7. **ブラウザが Cookie を保存**
8. **フロントエンドが unlockApp() を呼び出し**
9. **Dashboard が表示される**

### 実際の動作（推測）

1. ✅ Google ログイン成功
2. ✅ Access Token 取得
3. ❓ `/api/auth/google` への POST リクエスト（不明）
4. ❌ JWT Cookie が保存されていない？
5. ❌ `unlockApp()` が呼ばれていない？

---

## 📁 関連ファイルと実装状況

### サーバーサイド（API）

#### `/api/auth/google.ts` (行906-181)
**責務**: Google Access Token を検証し、JWT Cookie を発行

**実装内容**:
```typescript
// Google tokeninfo API で Access Token を検証
const tokenInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${body.accessToken}`);

// JWT 発行
const jwt = createAccessToken({
  userId: dbUser.id,
  workspaceId,
  role
});

// Cookie 設定
const cookieAttributes = [
  'fdc_jwt=' + jwt,
  'HttpOnly',
  'Path=/',
  'Max-Age=604800',
  'SameSite=Lax',
  ...(isProduction ? ['Secure'] : [])
].join('; ');

// レスポンス
return new Response(JSON.stringify(responseData), {
  status: 200,
  headers: {
    'Set-Cookie': cookieAttributes,
    'Access-Control-Allow-Credentials': 'true',
    // ...
  }
});
```

**状態**: ✅ 実装完了

#### `/api/auth/roles.ts` (行44-97)
**責務**: JWT Cookie を検証し、ユーザー情報+ロールを返す

**実装内容**:
```typescript
// JWT 認証
const auth = await requireAuth(request);

if (!auth) {
  return jsonError('Unauthorized: JWT missing or invalid', 401, request);
}

// ロール情報を返す
return jsonSuccess({
  id: user.id,
  googleSub: user.googleSub,
  email: user.email,
  role: finalRole,
  workspaceId: payload.workspaceId,
  // ...
}, 200, request);
```

**状態**: ✅ 実装完了（タイムアウト対策済み）

#### `/api/_lib/middleware.ts` (行95-154)
**責務**: JWT 検証ミドルウェア

**実装内容**:
```typescript
// 1. Authorization ヘッダー → Cookie (fdc_jwt) の順で JWT 取得
const token = getTokenFromRequest(request);

// 2. JWT 検証
const payload = verifyJWT(token);

// 3. DB からユーザー情報取得
const user = await getUserById(payload.userId);

// 4. RLS セッション変数設定
await setRLSUserId(payload.userId);
```

**状態**: ✅ 実装完了（詳細ログ出力あり）

---

### クライアントサイド（フロントエンド）

#### `js/main.ts` - Google ログイン処理 (行740-787)
**実装内容**:
```typescript
signInWithGoogle(
  async (googleUser: GoogleUserInfo) => {
    const accessToken = getAccessToken();
    
    // サーバーに Access Token を送信
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // Cookie を含める
      body: JSON.stringify({ accessToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server authentication successful:', data);
    }
    
    // アプリのロックを解除
    await unlockApp();
  }
);
```

**状態**: ✅ `credentials: 'include'` 設定済み

#### `js/main.ts` - unlockApp() (行344-381)
**責務**: 認証ガードを非表示にし、Dashboard を表示

**実装内容**:
```typescript
async function unlockApp(): Promise<void> {
  console.log('🔓 [Phase 6-A-2] Unlocking app...');
  
  // サーバーからユーザー情報+ロールを取得
  const serverUser = await getCurrentUser(); // → fetchCurrentUserWithRole()
  
  if (serverUser) {
    // APP_STATE.currentUser にセット
    APP_STATE.currentUser = serverUser;
  }
  
  // 認証ガードを非表示
  hideAuthGuard();
  
  // タブ表示を更新
  updateTabVisibility();
  
  // Dashboard タブに切り替え
  await switchTab('dashboard');
}
```

**問題点**: `getCurrentUser()` (→ `fetchCurrentUserWithRole()`) が**タイムアウト**している

#### `js/core/apiClient.ts` - fetchCurrentUserWithRole() (行366-411)
**実装内容**:
```typescript
export async function fetchCurrentUserWithRole() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒タイムアウト
  
  const response = await fetch('/api/auth/roles', {
    method: 'GET',
    credentials: 'include',
    signal: controller.signal
  });
  
  // ...
}
```

**問題**: **5秒後にタイムアウト** → `null` を返す → `unlockApp()` が完了しない？

---

## 🔍 問題の原因（推測）

### 可能性1: JWT Cookie が保存されていない

**原因**:
- `/api/auth/google` のレスポンスで `Set-Cookie` ヘッダーが送られていない
- または、CORS 設定で Cookie が拒否されている

**確認方法**:
- ブラウザ開発者ツール → Network タブ
- `/api/auth/google` のレスポンスヘッダーに `Set-Cookie: fdc_jwt=...` があるか確認

### 可能性2: JWT Cookie が送信されていない

**原因**:
- ブラウザが Cookie を保存しても、`/api/auth/roles` に送信していない
- Same-Site 制約や Domain 不一致

**確認方法**:
- ブラウザ開発者ツール → Application タブ → Cookies
- `fdc_jwt` が保存されているか確認
- Network タブで `/api/auth/roles` のリクエストヘッダーに `Cookie: fdc_jwt=...` があるか確認

### 可能性3: サーバー側で DB 接続がハング

**原因**:
- `getUserById()` または `setRLSUserId()` で Supabase 接続がタイムアウト
- 環境変数 `DATABASE_URL` の問題

**確認方法**:
- Vercel のログで middleware.ts のログを確認
- どのステップで止まっているか（Step 1, 2, 3, 4）

### 可能性4: unlockApp() の後続処理が失敗

**原因**:
- `fetchCurrentUserWithRole()` がタイムアウトで `null` を返す
- `serverUser` が `null` のまま処理が続く
- しかし `hideAuthGuard()` は呼ばれない？

**確認方法**:
- コンソールログで `unlockApp()` 内のログを確認

---

## 🛠️ 実施済みの修正

### Phase 9-7: 認証バグ修正（タイムアウト・404 エラー解消）
- ✅ `parseJwtFromRequest()` を `auth.ts` に追加
- ✅ `/api/auth/roles` のタイムアウト対策（try-catch）
- ✅ `/api/me` を廃止、`getCurrentUser()` を `fetchCurrentUserWithRole()` にリダイレクト
- ✅ `serverUser.userId` → `serverUser.id` に修正

### Phase 9-7b: 認証ガード初期表示の修正
- ✅ `#auth-guard-overlay` の初期値を `display: block` に変更
- ✅ `.main-app` の初期値を `display: none` に変更

### Phase 9-7c: 初回アクセス時のタイムアウト修正
- ✅ localStorage に認証情報がある場合のみ `/api/auth/roles` を呼ぶ
- ✅ タイムアウト時に localStorage をクリア

### Phase 9-7d: タイムアウト短縮
- ✅ `/api/auth/roles` のタイムアウトを 30秒 → 5秒 に短縮

---

## 🌍 環境変数（Vercel）

すべて設定済み:
- ✅ `APP_ENV="production"`
- ✅ `DATABASE_URL="postgresql://postgres:...@db.xxx.supabase.co:5432/postgres"`
- ✅ `GOOGLE_CLIENT_ID="xxx-xxx.apps.googleusercontent.com"`
- ✅ `GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxx"`
- ✅ `JWT_SECRET="xxxxxxxxxxxxxxxxxxxxxx"`
- ✅ `MASTER_ENCRYPTION_KEY="xxxxxxxxxxxxxxxxxxxxxx"`
- ✅ `NODE_ENV="production"`

---

## 🧪 デバッグに必要な情報

### ブラウザ開発者ツールで確認すべきこと

1. **Network タブ → `/api/auth/google` のレスポンス**
   - Status Code: 200 か？
   - Response Headers に `Set-Cookie: fdc_jwt=...` があるか？
   - Response Body に `{ success: true, data: { user: {...} } }` が含まれるか？

2. **Application タブ → Cookies**
   - `fdc_jwt` が保存されているか？
   - Domain, Path, Expires, HttpOnly, Secure, SameSite の値は？

3. **Network タブ → `/api/auth/roles` のリクエスト**
   - Request Headers に `Cookie: fdc_jwt=...` があるか？
   - Status Code: 401? 500? タイムアウト?

4. **Console タブ**
   - `unlockApp()` が呼ばれているか？
   - `hideAuthGuard()` が呼ばれているか？
   - エラーメッセージは？

### Vercel ログで確認すべきこと

1. **`/api/auth/google` のログ**
   ```
   [POST /api/auth/google] Access Token received, verifying...
   [POST /api/auth/google] Access Token verified: xxx@gmail.com
   [POST /api/auth/google] User authenticated: xxx@gmail.com (role: aifcc_admin)
   [POST /api/auth/google] Workspace assigned: xxx, role: owner
   ```

2. **`/api/auth/roles` のログ**
   ```
   [GET /api/auth/roles] Starting authentication...
   [middleware.ts] Step 1: Getting token from request
   [middleware.ts] Step 2: Verifying JWT - elapsed: Xms
   [middleware.ts] Step 3: Getting user from DB (userId: xxx) - elapsed: Xms
   [middleware.ts] Step 4: Setting RLS - elapsed: Xms
   [middleware.ts] ✅ Authentication successful - total elapsed: Xms
   [GET /api/auth/roles] ✅ Role info retrieved: xxx@gmail.com (role: EXEC)
   ```

   **どこで止まっているか確認**:
   - Step 1 で止まる → JWT が取得できていない
   - Step 2 で止まる → JWT 検証に失敗
   - Step 3 で止まる → DB 接続がハング
   - Step 4 で止まる → RLS 設定がハング

---

## 💡 次のステップ（提案）

### 即座に試せること

1. **ブラウザの localStorage をクリア**
   ```javascript
   // コンソールで実行
   localStorage.clear();
   location.reload();
   ```

2. **ブラウザの Cookie をクリア**
   - Application タブ → Cookies → すべて削除

3. **シークレットモードで再テスト**

### コード側の対策案

1. **`unlockApp()` を修正して、`fetchCurrentUserWithRole()` が失敗しても進む**
   ```typescript
   async function unlockApp() {
     try {
       const serverUser = await fetchCurrentUserWithRole();
       if (serverUser) {
         APP_STATE.currentUser = serverUser;
       }
     } catch (error) {
       console.warn('Failed to fetch server user, proceeding anyway');
     }
     
     // 必ず実行
     hideAuthGuard();
     updateTabVisibility();
     await switchTab('dashboard');
   }
   ```

2. **`/api/auth/google` の直後に `unlockApp()` を呼ばず、まず Cookie を確認**
   ```typescript
   const response = await fetch('/api/auth/google', {
     method: 'POST',
     credentials: 'include',
     body: JSON.stringify({ accessToken })
   });
   
   if (response.ok) {
     // Cookie が設定されるまで少し待つ
     await new Promise(resolve => setTimeout(resolve, 100));
     
     // JWT セッションを確認
     const currentUser = await fetchCurrentUserWithRole();
     if (currentUser) {
       APP_STATE.currentUser = currentUser;
       await unlockApp();
     } else {
       console.error('JWT session not established');
     }
   }
   ```

3. **詳細ログ追加**
   - `unlockApp()` の各ステップでログ出力
   - `hideAuthGuard()` が呼ばれているか確認

---

## 📊 まとめ

**現在の状況**:
- Google ログインは成功している
- しかし、`/api/auth/roles` がタイムアウト（5秒）
- `unlockApp()` が完了せず、画面が変わらない

**最も可能性の高い原因**:
1. `/api/auth/google` で JWT Cookie が正しく設定されていない
2. または、Cookie は設定されているが `/api/auth/roles` に送信されていない
3. または、サーバー側（middleware.ts）で DB 接続がハング

**解決のための優先順位**:
1. 【最優先】ブラウザ開発者ツールで Cookie の状態を確認
2. 【重要】Vercel ログで `/api/auth/google` と `/api/auth/roles` のログを確認
3. 【対策】`unlockApp()` を修正して、エラー時も進むようにする
