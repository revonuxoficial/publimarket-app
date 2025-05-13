'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserRole } from '@/app/actions/users'; // Server Action
import LoadingSpinner from '@/components/LoadingSpinner';

interface UserRoleChangerProps {
  userId: string;
  currentRole: string;
}

const validRoles = ['user', 'pro_vendor', 'admin']; // Definir roles válidos

export default function UserRoleChanger({ userId, currentRole }: UserRoleChangerProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmitChange = async () => {
    if (selectedRole === currentRole) {
      // No hay cambios
      return;
    }
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await updateUserRole(userId, selectedRole);
      if (result.success) {
        setSuccessMessage(`Rol actualizado a ${selectedRole}.`);
        // router.refresh(); // La revalidación de ruta en la Server Action debería ser suficiente
      } else {
        setError(result.error || 'Error al actualizar el rol.');
        setSelectedRole(currentRole); // Revertir al rol original en caso de error
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={selectedRole}
        onChange={handleRoleChange}
        disabled={isPending}
        className="block w-full max-w-xs px-3 py-1.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
      >
        {validRoles.map(role => (
          <option key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </option>
        ))}
      </select>
      <button
        onClick={handleSubmitChange}
        disabled={isPending || selectedRole === currentRole}
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
