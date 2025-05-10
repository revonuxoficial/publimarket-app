import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import { getAnnouncementsByCurrentUser, Announcement } from '@/app/actions/announcements'; // Importar la Server Action y el tipo
import DeleteAnnouncementButton from '@/components/DeleteAnnouncementButton'; // Importar el componente del botón de eliminar
import ErrorMessage from '@/components/ErrorMessage'; // Importar el componente de mensaje de error


// Esta página es un Server Component
export default async function VendorAnnouncementsPage() {
  const supabase = createServerActionClient<Database>({ cookies });

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Si no está autenticado, redirigir a la página de inicio o de autenticación
    redirect('/auth');
  }

  // Obtener el perfil del usuario para verificar el rol
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile || userProfile.role !== 'pro_vendor') {
    // Si no es vendedor PRO, redirigir a una página de error o a la página de inicio
    redirect('/'); // O a una página de error específica como '/acceso-denegado'
  }

  // Obtener los anuncios del vendedor autenticado
  const announcements = await getAnnouncementsByCurrentUser();

  // Manejar el caso de error al obtener anuncios (aunque getAnnouncementsByCurrentUser ya devuelve null en caso de error/no PRO)
  if (announcements === null && userProfile.role === 'pro_vendor') {
     // Esto podría indicar un error en la base de datos o en la Server Action
     // Mostrar un mensaje de error al usuario usando el componente reutilizable
     return (
       <div className="container mx-auto p-4">
         <h1 className="text-2xl font-bold mb-4">Mis Anuncios</h1>
         <ErrorMessage message="Error al cargar los anuncios. Por favor, inténtalo de nuevo más tarde." />
       </div>
     );
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Anuncios</h1>

      <div className="mb-6">
        <a href="/vendedor/anuncios/nuevo" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Añadir Nuevo Anuncio
        </a>
      </div>

      {announcements && announcements.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Título</th>
                <th className="py-3 px-6 text-left">Contenido</th>
                <th className="py-3 px-6 text-center">Imagen</th>
                <th className="py-3 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="font-medium">{announcement.title}</div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <p className="text-wrap max-w-md">{announcement.content}</p>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {announcement.image_url ? (
                      <img src={announcement.image_url} alt={announcement.title} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <span>Sin imagen</span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      <a href={`/vendedor/anuncios/editar/${announcement.id}`} className="w-8 mr-2 transform hover:text-purple-500 hover:scale-110">
                         {/* Icono de editar (ej: SVG) */}
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                         </svg>
                      </a>
                      {/* Usar el componente Client para el botón de eliminar */}
                      <DeleteAnnouncementButton announcementId={announcement.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No tienes anuncios publicados aún.</p>
      )}
    </div>
  );
}
