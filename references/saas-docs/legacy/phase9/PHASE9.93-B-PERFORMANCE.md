# Phase 9.93-B: パフォーマンス最適化 & バンドルサイズ削減

**最終更新:** 2025-11-25
**ステータス:** 待機中（Phase 9.92 完了後に開始）
**並列ワークストリーム:** B（4並列中）
**依存関係:** なし（A と並列実行可能）

---

## 必読ドキュメント（作業開始前に必ず確認）

| ドキュメント | パス | 確認項目 |
|-------------|------|---------|
| **グランドガイド** | `docs/AIFCC-GRAND-GUIDE.md` | プロジェクト全体方針、技術スタック |
| **開発ガイド** | `docs/guides/DEVELOPMENT.md` | 基本ルール、React実装ルール |
| **統括ランブック** | `docs/PHASE9.93-BUGFIX-RUNBOOK.md` | Phase 9.93 全体の DOD、パフォーマンス要件 |
| **技術負債** | `docs/TECH-DEBT-INVENTORY.md` | 現在の技術負債一覧 |

---

## 0. ワークストリーム概要

### 0.1 目的

バンドルサイズ削減、Lighthouse スコア改善、CI 自動チェックの導入を行う。

### 0.2 スコープ

| タスクID | タスク名 | 内容 |
|---------|---------|------|
| PERF-01 | 基準値計測 | Phase 9.92 完了時点のパフォーマンス値を記録 |
| PERF-02 | コード分割 | `next/dynamic` による重いタブの遅延ロード |
| PERF-03 | RSC PoC | Reports タブでの Server Components 検証 |
| PERF-04 | CSS 移行方針決定 | Tailwind or CSS Modules の方針決定 |
| PERF-05 | CI 自動チェック | バンドルサイズ・Lighthouse の閾値監視 |

### 0.3 完了条件（DOD）

- [ ] 基準値が記録されている
- [ ] 初期バンドルサイズが Phase 9.92 比で 15% 以上削減
- [ ] Lighthouse Performance スコア 70 以上
- [ ] CI でパフォーマンス閾値チェックが動作している
- [ ] RSC PoC が完了し結果がドキュメント化されている
- [ ] CSS 移行方針が決定されている

---

## 1. PERF-01: 基準値計測

### 1.1 目的

Phase 9.92 完了時点のパフォーマンス値を記録し、改善の比較対象とする。

### 1.2 計測手順

```bash
# 1. ビルド実行
npm run build

# 2. バンドルサイズ確認
ls -lh .next/static/chunks/*.js | head -20

# 3. バンドル分析（詳細）
ANALYZE=true npm run build
# → .next/analyze/ にレポート生成

# 4. Lighthouse 計測
npm run dev &  # 開発サーバー起動
npx lighthouse http://localhost:3000/dashboard --output=json --output-path=./lighthouse-phase992.json --preset=desktop
```

### 1.3 記録テンプレート

**`docs/PERFORMANCE-BASELINE.md` を作成:**

```markdown
# パフォーマンス基準値

## Phase 9.92 完了時点（基準値）

**計測日:** YYYY-MM-DD
**計測者:** [名前]
**環境:** macOS / Chrome XX / Node XX

### バンドルサイズ

| チャンク | サイズ |
|---------|--------|
| main-XXXXX.js | _____ KB |
| framework-XXXXX.js | _____ KB |
| commons-XXXXX.js | _____ KB |
| **合計** | _____ KB |

### Lighthouse スコア

| 指標 | 値 |
|------|-----|
| Performance | ___ / 100 |
| First Contentful Paint (FCP) | _____ ms |
| Largest Contentful Paint (LCP) | _____ ms |
| Total Blocking Time (TBT) | _____ ms |
| Cumulative Layout Shift (CLS) | _____ |

### Phase 9.93 目標値

| 指標 | 基準値 | 目標値（-15%） |
|------|--------|---------------|
| 合計バンドルサイズ | _____ KB | _____ KB |
| Lighthouse Performance | ___ | 70+ |
| LCP | _____ ms | < 2500ms |
```

---

## 2. PERF-02: コード分割（next/dynamic）

### 2.1 目的

重いタブを遅延ロードし、初期バンドルサイズを削減する。

### 2.2 対象タブ

| タブ | 優先度 | 理由 | 対象コンポーネント |
|------|--------|------|-------------------|
| Reports | 高 | グラフライブラリ（recharts）が重い | `ReportsContent` |
| Zoom | 高 | 動画/エディタ機能 | `ZoomContent` |
| Templates | 中 | エディタコンポーネント | `TemplatesContent` |
| LeanCanvas | 中 | キャンバス描画 | `LeanCanvasContent` |

### 2.3 実装例

