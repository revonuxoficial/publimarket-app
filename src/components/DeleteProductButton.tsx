'use client';

import React, { useState } from 'react';
import { deleteProduct } from '@/app/actions/products'; // Importar la Server Action de eliminar
import { useRouter } from 'next/navigation'; // Para revalidar o redirigir
import LoadingSpinner from './LoadingSpinner'; // Importar spinner si existe
import ErrorMessage from './ErrorMessage'; // Importar mensaje de error si existe

interface DeleteProductButtonProps {
  productId: string;
  productSlug?: string; // Opcional, para revalidar la página del producto
}

export default function DeleteProductButton({ productId, productSlug }: DeleteProductButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      setIsLoading(true);
      setError(null); // Limpiar errores anteriores

      const result = await deleteProduct(productId);

      if (!result.success) {
        setError(result.error || 'Error desconocido al eliminar el producto.');
        setIsLoading(false);
      } else {
        // Eliminación exitosa
        console.log(`Producto ${productId} eliminado exitosamente.`);
        // Revalidar la página de listado de productos del vendedor
        router.refresh(); // O router.push('/vendedor/productos'); si se prefiere redirigir
        // Si se necesita revalidar la página pública del producto, se podría hacer aquí si se tiene el slug
        // if (productSlug) {
        //   router.refresh(`/producto/${productSlug}`); // Esto no funciona directamente, revalidatePath es para Server Actions
        //   // La revalidación de la página pública del producto se maneja en la Server Action deleteProduct
        // }
      }
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        className="w-6 h-6 transform hover:text-red-500 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Eliminar"
        disabled={isLoading}
      >
        {isLoading ? (
          <LoadingSpinner /> // Mostrar spinner mientras carga
        ) : (
          // Icono de eliminar (ejemplo SVG)
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m14 0H5m10 0v4.003a.996.996 0 001 1h.997V15h-4v-1.997a1 1 0 00-1-1H9.003a1 1 0 00-1 1V15H5v-1.997a.996.996 0 001-1H7v-4.003a.996.996 0 00-1-1H5V7h14z" />
          </svg>
        )}
      </button>
      {error && <ErrorMessage message={error} />} {/* Mostrar error si existe */}
    </>
  );
}