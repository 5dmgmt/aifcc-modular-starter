# Phase 9.97 ランブック：権限整理 + 徹底バグ修正

> **目的**: 権限体系をシンプル化し、全バグを完全修正してPhase 10開始条件を満たす。
> **方針**: 権限整理を最初に行い、その後バグ修正。確認するまで完了しない。
> **実行方式**: 4段階の順次実行（権限→データ取得→データ保存→UI/SA）

## 1. 概要

### 1.1 Phase 9.97の位置づけ

| Phase | 内容 | 状態 |
|-------|------|------|
| 9.92 | React移行・型安全性 | ✅ 完了 |
| 9.93 | レガシー隔離・CI自動化 | ✅ 完了 |
| 9.94 | パフォーマンス・UX・品質基盤 | ✅ 完了 |
| 9.95 | バグ修正・機能復旧（第1弾） | ✅ 完了 |
| 9.96 | 残存バグ修正（第2弾） | ✅ 完了 |
| **9.97** | **権限整理 + 徹底バグ修正** | 🔄 進行中 |
| 10 | TODO機能（4象限 × Elastic） | 予定 |

### 1.2 タスク一覧（実行順）

| Step | 担当 | 内容 | 依存 |
|------|------|------|------|
| **Step 1** | WS-A | 権限体系のシンプル化 | なし |
| **Step 2** | WS-B | データ取得エラー修正 | Step 1 |
| **Step 3** | WS-C | データ保存ロジック修正 | Step 1 |
| **Step 4** | WS-D | UI/SA機能修正 | Step 1-3 |

### 1.3 バグ一覧（11項目）

| # | カテゴリ | 問題 | Step |
|---|----------|------|------|
| 0 | 権限 | 権限体系が複雑すぎる（3レイヤー12種類） | Step 1 |
| 1 | 表示速度 | ダッシュボード表示まで5秒 | Step 2 |
| 2 | 保存/UI | MVV保存失敗 + UI統一（閲覧/編集モード） | Step 3 |
| 3 | 保存/UI | ブランド指針保存 + UI統一（閲覧/編集モード） | Step 3 |
| 4 | 保存 | リーンキャンバス保存失敗 | Step 3 |
| 5 | 保存 | 見込み客追加失敗 | Step 3 |
| 6 | 取得 | 既存客管理データ取得エラー | Step 2 |
| 7 | 取得 | 失注管理データ取得エラー | Step 2 |
| 8 | UI | 設定タブ完了メッセージ削除 | Step 4 |
| 9 | 取得 | テンプレート集データ取得失敗 | Step 2 |
| 10 | SA | SAタブ表示・試用期間機能 | Step 4 |

---

## 2. Step 1: 権限体系のシンプル化（WS-A）

### 2.1 現状の問題

```
現状（複雑）: 3レイヤー × 12種類
┌─────────────────────────────────────────┐
│ globalRole: aifcc_admin / normal          │ ← システム権限
├─────────────────────────────────────────┤
│ workspaceRole: owner/admin/member/viewer│ ← WS権限（DB）
├─────────────────────────────────────────┤
│ UserRole: EXEC / MANAGER / MEMBER       │ ← 旧UI互換（コード内）
└─────────────────────────────────────────┘
```

### 2.2 新しい権限体系

```
新（シンプル）: 2レイヤー × 4種類
┌─────────────────────────────────────────┐
│ accountType: SA / USER                  │ ← システム権限
├─────────────────────────────────────────┤
│ role: OWNER / ADMIN / MEMBER            │ ← WS権限
└─────────────────────────────────────────┘
```

### 2.3 権限マトリクス（新）

| 権限 | 説明 | できること |
|------|------|-----------|
| **SA** | システム管理者 | 全WS閲覧、ユーザー管理、試用期間管理 |
| **OWNER** | WS所有者 | WS設定変更、メンバー招待/削除、全データ編集 |
| **ADMIN** | WS管理者 | メンバー招待、全データ編集 |
| **MEMBER** | WS一般 | 自分のデータ編集、閲覧 |

### 2.4 タブ別アクセス権限（新）

