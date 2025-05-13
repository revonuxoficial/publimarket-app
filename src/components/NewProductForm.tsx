'use client';

import React, { useState, useEffect } from 'react';
import { addProduct } from '@/app/actions/products';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { getUniqueCategories } from '@/app/actions/public';


// Definir un tipo para representar una imagen seleccionada con previsualización
interface SelectedImage {
  file: File;
  previewUrl: string;
  isMain: boolean; // Para indicar si es la imagen principal
}

// Definir tipos para las variaciones del producto
interface ProductVariationOption {
  name: string; // Ej: "Rojo", "Azul", "S", "M"
  stock: number | null;
  price: number | null; // Precio opcional por variación
}

interface ProductVariation {
  type: string; // Ej: "Color", "Talla"
  options: ProductVariationOption[];
}

// Definir un tipo básico para los datos del formulario de producto
interface ProductFormData {
  name: string;
  slug: string;
  price: number | null; // Precio base del producto
  description: string;
  whatsappLink: string;
  category_id: string; // Cambiado a category_id
  condition: 'new' | 'used' | ''; // Nuevo campo para el estado (Nuevo/Usado)
  brand: string; // Nuevo campo para la marca (opcional)
  location: string; // Nuevo campo para la ubicación
  // Las variaciones se manejarán en un estado separado por ahora
}

