import React from 'react';
import Link from 'next/link'; // Usar Link para la navegación interna

// Este es el layout para las rutas dentro de /dashboard
// Es un Server Component
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No es necesario verificar autenticación o rol aquí, el middleware se encarga de eso.

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Barra Lateral de Navegación */}
      {/* Ajuste de responsividad: la barra lateral ocupa todo el ancho en móvil y un ancho fijo en md+ */}
      <aside className="w-full md:w-64 bg-gray-800 text-white p-4 space-y-2 flex-shrink-0">
        <h2 className="text-xl font-bold mb-4">Panel de Vendedor</h2>
        <nav>
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard/vendedor/productos" className="block py-2 px-4 rounded hover:bg-gray-700">
                Productos
              </Link>
            </li>
            <li>
              <Link href="/dashboard/vendedor/mitienda" className="block py-2 px-4 rounded hover:bg-gray-700">
                Mi Tienda
              </Link>
            </li>
            <li>
              <Link href="/dashboard/vendedor/anuncios" className="block py-2 px-4 rounded hover:bg-gray-700">
                Anuncios
              </Link>
            </li>
            <li>
              <Link href="/dashboard/vendedor/suscripcion" className="block py-2 px-4 rounded hover:bg-gray-700">
                Suscripción PRO
              </Link>
            </li>
            <li>
              <Link href="/dashboard/vendedor" className="block py-2 px-4 rounded hover:bg-gray-700 mt-4 border-t border-gray-700 pt-2">
                Panel Principal
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children} {/* Aquí se renderizará el contenido de las páginas anidadas */}
      </main>
    </div>
  );
}
