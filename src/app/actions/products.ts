'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/supabase';
import { checkProVendor } from '@/app/actions/utils';
// Usar los tipos Product y ProductForCard de actions/public.ts
import type { Product as FullProductType, ProductForCard } from './public';
import type { ProductVariation } from './public'; // Importar tipo ProductVariation

// Definir un tipo para los datos necesarios para crear un producto
interface NewProductData {
  name: string;
  slug: string;
  price?: number | null;
  description: string;
  main_image_url: string;
  gallery_image_urls?: string[] | null;
  whatsapp_link: string;
  category_id?: string | null; // Cambiado a category_id
  is_active?: boolean;
  // Añadir variaciones si se manejan en el mismo payload de creación
  variations?: { type: string; options: { name: string; stock: number | null; price: number | null }[] }[] | null;
}

// Definir un tipo para los datos necesarios para actualizar un producto
// Omitimos 'id' y 'vendor_id' ya que no deberían ser actualizables directamente así.
// 'created_at' y 'updated_at' son manejados por la DB.
// 'vendors' y 'categories' son relaciones, no campos directos de 'products'.
type UpdateProductDataFields = Partial<Omit<FullProductType, 'id' | 'vendor_id' | 'created_at' | 'updated_at' | 'vendors' | 'categories' | 'view_count'>>;
// Aseguramos que category_id sea el campo correcto
export interface UpdateProductData extends UpdateProductDataFields {
  category_id?: string | null;
  // Añadir variaciones si se manejan en el mismo payload de actualización
  variations?: { type: string; options: { name: string; stock: number | null; price: number | null }[] }[] | null;
}


// Server Action para añadir un nuevo producto
export async function addProduct(data: NewProductData) {
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;
  const isProVendor = authCheck.isPro;

  const supabase = createServerActionClient<Database>({ cookies }); // Crear instancia del cliente del lado del servidor

  // Lógica para el límite de productos para vendedores no PRO
  if (!isProVendor) {
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('is_active', true);

    if (countError) {
      console.error('Error al contar productos activos del vendedor:', countError);
      return { success: false, error: 'Error al verificar el límite de productos.' };
    }

    if (count !== null && count >= 10) {
      return { success: false, error: 'Has alcanzado el límite de 10 productos activos. Actualiza a PRO para publicar más.' };
    }
  }

  // Insertar el nuevo producto en la tabla 'products'
  const { data: newProduct, error: insertError } = await supabase
    .from('products')
    .insert({
      name: data.name,
      slug: data.slug,
      price: data.price,
      description: data.description,
      main_image_url: data.main_image_url,
      gallery_image_urls: data.gallery_image_urls,
      whatsapp_link: data.whatsapp_link,
      category_id: data.category_id, // Usar category_id
      is_active: data.is_active === undefined ? true : data.is_active,
      vendor_id: vendorId,
      // view_count se añadirá con DEFAULT 0 en la DB
    })
    .select() // Seleccionar el producto insertado para obtener su ID
    .single();


  if (insertError) {
    console.error('Error al añadir producto:', insertError);
    return { success: false, error: insertError.message };
  }

  // Si hay variaciones, insertarlas en la tabla product_variations
  if (newProduct && data.variations && data.variations.length > 0) {
    const variationInserts = data.variations.flatMap(variation =>
      variation.options.map(option => ({
        product_id: newProduct.id,
        variation_type: variation.type,
        option_name: option.name,
        stock: option.stock,
        price: option.price,
      }))
    );

    const { error: variationError } = await supabase
      .from('product_variations')
      .insert(variationInserts);

    if (variationError) {
      console.error('Error al insertar variaciones:', variationError);
      // Considerar si esto debe ser un error fatal o solo loguear
      // Por ahora, lo logueamos pero permitimos que el producto se cree sin variaciones
    }
  }


  revalidatePath('/productos');
  revalidatePath('/vendedor/productos');
  revalidatePath('/');
  // Considerar revalidar la página de la tienda específica si se puede obtener el slug del vendedor.
  // revalidatePath(`/tienda/${vendorSlug}`);
  // Considerar revalidar la página del producto específico si se puede obtener el slug del producto.
  // revalidatePath(`/producto/${data.slug}`);


  return { success: true, productId: newProduct?.id };
}

