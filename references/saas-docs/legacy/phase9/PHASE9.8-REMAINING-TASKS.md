# Phase 9.8 残務タスク一覧（2025-01-24 時点）

**作成日:** 2025-01-24
**現在の進捗:** 60%完了
**Phase 9.8 完了目標:** Phase 10 移行前
**参照:** `DOCS/PHASE9.8-RUNBOOK.md`

---

## 📊 Phase 9.8 進捗サマリー

| サブフェーズ | 進捗 | 状態 | 完了日 |
|-------------|------|------|--------|
| **Phase 9.8-A** (データ基盤) | 50% | 🟡 部分完了 | - |
| **Phase 9.8-B** (AI基盤) | 100% | 🟢 完了 | 2025-01-24 |
| **Phase 9.8-C** (ガバナンス) | 30% | 🟡 部分完了 | - |
| **総合** | **60%** | 🟡 **部分完了** | - |

---

## 🔴 Phase 9.8-A: データ基盤強化（残タスク 50%）

### ✅ 完了済み項目

1. **DB マイグレーション完了**
   - `workspace_data` テーブルに `version` カラム追加
   - マイグレーションファイル: `migrations/010-add-version-column.sql`
   - 実行完了日: 2025-01-24

2. **P95 計測スクリプト実行完了**
   - スクリプト: `scripts/measure-p95.ts`
   - 結果: `workspace_data` にデータなし（正常）
   - 実行完了日: 2025-01-24

3. **DB接続二重化**
   - Transaction Pooler (API用): `DATABASE_URL`
   - Direct Connection (マイグレーション用): `DIRECT_DATABASE_URL`
   - 完了日: Phase 9

---

### 🔴 残タスク（Phase 9.8-A）

#### **BR-01: 楽観的排他制御（Optimistic Locking）- API実装**

**目的:** マルチデバイスでの同時編集時の競合を防止

**現状:**
- ✅ DB側: `version` カラム追加完了
- ❌ API側: CAS（Compare-And-Swap）更新処理未実装

**実装内容:**
```typescript
// api/workspaces/[workspaceId]/data.ts

// PUT /api/workspaces/:workspaceId/data
// リクエスト
{
  "workspaceData": { ... },
  "version": 1  // ← クライアントが保持しているバージョン
}

// 実装すべきロジック
const result = await sql`
  UPDATE workspace_data
  SET data = ${encryptedData}, version = version + 1, last_modified = NOW()
  WHERE workspace_id = ${workspaceId} AND version = ${expectedVersion}
`;

if (result.rowCount === 0) {
  // 競合発生 → 409 Conflict
  return res.status(409).json({
    error: 'Conflict detected',
    currentVersion: await getCurrentVersion(workspaceId)
  });
}

// 成功 → 200 OK
return res.status(200).json({
  success: true,
  newVersion: expectedVersion + 1
});
```

**関連ファイル:**
- `api/workspaces/[workspaceId]/data.ts` - PUT エンドポイント修正
- `js/core/apiClient.ts` - リクエストに `version` 追加
- `js/core/state.ts` - `appData` に `version` フィールド追加

**DOD:**
- [ ] API が `version` パラメータを受け取る
- [ ] CAS 更新処理実装（`WHERE version = ?`）
- [ ] 競合時に 409 Conflict を返却
- [ ] 成功時に新しい `version` を返却
- [ ] TypeScript 型チェック Pass

**工数見積:** 4時間

---

#### **BR-02: データ圧縮（Compression）**

**目的:** 250KB制限の実質緩和（目標: 125KB）

**現状:**
- ❌ 圧縮ライブラリ未実装
- ❌ 既存データとの互換性処理なし

**実装内容:**

1. **圧縮ライブラリ作成**
   ```typescript
   // lib/core/compression.ts

   export async function compress(data: string): Promise<Uint8Array> {
     const encoder = new TextEncoder();
     const stream = new CompressionStream('gzip');
     const writer = stream.writable.getWriter();
     writer.write(encoder.encode(data));
     writer.close();

     const chunks: Uint8Array[] = [];
     const reader = stream.readable.getReader();
     while (true) {
       const { done, value } = await reader.read();
       if (done) break;
       chunks.push(value);
     }

     // Uint8Array を結合
     const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
     const result = new Uint8Array(totalLength);
     let offset = 0;
     for (const chunk of chunks) {
       result.set(chunk, offset);
       offset += chunk.length;
     }

     return result;
   }

   export async function decompress(data: Uint8Array): Promise<string> {
     const stream = new DecompressionStream('gzip');
     const writer = stream.writable.getWriter();
     writer.write(data);
     writer.close();

     const chunks: Uint8Array[] = [];
     const reader = stream.readable.getReader();
     while (true) {
       const { done, value } = await reader.read();
       if (done) break;
       chunks.push(value);
     }

     const decoder = new TextDecoder();
     return decoder.decode(
       new Uint8Array(chunks.flatMap(chunk => Array.from(chunk)))
     );
   }
   ```

