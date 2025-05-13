'use server';

import { createServerActionClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { checkAdmin } from '@/app/actions/utils';
import { revalidatePath } from 'next/cache';

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  target_role?: 'all' | 'pro_vendor' | 'user' | string | null; // string para flexibilidad
  is_published: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

/**
 * Crea un nuevo anuncio de plataforma. Solo para administradores.
 */
export async function createPlatformAnnouncement(formData: FormData): Promise<{ success: boolean; error?: string; announcement?: PlatformAnnouncement }> {
  await checkAdmin();
  const supabase = createServerActionClient<Database>({ cookies });

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const target_role = formData.get('target_role') as PlatformAnnouncement['target_role'] || 'all';
  const is_published = formData.get('is_published') === 'true';

  if (!title || !content) {
    return { success: false, error: 'Título y contenido son obligatorios.' };
  }

  const { data, error } = await supabase
    .from('platform_announcements')
    .insert({ 
      title, 
      content, 
      target_role, 
      is_published,
      published_at: is_published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating platform announcement:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/platform-anuncios');
  if (is_published) {
    // Revalidar dashboards donde se muestren estos anuncios
    if (target_role === 'all' || target_role === 'pro_vendor') revalidatePath('/dashboard');
    // if (target_role === 'all' || target_role === 'user') revalidatePath('/perfil'); // Si los usuarios normales ven anuncios
  }
  return { success: true, announcement: data };
}

/**
 * Obtiene todos los anuncios de plataforma para el panel de admin.
 */
export async function getPlatformAnnouncementsAdmin(
  page: number = 1, 
  pageSize: number = 10
): Promise<{ data: PlatformAnnouncement[] | null; error?: string; totalCount: number | null }> {
  await checkAdmin();
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('platform_announcements')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching platform announcements for admin:', error);
    return { data: null, error: error.message, totalCount: null };
  }
  return { data, totalCount: count };
}

/**
 * Obtiene un anuncio de plataforma específico por su ID.
 */
export async function getPlatformAnnouncementById(id: string): Promise<{ data: PlatformAnnouncement | null; error?: string }> {
  // No es necesario checkAdmin() aquí si la página que lo llama ya lo hace.
  // O sí, si esta acción pudiera ser llamada desde otros contextos. Por seguridad, lo mantenemos.
  await checkAdmin(); 
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data, error } = await supabase
    .from('platform_announcements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching platform announcement with id ${id}:`, error);
    return { data: null, error: error.message };
  }
  return { data };
}

/**
 * Actualiza un anuncio de plataforma existente. Solo para administradores.
 */
export async function updatePlatformAnnouncement(formData: FormData): Promise<{ success: boolean; error?: string; announcement?: PlatformAnnouncement }> {
  await checkAdmin();
  const supabase = createServerActionClient<Database>({ cookies });

  const id = formData.get('id') as string;
  const title = formData.get('title') as string | undefined;
  const content = formData.get('content') as string | undefined;
  const target_role = formData.get('target_role') as PlatformAnnouncement['target_role'] | undefined;
  const is_published = formData.has('is_published') ? formData.get('is_published') === 'true' : undefined;

  if (!id) {
    return { success: false, error: 'ID del anuncio es obligatorio.' };
  }

  const updateData: Partial<Omit<PlatformAnnouncement, 'id' | 'created_at' | 'published_at'>> & { published_at?: string | null } = {};
  if (title) updateData.title = title;
  if (content) updateData.content = content;
  if (target_role) updateData.target_role = target_role;
  if (is_published !== undefined) {
    updateData.is_published = is_published;
    updateData.published_at = is_published ? new Date().toISOString() : null;
  }
  updateData.updated_at = new Date().toISOString();


  if (Object.keys(updateData).length <= 1 && !formData.has('is_published')) { // updated_at siempre se añade
    return { success: false, error: 'No hay datos para actualizar.' };
  }
  
  const { data, error } = await supabase
    .from('platform_announcements')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating platform announcement:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/platform-anuncios');
  if (updateData.is_published !== undefined) {
    if (target_role === 'all' || target_role === 'pro_vendor') revalidatePath('/dashboard');
  }
  return { success: true, announcement: data };
}

/**
 * Elimina un anuncio de plataforma. Solo para administradores.
 */
export async function deletePlatformAnnouncement(id: string): Promise<{ success: boolean; error?: string }> {
  await checkAdmin();
  const supabase = createServerActionClient<Database>({ cookies });

  if (!id) {
    return { success: false, error: 'ID del anuncio es obligatorio.' };
  }

  const { error } = await supabase
    .from('platform_announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting platform announcement:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/platform-anuncios');
  return { success: true };
}

/**
 * Obtiene los anuncios de plataforma visibles para un rol de usuario específico.
 */
export async function getVisiblePlatformAnnouncements(
  userRole: string | null,
  limit: number = 5
): Promise<PlatformAnnouncement[]> {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  let query = supabase
    .from('platform_announcements')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (userRole) {
    // Filtrar por 'all' o el rol específico del usuario
    query = query.or(`target_role.eq.all,target_role.eq.${userRole}`);
  } else {
    // Si no hay rol (usuario no logueado o rol no definido), solo mostrar anuncios para 'all'
    query = query.eq('target_role', 'all');
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching visible platform announcements:', error);
    return [];
  }
  return data || [];
}
