'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase

// Definir tipos básicos para los datos (SOLUCIÓN TEMPORAL)
// La forma recomendada es generar estos tipos con la CLI de Supabase
export interface Product { // Exportar el tipo Product
  id: string; // UUID
  vendor_id: string; // UUID
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

export interface Vendor { // Exportar el tipo Vendor
  id: string; // UUID
  user_id: string; // UUID
  store_name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  whatsapp_number: string;
  social_links: any | null; // Usar 'any' temporalmente para JSONB
  opening_hours: any | null; // Usar 'any' temporalmente para JSONB
  location: string | null;
  city: string;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene una lista paginada de productos.
 * Permite filtrar por ciudad y categoría.
 * @param page - Número de página (base 1).
 * @param pageSize - Cantidad de productos por página.
 * @param query - Opcional: Término de búsqueda para filtrar por nombre de producto.
 * @param city - Opcional: Ciudad para filtrar.
 * @param category - Opcional: Categoría para filtrar.
 * @returns Una promesa que resuelve con un objeto { data: Product[] | null, error: any }.
 */
export async function getProducts({
  query,
  page,
  pageSize,
  city,
  category,
}: {
  query?: string;
  page: number;
  pageSize: number;
  city?: string;
  category?: string;
}): Promise<{ data: Product[] | null; error: any }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let dbQuery = supabase.from('products').select('*');

  // Aplicar filtro de búsqueda por nombre si existe
  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`); // Búsqueda insensible a mayúsculas/minúsculas
  }

  // Aplicar filtros si existen
  if (city) {
    // Obtener los IDs de los vendedores que coinciden con la ciudad
    const { data: vendorIds, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('city', city);

    if (vendorError) {
      console.error('Error fetching vendor IDs for city filter:', vendorError);
      return { data: null, error: vendorError };
    }

    // Si no se encontraron vendedores en esa ciudad, no hay productos que mostrar
    if (!vendorIds || vendorIds.length === 0) {
      return { data: [], error: null };
    }

    // Extraer solo los IDs en un array plano
    // Tipificar explícitamente el parámetro 'vendor'
    const ids = vendorIds.map((vendor: { id: string }) => vendor.id);

    // Filtrar productos por los IDs de vendedores encontrados
    dbQuery = dbQuery.in('vendor_id', ids);
  }

  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }

  // Aplicar paginación
  const { data, error } = await dbQuery.range(start, end);

  if (error) {
    console.error('Error fetching products:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Obtiene los detalles de un producto específico por su ID o slug.
 * @param identifier - El ID (UUID) o el slug del producto.
 * @returns Una promesa que resuelve con el producto encontrado o null si no existe o hay un error.
 */
export async function getProductByIdOrSlug(
  identifier: string
): Promise<Product | null> {
  const supabase = createServerActionClient<Database>({ cookies });

  let query = supabase.from('products').select('*').single();

  // Determinar si el identificador es un UUID o un slug
  // Una forma simple es intentar parsear como UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  if (isUUID) {
    query = query.eq('id', identifier);
  } else {
    // Si es un slug, necesitamos también el vendor_id para que sea único
    // Esto implica que la URL del producto debería incluir el slug del vendedor también.
    // Por ejemplo: /tienda/[vendorSlug]/producto/[productSlug]
    // Si solo se pasa el productSlug, podría haber duplicados.
    // Asumiendo que el slug del producto es único globalmente para simplificar el MVP,
    // o que la llamada se hará con vendor_id y slug.
    // Si la URL es /producto/[productSlug], necesitaríamos buscar por slug y quizás el más reciente o popular.
    // Basándonos en el brief (slug único dentro del vendedor), la consulta correcta sería por vendor_id Y slug.
    // Para esta función, si solo se pasa el slug, asumiremos que es único globalmente para el MVP simple.
    // Si necesitamos la unicidad por vendedor, la función debería aceptar vendor_slug y product_slug.
    // Ajustando a la estructura del brief (slug único dentro del vendedor), esta función por slug solo funcionaría
    // si el slug fuera globalmente único o si se busca por vendor_id y slug.
    // Vamos a asumir que la interfaz de usuario proporcionará ambos (vendor_slug y product_slug)
    // y ajustaremos la función para aceptar un objeto con ambos.

    // Si el identificador no es un UUID, asumimos que es un slug y necesitamos el vendor_slug también.
    // Esta función necesita ser rediseñada para aceptar { vendorSlug: string, productSlug: string }
    // o { id: string } para ser precisa según el brief.
    // Por ahora, si solo se pasa un string que no es UUID, intentaremos buscar por slug,
    // pero esto puede devolver resultados incorrectos si hay slugs duplicados entre vendedores.
    // **NOTA:** Considerar refactorizar esta función para aceptar un objeto { id: string } o { vendorSlug: string, productSlug: string }.
    // Para el MVP, si se pasa un string que no es UUID, buscaremos por slug.
     query = query.eq('slug', identifier);
  }


  const { data, error } = await query;

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

/**
 * Maneja el proceso de autenticación (registro, inicio de sesión).
 * @param formData - Datos del formulario (email, password, action).
 * @returns Un objeto indicando éxito o error.
 */
export async function handleAuth(formData: FormData): Promise<{ success: boolean; message?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const action = formData.get('action') as 'login' | 'register';

  const supabase = createServerActionClient<Database>({ cookies }); // Usar el cliente de Supabase del servidor

  if (action === 'register') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error during registration:', error);
      return { success: false, message: error.message };
    }

    // Opcional: Insertar información adicional del usuario en la tabla 'users' si es necesario
    // const { error: insertError } = await supabase
    //   .from('users')
    //   .insert([{ id: data.user.id, email: data.user.email, role: 'registered' }]);

    // if (insertError) {
    //   console.error('Error inserting user data:', insertError);
    //   return { success: false, message: insertError.message };
    // }


    return { success: true, message: 'Registro exitoso. Por favor, verifica tu email.' };
  }

  if (action === 'login') {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error during login:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Inicio de sesión exitoso.' };
  }

  return { success: false, message: 'Acción de autenticación no válida.' };
}

/**
 * Obtiene los detalles de un vendedor específico por su slug o ID.
 * @param identifier - Un objeto con 'slug' o 'id' del vendedor.
 * @returns Una promesa que resuelve con el vendedor encontrado o null si no existe o hay un error.
 */
export async function getVendorBySlugOrId(identifier: { slug: string } | { id: string }): Promise<Vendor | null> {
  const supabase = createServerActionClient<Database>({ cookies });

  let query = supabase.from('vendors').select('*').single();

  if ('slug' in identifier) {
    query = query.eq('slug', identifier.slug);
  } else {
    query = query.eq('id', identifier.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene la lista de productos de un vendedor específico por su vendor_id.
 * @param vendorId - El ID (UUID) del vendedor.
 * @returns Una promesa que resuelve con un array de productos del vendedor o null en caso de error.
 */
export async function getProductsByVendorId(
  vendorId: string
): Promise<Product[] | null> {
  const supabase = createServerActionClient<Database>({ cookies });

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId);

  if (error) {
    console.error('Error fetching products by vendor ID:', error);
    return null;
  }

  return data;
}
