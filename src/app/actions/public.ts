'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase

// Definir tipos básicos para los datos (SOLUCIÓN TEMPORAL)
// La forma recomendada es generar estos tipos con la CLI de Supabase
export interface Vendor { // Exportar el tipo Vendor, movido aquí para que Product pueda referenciarlo
  id: string; // UUID
  user_id: string; // UUID
  store_name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  whatsapp_number: string | null; // Permitir null si el vendedor no tiene número
  social_links: any | null; // Usar 'any' temporalmente para JSONB
  opening_hours: any | null; // Usar 'any' temporalmente para JSONB
  location: string | null;
  city: string;
  latitude?: number | null; // Nuevo campo para geolocalización
  longitude?: number | null; // Nuevo campo para geolocalización
  created_at: string;
  updated_at: string;
  is_pro?: boolean; // Añadido para diferenciar vendedores PRO
}

export interface CategoryBasic { // Tipo para la categoría anidada
  id: string;
  name: string;
  slug: string;
  // Podríamos añadir más campos si el formulario de categorías los gestiona, como description, image_url
}

// Definir tipos para las variaciones del producto
export interface ProductVariationOption { // Exportar tipo
  name: string; // Ej: "Rojo", "Azul", "S", "M"
  stock: number | null;
  price: number | null; // Precio opcional por variación
}

export interface ProductVariation { // Exportar tipo
  type: string; // Ej: "Color", "Talla"
  options: ProductVariationOption[];
}


// Interfaz para los datos de producto que se muestran en las tarjetas (listados)
export interface ProductForCard {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  main_image_url: string;
  vendor_id: string;
  category_id: string | null;
  is_active?: boolean; // Añadir is_active, hacerlo opcional por si no siempre se selecciona
  created_at?: string; // Añadir created_at, hacerlo opcional
  stock_quantity?: number | null; // Añadir stock_quantity, opcional
  view_count?: number | null; // Añadir view_count, hacerlo opcional
  vendors: Pick<Vendor, 'store_name' | 'slug' | 'is_pro'> | null; // Añadir is_pro a la selección del vendedor
  categories: Pick<CategoryBasic, 'name' | 'slug'> | null;
}

// Interfaz para el detalle completo del producto
export interface Product {
  id?: string;
  vendor_id?: string;
  name?: string;
  slug?: string;
  price?: number | null;
  description?: string;
  main_image_url?: string | null; // Permitir null
  gallery_image_urls?: string[] | null;
  whatsapp_link?: string;
  category_id?: string | null; // Nueva columna para FK a categories.id
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  view_count?: number; // Añadido para getProductByIdOrSlug
  brand?: string | null; // Campos adicionales de la V2 del brief
  condition?: string | null;
  location_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  stock_quantity?: number | null;
  sku?: string | null;
  tags?: string[] | null;
  is_featured?: boolean; // Campo para publicaciones destacadas
  featured_until?: string | null; // Fecha de fin de destacado
  vendors?: Pick<Vendor, 'whatsapp_number' | 'slug' | 'store_name' | 'is_pro'> | null; // Añadir is_pro
  categories?: Pick<CategoryBasic, 'name' | 'slug'> | null; // Para el nombre y slug de la categoría
  // Añadir variaciones si se obtienen con el detalle completo del producto
  variations?: ProductVariation[] | null;
}


/**
 * Obtiene una lista paginada de productos.
 * Permite filtrar por ciudad y categoría.
 * @param page - Número de página (base 1).
 * @param pageSize - Cantidad de productos por página.
 * @param query - Opcional: Término de búsqueda para filtrar por nombre de producto.
 * @param city - Opcional: Ciudad para filtrar.
 * @param category - Opcional: Categoría para filtrar.
 * @param sortBy - Opcional: Campo para ordenar (ej: 'created_at_desc', 'price_asc', 'relevance').
 * @param onlyProVendors - Opcional: Filtrar solo por productos de vendedores PRO.
 * @param latitude - Opcional: Latitud para filtro por radio.
 * @param longitude - Opcional: Longitud para filtro por radio.
 * @param radius - Opcional: Radio en km para filtro por ubicación.
 * @returns Una promesa que resuelve con un objeto { data: ProductForCard[] | null, error: any, totalCount: number | null }.
 */
