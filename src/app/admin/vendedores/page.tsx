import { checkAdmin } from '@/app/actions/utils';
import { getVendorsAdmin, VendorAdminProfile } from '@/app/actions/vendorsAdmin';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';
import PaginationControls from '@/components/PaginationControls';
import VendorStatusChanger from './VendorStatusChanger'; // Importar el componente

export const metadata = {
  title: 'Gestión de Vendedores - Admin PubliMarket',
  description: 'Administrar vendedores de la plataforma PubliMarket.',
};

interface AdminVendedoresPageProps {
  searchParams: {
    page?: string;
    searchTerm?: string;
    status?: string;
  };
}

export default async function AdminVendedoresPage({ searchParams }: AdminVendedoresPageProps) {
  await checkAdmin();

  const currentPage = Number(searchParams.page) || 1;
  const searchTerm = searchParams.searchTerm || undefined;
  const statusFilter = searchParams.status || undefined;
  const pageSize = 15; // Vendedores por página

  const { data: vendors, error, totalCount } = await getVendorsAdmin({
    page: currentPage,
    pageSize,
    searchTerm,
    statusFilter,
  });

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 0;
  const vendorStatuses = ['active', 'pending_approval', 'suspended']; // Ajustar según estados definidos

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Vendedores</h1>
        {/* Podría haber un botón para "Añadir Vendedor Manualmente" si fuera necesario */}
      </header>

      <form method="GET" className="mb-6 p-4 bg-slate-50 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="searchTerm" className="block text-sm font-medium text-slate-700">Buscar (Nombre Tienda/Slug)</label>
            <input
              type="text"
              name="searchTerm"
              id="searchTerm"
              defaultValue={searchTerm}
              placeholder="Nombre o slug..."
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Filtrar por Estado</label>
            <select
              name="status"
              id="status"
              defaultValue={statusFilter}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            >
              <option value="">Todos los estados</option>
              {vendorStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
            </select>
          </div>
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors h-fit"
          >
            Filtrar
          </button>
        </div>
      </form>

      {error && <ErrorMessage message={`Error al cargar vendedores: ${error}`} />}

      {!error && vendors && vendors.length > 0 ? (
        <>
          <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Tienda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Email Usuario (Placeholder)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Ciudad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Registrado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {vendors.map((vendor: VendorAdminProfile) => (
                  <tr key={vendor.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      <Link href={`/tienda/${vendor.slug}`} className="hover:text-sky-600" target="_blank">
                        {vendor.store_name}
                      </Link>
                      <p className="text-xs text-slate-500">{vendor.slug}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{vendor.user_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{vendor.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <VendorStatusChanger vendorId={vendor.id} currentStatus={vendor.status || 'active'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(vendor.user_created_at || vendor.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {/* Otras acciones como ver detalles del vendedor (si se crea una página para ello) */}
                      {/* <Link href={`/admin/vendedores/${vendor.id}`} className="text-indigo-600 hover:text-indigo-800">Ver/Editar</Link> */}
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
                baseUrl="/admin/vendedores"
                searchParams={{ searchTerm, status: statusFilter }}
              />
            </div>
          )}
        </>
      ) : (
        !error && <p className="text-center text-slate-600 py-8">No hay vendedores para mostrar con los filtros actuales.</p>
      )}
    </div>
  );
}
