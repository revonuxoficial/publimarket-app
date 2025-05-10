'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase'; // Asumiendo que este es el tipo de la DB
import { revalidatePath } from 'next/cache'; // Para revalidar la caché si es necesario

// Definir un tipo básico para un favorito (SOLUCIÓN TEMPORAL)
// La forma recomendada es usar los tipos generados por la CLI
interface Favorite {
  user_id: string;
  product_id: string | null;
  vendor_id: string | null;
  created_at: string;
}

// Server Action para añadir un favorito (producto o vendedor)
export async function addFavorite({ product_id, vendor_id }: { product_id?: string; vendor_id?: string }) {
  const supabase = createServerActionClient<Database>({ cookies });

  // Obtener el usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario autenticado, retornar un error
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  // Validar que se proporciona un product_id o un vendor_id
  if (!product_id && !vendor_id) {
    return { success: false, error: 'Se requiere product_id o vendor_id' };
  }

  // Verificar si el favorito ya existe para evitar duplicados
  const { data: existingFavorite, error: checkError } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('user_id', user.id)
    .or(`product_id.eq.${product_id},vendor_id.eq.${vendor_id}`)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 significa "no rows found"
      console.error('Error al verificar favorito existente:', checkError);
      return { success: false, error: checkError.message };
  }

  if (existingFavorite) {
      return { success: false, error: 'El favorito ya existe' };
  }


  // Insertar el nuevo favorito en la tabla 'favorites'
  const { error: insertError } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, product_id: product_id || null, vendor_id: vendor_id || null });

  if (insertError) {
    console.error('Error al añadir favorito:', insertError);
    return { success: false, error: insertError.message };
  }

  revalidatePath('/favoritos');

  return { success: true };
}

// Server Action para eliminar un favorito (producto o vendedor)
export async function removeFavorite({ product_id, vendor_id }: { product_id?: string; vendor_id?: string }) {
  const supabase = createServerActionClient<Database>({ cookies });

  // Obtener el usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario autenticado, retornar un error
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  // Validar que se proporciona un product_id o un vendor_id
  if (!product_id && !vendor_id) {
    return { success: false, error: 'Se requiere product_id o vendor_id' };
  }

  // Eliminar el favorito de la tabla 'favorites'
  // Asegurarse de que la RLS en Supabase permita esta operación solo para el propio usuario
  const { error: deleteError } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id) // Asegurar que solo se elimina el favorito del usuario autenticado
    .or(`product_id.eq.${product_id},vendor_id.eq.${vendor_id}`); // Eliminar el favorito específico

  if (deleteError) {
    console.error('Error al eliminar favorito:', deleteError);
    return { success: false, error: deleteError.message };
  }

  revalidatePath('/favoritos');

  return { success: true };
}

// Server Action para obtener la lista de favoritos del usuario autenticado
export async function getFavorites(): Promise<{ data: Favorite[] | null; error: string | null }> {
  const supabase = createServerActionClient<Database>({ cookies });

  // Obtener el usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario autenticado, retornar un error y datos nulos
  if (!user) {
    return { data: null, error: 'Usuario no autenticado' };
  }

  // Obtener la lista de favoritos para el usuario autenticado
  // Asegurarse de que la RLS en Supabase permita esta operación solo para el propio usuario
  const { data: favorites, error: fetchError } = await supabase
    .from('favorites')
    .select('*') // Seleccionar todos los campos del favorito
    .eq('user_id', user.id); // Filtrar por el ID del usuario autenticado

  if (fetchError) {
    console.error('Error al obtener favoritos:', fetchError);
    return { data: null, error: fetchError.message };
  }

  return { data: favorites, error: null };
}
