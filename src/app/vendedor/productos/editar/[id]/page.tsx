import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProductByIdOrSlug } from '@/app/actions/public'; // Asumiendo que esta Server Action existe y funciona con ID
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import EditProductForm from './EditProductForm'; // Crearemos este componente en el siguiente paso

interface EditProductPageProps {
  params: {
    id: string; // El ID del producto viene de la URL
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = createServerComponentClient<Database>({ cookies });

  // 1. Verificar autenticación y rol
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Si no está autenticado, redirigir al inicio o página de error
    redirect('/'); // O '/auth' o una página de error
  }

  // Obtener el perfil del usuario para verificar el rol
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('role, vendor_id')
    .eq('id', user.id)
    .single();

  if (profileError || userProfile?.role !== 'pro_vendor' || !userProfile.vendor_id) {
    // Si hay error al obtener perfil, no es pro_vendor o no tiene vendor_id asociado, redirigir
    console.error('Acceso denegado: Usuario no es PRO Vendor o perfil incompleto', profileError);
    redirect('/vendedor/productos'); // Redirigir a la página de gestión de productos
  }

  const productId = params.id;

  // 2. Obtener datos del producto
  const product = await getProductByIdOrSlug(productId);

  if (!product) {
    console.error('Error al obtener producto o producto no encontrado.');
    // Redirigir si el producto no se encuentra
    redirect('/vendedor/productos');
  }

  // 3. Verificar que el producto pertenezca al vendedor autenticado
  if (product.vendor_id !== userProfile.vendor_id) {
    console.error('Acceso denegado: El producto no pertenece a este vendedor.');
    // Redirigir si el producto no es del vendedor
    redirect('/vendedor/productos');
  }

  // Si todo está bien, pasar los datos del producto al formulario de edición (Client Component)
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Producto</h1>
      {/* Aquí se renderizará el formulario de edición (Client Component) */}
      {/* Pasamos los datos del producto como prop */}
      {/* @ts-ignore // Ignorar temporalmente el error de tipo hasta definir bien EditProductForm */}
      <EditProductForm initialData={product} />
    </div>
  );
}
