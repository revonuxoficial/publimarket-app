import React from 'react';

// Componente de indicador de carga reutilizable
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      {/* Spinner simple con TailwindCSS */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-700">Cargando...</span>
    </div>
  );
}