| タブ | SA | OWNER | ADMIN | MEMBER |
|------|:--:|:-----:|:-----:|:------:|
| ダッシュボード | ✅ | ✅ | ✅ | ✅ |
| MVV/ブランド/リーンキャンバス | ✅ | ✅ | ✅ | 👁 |
| 見込み客/既存客/失注 | ✅ | ✅ | ✅ | ✅ |
| テンプレート集 | ✅ | ✅ | ✅ | ✅ |
| レポート | ✅ | ✅ | ✅ | 👁 |
| 設定 | ✅ | ✅ | 👁 | ❌ |
| 管理者 | ✅ | ✅ | 👁 | ❌ |
| SAダッシュボード | ✅ | ❌ | ❌ | ❌ |

※ ✅=編集可, 👁=閲覧のみ, ❌=アクセス不可

### 2.5 移行マッピング

| 旧 | 新 | 備考 |
|----|-----|------|
| `globalRole: 'aifcc_admin'` | `accountType: 'SA'` | |
| `globalRole: 'normal'` | `accountType: 'USER'` | |
| `workspaceRole: 'owner'` | `role: 'OWNER'` | 大文字に統一 |
| `workspaceRole: 'admin'` | `role: 'ADMIN'` | |
| `workspaceRole: 'member'` | `role: 'MEMBER'` | |
| `workspaceRole: 'viewer'` | `role: 'MEMBER'` | MEMBERに統合 |
| `UserRole: 'EXEC'` | 削除 | OWNER/ADMINで代替 |
| `UserRole: 'MANAGER'` | 削除 | ADMINで代替 |
| `UserRole: 'MEMBER'` | 削除 | MEMBERで代替 |

### 2.6 DB変更

```sql
-- Step 1: users テーブル
-- global_role を account_type にリネーム & 値変更
ALTER TABLE users RENAME COLUMN global_role TO account_type;
UPDATE users SET account_type = 'SA' WHERE account_type = 'aifcc_admin';
UPDATE users SET account_type = 'USER' WHERE account_type = 'normal';

-- Step 2: workspace_members テーブル
-- viewer を MEMBER に統合 & 大文字に統一
UPDATE workspace_members SET role = 'MEMBER' WHERE role = 'viewer';
UPDATE workspace_members SET role = 'OWNER' WHERE role = 'owner';
UPDATE workspace_members SET role = 'ADMIN' WHERE role = 'admin';
UPDATE workspace_members SET role = 'MEMBER' WHERE role = 'member';
```

### 2.7 コード変更（対象ファイル）

**型定義**:
- `lib/types/database.ts` - globalRole → accountType
- `lib/types/app-data.ts` - UserRole 削除

**認証**:
- `lib/server/auth.ts` - globalRole → accountType
- `lib/hooks/useWorkspace.ts` - globalRole → accountType

**権限チェック（統一関数を作成）**:
```typescript
// lib/utils/permissions.ts（新規作成）
export type AccountType = 'SA' | 'USER' | 'TEST';  // Phase 9.97: 3値に統一
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export function isSA(accountType: string | null): boolean {
  return accountType === 'SA';
}

export function canEdit(role: WorkspaceRole | null): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}

export function canManageMembers(role: WorkspaceRole | null): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}

export function canAccessAdmin(role: WorkspaceRole | null, accountType: string | null): boolean {
  return isSA(accountType) || role === 'OWNER' || role === 'ADMIN';
}
```

**各ViewModel修正**:
- `lib/hooks/useReportsViewModel.ts` - UserRole削除、新権限チェック
- `lib/hooks/useAdminViewModel.ts` - 同上
- `lib/hooks/useSADashboardViewModel.ts` - accountType対応

---

## 3. Step 2: データ取得エラー修正（WS-B）

### 3.1 担当項目

| # | 問題 | 対象 |
|---|------|------|
| 1 | ダッシュボード表示5秒 | useDashboardViewModel.ts |
| 6 | 既存客管理エラー | useClientsViewModel.ts |
| 7 | 失注管理エラー | useLostDealsViewModel.ts |
| 9 | テンプレート集エラー | useTemplatesViewModel.ts |

### 3.2 共通問題の根本原因

