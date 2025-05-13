'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCategory } from '@/app/actions/categories';
import LoadingSpinner from '@/components/LoadingSpinner';
// ErrorMessage no es necesario aquí si mostramos el mensaje como un <p> simple.

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  onDeleted?: () => void; // Callback opcional
}

export default function DeleteCategoryButton({ categoryId, categoryName, onDeleted }: DeleteCategoryButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setError(null);
    setSuccessMessage(null);
    if (!window.confirm(`¿Estás seguro de que querés eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        setSuccessMessage(`Categoría "${categoryName}" eliminada con éxito.`);
        setTimeout(() => {
          if (onDeleted) {
            onDeleted();
          } else {
            router.refresh(); 
          }
        }, 1500); 
      } else {
        setError(result.error || 'Error desconocido al eliminar la categoría.');
      }
    });
  };

  return (
    <div className="flex flex-col items-end"> {/* Contenedor para el botón y los mensajes */}
      <button
        onClick={handleDelete}
        disabled={isPending || !!successMessage} 
        className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium"
        title={`Eliminar categoría ${categoryName}`}
      >
        {isPending ? (
          <span className="mr-1.5">
              <LoadingSpinner size="sm" message="" color="border-red-500" /> {/* Cambiado size a "sm" */}
          </span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        )}
        {isPending ? 'Eliminando...' : 'Eliminar'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1 text-right">{error}</p>} {/* Alineado a la derecha */}
      {successMessage && <p className="text-xs text-green-500 mt-1 text-right">{successMessage}</p>} {/* Alineado a la derecha */}
    </div>
  );
}