// Server Action para actualizar un producto existente
export async function updateProduct(product_id: string, data: UpdateProductData) {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies }); // Crear instancia del cliente del lado del servidor

  // Actualizar el producto en la tabla 'products'
  // Asegurarse de que la RLS en Supabase permita esta operación solo para el propio vendedor
  const updatePayload: { [key: string]: any } = { ...data };
  // No permitir actualizar vendor_id, created_at, updated_at, view_count directamente
  delete updatePayload.vendor_id;
  delete updatePayload.created_at;
  delete updatePayload.updated_at;
  delete updatePayload.view_count;
  // Si se pasa category_id como undefined, no intentar ponerlo a null a menos que se quiera explícitamente
  if (data.category_id === undefined) {
    delete updatePayload.category_id;
  }

  // Eliminar las variaciones del payload antes de actualizar la tabla products
  const variationsToUpdate = updatePayload.variations;
  delete updatePayload.variations;


  const { error: updateError } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', product_id)
    .eq('vendor_id', vendorId); // Asegurar que solo el dueño puede modificar


  if (updateError) {
    console.error('Error al actualizar producto:', updateError);
    return { success: false, error: updateError.message };
  }

  // Lógica para actualizar variaciones: eliminar antiguas e insertar nuevas
  // Primero, eliminar todas las variaciones existentes para este product_id
  const { error: deleteVariationsError } = await supabase
    .from('product_variations')
    .delete()
    .eq('product_id', product_id);

  if (deleteVariationsError) {
    console.error('Error al eliminar variaciones antiguas:', deleteVariationsError);
    // Decidir si esto debe ser un error fatal o continuar. Por ahora, logueamos y continuamos.
  }

  // Luego, insertar las nuevas variaciones si existen en el payload
  if (variationsToUpdate && variationsToUpdate.length > 0) {
    const variationInserts = variationsToUpdate.flatMap((variation: ProductVariation) => // Añadir tipo explícito
      variation.options.map(option => ({
        product_id: product_id, // Usar el ID del producto que se está actualizando
        variation_type: variation.type,
        option_name: option.name,
        stock: option.stock,
        price: option.price,
      }))
    );

    const { error: insertVariationsError } = await supabase
      .from('product_variations')
      .insert(variationInserts);

    if (insertVariationsError) {
      console.error('Error al insertar variaciones nuevas:', insertVariationsError);
      // Decidir si esto debe ser un error fatal o solo loguear. Por ahora, solo logueamos.
    }
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

  // 1. Obtener las URLs de las imágenes antes de eliminar el producto
  const { data: productToDelete, error: fetchProductError } = await supabase
    .from('products')
    .select('main_image_url, gallery_image_urls')
    .eq('id', product_id)
    .eq('vendor_id', vendorId) // Asegurar que el producto pertenece al vendedor autenticado
    .single();

  if (fetchProductError || !productToDelete) {
    console.error('Error al obtener producto para eliminar o no encontrado:', fetchProductError);
    return { success: false, error: 'No se pudo encontrar el producto para eliminar o no tienes permiso.' };
  }

  // 2. Eliminar imágenes asociadas de Supabase Storage
  const imageUrlsToDelete: string[] = [];
  if (productToDelete.main_image_url) {
    imageUrlsToDelete.push(productToDelete.main_image_url);
  }
  if (productToDelete.gallery_image_urls && productToDelete.gallery_image_urls.length > 0) {
    imageUrlsToDelete.push(...productToDelete.gallery_image_urls);
  }

  if (imageUrlsToDelete.length > 0) {
    // Extraer los paths de las URLs
    const pathsToDelete = imageUrlsToDelete.map(url => {
      // Asumiendo que la URL pública tiene el formato .../storage/v1/object/public/bucket-name/path/to/file
      const urlParts = url.split('/public/product-images/'); // Ajustar 'product-images' si el bucket es diferente
      return urlParts.length > 1 ? urlParts[1] : null;
    }).filter(path => path !== null) as string[];

    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage.from('product-images').remove(pathsToDelete);
      if (storageError) {
        console.error('Error al eliminar imágenes de Storage:', storageError);
        // Decidir si esto debe ser un error fatal. Por ahora, logueamos y continuamos.
      }
    }
  }


  // 3. Eliminar variaciones asociadas de la tabla product_variations
  // Esto podría manejarse con una restricción ON DELETE CASCADE en la FK si está configurada en la DB.
  // Si no, se necesita una eliminación explícita aquí:
  const { error: deleteVariationsError } = await supabase
    .from('product_variations')
    .delete()
    .eq('product_id', product_id);

  if (deleteVariationsError) {
    console.error('Error al eliminar variaciones asociadas:', deleteVariationsError);
    // Decidir si esto debe ser un error fatal o solo loguear. Por ahora, solo logueamos.
  }


  // 4. Eliminar el producto de la tabla 'products'
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
 * Obtiene la lista de productos del vendedor autenticado (para el dashboard del vendedor).
 * @param limit - Opcional: Límite de productos a obtener.
 * @returns Una promesa que resuelve con un array de ProductForCard o Product (dependiendo de los campos necesarios).
 */
