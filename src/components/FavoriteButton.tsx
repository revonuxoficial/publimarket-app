'use client';

import React, { useState } from 'react';
import { addFavorite, removeFavorite } from '@/app/actions/favorites'; // Importar Server Actions de favoritos
import ErrorMessage from './ErrorMessage'; // Importar ErrorMessage para mostrar errores

// Opcional: Puedes recibir props como productId o vendorId según la entidad que se quiera marcar.
// También se puede recibir un estado inicial y un callback para actualizar el estado en un nivel superior.
interface FavoriteButtonProps {
  productId?: string;
  vendorId?: string;
  initialFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ productId, vendorId, initialFavorite = false, onToggle }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  const handleToggle = async () => {
    if (!productId) {
      console.error("FavoriteButton requiere un productId.");
      setError("Error: Producto no identificado.");
      return;
    }

    setError(null); // Limpiar errores anteriores

    const newState = !isFavorite;
    let result;

    if (isFavorite) {
      // Si actualmente es favorito, lo removemos
      result = await removeFavorite(productId);
    } else {
      // Si no es favorito, lo añadimos
      result = await addFavorite(productId);
    }

    if (result.success) {
      setIsFavorite(newState);
      if (onToggle) {
        onToggle(newState);
      }
    } else {
      console.error("Error al actualizar favorito:", result.error);
      setError(result.error || "Ocurrió un error al actualizar favoritos.");
      // Opcional: revertir el estado visual si la operación falla
      // setIsFavorite(isFavorite);
    }
  };

  return (
    <> {/* Usar fragmento para poder incluir ErrorMessage */}
    <button
      onClick={handleToggle}
      className="flex items-center justify-center p-2 rounded-full transition-colors duration-200 hover:bg-slate-200 focus:outline-none"
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      {isFavorite ? (
        // Corazón lleno
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-red-500">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        // Corazón contorno
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 19.364a7.5 7.5 0 009.879 0l.999-.999a1.5 1.5 0 00-2.121-2.121L12 17.879l-1.878-1.878a1.5 1.5 0 10-2.121 2.121l.999.999zM4.5 12a7.5 7.5 0 0114.25 0c0 3.75-2.625 5.625-7.125 9-4.5-3.375-7.125-5.25-7.125-9z" />
        </svg>
      )}
    </button>
    {error && <ErrorMessage message={error} />} {/* Mostrar error si existe */}
    </>
  );
}
