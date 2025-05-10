'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache'; // Para revalidar la caché si es necesario
import { redirect } from 'next/navigation'; // Para redirigir si el usuario no es PRO
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import { checkProVendor } from '@/app/actions/utils'; // Importar la función de utilidad centralizada


// Definir un tipo básico para los datos de un producto (SOLUCIÓN TEMPORAL)
// La forma recomendada es usar los tipos generados por la CLI
export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  slug: string;
  price: number | null;
  description: string;
  main_image_url: string;
  gallery_image_urls: string[] | null;
  whatsapp_link: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

// Definir un tipo para los datos necesarios para crear un producto
interface NewProductData {
  name: string;
  slug: string;
  price?: number | null;
  description: string;
  main_image_url: string;
  gallery_image_urls?: string[] | null;
  whatsapp_link: string;
  category?: string | null;
}

// Definir un tipo para los datos necesarios para actualizar un producto
interface UpdateProductData {
  name?: string;
  slug?: string;
  price?: number | null;
  description?: string;
  main_image_url?: string | null; // Permitir null
  gallery_image_urls?: string[] | null; // Ya permite null, pero lo explicitamos
  whatsapp_link?: string;
  category?: string | null;
}


// Server Action para añadir un nuevo producto
export async function addProduct(data: NewProductData) {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies }); // Crear instancia del cliente del lado del servidor

  // Insertar el nuevo producto en la tabla 'products'
  const { error: insertError } = await supabase
    .from('products')
    .insert({
      ...data, // Usar los datos recibidos
      vendor_id: vendorId, // Asociar el producto al vendedor autenticado
    });

  if (insertError) {
    console.error('Error al añadir producto:', insertError);
    return { success: false, error: insertError.message };
  }

  revalidatePath('/productos');
  revalidatePath('/vendedor/productos');
  revalidatePath('/');
  // Considerar revalidar la página de la tienda específica si se puede obtener el slug del vendedor.
  // revalidatePath(`/tienda/${vendorSlug}`); 
  // Considerar revalidar la página del producto específico si se puede obtener el slug del producto.
  // revalidatePath(`/producto/${data.slug}`);


  return { success: true };
}

// Server Action para actualizar un producto existente
export async function updateProduct(product_id: string, data: UpdateProductData) {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies }); // Crear instancia del cliente del lado del servidor

  // Actualizar el producto en la tabla 'products'
  // Asegurarse de que la RLS en Supabase permita esta operación solo para el propio vendedor
  const { error: updateError } = await supabase
    .from('products')
    .update(data) // Usar los datos recibidos para la actualización
    .eq('id', product_id) // Filtrar por el ID del producto
    .eq('vendor_id', vendorId); // Asegurar que el producto pertenece al vendedor autenticado

  if (updateError) {
    console.error('Error al actualizar producto:', updateError);
    return { success: false, error: updateError.message };
  }

  revalidatePath('/productos');
  revalidatePath('/vendedor/productos');
  revalidatePath('/');
  if (data.slug) {
    revalidatePath(`/producto/${data.slug}`);
    // Para revalidar /tienda/[vendorSlug]/[productSlug] necesitaríamos el vendorSlug.
  }
  // Considerar revalidar la página de la tienda específica si se puede obtener el slug del vendedor.
  // revalidatePath(`/tienda/${vendorSlug}`);

  return { success: true };
}

// Server Action para eliminar un producto
export async function deleteProduct(product_id: string) {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies }); // Crear instancia del cliente del lado del servidor

  // Eliminar el producto de la tabla 'products'
  // Asegurarse de que la RLS en Supabase permita esta operación solo para el propio vendedor
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', product_id) // Filtrar por el ID del producto
    .eq('vendor_id', vendorId); // Asegurar que el producto pertenece al vendedor autenticado

  if (deleteError) {
    console.error('Error al eliminar producto:', deleteError);
    return { success: false, error: deleteError.message };
  }

  revalidatePath('/productos');
  revalidatePath('/vendedor/productos');
  revalidatePath('/');
  // Para revalidar las páginas específicas del producto y la tienda,
  // se necesitarían los slugs, que podrían obtenerse antes de la eliminación o pasarse a la acción.

  return { success: true };
}

// Server Action para obtener la lista de productos del vendedor autenticado
/**
 * Obtiene la lista de productos del vendedor autenticado.
 * @param limit - Opcional: Límite de productos a obtener.
 * @returns Una promesa que resuelve con un array de productos del vendedor o null en caso de error.
 */
export async function getProductsByCurrentUser(limit?: number): Promise<{ data: Product[] | null; error: string | null }> {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies }); // Crear instancia del cliente del lado del servidor

  // Obtener la lista de productos para el vendedor autenticado
  // Asegurarse de que la RLS en Supabase permita esta operación solo para el propio vendedor
  let query = supabase
    .from('products')
    .select('*') // Seleccionar todos los campos del producto
    .eq('vendor_id', vendorId) // Filtrar por el ID del vendedor autenticado
    .order('created_at', { ascending: false }); // Ordenar por fecha de creación descendente

  // Aplicar límite si se especifica
  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data: products, error: fetchError } = await query;

  if (fetchError) {
    console.error('Error al obtener productos del vendedor:', fetchError);
    return { data: null, error: fetchError.message };
  }

  return { data: products, error: null };
}
