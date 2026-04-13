# PART 304: Three-Layer（Action Map + OKR + 連携）

## 概要

- **所要時間**: 90分
- **前提**: PART 302 完了（Supabase + Auth + Workspace）、PART 301 のタスク機能が動作
- **成果物**: Action Map タブ、OKR タブ、タスク / Action Map / OKR の連携

### 対応タブ

| タブ | 実装内容 |
|------|---------|
| Action Map | アクション項目の CRUD + 進捗管理 |
| OKR | Objective / Key Result の CRUD + 進捗ロールアップ |

### 依存関係

- PART 302 完了が必須（Supabase + Workspace）
- PART 301 のタスク機能と連携するが、PART 303 は不要

---

## Phase 30401: Action Map ページ

### learns

- **なぜ必要か**: タスクは日々の作業リスト。Action Map は「何のためにやるのか」を整理する戦術レイヤー。タスクを Action Map に紐づけることで、作業の目的が明確になり、優先順位の判断力が上がる。
- **何を理解するか**: Action Map のデータ構造、アクション項目の CRUD、進捗の自動計算（紐づいたタスクの完了率）。

### prompt

```
Action Map 機能を作って。

## 1. テーブル設計

supabase/migrations/ にマイグレーションを追加:

### action_maps テーブル
- id: UUID (PK)
- workspace_id: UUID (FK → workspaces)
- title: TEXT (NOT NULL)（例: 「Q2 マーケティング施策」）
- description: TEXT
- status: TEXT (DEFAULT 'ACTIVE', CHECK: 'ACTIVE'/'COMPLETED'/'ARCHIVED')
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

### action_items テーブル
- id: UUID (PK)
- action_map_id: UUID (FK → action_maps)
- title: TEXT (NOT NULL)
- description: TEXT
- status: TEXT (DEFAULT 'TODO', CHECK: 'TODO'/'IN_PROGRESS'/'DONE')
- priority: TEXT (DEFAULT 'medium', CHECK: 'high'/'medium'/'low')
- due_date: DATE
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

RLS: workspace メンバーのみアクセス可能。

## 2. Action Map ページ

app/(app)/action-map/page.tsx を作成:

### マップ一覧
- カード形式で Action Map を表示
- 各カードに進捗バー（action_items の完了率）
- 新規作成ボタン

### マップ詳細
- マップを選択すると action_items の一覧を表示
- アクション項目の追加・編集・削除・ステータス変更
- ステータスで色分け（TODO: var(--info), IN_PROGRESS: var(--warning), DONE: var(--success)）

### 進捗計算
- 進捗率 = DONE の action_items 数 / 全 action_items 数 × 100
- 全アイテム DONE → マップのステータスを COMPLETED に自動更新

## 制約
- globals.css の CSS 変数のみ使用
- ドラッグ & ドロップは不要（ステータスはドロップダウンで変更）
```

### checks

- [ ] Action Map の作成・表示・編集・削除が動作する
- [ ] Action Item の追加・編集・削除・ステータス変更が動作する
- [ ] 進捗バーが正しく計算されている
- [ ] RLS が効いている
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. http://localhost:3000/action-map を開く
2. Action Map を 1 つ作成 → カードが表示される
3. Action Item を 3 つ追加 → 一覧に表示される
4. 1 つを DONE に変更 → 進捗バーが 33% になる
5. 全て DONE に変更 → マップが COMPLETED になる

---

## Phase 30402: OKR ページ

### learns

- **なぜ必要か**: OKR（Objectives and Key Results）は戦略レイヤー。「会社として何を達成するか」を定義し、Key Result の進捗で達成度を測る。Action Map と紐づけることで、戦略→戦術→実行の 3 層が繋がる。
- **何を理解するか**: OKR のデータ構造（Objective → Key Results）、進捗ロールアップ、期間管理。

### prompt