export async function getProducts({
  query,
  page,
  pageSize,
  city,
  category,
  sortBy, // Nuevo parámetro para ordenamiento
  onlyProVendors, // Nuevo parámetro para filtrar por vendedores PRO
  latitude,
  longitude,
  radius,
}: {
  query?: string;
  page: number;
  pageSize: number;
  city?: string;
  category?: string; // Este 'category' es el slug de la categoría para filtrar
  sortBy?: string;
  onlyProVendors?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number; // en kilómetros
}): Promise<{ data: ProductForCard[] | null; error: any; totalCount: number | null }> {
  const supabase = createServerActionClient<Database>({ cookies });
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Campos necesarios para ProductCard: id, name, slug, price, main_image_url, view_count, stock_quantity, is_active, created_at
  // Y del vendedor: store_name, slug, is_pro
  // Y de la categoría: name, slug
  const productCardSelect = `
    id, name, slug, price, main_image_url, vendor_id, is_active, created_at, stock_quantity, view_count,
    category_id,
    categories!inner (name, slug),
    vendors!products_vendor_id_fkey!inner (store_name, slug, is_pro)
  `;
  // Usamos !inner para asegurar que solo se devuelvan productos que tengan un vendedor y categoría asociados.
  // Simplificada la relación con categories, manteniendo explícita la de vendors.
  // Si se quisiera permitir productos sin categoría, se quitaría !inner de categories.

  let dbQuery = supabase.from('products').select(productCardSelect, { count: 'exact' }).eq('is_active', true); // Añadido count: 'exact' aquí

  // Aplicar filtro de Vendedores PRO si está activo
  if (onlyProVendors) {
    // Filtrar productos donde el vendedor asociado sea PRO
    dbQuery = dbQuery.eq('vendors.is_pro', true);
  }

  // Aplicar filtro de búsqueda por nombre, descripción o nombre de tienda si existe
  if (query) {
    const searchTerm = `%${query}%`;
    // Buscar productos cuyo nombre, descripción o nombre de tienda del vendedor coincida
    dbQuery = dbQuery.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},vendors.store_name.ilike.${searchTerm}`);
  }

  // Filtro por ubicación (radio de distancia)
  if (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    typeof radius === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    !isNaN(radius) &&
    radius > 0
  ) {
    // Supabase tiene funciones geoespaciales si la extensión postgis está habilitada.
    // Si no, se puede hacer un filtro basado en la distancia calculada en el backend o una función RPC.
    // Asumiendo que no tenemos postgis o una RPC geoespacial compleja configurada,
    // la forma más simple es obtener todos los vendors con lat/lon y filtrar en el backend,
    // luego usar los IDs de los vendors filtrados en la consulta principal. (Implementación actual)

    const { data: vendorIds, error: vendorError } = await supabase
      .from('vendors')
      .select('id, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (vendorError) {
      console.error('Error fetching vendor IDs for location filter:', vendorError);
      return { data: null, error: vendorError, totalCount: null };
    }

    // Calcular distancia para cada vendor y filtrar los que estén dentro del radio
    const EARTH_RADIUS_KM = 6371;
    const vendorsWithinRadius = (vendorIds || []).filter((vendor: any) => {
      if (
        typeof vendor.latitude !== 'number' ||
        typeof vendor.longitude !== 'number' ||
        isNaN(vendor.latitude) ||
        isNaN(vendor.longitude)
      ) {
        return false;
      }
      const dLat = ((latitude - vendor.latitude) * Math.PI) / 180;
      const dLon = ((longitude - vendor.longitude) * Math.PI) / 180;
      const lat1 = (vendor.latitude * Math.PI) / 180;
      const lat2 = (latitude * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = EARTH_RADIUS_KM * c;
      return distance <= radius;
    });

    if (vendorsWithinRadius.length === 0) {
      return { data: [], error: null, totalCount: 0 };
    }
    const ids = vendorsWithinRadius.map((vendor: any) => vendor.id);
    dbQuery = dbQuery.in('vendor_id', ids);
  }
  // Filtro por ciudad (si no hay filtro de ubicación)
  else if (city) {
    // Filtrar productos donde el vendedor asociado esté en la ciudad especificada
    dbQuery = dbQuery.eq('vendors.city', city);
  }

  if (category) {
    // Filtrar productos por el slug de la categoría asociada
    dbQuery = dbQuery.eq('categories.slug', category);
  }

  // Aplicar ordenamiento
  let orderByColumn = 'created_at';
  let orderByAscending = false;

  if (sortBy === 'relevance') {
    // Ordenar por view_count descendente como aproximación de relevancia
    orderByColumn = 'view_count';
    orderByAscending = false;
  } else if (sortBy) {
    const parts = sortBy.split('_');
    if (parts.length === 2) {
      const [column, direction] = parts;
      if (['name', 'price', 'created_at', 'view_count'].includes(column)) { // Añadido view_count para ordenamiento
        orderByColumn = column;
        orderByAscending = direction === 'asc';
      }
    }
  }

  dbQuery = dbQuery.order(orderByColumn, { ascending: orderByAscending });

  // Aplicar paginación
  const { data, error, count } = await dbQuery.range(start, end);


  if (error) {
    console.error('Error fetching products:', error);
    return { data: null, error, totalCount: null };
  }

  // Asegurar que los datos devueltos coincidan con el tipo ProductForCard[]
  // El select ahora es específico, por lo que el 'data' debería ser compatible.
  // Si 'vendors' o 'categories' vienen como un array (aunque con !inner deberían ser objeto o null), hay que ajustarlo.
  const typedData = data?.map(p => ({
    ...p,
    vendors: Array.isArray(p.vendors) ? p.vendors[0] : p.vendors,
    categories: Array.isArray(p.categories) ? p.categories[0] : p.categories,
  })) as ProductForCard[] | null;

  return { data: typedData, error: null, totalCount: count };
}

/**
 * Obtiene los detalles de un producto específico por su ID o slug.
 * @param identifier - El ID (UUID) o el slug del producto.
 * @returns Una promesa que resuelve con el producto completo encontrado o null si no existe o hay un error.
 */
export async function getProductByIdOrSlug( // Esta función devuelve el tipo Product completo
  identifier: string
): Promise<Product | null> {
  const supabase = createServerActionClient<Database>({ cookies });

  // Incluir datos del vendedor, de la categoría y las variaciones
  const productDetailSelect = `
    *,
    vendors!products_vendor_id_fkey (whatsapp_number, slug, store_name, is_pro),
    categories!inner (name, slug),
    product_variations (variation_type, option_name, stock, price)
  `;
  let queryBuilder = supabase
    .from('products')
    .select(productDetailSelect)
    .eq('is_active', true);

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  if (isUUID) {
    queryBuilder = queryBuilder.eq('id', identifier);
  } else {
     queryBuilder = queryBuilder.eq('slug', identifier);
  }

  const { data, error } = await queryBuilder.limit(1).single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  // Incrementar el contador de vistas si el producto fue encontrado
  if (data) {
    const supabaseUpdate = createServerActionClient<Database>({ cookies });
    // Llamar a la función RPC para incrementar el contador de vistas
    const { error: rpcError } = await supabaseUpdate
      .rpc('increment_product_view_count', { p_product_id: data.id }); // Usar data.id directamente
    if (rpcError) {
      console.error('Error incrementing view count:', rpcError);
      // No hacemos que esto sea un error fatal para la obtención del producto
    }
  }

  // Mapear los datos obtenidos al tipo Product, incluyendo el mapeo de variaciones
  const typedProductData: Product | null = data ? {
    ...(data as any), // Usar any temporalmente para el spread
    vendors: (data as any).vendors, // Acceder directamente
    categories: (data as any).categories, // Acceder directamente
    // Mapear las variaciones obtenidas a la estructura deseada
    variations: (data as any).product_variations?.reduce((acc: ProductVariation[], variation: any) => {
      let existingVariation = acc.find(v => v.type === variation.variation_type);
      if (!existingVariation) {
        existingVariation = { type: variation.variation_type, options: [] };
        acc.push(existingVariation);
      }
      existingVariation.options.push({
        name: variation.option_name,
        stock: variation.stock,
        price: variation.price,
      });
      return acc;
    }, []) || null,
  } : null;

  return typedProductData;
}

/**
 * Obtiene los detalles de múltiples productos por sus IDs (para ProductCard).
 * @param productIds - Un array de IDs de productos.
 * @returns Una promesa que resuelve con un array de ProductForCard.
 */
export async function getProductsByIds(productIds: string[]): Promise<ProductForCard[]> {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  const supabase = createServerActionClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, main_image_url, is_active, created_at, stock_quantity, view_count,
      vendor_id,
      category_id,
      categories!inner (name, slug),
      vendors!products_vendor_id_fkey!inner (store_name, slug, is_pro)
    `)
    .eq('is_active', true)
    .in('id', productIds);

  if (error) {
    console.error('Error fetching products by IDs:', error);
    return [];
  }
  // Mapeo para asegurar la estructura correcta de 'vendors' y 'categories'
  // El select ya debería devolver la estructura correcta con !inner,
  // pero mantenemos el mapeo para seguridad y consistencia con ProductForCard.
  const typedData = data?.map((p: any) => ({
    ...p,
    vendors: Array.isArray(p.vendors) ? p.vendors[0] : p.vendors,
    categories: Array.isArray(p.categories) ? p.categories[0] : p.categories,
  })) as ProductForCard[] | null;

  return typedData || [];
}

