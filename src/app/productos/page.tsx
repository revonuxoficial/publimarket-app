import { getProducts, type Product } from '@/app/actions/public'; // Importar el tipo Product
import ProductCard from '@/components/ProductCard';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabaseClient'; // Cliente de Supabase del lado del cliente
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'; // Cliente de Server Action
import { cookies } from 'next/headers'; // Para acceder a las cookies
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import Link from 'next/link'; // Importar Link para los enlaces de paginación
import ErrorMessage from '@/components/ErrorMessage'; // Importar componente de error

// Definir el tipo para los parámetros de búsqueda
interface ProductosPageProps {
  searchParams?: {
    query?: string;
    city?: string;
    category?: string;
    page?: string;
  };
}

// Componente para mostrar la lista de productos
async function ProductsList({
  query,
  currentPage,
  city,
  category,
}: {
  query: string;
  currentPage: number;
  city?: string;
  category?: string;
}) {
  const { data: products, error } = await getProducts({
    query,
    page: currentPage,
    pageSize: 10,
    city,
    category,
  });

  if (error) {
    console.error('Error fetching products:', error);
    return <ErrorMessage message={`Error al cargar los productos: ${error.message}`} />;
  }

  if (!products || products.length === 0) {
    return <p className="col-span-full text-center text-gray-500">No se encontraron productos.</p>;
  }

  // Obtener el usuario autenticado para verificar si es vendedor PRO (para mostrar botón de añadir a favoritos)
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function ProductsPage(props: ProductosPageProps) {
  const searchParams = props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const city = searchParams?.city;
  const category = searchParams?.category;

  return (
    <>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-center my-6">Explorar Productos</h1>
        <form method="GET" className="p-4 bg-gray-100 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            name="query"
            placeholder="Buscar productos..."
            defaultValue={query}
            className="p-2 border rounded flex-grow"
          />
          <input
            type="text"
            name="city"
            placeholder="Filtrar por ciudad..."
            defaultValue={city}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="category"
            placeholder="Filtrar por categoría..."
            defaultValue={category}
            className="p-2 border rounded"
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">Buscar y Filtrar</button>
        </form>
        <Suspense fallback={<div className="text-center p-4">Cargando productos...</div>}>
          <ProductsList query={query} currentPage={currentPage} city={city} category={category} />
        </Suspense>
        <div className="flex justify-center gap-4 p-4">
          <Link
            href={`/productos?query=${query}&city=${city || ''}&category=${category || ''}&page=${Math.max(1, currentPage - 1)}`}
            className={`p-2 border rounded ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Anterior
          </Link>
          <span className="p-2">Página {currentPage}</span>
          <Link
            href={`/productos?query=${query}&city=${city || ''}&category=${category || ''}&page=${currentPage + 1}`}
            className="p-2 border rounded"
          >
            Siguiente
          </Link>
        </div>
      </div>
    </>
  );
}
