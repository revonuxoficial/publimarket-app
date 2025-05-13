import { getProductByIdOrSlug } from '@/app/actions/public';
import Image from 'next/image';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';
import { headers } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { getUserFavoriteProductIds, getFavoriteStatus } from '@/app/actions/favorites';
import FavoriteButton from '@/components/FavoriteButton';
import type { Metadata, ResolvingMetadata } from 'next';
import type { ProductVariation } from '@/app/actions/public'; // Importar tipo ProductVariation

// import LoadingSpinner from '@/components/LoadingSpinner';

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 mr-2.5" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.468.13-.616.134-.133.297-.347.446-.521.149-.172.198-.296.297-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Función para generar metadata dinámica
export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const product = await getProductByIdOrSlug(slug); // Reutiliza la función de carga de datos

  if (!product) {
    return {
      title: 'Producto no encontrado - PubliMarket',
      description: 'El producto que buscás no está disponible o no existe.',
    };
  }

  const siteName = 'PubliMarket';
  const title = `${product.name || 'Producto'} ${product.vendors?.store_name ? `- ${product.vendors.store_name}` : ''} | ${siteName}`; // Manejar undefined en product.name
  // Tomar los primeros 160 caracteres de la descripción para meta description
  const description = product.description
    ? product.description.substring(0, 160).replace(/\s+/g, ' ').trim() + (product.description.length > 160 ? '...' : '')
    : `Encontrá ${product.name || 'este producto'} en ${siteName}. Detalles, precios y contacto directo con el vendedor.`; // Manejar undefined en product.name

  // Construir la URL canónica
  // Necesitamos obtener el host de alguna manera, o usar una variable de entorno para la URL base
  // Por ahora, asumimos que está en el mismo dominio.
  // const host = headers().get('host') || 'localhost:3000'; // No se puede usar headers() aquí directamente
  // const protocol = host.startsWith('localhost') ? 'http' : 'https';
  // const productPageUrl = `${protocol}://${host}/producto/${slug}`;
  // Mejor usar una URL base de las variables de entorno si está disponible, o una relativa.
  // Para Open Graph, se prefiere una URL absoluta.
  const productPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/producto/${slug}`;


  const metadata: Metadata = {
    title: title,
    description: description,
    alternates: {
      canonical: productPageUrl,
    },
    openGraph: {
      title: title,
      description: description,
      url: productPageUrl,
      siteName: siteName,
      images: product.main_image_url ? [
        {
          url: product.main_image_url, // Idealmente, una URL absoluta
          width: 800, // Especificar dimensiones si se conocen
          height: 600,
          alt: product.name || 'Imagen del producto', // Manejar undefined en product.name
        },
      ] : [],
      type: 'website', // Cambiado a 'website' para satisfacer los tipos de Next.js
      // Podríamos añadir más detalles de Open Graph para productos si es necesario
      // como 'product:price:amount', 'product:price:currency', etc.
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: product.main_image_url ? [product.main_image_url] : [],
    },
    // keywords: [product.name, product.category || '', product.vendors?.store_name || '', 'comprar', 'local'], // Ejemplo
  };

  return metadata;
}


export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const product = await getProductByIdOrSlug(slug);

  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  let isFavorite = false;
  if (userId && product && product.id) { // Verificar que product.id existe
    const favStatus = await getFavoriteStatus(product.id);
    isFavorite = favStatus.isFavorite;
  }

  // Usar NEXT_PUBLIC_BASE_URL para construir productUrl, igual que en generateMetadata
  // para evitar el problema con headers().get()
  const productUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/producto/${slug}`;

  if (!product) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <ErrorMessage message="Producto no encontrado. Es posible que el enlace sea incorrecto o el producto haya sido eliminado." />
        <Link href="/productos" className="mt-6 inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
          Volver a Productos
        </Link>
      </div>
    );
  }

  // vendorInfo ya no es necesario, los datos del vendedor están en product.vendors
  // const vendorInfo = await getVendorBySlugOrId({ id: product.vendor_id });

  const formattedPrice = product.price
    ? `$${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'Consultar precio';

  const fallbackImageUrl = '/placeholder-image.png'; // Asegúrate de tener esta imagen en /public

  // Construir JSON-LD para datos estructurados
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name || 'Producto', // Manejar undefined en product.name
    description: product.description || 'Sin descripción', // Proporcionar valor por defecto
    image: product.main_image_url || undefined, // Usar undefined si no hay imagen
    sku: product.id || undefined, // Usar ID del producto como SKU, manejar undefined
    mpn: product.id || undefined, // Usar ID del producto como MPN (Manufacturer Part Number) si no hay otro, manejar undefined
    offers: {
      '@type': 'Offer',
      price: product.price || undefined, // Usar undefined si no hay precio
      priceCurrency: product.price ? 'ARS' : undefined,
      availability: product.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: productUrl, // URL de la página del producto
      seller: product.vendors ? {
        '@type': 'Organization', // O 'Person' si es un vendedor individual sin nombre de tienda
        name: product.vendors.store_name,
        url: product.vendors.slug ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/tienda/${product.vendors.slug}` : undefined,
      } : undefined,
    },
    // brand: product.vendors ? { '@type': 'Brand', name: product.vendors.store_name } : undefined, // Opcional
    // review: [], // Si hubiera reseñas
    // aggregateRating: {}, // Si hubiera calificación agregada
  };
  // Filtrar propiedades undefined del JSON-LD para no renderizarlas
  Object.keys(productJsonLd.offers).forEach(key => {
    if (productJsonLd.offers[key as keyof typeof productJsonLd.offers] === undefined) {
      delete productJsonLd.offers[key as keyof typeof productJsonLd.offers];
    }
  });
  if (productJsonLd.offers.seller === undefined) delete productJsonLd.offers.seller;
  if (productJsonLd.image === undefined) delete productJsonLd.image;
  if (productJsonLd.sku === undefined) delete productJsonLd.sku; // Eliminar si sku es undefined
  if (productJsonLd.mpn === undefined) delete productJsonLd.mpn; // Eliminar si mpn es undefined


  return (
    <> {/* Fragmento para incluir el script JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="bg-slate-50 py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
            <div className="md:flex">
            {/* Sección de Imágenes */}
            <div className="md:w-1/2">
              <div className="relative w-full aspect-[4/3] md:aspect-square lg:aspect-[4/3] xl:aspect-[16/10]">
                <Image
                  src={product.main_image_url || fallbackImageUrl}
                  alt={product.name || 'Imagen del producto'} // Proporcionar valor por defecto
                  fill
                  priority // Cargar esta imagen con prioridad
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 ease-in-out hover:scale-105"
                />
              </div>
              {/* Galería de Imágenes Adicionales */}
              {product.gallery_image_urls && product.gallery_image_urls.length > 0 && (
                <div className="p-4 border-t border-slate-200">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {product.gallery_image_urls.slice(0, 4).map((imageUrl, index) => ( // Mostrar hasta 4 imágenes
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity">
                        <Image
                          src={imageUrl}
                          alt={`${product.name || 'Producto'} - Imagen ${index + 1}`} // Proporcionar valor por defecto
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                        {/* Podría añadirse un modal para ver la imagen completa al hacer clic */}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sección de Detalles del Producto */}
            <div className="md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 leading-tight">
                  {product.name}
                </h1>
                {userId && product && product.id && ( // Verificar que product.id existe
                  <FavoriteButton
                    productId={product.id}
                    initialFavorite={isFavorite}
                  />
                )}
              </div>

              {product.vendors && product.vendors.store_name && product.vendors.slug && (
                <p className="text-sm text-slate-500 mb-4">
                  Vendido por: {' '}
                  <Link href={`/tienda/${product.vendors.slug}`} className="text-sky-600 hover:text-sky-700 font-medium hover:underline">
                    {product.vendors.store_name}
                  </Link>
                </p>
              )}

{product.categories?.name && product.categories?.slug && (
  <Link href={`/productos?category=${product.categories.slug}`} className="inline-block bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 transition-colors">
    {product.categories.name}
  </Link>
)}

              <p className="text-3xl lg:text-4xl font-bold text-sky-700 mb-6">
                {formattedPrice}
              </p>

              <div className="prose prose-slate max-w-none mb-8 text-slate-600">
                <p>{product.description}</p>
                {/* Aquí podrías añadir más detalles estructurados si los tuvieras */}
              </div>

              {/* Sección de Variaciones */}
              {product.variations && product.variations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">Variaciones</h3>
                  {product.variations.map((variation, varIndex) => (
                    <div key={varIndex} className="mb-4 p-4 border rounded-lg bg-slate-100">
                      <h4 className="font-semibold text-slate-700 mb-2">{variation.type}:</h4>
                      <ul className="list-disc list-inside text-sm text-slate-600">
                        {variation.options.map((option, optIndex) => (
                          <li key={optIndex}>
                            {option.name}
                            {option.stock !== null && option.stock !== undefined && ` (Stock: ${option.stock})`}
                            {option.price !== null && option.price !== undefined && ` (+ $${option.price.toFixed(2)})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {(() => {
                if (product.vendors && product.vendors.whatsapp_number) {
                  const whatsappMessage = `Hola, estoy interesado en el producto "${product.name || 'este producto'}" que vi en PubliMarket. - (${productUrl})`; // Manejar undefined
                  const encodedWhatsappMessage = encodeURIComponent(whatsappMessage);
                  const whatsappLink = `https://wa.me/${product.vendors.whatsapp_number.replace(/\D/g, '')}?text=${encodedWhatsappMessage}`;
                  return (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-3.5 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                    >
                      <WhatsAppIcon />
                      Consultar por WhatsApp
                    </a>
                  );
                } else if (product.whatsapp_link) {
                  const whatsappMessage = `Hola, estoy interesado en el producto "${product.name || 'este producto'}" que vi en PubliMarket. - (${productUrl})`; // Manejar undefined
                  const encodedWhatsappMessage = encodeURIComponent(whatsappMessage);
                  let finalWhatsappLink = product.whatsapp_link;

                  if (finalWhatsappLink.includes('wa.me/') && !finalWhatsappLink.includes('?text=')) {
                    finalWhatsappLink = `${finalWhatsappLink}?text=${encodedWhatsappMessage}`;
                  } else if (!finalWhatsappLink.startsWith('https://wa.me/') && !finalWhatsappLink.includes('?text=')) {
                    const cleanedNumber = finalWhatsappLink.replace(/\D/g, '');
                    if (cleanedNumber) { // Asegurarse de que cleanedNumber no esté vacío
                        finalWhatsappLink = `https://wa.me/${cleanedNumber}?text=${encodedWhatsappMessage}`;
                    } else {
                        // Si el product.whatsapp_link original no es un número válido y no es un enlace wa.me,
                        // es difícil construir un enlace válido. Podríamos optar por no mostrar el botón
                        // o mostrar un enlace genérico sin mensaje predefinido si es un enlace wa.me ya completo.
                        // Por ahora, si no podemos construir un enlace con mensaje, usamos el original.
                        // Esto podría necesitar una lógica más robusta dependiendo de los formatos esperados para product.whatsapp_link
                    }
                  }
                  // Si ya tiene ?text= o no es un formato que podamos modificar fácilmente, usamos el original.
                  // O si después de limpiar no queda un número, usamos el original.

                  return (
                    <a
                      href={finalWhatsappLink} // Usar el finalWhatsappLink modificado o el original
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-3.5 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                    >
                      <WhatsAppIcon />
                      Consultar por WhatsApp (Directo)
                    </a>
                  );
                }
                return ( // Bloque else para el if más externo
                  <div className="mt-auto w-full text-center py-3.5 px-8 rounded-lg bg-slate-100 text-slate-500">
                    Contacto no disponible
                  </div>
                );
              })() // Fin de la IIFE
              // El operador ternario redundante y su bloque else se eliminan, ya que la IIFE maneja todos los casos.
              }
              /* Podríamos añadir un botón de "Añadir a Favoritos" aquí */
            </div>
          </div>
        </div>

        {/* Podríamos añadir una sección de "Productos Relacionados" o "Más de este Vendedor" aquí */}
      </div>
    </div>
    </>
  );
}