1. `workspaceId` が null の状態でAPI呼び出し
2. `useWorkspace()` の loading 完了前に fetch 実行
3. エラーメッセージが不親切

### 3.3 修正パターン

```typescript
const { workspaceId, loading: workspaceLoading } = useWorkspace();

useEffect(() => {
  // workspaceId null または loading 中は何もしない
  if (workspaceLoading || !workspaceId) {
    return;
  }
  fetchData();
}, [workspaceId, workspaceLoading]);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/workspaces/${workspaceId}/data`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const { data } = await response.json();
    // データ処理...
  } catch (err) {
    console.error('[ViewModel] Fetch error:', err);
    setError(err instanceof Error ? err.message : '不明なエラー');
  } finally {
    setLoading(false);
  }
};
```

### 3.4 パフォーマンス改善（#1）

```typescript
// useDashboardViewModel.ts
// 複数APIを並列化
const [sessionData, workspaceData] = await Promise.all([
  fetch('/api/auth/session').then(r => r.json()),
  fetch(`/api/workspaces/${workspaceId}/data`).then(r => r.json()),
]);
```

---

## 4. Step 3: データ保存ロジック修正（WS-C）

### 4.1 担当項目

| # | 問題 | 対象 |
|---|------|------|
| 2 | MVV保存失敗 + UI統一 | useMVVOKRViewModel.ts, MVVTab.tsx |
| 3 | ブランド指針保存 + UI統一 | useBrandViewModel.ts, BrandTab.tsx |
| 4 | リーンキャンバス保存失敗 | useLeanCanvasViewModel.ts |
| 5 | 見込み客追加失敗 | useLeads.ts |

**UI統一（#2, #3）**: リーンキャンバスタブと同じUIパターンを適用
- メインヘッダーに「閲覧モード/編集モード」切り替えボタン
- 編集モード時はヘッダー右側に「保存」ボタンも表示
- 各セクションカード内の個別「編集」ボタンは廃止

### 4.2 共通問題の根本原因

PUT `/api/workspaces/:id/data` は楽観的排他制御を使用。
**version パラメータが必須** だが、一部で未送信。

### 4.3 修正パターン

```typescript
const saveData = async (fieldName: string, newValue: unknown) => {
  if (!workspaceId) {
    setError('ワークスペースが選択されていません');
    return;
  }

  try {
    setSaving(true);
    setError(null);

    // 1. 現在のデータとバージョンを取得
    const getResponse = await fetch(`/api/workspaces/${workspaceId}/data`, {
      credentials: 'include',
    });

    if (!getResponse.ok) {
      throw new Error(`データ取得失敗: HTTP ${getResponse.status}`);
    }

    const { data: currentData, version } = await getResponse.json();

    // 2. データを更新
    const updatedData = { ...currentData, [fieldName]: newValue };

    // 3. バージョン付きでPUT（必須！）
    const putResponse = await fetch(`/api/workspaces/${workspaceId}/data`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        data: updatedData,
        version,  // ← これが必須！
      }),
    });

    if (!putResponse.ok) {
      const errorData = await putResponse.json().catch(() => ({}));
      if (putResponse.status === 409) {
        throw new Error('他のユーザーが更新しました。再読み込みしてください。');
      }
      throw new Error(errorData.error || `保存失敗: HTTP ${putResponse.status}`);
    }

    alert('✅ 保存しました');
  } catch (err) {
    console.error('[ViewModel] Save error:', err);
    const message = err instanceof Error ? err.message : '保存に失敗しました';
    setError(message);
    alert('❌ ' + message);
  } finally {
    setSaving(false);
  }
};
```

### 4.4 MVVタブ・ブランド指針タブ UI統一（#2, #3）

リーンキャンバスタブと同じUIパターンを適用：
- メインヘッダーに「閲覧モード/編集モード」切り替えボタン
- 編集モード時はヘッダー右側に「保存」ボタンも表示
- セクションカード内の個別「編集」ボタンは廃止

**参考：リーンキャンバスタブのヘッダーパターン（LeanCanvasTab.tsx 46-85行目）**:
```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
  <div>
    <h2>タイトル</h2>
    <p>説明文</p>
  </div>
  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
    <button onClick={toggleEditMode} className="btn btn-secondary">
      {editMode ? <Eye /> : <Edit3 />}
      {editMode ? '表示モード' : '編集モード'}
    </button>
    {editMode && (
      <button onClick={save} disabled={saving} className="btn btn-primary">
        {saving ? '保存中...' : '保存'}
      </button>
    )}
  </div>
