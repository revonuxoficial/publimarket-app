import React from 'react';
import Link from 'next/link';

export default function VendorProductsPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Productos</h1>
        <p className="text-slate-600 mt-1">Aquí podrás administrar tus productos.</p>
      </header>
      <div className="bg-white p-6 rounded-lg shadow">
        {/* Contenido de la página de gestión de productos irá aquí */}
        <p className="text-slate-500">Funcionalidad de gestión de productos en desarrollo.</p>
        <div className="mt-6">
          <Link href="/dashboard/vendedor" className="text-sky-600 hover:text-sky-700 hover:underline">
            &larr; Volver al Panel de Vendedor
          </Link>
        </div>
      </div>
    </div>
  );
}
