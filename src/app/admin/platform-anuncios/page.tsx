import { checkAdmin } from '@/app/actions/utils';
import { getPlatformAnnouncementsAdmin, PlatformAnnouncement } from '@/app/actions/platformAdmin';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';
import PaginationControls from '@/components/PaginationControls';
import DeletePlatformAnnouncementButton from './DeletePlatformAnnouncementButton';
import PublishPlatformAnnouncementButton from './PublishPlatformAnnouncementButton';

export const metadata = {
  title: 'Anuncios de Plataforma - Admin PubliMarket',
  description: 'Gestionar anuncios y notificaciones para los usuarios de la plataforma.',
};

interface AdminPlatformAnunciosPageProps {
  searchParams: {
    page?: string;
  };
}

export default async function AdminPlatformAnunciosPage({ searchParams }: AdminPlatformAnunciosPageProps) {
  await checkAdmin();

  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 10;

  const { data: announcements, error, totalCount } = await getPlatformAnnouncementsAdmin(currentPage, pageSize);
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Anuncios de Plataforma</h1>
        <Link
          href="/admin/platform-anuncios/nuevo"
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
        >
          Crear Nuevo Anuncio
        </Link>
      </div>

      {error && <ErrorMessage message={`Error al cargar anuncios: ${error}`} />}

      {!error && announcements && announcements.length > 0 ? (
        <>
          <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Publicado el</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Creado el</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {announcements.map((ann: PlatformAnnouncement) => (
                  <tr key={ann.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{ann.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{ann.target_role || 'Todos'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ann.is_published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {ann.is_published ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {ann.published_at ? new Date(ann.published_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(ann.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <PublishPlatformAnnouncementButton announcement={ann} />
                      <Link
                        href={`/admin/platform-anuncios/editar/${ann.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Editar
                      </Link>
                      <DeletePlatformAnnouncementButton announcementId={ann.id} announcementTitle={ann.title} />
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
                baseUrl="/admin/platform-anuncios"
              />
            </div>
          )}
        </>
      ) : (
        !error && <p className="text-center text-slate-600 py-8">No hay anuncios de plataforma para mostrar.</p>
      )}
    </div>
  );
}
