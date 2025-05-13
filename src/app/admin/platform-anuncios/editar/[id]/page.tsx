import { checkAdmin } from '@/app/actions/utils';
import { getPlatformAnnouncementById, PlatformAnnouncement } from '@/app/actions/platformAdmin'; // Usar la nueva función
import PlatformAnnouncementForm from '../../PlatformAnnouncementForm'; // Ruta corregida
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';

interface EditPlatformAnuncioPageProps {
  params: {
    id: string;
  };
}

// Necesitamos una función para obtener un solo anuncio por ID.
// La crearé en actions/platformAdmin.ts si no existe.
// Por ahora, asumiré que getPlatformAnnouncementsAdmin puede ser adaptada o crearé una nueva.
export default async function EditPlatformAnuncioPage({ params }: EditPlatformAnuncioPageProps) {
  await checkAdmin();
  const announcementId = params.id;

  const { data: announcement, error } = await getPlatformAnnouncementById(announcementId);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Editar Anuncio</h1>
        <ErrorMessage message={`Error al cargar el anuncio: ${error}`} />
        <Link href="/admin/platform-anuncios" className="mt-4 inline-block text-sky-600 hover:underline">
          Volver a la lista de anuncios
        </Link>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Editar Anuncio</h1>
        <ErrorMessage message="Anuncio no encontrado." />
        <Link href="/admin/platform-anuncios" className="mt-4 inline-block text-sky-600 hover:underline">
          Volver a la lista de anuncios
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <Link href="/admin/platform-anuncios" className="text-sky-600 hover:underline text-sm mb-2 inline-block">
          &larr; Volver a Anuncios de Plataforma
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">Editar Anuncio de Plataforma</h1>
        <p className="text-slate-600 mt-1">
          Modificá los detalles del anuncio "{announcement.title}".
        </p>
      </header>
      <PlatformAnnouncementForm initialData={announcement} />
    </div>
  );
}
