import { getProductByIdOrSlug, getVendorBySlugOrId, type Product, type Vendor } from '@/app/actions/public'; // Importar getVendorBySlugOrId
import Image from 'next/image'; // Importar Image de next/image para optimización
import Link from 'next/link'; // Importar Link de next/link para enlaces

// Definir el tipo para los parámetros de la página
interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Componente de la página de detalles del producto (Server Component)
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  // Obtener datos del producto por slug
  const product = await getProductByIdOrSlug(slug);

  // Si el producto no se encuentra, mostrar un mensaje de error
  if (!product) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Producto no encontrado.
      </div>
    );
  }

  // Obtener información básica del vendedor usando el vendor_id del producto
  // Usar getVendorBySlugOrId y pasar objeto { id: product.vendor_id }
  const vendorInfo = await getVendorBySlugOrId({ id: product.vendor_id });

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Imagen Principal del Producto */}
        {product.main_image_url && (
          <div className="relative w-full h-96">
            <Image
              src={product.main_image_url}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        <div className="p-6">
          {/* Nombre y Precio del Producto */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          {product.price !== null && (
            <p className="text-2xl text-green-600 font-semibold mb-4">${product.price.toFixed(2)}</p>
          )}

          {/* Descripción del Producto */}
          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Información Básica del Vendedor */}
          {vendorInfo && (
            <div className="mb-6">
              <p className="text-gray-600">Vendido por: <Link href={`/tienda/${vendorInfo.slug}`} className="text-blue-600 hover:underline">{vendorInfo.store_name}</Link></p>
            </div>
          )}

          {/* Botón Consultar por WhatsApp */}
          {product.whatsapp_link && (
            <a
              href={product.whatsapp_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white text-lg font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out"
            >
              Consultar por WhatsApp
            </a>
          )}

          {/* Galería de Imágenes (Opcional) */}
          {product.gallery_image_urls && product.gallery_image_urls.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Más imágenes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {product.gallery_image_urls.map((imageUrl, index) => (
                  <div key={index} className="relative w-full h-32">
                    <Image
                      src={imageUrl}
                      alt={`Imagen ${index + 1} de ${product.name}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
