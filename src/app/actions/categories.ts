'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { checkAdmin } from '@/app/actions/utils'; // Asumiremos que existe o la crearemos

// Definición del tipo para Category
export interface Category {
  id: string; // uuid
  name: string;
  slug: string;
  description?: string | null;
  created_at?: string;
}

/**
 * Obtiene todas las categorías.
 */
export async function getCategories(): Promise<{ data: Category[] | null; error?: string }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('categories') // Corregido a plural
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return { data: null, error: error.message };
  }
  return { data };
}

/**
 * Obtiene una categoría específica por su ID.
 */
export async function getCategoryById(id: string): Promise<{ data: Category | null; error?: string }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('categories') // Corregido a plural
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    return { data: null, error: error.message };
  }
  return { data };
}

/**
 * Añade una nueva categoría. Solo para administradores.
 */
export async function addCategory(formData: FormData): Promise<{ success: boolean; error?: string; category?: Category }> {
  await checkAdmin(); // Asegura que solo un admin puede ejecutar esto
  const supabase = createServerActionClient<Database>({ cookies });

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string || null;

  if (!name || !slug) {
    return { success: false, error: 'Nombre y slug son obligatorios.' };
  }

  const { data, error } = await supabase
    .from('categories') // Corregido a plural
    .insert({ name, slug, description }) // Asumiendo que image_url es opcional o se añade después
    .select()
    .single();

  if (error) {
    console.error('Error adding category:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/categorias'); // Revalidar la página de gestión de categorías
  revalidatePath('/productos'); // Revalidar la página de productos por si los filtros cambian
  return { success: true, category: data };
}

/**
 * Actualiza una categoría existente. Solo para administradores.
 */
export async function updateCategory(formData: FormData): Promise<{ success: boolean; error?: string; category?: Category }> {
  await checkAdmin();
  const supabase = createServerActionClient<Database>({ cookies });

  const id = formData.get('id') as string;
  const name = formData.get('name') as string | undefined;
  const slug = formData.get('slug') as string | undefined;
  const description = formData.get('description') as string || null;

  if (!id) {
    return { success: false, error: 'ID de categoría es obligatorio.' };
  }

  const updateData: Partial<Omit<Category, 'id' | 'created_at'>> = {};
  if (name) updateData.name = name;
  if (slug) updateData.slug = slug;
  if (formData.has('description')) updateData.description = description;


  if (Object.keys(updateData).length === 0) {
    return { success: false, error: 'No hay datos para actualizar.' };
  }

  const { data, error } = await supabase
    .from('categories') // Corregido a plural
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/categorias');
  revalidatePath('/productos');
  return { success: true, category: data };
}

/**
 * Elimina una categoría. Solo para administradores.
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  await checkAdmin();
  const supabase = createServerActionClient<Database>({ cookies });

  if (!id) {
    return { success: false, error: 'ID de categoría es obligatorio.' };
  }

  // Opcional: Verificar si alguna producto usa esta categoría antes de eliminar.
  // Por ahora, se permite la eliminación directa.

  const { error } = await supabase
    .from('categories') // Corregido a plural
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/categorias');
  revalidatePath('/productos');
  return { success: true };
}
