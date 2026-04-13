'use client';

/**
 * app/(app)/layout.tsx
 *
 * 認証済みユーザー用レイアウト
 * タブナビゲーション: 7タブ構成（UIシェル）
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, type AuthUser } from '@/lib/contexts/AuthContext';
import WelcomePage from '@/components/landing/WelcomePage';
import {
  LayoutDashboard,
  Calendar,
  Map,
  Target,
  Users,
  UserPlus,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/tasks', label: 'タスク', icon: Calendar },
  { href: '/settings', label: '設定', icon: Settings },
  { href: '/action-map', label: 'Action Map', icon: Map },
  { href: '/okr', label: 'OKR', icon: Target },
  { href: '/clients', label: '既存客', icon: Users },
  { href: '/leads', label: '見込み客', icon: UserPlus },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const session = localStorage.getItem('aifcc_session');
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(session);
      setUser(parsed.user);
    } catch {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    localStorage.removeItem('aifcc_session');
    document.cookie = 'aifcc_session=; path=/; max-age=0';
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(25,25,24,0.5)' }}>
        読み込み中...
      </div>
    );
  }

  if (!user) {
    return <WelcomePage />;
  }

  return (
    <AuthProvider user={user} loading={loading}>
      <header className="header">
        <div className="header-content">
          <h1>AIFCC Cockpit</h1>
          <p className="subtitle">AIFCC Modular Starter</p>
        </div>
        <div className="header-actions">
          <span style={{ fontSize: '14px', color: 'rgba(25,25,24,0.6)' }}>
            {user.name || user.email}
          </span>
          <button className="btn btn-secondary btn-small" onClick={handleLogout}>
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
      </header>

      <div className="container">
        <nav className="tabs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`tab ${pathname === item.href ? 'active' : ''}`}
              >
                <Icon className="tab-icon" size={18} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <main>{children}</main>
      </div>
    </AuthProvider>
  );
}
