import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductForCard } from '@/app/actions/public'; // Importar el tipo ProductForCard
import FavoriteButton from './FavoriteButton'; 

// Interfaz para definir la forma de los datos del producto
interface ProductCardProps {
  product: ProductForCard; // Usar el tipo ProductForCard
  userId?: string; 
  isFavorite?: boolean; 
  // vendorName y vendorSlug ya no son necesarios aquí si product.vendors tiene la info
}

const ProductCard: React.FC<ProductCardProps> = ({ product, userId, isFavorite }) => {
  const fallbackImageUrl = '/placeholder-image.png'; // Asegúrate de tener esta imagen en /public

  const formattedPrice = product.price
    ? `$${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'Consultar precio';

  // Construcción del enlace al producto.
  const productDetailLink = `/producto/${product.slug}`;

  // El nombre y slug del vendedor ahora vienen de product.vendors si está disponible
  const vendorName = product.vendors?.store_name;
  const vendorSlug = product.vendors?.slug;
  const vendorLink = vendorSlug ? `/tienda/${vendorSlug}` : '#';


  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02] flex flex-col group relative">
      {/* Botón de Favorito en la esquina superior derecha */}
      {userId && ( // Solo mostrar si hay un userId (usuario logueado)
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton
            productId={product.id}
            userId={userId}
            initialIsFavorite={isFavorite}
            size="sm"
          />
        </div>
      )}
      <Link href={productDetailLink} className="block overflow-hidden">
        <div className="relative w-full aspect-[4/3]"> {/* Ratio de aspecto para la imagen */}
          <Image
            src={product.main_image_url || fallbackImageUrl}
            alt={product.name || 'Imagen del producto'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        {product.categories?.name && ( // Mostrar el nombre de la categoría si existe
          <Link href={`/productos?category=${product.categories.slug}`} className="text-xs text-sky-600 hover:text-sky-700 font-semibold uppercase mb-1 transition-colors">
            {product.categories.name}
          </Link>
        )}
        <h3 className="text-lg font-semibold text-slate-800 mb-1.5 leading-tight">
          <Link href={productDetailLink} className="hover:text-sky-600 transition-colors">
            {product.name || 'Nombre del Producto'}
          </Link>
        </h3>

        {vendorName && vendorSlug && (
          <p className="text-sm text-slate-500 mb-3">
            Vendido por: {' '}
            <Link href={vendorLink} className="text-sky-500 hover:text-sky-700 hover:underline">
              {vendorName}
            </Link>
          </p>
        )}

        <div className="mt-auto"> {/* Empuja el precio y botón al final */}
          <p className="text-2xl font-bold text-sky-700 mb-4">
            {formattedPrice}
          </p>
          <Link 
            href={productDetailLink} 
            className="w-full block text-center bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