2. **保存フロー統合**
   ```typescript
   // js/core/storage.ts

   export async function saveData(data: AppData): Promise<void> {
     const jsonString = JSON.stringify(data);

     // 1. Minify
     const minified = jsonString;

     // 2. Compress
     const compressed = await compress(minified);

     // 3. Encrypt
     const encrypted = await encrypt(compressed);

     // 4. Save to DB
     await apiClient.put(`/api/workspaces/${workspaceId}/data`, {
       data: encrypted,
       compressed: true,  // ← フラグ追加
       version: data.version
     });
   }
   ```

3. **読み込みフロー互換性**
   ```typescript
   // js/core/storage.ts

   export async function loadData(): Promise<AppData> {
     const response = await apiClient.get(`/api/workspaces/${workspaceId}/data`);

     // 1. Decrypt
     const decrypted = await decrypt(response.data);

     // 2. Decompress (if compressed)
     let jsonString: string;
     if (response.compressed) {
       jsonString = await decompress(decrypted);
     } else {
       // 既存データ（非圧縮）との互換性
       jsonString = new TextDecoder().decode(decrypted);
     }

     // 3. Parse
     return JSON.parse(jsonString);
   }
   ```

**関連ファイル:**
- `lib/core/compression.ts` - 新規作成
- `js/core/storage.ts` - 圧縮統合
- `api/workspaces/[workspaceId]/data.ts` - `compressed` フラグ処理
- DB: `workspace_data` テーブルに `compressed` カラム追加検討

**DOD:**
- [ ] `lib/core/compression.ts` 作成
- [ ] 保存時の圧縮処理実装
- [ ] 読込時の解凍処理実装
- [ ] 既存データ（非圧縮）との互換性確認
- [ ] 圧縮率測定（目標: 50%削減）
- [ ] 性能測定（P95 < 100ms 保存時、P95 < 80ms 読込時）
- [ ] TypeScript 型チェック Pass

**工数見積:** 6時間

---

#### **BR-03: sanitizeAppData（データバリデーション）**

**目的:** 破損JSONでもUI表示成功

**現状:**
- ❌ Zod バリデーション未実装
- ❌ デフォルト値埋めロジックなし

**実装内容:**

```typescript
// lib/core/validator.ts

import { z } from 'zod';

// AppData のスキーマ定義
const AppDataSchema = z.object({
  workspaceId: z.string(),
  mvv: z.object({
    vision: z.string().default(''),
    mission: z.string().default(''),
    values: z.array(z.string()).default([])
  }).default({}),
  okr: z.object({
    objectives: z.array(z.any()).default([])
  }).default({}),
  leads: z.array(z.any()).default([]),
  clients: z.array(z.any()).default([]),
  todos: z.array(z.any()).default([]),
  // ... 他のフィールド
  version: z.number().default(1)
});

export function sanitizeAppData(data: unknown): AppData {
  try {
    // Zod でバリデーション + デフォルト値埋め
    return AppDataSchema.parse(data);
  } catch (error) {
    console.warn('[validator] Data sanitization applied:', error);

    // 部分的な復元を試みる
    const partial = AppDataSchema.partial().parse(data);

    // 完全なデフォルト値で埋める
    return AppDataSchema.parse({
      workspaceId: partial.workspaceId || 'unknown',
      ...partial
    });
  }
}
```

**関連ファイル:**
- `lib/core/validator.ts` - 新規作成
- `js/core/storage.ts` - `loadData()` で `sanitizeAppData()` 呼び出し
- `package.json` - `zod` 依存関係追加

**DOD:**
- [ ] `lib/core/validator.ts` 作成
- [ ] Zod スキーマ定義完了
- [ ] `sanitizeAppData()` 実装
- [ ] 破損JSONテストケース作成
- [ ] UI クラッシュしないことを確認
- [ ] TypeScript 型チェック Pass