</div>
```

**MVVTab.tsx の修正内容**:
```tsx
// メインコンポーネントのヘッダー部分を修正
return (
  <div className="section">
    {/* メインヘッダー */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <div>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Target size={24} /> MVV・OKR
        </h2>
        <p style={{ margin: '5px 0 0 0', color: 'var(--text-light)' }}>
          Mission・Vision・Value と目標管理（OKR）を設定します。
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={toggleEditMode}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {editMode ? <Eye size={16} /> : <Edit3 size={16} />}
          {editMode ? '表示モード' : '編集モード'}
        </button>
        {editMode && (
          <button
            onClick={saveAll}
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        )}
      </div>
    </div>

    {/* MVV セクション（SectionCardからonEditを削除） */}
    <SectionCard title="MVV" icon={<Heart size={18} />}>
      {editMode ? <MVVEditSection ... /> : <MVVDisplaySection ... />}
    </SectionCard>

    {/* OKR セクション（SectionCardからonEditを削除） */}
    <SectionCard title="OKR" icon={<TrendingUp size={18} />}>
      {editMode ? <OKREditSection ... /> : <OKRDisplaySection ... />}
    </SectionCard>
  </div>
);
```

**BrandTab.tsx の修正内容**:
```tsx
// メインコンポーネントのヘッダー部分を修正
return (
  <div className="section">
    {/* メインヘッダー */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <div>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Gem size={24} /> ブランド指針
        </h2>
        <p style={{ margin: '5px 0 0 0', color: 'var(--text-light)' }}>
          プロフィールとブランドガイドラインを設定します。
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={toggleEditMode}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {editMode ? <Eye size={16} /> : <Edit3 size={16} />}
          {editMode ? '表示モード' : '編集モード'}
        </button>
        {editMode && (
          <button
            onClick={saveAll}
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        )}
      </div>
    </div>

    {/* プロフィールセクション（SectionCardからonEditを削除） */}
    <SectionCard title="プロフィール" icon={<User size={18} />}>
      {editMode ? <ProfileEditSection ... /> : <ProfileDisplaySection ... />}
    </SectionCard>

    {/* ブランド指針セクション（SectionCardからonEditを削除） */}
    <SectionCard title="ブランドガイドライン" icon={<Gem size={18} />}>
      {editMode ? <GuidelinesEditSection ... /> : <GuidelinesDisplaySection ... />}
    </SectionCard>

    {/* トンマナチェックセクション（編集モード関係なく常時表示） */}
    <SectionCard title="トンマナチェッカー" icon={<MessageCircle size={18} />}>
      <TonmanaCheckSection ... />
    </SectionCard>
  </div>
);
```

**ViewModel側の修正**:
- `useMVVOKRViewModel.ts`: 統一された `editMode` と `saveAll()` 関数を追加
- `useBrandViewModel.ts`: 統一された `editMode` と `saveAll()` 関数を追加
- 編集セクション内の「保存」「キャンセル」ボタンを削除（ヘッダーに移動のため）

---

## 5. Step 4: UI/SA機能修正（WS-D）

### 5.1 担当項目

| # | 問題 | 対象 |
|---|------|------|
| 8 | 設定タブ完了メッセージ削除 | SettingsTab.tsx |
| 10 | SAタブ表示・試用期間機能 | SADashboard.tsx |

### 5.2 設定タブ完了メッセージ削除（#8）

以下の表示を完全削除：
```
✓ Phase 9.92-11 完了
設定タブの React 化が完了しました。Legacy settings.ts のロジックを useSettingsViewModel に移管しました
```

### 5.3 SAタブ修正（#10）

**表示条件**:
```typescript
const { accountType } = useWorkspace();
if (accountType !== 'SA') {
  return <div>アクセス権限がありません</div>;
}
```

**試用期間機能**:
```typescript
// 経過日数計算
function getDaysSince(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

// 試用期限チェック（14日）
function isTrialExpired(createdAt: string, accountType: string): boolean {
  if (accountType !== 'USER') return false; // SAは対象外
  // TEST属性のユーザーのみ14日制限
  return getDaysSince(createdAt) > 14;
}
```

**ユーザー一覧UI**:
```
┌──────────────────────────────────────────────────────────────┐
│ ユーザー管理                                                 │
├──────────────────────────────────────────────────────────────┤
│ Email              │ 名前     │ 権限  │ 経過日数 │ アクション │
├────────────────────┼──────────┼───────┼──────────┼────────────┤
│ user@example.com   │ 田中太郎 │ USER  │ 5日目    │ [SA昇格]   │
│ admin@example.com  │ 鈴木花子 │ SA    │ 30日目   │ -          │
│ test@example.com   │ 佐藤次郎 │ USER  │ 15日目 ⚠️│ [削除]     │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. 品質ゲート

### 6.1 Phase 9.97 完了条件

| 指標 | 目標 |
|------|------|
| 権限体系 | 2レイヤー4種類に統一 |
| 全11項目修正完了 | ✅ |
| 型チェック | `tsc --noEmit` パス |
| ビルド | `npm run build` 成功 |
| 全タブ正常表示 | エラー 0件 |
| ダッシュボード表示 | 3秒以内 |

### 6.2 テスト項目（手動確認必須）

**権限**:
- [ ] SA権限でSAダッシュボードにアクセス可能
- [ ] USER権限でSAダッシュボードにアクセス不可
- [ ] OWNER/ADMINで設定・管理者タブにアクセス可能
- [ ] MEMBERで設定・管理者タブにアクセス不可

**データ取得**:
- [ ] #1 ダッシュボード: 3秒以内に表示
- [ ] #6 既存客管理: エラーなし・データ表示
- [ ] #7 失注管理: エラーなし・データ表示
- [ ] #9 テンプレート集: エラーなし・データ表示

**データ保存 + UI統一**:
- [ ] #2 MVV: 編集→保存→リロードでデータ維持
- [ ] #2 MVV: ヘッダーに閲覧/編集モード切り替えボタンがある
- [ ] #2 MVV: 編集モード時にヘッダーに保存ボタンが表示される
- [ ] #3 ブランド指針: 編集→保存→リロードでデータ維持
- [ ] #3 ブランド指針: ヘッダーに閲覧/編集モード切り替えボタンがある
- [ ] #3 ブランド指針: 編集モード時にヘッダーに保存ボタンが表示される
- [ ] #4 リーンキャンバス: 保存→リロードでデータ維持
- [ ] #5 見込み客追加: 新規追加→一覧に表示
- [ ] UI統一: MVV/ブランド指針/リーンキャンバスが同じUIパターン

**UI/SA**:
- [ ] #8 設定タブ: 完了メッセージなし
- [ ] #10 SAタブ: ユーザー一覧・経過日数表示

---

## 7. 並列作業プロンプト

### 7.1 Step 1: WS-A（権限体系シンプル化）※最初に実行

```
Phase 9.97 Step 1: 権限体系のシンプル化

【目的】
3レイヤー12種類の権限を、2レイヤー4種類にシンプル化

【新権限体系】
- accountType: SA（システム管理者）/ USER（一般ユーザー）
- role: OWNER / ADMIN / MEMBER

【DB変更】※Supabaseで実行
-- users テーブル
ALTER TABLE users RENAME COLUMN global_role TO account_type;
UPDATE users SET account_type = 'SA' WHERE account_type = 'aifcc_admin';
UPDATE users SET account_type = 'USER' WHERE account_type = 'normal';

-- workspace_members テーブル
UPDATE workspace_members SET role = 'MEMBER' WHERE role = 'viewer';
UPDATE workspace_members SET role = UPPER(role);

【コード変更】
1. 型定義の変更
   - lib/types/database.ts: globalRole → accountType
   - lib/types/app-data.ts: UserRole 型を削除

2. 権限ユーティリティ作成
   - lib/utils/permissions.ts（新規）: isSA(), canEdit(), canManageMembers()

3. 認証の修正
   - lib/server/auth.ts: globalRole → accountType
   - lib/hooks/useWorkspace.ts: globalRole → accountType

4. 各ViewModelの修正
   - useReportsViewModel.ts: UserRole参照削除、新権限関数使用
   - useAdminViewModel.ts: 同上
   - useSADashboardViewModel.ts: accountType対応

【確認方法】
1. npm run type-check
2. npm run build
3. 各権限でログインしてアクセス確認

【完了条件】
- UserRole型が完全に削除されている
- globalRoleがaccountTypeに変更されている
- 全ての権限チェックが新関数を使用している
```

### 7.2 Step 2: WS-B（データ取得エラー修正）※Step 1完了後

```
Phase 9.97 Step 2: データ取得エラー修正

【前提】Step 1（権限整理）が完了していること

【担当項目】
#1 ダッシュボード表示速度（5秒→3秒）
#6 既存客管理エラー
#7 失注管理エラー
#9 テンプレート集エラー

【共通問題の根本原因】
- workspaceId が null の状態でAPI呼び出し
- useWorkspace() の loading 完了前に fetch 実行

【修正パターン】
const { workspaceId, loading: workspaceLoading } = useWorkspace();

useEffect(() => {
  if (workspaceLoading || !workspaceId) return;
  fetchData();
}, [workspaceId, workspaceLoading]);

【#1 パフォーマンス改善】
複数APIを Promise.all で並列化

【対象ファイル】
- lib/hooks/useDashboardViewModel.ts
- lib/hooks/useClientsViewModel.ts
- lib/hooks/useLostDealsViewModel.ts
- lib/hooks/useTemplatesViewModel.ts

【確認方法】
1. npm run type-check
2. npm run build
3. 各タブを開いてエラーなし確認
4. ダッシュボード表示時間計測（3秒以内）

【コミット】
git commit -m "fix: Phase 9.97 Step 2 - データ取得エラー修正

- #1 ダッシュボード: API並列化で高速化
- #6 既存客管理: workspaceId nullチェック追加
- #7 失注管理: 同上
- #9 テンプレート集: 同上"
```

### 7.3 Step 3: WS-C（データ保存ロジック修正）※Step 1完了後

```
Phase 9.97 Step 3: データ保存ロジック修正

【前提】Step 1（権限整理）が完了していること

【担当項目】
#2 MVV保存失敗
#3 ブランド指針保存ボタンなし
#4 リーンキャンバス保存失敗
#5 見込み客追加失敗

【共通問題の根本原因】
PUT /api/workspaces/:id/data で version パラメータ未送信
楽観的排他制御で version が必須

【修正パターン】
// 1. GETでバージョン取得
const { data, version } = await fetch(...).then(r => r.json());

// 2. PUTでバージョン付き保存
await fetch(..., {
  method: 'PUT',
  body: JSON.stringify({ data: updatedData, version }), // version必須！
});

【#3 ブランド指針】
BrandTab.tsx に保存ボタンを追加

【対象ファイル】
- lib/hooks/useMVVOKRViewModel.ts
- lib/hooks/useBrandViewModel.ts
- lib/hooks/useLeanCanvasViewModel.ts
- lib/hooks/useLeads.ts
- app/_components/brand/BrandTab.tsx

【確認方法】
1. npm run type-check
2. npm run build
3. 各タブで編集→保存→リロード
4. データが維持されていることを確認

【コミット】
git commit -m "fix: Phase 9.97 Step 3 - データ保存ロジック修正

- #2 MVV: version付きPUT
- #3 ブランド指針: 保存ボタン追加
- #4 リーンキャンバス: version付きPUT
- #5 見込み客追加: version付きPUT"
```

### 7.4 Step 4: WS-D（UI/SA機能修正）※Step 1-3完了後

```
Phase 9.97 Step 4: UI/SA機能修正

【前提】Step 1-3が全て完了していること

【担当項目】
#8 設定タブ完了メッセージ削除
#10 SAタブ表示・試用期間機能

【#8 設定タブ】
以下の表示を完全削除：
✓ Phase 9.92-11 完了
設定タブの React 化が完了しました。

検索して該当箇所を特定し削除

【#10 SAタブ】
1. 表示条件: accountType === 'SA' のみ
2. ユーザー一覧をテーブル形式で美しく表示
3. 経過日数をバッジ表示
4. 14日超過ユーザーに警告表示

【対象ファイル】
- app/_components/settings/SettingsTab.tsx
- app/_components/admin/SADashboard.tsx
- lib/hooks/useSADashboardViewModel.ts

【確認方法】
1. npm run type-check
2. npm run build
3. 設定タブ: 完了メッセージなし確認
4. SAタブ: SA権限でログイン→表示確認
5. ユーザー一覧・経過日数表示確認

【コミット】
git commit -m "fix: Phase 9.97 Step 4 - UI/SA機能修正

- #8 設定タブ: 完了メッセージ削除
- #10 SAタブ: accountType対応、ユーザー一覧UI改善、経過日数表示"
```

---

## 8. 実行順序まとめ

```
Step 1: 権限体系シンプル化（WS-A）
    ↓
    DB変更 + コード変更
    ↓
    型チェック・ビルド確認
    ↓
┌───────────────┴───────────────┐
↓                               ↓
Step 2: データ取得修正        Step 3: データ保存修正
(WS-B)                        (WS-C)
↓                               ↓
└───────────────┬───────────────┘
                ↓
          Step 4: UI/SA修正（WS-D）
                ↓
          最終確認・マージ
```

**Step 2とStep 3は並列実行可能**（Step 1完了後）

---

## 9. 追加実施: pg → Supabase SDK 統一

### 9.1 背景

Step 3 完了後、本番環境で `/api/workspaces/:id/data` が 500 Internal Server Error を返す問題が発生。
原因調査の結果、`pg` パッケージと Supabase SDK が混在しており、Vercel Serverless 環境で接続リーク問題が発生していた。

### 9.2 実施内容

| ファイル | 変更内容 |
|----------|----------|
| `lib/server/db.ts` | `pg` Pool → Supabase SDK に完全移行 |
| `app/api/workspaces/[workspaceId]/data/route.ts` | `pool.query()` → `supabase.from()` に移行 |
| `app/api/admin/sa-workspaces/route.ts` | Supabase SDK に移行 |
| `app/api/admin/system-stats/route.ts` | Supabase SDK に移行 |
| `package.json` | `pg`, `@types/pg` を `dependencies` → `devDependencies` に移動 |

### 9.3 新しいdb.ts構造

```typescript
// lib/server/db.ts - Supabase SDK 統一版
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const globalForDb = globalThis as unknown as {
  supabase: SupabaseClient | undefined;
};

function getSupabaseClient(): SupabaseClient {
  if (!globalForDb.supabase) {
    globalForDb.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return globalForDb.supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop: keyof SupabaseClient) {
    const client = getSupabaseClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
```

### 9.4 APIルートでの使用例

```typescript
// Before (pg)
import { pool } from '@/lib/server/db';
const result = await pool.query(
  'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
  [wsId, session.id]
);

// After (Supabase SDK)
import { supabase } from '@/lib/server/db';
const { data, error } = await supabase
  .from('workspace_members')
  .select('role')
  .eq('workspace_id', wsId)
  .eq('user_id', parseInt(session.id, 10))
  .single();
```

### 9.5 pgパッケージの扱い

- **本番アプリ**: Supabase SDK のみ使用（`pg` 不要）
- **開発スクリプト**: `scripts/run-migration.ts`, `scripts/measure-p95.ts` で使用
- **package.json**: `devDependencies` に移動（本番バンドルから除外）

### 9.6 メリット

1. **接続管理の統一** - Supabase SDK が接続プールを自動管理
2. **接続リーク防止** - Vercel Serverless でのリーク問題を根本解決
3. **環境変数の削減** - `DATABASE_URL` 不要（Supabase 環境変数のみ）
4. **一貫性向上** - `lib/server/auth.ts` と同じパターン

### 9.7 確認事項

- [x] `npm run build` 成功
- [x] 型チェック通過
- [x] main にマージ完了

---

**作成日**: 2025-11-26
**最終更新**: 2025-11-26
**ステータス**: ✅ Step 1-3 完了、pg→Supabase SDK 移行完了
