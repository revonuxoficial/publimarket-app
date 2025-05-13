import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import { Vendor, Product } from '@/app/actions/public'; // Importar los tipos Vendor y Product
import { getVendorAnalytics } from '@/app/actions/analytics'; // Importar la Server Action de estadísticas
import VendorStatsCard from '@/components/VendorStatsCard'; // Importar el componente de estadísticas
import { getAnnouncementsByCurrentUser, Announcement } from '@/app/actions/announcements';
import { getProductsByCurrentUser } from '@/app/actions/products';
import ErrorMessage from '@/components/ErrorMessage';
import { getVisiblePlatformAnnouncements, PlatformAnnouncement } from '@/app/actions/platformAdmin'; // Para anuncios de plataforma


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

  // Obtener anuncios de plataforma visibles para vendedores PRO
  const platformAnnouncements = await getVisiblePlatformAnnouncements('pro_vendor', 3); // Mostrar hasta 3

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
        {/* Sección para Estadísticas */}
        <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-1 lg:col-span-1"> {/* Ajustado para ocupar una columna */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Resumen General</h2>
          {vendorStats?.data ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Productos:</span>
                <span className="font-bold text-lg text-gray-800">{vendorStats.data.totalProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600">Productos Activos:</span>
                <span className="font-bold text-lg text-green-700">{vendorStats.data.activeProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">Productos Inactivos:</span>
                <span className="font-bold text-lg text-red-700">
                  {vendorStats.data.totalProducts - vendorStats.data.activeProducts}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <span className="text-gray-600">Vistas Totales de Productos:</span>
                <span className="font-bold text-lg text-sky-700">{vendorStats.data.totalProductViews}</span>
              </div>
              {/* Si se reintroduce whatsappClicks en VendorAnalyticsData:
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clics en WhatsApp (General):</span>
                <span className="font-bold text-lg text-gray-800">{vendorStats.data.whatsappClicks || 0}</span>
              </div>
              */}
            </div>
          ) : vendorStats?.error ? (
            <ErrorMessage message={`Error al cargar estadísticas: ${vendorStats.error}`} />
          ) : (
            <p className="text-gray-500">Estadísticas no disponibles.</p>
          )}
        </div>
        
        {/* Ya no se usa VendorStatsCard directamente si integramos todo arriba, o se adapta VendorStatsCard */}
        {/* {vendorStats?.data && (
           <VendorStatsCard stats={vendorStats.data} /> // Pasar vendorStats.data
        )} */}


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
         <div className="bg-white p-6 rounded-lg shadow lg:col-span-1"> {/* Ajustar span si es necesario */}
           <h2 className="text-xl font-semibold mb-4 text-gray-700">Novedades de PubliMarket</h2>
           {platformAnnouncements && platformAnnouncements.length > 0 ? (
            <ul className="space-y-3">
              {platformAnnouncements.map((ann) => (
                <li key={ann.id} className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                  <h3 className="text-md font-semibold text-sky-700">{ann.title}</h3>
                  <p className="text-slate-600 text-sm mt-1">{ann.content.substring(0, 100)}{ann.content.length > 100 ? '...' : ''}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Publicado: {ann.published_at ? new Date(ann.published_at).toLocaleDateString('es-AR') : 'N/A'}
                  </p>
                  {/* Podría haber un enlace a un modal o página para ver el anuncio completo si es largo */}
                </li>
              ))}
            </ul>
           ) : (
            <p className="text-gray-600">No hay novedades por ahora.</p>
           )}
        </div>

      </div>
    </div>
  );
}