**工数見積:** 4時間

---

#### **BR-06: Conflict Recovery UI（競合解決UI）**

**目的:** 競合発生時にユーザーが解決策を選択できる

**依存:** BR-01（楽観的ロック API）完了後に実装

**実装内容:**

```typescript
// js/components/ConflictModal.ts

export function showConflictModal(currentVersion: number): Promise<'reload' | 'overwrite'> {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'conflict-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h2>⚠️ データの競合が検出されました</h2>
          <p>別のデバイスまたはユーザーがこのワークスペースを更新しました。</p>
          <p>どちらの操作を行いますか？</p>

          <div class="modal-actions">
            <button id="conflict-reload" class="btn btn-primary">
              🔄 最新データを読み込む（推奨）
            </button>
            <button id="conflict-overwrite" class="btn btn-danger">
              ⚠️ 自分の変更で上書き
            </button>
          </div>

          <p class="modal-warning">
            ⚠️ 上書きすると、他のユーザーの変更が失われます。
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // イベントリスナー
    document.getElementById('conflict-reload')!.addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve('reload');
    });

    document.getElementById('conflict-overwrite')!.addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve('overwrite');
    });
  });
}
```

```typescript
// js/core/storage.ts

export async function saveData(data: AppData): Promise<void> {
  try {
    // ... 圧縮・暗号化処理

    const response = await apiClient.put(`/api/workspaces/${workspaceId}/data`, {
      data: encrypted,
      version: data.version
    });

    if (response.status === 200) {
      // 成功
      state.appData.version = response.data.newVersion;
    }
  } catch (error) {
    if (error.status === 409) {
      // 競合発生
      const action = await showConflictModal(error.data.currentVersion);

      if (action === 'reload') {
        // 最新データを読み込み
        await loadData();
        alert('最新データを読み込みました。変更内容は失われました。');
      } else {
        // 強制上書き
        data.version = error.data.currentVersion;
        await saveData(data); // 再試行
      }
    } else {
      throw error;
    }
  }
}
```

**関連ファイル:**
- `js/components/ConflictModal.ts` - 新規作成
- `js/core/storage.ts` - 競合処理追加
- `css/conflict-modal.css` - モーダルスタイル

**DOD:**
- [ ] ConflictModal コンポーネント作成
- [ ] 409 エラー時にモーダル表示
- [ ] 「リロード」選択時の動作確認
- [ ] 「上書き」選択時の動作確認
- [ ] UI/UX テスト（2デバイスで同時編集）

**工数見積:** 3時間

---

#### **BR-07: Client Versioning（クライアントバージョン管理）**

**目的:** デプロイ時の不整合回避

**現状:**
- ❌ バージョン不一致検知なし
- ❌ 自動リロード機構なし

**実装内容:**

```typescript
// js/core/version.ts

export const APP_VERSION = '2.8.0'; // package.json から自動取得

export async function checkVersionCompatibility(): Promise<boolean> {
  try {
    const response = await fetch('/api/version');
    const serverVersion = response.headers.get('X-App-Version');

    if (serverVersion && serverVersion !== APP_VERSION) {
      console.warn(`Version mismatch: Client=${APP_VERSION}, Server=${serverVersion}`);

      // 自動リロード
      if (confirm('新しいバージョンが利用可能です。ページをリロードしますか？')) {
        window.location.reload();
      }

      return false;
    }

    return true;
  } catch (error) {
    console.error('Version check failed:', error);
    return true; // エラー時は続行
  }
}
```

```typescript
// api/version.ts

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-App-Version', process.env.APP_VERSION || '2.8.0');
  res.status(200).json({ version: process.env.APP_VERSION });
}
```

```typescript
// js/main.ts

async function init() {
  // バージョンチェック
  const isCompatible = await checkVersionCompatibility();
  if (!isCompatible) {
    return; // リロード待ち
  }

  // アプリ初期化
  // ...
}
```

**関連ファイル:**
- `js/core/version.ts` - 新規作成
- `api/version.ts` - 新規作成
- `js/main.ts` - 初期化時にバージョンチェック追加
- `.env` - `APP_VERSION` 環境変数追加

