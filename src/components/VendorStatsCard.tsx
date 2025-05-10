import React from 'react';
import { VendorAnalytics } from '@/app/actions/analytics'; // Importar el tipo de estadísticas

interface VendorStatsCardProps {
  stats: VendorAnalytics | null; // Datos de estadísticas del vendedor
}

// Este componente muestra las estadísticas básicas del vendedor
// Es un Server Component
export default function VendorStatsCard({ stats }: VendorStatsCardProps) {
  if (!stats) {
    // Mostrar un mensaje si no se pudieron cargar las estadísticas
    return (
      <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Estadísticas Rápidas</h2>
        <p className="text-red-500">No se pudieron cargar las estadísticas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 col-span-full">Estadísticas Rápidas</h2>

      {/* Tarjeta de Visitas */}
      <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">Visitas a la Tienda</p>
          <p className="text-2xl font-bold text-blue-800">{stats.totalViews}</p>
        </div>
        {/* Icono de ojo o similar */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </div>

      {/* Tarjeta de Clics en WhatsApp */}
      <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">Clics en WhatsApp</p>
          <p className="text-2xl font-bold text-green-800">{stats.whatsappClicks}</p>
        </div>
        {/* Icono de WhatsApp o mensaje */}
         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-.582.42C11.11 17.106 10 16.558 10 16v0z" />
         </svg>
      </div>

      {/* Puedes añadir más tarjetas de estadísticas aquí */}

    </div>
  );
}
