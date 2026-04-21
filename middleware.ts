import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/create', '/my', '/profile', '/menu', '/wallet', '/job/add', '/resume', '/payments-history', '/wallet-transactions'];

function isProtectedPath(pathname: string) {
  if (pathname === '/logout') return true;
  if (pathname === '/payment' || pathname.startsWith('/payment/')) return false;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  response.headers.set('x-pathname', pathname);

  const supabaseUrl =
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
      .trim();
  const supabaseAnonKey =
    (process.env.SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      '').trim();

  // On Vercel Edge, missing env vars will crash the middleware. Fail open to
  // keep public pages working; protected routes will be handled by the page.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  if (isProtectedPath(pathname)) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else {
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
