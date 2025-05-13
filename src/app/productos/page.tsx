import { getProducts, getUniqueCategories, getUniqueCities, Product } from '@/app/actions/public'; // Asegurar que Product esté importado
import ProductCard from '@/components/ProductCard';
import { Suspense } from 'react';
import ProductFiltersForm from './ProductFiltersForm'; // Importar el nuevo componente
import PaginationControls from '@/components/PaginationControls'; // Importar PaginationControls
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
// cookies ya no se importa directamente, createServerSupabaseClient lo maneja.
import { createServerSupabaseClient, type Database } from '@/lib/supabase'; // Usar el cliente de @supabase/ssr
import { getUserFavoriteProductIds } from '@/app/actions/favorites';

// Íconos para paginación y filtros
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);
// FilterIcon ya no es necesario aquí, está en ProductFiltersForm


interface ProductosPageProps {
  searchParams: {
    query?: string;
    city?: string;
    category?: string;
    page?: string;
    sort?: string; // Nuevo searchParam para ordenamiento
    onlyProVendors?: string; // Añadido para filtro PRO
  };
}

async function ProductsList({
  query,
  currentPage,
  city,
  category,
  sortBy,
  userId,
  favoriteProductIds,
  onlyProVendors, // Nuevo prop
}: {
  query: string;
  currentPage: number;
  city?: string;
  category?: string;
  sortBy?: string;
  userId?: string;
  favoriteProductIds?: string[];
  onlyProVendors?: boolean;
}) {
  const pageSize = 12;
  const { data: products, error, totalCount } = await getProducts({
    query,
    page: currentPage,
    pageSize,
    city,
    category,
    sortBy,
    onlyProVendors, // Pasar a getProducts
  });

  if (error) {
    console.error('Error fetching products:', error);
    return <ErrorMessage message={`Error al cargar los productos: ${error.message}`} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-slate-400 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <p className="text-xl text-slate-600">No se encontraron productos que coincidan con tu búsqueda.</p>
        <p className="text-slate-500 mt-2">Intentá con otros términos o filtros.</p>
      </div>
    );
  }
  
  // Asumimos que getProducts ahora también devuelve vendorSlug y vendorName en el objeto product
  // Si no, ProductCard usará placeholders o lógica interna para manejarlos.

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
      {products.map((product) => {
        const isFavorite = favoriteProductIds?.includes(product.id) ?? false;
        return (
          <ProductCard
            key={product.id}
            product={product}
            userId={userId}
            isFavorite={isFavorite}
          />
        );
      })}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductosPageProps) {
  const query = searchParams.query || '';
  const currentPage = Number(searchParams.page) || 1;
  const city = searchParams.city;
  const category = searchParams.category;
  const sortBy = searchParams.sort || 'date_desc'; // Valor por defecto para sortBy
  const onlyProVendors = searchParams.onlyProVendors === 'true';

  // Crear cliente Supabase para Server Component usando la función unificada
  const supabase = createServerSupabaseClient(); 
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  let favoriteProductIds: string[] = [];
  if (userId) {
    const favsResult = await getUserFavoriteProductIds();
    if (favsResult.productIds) {
      favoriteProductIds = favsResult.productIds;
    }
  }

  // Obtener listas para los selectores
  const uniqueCategories = await getUniqueCategories();
  const uniqueCities = await getUniqueCities();

  // Para la paginación, necesitamos el conteo total de productos con los filtros aplicados.
  // Importante: pasar sortBy también a esta llamada si afecta el conteo (aunque no debería para `totalCount`)
  // Sin embargo, getProducts no usa sortBy para el countQuery, así que está bien.
  const { totalCount: rawTotalCount } = await getProducts({ query, city, category, sortBy, pageSize: 1, page: 1 });
  const totalCount = rawTotalCount ?? 0; // Si es null, tratar como 0
  const totalPages = Math.ceil(totalCount / 12); // Asumiendo pageSize = 12

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 sm:text-5xl">
          Explorá Nuestros Productos
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Encontrá exactamente lo que buscás utilizando nuestros filtros.
        </p>
      </header>

      <ProductFiltersForm
        initialQuery={query}
        initialCity={city}
        initialCategory={category}
        initialSortBy={sortBy}
        uniqueCategories={uniqueCategories}
        uniqueCities={uniqueCities}
      />

      <Suspense fallback={<LoadingSpinner />}>
        <ProductsList
          query={query}
          currentPage={currentPage}
          city={city}
          category={category}
          sortBy={sortBy}
          userId={userId}
          favoriteProductIds={favoriteProductIds}
          onlyProVendors={onlyProVendors}
        />
      </Suspense>

      {/* Paginación: Usar el componente PaginationControls */}
      {totalCount > 0 && totalPages > 1 && (
        <div className="mt-12">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/productos"
            searchParams={{ query, city, category, sort: sortBy }}
          />
        </div>
      )}
      {totalCount === 0 && query && (
         <div className="text-center py-10">
           <p className="text-lg text-slate-500">No se encontraron productos para "{query}".</p>
         </div>
      )}
    </div>
  );
}
