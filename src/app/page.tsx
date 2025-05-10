import React from 'react';

// Componente de la página de inicio
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Sección de Texto Introductorio */}
      <section className="text-center mb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Encontrá lo que buscás, cerca tuyo.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          PubliMarket conecta negocios locales y microempresas con vos. Explorá productos y servicios en tu ciudad y contactá directamente por WhatsApp.
        </p>
      </section>

      {/* Sección del Buscador */}
      <section className="w-full max-w-md mb-12 px-4">
        {/* Placeholder para el componente Buscador */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Buscá en tu ciudad</h2>
          {/* Aquí irá el componente Buscador */}
          <div className="border border-gray-300 rounded p-3 text-gray-500">
            [Placeholder para Componente Buscador]
          </div>
        </div>
      </section>

      {/* Sección de Productos Destacados */}
      <section className="w-full px-4">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Productos Destacados</h2>
        {/* Placeholder para el listado de Productos Destacados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Aquí irá el listado de productos (ej: Componente ProductCard) */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
            [Placeholder para Producto Destacado 1]
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
            [Placeholder para Producto Destacado 2]
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
            [Placeholder para Producto Destacado 3]
          </div>
          {/* ... más placeholders o el componente real de listado de productos */}
        </div>
      </section>
    </div>
  );
}
