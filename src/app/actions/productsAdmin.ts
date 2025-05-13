'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { checkAdmin } from '@/app/actions/utils';
import { revalidatePath } from 'next/cache';
import { Product } from './public'; // Importar el tipo Product

// Extender el tipo Product para incluir el nombre de la tienda del vendedor
export interface ProductAdminView extends Product {
  vendor_store_name?: string;
}

interface GetProductsAdminParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string; // Para buscar por nombre de producto
  categoryFilter?: string;
  statusFilter?: 'active' | 'inactive' | ''; // '' para todos
  vendorNameFilter?: string; // Para buscar por nombre de tienda
}

interface GetProductsAdminResult {
  data: ProductAdminView[] | null;
  error?: string;
  totalCount: number | null;
}

/**
 * Obtiene una lista paginada de todos los productos para el panel de administración.
 * Incluye el nombre de la tienda del vendedor.
 * Solo para administradores.
 */
export async function getProductsAdmin({
  page = 1,
  pageSize = 15,
  searchTerm,
  categoryFilter,
  statusFilter,
  vendorNameFilter,
}: GetProductsAdminParams): Promise<GetProductsAdminResult> {
  await checkAdmin();
  const supabase = createServerComponentClient<Database>({ cookies });

  // Join con 'vendors' para 'store_name' y con 'categories' para 'name' y 'slug'.
  let query = supabase.from('products').select('*, vendors(store_name), categories(name, slug)', { count: 'exact' });

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  if (categoryFilter) { // categoryFilter se asume que es el slug de la categoría
    query = query.eq('categories.slug', categoryFilter);
  }
  if (statusFilter === 'active') {
    query = query.eq('is_active', true);
  } else if (statusFilter === 'inactive') {
    query = query.eq('is_active', false);
  }

  if (vendorNameFilter) {
    // Este filtro requiere que el join con 'vendors' funcione correctamente.
    // La consulta se vuelve más compleja si el filtro es en la tabla relacionada.
    // Podríamos necesitar una función de base de datos o filtrar post-consulta si es muy complejo.
    // Por ahora, intentamos con el filtro en el select.
    // Esto no filtrará directamente en la DB con `ilike` en la tabla anidada de esta forma.
    // Se necesitaría una subconsulta o una función RPC.
    // Simplificación: si se filtra por nombre de vendedor, se obtienen todos y se filtra en JS.
    // Esto NO es eficiente para grandes datasets.
  }

  query = query.order('created_at', { ascending: false });
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  query = query.range(start, end);

  const { data: productsData, error, count } = await query;

  if (error) {
    console.error('Error fetching products for admin:', error);
    return { data: null, error: error.message, totalCount: null };
  }
  
  let processedProducts: ProductAdminView[] = productsData?.map((p: any) => ({
    ...p,
    vendor_store_name: p.vendors?.store_name || 'N/A',
    // Asegurar que 'categories' sea un objeto o null, no un array, si el join devuelve un array con un solo elemento.
    categories: Array.isArray(p.categories) ? p.categories[0] : p.categories, 
  })) || [];

  // Filtrado manual por nombre de vendedor (ineficiente, pero para el ejemplo)
  if (vendorNameFilter) {
    processedProducts = processedProducts.filter(p => 
      p.vendor_store_name?.toLowerCase().includes(vendorNameFilter.toLowerCase())
    );
    // El `count` original no reflejará este filtro manual. Esto es una limitación.
  }


  return { data: processedProducts, totalCount: count }; // count puede no ser preciso si se filtra manualmente
}

/**
 * Actualiza el estado de activación de un producto.
 * Solo para administradores.
 * @param productId - El ID del producto.
 * @param isActive - El nuevo estado de activación.
 */
export async function updateProductStatusAdmin(
  productId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await checkAdmin();
  const supabase = createServerComponentClient<Database>({ cookies });

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId);

  if (error) {
    console.error(`Error updating status for product ${productId}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/productos');
  // También revalidar la página del producto y la tienda del vendedor si es posible
  // const { data: product } = await supabase.from('products').select('slug, vendors(slug)').eq('id', productId).single();
  // if (product) {
  //   revalidatePath(`/producto/${product.slug}`);
  //   if (product.vendors?.slug) {
  //     revalidatePath(`/tienda/${product.vendors.slug}`);
  //   }
  // }
  return { success: true };
}