```
OKR 機能を作って。

## 1. テーブル設計

supabase/migrations/ にマイグレーションを追加:

### objectives テーブル
- id: UUID (PK)
- workspace_id: UUID (FK → workspaces)
- title: TEXT (NOT NULL)（例: 「Q2 に売上 1.5 倍」）
- description: TEXT
- period: TEXT (例: '2026-Q2')
- progress: INTEGER (DEFAULT 0, 0-100)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

### key_results テーブル
- id: UUID (PK)
- objective_id: UUID (FK → objectives)
- title: TEXT (NOT NULL)（例: 「新規リード 50 件獲得」）
- target_value: NUMERIC (目標値)
- current_value: NUMERIC (現在値, DEFAULT 0)
- unit: TEXT（例: '件', '円', '%'）
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

RLS: workspace メンバーのみアクセス可能。

## 2. OKR ページ

app/(app)/okr/page.tsx を作成:

### Objective 一覧
- カード形式で Objective を表示
- 各カードに進捗バー（Key Results の平均達成率）
- 期間フィルター（例: 2026-Q1, 2026-Q2）
- 新規作成ボタン

### Objective 詳細
- Objective を選択すると Key Results の一覧を表示
- Key Result の追加・編集・削除
- current_value をスライダーまたは直接入力で更新
- 達成率 = (current_value / target_value) × 100

### 進捗ロールアップ
- Objective の progress = 全 Key Results の達成率の平均
- Key Result が更新されるたびに Objective の progress を再計算

## 制約
- globals.css の CSS 変数のみ使用
- グラフやチャートは不要（プログレスバーで十分）
```

### checks

- [ ] Objective の作成・表示・編集・削除が動作する
- [ ] Key Result の追加・編集・削除が動作する
- [ ] 進捗ロールアップが正しく計算される
- [ ] 期間フィルターが動作する
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. http://localhost:3000/okr を開く
2. Objective を 1 つ作成（例: 「Q2 に売上 1.5 倍」）
3. Key Result を 2 つ追加（例: 「新規リード 50 件」「成約率 20%」）
4. Key Result の current_value を更新 → 達成率が変わる
5. Objective の進捗バーが Key Results の平均で更新される

---

## Phase 30403: タスク / Action Map / OKR の連携

### learns

- **なぜ必要か**: 3 層を個別に管理するだけでは真価を発揮しない。タスク→Action Map→OKR を紐づけることで、「この日常タスクは、どの施策の一部で、最終的にどの目標に貢献するか」が一目で分かる。
- **何を理解するか**: 外部キーによるリレーション、紐づけ UI、進捗の連鎖更新。

### prompt

```
タスク、Action Map、OKR の紐づけ機能を作って。

## 1. テーブル更新

既存テーブルにカラムを追加:

### tasks テーブルに追加
- action_item_id: UUID (FK → action_items, NULL可)

### action_maps テーブルに追加
- key_result_id: UUID (FK → key_results, NULL可)

## 2. 紐づけ UI

### タスク側
- タスク編集時に「Action Item に紐づけ」ドロップダウンを追加
- 紐づけされたタスクには Action Item 名のバッジを表示

### Action Map 側
- Action Map 編集時に「Key Result に紐づけ」ドロップダウンを追加
- 紐づけされた Action Map には KR 名のバッジを表示

## 3. 進捗の連鎖更新

以下の順で進捗が波及する:
1. タスクを完了 → 紐づいた Action Item の進捗が更新
2. Action Item 全完了 → Action Map の進捗が 100% に
3. Action Map の進捗 → 紐づいた Key Result の current_value に反映（任意）

※ 完全自動は複雑なので、Action Map → KR の反映は手動更新でも可。

## 4. ダッシュボードへの反映

app/(app)/dashboard/page.tsx を更新:
- 「タスク進捗」「Action Map 進捗」「OKR 達成率」の 3 つの統計カードを表示
- 数値はリアルタイム計算（初期状態で Coming Soon だった部分）

## 制約
- 紐づけは任意（全てのタスクが Action Item に紐づく必要はない）
- 循環参照を防ぐ（タスク → Action Item → Action Map → KR → Objective の一方向）
```

### checks

- [ ] タスクを Action Item に紐づけできる
- [ ] Action Map を Key Result に紐づけできる
- [ ] 紐づけバッジが正しく表示される
- [ ] ダッシュボードに進捗統計が表示される
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. OKR → Action Map → タスクの順でデータを作成
2. タスク編集で Action Item を紐づけ → バッジが表示される
3. Action Map 編集で Key Result を紐づけ → バッジが表示される
4. ダッシュボードを開く → 統計カードに数値が表示される

---

## DoD（PART 304 全体の完了条件）

- [ ] Action Map タブ: マップ + アイテム CRUD + 進捗バーが動作
- [ ] OKR タブ: Objective + Key Result CRUD + ロールアップが動作
- [ ] タスク → Action Item → Action Map → KR → Objective の紐づけが動作
- [ ] ダッシュボードに進捗統計が表示される
- [ ] 全テーブルに RLS が設定されている
- [ ] `npm run build && npm run type-check && npm run lint` が全て通る
