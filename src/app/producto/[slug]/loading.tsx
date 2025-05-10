import React from 'react';

// Componente de carga para la página de detalles del producto
export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl font-semibold text-gray-700">Cargando producto...</div>
    </div>
  );
}
