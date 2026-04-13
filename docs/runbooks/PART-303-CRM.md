# PART 303: CRM（見込み客 + 既存客管理）

## 概要

- **所要時間**: 90分
- **前提**: PART 302 完了（Supabase + Auth + Workspace が動作）
- **成果物**: 見込み客タブ（リード管理）、既存客タブ（クライアント管理）、リード→クライアント変換

### 対応タブ

| タブ | 実装内容 |
|------|---------|
| 見込み客 | リード CRUD + ファネルステータス管理 |
| 既存客 | クライアント CRUD + リードからの変換 |

### 依存関係

- PART 302 完了が必須（Supabase + Auth + Workspace）

---

## Phase 30301: 見込み客タブ（リード管理）

### learns

- **なぜ必要か**: 見込み客（リード）の管理は営業の基本。ファネルのどの段階にいるかを可視化することで、次にどのリードにアプローチすべきかが分かる。
- **何を理解するか**: リードのデータ構造、ファネルステータス（NEW → CONTACTED → PROPOSAL → WON / LOST）、カンバンとリスト表示の切り替え。

### prompt

```
見込み客（リード）管理機能を作って。

## 1. テーブル設計

supabase/migrations/ にマイグレーションを追加:

### prospects テーブル
- id: UUID (PK)
- workspace_id: UUID (FK → workspaces)
- company_name: TEXT (NOT NULL)
- contact_name: TEXT (NOT NULL)
- email: TEXT
- phone: TEXT
- status: TEXT (DEFAULT 'NEW', CHECK: 'NEW'/'CONTACTED'/'PROPOSAL'/'WON'/'LOST')
- source: TEXT（どこで知ったか）
- notes: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

RLS: 同じ workspace のメンバーのみアクセス可能。

## 2. 見込み客ページ

app/(app)/leads/page.tsx を作成:

### リスト表示
- テーブル形式で全リードを表示
- ステータスごとに色分け（NEW: var(--info), CONTACTED: var(--warning), PROPOSAL: var(--accent), WON: var(--success), LOST: var(--error)）
- 検索（会社名 / 担当者名でフィルター）
- ステータスフィルター

### 追加モーダル
- 会社名、担当者名、メール、電話、ソース、メモを入力
- 追加後にリストを更新

### 編集・削除
- 各リードの編集ボタンでモーダルを開く
- ステータス変更ドロップダウン
- 削除ボタン（確認ダイアログ付き）

## 制約
- Supabase のリアルタイムは不要（通常の fetch で十分）
- globals.css の CSS 変数のみ使用
```

### checks

- [ ] リードの追加・表示・編集・削除が動作する
- [ ] ステータスの変更（NEW → CONTACTED → PROPOSAL → WON/LOST）が動作する
- [ ] 検索とステータスフィルターが動作する
- [ ] RLS が効いている（他の Workspace のリードにアクセスできない）
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. http://localhost:3000/leads を開く
2. リードを 3 件追加 → リストに表示される
3. リードのステータスを変更 → 色が変わる
4. 検索欄に会社名を入力 → フィルターされる
5. リードを編集 → 内容が更新される
6. リードを削除 → 確認ダイアログ → リストから消える

---

## Phase 30302: 既存客タブ（クライアント管理）

### learns

- **なぜ必要か**: WON になったリードは「既存客」に昇格する。既存客を別タブで管理することで、営業（リード）と顧客対応（既存客）を明確に分離できる。
- **何を理解するか**: リード→クライアント変換のデータフロー、clients テーブル設計、既存客固有のフィールド（契約日、MRR 等）。

### prompt

