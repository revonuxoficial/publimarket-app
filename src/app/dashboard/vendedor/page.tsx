import React from 'react';
import Link from 'next/link';

// Idealmente, este componente estaría más elaborado, mostrando estadísticas, accesos directos, etc.
// Por ahora, será una página de bienvenida simple.

export default async function VendorDashboardPage() {
  // Aquí se podrían obtener datos específicos del vendedor si fuera necesario,
  // por ejemplo, el nombre de la tienda para personalizar el saludo.
  // const supabase = createServerComponentClient({ cookies });
  // const { data: { user } } = await supabase.auth.getUser();
  // let vendorName = 'Vendedor';
  // if (user) {
  //   const { data: vendorProfile } = await supabase
  //     .from('vendors')
  //     .select('store_name')
  //     .eq('user_id', user.id)
  //     .single();
  //   if (vendorProfile?.store_name) {
  //     vendorName = vendorProfile.store_name;
  //   }
  // }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">
          Panel de Vendedor
        </h1>
        {/* <p className="text-xl text-slate-600 mt-2">¡Bienvenido, {vendorName}!</p> */}
        <p className="text-xl text-slate-600 mt-2">¡Bienvenido a tu panel de control!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ejemplo de tarjetas de acceso rápido */}
        <Link href="/dashboard/vendedor/productos" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-sky-700 mb-2">Mis Productos</h2>
          <p className="text-slate-600">Gestioná tu inventario, creá nuevos productos y editá los existentes.</p>
        </Link>
        
        <Link href="/dashboard/vendedor/anuncios" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-sky-700 mb-2">Mis Anuncios</h2>
          <p className="text-slate-600">Creá y gestioná anuncios para destacar tus productos o servicios.</p>
        </Link>

        <Link href="/dashboard/vendedor/mitienda" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-sky-700 mb-2">Configuración de Tienda</h2>
          <p className="text-slate-600">Actualizá los datos de tu tienda, logo y horarios.</p>
        </Link>

        <Link href="/dashboard/vendedor/suscripcion" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-sky-700 mb-2">Mi Suscripción PRO</h2>
          <p className="text-slate-600">Consultá o gestioná tu estado de suscripción Vendedor PRO.</p>
        </Link>
        
        {/* Se podrían añadir más tarjetas para estadísticas, pedidos (si aplica), etc. */}
      </div>
    </div>
  );
}
