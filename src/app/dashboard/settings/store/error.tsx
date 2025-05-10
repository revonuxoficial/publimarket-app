'use client';
/**
 * Muestra un mensaje de error amigable si ocurre un error durante la carga inicial de la configuración de la tienda.
 */
import ErrorMessage from '@/components/ErrorMessage';

export default function Error({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <ErrorMessage message={`Ocurrió un error al cargar la configuración de la tienda: ${error.message}`} />
    </div>
  );
}