```
既存客管理機能を作って。

## 1. テーブル設計

supabase/migrations/ にマイグレーションを追加:

### clients テーブル
- id: UUID (PK)
- workspace_id: UUID (FK → workspaces)
- prospect_id: UUID (FK → prospects, NULL可)
- company_name: TEXT (NOT NULL)
- contact_name: TEXT (NOT NULL)
- email: TEXT
- phone: TEXT
- contract_date: DATE（契約日）
- monthly_revenue: INTEGER（月額、円）
- status: TEXT (DEFAULT 'ACTIVE', CHECK: 'ACTIVE'/'INACTIVE'/'CHURNED')
- notes: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

RLS: 同じ workspace のメンバーのみアクセス可能。

## 2. 既存客ページ

app/(app)/clients/page.tsx を作成:

### リスト表示
- テーブル形式で全クライアントを表示
- ステータスで色分け（ACTIVE: var(--success), INACTIVE: var(--warning), CHURNED: var(--error)）
- 検索（会社名 / 担当者名）
- ステータスフィルター

### 追加モーダル
- 手動追加（会社名、担当者名、契約日、月額 等）
- 追加後にリストを更新

### 編集・削除
- 各クライアントの編集ボタン
- 削除ボタン（確認ダイアログ付き）

## 制約
- globals.css の CSS 変数のみ使用
```

### checks

- [ ] クライアントの追加・表示・編集・削除が動作する
- [ ] ステータスの変更が動作する
- [ ] 検索とフィルターが動作する
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. http://localhost:3000/clients を開く
2. クライアントを手動で 2 件追加 → リストに表示される
3. 編集 → 月額を変更 → 更新される
4. ステータスを CHURNED に変更 → 色が赤に変わる

---

## Phase 30303: リード→クライアント変換

### learns

- **なぜ必要か**: 営業ファネルの終着点は「成約」。リードが WON になったら自動（または手動）でクライアントに変換することで、データの二重入力を防ぎ、営業→顧客対応のシームレスな引き継ぎを実現する。
- **何を理解するか**: ステータス遷移トリガー、データ移行パターン（コピー + リンク）、prospect_id による紐づけ。

### prompt

```
リードが WON になった時にクライアントに変換する機能を作って。

## 1. 変換フロー

見込み客タブでリードのステータスを「WON」に変更した時:
1. 確認ダイアログ: 「このリードを既存客に変換しますか？」
2. 「変換する」を押すと:
   - clients テーブルにレコードを作成（prospect_id でリンク）
   - 会社名、担当者名、メール、電話を自動コピー
   - contract_date はデフォルトで今日の日付
   - monthly_revenue は空（後から入力）
3. 成功メッセージを表示

## 2. 変換済み表示

見込み客タブで WON のリードに「既存客へ変換済み」バッジを表示。
バッジをクリックすると既存客タブの該当レコードに遷移。

## 3. 既存客タブでの表示

既存客タブで prospect_id がある場合、「元リード」のリンクを表示。
クリックすると見込み客タブの該当リードに遷移。

## 制約
- 変換は片方向（既存客→リードへの戻しは不要）
- LOST のリードは変換できない
```

### checks

- [ ] リードを WON にすると変換確認ダイアログが出る
- [ ] 変換後、clients テーブルにレコードが作成される
- [ ] 変換済みリードに「既存客へ変換済み」バッジが表示される
- [ ] 既存客から元リードへのリンクが動作する
- [ ] `npm run type-check && npm run lint` がエラーなしで通る

**localhost 動作確認**:
1. 見込み客タブでリードのステータスを WON に変更
2. 確認ダイアログ → 「変換する」をクリック
3. 既存客タブを開く → 変換されたクライアントが表示される
4. Supabase ダッシュボードで clients テーブルに prospect_id が入っていることを確認

---

## DoD（PART 303 全体の完了条件）

- [ ] 見込み客タブ: リード CRUD + ファネルステータス管理が動作
- [ ] 既存客タブ: クライアント CRUD が動作
- [ ] WON リード → クライアント変換が動作
- [ ] prospects, clients テーブルに RLS が設定されている
- [ ] 検索とフィルターが各タブで動作する
- [ ] `npm run build && npm run type-check && npm run lint` が全て通る
