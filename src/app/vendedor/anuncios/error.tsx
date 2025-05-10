'use client';
/**
 * Muestra un mensaje de error amigable si ocurre un error durante la carga inicial de la página de anuncios del vendedor.
 */
import ErrorMessage from '@/components/ErrorMessage';

export default function Error({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <ErrorMessage message={`Ocurrió un error al cargar tus anuncios: ${error.message}`} />
    </div>
  );
}
