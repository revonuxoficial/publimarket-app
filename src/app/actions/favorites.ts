'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// Asumimos que existe una tabla 'user_favorites' con columnas:
// id (uuid, pk), user_id (uuid, fk to auth.users), product_id (uuid, fk to products), created_at (timestamptz)
// y una restricción UNIQUE en (user_id, product_id)

/**
 * Añade un producto a los favoritos del usuario autenticado.
 */
export async function addFavorite(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado.' };
  }

  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: user.id, product_id: productId });

  if (error) {
    // Manejar el caso de violación de unicidad (producto ya es favorito) como no fatal
    if (error.code === '23505') { // Código de error para violación de unicidad en PostgreSQL
      // console.warn('Intento de añadir favorito duplicado:', error.message);
      return { success: true }; // Considerarlo éxito si ya era favorito
    }
    console.error('Error adding favorite:', error);
    return { success: false, error: error.message };
  }

  // Opcional: Revalidar rutas donde se muestre el estado de favorito
  // revalidatePath('/producto/[slug]', 'layout'); // Revalida todas las páginas de producto
  // revalidatePath('/productos');
  // revalidatePath('/favoritos');

  return { success: true };
}

/**
 * Elimina un producto de los favoritos del usuario autenticado.
 */
export async function removeFavorite(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado.' };
  }

  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing favorite:', error);
    return { success: false, error: error.message };
  }

  // Opcional: Revalidar rutas
  // revalidatePath('/producto/[slug]', 'layout');
  // revalidatePath('/productos');
  // revalidatePath('/favoritos');

  return { success: true };
}

/**
 * Verifica si un producto está en los favoritos del usuario autenticado.
 * @param productId El ID del producto a verificar.
 * @returns Un objeto con `isFavorite: boolean` y opcionalmente `error`.
 */
export async function getFavoriteStatus(productId: string): Promise<{ isFavorite: boolean; error?: string }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Si el usuario no está autenticado, el producto no puede ser favorito para él.
    return { isFavorite: false }; 
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle(); // Usar maybeSingle para que no sea error si no se encuentra

  if (error) {
    console.error('Error fetching favorite status:', error);
    return { isFavorite: false, error: error.message };
  }

  return { isFavorite: !!data }; // True si data no es null (es decir, se encontró el favorito)
}

/**
 * Obtiene todos los IDs de productos favoritos del usuario autenticado.
 * @returns Una promesa que resuelve con un array de IDs de productos o un error.
 */
export async function getUserFavoriteProductIds(): Promise<{ productIds?: string[]; error?: string }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuario no autenticado.' };
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select('product_id')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching user favorite product IDs:', error);
    return { error: error.message };
  }

  return { productIds: data?.map(fav => fav.product_id) || [] };
}
