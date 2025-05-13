'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { checkAdmin } from '@/app/actions/utils';
import { revalidatePath } from 'next/cache';
import { Vendor } from './public'; // Importar el tipo Vendor

// Extender el tipo Vendor para incluir el email del usuario asociado, si es posible obtenerlo
export interface VendorAdminProfile extends Vendor {
  user_email?: string; // Email del usuario asociado (de auth.users)
  user_created_at?: string; // Fecha de registro del usuario
  status?: 'active' | 'pending_approval' | 'suspended' | string; // Estado del perfil del vendedor
}

interface GetVendorsAdminParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string; // Para buscar por nombre de tienda, email de usuario, etc.
  statusFilter?: string;
}

interface GetVendorsAdminResult {
  data: VendorAdminProfile[] | null;
  error?: string;
  totalCount: number | null;
}

/**
 * Obtiene una lista paginada de perfiles de vendedor.
 * Intenta enriquecer con el email del usuario asociado (placeholder por ahora).
 * Solo para administradores.
 */
export async function getVendorsAdmin({
  page = 1,
  pageSize = 15,
  searchTerm,
  statusFilter,
}: GetVendorsAdminParams): Promise<GetVendorsAdminResult> {
  await checkAdmin();
  const supabase = createServerComponentClient<Database>({ cookies });

  let query = supabase.from('vendors').select('*, users(email, created_at)', { count: 'exact' });
  // Nota: El join implícito `users(email)` asume que hay una relación FK de `vendors.user_id` a `users.id` (tabla public.users)
  // y que `public.users` tiene un campo `email`. Si el email está solo en `auth.users`, esto es más complejo.
  // Por ahora, asumimos que `public.users` tiene el email o que es un placeholder.

  if (searchTerm) {
    // Buscar por nombre de tienda o slug. Para buscar por email de usuario, se necesitaría un join más complejo o una función de DB.
    query = query.or(`store_name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
    // Si quisiéramos buscar por email del usuario (asumiendo que está en public.users):
    // query = query.or(`store_name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,users(email.ilike.%${searchTerm}%)`);
  }

  if (statusFilter) {
    // Asumimos que la tabla 'vendors' tiene una columna 'status'
    query = query.eq('status', statusFilter);
  }

  query = query.order('created_at', { ascending: false });
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  query = query.range(start, end);

  const { data: vendors, error, count } = await query;

  if (error) {
    console.error('Error fetching vendor profiles for admin:', error);
    return { data: null, error: error.message, totalCount: null };
  }
  
  const enrichedVendors: VendorAdminProfile[] = vendors?.map((v: any) => ({
    ...v,
    user_email: v.users?.email || `user-${v.user_id.substring(0,8)}@example.com`, // Placeholder si no hay email en users
    user_created_at: v.users?.created_at || v.created_at, // Usar created_at del vendor si no está el del user
    status: v.status || 'active', // Default a active si no hay status
  })) || [];

  return { data: enrichedVendors, totalCount: count };
}

/**
 * Actualiza el estado de un perfil de vendedor.
 * Solo para administradores.
 * @param vendorId - El ID del vendedor.
 * @param newStatus - El nuevo estado ('active', 'suspended', 'pending_approval').
 */
export async function updateVendorStatusAdmin(
  vendorId: string,
  newStatus: 'active' | 'suspended' | 'pending_approval' | string
): Promise<{ success: boolean; error?: string }> {
  await checkAdmin();
  const supabase = createServerComponentClient<Database>({ cookies });

  const validStatuses = ['active', 'suspended', 'pending_approval'];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: 'Estado no válido.' };
  }

  // Actualizar el estado en la tabla 'vendors'
  const { error } = await supabase
    .from('vendors')
    .update({ status: newStatus })
    .eq('id', vendorId);

  if (error) {
    console.error(`Error updating status for vendor ${vendorId}:`, error);
    return { success: false, error: error.message };
  }

  // Adicionalmente, si se suspende un vendedor, se podrían desactivar todos sus productos.
  if (newStatus === 'suspended') {
    const { error: productError } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('vendor_id', vendorId);
    if (productError) {
      console.error(`Error deactivating products for suspended vendor ${vendorId}:`, productError);
      // No hacer que esto sea un error fatal para la actualización de estado del vendedor, pero registrarlo.
    }
  } else if (newStatus === 'active') {
    // Si se reactiva, ¿deberían reactivarse los productos? Depende de la lógica de negocio.
    // Por ahora, no los reactivamos automáticamente. El vendedor debería hacerlo.
  }


  revalidatePath('/admin/vendedores');
  revalidatePath(`/tienda/${vendorId}`); // Revalidar la página pública de la tienda si el slug es el ID o se conoce
  return { success: true };
}
