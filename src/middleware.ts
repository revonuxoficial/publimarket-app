import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase'; // Asegúrate que la ruta a tus tipos de DB es correcta

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request and response cookies.
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request and response cookies.
          req.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session if expired - important to do before accessing session
  const { data: { user } } = await supabase.auth.getUser();
  
  // Obtener la sesión después de getUser para asegurar que esté actualizada
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Logs para depuración
  console.log(`[Middleware] Path: ${pathname}`);
  if (pathname.startsWith('/perfil') || pathname.startsWith('/dashboard')) { // Loguear solo para rutas protegidas relevantes
    console.log(`[Middleware] User from getUser():`, user ? { id: user.id, email: user.email } : null);
    console.log(`[Middleware] Session from getSession():`, session ? { user_id: session.user.id, expires_at: session.expires_at } : null);
  }

  // Proteger rutas /admin/*
  if (pathname.startsWith('/admin')) {
    if (!session || !user) { // Verificar también 'user' de getUser()
      return NextResponse.redirect(new URL('/auth?message=Acceso denegado. Inicia sesión.', req.url));
    }
    // Verificar rol de admin desde la tabla public.users
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id) // Usar user.id de getUser()
      .single();

    if (profileError || !userProfile || userProfile.role !== 'admin') {
      console.warn(`Intento de acceso a /admin por usuario no admin: ${user.id}, rol: ${userProfile?.role}`);
      return NextResponse.redirect(new URL('/?error=access_denied_admin', req.url)); // Redirigir al home con error
    }
  }

  // Proteger rutas /dashboard/vendedor/*
  if (pathname.startsWith('/dashboard/vendedor')) {
    if (!session || !user) { // Verificar también 'user' de getUser()
      // Si no hay sesión, redirigir a login para cualquier ruta de /dashboard/vendedor
      return NextResponse.redirect(new URL('/auth?message=Acceso denegado. Inicia sesión.', req.url));
    }

    // Permitir acceso a la página de suscripción para cualquier usuario autenticado
    if (pathname === '/dashboard/vendedor/suscripcion') {
      return response; // Permitir acceso
    }

    // Para todas las demás rutas /dashboard/vendedor/*, verificar si es Vendedor PRO
    const { data: vendorProfile, error: vendorError } = await supabase
      .from('vendors') // Consultar la tabla 'vendors'
      .select('is_pro') // Seleccionar la columna 'is_pro'
      .eq('user_id', user.id) // Usar user.id de getUser()
      .single();

    if ((vendorError && vendorError.code !== 'PGRST116') || !vendorProfile || !vendorProfile.is_pro) {
      if (vendorError && vendorError.code !== 'PGRST116') {
        console.error(`Error al consultar perfil de vendedor para ${user.id}:`, vendorError);
      }
      console.warn(`Intento de acceso a ${pathname} por usuario ${user.id} que no es Vendedor PRO o no tiene perfil de vendedor.`);
      const redirectUrl = new URL('/dashboard/vendedor/suscripcion', req.url);
      redirectUrl.searchParams.set('message', 'Necesitas ser Vendedor PRO para acceder a esta sección.');
      return NextResponse.redirect(redirectUrl);
    }
  } else if (pathname.startsWith('/dashboard')) {
    if (!session || !user) { // Verificar también 'user' de getUser()
      return NextResponse.redirect(new URL('/auth?message=Acceso denegado. Inicia sesión.', req.url));
    }
  }
  
  // Proteger rutas que requieren solo autenticación general, como /perfil o /favoritos
  if (pathname.startsWith('/perfil') || pathname.startsWith('/favoritos')) {
    if (!session || !user) { // Verificar también 'user' de getUser()
      return NextResponse.redirect(new URL('/auth?message=Debes iniciar sesión para acceder a esta página.', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de solicitud excepto las siguientes:
     * - Rutas de API (_next/static, _next/image, favicon.ico)
     * - Rutas públicas que no requieren autenticación (/, /productos, /producto/*, /tienda/*, /auth/*, páginas informativas)
     * Se enfoca en proteger /admin, /dashboard, /perfil, /favoritos
     */
    '/admin/:path*',
    '/dashboard/:path*',
    '/perfil/:path*', // Aunque /perfil ya tiene su propia lógica de redirección si no hay user
    '/favoritos/:path*',
    // No incluir rutas como '/auth/:path*' aquí si queremos que sean accesibles para no logueados
    // El matcher es para definir QUÉ rutas pasan por el middleware.
    // La lógica DENTRO del middleware decide si redirigir o no.
  ],
};
