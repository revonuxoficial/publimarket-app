'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { updateProduct } from '@/app/actions/products'; // Importar la Server Action para actualizar producto
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Cliente de Supabase del lado del cliente
import { useRouter } from 'next/navigation'; // Para redirigir después de actualizar el producto
import { Product } from '@/app/actions/public'; // Importar el tipo Product

// Definir un tipo para los datos del formulario de edición de producto
interface EditProductFormData {
  id: string; // Necesario para identificar el producto a actualizar
  name: string;
  slug: string;
  price: number | null;
  description: string;
  mainImage: File | null; // Usaremos File para la subida de nueva imagen principal
  mainImageUrl: string | null; // Para mostrar la imagen actual
  galleryImages: FileList | null; // Usaremos FileList para la subida de nuevas imágenes de galería
  galleryImageUrls: string[] | null; // Para mostrar las imágenes de galería actuales
  whatsappLink: string;
  category: string;
  imagesToDelete: string[]; // URLs de imágenes de galería a eliminar
}

interface EditProductFormProps {
  initialData: Product; // Datos iniciales del producto a editar
}

export default function EditProductForm({ initialData }: EditProductFormProps) {
  const [formData, setFormData] = useState<EditProductFormData>({
    id: initialData.id,
    name: initialData.name,
    slug: initialData.slug,
    price: initialData.price,
    description: initialData.description,
    mainImage: null, // No hay nueva imagen principal por defecto
    mainImageUrl: initialData.main_image_url, // URL de la imagen principal existente
    galleryImages: null, // No hay nuevas imágenes de galería por defecto
    galleryImageUrls: initialData.gallery_image_urls, // URLs de las imágenes de galería existentes
    whatsappLink: initialData.whatsapp_link,
    category: initialData.category || '', // Usar '' si la categoría es null
    imagesToDelete: [], // Inicialmente no hay imágenes para eliminar
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClientComponentClient(); // Crear instancia del cliente del lado del cliente
  const router = useRouter();

  // Sincronizar initialData si cambia (aunque en este caso no debería cambiar en la misma página)
  useEffect(() => {
    setFormData({
      id: initialData.id,
      name: initialData.name,
      slug: initialData.slug,
      price: initialData.price,
      description: initialData.description,
      mainImage: null,
      mainImageUrl: initialData.main_image_url,
      galleryImages: null,
      galleryImageUrls: initialData.gallery_image_urls,
      whatsappLink: initialData.whatsapp_link,
      category: initialData.category || '',
      imagesToDelete: [],
    });
  }, [initialData]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        // Opcional: Eliminar la imagen principal anterior si existe y es diferente
        if (formData.mainImageUrl && formData.mainImageUrl !== initialData.main_image_url) {
             // Nota: Esto podría ser complicado si la URL anterior es la misma que la nueva por alguna razón.
             // Una estrategia más segura podría ser eliminar la anterior solo si se sube una nueva.
             // Por ahora, solo subimos la nueva y actualizamos la URL. La limpieza de la anterior
             // podría manejarse con una función de limpieza de storage periódica o lógica más compleja.
        }
        updatedMainImageUrl = await uploadImage(formData.mainImage, 'product-images', `${Date.now()}-${formData.mainImage.name}`);
      }

      // 3. Subir nuevas imágenes de galería si se seleccionaron
      if (formData.galleryImages) {
        for (let i = 0; i < formData.galleryImages.length; i++) {
          const file = formData.galleryImages[i];
          const url = await uploadImage(file, 'product-images', `${Date.now()}-${file.name}`);
          updatedGalleryImageUrls.push(url);
        }
      }

      // Preparar datos para la Server Action de actualización
      const productDataToUpdate = {
        name: formData.name,
        slug: formData.slug,
        price: formData.price,
        description: formData.description,
        main_image_url: updatedMainImageUrl,
        gallery_image_urls: updatedGalleryImageUrls.length > 0 ? updatedGalleryImageUrls : null,
        whatsapp_link: formData.whatsappLink,
        category: formData.category || null,
      };

      // Llamar a la Server Action para actualizar el producto
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
        <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
          Categoría (Opcional):
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
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
