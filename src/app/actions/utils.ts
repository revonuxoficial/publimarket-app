'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase

/**
 * Verifica el estado del vendedor autenticado (si es vendedor y si es PRO).
 * Redirige si el usuario no está autenticado o no es un vendedor.
 * @returns Una promesa que resuelve con un objeto que contiene el usuario, su vendor_id y un booleano isPro.
 */
export async function checkProVendor(): Promise<{ user: NonNullable<Database['public']['Tables']['users']['Row']>; vendorId: string; isPro: boolean }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } = {} } = await supabase.auth.getUser();

  if (!user) {
    // Si no hay usuario, redirigir a la página de autenticación
    redirect('/auth?message=Debes iniciar sesión para acceder a esta función.');
  }

  // Obtener el perfil del usuario, incluyendo rol y vendor_id
  // Asumimos que la tabla 'users' tiene 'role' y 'vendor_id' (que puede ser null si no es vendedor)
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('role, vendor_id')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    console.error('Error al obtener perfil de usuario o perfil no encontrado:', profileError);
    // Si hay error o no se encuentra el perfil, redirigir.
    // Esto puede ocurrir si el usuario fue eliminado o hay inconsistencia.
    redirect('/?error=profile_not_found'); 
  }

  if (!userProfile.vendor_id) {
    // Si no tiene vendor_id, no es un vendedor configurado.
    // Podría redirigir a una página para completar el perfil de vendedor o al dashboard.
    console.warn(`Usuario ${user.id} no tiene un vendor_id configurado.`);
    redirect('/dashboard/settings/store?message=Completa tu perfil de tienda para continuar.'); 
  }
  
  const isPro = userProfile.role === 'pro_vendor';

  return { user: user as NonNullable<Database['public']['Tables']['users']['Row']>, vendorId: userProfile.vendor_id, isPro };
}

/**
 * Verifica si el usuario autenticado tiene el rol 'admin'.
 * Si no está autenticado o no es admin, redirige.
 * @returns Una promesa que resuelve con el objeto user si es admin.
 */
export async function checkAdmin() {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } = {} } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?message=Acceso denegado. Debes iniciar sesión.');
  }

  // Obtener el rol del usuario desde la tabla 'users'
  // Asumimos que la tabla 'users' tiene una columna 'role'
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !userProfile || userProfile.role !== 'admin') {
    // Redirigir a una página de acceso denegado o al inicio
    console.warn(`Acceso denegado para el usuario ${user.id}. Rol actual: ${userProfile?.role}`);
    redirect('/?error=access_denied'); 
  }

  return { user }; // Devolver el usuario si la verificación es exitosa
}