// Devolveremos ProductForCard ya que es para listados y ProductCard lo usa.
export async function getProductsByCurrentUser(limit?: number): Promise<{ data: ProductForCard[] | null; error: string | null }> {
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies });

  const productSelect = 'id, name, slug, price, main_image_url, is_active, created_at, stock_quantity, view_count, vendor_id, category_id, categories (id, name, slug)'; // Campos para listado de vendedor
  // No necesitamos join con vendors aquí porque ya estamos filtrando por vendorId,
  // y el vendor_id del producto es suficiente para ProductForCard si vendors es null.

  let query = supabase
    .from('products')
    .select(productSelect)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error: fetchError } = await query;

  if (fetchError) {
    console.error('Error al obtener productos del vendedor:', fetchError);
    return { data: null, error: fetchError.message };
  }

  // Mapear para asegurar la estructura correcta de 'categories'
  // y para que coincida con ProductForCard
  const typedData = data?.map(p => {
    const productData: ProductForCard = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      main_image_url: p.main_image_url,
      is_active: p.is_active, // Asegurarse de que is_active esté en ProductForCard si se selecciona
      created_at: p.created_at, // Asegurarse de que created_at esté en ProductForCard si se selecciona
      stock_quantity: p.stock_quantity, // Añadir stock_quantity
      view_count: p.view_count, // Añadir view_count
      vendor_id: p.vendor_id,
      category_id: p.category_id,
      categories: Array.isArray(p.categories) ? p.categories[0] : p.categories,
      vendors: null, // No se seleccionó vendors explícitamente, pero ProductForCard lo permite como null
    };
    return productData;
  }) as ProductForCard[] | null; // El cast puede ser necesario si el mapeo no es perfecto para TS

  return { data: typedData, error: null };
}