**DOD:**
- [ ] `js/core/version.ts` 作成
- [ ] `api/version.ts` 作成
- [ ] バージョン不一致時にリロード確認
- [ ] API リクエストヘッダーに `X-App-Version` 追加
- [ ] デプロイテスト（バージョン変更時の動作確認）

**工数見積:** 2時間

---

#### **BR-08: Perf Monitor（性能監視）**

**目的:** 圧縮・暗号化時間の計測とログ出力

**依存:** BR-02（データ圧縮）完了後に実装

**実装内容:**

```typescript
// lib/core/perf-monitor.ts

interface PerfStats {
  operation: string;
  duration: number;
  dataSize?: number;
  timestamp: number;
}

class PerfMonitor {
  private stats: PerfStats[] = [];

  start(operation: string): () => PerfStats {
    const startTime = performance.now();

    return (dataSize?: number) => {
      const duration = performance.now() - startTime;
      const stat: PerfStats = {
        operation,
        duration,
        dataSize,
        timestamp: Date.now()
      };

      this.stats.push(stat);
      console.log(`[PerfMonitor] ${operation}: ${duration.toFixed(2)}ms`, dataSize ? `(${dataSize} bytes)` : '');

      return stat;
    };
  }

  getStats(): PerfStats[] {
    return this.stats;
  }

  calculateP95(operation: string): number {
    const filtered = this.stats.filter(s => s.operation === operation);
    if (filtered.length === 0) return 0;

    const sorted = filtered.map(s => s.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    return sorted[p95Index];
  }
}

export const perfMonitor = new PerfMonitor();
```

```typescript
// js/core/storage.ts

export async function saveData(data: AppData): Promise<void> {
  const endCompress = perfMonitor.start('compression');
  const compressed = await compress(JSON.stringify(data));
  endCompress(compressed.length);

  const endEncrypt = perfMonitor.start('encryption');
  const encrypted = await encrypt(compressed);
  endEncrypt(encrypted.length);

  const endSave = perfMonitor.start('api-save');
  await apiClient.put(`/api/workspaces/${workspaceId}/data`, {
    data: encrypted,
    version: data.version
  });
  endSave();

  // P95 計測（開発モードのみ）
  if (isDevelopment) {
    console.log('P95 Compression:', perfMonitor.calculateP95('compression'), 'ms');
    console.log('P95 Encryption:', perfMonitor.calculateP95('encryption'), 'ms');
    console.log('P95 API Save:', perfMonitor.calculateP95('api-save'), 'ms');
  }
}
```

**関連ファイル:**
- `lib/core/perf-monitor.ts` - 新規作成
- `js/core/storage.ts` - 計測処理追加
- `js/core/apiClient.ts` - API処理時間計測

**DOD:**
- [ ] `lib/core/perf-monitor.ts` 作成
- [ ] 圧縮・暗号化時間の計測実装
- [ ] コンソールへのログ出力確認
- [ ] P95 計算ロジック実装
- [ ] Performance Specification v1.1 の目標値達成確認

**工数見積:** 3時間

---

### 📊 Phase 9.8-A 残タスク工数見積

| タスクID | タスク名 | 工数 | 優先度 | 依存関係 |
|---------|---------|------|--------|---------|
| BR-01 | 楽観的排他制御 API | 4h | 🔴 High | なし |
| BR-02 | データ圧縮 | 6h | 🔴 High | なし |
| BR-03 | sanitizeAppData | 4h | 🟡 Medium | なし |
| BR-06 | Conflict UI | 3h | 🔴 High | BR-01 |
| BR-07 | Client Versioning | 2h | 🟡 Medium | なし |
| BR-08 | Perf Monitor | 3h | 🟡 Medium | BR-02 |
| **合計** | | **22h** | | |

**推奨実装順序:**
1. BR-01（楽観的ロック API）→ BR-06（Conflict UI）
2. BR-02（データ圧縮）→ BR-08（Perf Monitor）
3. BR-03（Validator）
4. BR-07（Client Versioning）

---

## 🔴 Phase 9.8-C: ガバナンス & 管理ツール（残タスク 70%）

### ✅ 完了済み項目

1. **Admin Seed スクリプト作成**
   - スクリプト: `scripts/seed-admin.ts`
   - 対象ユーザー: `admin@example.com`
   - 実行タイミング: 初回ログイン後
   - 完了日: 2025-01-24

---

### 🔴 残タスク（Phase 9.8-C）

#### **GOV-01: Super Admin Mode（管理者ダッシュボード）**

