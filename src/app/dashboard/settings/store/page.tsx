import { getVendorProfile } from '@/app/actions/vendorProfile'; // Importar la Server Action para obtener el perfil
import VendorProfileForm from '@/components/VendorProfileForm'; // Importar el componente del formulario
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import { Vendor } from '@/app/actions/public'; // Importar el tipo Vendor

// Esta es la página para personalizar la microtienda del vendedor PRO
// Es un Server Component
export default async function VendorStoreSettingsPage() {
  // Obtener los datos iniciales del perfil del vendedor
  // El middleware ya verificó que el usuario es un vendedor PRO
  const initialVendorData = await getVendorProfile();

  // Aunque el middleware protege la ruta, si getVendorProfile devuelve null aquí,
  // podría indicar un problema de datos (ej: usuario PRO sin perfil de vendedor asociado)
  // En un caso real, podríamos manejar esto de forma más robusta,
  // pero para el MVP, el formulario manejará el caso de initialData nulo.


  return (
    <div className="container mx-auto p-6">
      {/* El título principal ya está en el layout, pero podemos añadir uno aquí si es necesario */}
      {/* <h1 className="text-2xl font-bold mb-4">Configuración de la Tienda</h1> */}

      {/* Renderizar el componente del formulario, pasándole los datos iniciales */}
      <VendorProfileForm initialData={initialVendorData} />
    </div>
  );
}
