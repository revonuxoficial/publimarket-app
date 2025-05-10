import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Obtener la sesión del usuario
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario autenticado, redirigir a la página de inicio de sesión
  if (!user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth'; // Redirigir a la página de autenticación
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname); // Opcional: guardar la ruta original
    return NextResponse.redirect(redirectUrl);
  }

  // Obtener el perfil del usuario para verificar el rol
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  // Si hay un error al obtener el perfil o el rol no es 'pro_vendor', redirigir
  if (profileError || !userProfile || userProfile.role !== 'pro_vendor') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/'; // Redirigir a la página de inicio
    return NextResponse.redirect(redirectUrl);
  }

  // Si el usuario está autenticado y es 'pro_vendor', permitir el acceso
  return res;
}

// Configuración del matcher para aplicar este middleware solo a las rutas dentro de /dashboard
export const config = {
  matcher: '/dashboard/:path*',
};