**目的:** システム全体の監視・管理

**現状:**
- ✅ Seed スクリプト完成
- ❌ UI未実装

**実装内容:**

1. **ページ作成**
   ```typescript
   // app/(app)/admin/system/page.tsx

   export default async function AdminSystemPage() {
     // 管理者権限チェック
     const user = await getCurrentUser();
     if (user.globalRole !== 'aifcc_admin') {
       return <div>Access Denied</div>;
     }

     // 全ワークスペース取得
     const workspaces = await getAllWorkspaces();

     // ユーザー統計
     const userStats = await getUserStats();

     return (
       <div className="admin-dashboard">
         <h1>システム管理ダッシュボード</h1>

         <div className="stats-grid">
           <StatCard title="総ユーザー数" value={userStats.totalUsers} />
           <StatCard title="総ワークスペース数" value={workspaces.length} />
           <StatCard title="アクティブセッション" value={userStats.activeSessions} />
           <StatCard title="AI リクエスト数（今日）" value={userStats.aiRequests} />
         </div>

         <section>
           <h2>ワークスペース一覧</h2>
           <table>
             <thead>
               <tr>
                 <th>Workspace ID</th>
                 <th>名前</th>
                 <th>メンバー数</th>
                 <th>データサイズ</th>
                 <th>最終更新</th>
                 <th>操作</th>
               </tr>
             </thead>
             <tbody>
               {workspaces.map(ws => (
                 <tr key={ws.id}>
                   <td>{ws.id}</td>
                   <td>{ws.name}</td>
                   <td>{ws.memberCount}</td>
                   <td>{formatSize(ws.dataSize)}</td>
                   <td>{formatDate(ws.lastModified)}</td>
                   <td>
                     <button onClick={() => viewWorkspace(ws.id)}>詳細</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </section>
       </div>
     );
   }
   ```

2. **Middleware で権限チェック**
   ```typescript
   // middleware.ts

   export function middleware(req: NextRequest) {
     const path = req.nextUrl.pathname;

     if (path.startsWith('/admin/system')) {
       const user = await getCurrentUser(req);

       if (!user || user.globalRole !== 'aifcc_admin') {
         return NextResponse.redirect(new URL('/dashboard', req.url));
       }
     }

     return NextResponse.next();
   }
   ```

**関連ファイル:**
- `app/(app)/admin/system/page.tsx` - 新規作成
- `app/api/admin/workspaces/route.ts` - 全WS取得API
- `app/api/admin/stats/route.ts` - 統計情報API
- `middleware.ts` - 権限チェック追加

**DOD:**
- [ ] Admin ダッシュボードページ作成
- [ ] 全ワークスペース一覧表示
- [ ] ユーザー統計表示
- [ ] 管理者以外のアクセス拒否確認
- [ ] UI/UX テスト

**工数見積:** 6時間

---

#### **GOV-02: Role UI（ロール別招待UI）**

**目的:** メンバー招待時のロール説明・選択

**現状:**
- ✅ RBAC 基盤完成（Phase 7）
- ❌ 招待UIにロール説明なし

**実装内容:**

```typescript
// app/(app)/settings/members/InviteMemberModal.tsx

const ROLE_DESCRIPTIONS = {
  EXEC: {
    label: 'エグゼクティブ',
    description: '全機能アクセス可能。クロスワークスペース集計、全メンバー管理権限。',
    permissions: ['すべてのデータ閲覧・編集', 'メンバー管理', 'ワークスペース設定変更', 'レポート出力']
  },
  MANAGER: {
    label: 'マネージャー',
    description: '自チームのデータ管理。メンバー招待・削除可能。',
    permissions: ['チームデータ閲覧・編集', 'メンバー招待', 'レポート閲覧']
  },
  MEMBER: {
    label: 'メンバー',
    description: '自分のタスク・リード・クライアントのみ管理。',
    permissions: ['自分のデータ閲覧・編集', '個人レポート閲覧']
  }
};

export function InviteMemberModal({ onClose, onInvite }: Props) {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'EXEC' | 'MANAGER' | 'MEMBER'>('MEMBER');

  return (
    <div className="modal">
      <h2>メンバーを招待</h2>

      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <div className="role-selector">
        <h3>ロールを選択</h3>
        {Object.entries(ROLE_DESCRIPTIONS).map(([role, info]) => (
          <label key={role} className="role-option">
            <input
              type="radio"
              name="role"
              value={role}
              checked={selectedRole === role}
              onChange={() => setSelectedRole(role as any)}
            />
            <div className="role-info">
              <strong>{info.label}</strong>
              <p>{info.description}</p>
              <ul>
                {info.permissions.map(perm => (
                  <li key={perm}>✓ {perm}</li>
                ))}
              </ul>
            </div>
          </label>
        ))}
      </div>

      <button onClick={() => onInvite(email, selectedRole)}>
        招待する
      </button>
    </div>
  );
}
```

