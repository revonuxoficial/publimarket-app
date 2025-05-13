'use client';

import React, { useState, useTransition } from 'react'; // Importar useState
import { useRouter } from 'next/navigation';
import { updatePlatformAnnouncement, PlatformAnnouncement } from '@/app/actions/platformAdmin';
import LoadingSpinner from '@/components/LoadingSpinner';
// ErrorMessage no es necesario si mostramos el mensaje como un <p> simple.

interface PublishPlatformAnnouncementButtonProps {
  announcement: PlatformAnnouncement;
}

export default function PublishPlatformAnnouncementButton({ announcement }: PublishPlatformAnnouncementButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // No necesitamos successMessage aquí porque el estado se refleja en el texto del botón y el color.
  const router = useRouter();

  const handleTogglePublish = async () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('id', announcement.id);
      formData.append('is_published', (!announcement.is_published).toString());
      
      const result = await updatePlatformAnnouncement(formData);
      if (result.success) {
        router.refresh(); 
      } else {
        setError(result.error || 'Error desconocido.');
        // Podríamos revertir visualmente el estado si tuviéramos un estado local para is_published aquí,
        // pero router.refresh() debería traer el estado correcto de la DB.
      }
    });
  };

  return (
    <div className="flex flex-col items-start"> {/* Contenedor para botón y mensaje de error */}
      <button
        onClick={handleTogglePublish}
        disabled={isPending}
        className={`px-2 py-1 text-xs font-medium rounded-md flex items-center
                    ${announcement.is_published 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'}
                    disabled:opacity-50`}
        title={announcement.is_published ? 'Despublicar Anuncio' : 'Publicar Anuncio'}
      >
        {isPending && <LoadingSpinner size="sm" message="" color="border-white" />}
        {isPending ? 'Cambiando...' : (announcement.is_published ? 'Despublicar' : 'Publicar')}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
