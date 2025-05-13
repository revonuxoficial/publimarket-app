import { getVendorBySlugOrId, getProductsByVendorId } from '@/app/actions/public';
import { getReviewsByVendor } from '@/app/actions/reviews'; // Importar Server Action de reseñas
import ProductCard from '@/components/ProductCard';
import ReviewList from '@/components/ReviewList'; // Importar componente de lista de reseñas
import ReviewForm from '@/components/ReviewForm'; // Importar componente de formulario de reseña
import Image from 'next/image';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { getUserFavoriteProductIds } from '@/app/actions/favorites';
import { ProductForCard, Vendor } from '@/app/actions/public'; // Cambiado Product as ProductType a ProductForCard
import type { Metadata, ResolvingMetadata } from 'next';

// Íconos (ejemplos, puedes usar react-icons o SVGs)
const LocationMarkerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5 text-slate-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5 text-slate-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const WhatsAppIcon = () => ( // Reutilizar el ícono de WhatsApp
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.468.13-.616.134-.133.297-.347.446-.521.149-.172.198-.296.297-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

// Icono genérico para enlaces sociales
const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-slate-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
  </svg>
);


interface VendorPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: VendorPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const vendor = await getVendorBySlugOrId({ slug });

  if (!vendor) {
    return {
      title: 'Tienda no encontrada - PubliMarket',
      description: 'La tienda que buscás no está disponible o no existe.',
    };
  }

  const siteName = 'PubliMarket';
  const title = `${vendor.store_name} | Tienda en ${siteName}`;
  const description = vendor.description
    ? vendor.description.substring(0, 160).replace(/\s+/g, ' ').trim() + (vendor.description.length > 160 ? '...' : '')
    : `Explorá los productos de ${vendor.store_name} en ${siteName}. ${vendor.city || ''}.`;

  const storePageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/tienda/${slug}`;

  const metadata: Metadata = {
    title: title,
    description: description,
    alternates: {
      canonical: storePageUrl,
    },
    openGraph: {
      title: title,
      description: description,
      url: storePageUrl,
      siteName: siteName,
      images: vendor.logo_url ? [
        {
          url: vendor.logo_url,
          width: 300, // Asumir un tamaño, idealmente se conocería
          height: 300,
          alt: `Logo de ${vendor.store_name}`,
        },
      ] : [],
      type: 'website', // Cambiado a 'website' para satisfacer los tipos de Next.js
    },
    twitter: {
      card: 'summary', // o summary_large_image si el logo es grande
      title: title,
      description: description,
      images: vendor.logo_url ? [vendor.logo_url] : [],
    },
  };

  return metadata;
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { slug } = params;
  const vendor = await getVendorBySlugOrId({ slug });

  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  let favoriteProductIds: string[] = [];
  if (userId) {
    const favsResult = await getUserFavoriteProductIds();
    if (favsResult.productIds) {
      favoriteProductIds = favsResult.productIds;
    }
  }

  if (!vendor) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <ErrorMessage message="Vendedor no encontrado. Es posible que el enlace sea incorrecto o la tienda ya no exista." />
        <Link href="/" className="mt-6 inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const vendorProducts = await getProductsByVendorId(vendor.id);
  // Obtener las reseñas del vendedor
  const { data: reviews, error: reviewsError } = await getReviewsByVendor(vendor.id);

  if (reviewsError) {
    console.error('Error fetching vendor reviews:', reviewsError);
    // Decidir cómo manejar el error de carga de reseñas. Podríamos mostrar un mensaje en la sección de reseñas.
  }

  const fallbackLogoUrl = '/placeholder-logo.png'; // Asegúrate de tener esta imagen en /public

  const storePageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/tienda/${slug}`;

  // Construir JSON-LD para datos estructurados del Vendedor
  const vendorJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness', // O 'Organization' si es más general
    name: vendor.store_name,
    description: vendor.description || undefined,
    image: vendor.logo_url || undefined,
    url: storePageUrl,
    telephone: vendor.whatsapp_number ? `+${vendor.whatsapp_number.replace(/\D/g, '')}` : undefined,
    address: vendor.city ? { // Si solo tenemos ciudad, es limitado. Idealmente, dirección completa.
      '@type': 'PostalAddress',
      addressLocality: vendor.city,
      // addressRegion: "AR-B", // Ejemplo si fuera Buenos Aires Provincia
      // postalCode: "C1000",
      addressCountry: 'AR' // Asumiendo Argentina
    } : undefined,
    // openingHoursSpecification: [], // Se podría mapear vendor.opening_hours a este formato
    // sameAs: [], // Mapear vendor.social_links
  };
  // Filtrar propiedades undefined
  Object.keys(vendorJsonLd).forEach(key => {
    if (vendorJsonLd[key as keyof typeof vendorJsonLd] === undefined) {
      delete vendorJsonLd[key as keyof typeof vendorJsonLd];
    }
  });
   if (vendorJsonLd.address === undefined) delete vendorJsonLd.address;


  return (
    <> {/* Fragmento para incluir el script JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vendorJsonLd) }}
      />
      <div className="bg-slate-100 min-h-screen">
        {/* Cabecera del Perfil del Vendedor */}
        <header className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white pt-12 pb-20 md:pb-28 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex items-center gap-8">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto md:mx-0 mb-6 md:mb-0 flex-shrink-0">
              <Image
                src={vendor.logo_url || fallbackLogoUrl}
                alt={`Logo de ${vendor.store_name}`}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{vendor.store_name}</h1>
              {vendor.description && (
                <p className="text-sky-100 text-lg max-w-2xl mx-auto md:mx-0">{vendor.description}</p>
              )}
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-sky-200">
                {vendor.city && (
                  <span className="flex items-center">
                    <LocationMarkerIcon /> {vendor.city}
                  </span>
                )}
                {vendor.location && (
                  <span className="flex items-center" title="Ubicación general">
                     <LocationMarkerIcon /> {vendor.location}
                   </span>
                )}
              </div>
              {/* Mostrar Horarios */}
              {vendor.opening_hours && typeof vendor.opening_hours === 'object' && Object.keys(vendor.opening_hours).length > 0 && (
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-sky-100 mb-1 flex items-center"><ClockIcon /> Horarios:</h3>
                  <ul className="text-xs text-sky-200 space-y-0.5">
                    {Object.entries(vendor.opening_hours).map(([day, hours]) => (
                      <li key={day}><span className="font-medium">{day.charAt(0).toUpperCase() + day.slice(1)}:</span> {String(hours)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Mostrar Redes Sociales */}
              {vendor.social_links && typeof vendor.social_links === 'object' && Object.keys(vendor.social_links).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-sky-100 mb-1">Seguinos:</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {Object.entries(vendor.social_links).map(([platform, url]) => {
                      if (url && typeof url === 'string') {
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-200 hover:text-white hover:underline text-sm flex items-center"
                            title={`${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                          >
                            <LinkIcon /> {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </a>
                        );
                      }
                      return null; // Devolver null si la condición no se cumple
                    })}
                  </div>
                </div>
              )}
              {/* Botón de WhatsApp General para la Tienda */}
              {vendor.whatsapp_number && (
                <div className="mt-6">
                  <a
                    href={`https://wa.me/${vendor.whatsapp_number.replace(/\D/g, '')}?text=Hola, estoy interesado en los productos de ${encodeURIComponent(vendor.store_name)} que vi en PubliMarket.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                  >
                    <WhatsAppIcon /> Contactar a la Tienda
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        </header>

        {/* Contenido Principal: Productos del Vendedor */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 -mt-12 md:-mt-16">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 text-center md:text-left">
              Productos de {vendor.store_name}
            </h2>

            {vendorProducts && vendorProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
                {vendorProducts.map((product: ProductForCard) => { // Usar ProductForCard
                  const isFavorite = favoriteProductIds?.includes(product.id) ?? false;
                  // product es de tipo ProductForCard, que es lo que ProductCard espera.
                  // El tipo ProductType de actions/public ya tiene product.vendors
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      userId={userId}
                      isFavorite={isFavorite}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-slate-400 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h2.64m-13.5 0H9.75M3.75 21V9.75A2.25 2.25 0 0 1 6 7.5h12A2.25 2.25 0 0 1 20.25 9.75V21M3.75 21v-6.75A2.25 2.25 0 0 1 6 12h12a2.25 2.25 0 0 1 2.25 2.25V21" />
                </svg>
                <p className="text-xl text-slate-600">Este vendedor aún no tiene productos publicados.</p>
                <p className="text-slate-500 mt-2">¡Volvé pronto para ver sus novedades!</p>
              </div>
            )}
          </div>
          {/* Aquí podrían ir anuncios del vendedor si se implementa esa funcionalidad */}
        </main>

        {/* Sección de Reseñas */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 text-center md:text-left">
              Reseñas de {vendor.store_name}
            </h2>

            {reviewsError ? (
              <ErrorMessage message={`Error al cargar las reseñas: ${reviewsError}`} />
            ) : (
              <ReviewList reviews={reviews || []} />
            )}

            {/* Formulario para dejar reseña (mostrar solo si el usuario está autenticado) */}
            {userId && vendor.id && ( // Asegurarse de que userId y vendor.id existen
              <div className="mt-12">
                <ReviewForm vendorId={vendor.id} /> {/* Pasar el ID del vendedor */}
                {/* TODO: Implementar onReviewSubmitted para actualizar la lista de reseñas dinámicamente */}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
