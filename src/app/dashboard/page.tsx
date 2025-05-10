import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import { Vendor, Product } from '@/app/actions/public'; // Importar los tipos Vendor y Product
import { getVendorAnalytics } from '@/app/actions/analytics'; // Importar la Server Action de estadísticas
import VendorStatsCard from '@/components/VendorStatsCard'; // Importar el componente de estadísticas
import { getAnnouncementsByCurrentUser, Announcement } from '@/app/actions/announcements'; // Importar la Server Action y el tipo de anuncios
import { getProductsByCurrentUser } from '@/app/actions/products'; // Importar la Server Action de productos
import ErrorMessage from '@/components/ErrorMessage'; // Importar el componente de mensaje de error


// Esta es la página principal del panel de vendedor PRO
// Es un Server Component
export default async function DashboardHomePage() {
  const supabase = createServerActionClient<Database>({ cookies });

  // Obtener la sesión del usuario (el middleware ya verificó que es un vendedor PRO)
  const { data: { user } } = await supabase.auth.getUser();

  // Obtener el perfil del vendedor asociado al usuario
  // Asumimos que el middleware ya garantizó que user existe y tiene role 'pro_vendor' con vendor_id
  const { data: vendorProfile, error: vendorError } = await supabase
    .from('vendors')
    .select('store_name')
    .eq('user_id', user?.id!) // Usar user?.id! ya que el middleware garantiza que user existe
    .single();

  // Obtener las estadísticas del vendedor
  const vendorStats = await getVendorAnalytics();

  // Obtener los anuncios más recientes del vendedor (ej: los 5 últimos)
  const recentAnnouncements = await getAnnouncementsByCurrentUser(5);

  // Obtener los productos más recientes del vendedor (ej: los 5 últimos)
  const recentProductsResult = await getProductsByCurrentUser(5);
  const recentProducts = recentProductsResult.data;


  // Manejar el caso de error al obtener el perfil del vendedor
  if (vendorError || !vendorProfile) {
    console.error('Error fetching vendor profile for dashboard:', vendorError);
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Panel de Vendedor</h1>
        <ErrorMessage message="Error al cargar el perfil del vendedor." />
      </div>
    );
  }

  const storeName = vendorProfile.store_name;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        ¡Bienvenido, {storeName}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sección para Estadísticas Básicas */}
        {vendorStats === null ? (
           <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3">
             <h2 className="text-xl font-semibold mb-4 text-gray-700">Estadísticas Rápidas</h2>
             <ErrorMessage message="Error al cargar las estadísticas." />
           </div>
        ) : (
           <VendorStatsCard stats={vendorStats} />
        )}


        {/* Sección para Anuncios Recientes */}
        <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Anuncios Recientes</h2>
          {recentAnnouncements === null ? (
             <ErrorMessage message="Error al cargar los anuncios recientes." />
          ) : recentAnnouncements.length > 0 ? (
            <ul className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <li key={announcement.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{announcement.content}</p>
                  {announcement.image_url && (
                    <img src={announcement.image_url} alt={announcement.title} className="mt-2 w-24 h-auto object-cover rounded" />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No tienes anuncios recientes.</p>
          )}
           <div className="mt-4 text-right">
              <a href="/dashboard/anuncios" className="text-blue-600 hover:underline text-sm">Ver todos los anuncios</a>
           </div>
        </div>

        {/* Sección para Productos Recientes */}
         <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Productos Recientes</h2>
          {recentProductsResult.error ? (
             <ErrorMessage message="Error al cargar los productos recientes." />
          ) : recentProducts && recentProducts.length > 0 ? (
            <ul className="space-y-4">
              {recentProducts.map((product) => (
                <li key={product.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0 flex items-center">
                   {product.main_image_url && (
                      <img src={product.main_image_url} alt={product.name} className="w-16 h-16 object-cover rounded mr-4" />
                   )}
                   <div>
                      <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                      {/* Puedes añadir más detalles del producto aquí si es necesario */}
                   </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No tienes productos recientes.</p>
          )}
           <div className="mt-4 text-right">
              <a href="/dashboard/productos" className="text-blue-600 hover:underline text-sm">Ver todos los productos</a>
           </div>
        </div>


        {/* Puedes añadir más secciones de resumen o acceso rápido aquí */}
        <div className="bg-white p-6 rounded-lg shadow">
           <h2 className="text-xl font-semibold mb-4 text-gray-700">Gestión Rápida</h2>
           <ul className="space-y-2">
             <li>
               <a href="/dashboard/productos" className="text-blue-600 hover:underline">Gestionar Productos</a>
             </li>
             <li>
               <a href="/dashboard/anuncios" className="text-blue-600 hover:underline">Gestionar Anuncios</a>
             </li>
             <li>
               <a href="/dashboard/settings/store" className="text-blue-600 hover:underline">Editar Perfil de Tienda</a>
             </li>
           </ul>
        </div>

        {/* Otra sección de ejemplo */}
         <div className="bg-white p-6 rounded-lg shadow">
           <h2 className="text-xl font-semibold mb-4 text-gray-700">Novedades</h2>
           <p className="text-gray-600">Mantente al tanto de las últimas actualizaciones de PubliMarket.</p>
           {/* Placeholder para noticias o tips */}
           <div className="mt-4 h-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

      </div>
    </div>
  );
}
