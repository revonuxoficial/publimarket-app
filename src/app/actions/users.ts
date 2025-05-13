'use server';

import { createServerActionClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { checkAdmin } from '@/app/actions/utils';
import { revalidatePath } from 'next/cache';

export interface UserProfile {
  id: string; // Corresponde a auth.users.id
  email?: string; // De auth.users
  role: string | null;
  vendor_id: string | null;
  created_at: string; // De auth.users
  // Podríamos añadir más campos si la tabla 'users' los tiene, como nombre, avatar, etc.
  // Por ahora, nos centramos en lo que tenemos.
  // Para obtener el email y created_at, necesitamos consultar auth.users.
  // Supabase no permite joins directos entre public.users y auth.users en RLS fácilmente.
  // Una opción es obtener los IDs de public.users y luego hacer una llamada de admin para los detalles de auth.users.
}

interface GetUsersParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  roleFilter?: string;
}

interface GetUsersResult {
  data: UserProfile[] | null;
  error?: string;
  totalCount: number | null;
}

/**
 * Obtiene una lista paginada de perfiles de usuario de la tabla 'public.users'
 * y enriquece con datos de 'auth.users' usando el cliente de admin.
 * Solo para administradores.
 */
export async function getUsers({
  page = 1,
  pageSize = 10,
  searchTerm,
  roleFilter,
}: GetUsersParams): Promise<GetUsersResult> {
  await checkAdmin();
  const supabase = createServerComponentClient<Database>({ cookies }); // Cliente normal para la tabla public.users
  
  // Para acceder a auth.users, necesitamos un cliente con service_role key.
  // Esto es delicado y debe hacerse con cuidado.
  // Por ahora, simplificaremos y obtendremos datos solo de public.users y el email del usuario logueado si es el mismo.
  // Una implementación completa requeriría una Edge Function o un backend seguro para consultar auth.users.

  // Paso 1: Consultar la tabla public.users
  let query = supabase.from('users').select('*', { count: 'exact' });

  if (searchTerm) {
    // Asumimos que la tabla 'users' tiene un campo 'email' o que podemos buscar por ID si el searchTerm es un UUID
    // O que el 'email' está en 'auth.users' y necesitamos una estrategia diferente.
    // Por ahora, si 'users' no tiene email, este filtro no funcionará bien.
    // Si 'users' tiene 'full_name' o similar, se podría buscar ahí.
    // Este es un placeholder, ya que 'public.users' no tiene 'email' directamente.
    // query = query.ilike('full_name', `%${searchTerm}%`); // Ejemplo si existiera full_name
  }

  if (roleFilter) {
    query = query.eq('role', roleFilter);
  }

  query = query.order('created_at', { ascending: false });
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  query = query.range(start, end);

  const { data: profiles, error, count } = await query;

  if (error) {
    console.error('Error fetching user profiles:', error);
    return { data: null, error: error.message, totalCount: null };
  }

  // Simulación de enriquecimiento (en un caso real, se necesitaría acceso privilegiado a auth.users)
  const enrichedProfiles: UserProfile[] = profiles?.map(p => ({
    ...p,
    email: `user-${p.id.substring(0,8)}@example.com`, // Placeholder para email
    created_at: p.created_at || new Date().toISOString(), // Usar created_at de public.users si existe
  })) || [];


  return { data: enrichedProfiles, totalCount: count };
}


/**
 * Actualiza el rol de un usuario. Solo para administradores.
 * @param userId - El ID del usuario (auth.users.id).
 * @param newRole - El nuevo rol a asignar.
 */
export async function updateUserRole(userId: string, newRole: string): Promise<{ success: boolean; error?: string }> {
  await checkAdmin();
  const supabase = createServerActionClient<Database>({ cookies }); // Cliente normal para la tabla public.users

  // Validar el rol (ej. 'user', 'pro_vendor', 'admin')
  const validRoles = ['user', 'pro_vendor', 'admin']; // Ajustar según los roles definidos
  if (!validRoles.includes(newRole)) {
    return { success: false, error: 'Rol no válido.' };
  }

  const { error } = await supabase
    .from('users') // Actualizar en la tabla public.users
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    console.error(`Error updating role for user ${userId}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/usuarios');
  return { success: true };
}

/**
 * Bloquea o desbloquea un usuario a través de una Edge Function segura.
 * Solo para administradores.
 * @param userId - El ID del usuario (auth.users.id).
 * @param block - Booleano que indica si se debe bloquear (true) o desbloquear (false).
 */
export async function blockUnblockUser(userId: string, block: boolean): Promise<{ success: boolean; error?: string }> {
  await checkAdmin();

  try {
    // Llama a la Edge Function para bloquear/desbloquear el usuario
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/block-unblock-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EDGE_FUNCTION_SECRET}`, // Usa un secreto para autorizar la llamada
      },
      body: JSON.stringify({ userId, block }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error calling Edge Function:', result.error);
      return { success: false, error: result.error || 'Error al actualizar el estado del usuario.' };
    }

    revalidatePath('/admin/usuarios');
    return { success: true };

  } catch (error: any) {
    console.error('Error in blockUnblockUser Server Action:', error);
    return { success: false, error: error.message || 'Ocurrió un error inesperado.' };
  }
}


// Funciones para suspender/eliminar usuarios requerirían llamadas a Supabase Admin API
// y deberían hacerse desde un backend seguro o Edge Function, no directamente desde Server Actions
// expuestas al cliente, incluso con checkAdmin, por la sensibilidad de la operación.

// Ejemplo placeholder si se quisiera hacer (NO RECOMENDADO para producción directa desde Server Action):
/*
export async function deleteUserByAdmin(userId: string): Promise<{ success: boolean; error?: string }> {
  await checkAdmin();
  // Esta operación requiere la clave de servicio de Supabase y debe manejarse con extremo cuidado.
  // NO es seguro exponer la service_role key en el cliente o en Server Actions directamente.
  // const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  // const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  // if (error) {
  //   return { success: false, error: error.message };
  // }
  // También habría que eliminar el perfil de public.users y otros datos relacionados.
  return { success: false, error: "Operación no implementada de forma segura." };
}
*/
