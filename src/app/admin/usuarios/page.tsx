import { checkAdmin } from '@/app/actions/utils';
import { getUsers, UserProfile } from '@/app/actions/users';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';
import PaginationControls from '@/components/PaginationControls';
import UserRoleChanger from './UserRoleChanger'; // Importar el componente

export const metadata = {
  title: 'Gestión de Usuarios - Admin PubliMarket',
  description: 'Administrar usuarios de la plataforma PubliMarket.',
};

interface AdminUsuariosPageProps {
  searchParams: {
    page?: string;
    searchTerm?: string;
    role?: string;
  };
}

export default async function AdminUsuariosPage({ searchParams }: AdminUsuariosPageProps) {
  await checkAdmin();

  const currentPage = Number(searchParams.page) || 1;
  const searchTerm = searchParams.searchTerm || undefined;
  const roleFilter = searchParams.role || undefined;
  const pageSize = 15; // Usuarios por página

  const { data: users, error, totalCount } = await getUsers({
    page: currentPage,
    pageSize,
    searchTerm,
    roleFilter,
  });

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 0;

  // Opciones para el filtro de rol
  const roles = ['user', 'pro_vendor', 'admin']; // Ajustar según los roles disponibles

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Usuarios</h1>
      </header>

      {/* TODO: Formulario de Filtros (searchTerm, roleFilter) */}
      <form method="GET" className="mb-6 p-4 bg-slate-50 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="searchTerm" className="block text-sm font-medium text-slate-700">Buscar (ID/Email placeholder)</label>
            <input
              type="text"
              name="searchTerm"
              id="searchTerm"
              defaultValue={searchTerm}
              placeholder="ID de usuario o email..."
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700">Filtrar por Rol</label>
            <select
              name="role"
              id="role"
              defaultValue={roleFilter}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            >
              <option value="">Todos los roles</option>
              {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
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


      {error && <ErrorMessage message={`Error al cargar usuarios: ${error}`} />}

      {!error && users && users.length > 0 ? (
        <>
          <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">ID Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Email (Placeholder)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">ID Vendedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Registrado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user: UserProfile) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 truncate" title={user.id}>{user.id.substring(0,8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <UserRoleChanger userId={user.id} currentRole={user.role || 'user'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 truncate" title={user.vendor_id || ''}>
                      {user.vendor_id ? `${user.vendor_id.substring(0,8)}...` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(user.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {/* Otras acciones como suspender/eliminar podrían ir aquí */}
                      {/* <button className="text-red-600 hover:text-red-800">Suspender (placeholder)</button> */}
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
                baseUrl="/admin/usuarios"
                searchParams={{ searchTerm, role: roleFilter }}
              />
            </div>
          )}
        </>
      ) : (
        !error && <p className="text-center text-slate-600 py-8">No hay usuarios para mostrar con los filtros actuales.</p>
      )}
    </div>
  );
}