/**
 * Obtiene una lista de todas las categorías (id, nombre y slug) para usar en selectores y filtros.
 * @returns Una promesa que resuelve con un array de objetos { id: string, name: string, slug: string }.
 */
export async function getUniqueCategories(): Promise<{ id: string; name: string; slug: string; }[]> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug') // Seleccionar id, nombre y slug de la categoría
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching unique categories from categories table:', error);
    return [];
  }
  return data || [];
}

/**
 * Obtiene una lista de todas las ciudades únicas de los vendedores activos.
 * @returns Una promesa que resuelve con un array de strings (nombres de ciudades).
 */
export async function getUniqueCities(): Promise<string[]> {
  const supabase = createServerActionClient<Database>({ cookies });
  // Seleccionar ciudades distintas de vendedores que tienen al menos un producto activo
  // Esto requiere un JOIN o subconsulta para asegurar que el vendedor está activo a través de sus productos.
  // Una forma más simple es obtener ciudades de todos los vendedores y asumir que si tienen perfil, pueden tener productos.
  // O, obtener IDs de vendedores con productos activos y luego sus ciudades.
  // Obtener todas las ciudades (no nulas) y luego procesar para obtener únicas.
  const { data, error } = await supabase
    .from('vendors')
    .select('city')
    .not('city', 'is', null) // Excluir vendedores sin ciudad definida
    .order('city', { ascending: true }); // Mantener el ordenamiento si es deseado

  if (error) {
    console.error('Error fetching unique cities:', error);
    return [];
  }
  // Usar un Set para obtener ciudades únicas y luego convertir a array
  const uniqueCities = Array.from(new Set(data?.map((item: { city: string }) => item.city) || []));

  return uniqueCities;
}


