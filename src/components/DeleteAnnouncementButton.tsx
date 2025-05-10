'use client';

import React, { useState } from 'react';
import { deleteAnnouncement } from '@/app/actions/announcements'; // Importar la Server Action de eliminación
import { useRouter } from 'next/navigation'; // Para refrescar la página o redirigir
import LoadingSpinner from '@/components/LoadingSpinner'; // Importar el componente de carga
import ErrorMessage from '@/components/ErrorMessage'; // Importar el componente de error


interface DeleteAnnouncementButtonProps {
  announcementId: string;
}

export default function DeleteAnnouncementButton({ announcementId }: DeleteAnnouncementButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
      setLoading(true);
      setError(null);

      const result = await deleteAnnouncement(announcementId);

      if (result.success) {
        // Anuncio eliminado con éxito, refrescar la página para actualizar la lista
        router.refresh();
      } else {
        setError(result.message || 'Error al eliminar el anuncio.');
      }

      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="w-8 mr-2 transform hover:text-red-500 hover:scale-110 disabled:opacity-50"
        title="Eliminar Anuncio"
      >
        {/* Mostrar spinner si está cargando, de lo contrario mostrar icono */}
        {loading ? (
           <LoadingSpinner /> // Ajusta el tamaño si es necesario
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m14 0H5m10 0a1 1 0 01-1 1h-4a1 1 0 01-1-1m2 4h.01M17 16h.01" />
           </svg>
        )}
      </button>
      {/* Usar ErrorMessage para mostrar errores */}
      {error && <ErrorMessage message={error} />}
    </>
  );
}
