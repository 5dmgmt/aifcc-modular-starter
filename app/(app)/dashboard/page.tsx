'use client';

/**
 * app/(app)/dashboard/page.tsx
 *
 * ダッシュボードページ（Phase 0: 初期状態）
 */

import { ArrowRight, CheckSquare, Settings, Database, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      {/* ウェルカムカード */}
      <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '16px',
          color: 'var(--ancc-black)',
          border: 'none',
          padding: 0,
        }}>
          AIFCC Modular Starter へようこそ
        </h2>

        <p style={{
          color: 'rgba(25, 25, 24, 0.6)',
          fontSize: '16px',
          marginBottom: '32px',
          maxWidth: '500px',
          margin: '0 auto 32px',
          lineHeight: 1.8,
        }}>
          このダッシュボードは Phase 0 の初期状態です。<br />
          各 Phase を進めることで機能が追加されていきます。
        </p>

        {/* 次のステップ */}
        <div style={{
          background: 'var(--ancc-bg-alt)',
          borderRadius: '4px',
          padding: '24px',
          textAlign: 'left',
          maxWidth: '400px',
          margin: '0 auto',
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--ancc-black)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <BookOpen size={16} />
            次のステップ
          </h3>

          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '14px', color: 'rgba(25, 25, 24, 0.7)' }}>
                PART 301: タスク・設定を追加
              </span>
              <ArrowRight size={14} style={{ color: 'rgba(25, 25, 24, 0.3)', marginLeft: 'auto' }} />
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '14px', color: 'rgba(25, 25, 24, 0.7)' }}>
                PART 302: DB・認証を追加
              </span>
              <ArrowRight size={14} style={{ color: 'rgba(25, 25, 24, 0.3)', marginLeft: 'auto' }} />
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Database size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '14px', color: 'rgba(25, 25, 24, 0.7)' }}>
                PART 303: 顧客管理を追加
              </span>
              <ArrowRight size={14} style={{ color: 'rgba(25, 25, 24, 0.3)', marginLeft: 'auto' }} />
            </li>
          </ul>
        </div>
      </div>

      {/* Coming Soon カード */}
      <div className="stats-grid" style={{ marginTop: '24px' }}>
        <div className="stat-card" style={{ opacity: 0.5 }}>
          <div className="stat-value">&mdash;</div>
          <div className="stat-label">タスク数（Phase 1）</div>
        </div>
        <div className="stat-card" style={{ opacity: 0.5 }}>
          <div className="stat-value">&mdash;</div>
          <div className="stat-label">完了数（Phase 1）</div>
        </div>
        <div className="stat-card" style={{ opacity: 0.5 }}>
          <div className="stat-value">&mdash;</div>
          <div className="stat-label">進捗率（Phase 1）</div>
        </div>
      </div>
    </div>
  );
}
