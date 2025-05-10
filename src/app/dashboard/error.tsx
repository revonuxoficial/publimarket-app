'use client';
/**
 * Muestra un mensaje de error amigable si ocurre un error durante la carga inicial del dashboard.
 */
import ErrorMessage from '@/components/ErrorMessage';

export default function Error({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <ErrorMessage message={`Ocurrió un error al cargar el panel de control: ${error.message}`} />
    </div>
  );
}
