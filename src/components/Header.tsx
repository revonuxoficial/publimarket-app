import React from 'react';
import Link from 'next/link';
import AuthStatus from './AuthStatus'; // Importar el componente AuthStatus

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center flex-wrap">
      {/* Logo o Título del Sitio */}
      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          PubliMarket
        </Link>
      </div>

      {/* Navegación Principal (Opcional en MVP, se puede añadir después) */}
      {/* <nav className="flex space-x-4">
        <Link href="/productos" className="text-gray-600 hover:text-gray-800">
          Productos
        </Link>
        <Link href="/tiendas" className="text-gray-600 hover:text-gray-800">
          Tiendas
        </Link>
      </nav> */}

      {/* Estado de Autenticación */}
      <div className="mt-4 md:mt-0"> {/* Margen superior en móvil, cero en desktop */}
        <AuthStatus />
      </div>
    </header>
  );
}
