'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import { v4 as uuidv4 } from 'uuid'; // Importar uuid para generar IDs si es necesario
import { checkProVendor } from '@/app/actions/utils'; // Importar la función de utilidad centralizada

// Definición básica del tipo Announcement basada en el proyect-brief.md
// La forma recomendada es generar este tipo con la CLI de Supabase
export interface Announcement {
  id: string; // UUID
  vendor_id: string; // UUID
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Añade un nuevo anuncio para el vendedor autenticado.
 * @param formData - Datos del formulario con el título, contenido e imagen (opcional).
 * @returns Un objeto indicando éxito o error.
 */
export async function addAnnouncement(formData: FormData): Promise<{ success: boolean; message?: string }> {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const imageFile = formData.get('image') as File | null; // Asumiendo que la imagen se envía como File

  if (!title || !content) {
    return { success: false, message: 'Título y contenido son obligatorios.' };
  }

  const supabase = createServerActionClient<Database>({ cookies });
  let imageUrl: string | null = null;

  // Lógica para subir imagen si existe
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`; // Generar nombre único para la imagen
    const filePath = `announcement_images/${vendorId}/${fileName}`; // Ruta en Supabase Storage

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('announcement_images') // Asumiendo un bucket llamado 'announcement_images'
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Error uploading announcement image:', uploadError);
      return { success: false, message: 'Error al subir la imagen del anuncio.' };
    }

    // Obtener la URL pública de la imagen
    const { data: publicUrlData } = supabase.storage
      .from('announcement_images')
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
  }

  // Insertar el nuevo anuncio en la base de datos
  const { data, error } = await supabase
    .from('announcements')
    .insert([
      {
        vendor_id: vendorId,
        title: title,
        content: content,
        image_url: imageUrl,
        // created_at y updated_at se pueden configurar para que se generen automáticamente en Supabase
      },
    ]);

  if (error) {
    console.error('Error adding announcement:', error);
    // Si hubo un error al insertar, intentar eliminar la imagen subida
    if (imageUrl) {
       // Extraer el path del archivo de la URL para eliminarlo
       const imagePath = imageUrl.split('/public/')[1]; // Ajustar según la estructura de URL de Supabase Storage
       if (imagePath) {
         await supabase.storage.from('announcement_images').remove([imagePath]);
       }
    }
    return { success: false, message: 'Error al añadir el anuncio.' };
  }

  revalidatePath('/vendedor/anuncios');
  const { data: vendorData } = await supabase
    .from('vendors')
    .select('slug')
    .eq('id', vendorId)
    .single();
  if (vendorData?.slug) {
    revalidatePath(`/tienda/${vendorData.slug}`);
  }

  return { success: true, message: 'Anuncio añadido con éxito.' };
}

/**
 * Actualiza un anuncio existente del vendedor autenticado.
 * @param announcementId - El ID del anuncio a actualizar.
 * @param formData - Datos del formulario con el título, contenido e imagen (opcional) actualizados.
 * @returns Un objeto indicando éxito o error.
 */
export async function updateAnnouncement(announcementId: string, formData: FormData): Promise<{ success: boolean; message?: string }> {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const imageFile = formData.get('image') as File | null; // Asumiendo que la imagen se envía como File
  const currentImageUrl = formData.get('currentImageUrl') as string | null; // URL de la imagen actual para posible eliminación

  if (!title || !content) {
    return { success: false, message: 'Título y contenido son obligatorios.' };
  }

  const supabase = createServerActionClient<Database>({ cookies });
  let imageUrl: string | null = currentImageUrl; // Mantener la imagen actual por defecto

  // Verificar que el anuncio pertenece al vendedor autenticado
  const { data: existingAnnouncement, error: fetchError } = await supabase
    .from('announcements')
    .select('id, vendor_id, image_url')
    .eq('id', announcementId)
    .eq('vendor_id', vendorId) // Asegurar que el anuncio pertenece a este vendedor
    .single();

  if (fetchError || !existingAnnouncement) {
    return { success: false, message: 'Anuncio no encontrado o no tienes permiso para editarlo.' };
  }

  // Lógica para subir nueva imagen si existe y eliminar la anterior si es diferente
  if (imageFile && imageFile.size > 0) {
    // Eliminar imagen anterior si existe y es diferente al nuevo
    if (existingAnnouncement.image_url && existingAnnouncement.image_url !== currentImageUrl) {
       // Extraer el path del archivo de la URL para eliminarlo
       const previousImagePath = existingAnnouncement.image_url.split('/public/')[1]; // Ajustar según la estructura de URL de Supabase Storage
       if (previousImagePath) {
         const { error: removeError } = await supabase.storage.from('announcement_images').remove([previousImagePath]);
         if (removeError) {
           console.error('Error removing previous announcement image:', removeError);
           // Continuar a pesar del error de eliminación para no bloquear la actualización
         }
       }
    }

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `announcement_images/${vendorId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('announcement_images')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Error uploading new announcement image:', uploadError);
      return { success: false, message: 'Error al subir la nueva imagen del anuncio.' };
    }

    const { data: publicUrlData } = supabase.storage
      .from('announcement_images')
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;

  } else if (currentImageUrl === null && existingAnnouncement.image_url) {
      // Si se eliminó la imagen en el formulario y existía una imagen anterior
      const previousImagePath = existingAnnouncement.image_url.split('/public/')[1];
       if (previousImagePath) {
         const { error: removeError } = await supabase.storage.from('announcement_images').remove([previousImagePath]);
         if (removeError) {
           console.error('Error removing previous announcement image:', removeError);
         }
       }
       imageUrl = null; // Establecer la URL de la imagen a null
  }


