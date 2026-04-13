# PART 302: Database（Supabase + Auth + Workspace）

## 概要

- **所要時間**: 120分
- **前提**: PART 301 完了（タスク・設定が localStorage で動作）、Supabase アカウント作成済み
- **成果物**: Supabase 接続、Google OAuth ログイン、Workspace 基盤

### 依存関係

- PART 301 完了が必須

---

## Phase 30201: Supabase セットアップ

### learns

- **なぜ必要か**: localStorage はブラウザにしかデータが残らない。Supabase（PostgreSQL）に移行することで、複数デバイスからのアクセス、チームでの共有、データの永続性を実現する。
- **何を理解するか**: Supabase プロジェクト作成、テーブル設計、RLS（Row Level Security）、マイグレーション、環境変数管理。

### prompt

```
Supabase をセットアップして、tasks テーブルを作成して。

## 1. Supabase プロジェクト作成（手動）

ブラウザで https://supabase.com にアクセスして:
1. 「New Project」をクリック
2. プロジェクト名: aifcc
3. データベースパスワード: 強いパスワードを設定（1Password に保存）
4. リージョン: Northeast Asia (Tokyo)
5. 「Create new project」をクリック

## 2. 環境変数を 1Password CLI で管理

Supabase ダッシュボードの Settings > API から URL と キーを取得して、
1Password CLI で保存して。

## 3. Supabase JS SDK をインストール

npm install @supabase/supabase-js

## 4. lib/supabase.ts を作成

Supabase クライアントの初期化コードを作成。
環境変数は process.env.NEXT_PUBLIC_SUPABASE_URL と process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY を使う。

注意:
- SUPABASE_SERVICE_ROLE_KEY は絶対にフロントエンドに露出させない（NEXT_PUBLIC_ を付けない）
- SERVICE_ROLE_KEY はサーバーサイド（API ルート）でのみ使用する
- 全てのキーは 1Password CLI（op inject）で管理し、.env.local にベタ書きしない

## 5. tasks テーブルのマイグレーション

supabase/migrations/ にマイグレーションファイルを作成:

tasks テーブル:
- id: UUID (PK, gen_random_uuid())
- user_id: UUID (NOT NULL)
- title: TEXT (NOT NULL)
- description: TEXT (NULL可)
- completed: BOOLEAN (DEFAULT false)
- priority: TEXT (DEFAULT 'medium', CHECK: high/medium/low)
- created_at: TIMESTAMPTZ (DEFAULT now())
- updated_at: TIMESTAMPTZ (DEFAULT now())

RLS を有効化して、自分のデータだけ読み書きできるポリシーを設定。

## 6. 接続テスト

簡単なテストスクリプトで Supabase への接続を確認。
```

### checks

- [ ] Supabase プロジェクト（aifcc）が作成されている
- [ ] 環境変数（SUPABASE_URL, SUPABASE_ANON_KEY）が 1Password CLI で管理されている
- [ ] tasks テーブルが作成され RLS が有効になっている
- [ ] ローカルから Supabase への接続テストが成功する

**localhost 動作確認**:
1. http://localhost:3000 でエラーが出ないことを確認
2. ブラウザの開発者ツール Console で Supabase 接続エラーがないことを確認

---

## Phase 30202: Supabase Auth（Google OAuth）

### learns

- **なぜ必要か**: デモ用パスワード認証を本格的な Google OAuth に切り替える。Supabase Auth を使うことで、セッション管理・CSRF 対策・トークンリフレッシュが自動化される。
- **何を理解するか**: OAuth フロー、Supabase Auth の設定、API ルート（login / callback / session / logout）、proxy.ts の認証チェック更新。

### prompt