**関連ファイル:**
- `app/(app)/settings/members/InviteMemberModal.tsx` - 新規作成
- `app/(app)/settings/members/page.tsx` - モーダル統合
- `css/role-selector.css` - スタイル

**DOD:**
- [ ] InviteMemberModal コンポーネント作成
- [ ] ロール説明表示
- [ ] ロール選択UI実装
- [ ] 招待API呼び出し
- [ ] UI/UX テスト

**工数見積:** 4時間

---

#### **GOV-03: Security Settings（セキュリティ設定画面）**

**目的:** AI ON/OFF、暗号化表示、鍵ローテーション

**現状:**
- ❌ 設定画面未実装
- ❌ AI有効化トグルなし

**実装内容:**

```typescript
// app/(app)/settings/security/page.tsx

export default async function SecuritySettingsPage() {
  const workspace = await getCurrentWorkspace();

  return (
    <div className="security-settings">
      <h1>セキュリティ設定</h1>

      {/* AI 設定 */}
      <section className="setting-section">
        <h2>AI 機能</h2>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={workspace.aiEnabled}
              onChange={e => updateAISetting(e.target.checked)}
            />
            AI チャット機能を有効化
          </label>
          <p className="setting-description">
            有効にすると、ビジネスデータを AI に送信して分析・提案を受け取れます。
            PII（個人情報）は自動的に除外されます。
          </p>
        </div>

        {workspace.aiEnabled && (
          <div className="setting-detail">
            <p>✓ PII 自動除外（メール・電話番号）</p>
            <p>✓ 個人名マスキング（例: "田中太郎" → "T***"）</p>
            <p>✓ レート制限: 5リクエスト/分</p>
            <p>✓ 全リクエストを監査ログに記録</p>
          </div>
        )}
      </section>

      {/* 暗号化情報 */}
      <section className="setting-section">
        <h2>データ暗号化</h2>
        <div className="info-display">
          <p><strong>暗号化アルゴリズム:</strong> AES-256-GCM</p>
          <p><strong>暗号化強度:</strong> 最高 🔒</p>
          <p><strong>鍵管理:</strong> ワークスペース専用鍵</p>
          <p className="note">
            ⚠️ 暗号化設定は変更できません。最高レベルのセキュリティで保護されています。
          </p>
        </div>
      </section>

      {/* 鍵ローテーション */}
      <section className="setting-section">
        <h2>暗号化鍵の管理</h2>
        <div className="setting-item">
          <button
            className="btn btn-warning"
            onClick={() => rotateEncryptionKey()}
          >
            🔄 暗号化鍵をローテーション
          </button>
          <p className="setting-description">
            ⚠️ セキュリティ強化のため、定期的に鍵をローテーションすることを推奨します。
            実行すると、すべてのデータが新しい鍵で再暗号化されます。
          </p>
          <p className="last-rotation">
            最終ローテーション: {formatDate(workspace.lastKeyRotation)}
          </p>
        </div>
      </section>
    </div>
  );
}
```

```typescript
// app/api/workspaces/[workspaceId]/settings/ai/route.ts

export async function PUT(req: NextRequest) {
  const { aiEnabled } = await req.json();
  const workspaceId = req.nextUrl.pathname.split('/')[3];

  // 権限チェック（EXEC/MANAGER のみ）
  await assertWorkspaceRole(workspaceId, ['EXEC', 'MANAGER']);

  // 更新
  await sql`
    UPDATE workspaces
    SET ai_enabled = ${aiEnabled}
    WHERE id = ${workspaceId}
  `;

  // 監査ログ
  await logAudit({
    workspaceId,
    action: 'ai_setting_changed',
    details: { aiEnabled }
  });

  return NextResponse.json({ success: true });
}
```