export default function NewProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    price: null,
    description: '',
    whatsappLink: '',
    category_id: '', // Cambiado a category_id
    condition: '', // Estado inicial vacío
    brand: '', // Estado inicial vacío
    location: '', // Estado inicial vacío
  });
  // Nuevo estado para manejar todas las imágenes seleccionadas
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  // Nuevo estado para manejar las variaciones del producto
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      const fetchedCategories = await getUniqueCategories();
      setCategories(fetchedCategories);
    }
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
     // Limpiar el mensaje de estado al cambiar cualquier campo
    setStatusMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: SelectedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Crear URL de previsualización
      const previewUrl = URL.createObjectURL(file);
      newImages.push({ file, previewUrl, isMain: false });
    }

    // Si no hay imágenes seleccionadas previamente, la primera nueva imagen será la principal por defecto
    if (selectedImages.length === 0 && newImages.length > 0) {
      newImages[0].isMain = true;
    } else {
      // Si ya hay imágenes, añadir las nuevas al final
      // Asegurarse de que solo una imagen sea principal (la que ya era principal o la primera nueva si no había)
      let mainImageFound = selectedImages.some(img => img.isMain);
      if (!mainImageFound && newImages.length > 0) {
         // Si no se encontró ninguna imagen principal entre las existentes,
         // y hay nuevas imágenes, establecer la primera nueva como principal.
         // Si ya había una principal, no cambiamos nada aquí.
         if (!selectedImages.some(img => img.isMain)) {
             newImages[0].isMain = true;
         }
      }
    }


    // Combinar las imágenes existentes con las nuevas
    setSelectedImages([...selectedImages, ...newImages]);

    // Limpiar el mensaje de estado al seleccionar un archivo
    setStatusMessage(null);
  };

  // Función para eliminar una imagen seleccionada
  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages(currentImages => {
      const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
      // Si la imagen eliminada era la principal y aún quedan imágenes,
      // establecer la primera imagen restante como principal.
      if (currentImages[indexToRemove].isMain && updatedImages.length > 0) {
        updatedImages[0].isMain = true;
      }
      return updatedImages;
    });
  };

  // Función para establecer una imagen como principal
  const handleSetMainImage = (indexToSetMain: number) => {
    setSelectedImages(currentImages =>
      currentImages.map((image, index) => ({
        ...image,
        isMain: index === indexToSetMain,
      }))
    );
  };

  // Función para reordenar imágenes (mover hacia arriba o abajo)
  const handleReorderImage = (indexToMove: number, direction: 'up' | 'down') => {
    setSelectedImages(currentImages => {
      const updatedImages = [...currentImages];
      const imageToMove = updatedImages[indexToMove];
      const newIndex = direction === 'up' ? indexToMove - 1 : indexToMove + 1;

      // Asegurarse de que el nuevo índice esté dentro de los límites
      if (newIndex >= 0 && newIndex < updatedImages.length) {
        // Eliminar la imagen de su posición actual
        updatedImages.splice(indexToMove, 1);
        // Insertar la imagen en la nueva posición
        updatedImages.splice(newIndex, 0, imageToMove);
      }

      return updatedImages;
    });
  };

  // Funciones para manejar variaciones
  const handleAddVariation = () => {
    setVariations([...variations, { type: '', options: [{ name: '', stock: null, price: null }] }]);
  };

  const handleRemoveVariation = (indexToRemove: number) => {
    setVariations(variations.filter((_, index) => index !== indexToRemove));
  };

  const handleVariationTypeChange = (index: number, type: string) => {
    const updatedVariations = [...variations];
    updatedVariations[index].type = type;
    setVariations(updatedVariations);
  };

  const handleAddVariationOption = (variationIndex: number) => {
    const updatedVariations = [...variations];
    updatedVariations[variationIndex].options.push({ name: '', stock: null, price: null });
    setVariations(updatedVariations);
  };

  const handleRemoveVariationOption = (variationIndex: number, optionIndexToRemove: number) => {
    const updatedVariations = [...variations];
    updatedVariations[variationIndex].options = updatedVariations[variationIndex].options.filter((_, index) => index !== optionIndexToRemove);
    // Si se eliminan todas las opciones de una variación, eliminar también la variación
    if (updatedVariations[variationIndex].options.length === 0) {
        updatedVariations.splice(variationIndex, 1);
    }
    setVariations(updatedVariations);
  };

  const handleVariationOptionChange = (variationIndex: number, optionIndex: number, field: keyof ProductVariationOption, value: string | number | null) => {
    const updatedVariations = [...variations];
    // Asegurarse de que el valor numérico sea null si está vacío
    const processedValue = (field === 'stock' || field === 'price') && value === null ? null : value;
    (updatedVariations[variationIndex].options[optionIndex][field] as any) = processedValue; // Usar 'any' temporalmente para la asignación
    setVariations(updatedVariations);
  };


  const uploadImage = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Error al subir imagen: ${error.message}`);
    }
    // Obtener la URL pública de la imagen subida
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null); // Limpiar mensajes anteriores

    // Validaciones básicas
    if (!formData.name || !formData.slug || !formData.description || !formData.whatsappLink || selectedImages.length === 0) {
      setStatusMessage({ text: 'Por favor, completa todos los campos obligatorios (Nombre, Slug, Descripción, Enlace WhatsApp) y sube al menos una imagen.', type: 'error' });
      setIsLoading(false);
      return;
    }
    // Validar que haya al menos una imagen marcada como principal
     if (!selectedImages.some(img => img.isMain)) {
        setStatusMessage({ text: 'Por favor, selecciona una imagen principal.', type: 'error' });
        setIsLoading(false);
        return;
     }

    try {
      // Subir todas las imágenes seleccionadas
      const uploadedImageUrls: { url: string; isMain: boolean }[] = [];
      for (const selectedImage of selectedImages) {
        const url = await uploadImage(selectedImage.file, 'product-images', `${Date.now()}-${selectedImage.file.name}`);
        uploadedImageUrls.push({ url, isMain: selectedImage.isMain });
      }

      // Separar URL principal y URLs de galería
      const mainImageUrl = uploadedImageUrls.find(img => img.isMain)?.url || null;
      const galleryImageUrls = uploadedImageUrls.filter(img => !img.isMain).map(img => img.url);

      // Validar que se encontró la URL principal (debería estar garantizado por la validación previa)
      if (!mainImageUrl) {
         setStatusMessage({ text: 'Error interno: No se pudo determinar la imagen principal después de la subida.', type: 'error' });
         setIsLoading(false);
         return;
      }

      // Preparar datos de variaciones para la Server Action
      // Asegurarse de que las variaciones y opciones tengan al menos un nombre
      const validVariations = variations
        .filter(v => v.type.trim() !== '')
        .map(v => ({
          type: v.type.trim(),
          options: v.options.filter(o => o.name.trim() !== '').map(o => ({
            name: o.name.trim(),
            stock: o.stock,
            price: o.price,
          })),
        }))
        .filter(v => v.options.length > 0); // Solo incluir variaciones con opciones válidas


      // Preparar datos para la Server Action
      const productData = {
        name: formData.name,
        slug: formData.slug,
        price: formData.price,
        description: formData.description,
        main_image_url: mainImageUrl,
        gallery_image_urls: galleryImageUrls.length > 0 ? galleryImageUrls : null,
        whatsapp_link: formData.whatsappLink,
        category_id: formData.category_id || null, // Usar category_id
        condition: formData.condition, // Añadir estado
        brand: formData.brand || null, // Añadir marca (puede ser null)
        location: formData.location, // Añadir ubicación
        variations: validVariations.length > 0 ? validVariations : null, // Añadir variaciones a los datos del producto
      };

      // Llamar a la Server Action para añadir el producto
      const result = await addProduct(productData);

      if (!result.success) {
        setStatusMessage({ text: result.error || 'Error desconocido al añadir el producto.', type: 'error' });
      } else {
        setStatusMessage({ text: 'Producto añadido exitosamente!', type: 'success' });
        // Opcional: Redirigir a la página de gestión de productos después de un tiempo
        setTimeout(() => {
          router.push('/vendedor/productos');
        }, 2000); // Redirigir después de 2 segundos
      }

    } catch (err: any) {
      console.error('Error en el proceso de añadir producto:', err);
      setStatusMessage({ text: err.message || 'Ocurrió un error al añadir el producto.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      {/* Usar ErrorMessage para mostrar errores */}
      {statusMessage && statusMessage.type === 'error' && (
         <ErrorMessage message={statusMessage.text} />
      )}
      {/* Mostrar mensaje de éxito */}
      {statusMessage && statusMessage.type === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">¡Éxito!</strong>
          <span className="block sm:inline ml-2">{statusMessage.text}</span>
        </div>
      )}


      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
          Nombre del Producto:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="slug" className="block text-gray-700 text-sm font-bold mb-2">
          Slug (URL amigable):
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">
          Precio (Opcional):
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price || ''} // Usar '' para evitar 0 en input vacío
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          step="0.01"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
          Descripción:
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          required
        ></textarea>
      </div>

      {/* Nuevo campo para Estado (Nuevo/Usado) */}
      <div className="mb-4">
        <label htmlFor="condition" className="block text-gray-700 text-sm font-bold mb-2">
          Estado del Producto:
        </label>
        <select
          id="condition"
          name="condition"
          value={formData.condition}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="" disabled>Selecciona el estado</option>
          <option value="new">Nuevo</option>
          <option value="used">Usado</option>
        </select>
      </div>

      {/* Nuevo campo para Marca (Opcional) */}
      <div className="mb-4">
        <label htmlFor="brand" className="block text-gray-700 text-sm font-bold mb-2">
          Marca (Opcional):
        </label>
        <input
          type="text"
          id="brand"
          name="brand"
          value={formData.brand}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      {/* Nuevo campo para Ubicación */}
      <div className="mb-4">
        <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
          Ubicación:
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="images" className="block text-gray-700 text-sm font-bold mb-2">
          Imágenes del Producto (Arrastra y suelta para reordenar, haz clic para establecer principal):
        </label>
        <input
          type="file"
          id="images"
          name="images" // Cambiado el nombre
          onChange={handleFileChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          accept="image/*"
          multiple // Permitir selección múltiple
          required // Al menos una imagen es requerida
        />
      </div>

      {/* Área para mostrar previsualizaciones de imágenes y permitir reordenar/seleccionar principal */}
      {/* TODO: Implementar funcionalidad de arrastrar y soltar para reordenar */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
         {selectedImages.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
               No hay imágenes seleccionadas.
            </div>
         ) : (
            selectedImages.map((image, index) => (
               <div
                  key={index} // Usar index temporalmente, idealmente usar un ID único si las imágenes tuvieran uno
                  className={`relative border-2 ${image.isMain ? 'border-blue-500' : 'border-gray-300'} rounded-lg overflow-hidden group`}
                  // No necesitamos cursor-pointer en el contenedor principal si los botones son interactivos
               >
                  <img src={image.previewUrl} alt={`Preview ${index + 1}`} className="block w-full h-24 object-cover" />
                  {image.isMain && (
                     <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-br-lg z-10">Principal</div>
                  )}
                  {/* Overlay y botones al pasar el ratón/tocar */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <div className="flex mb-2"> {/* Contenedor para botones de reordenar */}
                        {index > 0 && ( // Botón para mover hacia arriba (si no es la primera imagen)
                           <button
                             type="button"
                             onClick={() => handleReorderImage(index, 'up')}
                             className="bg-gray-700 text-white rounded-full p-1 text-xs leading-none mr-1 hover:bg-gray-600"
                             aria-label="Mover imagen hacia arriba"
                           >
                             &#9650; {/* Flecha hacia arriba */}
                           </button>
                        )}
                        {index < selectedImages.length - 1 && ( // Botón para mover hacia abajo (si no es la última imagen)
                           <button
                             type="button"
                             onClick={() => handleReorderImage(index, 'down')}
                             className="bg-gray-700 text-white rounded-full p-1 text-xs leading-none hover:bg-gray-600"
                             aria-label="Mover imagen hacia abajo"
                           >
                             &#9660; {/* Flecha hacia abajo */}
                           </button>
                        )}
                     </div>
                     <div className="flex"> {/* Contenedor para botones de eliminar y principal */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="bg-red-600 text-white rounded-full p-2 text-xs leading-none mr-2 hover:bg-red-700"
                          aria-label="Eliminar imagen"
                        >
                          &times;
                        </button>
                         {!image.isMain && (
                           <button
                             type="button"
                             onClick={() => handleSetMainImage(index)}
                             className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-blue-700"
                           >
                             Principal
                           </button>
                         )}
                     </div>
                  </div>
               </div>
            ))
         )}
      </div>

      {/* Sección para Variaciones */}
      <div className="mb-6 border-t pt-4 mt-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Variaciones (Opcional)</h3>
        {variations.map((variation, varIndex) => (
          <div key={varIndex} className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <input
                type="text"
                placeholder="Tipo de Variación (Ej: Color, Talla)"
                value={variation.type}
                onChange={(e) => handleVariationTypeChange(varIndex, e.target.value)}
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-grow mr-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveVariation(varIndex)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
              >
                Eliminar Variación
              </button>
            </div>
            <h4 className="font-semibold mb-2 text-gray-700">Opciones:</h4>
            {variation.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center mb-2 pl-4">
                <input
                  type="text"
                  placeholder="Nombre Opción (Ej: Rojo, S)"
                  value={option.name}
                  onChange={(e) => handleVariationOptionChange(varIndex, optIndex, 'name', e.target.value)}
                  className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-1/3 mr-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={option.stock || ''}
                  onChange={(e) => handleVariationOptionChange(varIndex, optIndex, 'stock', parseInt(e.target.value) || null)}
                  className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-1/4 mr-2 text-sm"
                  min="0"
                />
                 <input
                  type="number"
                  placeholder="Precio (Opcional)"
                  value={option.price || ''}
                  onChange={(e) => handleVariationOptionChange(varIndex, optIndex, 'price', parseFloat(e.target.value) || null)}
                  className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-1/4 mr-2 text-sm"
                  step="0.01"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveVariationOption(varIndex, optIndex)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddVariationOption(varIndex)}
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Añadir Opción
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddVariation}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Añadir Tipo de Variación
        </button>
      </div>


      <div className="mb-4">
        <label htmlFor="whatsappLink" className="block text-gray-700 text-sm font-bold mb-2">
          Enlace de WhatsApp:
        </label>
        <input
          type="text"
          id="whatsappLink"
          name="whatsappLink"
          value={formData.whatsappLink}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Ej: https://wa.me/tunumero?text=Hola"
          required
        />
      </div>

       <div className="mb-4">
        <label htmlFor="category_id" className="block text-gray-700 text-sm font-bold mb-2">
          Categoría:
        </label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required // Hacer la categoría obligatoria
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>


      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {/* Usar LoadingSpinner dentro del botón cuando esté cargando */}
          {isLoading ? (
            <div className="flex items-center">
               <LoadingSpinner /> {/* Ajusta el tamaño si es necesario */}
               <span className="ml-2">Guardando...</span>
            </div>
          ) : (
            'Añadir Producto'
          )}
        </button>
      </div>
    </form>
  );
}
