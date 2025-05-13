'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { updateProduct } from '@/app/actions/products';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Product, getUniqueCategories } from '@/app/actions/public'; // Importar Product y getUniqueCategories
import type { ProductVariation, ProductVariationOption } from '@/app/actions/public'; // Importar tipos de variaciones

// Definir un tipo para los datos del formulario de edición de producto
interface EditProductFormData {
  id?: string; // Hacer opcional
  name?: string; // Hacer opcional
  slug?: string; // Hacer opcional
  price?: number | null; // Hacer opcional
  description?: string; // Hacer opcional
  mainImage: File | null;
  mainImageUrl: string | null;
  galleryImages: FileList | null;
  galleryImageUrls: string[] | null;
  whatsappLink?: string; // Hacer opcional
  category_id?: string | null; // Hacer opcional
  is_active?: boolean; // Hacer opcional
  imagesToDelete: string[];
  // Añadir variaciones al tipo de datos del formulario
  variations: ProductVariation[];
}

interface EditProductFormProps {
  initialData: Product;
}

export default function EditProductForm({ initialData }: EditProductFormProps) {
  const [formData, setFormData] = useState<EditProductFormData>({
    id: initialData.id,
    name: initialData.name,
    slug: initialData.slug,
    price: initialData.price,
    description: initialData.description,
    mainImage: null,
    // Asegurar que undefined se convierta a null para mainImageUrl y galleryImageUrls
    mainImageUrl: initialData.main_image_url === undefined ? null : initialData.main_image_url,
    galleryImages: null,
    galleryImageUrls: initialData.gallery_image_urls === undefined ? null : initialData.gallery_image_urls,
    whatsappLink: initialData.whatsapp_link,
    category_id: initialData.category_id || '', // Usar category_id
    is_active: initialData.is_active === undefined ? true : initialData.is_active,
    imagesToDelete: [],
    // Inicializar variaciones desde initialData
    variations: initialData.variations || [],
  });
  const [categories, setCategories] = useState<{ id: string; name: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      const fetchedCategories = await getUniqueCategories();
      setCategories(fetchedCategories);
    }
    fetchCategories();
  }, []);

  // Sincronizar initialData si cambia
  useEffect(() => {
    setFormData({
      id: initialData.id,
      name: initialData.name,
      slug: initialData.slug,
      price: initialData.price,
      description: initialData.description,
      mainImage: null,
      // Asegurar que undefined se convierta a null para mainImageUrl y galleryImageUrls
      mainImageUrl: initialData.main_image_url === undefined ? null : initialData.main_image_url,
      galleryImages: null,
      galleryImageUrls: initialData.gallery_image_urls === undefined ? null : initialData.gallery_image_urls,
      whatsappLink: initialData.whatsapp_link,
      category_id: initialData.category_id || '', // Usar category_id
      is_active: initialData.is_active === undefined ? true : initialData.is_active,
      imagesToDelete: [],
      // Sincronizar variaciones
      variations: initialData.variations || [],
    });
  }, [initialData]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === 'mainImage' && files && files.length > 0) {
      setFormData({ ...formData, mainImage: files[0], mainImageUrl: null }); // Limpiar URL existente si se sube una nueva
    } else if (name === 'galleryImages' && files) {
      // Al añadir nuevas imágenes de galería, las agregamos a la lista existente
      const newFiles = Array.from(files);
      // No limpiamos las URLs existentes aquí, solo añadimos los nuevos archivos
      setFormData({ ...formData, galleryImages: files });
    }
  };

  const handleRemoveGalleryImage = (urlToRemove: string) => {
    setFormData({
      ...formData,
      galleryImageUrls: formData.galleryImageUrls?.filter(url => url !== urlToRemove) || null,
      imagesToDelete: [...formData.imagesToDelete, urlToRemove],
    });
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

  const deleteImages = async (urls: string[]) => {
    if (!urls || urls.length === 0) return;

    // Extraer los paths de las URLs
    const pathsToDelete = urls.map(url => {
      // Asumiendo que la URL pública tiene el formato .../storage/v1/object/public/bucket-name/path/to/file
      const urlParts = url.split('/public/product-images/'); // Ajustar 'product-images' si el bucket es diferente
      return urlParts.length > 1 ? urlParts[1] : null;
    }).filter(path => path !== null) as string[];

    if (pathsToDelete.length === 0) return;

    const { error } = await supabase.storage.from('product-images').remove(pathsToDelete);

    if (error) {
      console.error('Error deleting images:', error);
      // No lanzamos un error fatal aquí, solo lo registramos
    }
  };

  // Funciones para manejar variaciones (copia de NewProductForm.tsx)
  const handleAddVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, { type: '', options: [{ name: '', stock: null, price: null }] }]
    }));
  };

  const handleRemoveVariation = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_: any, index: number) => index !== indexToRemove) // Añadir tipos explícitos
    }));
  };

  const handleVariationTypeChange = (index: number, type: string) => {
    setFormData(prev => {
      const updatedVariations = [...prev.variations];
      updatedVariations[index].type = type;
      return { ...prev, variations: updatedVariations };
    });
  };

  const handleAddVariationOption = (variationIndex: number) => {
    setFormData(prev => {
      const updatedVariations = [...prev.variations];
      updatedVariations[variationIndex].options.push({ name: '', stock: null, price: null });
      return { ...prev, variations: updatedVariations };
    });
  };

  const handleRemoveVariationOption = (variationIndex: number, optionIndexToRemove: number) => {
    setFormData(prev => {
      const updatedVariations = [...prev.variations];
      updatedVariations[variationIndex].options = updatedVariations[variationIndex].options.filter((_: any, index: number) => index !== optionIndexToRemove); // Añadir tipos explícitos
      // Si se eliminan todas las opciones de una variación, eliminar también la variación
      if (updatedVariations[variationIndex].options.length === 0) {
        updatedVariations.splice(variationIndex, 1);
      }
      return { ...prev, variations: updatedVariations };
    });
  };

  const handleVariationOptionChange = (variationIndex: number, optionIndex: number, field: keyof ProductVariationOption, value: string | number | null) => {
    setFormData(prev => {
      const updatedVariations = [...prev.variations];
      // Asegurarse de que el valor numérico sea null si está vacío
      const processedValue = (field === 'stock' || field === 'price') && value === null ? null : value;
      (updatedVariations[variationIndex].options[optionIndex][field] as any) = processedValue; // Usar 'any' temporalmente para la asignación
      return { ...prev, variations: updatedVariations };
    });
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validaciones básicas
    if (!formData.name || !formData.slug || !formData.description || !formData.whatsappLink) {
      setError('Por favor, completa todos los campos obligatorios (Nombre, Slug, Descripción, Enlace WhatsApp).');
      setIsLoading(false);
      return;
    }

    // Validar que haya al menos una imagen principal (existente o nueva)
    if (!formData.mainImageUrl && !formData.mainImage) {
      setError('Por favor, sube una imagen principal.');
      setIsLoading(false);
      return;
    }


    try {
      let updatedMainImageUrl = formData.mainImageUrl;
      const updatedGalleryImageUrls: string[] = formData.galleryImageUrls || [];

      // 1. Eliminar imágenes de galería marcadas para eliminación
      await deleteImages(formData.imagesToDelete);

      // 2. Subir nueva imagen principal si se seleccionó una
      if (formData.mainImage) {
        const newMainImageUrl = await uploadImage(formData.mainImage, 'product-images', `${Date.now()}-${formData.mainImage.name}`);
        // Si la subida de la nueva imagen principal fue exitosa y había una imagen principal anterior, eliminarla.
        if (newMainImageUrl && initialData.main_image_url) {
          // Solo eliminar si la URL es diferente para evitar problemas si se vuelve a subir la misma imagen conceptualmente
          // aunque el timestamp en el nombre debería hacerlo diferente.
          // La principal preocupación es no eliminar si la subida de la nueva falló (ya cubierto por el await anterior).
          if (initialData.main_image_url !== newMainImageUrl) { // Comprobación extra, aunque el nombre de archivo debería ser único
            await deleteImages([initialData.main_image_url]);
          }
        }
        updatedMainImageUrl = newMainImageUrl;
      } else if (formData.mainImageUrl === null && initialData.main_image_url) {
        // Si mainImageUrl se puso a null (ej. un botón "Eliminar Imagen Principal" que no existe aún, pero por si acaso)
        // y había una imagen inicial, la eliminamos.
        await deleteImages([initialData.main_image_url]);
        updatedMainImageUrl = null; // Asegurarse de que se guarda como null en la DB
      }


      // 3. Subir nuevas imágenes de galería si se seleccionaron
      if (formData.galleryImages) {
        for (let i = 0; i < formData.galleryImages.length; i++) {
          const file = formData.galleryImages[i];
          const url = await uploadImage(file, 'product-images', `${Date.now()}-${file.name}`);
          updatedGalleryImageUrls.push(url);
        }
      }

      // Preparar datos de variaciones para la Server Action
      // Asegurarse de que las variaciones y opciones tengan al menos un nombre
      const validVariations = formData.variations
        .filter(v => v.type.trim() !== '')
        .map(v => ({
          type: v.type.trim(),
          options: v.options.filter((o: ProductVariationOption) => o.name.trim() !== '').map((o: ProductVariationOption) => ({ // Añadir tipos explícitos
            name: o.name.trim(),
            stock: o.stock,
            price: o.price,
          })),
        }))
        .filter(v => v.options.length > 0); // Solo incluir variaciones con opciones válidas


      // Preparar datos para la Server Action de actualización
      const productDataToUpdate = {
        name: formData.name,
        slug: formData.slug,
        price: formData.price,
        description: formData.description,
        main_image_url: updatedMainImageUrl,
        gallery_image_urls: updatedGalleryImageUrls.length > 0 ? updatedGalleryImageUrls : null,
        whatsapp_link: formData.whatsappLink,
        category_id: formData.category_id || null, // Enviar category_id
        is_active: formData.is_active,
        // Incluir variaciones en los datos a actualizar
        variations: validVariations.length > 0 ? validVariations : null,
      };

      // Llamar a la Server Action para actualizar el producto
      // Asegurarse de que formData.id no sea undefined antes de pasarlo
      if (!formData.id) {
        setError('Error interno: ID de producto no disponible para actualizar.');
        setIsLoading(false);
        return;
      }
      const result = await updateProduct(formData.id, productDataToUpdate);

      if (!result.success) {
        setError(result.error || 'Error desconocido al actualizar el producto.');
      } else {
        setSuccessMessage('Producto actualizado exitosamente!');
        // Opcional: Redirigir a la página de gestión de productos después de un tiempo
        setTimeout(() => {
          router.push('/vendedor/productos');
        }, 2000); // Redirigir después de 2 segundos
      }

    } catch (err: any) {
      console.error('Error en el proceso de actualizar producto:', err);
      setError(err.message || 'Ocurrió un error al actualizar el producto.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">¡Éxito!</strong>
          <span className="block sm:inline ml-2">{successMessage}</span>
        </div>
      )}
      {isLoading && <div className="mb-4"><LoadingSpinner /></div>}

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
          Nombre del Producto:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ''} // Usar || '' para manejar undefined
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
          value={formData.slug || ''} // Usar || '' para manejar undefined
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
          value={formData.price || ''} // Usar || '' para evitar 0 en input vacío y manejar undefined
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
          value={formData.description || ''} // Usar || '' para manejar undefined
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          required
        ></textarea>
      </div>

      {/* Campo para Imagen Principal */}
      <div className="mb-4">
        <label htmlFor="mainImage" className="block text-gray-700 text-sm font-bold mb-2">
          Imagen Principal:
        </label>
        {formData.mainImageUrl && !formData.mainImage && (
          <div className="mb-2">
            <span className="block text-sm text-gray-600 mb-1">Imagen actual:</span>
            <img src={formData.mainImageUrl} alt="Imagen principal actual" className="w-32 h-32 object-cover rounded" />
          </div>
        )}
        <input
          type="file"
          id="mainImage"
          name="mainImage"
          onChange={handleFileChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          accept="image/*"
        />
        {/* Mostrar mensaje si se requiere imagen principal y no hay ni URL ni archivo */}
        {!formData.mainImageUrl && !formData.mainImage && (
          <p className="text-red-500 text-xs italic mt-1">Se requiere una imagen principal.</p>
        )}
      </div>

      {/* Campo para Galería de Imágenes */}
      <div className="mb-4">
        <label htmlFor="galleryImages" className="block text-gray-700 text-sm font-bold mb-2">
          Galería de Imágenes (Opcional):
        </label>
        {formData.galleryImageUrls && formData.galleryImageUrls.length > 0 && (
          <div className="mb-2">
            <span className="block text-sm text-gray-600 mb-1">Imágenes actuales:</span>
            <div className="flex flex-wrap gap-2">
              {formData.galleryImageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt={`Imagen de galería ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(url)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs leading-none"
                    aria-label="Eliminar imagen"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <input
          type="file"
          id="galleryImages"
          name="galleryImages"
          onChange={handleFileChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          accept="image/*"
          multiple
        />
      </div>

      {/* Sección para Variaciones (copia de NewProductForm.tsx) */}
      <div className="mb-6 border-t pt-4 mt-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Variaciones (Opcional)</h3>
        {formData.variations.map((variation, varIndex) => (
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
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm mt-2 ml-4"
            >
              Añadir Opción
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddVariation}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Añadir Variación
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
          value={formData.whatsappLink || ''} // Usar || '' para manejar undefined
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
          value={formData.category_id || ''} // Usar || '' para manejar null/undefined
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="is_active" className="flex items-center text-gray-700 text-sm font-bold">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active ?? true} // Usar ?? true para manejar undefined
            onChange={handleInputChange}
            className="mr-2 leading-tight"
          />
          <span className="text-sm">Producto Activo (visible para compradores)</span>
        </label>
      </div>


      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}