/**
 * Define la estructura de una sugerencia de autocompletar.
 */
export interface AutocompleteSuggestion {
  type: 'product' | 'category' | 'vendor';
  value: string; // El texto a mostrar en la sugerencia
  slug?: string | null; // El slug asociado, si aplica
  id?: string | null; // El ID asociado, si aplica
}


/**
 * Obtiene sugerencias para autocompletar la barra de búsqueda.
 * Busca coincidencias parciales en nombres de productos, descripciones, nombres de categorías y nombres de tiendas de vendedores.
 * @param searchTerm - El término de búsqueda.
 * @returns Una promesa que resuelve con un array de sugerencias.
 */
export async function getAutocompleteSuggestions(searchTerm: string): Promise<AutocompleteSuggestion[]> {
  if (!searchTerm || searchTerm.length < 2) { // Requiere al menos 2 caracteres para buscar
    return [];
  }

  const supabase = createServerActionClient<Database>({ cookies });
  const term = `%${searchTerm}%`;
  const suggestions: AutocompleteSuggestion[] = [];

  // Buscar en nombres de productos (productos activos)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('name, slug, id') // Seleccionar id también para la sugerencia
    .ilike('name', term)
    .eq('is_active', true)
    .limit(5); // Limitar resultados para no sobrecargar

  if (productsError) {
    console.error('Error fetching product suggestions:', productsError);
  } else {
    products.forEach(p => {
      suggestions.push({ type: 'product', value: p.name, slug: p.slug, id: p.id });
    });
  }

  // Buscar en nombres de categorías
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('name, slug, id') // Seleccionar id también
    .ilike('name', term)
    .limit(3); // Limitar resultados

  if (categoriesError) {
    console.error('Error fetching category suggestions:', categoriesError);
  } else {
    categories.forEach(c => {
      suggestions.push({ type: 'category', value: c.name, slug: c.slug, id: c.id });
    });
  }

  // Buscar en nombres de tiendas de vendedores (vendedores con productos activos)
  // Esto requiere un JOIN o subconsulta para asegurar que el vendedor tiene productos activos.
  // Simplificación: buscar en todos los nombres de tiendas de vendedores.
   const { data: vendors, error: vendorsError } = await supabase
     .from('vendors')
     .select('store_name, slug, id') // Seleccionar id también
     .ilike('store_name', term)
     .limit(3); // Limitar resultados

   if (vendorsError) {
     console.error('Error fetching vendor suggestions:', vendorsError);
   } else {
     vendors.forEach(v => {
       suggestions.push({ type: 'vendor', value: v.store_name, slug: v.slug, id: v.id });
     });
   }


  // Eliminar duplicados si una coincidencia aparece en múltiples búsquedas (ej: nombre de producto = nombre de tienda)
  // Podríamos usar un Set o mapear a un formato único antes de añadir.
  // Implementación simple de eliminación de duplicados basada en el valor y tipo
  const uniqueSuggestions = Array.from(new Map(suggestions.map(item => [`${item.type}-${item.value}`, item])).values());
  
    return uniqueSuggestions;
  }

  // Mapeo para asegurar la estructura correcta de 'vendors' y 'categories'
  const typedData = data?.map((p: any) => ({
    ...p,
    vendors: Array.isArray(p.vendors) ? p.vendors[0] : p.vendors,
    categories: Array.isArray(p.categories) ? p.categories[0] : p.categories,
  })) as ProductForCard[] | null;


export async function getVendorBySlugOrId({ slug }: { slug: string }): Promise<Vendor | null> {
  const supabase = createServerActionClient<Database>({ cookies });
  
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  let query = supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true);

  if (isUUID) {
    query = query.eq('id', slug);
  } else {
    query = query.eq('slug', slug);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
  return data;
}

export async function getProductsByVendorId(vendorId: string): Promise<ProductForCard[]> {
  const supabase = createServerActionClient<Database>({ cookies });
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, main_image_url, is_active, created_at, stock_quantity, view_count,
      vendor_id,
      category_id,
      vendors:store_name, vendors:slug, vendors:is_pro,
      categories:name, categories:slug
    `)
    .eq('vendor_id', vendorId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vendor products:', error);
    return [];
  }

  const typedData = data?.map((p: any) => ({
    ...p,
    vendors: Array.isArray(p.vendors) ? p.vendors[0] : p.vendors,
    categories: Array.isArray(p.categories) ? p.categories[0] : p.categories,
  })) as ProductForCard[] | null;

  return typedData || [];
}