```tsx
// app/(app)/reports/page.tsx
import dynamic from 'next/dynamic';

// 遅延ロードコンポーネント
const ReportsContent = dynamic(
  () => import('@/app/_components/reports/ReportsContent'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">読み込み中...</span>
      </div>
    ),
    ssr: false  // クライアントサイドのみでレンダリング
  }
);

export default function ReportsPage() {
  return <ReportsContent />;
}
```

### 2.4 実装チェックリスト

| # | タスク | 完了 |
|---|--------|------|
| 1 | Reports タブに `next/dynamic` 適用 | [ ] |
| 2 | Zoom タブに `next/dynamic` 適用 | [ ] |
| 3 | ローディング UI が適切に表示される | [ ] |
| 4 | タブ切替時の UX が劣化していない | [ ] |
| 5 | バンドルサイズ削減効果を計測 | [ ] |

---

## 3. PERF-03: RSC PoC（Server Components 検証）

### 3.1 目的

React Server Components の効果を検証し、Phase 10 以降への適用判断を行う。

### 3.2 対象

Reports タブ（集計データ取得）

### 3.3 実装ステップ

#### Step 1: Server Action 作成

```typescript
// lib/actions/reports.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function getReportsSummary(workspaceId: string) {
  const supabase = createClient();

  // サーバーサイドでデータ取得
  const { data, error } = await supabase
    .from('workspace_data')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();

  if (error) throw error;

  // 集計処理（サーバーで実行）
  const summary = {
    totalLeads: data.leads?.length || 0,
    totalClients: data.clients?.length || 0,
    // ... 他の集計
  };

  return summary;
}
```

#### Step 2: Server Component 化

```tsx
// app/(app)/reports/page.tsx
import { getReportsSummary } from '@/lib/actions/reports';
import { ReportsContent } from '@/app/_components/reports/ReportsContent';

// Server Component（async）
export default async function ReportsPage() {
  // サーバーでデータ取得
  const summary = await getReportsSummary('current-workspace-id');

  // クライアントコンポーネントに初期データを渡す
  return <ReportsContent initialData={summary} />;
}
```

### 3.4 効果測定

| 指標 | クライアントフェッチ | RSC | 差分 |
|------|---------------------|-----|------|
| TTFB | _____ ms | _____ ms | _____ ms |
| LCP | _____ ms | _____ ms | _____ ms |
| バンドルサイズ | _____ KB | _____ KB | _____ KB |

### 3.5 成功判定基準

| 判定 | 条件 | 次のアクション |
|------|------|---------------|
| **成功** | LCP 20%↓ AND バンドル 15%↓ | Phase 10 で Dashboard, Clients に展開 |
| **部分成功** | どちらか一方のみ改善 | Reports のみ RSC 維持 |
| **失敗** | 改善なし or 悪化 | クライアントフェッチ維持 |

### 3.6 結果ドキュメント

**`docs/RSC-POC-REPORT.md` を作成:**

```markdown
# RSC PoC 結果レポート

## 実施概要
- 対象: Reports タブ
- 実施日: YYYY-MM-DD
- 担当: [名前]

## 実装内容
- Server Action: `lib/actions/reports.ts`
- Server Component: `app/(app)/reports/page.tsx`

## 効果測定結果
（上記の表を埋める）

## 判定
- [ ] 成功
- [ ] 部分成功
- [ ] 失敗

## 考察
（改善/悪化の理由分析）

## 推奨事項
（Phase 10 への提言）
```

---

## 4. PERF-04: CSS 移行方針決定

### 4.1 選択肢

| 方式 | メリット | デメリット |
|------|---------|----------|
| **Tailwind CSS** | バンドル小、デザイン変更容易 | 学習コスト、既存CSS書き直し |
| **CSS Modules** | 低学習コスト、移動のみ | スコープ化のみ、バンドル中 |

### 4.2 判断基準

- **短期（Phase 9.93）**: CSS Modules 推奨（移行コスト低）
- **中長期**: Tailwind への段階移行を視野

### 4.3 決定記録

**`docs/CSS-MIGRATION-DECISION.md` を作成:**

```markdown
# CSS 移行方針決定

## 決定日: YYYY-MM-DD
## 決定者: [名前]

## 選択した方式
- [ ] Tailwind CSS
- [ ] CSS Modules

## 理由
（選択理由を記載）

## Phase 9.93 での適用範囲
- 新規コンポーネント: 選択した方式で実装
- 既存コンポーネント: 現状維持（Phase 10 で段階移行）

## globals.css の整理方針
（移行対象/維持/削除の判断基準）
```

---

## 5. PERF-05: CI 自動チェック

### 5.1 目的

パフォーマンス劣化を自動検出し、PR をブロックする。

### 5.2 バンドルサイズチェックスクリプト

**scripts/check-bundle-size.js:**

