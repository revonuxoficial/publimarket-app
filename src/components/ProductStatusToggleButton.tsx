'use client';

import React, { useState, useTransition } from 'react';
import { toggleProductStatus } from '@/app/actions/products'; // Server Action
import { useRouter } from 'next/navigation'; // Para revalidar o refrescar si es necesario

interface ProductStatusToggleButtonProps {
  productId: string;
  initialIsActive: boolean;
}

export default function ProductStatusToggleButton({ productId, initialIsActive }: ProductStatusToggleButtonProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isPending, startTransition] = useTransition(); // Para manejar el estado de carga de la Server Action
  const router = useRouter();

  const handleToggle = async () => {
    startTransition(async () => {
      const result = await toggleProductStatus(productId, isActive);
      if (result.success && result.newState !== undefined) {
        setIsActive(result.newState);
        // La revalidación se hace en la Server Action, pero podríamos querer un router.refresh()
        // si la UI no se actualiza inmediatamente por alguna razón de caché del cliente.
        // router.refresh(); // Descomentar si es necesario
      } else {
        // Manejar error, quizás mostrar un toast/notificación
        console.error("Error al cambiar estado del producto:", result.error);
        // Opcional: revertir el estado visual si la acción falla (aunque el estado del servidor es la verdad)
        // setIsActive(currentIsActive => !currentIsActive); // Esto podría ser confuso
      }
    });
  };

  const buttonText = isActive ? 'Desactivar' : 'Activar';
  const buttonColor = isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600';

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1 text-xs font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColor} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isActive ? 'Desactivar producto (no será visible para compradores)' : 'Activar producto (será visible para compradores)'}
    >
      {isPending ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {buttonText}
    </button>
  );
}
