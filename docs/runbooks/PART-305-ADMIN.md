# PART 305: Admin + セキュリティ

## 概要

- **所要時間**: 60分
- **前提**: PART 302 完了（Supabase + Auth + Workspace）
- **成果物**: Workspace Admin UI、権限管理、監査ログ

### 対応タブ

PART 305 は専用タブを追加しない。設定タブの拡張として実装する。

### 依存関係

- PART 302 完了が必須（Workspace + ロール）
- PART 303, 304 は先行していなくても実装可能

---

## Phase 30501: Workspace Admin UI

### learns

- **なぜ必要か**: Workspace の管理者（OWNER/ADMIN）は、メンバーの追加・削除やロール変更を行う必要がある。設定ページに Admin セクションを追加して管理機能を提供する。
- **何を理解するか**: ロールベースの UI 表示制御、メンバー招待フロー、ロール変更。

### prompt

```
Workspace Admin 機能を設定ページに追加して。

## 1. 設定ページの拡張

app/(app)/settings/page.tsx にタブ切り替えを追加:
- 「プロフィール」タブ: 既存の設定フォーム（Phase 30103 で作成済み）
- 「ワークスペース」タブ: Admin 機能（OWNER/ADMIN のみ表示）

## 2. ワークスペースタブの内容

### ワークスペース情報
- ワークスペース名の変更（OWNER のみ）
- ワークスペース ID の表示（読み取り専用）

### メンバー管理
- メンバー一覧テーブル（名前、メール、ロール、参加日）
- 招待ボタン: メールアドレスを入力して招待（ADMIN 以上）
- ロール変更: ドロップダウンで ADMIN/MEMBER を切り替え（OWNER のみ）
- メンバー削除: 確認ダイアログ付き（ADMIN 以上、OWNER は削除不可）

### ロールの権限表

画面に権限の説明を表示:
| 権限 | OWNER | ADMIN | MEMBER |
|------|-------|-------|--------|
| データの閲覧・編集 | o | o | o |
| メンバーの招待 | o | o | - |
| メンバーの削除 | o | o | - |
| ロールの変更 | o | - | - |
| ワークスペース設定 | o | - | - |

## 制約
- MEMBER ロールのユーザーには「ワークスペース」タブを表示しない
- OWNER は自分自身を削除できない
- globals.css の CSS 変数のみ使用
```

### checks

- [ ] 設定ページに「プロフィール」「ワークスペース」タブが表示される
- [ ] MEMBER ロールでは「ワークスペース」タブが表示されない
- [ ] メンバー一覧が正しく表示される
- [ ] ロール変更が動作する（OWNER のみ）
- [ ] メンバー削除が動作する（確認ダイアログ付き）
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. OWNER アカウントで http://localhost:3000/settings を開く
2. 「ワークスペース」タブが表示される
3. メンバー一覧が表示される
4. 別のユーザーを招待（メールアドレス入力）
5. ロール変更テスト（ADMIN ↔ MEMBER）
6. MEMBER アカウントでログイン → 「ワークスペース」タブが非表示

---

## Phase 30502: 権限・危険操作・セキュリティ

### learns

- **なぜ必要か**: SaaS には「取り返しのつかない操作」がある（データ全削除、ワークスペース削除など）。これらは確認ダイアログ、権限チェック、2段階確認で保護する必要がある。
- **何を理解するか**: 危険操作パターン（Danger Zone）、サーバーサイド権限チェック、CSRF 対策。

### prompt

