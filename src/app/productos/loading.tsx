import React from 'react';

// Componente de carga para la página de productos
export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl font-semibold text-gray-700">Cargando productos...</div>
    </div>
  );
}