```
Google OAuth でのログイン機能を Supabase Auth で実装して。

## 1. Google Cloud Console 設定（手動）

1. Google Cloud Console で OAuth 2.0 クライアント ID を作成
2. 承認済みリダイレクト URI: Supabase ダッシュボードに表示される URL を追加
3. クライアント ID とシークレットを Supabase ダッシュボードの Authentication > Providers > Google に設定

## 2. API ルートを作成

app/api/auth/ ディレクトリに以下を作成:

### /api/auth/login (GET)
- supabase.auth.signInWithOAuth({ provider: 'google' }) でリダイレクト URL を生成
- Google 認証画面にリダイレクト

### /api/auth/callback (GET)
- code パラメータを受け取る
- supabase.auth.exchangeCodeForSession(code) でセッション確立
- /dashboard にリダイレクト
- Cookie は Supabase が自動セット

### /api/auth/session (GET)
- Supabase Auth Cookie からユーザー情報を取得
- supabase.auth.getUser() で認証確認
- JSON でユーザー情報を返す

### /api/auth/logout (POST)
- supabase.auth.signOut() でセッション破棄
- Cookie をクリアして /login にリダイレクト

## 3. proxy.ts を更新

- Supabase Auth Cookie を優先チェック
- aifcc_session はフォールバック（移行期間）

## 4. ログインページを更新

- app/login/page.tsx に「Google でログイン」ボタンを追加
- href="/api/auth/login" にリンク
- 既存のデモパスワード入力も残す（開発用）

## 5. レイアウトの認証チェックを更新

- app/(app)/layout.tsx の checkAuth を /api/auth/session 呼び出しに変更
- ログアウトを /api/auth/logout POST に変更
```

### checks

- [ ] Google OAuth でログインできる
- [ ] /api/auth/session がユーザー情報を返す
- [ ] /api/auth/logout でログアウトできる
- [ ] proxy.ts が Supabase Auth Cookie をチェックしている
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. http://localhost:3000/login を開く
2. 「Google でログイン」ボタンをクリック → Google 認証画面に遷移
3. 認証後 → /dashboard にリダイレクト
4. リロード → ログイン状態が維持される
5. ログアウト → /login に戻る

---

## Phase 30203: Workspace + ロール基盤

### learns

- **なぜ必要か**: チームで SaaS を使う場合、「誰がどのデータにアクセスできるか」を管理する仕組みが必要。Workspace とロール（OWNER/ADMIN/MEMBER）で実現する。
- **何を理解するか**: マルチテナントの概念、workspaces / workspace_members テーブル設計、ロールベースアクセス制御。

### prompt

```
Workspace とロールの基盤を作って。

## 1. テーブル設計

supabase/migrations/ にマイグレーションを追加:

### workspaces テーブル
- id: UUID (PK)
- name: TEXT (NOT NULL)
- owner_id: UUID (NOT NULL, users の FK)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

### workspace_members テーブル
- id: UUID (PK)
- workspace_id: UUID (FK → workspaces)
- user_id: UUID (FK → auth.users)
- role: TEXT (CHECK: 'OWNER' / 'ADMIN' / 'MEMBER')
- joined_at: TIMESTAMPTZ

RLS ポリシー:
- workspaces: メンバーのみ SELECT、OWNER のみ UPDATE/DELETE
- workspace_members: 同じ workspace のメンバーのみ SELECT、ADMIN 以上のみ INSERT/DELETE

## 2. tasks テーブルを更新

tasks に workspace_id カラムを追加して、workspace 単位でデータを分離する。
RLS ポリシーも workspace_id ベースに更新。

## 3. Workspace Context

lib/contexts/WorkspaceContext.tsx を作成:
- 現在の workspace を管理
- workspace 切り替え機能
- メンバー一覧取得

## 4. 初回ログイン時の Workspace 自動作成

ユーザーが初めてログインした時:
1. デフォルト Workspace を自動作成（name: ユーザー名 + "のワークスペース"）
2. 作成者を OWNER として workspace_members に追加
```

### checks

- [ ] workspaces テーブルと workspace_members テーブルが作成されている
- [ ] tasks テーブルに workspace_id カラムが追加されている
- [ ] RLS ポリシーが正しく設定されている
- [ ] 初回ログイン時に Workspace が自動作成される
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. 新規ユーザーでログイン → Workspace が自動作成される
2. タスクを追加 → workspace_id が正しくセットされている
3. Supabase ダッシュボードで workspaces テーブルにレコードが入っていることを確認

---

## DoD（PART 302 全体の完了条件）

- [ ] Supabase プロジェクト（aifcc）に tasks, workspaces, workspace_members テーブルが存在
- [ ] Google OAuth でログイン → タスク CRUD が Supabase 上で動作
- [ ] RLS が有効で、他ユーザーのデータにアクセスできない
- [ ] Workspace が自動作成され、タスクが workspace に紐づいている
- [ ] 環境変数が 1Password CLI で管理されている（.env にベタ書きでない）
- [ ] `npm run build && npm run type-check && npm run lint` が全て通る