```
危険操作とセキュリティ機能を追加して。

## 1. Danger Zone（ワークスペースタブの最下部）

OWNER のみ表示。赤枠で囲った危険操作セクション:

### データリセット
- 「全タスクを削除」ボタン
- 確認ダイアログ: ワークスペース名を手入力させる（誤操作防止）
- 一致した場合のみ実行

### ワークスペース削除
- 「ワークスペースを削除」ボタン
- 確認ダイアログ: 「削除します」と入力させる
- 全関連データ（tasks, prospects, clients, action_maps, objectives 等）を CASCADE 削除
- 削除後はログアウト

## 2. サーバーサイド権限チェック

API ルートに権限チェックを追加:
- DELETE /api/workspaces/[id] → OWNER のみ
- PUT /api/workspaces/[id] → OWNER のみ
- POST /api/workspaces/[id]/members → ADMIN 以上
- DELETE /api/workspaces/[id]/members/[memberId] → ADMIN 以上、かつ OWNER は削除不可

権限不足の場合は 403 Forbidden を返す。

## 3. セキュリティヘッダー

next.config.ts に以下のセキュリティヘッダーを追加:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=()

## 制約
- Danger Zone は var(--error) の色を使う
- 確認入力は完全一致のみ受け付ける
```

### checks

- [ ] Danger Zone が OWNER のみに表示される
- [ ] データリセットが確認入力後に実行される
- [ ] ワークスペース削除が確認入力後に実行される
- [ ] API ルートの権限チェックが動作する（403 が返る）
- [ ] セキュリティヘッダーが設定されている
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. OWNER でログイン → Danger Zone が表示される
2. 「全タスクを削除」→ ワークスペース名を入力 → 実行 → タスクが全削除される
3. MEMBER でログイン → Danger Zone が表示されない
4. ブラウザの開発者ツール Network で API レスポンスヘッダーを確認

---

## Phase 30503: 監査ログ・運用ルール

### learns

- **なぜ必要か**: 「誰が、いつ、何をしたか」を記録する監査ログは、トラブル発生時の原因究明と、コンプライアンス対応に必要。
- **何を理解するか**: audit_logs テーブル設計、ログ自動記録パターン、ログ閲覧 UI。

### prompt

```
監査ログ機能を追加して。

## 1. テーブル設計

supabase/migrations/ にマイグレーションを追加:

### audit_logs テーブル
- id: UUID (PK)
- workspace_id: UUID (FK → workspaces)
- user_id: UUID (FK → auth.users)
- action: TEXT (NOT NULL)（例: 'member.invite', 'member.remove', 'workspace.update', 'data.reset'）
- target_type: TEXT（例: 'member', 'workspace', 'task'）
- target_id: UUID
- metadata: JSONB（追加情報）
- created_at: TIMESTAMPTZ (DEFAULT now())

RLS: 同じ workspace の ADMIN 以上のみ SELECT。INSERT は全メンバー可（自分の操作を記録）。

## 2. ログ記録

以下の操作時に自動で audit_logs にレコードを追加:
- メンバーの招待・削除
- ロール変更
- ワークスペース設定変更
- データリセット

## 3. ログ閲覧 UI

設定ページの「ワークスペース」タブに「監査ログ」セクションを追加:
- 最新 50 件を時系列で表示
- 各ログに: 日時、ユーザー名、操作内容
- 日時は JST 表示

## 制約
- 監査ログは削除不可（DELETE ポリシーなし）
- MEMBER には監査ログセクションを表示しない
```

### checks

- [ ] audit_logs テーブルが作成されている
- [ ] メンバー操作時にログが自動記録される
- [ ] ワークスペースタブに監査ログが表示される
- [ ] MEMBER には監査ログが表示されない
- [ ] 日時が JST で表示される
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. OWNER でメンバーを招待 → 監査ログに記録される
2. ロール変更 → 監査ログに記録される
3. 設定ページ → 監査ログセクション → 操作履歴が表示される
4. MEMBER でログイン → 監査ログセクションが非表示

---

## DoD（PART 305 全体の完了条件）

- [ ] 設定ページに「プロフィール」「ワークスペース」タブ切り替えがある
- [ ] メンバー管理（招待・ロール変更・削除）が動作
- [ ] Danger Zone（データリセット・ワークスペース削除）が確認付きで動作
- [ ] API ルートの権限チェックが動作（403 Forbidden）
- [ ] 監査ログが自動記録・閲覧できる
- [ ] セキュリティヘッダーが設定されている
- [ ] `npm run build && npm run type-check && npm run lint` が全て通る
