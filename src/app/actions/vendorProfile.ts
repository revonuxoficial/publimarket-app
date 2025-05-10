'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import { Vendor } from '@/app/actions/public'; // Importar el tipo Vendor
import { v4 as uuidv4 } from 'uuid'; // Importar uuid para generar IDs únicos
import { checkProVendor } from '@/app/actions/utils'; // Importar la función de utilidad centralizada


/**
 * Obtiene el perfil del vendedor autenticado.
 * @returns Una promesa que resuelve con el perfil del vendedor o null si no es vendedor PRO o hay un error.
 */
export async function getVendorProfile(): Promise<Vendor | null> {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies });

  // Obtener el perfil del vendedor usando el vendor_id
  const { data: vendorProfile, error } = await supabase
    .from('vendors')
    .select('*') // Seleccionar todos los campos del perfil del vendedor
    .eq('id', vendorId)
    .single();

  if (error || !vendorProfile) {
    console.error('Error fetching vendor profile:', error);
    return null;
  }

  return vendorProfile;
}

/**
 * Actualiza el perfil del vendedor autenticado.
 * @param formData - Datos del formulario con la información actualizada del vendedor.
 * @returns Un objeto indicando éxito o error.
 */
export async function updateVendorProfile(formData: FormData): Promise<{ success: boolean; message?: string }> {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies });

  // Obtener los datos actuales del vendedor para manejar la imagen existente
  const { data: currentVendorProfile, error: fetchError } = await supabase
    .from('vendors')
    .select('logo_url')
    .eq('id', vendorId)
    .single();

  if (fetchError || !currentVendorProfile) {
    console.error('Error fetching current vendor profile for update:', fetchError);
    return { success: false, message: 'Error al obtener el perfil actual del vendedor.' };
  }

  const store_name = formData.get('store_name') as string;
  const slug = formData.get('slug') as string; // Asumiendo que el slug es editable
  const description = formData.get('description') as string | null;
  const whatsapp_number = formData.get('whatsapp_number') as string;
  // Los enlaces sociales, horarios y ubicación se manejarán como JSONB.
  // Para simplificar en el MVP, los trataremos como strings o JSON stringificados si es necesario.
  // Asumiremos que se envían como strings por ahora.
  const social_links = formData.get('social_links') as string | null; // Podría ser un JSON stringificado
  const opening_hours = formData.get('opening_hours') as string | null; // Podría ser un JSON stringificado
  const location = formData.get('location') as string | null;
  const logoFile = formData.get('logo') as File | null; // Archivo del nuevo logo
  const currentLogoUrl = formData.get('currentLogoUrl') as string | null; // URL del logo actual (para saber si se eliminó)


  let logo_url: string | null = currentLogoUrl; // Mantener la URL actual por defecto

  // Lógica para subir nuevo logo si existe y eliminar el anterior si es diferente
  if (logoFile && logoFile.size > 0) {
    // Eliminar logo anterior si existe y es diferente al nuevo
    if (currentVendorProfile.logo_url && currentVendorProfile.logo_url !== currentLogoUrl) {
       // Extraer el path del archivo de la URL para eliminarlo
       const previousLogoPath = currentVendorProfile.logo_url.split('/public/')[1]; // Ajustar según la estructura de URL de Supabase Storage
       if (previousLogoPath) {
         const { error: removeError } = await supabase.storage.from('vendor_logos').remove([previousLogoPath]); // Asumiendo un bucket 'vendor_logos'
         if (removeError) {
           console.error('Error removing previous vendor logo:', removeError);
           // Continuar a pesar del error de eliminación
         }
       }
    }

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`; // Generar nombre único para el logo
    const filePath = `vendor_logos/${vendorId}/${fileName}`; // Ruta en Supabase Storage

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vendor_logos') // Asumiendo un bucket llamado 'vendor_logos'
      .upload(filePath, logoFile);

    if (uploadError) {
      console.error('Error uploading new vendor logo:', uploadError);
      return { success: false, message: 'Error al subir el nuevo logo.' };
    }

    // Obtener la URL pública del nuevo logo
    const { data: publicUrlData } = supabase.storage
      .from('vendor_logos')
      .getPublicUrl(filePath);

    logo_url = publicUrlData.publicUrl;

  } else if (currentLogoUrl === null && currentVendorProfile.logo_url) {
      // Si se eliminó el logo en el formulario y existía un logo anterior
      const previousLogoPath = currentVendorProfile.logo_url.split('/public/')[1];
       if (previousLogoPath) {
         const { error: removeError } = await supabase.storage.from('vendor_logos').remove([previousLogoPath]);
         if (removeError) {
           console.error('Error removing previous vendor logo:', removeError);
         }
       }
       logo_url = null; // Establecer la URL del logo a null
  }


  // Actualizar los datos del vendedor en la base de datos
  const { data, error } = await supabase
    .from('vendors')
    .update({
      store_name: store_name,
      slug: slug,
      description: description,
      whatsapp_number: whatsapp_number,
      social_links: social_links ? JSON.parse(social_links) : null, // Parsear JSON si se envía como string
      opening_hours: opening_hours ? JSON.parse(opening_hours) : null, // Parsear JSON si se envía como string
      location: location,
      logo_url: logo_url,
      // updated_at se puede configurar para que se genere automáticamente en Supabase
    })
    .eq('id', vendorId); // Asegurar que solo se actualiza el perfil del vendedor autenticado

  if (error) {
    console.error('Error updating vendor profile:', error);
    // Si hubo un error al actualizar, intentar eliminar el logo subido si es nuevo
     if (logo_url && logo_url !== currentVendorProfile.logo_url) {
        const newLogoPath = logo_url.split('/public/')[1];
        if(newLogoPath) {
           await supabase.storage.from('vendor_logos').remove([newLogoPath]);
        }
     }
    return { success: false, message: 'Error al actualizar el perfil del vendedor.' };
  }

  revalidatePath('/dashboard/settings/store');
  revalidatePath('/dashboard');
  if (slug) {
    revalidatePath(`/tienda/${slug}`);
  }

  return { success: true, message: 'Perfil del vendedor actualizado con éxito.' };
}
