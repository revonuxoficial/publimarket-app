import { getFavorites } from '@/app/actions/favorites'; // Importar la Server Action para obtener favoritos
import { redirect } from 'next/navigation'; // Para redirigir
import React from 'react';
import ProductCard from '@/components/ProductCard'; // Importar el componente ProductCard
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'; // Importar cliente de Server Action
import { cookies } from 'next/headers'; // Importar cookies
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import Link from 'next/link'; // Importar Link para los enlaces de vendedores
import ErrorMessage from '@/components/ErrorMessage'; // Importar componente de error


// Definir tipos básicos para Product y Vendor (SOLUCIÓN TEMPORAL)
// La forma recomendada es usar los tipos generados por la CLI
interface Product {
  id: string;
  name: string;
  price: number | null;
  main_image_url: string;
  slug: string;
  vendor_id: string;
  // Añadir otros campos de producto si son necesarios para ProductCard
}

interface Vendor {
  id: string;
  store_name: string;
  slug: string;
  // Añadir otros campos de vendedor si son necesarios
}

// Definir un tipo básico para un favorito con datos de producto/vendedor (SOLUCIÓN TEMPORAL)
// Esto simula la unión de datos que necesitaríamos para mostrar los favoritos
interface FavoriteWithDetails {
    user_id: string;
    product_id: string | null;
    vendor_id: string | null;
    created_at: string;
    // Añadir los detalles del producto o vendedor
    product?: Product | null;
    vendor?: Vendor | null;
}


export default async function FavoritosPage() {
  // Inicializar el cliente de Supabase del lado del servidor
  const supabase = createServerActionClient<Database>({ cookies });

  // Obtener la sesión del usuario para verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario autenticado, redirigir a la página de autenticación
  if (!user) {
    redirect('/auth');
  }

  // Obtener la lista de favoritos del usuario autenticado usando la Server Action
  const { data: favorites, error } = await getFavorites();

  if (error) {
    console.error('Error al obtener favoritos:', error);
    // Manejar el error, mostrar un mensaje al usuario usando ErrorMessage
    return (
       <div className="container mx-auto p-4">
          <ErrorMessage message="Error al cargar los favoritos." />
       </div>
    );
  }

  // Si no hay favoritos o la lista está vacía
  if (!favorites || favorites.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Mis Favoritos</h1>
        <p className="text-gray-600">Aún no tienes favoritos guardados.</p>
      </div>
    );
  }

  // Para mostrar los detalles de productos y vendedores, necesitaríamos hacer joins
  // o llamadas adicionales a la base de datos. Como getFavorites solo devuelve los IDs,
  // haremos llamadas adicionales aquí para obtener los detalles.
  // NOTA: En una aplicación real, sería más eficiente modificar getFavorites
  // para que realice los joins directamente en la base de datos.

  const productIds = favorites.map(fav => fav.product_id).filter(id => id !== null) as string[];
  const vendorIds = favorites.map(fav => fav.vendor_id).filter(id => id !== null) as string[];

  let products: Product[] = [];
  let vendors: Vendor[] = [];

  if (productIds.length > 0) {
      const { data, error } = await supabase.from('products').select('id, name, price, main_image_url, slug, vendor_id').in('id', productIds);
      if (error) console.error('Error fetching favorite products:', error);
      else products = data || [];
  }

  if (vendorIds.length > 0) {
      const { data, error } = await supabase.from('vendors').select('id, store_name, slug').in('id', vendorIds);
      if (error) console.error('Error fetching favorite vendors:', error);
      else vendors = data || [];
  }

  // Mapear los favoritos originales con los detalles obtenidos
  const favoritesWithDetails: FavoriteWithDetails[] = favorites.map(fav => {
      const product = products.find(p => p.id === fav.product_id);
      const vendor = vendors.find(v => v.id === fav.vendor_id);
      return {
          ...fav,
          product: product || null,
          vendor: vendor || null,
      };
  });


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mis Favoritos</h1>

      {/* Mostrar Productos Favoritos */}
      {favoritesWithDetails.filter(fav => fav.product).length > 0 && (
          <div>
              <h2 className="text-xl font-semibold mb-4">Productos Favoritos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {favoritesWithDetails
                      .filter(fav => fav.product)
                      .map(fav => fav.product as Product) // Aseguramos que es Product
                      .map(product => (
                          <ProductCard key={product.id} product={product} />
                      ))}
              </div>
          </div>
      )}

      {/* Mostrar Vendedores Favoritos */}
      {favoritesWithDetails.filter(fav => fav.vendor).length > 0 && (
          <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Vendedores Favoritos</h2>
              <ul className="space-y-2">
                  {favoritesWithDetails
                      .filter(fav => fav.vendor)
                      .map(fav => fav.vendor as Vendor) // Aseguramos que es Vendor
                      .map(vendor => (
                          <li key={vendor.id} className="bg-white shadow-sm rounded-md p-4">
                              <Link href={`/tienda/${vendor.slug}`} className="text-blue-600 hover:underline font-medium">
                                  {vendor.store_name}
                              </Link>
                          </li>
                      ))}
              </ul>
          </div>
      )}

      {/* Mensaje si no hay favoritos de ningún tipo */}
      {favoritesWithDetails.filter(fav => fav.product || fav.vendor).length === 0 && (
           <div className="text-center text-gray-600">
               No tienes productos ni vendedores favoritos guardados.
           </div>
      )}

    </div>
  );
}
