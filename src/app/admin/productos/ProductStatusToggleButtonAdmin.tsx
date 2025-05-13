'use client';

import React, { useState, useTransition } from 'react';
import { updateProductStatusAdmin } from '@/app/actions/productsAdmin'; // Server action para admin
import { Switch } from '@headlessui/react'; // Asumiendo que headlessui está instalado y es el preferido para toggles
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProductStatusToggleButtonAdminProps {
  productId: string;
  initialIsActive: boolean;
}

export default function ProductStatusToggleButtonAdmin({ productId, initialIsActive }: ProductStatusToggleButtonAdminProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async () => {
    setError(null);
    startTransition(async () => {
      const newStatus = !isActive;
      const result = await updateProductStatusAdmin(productId, newStatus);
      if (result.success) {
        setIsActive(newStatus);
      } else {
        setError(result.error || 'Error al actualizar el estado.');
        // Revertir visualmente si falla (opcional, o mostrar error persistente)
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isActive}
        onChange={toggleStatus}
        disabled={isPending}
        className={`${
          isActive ? 'bg-green-600' : 'bg-slate-400'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50`}
      >
        <span className="sr-only">Activar o desactivar producto</span>
        <span
          className={`${
            isActive ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <span className={`text-xs font-medium ${isActive ? 'text-green-700' : 'text-slate-500'}`}>
        {isPending ? <LoadingSpinner size="sm" message="" /> : (isActive ? 'Activo' : 'Inactivo')}
      </span>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
