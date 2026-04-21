import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/create', '/my', '/profile', '/menu', '/wallet', '/job/add', '/resume', '/payments-history', '/wallet-transactions'];

function isProtectedPath(pathname: string) {
  if (pathname === '/logout') return true;
  if (pathname === '/payment' || pathname.startsWith('/payment/')) return false;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function normalizeEnv(v: string | undefined | null) {
  const trimmed = (v ?? '').trim();
  if (!trimmed) return '';
  const lowered = trimmed.toLowerCase();
  if (lowered === 'undefined' || lowered === 'null') return '';
  return trimmed;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  response.headers.set('x-pathname', pathname);

  const supabaseUrl = normalizeEnv(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const supabaseAnonKey = normalizeEnv(
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  // On Vercel Edge, missing env vars will crash the middleware. Fail open to
  // keep public pages working; protected routes will be handled by the page.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  try {
    const { createServerClient } = await import('@supabase/ssr');
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
  } catch {
    // Never take down the whole site because middleware auth failed.
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)',
  ],
};