// Server Action para cambiar el estado de activación de un producto
export async function toggleProductStatus(productId: string, currentState: boolean) {
  const authCheck = await checkProVendor(); // checkProVendor redirige si no es válido
  // Si llegamos aquí, authCheck.vendorId es válido.

  const supabase = createServerActionClient<Database>({ cookies });
  const newActiveState = !currentState;

  const { error } = await supabase
    .from('products')
    .update({ is_active: newActiveState })
    .eq('id', productId)
    .eq('vendor_id', authCheck.vendorId); // Asegurar que solo el dueño puede modificar

  if (error) {
    console.error('Error toggling product status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/vendedor/productos');
  revalidatePath('/productos'); // Revalidar lista pública también
  // Podríamos querer revalidar la página del producto específico también
  // const { data: product } = await supabase.from('products').select('slug').eq('id', productId).single();
  // if (product?.slug) revalidatePath(`/producto/${product.slug}`);

  return { success: true, newState: newActiveState };
}

// Server Action para duplicar un producto existente
export async function duplicateProduct(originalProductId: string) {
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;
  const isProVendor = authCheck.isPro;

  const supabase = createServerActionClient<Database>({ cookies });

  // 1. Obtener los datos del producto original
  const { data: originalProduct, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', originalProductId)
    .eq('vendor_id', vendorId) // Asegurar que el producto pertenece al vendedor
    .single();

  if (fetchError || !originalProduct) {
    console.error('Error al obtener el producto original para duplicar:', fetchError);
    return { success: false, error: 'No se pudo encontrar el producto original o no tienes permiso para duplicarlo.' };
  }

  // 2. Verificar el límite de productos para vendedores no PRO antes de duplicar
  if (!isProVendor) {
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('is_active', true);

    if (countError) {
      console.error('Error al contar productos activos del vendedor:', countError);
      return { success: false, error: 'Error al verificar el límite de productos.' };
    }

    if (count !== null && count >= 10) {
      return { success: false, error: 'Has alcanzado el límite de 10 productos activos. No puedes duplicar más productos hasta que actualices a PRO o desactives otros.' };
    }
  }

  // 3. Preparar los datos para el nuevo producto duplicado
  const newProductName = `${originalProduct.name} (Copia)`;
  // Generar un nuevo slug simple. Podría necesitar una lógica más robusta para asegurar unicidad.
  const newProductSlug = `${originalProduct.slug}-copia-${Date.now().toString().slice(-5)}`;

  const newProductData: Omit<Database['public']['Tables']['products']['Insert'], 'id' | 'created_at' | 'updated_at' | 'view_count'> = {
    vendor_id: vendorId,
    name: newProductName,
    slug: newProductSlug,
    description: originalProduct.description,
    price: originalProduct.price,
    category_id: originalProduct.category_id,
    main_image_url: originalProduct.main_image_url,
    gallery_image_urls: originalProduct.gallery_image_urls,
    whatsapp_link: originalProduct.whatsapp_link,
    is_active: false, // El producto duplicado comienza como inactivo
    // Campos específicos de la V2 del brief
    brand: originalProduct.brand,
    condition: originalProduct.condition,
    location_text: originalProduct.location_text,
    // latitude: originalProduct.latitude, // Descomentar si se usan coordenadas
    // longitude: originalProduct.longitude, // Descomentar si se usan coordenadas
    stock_quantity: originalProduct.stock_quantity,
    sku: originalProduct.sku ? `${originalProduct.sku}-C` : null, // Añadir sufijo al SKU si existe
    tags: originalProduct.tags,
    // Campos de 'product_variations' no se duplican automáticamente aquí, requeriría lógica adicional.
    // 'is_featured' y 'featured_until' no se copian por defecto.
  };

  // 4. Insertar el nuevo producto duplicado
  const { data: duplicatedProduct, error: insertError } = await supabase
    .from('products')
    .insert(newProductData)
    .select()
    .single();

  if (insertError) {
    console.error('Error al duplicar producto:', insertError);
    return { success: false, error: 'Error al crear la copia del producto: ' + insertError.message };
  }

  // TODO: Duplicar variaciones asociadas si existen
  // Esto requeriría obtener las variaciones del producto original y luego insertarlas con el nuevo product_id.
  // const { data: originalVariations, error: fetchVariationsError } = await supabase
  //   .from('product_variations')
  //   .select('*')
  //   .eq('product_id', originalProductId);
  // if (!fetchVariationsError && originalVariations && originalVariations.length > 0) {
  //   const duplicatedVariations = originalVariations.map(v => ({
  //     product_id: duplicatedProduct.id,
  //     variation_type: v.variation_type,
  //     option_name: v.option_name,
  //     stock: v.stock,
  //     price: v.price,
  //   }));
  //   const { error: insertVariationsError } = await supabase
  //     .from('product_variations')
  //     .insert(duplicatedVariations);
  //   if (insertVariationsError) {
  //     console.error('Error al duplicar variaciones:', insertVariationsError);
  //   }
  // }


  revalidatePath('/vendedor/productos');
  // Opcionalmente, redirigir al usuario a la página de edición del nuevo producto duplicado
  // if (duplicatedProduct) {
  //   redirect(`/vendedor/productos/editar/${duplicatedProduct.id}`);
  // }

  return { success: true, duplicatedProductId: duplicatedProduct?.id };
}
