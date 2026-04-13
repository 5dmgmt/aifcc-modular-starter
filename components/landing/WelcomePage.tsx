'use client';

/**
 * components/landing/WelcomePage.tsx
 *
 * AIFCC Modular Starter ウェルカムページ
 * aifcc.jp のデザインシステムを踏襲
 */

import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, Database, Layers, Settings } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        paddingTop: '160px',
        paddingBottom: '120px',
        paddingLeft: '24px',
        paddingRight: '24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '768px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'var(--accent)',
            marginBottom: '16px',
          }}>
            AIFCC MODULAR STARTER
          </p>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: 'var(--text-dark)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
          }}>
            つくりながら、学ぶ。
          </h1>

          <p style={{
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'rgba(25, 25, 24, 0.7)',
            marginBottom: '48px',
            maxWidth: '640px',
            margin: '0 auto 48px',
          }}>
            Next.js 16 + TypeScript で、PART ごとに機能を積み上げていく
            ワークショップ用スターターキットです。
            ログインして、最初の PART を始めましょう。
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-dark)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}
            >
              ログインして始める
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Phase ロードマップ */}
      <section style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-gray)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: '768px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'rgba(25, 25, 24, 0.4)',
            marginBottom: '8px',
          }}>
            ROADMAP
          </p>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '48px',
            paddingBottom: 0,
            border: 'none',
          }}>
            PART ごとに機能を追加していきます
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {[
              {
                phase: 'PART 301',
                title: 'Foundation',
                desc: 'タスク CRUD + 設定ページ（localStorage）',
                icon: BookOpen,
                active: true,
              },
              {
                phase: 'PART 302',
                title: 'Database',
                desc: 'Supabase + Auth + Workspace 基盤',
                icon: Database,
              },
              {
                phase: 'PART 303',
                title: 'CRM',
                desc: '見込み客・既存客の管理',
                icon: Code2,
              },
              {
                phase: 'PART 304',
                title: 'Three-Layer',
                desc: 'Action Map + OKR + タスク連携',
                icon: Layers,
              },
              {
                phase: 'PART 305',
                title: 'Admin',
                desc: '権限管理・セキュリティ・監査ログ',
                icon: Settings,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.phase}
                  style={{
                    padding: '24px',
                    background: item.active ? 'var(--bg-white)' : 'var(--bg-white)',
                    border: item.active
                      ? '2px solid var(--text-dark)'
                      : '1px solid var(--border)',
                    borderRadius: '4px',
                    borderLeft: item.active
                      ? '4px solid var(--text-dark)'
                      : '1px solid var(--border)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                  }}>
                    <Icon size={20} style={{ color: item.active ? 'var(--text-dark)' : 'rgba(25,25,24,0.3)' }} />
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: item.active ? 'var(--text-dark)' : 'rgba(25,25,24,0.4)',
                      letterSpacing: '0.05em',
                    }}>
                      {item.phase}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                    margin: '0 0 8px',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(25, 25, 24, 0.6)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'rgba(25, 25, 24, 0.4)',
            marginBottom: '8px',
          }}>
            TECH STACK
          </p>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '32px',
            paddingBottom: 0,
            border: 'none',
          }}>
            このスターターで使う技術
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {[
              { name: 'Next.js 16', detail: 'App Router' },
              { name: 'React 19', detail: 'Server Components' },
              { name: 'TypeScript', detail: 'Strict Mode' },
              { name: 'Lucide Icons', detail: 'SVG Icons' },
              { name: 'Supabase', detail: 'PART 302+' },
              { name: 'Vercel', detail: 'Hosting' },
            ].map((tech) => (
              <div
                key={tech.name}
                style={{
                  padding: '16px',
                  borderLeft: '2px solid var(--text-dark)',
                  paddingLeft: '16px',
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-dark)',
                }}>
                  {tech.name}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(25, 25, 24, 0.5)',
                }}>
                  {tech.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--text-dark)',
        padding: '120px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '16px',
            paddingBottom: 0,
            border: 'none',
            lineHeight: 1.3,
          }}>
            準備はできましたか？
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '32px',
            lineHeight: 1.8,
          }}>
            パスワードは <code style={{
              fontWeight: 700,
              color: 'var(--accent)',
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 8px',
              borderRadius: '2px',
              fontSize: '15px',
            }}>aifcc</code> です
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 40px',
              background: 'white',
              color: 'var(--text-dark)',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-gray)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
          >
            ログイン
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '12px',
          color: 'rgba(25, 25, 24, 0.4)',
        }}>
          AIFCC Modular Starter &mdash; AIFCC Workshop
        </p>
      </footer>
    </div>
  );
}
