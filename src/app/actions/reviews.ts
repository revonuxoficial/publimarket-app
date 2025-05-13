'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// Definir un tipo para los datos de una reseña
export interface Review {
  id: string;
  vendor_id: string;
  user_id: string;
  product_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  is_approved: boolean;
  // Opcional: incluir información básica del usuario que dejó la reseña
  users?: {
    id: string;
    name?: string | null; // Asumiendo que la tabla users tiene un campo name
    // avatar_url?: string | null; // Si hay avatares de usuario
  } | null;
}

/**
 * Añade una nueva reseña.
 * @param vendorId El ID del vendedor al que se le deja la reseña.
 * @param rating La calificación (1-5).
 * @param comment El comentario de la reseña (opcional).
 * @param productId El ID del producto asociado a la reseña (opcional).
 */
export async function addReview({
  vendorId,
  rating,
  comment,
  productId,
}: {
  vendorId: string;
  rating: number;
  comment?: string | null;
  productId?: string | null;
}): Promise<{ success: boolean; error?: string | null; review?: Review }> { // Permitir null para error
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado.' };
  }

  if (!vendorId || rating === undefined || rating < 1 || rating > 5) {
    return { success: false, error: 'Datos de reseña incompletos o inválidos.' };
  }

  // TODO: Implementar lógica para verificar si el usuario ha tenido una interacción/compra relevante con este vendedor/producto
  // antes de permitir dejar la reseña, según el brief. Por ahora, solo se requiere autenticación.

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      vendor_id: vendorId,
      user_id: user.id,
      product_id: productId || null,
      rating: rating,
      comment: comment || null,
      // is_approved por defecto es false en la DB, requiere moderación
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding review:', error);
    return { success: false, error: error.message };
  }

  // Revalidar la página del vendedor para mostrar la nueva reseña (una vez aprobada)
  // Necesitaríamos el slug del vendedor para revalidar la ruta específica.
  // Por ahora, revalidamos una ruta genérica o la página de reseñas si existiera.
  // revalidatePath(`/tienda/${vendorSlug}`);
  // revalidatePath('/admin/reviews'); // Revalidar panel de moderación

  return { success: true, review: data };
}

/**
 * Obtiene las reseñas aprobadas para un vendedor específico.
 * @param vendorId El ID del vendedor.
 * @returns Una promesa que resuelve con un array de reseñas o un error.
 */
export async function getReviewsByVendor(vendorId: string): Promise<{ data: Review[] | null; error?: string | null }> { // Permitir null para error
  const supabase = createServerActionClient<Database>({ cookies });

  if (!vendorId) {
    return { data: null, error: 'ID de vendedor no proporcionado.' };
  }

  // Obtener reseñas aprobadas para este vendedor, incluyendo información básica del usuario
  const { data, error } = await supabase
    .from('reviews')
    .select('id, vendor_id, user_id, product_id, rating, comment, created_at, is_approved, users (id, name)') // Cadena de selección en una sola línea
    .eq('vendor_id', vendorId)
    .eq('is_approved', true) // Solo obtener reseñas aprobadas
    .order('created_at', { ascending: false }); // Ordenar por fecha, más recientes primero

  if (error) {
    console.error('Error fetching reviews by vendor:', error);
    return { data: null, error: error.message };
  }

  // Asegurar que los datos devueltos coincidan con el tipo Review[]
  const typedData = data?.map(r => ({
    ...r,
    users: Array.isArray(r.users) ? r.users[0] : r.users, // Asegurar que users sea objeto o null
  })) as Review[] | null;


  return { data: typedData, error: null };
}

// TODO: Implementar getReviewsByProduct si es necesario mostrar reseñas en la página de producto.
// TODO: Implementar acciones de moderación de reseñas para administradores (aprobar, editar, eliminar).