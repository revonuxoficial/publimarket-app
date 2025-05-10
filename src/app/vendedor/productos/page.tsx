import { getProductsByCurrentUser, deleteProduct } from '@/app/actions/products'; // Importar Server Actions de productos
import { redirect } from 'next/navigation'; // Para redirigir
import React from 'react';
import Link from 'next/link'; // Para enlaces de edición/añadir
import { createClient } from '@/lib/supabase'; // Cliente de Supabase del lado del servidor

// Definir un tipo básico para los datos de un producto (SOLUCIÓN TEMPORAL)
// La forma recomendada es usar los tipos generados por la CLI
interface Product {
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

// Función auxiliar para verificar si el usuario es un vendedor PRO (duplicada para Server Component)
// En una aplicación real, esta lógica podría centralizarse o manejarse de otra forma
async function checkProVendorServer(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Si no hay usuario, redirigir a la página de autenticación
    redirect('/auth');
  }

  // Obtener el rol del usuario desde la tabla 'users'
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !userProfile || userProfile.role !== 'pro_vendor') {
    // Si hay error, no se encuentra el perfil, o no es PRO, redirigir
    redirect('/'); // Redirigir al inicio
  }

  return user; // Retornar el usuario si es PRO
}


export default async function VendedorProductosPage() {
  const supabase = createClient(); // Crear instancia del cliente del lado del servidor

  // Verificar si el usuario es un vendedor PRO
  const user = await checkProVendorServer(supabase);

  // Obtener la lista de productos del vendedor autenticado
  const { data: products, error } = await getProductsByCurrentUser();

  if (error) {
    console.error('Error al obtener productos del vendedor:', error);
    return <div className="container mx-auto p-4">Error al cargar los productos.</div>;
  }

  // Función para manejar la eliminación de un producto (Server Action)
  // NOTA: Esta función debe ser llamada desde un Client Component
  const handleDelete = async (productId: string) => {
      // Aquí se llamaría a la Server Action deleteProduct
      // Esto requeriría un Client Component para manejar la interacción del botón
      // Por ahora, solo mostramos un log
      console.log('Eliminar producto:', productId);
      // await deleteProduct(productId);
      // revalidar la página si la eliminación es exitosa
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mis Productos</h1>

      <Link href="/vendedor/productos/nuevo" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-6 inline-block">
        Añadir Nuevo Producto
      </Link>

      {products && products.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Nombre</th>
                <th className="py-3 px-6 text-left">Precio</th>
                <th className="py-3 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <Link href={`/producto/${product.slug}`} className="text-blue-600 hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-3 px-6 text-left">{product.price ? `$${product.price.toFixed(2)}` : 'N/A'}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      {/* Botón Editar */}
                      <Link href={`/vendedor/productos/editar/${product.id}`} className="w-8 mr-2 transform hover:text-purple-500 hover:scale-110">
                         {/* Icono de editar (ejemplo SVG) */}
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                         </svg>
                      </Link>
                      {/* Botón Eliminar (requeriría un Client Component para la interacción) */}
                      {/* Por ahora, es un placeholder */}
                      <button onClick={() => handleDelete(product.id)} className="w-8 mr-2 transform hover:text-red-500 hover:scale-110">
                         {/* Icono de eliminar (ejemplo SVG) */}
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m14 0H5m10 0v4.003a.996.996 0 001 1h.997V15h-4v-1.997a1 1 0 00-1-1H9.003a1 1 0 00-1 1V15H5v-1.997a.996.996 0 001-1H7v-4.003a.996.996 0 00-1-1H5V7h14z" />
                         </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-600">
          Aún no tienes productos publicados.
        </div>
      )}
    </div>
  );
}
