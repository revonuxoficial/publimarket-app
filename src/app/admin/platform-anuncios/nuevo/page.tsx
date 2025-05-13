import { checkAdmin } from '@/app/actions/utils';
import PlatformAnnouncementForm from '../PlatformAnnouncementForm';
import Link from 'next/link';

export const metadata = {
  title: 'Nuevo Anuncio de Plataforma - Admin PubliMarket',
  description: 'Crear un nuevo anuncio para los usuarios de la plataforma.',
};

export default async function NuevoPlatformAnuncioPage() {
  await checkAdmin(); // Protege la ruta

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <Link href="/admin/platform-anuncios" className="text-sky-600 hover:underline text-sm mb-2 inline-block">
          &larr; Volver a Anuncios de Plataforma
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">Crear Nuevo Anuncio de Plataforma</h1>
        <p className="text-slate-600 mt-1">
          Redactá y configurá un nuevo anuncio para los usuarios.
        </p>
      </header>
      <PlatformAnnouncementForm />
    </div>
  );
}
