import React from 'react';
import Image from 'next/image'; // Usar next/image para optimización

// Interfaz para definir la forma de los datos del producto
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number | null;
    main_image_url: string | null; // Puede ser null si no hay imagen
    vendor_id: string;
    // Podríamos necesitar el nombre del vendedor aquí,
    // pero para mantener el componente simple, asumimos que se pasa o se obtiene por separado.
    // Para el MVP, mostraremos un placeholder o asumiremos que el nombre del vendedor se pasa.
    // Añadimos vendorName para simplificar la visualización en la tarjeta.
    vendorName?: string;
    slug: string; // Para el enlace al detalle del producto
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // URL de fallback para la imagen si no hay main_image_url
  const fallbackImageUrl = '/placeholder-image.png'; // Asegúrate de tener una imagen placeholder en public/

  // Formatear precio si existe
  const formattedPrice = product.price
    ? `$${product.price.toFixed(2).replace('.', ',')}` // Formato argentino
    : 'Consultar'; // Texto si el precio es null

  // Enlace al detalle del producto (asumiendo una estructura de URL /producto/[slug])
  // Si la URL incluye el slug del vendedor, necesitaríamos ambos aquí.
  // Basado en el brief, la URL es /tienda/[vendorSlug]/producto/[productSlug].
  // Para el MVP, asumiremos una URL simple /producto/[slug] o /tienda/[vendorSlug]/producto/[productSlug]
  // y que el slug del producto es suficiente para el enlace en esta tarjeta.
  // Si necesitamos el vendorSlug, la prop product debería incluirlo o se debería obtener aquí.
  // Para simplificar, usaremos solo el product.slug para el enlace en el MVP.
  const productLink = `/producto/${product.slug}`; // Ajustar según la estructura de rutas final

  return (
    // Contenedor principal de la tarjeta con estilos responsive y de sombra
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
      {/* Enlace a la página del producto */}
      <a href={productLink} className="block">
        {/* Contenedor de la imagen con relación de aspecto */}
        <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
          {/* Imagen del producto */}
          <Image
            src={product.main_image_url || fallbackImageUrl}
            alt={product.name || 'Imagen del producto'} // Alt text descriptivo
            fill // Rellenar el contenedor
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Optimización responsive
            style={{ objectFit: 'cover' }} // Cubrir el área sin distorsionar
            className="transition-transform duration-300 ease-in-out hover:scale-105" // Efecto hover
          />
        </div>
      </a>

      {/* Contenido de texto de la tarjeta */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Nombre del producto */}
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
          {product.name || 'Nombre del Producto'} {/* Placeholder */}
        </h3>

        {/* Nombre del vendedor (placeholder si no se pasa) */}
        <p className="text-sm text-gray-600 mb-2">
          {product.vendorName ? `Por ${product.vendorName}` : 'Vendedor Desconocido'} {/* Placeholder */}
        </p>

        {/* Precio */}
        <p className="text-xl font-bold text-blue-600 mt-auto">
          {formattedPrice} {/* Precio formateado o "Consultar" */}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
