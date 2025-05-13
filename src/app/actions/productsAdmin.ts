'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { checkAdmin } from '@/app/actions/utils';
import { revalidatePath } from 'next/cache';
import { Product } from './public'; // Importar el tipo Product
import { z } from 'zod'; // Para validación de datos

// Extender el tipo Product para incluir el nombre de la tienda del vendedor y el estado de destacado
// Hacer el 'id' obligatorio ya que siempre estará presente al obtener un producto específico
export interface ProductAdminView extends Product {
  id: string; // Hacer id obligatorio
  name: string; // Hacer name obligatorio
  is_active: boolean; // Hacer is_active obligatorio
  is_featured: boolean; // Hacer is_featured obligatorio
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
 * Obtiene un producto específico para el panel de administración.
 * Incluye el nombre de la tienda del vendedor.
 * Solo para administradores.
 * @param productId - El ID del producto a obtener.
 */
export async function getProductForAdmin(productId: string): Promise<{ data: ProductAdminView | null; error?: string }> {
  await checkAdmin();
  const supabase = createServerComponentClient<Database>({ cookies });

  // Join con 'vendors' para 'store_name' y con 'categories' para 'name' y 'slug'.
  const { data: productData, error } = await supabase
    .from('products')
    .select('*, vendors(store_name), categories(name, slug)')
    .eq('id', productId)
    .single();

  if (error) {
    console.error(`Error fetching product ${productId} for admin:`, error);
    return { data: null, error: error.message };
  }

  if (!productData) {
    return { data: null, error: 'Producto no encontrado.' };
  }

  const processedProduct: ProductAdminView = {
    ...productData,
    vendor_store_name: productData.vendors?.store_name || 'N/A',
    categories: Array.isArray(productData.categories) ? productData.categories[0] : productData.categories,
  };

  return { data: processedProduct };
}

// Esquema de validación para la actualización del producto (simplificado)
const updateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser positivo.').optional(),
  category_id: z.string().uuid('Categoría inválida.').optional().nullable(),
  is_active: z.boolean().optional(),
  // Añadir otros campos editables por el admin si es necesario
});

/**
 * Actualiza un producto existente.
 * Solo para administradores.
 * @param productId - El ID del producto a actualizar.
 * @param formData - Los datos del formulario para actualizar el producto.
 */
export async function updateProductAdmin(productId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  await checkAdmin();
  const supabase = createServerComponentClient<Database>({ cookies });

  // Extraer datos del FormData
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const priceString = formData.get('price') as string | null;
  const categoryId = formData.get('category_id') as string | null;
  const isActiveString = formData.get('is_active') as string | null;

  // Preparar datos para validación y actualización
  const updates: { [key: string]: any } = {
    name: name,
    description: description,
    category_id: categoryId === '' ? null : categoryId, // Convertir string vacío a null
  };

  if (priceString !== null && priceString !== '') {
    updates.price = parseFloat(priceString);
  }

  if (isActiveString !== null) {
     updates.is_active = isActiveString === 'on'; // Checkbox value is 'on' when checked
  }

  // Validar datos
  const validationResult = updateProductSchema.safeParse(updates);

  if (!validationResult.success) {
    console.error('Validation error:', validationResult.error.errors);
    return { success: false, error: validationResult.error.errors.map(e => e.message).join(', ') };
  }

  // Realizar la actualización en la base de datos
  const { error } = await supabase
    .from('products')
    .update(validationResult.data) // Usar los datos validados
    .eq('id', productId);

  if (error) {
    console.error(`Error updating product ${productId}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/productos/editar/${productId}`);
  revalidatePath('/admin/productos');
  // Opcional: revalidar la página del producto y la tienda del vendedor
  // const { data: product } = await supabase.from('products').select('slug, vendors(slug)').eq('id', productId).single();
  // if (product) {
  //   revalidatePath(`/producto/${product.slug}`);
  //   if (product.vendors?.slug) {
  //     revalidatePath(`/tienda/${product.vendors.slug}`);
  //   }
  // }

  return { success: true };
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
  // }
  // }
  return { success: true };
}

/**
 * Elimina un producto.
 * Solo para administradores.
 * @param productId - El ID del producto a eliminar.
 */
export async function deleteProductAdmin(productId: string): Promise<{ success: boolean; error?: string }> {
  await checkAdmin();
  const supabase = createServerComponentClient<Database>({ cookies });

  // TODO: Considerar la eliminación de imágenes asociadas en Supabase Storage.
  // Esto requeriría obtener los nombres de archivo de las imágenes antes de eliminar el producto
  // y luego usar el cliente de Supabase Storage con permisos de admin (service_role key),
  // lo cual, al igual que la gestión de usuarios, es más seguro en una Edge Function o backend.
  // Por ahora, solo eliminamos el registro de la base de datos.

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error(`Error deleting product ${productId}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/productos');
  // Opcional: revalidar otras rutas si es necesario (ej. página de inicio, página de tienda)
  return { success: true };
}

/**
 * Actualiza el estado de destacado de un producto.
 * Solo para administradores.
 * @param productId - El ID del producto.
 * @param isFeatured - El nuevo estado de destacado.
 */
export async function updateProductFeaturedStatus(
  productId: string,
  isFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
  await checkAdmin();
  const supabase = createServerComponentClient<Database>({ cookies });

  const { error } = await supabase
    .from('products')
    .update({ is_featured: isFeatured })
    .eq('id', productId);

  if (error) {
    console.error(`Error updating featured status for product ${productId}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/productos');
  // Opcional: revalidar la página principal o donde se muestren productos destacados
  // revalidatePath('/');
  return { success: true };
}
