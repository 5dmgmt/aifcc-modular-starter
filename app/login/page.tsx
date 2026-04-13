'use client';

/**
 * app/login/page.tsx
 *
 * ログインページ（ミニマルスターター版）
 * デモ用: パスワード = "aifcc"
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // デモ用認証
    if (password === 'aifcc') {
      // セッション情報
      const session = JSON.stringify({
        user: { id: '1', email: 'demo@example.com', name: 'Demo User' },
        loggedInAt: new Date().toISOString(),
      });
      // Cookie にセッションを保存（proxy.ts と整合）
      document.cookie = `aifcc_session=${encodeURIComponent(session)}; path=/; max-age=${60 * 60 * 24 * 7}`;
      // localStorage にも保存（クライアント側の認証チェック用）
      localStorage.setItem('aifcc_session', session);
      // 少し遅延を入れてUIを見せる
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push('/dashboard');
    } else {
      setError('パスワードが違います');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>AIFCC Cockpit</h1>
        <p>AIFCC Modular Starter</p>

        <div className="form-group" style={{ textAlign: 'left' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} />
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="パスワードを入力"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div
            className="alert alert-error"
            style={{ marginBottom: '16px', textAlign: 'left' }}
          >
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleLogin}
          disabled={isLoading}
        >
          <LogIn size={18} />
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>

        <p style={{
          marginTop: '24px',
          fontSize: '12px',
          color: 'rgba(25, 25, 24, 0.5)',
          background: 'var(--bg-gray)',
          padding: '12px',
          borderRadius: '4px',
        }}>
          デモ用パスワード: <code style={{
            fontWeight: 700,
            color: 'var(--accent)',
          }}>aifcc</code>
        </p>
      </div>
    </div>
  );
}