```javascript
#!/usr/bin/env node
// scripts/check-bundle-size.js

const fs = require('fs');
const path = require('path');

const THRESHOLDS = {
  mainChunk: 200 * 1024,  // 200KB
  totalSize: 500 * 1024,  // 500KB
};

const chunksDir = path.join(__dirname, '../.next/static/chunks');

if (!fs.existsSync(chunksDir)) {
  console.error('❌ .next/static/chunks not found. Run npm run build first.');
  process.exit(1);
}

const files = fs.readdirSync(chunksDir).filter(f => f.endsWith('.js'));
let totalSize = 0;
let mainSize = 0;

files.forEach(file => {
  const filePath = path.join(chunksDir, file);
  const stats = fs.statSync(filePath);
  totalSize += stats.size;

  if (file.startsWith('main-')) {
    mainSize = stats.size;
  }
});

console.log(`📦 Bundle Size Report`);
console.log(`   Main chunk: ${(mainSize / 1024).toFixed(2)} KB (threshold: ${THRESHOLDS.mainChunk / 1024} KB)`);
console.log(`   Total size: ${(totalSize / 1024).toFixed(2)} KB (threshold: ${THRESHOLDS.totalSize / 1024} KB)`);

let failed = false;

if (mainSize > THRESHOLDS.mainChunk) {
  console.error(`❌ Main chunk exceeds threshold!`);
  failed = true;
}

if (totalSize > THRESHOLDS.totalSize) {
  console.error(`❌ Total size exceeds threshold!`);
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log(`✅ Bundle size within limits.`);
```

### 5.3 package.json への追加

```json
{
  "scripts": {
    "check:bundle": "node scripts/check-bundle-size.js",
    "check:lighthouse": "npx lighthouse http://localhost:3000/dashboard --output=json --budget-path=./budget.json",
    "check:perf": "npm run build && npm run check:bundle"
  }
}
```

### 5.4 Lighthouse Budget ファイル

**budget.json:**

```json
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "script", "budget": 500 }
    ],
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "first-contentful-paint", "budget": 1500 }
    ]
  }
]
```

### 5.5 GitHub Actions（任意）

**.github/workflows/performance.yml:**

```yaml
name: Performance Check

on:
  pull_request:
    branches: [main]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run check:bundle
```

---

## 6. 実行順序

```
1. PERF-01 基準値計測（30分）
   ↓
2. PERF-02 コード分割（2時間）
   ↓
3. PERF-05 CI 自動チェック（1時間）
   ↓
4. PERF-03 RSC PoC（3時間）← 並列可
   ↓
5. PERF-04 CSS 方針決定（30分）← 並列可
   ↓
6. 効果測定・ドキュメント化（1時間）
```

**合計推定時間:** 6〜8時間

---

## 7. 完了チェックリスト

| # | 項目 | 確認 |
|---|------|------|
| 1 | `docs/PERFORMANCE-BASELINE.md` が作成されている | [ ] |
| 2 | Reports タブに `next/dynamic` が適用されている | [ ] |
| 3 | Zoom タブに `next/dynamic` が適用されている | [ ] |
| 4 | 初期バンドルサイズが 15% 以上削減されている | [ ] |
| 5 | Lighthouse Performance が 70 以上 | [ ] |
| 6 | `scripts/check-bundle-size.js` が動作する | [ ] |
| 7 | `npm run check:perf` が Pass | [ ] |
| 8 | `docs/RSC-POC-REPORT.md` が作成されている | [ ] |
| 9 | `docs/CSS-MIGRATION-DECISION.md` が作成されている | [ ] |

---

## 8. 次のワークストリームへの引き継ぎ

### 8.1 他ワークストリームへの影響

| ワークストリーム | 影響 |
|----------------|------|
| A（レガシー隔離） | なし |
| C（UI検証） | コード分割後の UI 確認が必要 |
| D（UAT・ゲート） | パフォーマンス KPI が前提条件 |

### 8.2 完了報告フォーマット

```markdown
## Phase 9.93-B 完了報告

**完了日時:** YYYY-MM-DD HH:MM
**担当:** [名前]

### パフォーマンス改善結果

| 指標 | Before | After | 改善率 |
|------|--------|-------|--------|
| 合計バンドル | ___KB | ___KB | __% |
| Lighthouse | ___ | ___ | +___ |

### 実施内容
- [x] 基準値計測
- [x] コード分割（Reports, Zoom）
- [x] CI 自動チェック導入
- [ ] RSC PoC（成功/部分成功/失敗）
- [x] CSS 方針決定

### 作成ドキュメント
- `docs/PERFORMANCE-BASELINE.md`
- `docs/RSC-POC-REPORT.md`
- `docs/CSS-MIGRATION-DECISION.md`

### 残課題
- （あれば記載）
```

---

**次のドキュメント:** `PHASE9.93-C-UI-VERIFICATION.md`
