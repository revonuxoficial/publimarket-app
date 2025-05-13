'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateVendorStatusAdmin } from '@/app/actions/vendorsAdmin'; // Server Action
import LoadingSpinner from '@/components/LoadingSpinner';

interface VendorStatusChangerProps {
  vendorId: string;
  currentStatus: 'active' | 'pending_approval' | 'suspended' | string; // Permitir string para flexibilidad inicial
}

const validStatuses: Array<'active' | 'pending_approval' | 'suspended'> = ['active', 'pending_approval', 'suspended'];

export default function VendorStatusChanger({ vendorId, currentStatus }: VendorStatusChangerProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmitChange = async () => {
    if (selectedStatus === currentStatus) {
      return;
    }
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await updateVendorStatusAdmin(vendorId, selectedStatus);
      if (result.success) {
        setSuccessMessage(`Estado actualizado a ${selectedStatus.replace('_', ' ')}.`);
        // La revalidación de ruta en la Server Action debería actualizar la lista.
        // Si no, router.refresh();
      } else {
        setError(result.error || 'Error al actualizar el estado.');
        setSelectedStatus(currentStatus); // Revertir en caso de error
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={selectedStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className="block w-full max-w-xs px-3 py-1.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
      >
        {validStatuses.map(status => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </option>
        ))}
      </select>
      <button
        onClick={handleSubmitChange}
        disabled={isPending || selectedStatus === currentStatus}
        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isPending && <LoadingSpinner size="sm" message="" color="border-white" />}
        {isPending ? 'Guardando...' : 'Guardar'}
      </button>
      {error && <p className="text-xs text-red-500 ml-2">{error}</p>}
      {successMessage && <p className="text-xs text-green-500 ml-2">{successMessage}</p>}
    </div>
  );
}
