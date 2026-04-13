# PART 301: Foundation（タスク CRUD + 設定）

## 概要

- **所要時間**: 90分
- **前提**: スターターが `npm run dev` で起動できること
- **成果物**: タスクページ（CRUD + フィルター）、設定ページ（フォーム + Export/Import）

### 対応タブ

| タブ | 実装内容 |
|------|---------|
| タスク | タスク追加・表示・編集・削除・完了トグル・フィルター |
| 設定 | ユーザー名/会社名フォーム、データ Export/Import、リセット |

### 依存関係

- なし（PART 301 は最初に実行する）

---

## Phase 30101: タスクのデータ型と状態管理

### learns

- **なぜ必要か**: CRUD（Create/Read/Update/Delete）は全ての SaaS アプリの基礎。タスク管理で CRUD パターンを身につければ、後続の顧客管理・OKR 管理でも同じパターンを使い回せる。
- **何を理解するか**: TypeScript の型定義、useReducer による状態管理、localStorage による永続化。

### prompt

```
タスク管理機能の基盤を作って。

## 型定義

app/(app)/tasks/ ディレクトリを作成して、以下の型を定義:

Task 型:
- id: string（crypto.randomUUID()）
- title: string
- description: string（任意）
- completed: boolean
- priority: 'high' | 'medium' | 'low'
- createdAt: string（ISO日時）
- updatedAt: string（ISO日時）

## 状態管理

useReducer を使ったカスタムフック useTaskReducer を作成:
- ADD_TASK: 新しいタスクを追加
- UPDATE_TASK: 既存タスクを更新
- DELETE_TASK: タスクを削除
- TOGGLE_TASK: 完了/未完了を切り替え
- SET_TASKS: 初期データを一括セット（localStorage 読み込み用）

## localStorage 永続化

- 保存キー: 'aifcc-tasks'
- タスクが変更されるたびに localStorage に保存
- 初回読み込み時に localStorage からタスクを復元

## 制約

- globals.css の CSS 変数のみ使用（--primary, --text-dark, --bg-base 等）
- Lucide React アイコンを使用（絵文字は使わない）
- any 型は使わない
```

### checks

- [ ] Task 型が定義されている
- [ ] useReducer の 5 アクション（ADD/UPDATE/DELETE/TOGGLE/SET）が実装されている
- [ ] localStorage キーが `aifcc-tasks` になっている
- [ ] `npm run type-check` がエラーなしで通る

---

## Phase 30102: タスク CRUD UI

### learns

- **なぜ必要か**: データ型とロジックだけでは動かない。ユーザーが操作できる画面を作ることで、初めて「動くアプリ」になる。
- **何を理解するか**: コンポーネント分割（ページ / リスト / アイテム / フォーム）、フィルター UI、イベントハンドリング。

### prompt

```
タスク一覧ページの UI を作って。

## ページ構成

app/(app)/tasks/page.tsx を作成:

1. タスク追加フォーム
   - タイトル（必須）、説明（任意）、優先度（high/medium/low セレクト）
   - 追加ボタンで dispatch(ADD_TASK)

2. フィルターバー
   - 「全部」「未完了」「完了」の 3 ボタン
   - アクティブなフィルターを視覚的に区別

3. タスク一覧
   - 各タスクにチェックボックス（完了トグル）、編集ボタン、削除ボタン
   - 完了タスクは取り消し線 + 薄い表示
   - 優先度を色で区別（high: var(--error), medium: var(--warning), low: var(--info)）

4. インライン編集
   - 編集ボタンで入力モードに切替
   - 保存/キャンセルボタン

## スタイル

- globals.css の既存クラス（.card, .btn, .btn-primary 等）を活用
- インラインスタイルと CSS 変数の組み合わせ
- レスポンシブ対応（モバイルでも使えるレイアウト）

## 制約

- コンポーネントは適切に分割する（1 ファイル 200 行以内を目安）
- Phase 30101 で作った useTaskReducer を使う
```

### checks

- [ ] タスクの追加・表示・編集・削除・完了トグルの 5 操作が動作する
- [ ] フィルター（全部/未完了/完了）で表示が切り替わる
- [ ] ブラウザをリロードしてもタスクデータが保持されている
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. http://localhost:3000/tasks を開く
2. タスクを 3 つ追加 → 一覧に表示される
3. タスクを 1 つ編集 → 内容が更新される
4. タスクを 1 つ完了 → 完了状態に変わる
5. フィルターを切り替え → 表示が絞り込まれる
6. ブラウザをリロード → データが残っている
7. タスクを 1 つ削除 → 一覧から消える

---

## Phase 30103: 設定ページ（フォーム + Export/Import）

### learns

- **なぜ必要か**: フォーム入力は SaaS の基本 UI パターン。データの Export/Import はユーザーのデータポータビリティを保証する。
- **何を理解するか**: React のフォーム管理（useState + onChange）、JSON による Export/Import、FileReader API。

### prompt

```
設定ページを作って。

## ページ構成

app/(app)/settings/page.tsx を作成:

### 1. プロフィール設定フォーム
- ユーザー名（必須、20 文字以内）
- 会社名（必須、50 文字以内）
- 保存ボタン（成功時「保存しました」メッセージを 2 秒間表示）
- リセットボタン（デフォルト値に戻す、確認ダイアログ付き）

### 2. データ管理セクション
- Export ボタン: 設定 + タスクを JSON ファイルでダウンロード
  - ファイル名: aifcc-backup-YYYY-MM-DD.json
  - Blob + URL.createObjectURL でダウンロード
- Import ボタン: JSON ファイルを読み込んでデータを復元
  - input type="file" accept=".json"
  - FileReader API で読み込み
  - 不正な JSON にはエラーメッセージを表示
  - 成功時は localStorage を更新してページをリロード

### 3. 状態管理
- useSettings カスタムフック
  - localStorage キー: 'aifcc-settings'
  - settings（現在値）と updateSettings（更新関数）と resetSettings を返す

## 制約

- globals.css の CSS 変数のみ使用
- any 型は使わない
```

### checks

- [ ] ユーザー名と会社名を保存してリロードしてもデータが残っている
- [ ] Export ボタンで JSON ファイルがダウンロードされ、中身が正しい
- [ ] ダウンロードした JSON ファイルを Import してデータが復元される
- [ ] 不正な JSON ファイルを Import したときにエラーメッセージが表示される
- [ ] リセットボタンでデフォルト値に戻る
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. http://localhost:3000/settings を開く
2. ユーザー名と会社名を入力して保存 → リロードしても残っている
3. Export ボタン → JSON ファイルがダウンロードされる
4. タスクを何件か追加した後に Export → JSON にタスクデータが含まれる
5. リセットボタン → 確認ダイアログ → デフォルト値に戻る
6. ダウンロードした JSON を Import → データが復元される

---

## DoD（PART 301 全体の完了条件）

- [ ] タスクタブ: CRUD + フィルター + localStorage 永続化が動作
- [ ] 設定タブ: フォーム保存 + Export/Import + リセットが動作
- [ ] `npm run build && npm run type-check && npm run lint` が全て通る
- [ ] タスクの localStorage キーが `aifcc-tasks`
- [ ] 設定の localStorage キーが `aifcc-settings`
- [ ] 絵文字を使っていない（Lucide React アイコンのみ）
