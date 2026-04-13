# Phase 9.94 WS-A: パフォーマンス & 最適化 起動プロンプト

## 起動コマンド

```
claude --resume-from /Users/5dmgmt/プラグイン/foundersdirect
```

---

## プロンプト本文

```markdown
# Phase 9.94 WS-A: パフォーマンス & 最適化

あなたは AIFCC プロジェクトの **WS-A（パフォーマンス & 最適化）** 担当です。

## 必読ドキュメント

以下を最初に読み込んでください：

1. `/Users/5dmgmt/プラグイン/foundersdirect/docs/PHASE9.94-POLISH-RUNBOOK.md` - メインランブック
2. `/Users/5dmgmt/プラグイン/foundersdirect/docs/PHASE9.94-A-PERFORMANCE.md` - WS-A 詳細
3. `/Users/5dmgmt/プラグイン/foundersdirect/docs/PERFORMANCE-BASELINE.md` - 現在の基準値
4. `/Users/5dmgmt/プラグイン/foundersdirect/docs/RSC-POC-REPORT.md` - RSC 導入方針

## 目標

| 指標 | 現状 | 目標 | CI 閾値 |
|------|------|------|---------|
| Lighthouse Performance | 推定70 | **90+** | 85 |
| Dashboard First Load JS | 145KB | **120KB** | 130KB |
| LCP | 未計測 | **< 2.0s** | 2.5s |
| FCP | 未計測 | **< 1.5s** | 1.8s |

## タスク一覧

| # | タスク | 依存 | 完了判定 |
|---|--------|------|---------|
| A-01 | Lighthouse 初回計測（本番ビルド） | なし | 全ページのスコア記録 |
| A-02 | RSC 本格導入: Reports ページ | なし | TTFB 30%改善 |
| A-03 | RSC 本格導入: Dashboard KPI | A-02 | SSG/ISR 適用 |
| A-04 | next/image 置換（3箇所） | なし | `no-img-element` 警告 0 |
| A-05 | 未使用 CSS 削除 | なし | globals.css 600行以下 |
| A-06 | フォント最適化（next/font） | なし | FOUT 解消 |
| A-07 | Lighthouse 最終計測 | A-01〜A-06 | Performance 90+ |

---

## 🚨 同期ポイント（必ず停止して報告）

### SYNC-A1: WS-D CI 基盤確認（A-01 開始前）

**確認内容:** WS-D の CI 基盤（Day 2 完了予定）が利用可能か

```bash
# 確認コマンド
ls -la .github/workflows/quality-gate.yml
```

**判定:**
- ✅ ファイル存在 → 続行
- ❌ ファイル不存在 → **STOP**: 以下を報告して待機

```
🔄 SYNC-A1 待機中

WS-D の CI 基盤が未完了です。
- 確認日時: [現在時刻]
- 待機理由: quality-gate.yml が存在しない
- 必要アクション: WS-D 担当に CI 基盤完了を確認

手動で Lighthouse を実行する場合は続行可能ですが、
CI 連携は WS-D 完了後になります。

続行しますか？ [y/n]
```

---

### SYNC-A2: RSC 移行前の認証確認（A-02 開始前）

**確認内容:** RSC 用の認証ヘルパーが存在するか

```bash
# 確認コマンド
ls -la lib/server/auth.ts
```

**判定:**
- ✅ ファイル存在 → 続行
- ❌ ファイル不存在 → 作成してから続行

---

### SYNC-A3: 中間レポート（A-03 完了後）

**必須報告:**

```
📊 WS-A 中間レポート

## 完了タスク
- [ ] A-01: Lighthouse 初回計測
- [ ] A-02: Reports RSC 化
- [ ] A-03: Dashboard KPI RSC 化

## 計測結果
| 指標 | Before | After | 変化 |
|------|--------|-------|------|
| Lighthouse Performance | ___ | ___ | ___% |
| Dashboard First Load JS | 145KB | ___KB | ___% |
| Reports TTFB | ___ms | ___ms | ___% |

## ブロッカー
- なし / あれば記載

## 残りタスク
- A-04, A-05, A-06, A-07

次のタスクに進みますか？ [y/n]
```

---

### SYNC-A4: 最終レポート（A-07 完了後）

**必須報告:**

```
✅ WS-A 完了レポート

## 達成状況
| 指標 | Before | After | 目標 | 達成 |
|------|--------|-------|------|------|
| Lighthouse Performance | ___ | ___ | 90+ | ✅/❌ |
| Dashboard First Load JS | 145KB | ___KB | 120KB | ✅/❌ |
| LCP | ___s | ___s | <2.0s | ✅/❌ |
| FCP | ___s | ___s | <1.5s | ✅/❌ |

## 実施内容
1. ...
2. ...

## 残課題（あれば）
- ...

## 他 WS への影響
- WS-D: Lighthouse CI 閾値を [値] に設定推奨

WS-A 完了。Phase 9.94 統合待ち。
```

---

## 実行開始

上記を理解したら、まず SYNC-A1 の確認から開始してください。
WS-D の CI 基盤状況を確認し、結果を報告してください。
```

---

## 使用方法

1. Claude Code を起動
2. 上記プロンプトをコピー＆ペースト
3. WS-A が自動的に開始され、同期ポイントで停止・報告

