import { getVendorBySlugOrId, getProductsByVendorId, type Vendor, type Product } from '@/app/actions/public'; // Importar getVendorBySlugOrId
import ProductCard from '@/components/ProductCard';
import Image from 'next/image'; // Importar Image de next/image para optimización

// Definir el tipo para los parámetros de la página
interface VendorPageProps {
  params: {
    slug: string;
  };
}

// Componente de la página de perfil del vendedor (Server Component)
export default async function VendorPage({ params }: VendorPageProps) {
  const { slug } = params;

  // Obtener datos del vendedor y sus productos en paralelo
  const [vendor, products] = await Promise.all([
    getVendorBySlugOrId({ slug }), // Usar getVendorBySlugOrId y pasar objeto { slug }
    // Asumimos que getProductsByVendorId acepta el vendor_id
    // Necesitamos el ID del vendedor para llamar a getProductsByVendorId
    // Esto implica que primero debemos obtener el vendedor para tener su ID.
    // Ajustaremos la llamada después de obtener el vendedor.
    // Por ahora, pasaremos un placeholder o manejaremos el caso donde vendor es null.
    // La llamada correcta se hará condicionalmente después de obtener el vendedor.
    Promise.resolve(null) // Placeholder temporal
  ]);

  // Si el vendedor no se encuentra, mostrar un mensaje de error
  if (!vendor) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Vendedor no encontrado.
      </div>
    );
  }

  // Ahora que tenemos el vendor, obtenemos sus productos usando su ID
  const vendorProducts = await getProductsByVendorId(vendor.id);


  return (
    <div className="container mx-auto p-4">
      {/* Información del Vendedor */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
        {vendor.logo_url && (
          <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={vendor.logo_url}
              alt={`Logo de ${vendor.store_name}`}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{vendor.store_name}</h1>
          {vendor.description && (
            <p className="text-gray-600 mb-4">{vendor.description}</p>
          )}
          <div className="text-gray-700">
            <p><strong>Ciudad:</strong> {vendor.city}</p>
            {vendor.location && <p><strong>Ubicación:</strong> {vendor.location}</p>}
            {/* No mostrar número de WhatsApp directamente aquí según brief */}
            {/* Enlaces a redes sociales y horarios opcionales */}
          </div>
        </div>
      </div>

      {/* Listado de Productos del Vendedor */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Productos de {vendor.store_name}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {vendorProducts && vendorProducts.length > 0 ? (
          vendorProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">Este vendedor aún no tiene productos publicados.</div>
        )}
      </div>
    </div>
  );
}
