'use client';

import { useState } from 'react';
import { blockUnblockUser } from '@/app/actions/users';
import { useRouter } from 'next/navigation';

interface BlockUnblockUserButtonProps {
  userId: string;
  isBlocked: boolean; // Necesitamos saber si el usuario ya está bloqueado
}

export default function BlockUnblockUserButton({ userId, isBlocked }: BlockUnblockUserButtonProps) {
  const [isBlocking, setIsBlocking] = useState(false);
  const router = useRouter();

  const handleBlockUnblock = async () => {
    setIsBlocking(true);
    const result = await blockUnblockUser(userId, !isBlocked); // Llama a la Server Action
    setIsBlocking(false);

    if (result.success) {
      // Opcional: Mostrar un mensaje de éxito
      console.log(`Usuario ${isBlocked ? 'desbloqueado' : 'bloqueado'} con éxito.`);
      // Revalidar la página para mostrar el estado actualizado
      router.refresh();
    } else {
      // Mostrar mensaje de error
      console.error(`Error al ${isBlocked ? 'desbloquear' : 'bloquear'} usuario:`, result.error);
      alert(`Error: ${result.error}`); // Alerta simple para el ejemplo
    }
  };

  return (
    <button
      onClick={handleBlockUnblock}
      disabled={isBlocking}
      className={`px-3 py-1 text-sm rounded ${
        isBlocked
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-red-500 hover:bg-red-600 text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isBlocking ? 'Procesando...' : isBlocked ? 'Desbloquear' : 'Bloquear'}
    </button>
  );
}