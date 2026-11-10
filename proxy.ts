/**
 * proxy.ts
 *
 * Next.js 16 Proxy - 認証チェックとリダイレクト
 *
 * 【責務】
 * - 守る経路（app/(app)/ の 7 画面と、その下の経路）だけ、Cookie のセッションを検証する
 * - 未認証ユーザーが守る経路に来たら /login へリダイレクト
 * - 認証済みユーザーの /login へのアクセスを /dashboard へリダイレクト
 * - それ以外の経路（/・/services・/contact・/blog・sitemap.xml・robots.txt など）は、
 *   ログインの有無にかかわらず通す（自分の HP を訪問者と検索エンジンに見せるため）
 *
 * 守る画面を増やすときは、PROTECTED_PATHS に足す。
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 守る経路（app/(app)/ の 7 画面）。その下の経路（例: /tasks/123）も守る
const PROTECTED_PATHS = [
  '/dashboard',
  '/leads',
  '/clients',
  '/tasks',
  '/okr',
  '/action-map',
  '/settings',
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cookie からセッション情報を取得
  const aifccSession = request.cookies.get('aifcc_session');
  const hasSession = !!aifccSession?.value;

  // ログインページへのアクセス
  if (pathname === '/login') {
    if (hasSession) {
      // 既にログイン済み → /dashboard へリダイレクト
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 守る経路（/dashboard, /leads, /clients など）
  if (isProtectedPath(pathname) && !hasSession) {
    // 未認証 → /login へリダイレクト
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // それ以外（/ を含む）と、認証済みの守る経路 → そのまま通過
  return NextResponse.next();
}

/**
 * Proxy を適用するパスの設定
 */
export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - api (API routes)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico, manifest.json
     * - 画像ファイル
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
