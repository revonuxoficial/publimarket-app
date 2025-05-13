import { getProductsByCurrentUser, deleteProduct } from '@/app/actions/products'; // Importar Server Actions de productos
import { redirect } from 'next/navigation'; // Para redirigir
import React from 'react';
import Link from 'next/link'; // Para enlaces de edición/añadir
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'; // Cliente Supabase para Server Components
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { ProductForCard } from '@/app/actions/public'; // Importar ProductForCard
import ProductStatusToggleButton from '@/components/ProductStatusToggleButton';
import DeleteProductButton from '@/components/DeleteProductButton'; // Importar el nuevo componente
export default async function VendedorProductosPage() {
  const supabase = createServerComponentClient<Database>({ cookies }); // Crear instancia del cliente para Server Component

  // Obtener la lista de productos del vendedor autenticado
  const { data: products, error } = await getProductsByCurrentUser();

  if (error) {
    console.error('Error al obtener productos del vendedor:', error);
    return <div className="container mx-auto p-4">Error al cargar los productos.</div>;
  }

  // La función handleDelete placeholder se elimina


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
                <th className="py-3 px-6 text-left">Stock</th> {/* Nueva columna para Stock */}
                <th className="py-3 px-6 text-left">Vistas</th> {/* Nueva columna para Vistas */}
                <th className="py-3 px-6 text-left">Estado</th>
                <th className="py-3 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {products.map((product: ProductForCard) => ( // Usar ProductForCard
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <Link href={`/producto/${product.slug}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {/* Placeholder para edición rápida de precio */}
                    {product.price ? `$${product.price.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {/* Placeholder para edición rápida de stock */}
                    {product.stock_quantity !== null && product.stock_quantity !== undefined ? product.stock_quantity : 'N/A'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {/* Mostrar contador de vistas */}
                    {product.view_count !== null && product.view_count !== undefined ? product.view_count : 0}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.is_active ?? true ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {product.is_active ?? true ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <ProductStatusToggleButton productId={product.id} initialIsActive={product.is_active ?? true} /> {/* Proporcionar valor por defecto */}
                      {/* Botón Editar */}
                      <Link href={`/vendedor/productos/editar/${product.id}`} className="w-6 h-6 transform hover:text-purple-500 hover:scale-110" title="Editar">
                         {/* Icono de editar (ejemplo SVG) */}
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                         </svg>
                      </Link>
                      {/* Botón Eliminar (usando el Client Component) */}
                      <DeleteProductButton productId={product.id} productSlug={product.slug} />
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
