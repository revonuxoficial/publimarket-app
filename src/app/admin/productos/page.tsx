import { checkAdmin } from '@/app/actions/utils';
import { getProductsAdmin, ProductAdminView, updateProductStatusAdmin } from '@/app/actions/productsAdmin';
import { getUniqueCategories } from '@/app/actions/public'; // Para el filtro de categorías
import Link from 'next/link';
import Image from 'next/image';
import ErrorMessage from '@/components/ErrorMessage';
import PaginationControls from '@/components/PaginationControls';
import ProductStatusToggleButtonAdmin from './ProductStatusToggleButtonAdmin'; // Nuevo componente
import DeleteProductButtonAdmin from './DeleteProductButtonAdmin'; // Importar el nuevo componente
import FeatureProductButtonAdmin from './FeatureProductButtonAdmin'; // Importar el nuevo componente

export const metadata = {
  title: 'Gestión de Productos - Admin PubliMarket',
  description: 'Administrar todos los productos de la plataforma PubliMarket.',
};

interface AdminProductosPageProps {
  searchParams: {
    page?: string;
    searchTerm?: string;
    category?: string;
    status?: 'active' | 'inactive' | '';
    vendorName?: string;
  };
}

export default async function AdminProductosPage({ searchParams }: AdminProductosPageProps) {
  await checkAdmin();

  const currentPage = Number(searchParams.page) || 1;
  const searchTerm = searchParams.searchTerm || undefined;
  const categoryFilter = searchParams.category || undefined;
  const statusFilter = searchParams.status || '';
  const vendorNameFilter = searchParams.vendorName || undefined;
  const pageSize = 15;

  const { data: products, error, totalCount } = await getProductsAdmin({
    page: currentPage,
    pageSize,
    searchTerm,
    categoryFilter,
    statusFilter: statusFilter as 'active' | 'inactive' | '',
    vendorNameFilter,
  });

  const uniqueCategories = await getUniqueCategories(); // Para el dropdown de filtro
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 0;
  const fallbackImageUrl = '/placeholder-image.png';

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Productos</h1>
      </header>

      <form method="GET" className="mb-6 p-4 bg-slate-50 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium text-slate-700">Buscar Producto</label>
          <input
            type="text" name="searchTerm" id="searchTerm" defaultValue={searchTerm}
            placeholder="Nombre del producto..."
            className="mt-1 block w-full input-class" // Reemplazar input-class con clases de Tailwind
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categoría</label>
          <select name="category" id="category" defaultValue={categoryFilter} className="mt-1 block w-full input-class">
            <option value="">Todas</option>
            {uniqueCategories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">Estado</label>
          <select name="status" id="status" defaultValue={statusFilter} className="mt-1 block w-full input-class">
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
        <div>
          <label htmlFor="vendorName" className="block text-sm font-medium text-slate-700">Nombre Tienda</label>
          <input
            type="text" name="vendorName" id="vendorName" defaultValue={vendorNameFilter}
            placeholder="Nombre de la tienda..."
            className="mt-1 block w-full input-class"
          />
        </div>
        <button type="submit" className="lg:col-start-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md h-fit">
          Filtrar Productos
        </button>
      </form>

      {error && <ErrorMessage message={`Error al cargar productos: ${error}`} />}

      {!error && products && products.length > 0 ? (
        <>
          <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Vendedor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Destacado</th> {/* Nueva columna */}
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {products.map((product: ProductAdminView) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Image
                            className="h-10 w-10 rounded-md object-cover"
                            src={product.main_image_url || fallbackImageUrl}
                            alt={product.name}
                            width={40}
                            height={40}
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-500 truncate max-w-xs" title={product.slug}>{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{product.vendor_store_name || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{product.categories?.name || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {product.price ? `$${product.price.toLocaleString('es-AR')}` : 'Consultar'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <ProductStatusToggleButtonAdmin productId={product.id} initialIsActive={product.is_active} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm"> {/* Columna para Destacado */}
                      <FeatureProductButtonAdmin productId={product.id} initialIsFeatured={product.is_featured} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link href={`/producto/${product.slug}`} target="_blank" className="text-sky-600 hover:text-sky-700">Ver</Link>
                      <Link href={`/admin/productos/editar/${product.id}`} className="text-indigo-600 hover:text-indigo-800">Editar</Link>
                      <DeleteProductButtonAdmin productId={product.id} productName={product.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalCount && totalPages > 1 && (
            <div className="mt-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/admin/productos"
                searchParams={{ searchTerm, category: categoryFilter, status: statusFilter, vendorName: vendorNameFilter }}
              />
            </div>
          )}
        </>
      ) : (
        !error && <p className="text-center text-slate-600 py-8">No hay productos para mostrar con los filtros actuales.</p>
      )}
    </div>
  );
}