**関連ファイル:**
- `app/(app)/settings/security/page.tsx` - 新規作成
- `app/api/workspaces/[workspaceId]/settings/ai/route.ts` - AI設定API
- `app/api/workspaces/[workspaceId]/keys/rotate/route.ts` - 鍵ローテーションAPI
- DB: `workspaces` テーブルに `ai_enabled` カラム追加

**DOD:**
- [ ] Security Settings ページ作成
- [ ] AI 有効化トグル実装
- [ ] 暗号化情報表示
- [ ] 鍵ローテーションボタン実装
- [ ] 権限チェック（EXEC/MANAGER のみ）
- [ ] UI/UX テスト

**工数見積:** 5時間

---

### 📊 Phase 9.8-C 残タスク工数見積

| タスクID | タスク名 | 工数 | 優先度 | 依存関係 |
|---------|---------|------|--------|---------|
| GOV-01 | Admin Dashboard | 6h | 🟡 Medium | なし |
| GOV-02 | Role UI | 4h | 🟡 Medium | なし |
| GOV-03 | Security Settings | 5h | 🔴 High | なし |
| **合計** | | **15h** | | |

**推奨実装順序:**
1. GOV-03（Security Settings）- AI 有効化制御に必要
2. GOV-02（Role UI）- ユーザビリティ向上
3. GOV-01（Admin Dashboard）- 管理機能

---

## 📊 Phase 9.8 全体の残タスク工数

| サブフェーズ | 残タスク工数 | 優先度 |
|-------------|-------------|--------|
| Phase 9.8-A（データ基盤） | 22時間 | 🔴 High |
| Phase 9.8-C（ガバナンス） | 15時間 | 🟡 Medium |
| **合計** | **37時間** | |

**完了目標:** 2週間以内（1日3-4時間作業想定）

---

## 🎯 Phase 10 移行判定基準

### 必須条件（Phase 10 移行不可）

- [ ] **BR-01**: 楽観的排他制御 API 実装完了
- [ ] **BR-06**: Conflict Recovery UI 実装完了
- [ ] **GOV-03**: Security Settings 実装完了（AI ON/OFF制御）

### 推奨条件（Phase 10 並行実装可能）

- [ ] **BR-02**: データ圧縮実装完了
- [ ] **BR-03**: sanitizeAppData 実装完了
- [ ] **BR-07**: Client Versioning 実装完了
- [ ] **BR-08**: Perf Monitor 実装完了
- [ ] **GOV-01**: Admin Dashboard 実装完了
- [ ] **GOV-02**: Role UI 実装完了

### 移行判定

**条件付き移行可能（Phase 9.8 の実装状況: 60%）**

- ✅ AI 基盤は完全実装済み → Phase 10 で AI 機能活用可能
- ⚠️ データ基盤の楽観的ロック機構は残タスク → Phase 10 並行実装を推奨
- ⚠️ ガバナンス UI は残タスク → Phase 10 並行実装を推奨

**推奨アクション:**
1. **最優先**: BR-01（楽観的ロック）+ BR-06（Conflict UI）を完了
2. GOV-03（Security Settings）を完了し、AI 機能の制御を実装
3. Phase 10 へ移行し、残タスクを並行実装

---

## 📝 残務管理

### 進捗トラッキング

各タスクの進捗を以下の形式で記録してください：

```markdown
## [YYYY-MM-DD] タスクID: タスク名

**ステータス:** 🟡 進行中 / ✅ 完了 / ❌ ブロック

**実施内容:**
- 実装したコード
- テスト結果
- 発見した問題

**次のアクション:**
- 残作業
- 依存タスク

**工数実績:** Xh
```

### 完了報告テンプレート

```markdown
## Phase 9.8-A 完了報告

**完了日:** YYYY-MM-DD
**実装者:** [名前]

**完了タスク:**
- [x] BR-01: 楽観的排他制御
- [x] BR-02: データ圧縮
- [x] BR-03: sanitizeAppData
- [x] BR-06: Conflict UI
- [x] BR-07: Client Versioning
- [x] BR-08: Perf Monitor

**テスト結果:**
- TypeScript 型チェック: Pass
- E2E テスト: Pass
- 性能測定: P95 < 目標値

**Phase 10 移行判定:** ✅ 可能 / ⚠️ 条件付き / ❌ 不可
```

---

このドキュメントを参照しながら、Phase 9.8 の残務を計画的に完了させてください。
