'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase

/**
 * Verifica si el usuario autenticado tiene el rol 'pro_vendor' y obtiene su vendor_id.
 * Si no está autenticado o no es PRO, redirige.
 * @returns Una promesa que resuelve con un objeto que contiene el usuario y su vendor_id.
 */
export async function checkProVendor() {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } = {} } = await supabase.auth.getUser(); // Usar {} como valor por defecto

  if (!user) {
    // Si no hay usuario, redirigir a la página de autenticación
    redirect('/auth');
  }

  // Obtener el rol del usuario desde la tabla 'users'
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('role, vendor_id')
    .eq('id', user.id)
    .single();

  if (error || !userProfile || userProfile.role !== 'pro_vendor' || !userProfile.vendor_id) {
    // Si hay error, no se encuentra el perfil, no es PRO, o no tiene vendor_id, redirigir
    // Podríamos redirigir a una página de "Acceso Denegado" o al inicio
    redirect('/'); // Redirigir al inicio por simplicidad en este MVP
  }

  return { user, vendorId: userProfile.vendor_id };
}