  // Actualizar el anuncio en la base de datos
  const { data, error } = await supabase
    .from('announcements')
    .update({
      title: title,
      content: content,
      image_url: imageUrl,
      // updated_at se puede configurar para que se genere automáticamente en Supabase
    })
    .eq('id', announcementId)
    .eq('vendor_id', vendorId); // Doble verificación de pertenencia

  if (error) {
    console.error('Error updating announcement:', error);
    // Si hubo un error al actualizar, intentar eliminar la imagen subida si es nuevo
     if (imageUrl && imageUrl !== existingAnnouncement.image_url) { // Corregido: usar existingAnnouncement.image_url
        const newImagePath = imageUrl.split('/public/')[1];
        if(newImagePath) {
           await supabase.storage.from('announcement_images').remove([newImagePath]);
        }
     }
    return { success: false, message: 'Error al actualizar el anuncio.' };
  }

  revalidatePath('/vendedor/anuncios');
  if (existingAnnouncement) { // existingAnnouncement ya contiene el vendor_id
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('slug')
      .eq('id', existingAnnouncement.vendor_id) // Usar vendor_id del anuncio
      .single();
    if (vendorData?.slug) {
      revalidatePath(`/tienda/${vendorData.slug}`);
    }
  }

  return { success: true, message: 'Anuncio actualizado con éxito.' };
}

/**
 * Elimina un anuncio existente del vendedor autenticado.
 * @param announcementId - El ID del anuncio a eliminar.
 * @returns Un objeto indicando éxito o error.
 */
export async function deleteAnnouncement(announcementId: string): Promise<{ success: boolean; message?: string }> {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies });

  // Verificar que el anuncio pertenece al vendedor autenticado y obtener la URL de la imagen
  const { data: existingAnnouncement, error: fetchError } = await supabase
    .from('announcements')
    .select('id, vendor_id, image_url')
    .eq('id', announcementId)
    .eq('vendor_id', vendorId) // Asegurar que el anuncio pertenece a este vendedor
    .single();

  if (fetchError || !existingAnnouncement) {
    return { success: false, message: 'Anuncio no encontrado o no tienes permiso para eliminarlo.' };
  }

  // Eliminar el anuncio de la base de datos
  const { error: deleteError } = await supabase
    .from('announcements')
    .delete()
    .eq('id', announcementId)
    .eq('vendor_id', vendorId); // Doble verificación de pertenencia

  if (deleteError) {
    console.error('Error deleting announcement:', deleteError);
    return { success: false, message: 'Error al eliminar el anuncio.' };
  }

  // Eliminar la imagen asociada si existe
  if (existingAnnouncement.image_url) {
    // Extraer el path del archivo de la URL para eliminarlo
    const imagePath = existingAnnouncement.image_url.split('/public/')[1]; // Ajustar según la estructura de URL de Supabase Storage
    if (imagePath) {
      const { error: removeError } = await supabase.storage.from('announcement_images').remove([imagePath]);
      if (removeError) {
        console.error('Error removing announcement image:', removeError);
        // Continuar a pesar del error de eliminación
      }
    }
  }

  revalidatePath('/vendedor/anuncios');
  if (existingAnnouncement) { // existingAnnouncement ya contiene el vendor_id
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('slug')
      .eq('id', existingAnnouncement.vendor_id) // Usar vendor_id del anuncio
      .single();
    if (vendorData?.slug) {
      revalidatePath(`/tienda/${vendorData.slug}`);
    }
  }

  return { success: true, message: 'Anuncio eliminado con éxito.' };
}

/**
 * Obtiene la lista de anuncios del vendedor autenticado.
 * @param limit - Opcional: Límite de anuncios a obtener.
 * @returns Una promesa que resuelve con un array de anuncios del vendedor o null en caso de error.
 */
export async function getAnnouncementsByCurrentUser(limit?: number): Promise<Announcement[] | null> {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies });

  let query = supabase
    .from('announcements')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false }); // Ordenar por fecha de creación descendente

  // Aplicar límite si se especifica
  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching announcements by current user:', error);
    return null;
  }

  return data;
}
