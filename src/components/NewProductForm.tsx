'use client';

import React, { useState } from 'react';
import { addProduct } from '@/app/actions/products'; // Importar la Server Action para añadir producto
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Cliente de Supabase del lado del cliente
import { useRouter } from 'next/navigation'; // Para redirigir después de añadir el producto
import { v4 as uuidv4 } from 'uuid'; // Importar uuid para generar IDs únicos para imágenes
import LoadingSpinner from '@/components/LoadingSpinner'; // Importar el componente de carga
import ErrorMessage from '@/components/ErrorMessage'; // Importar el componente de error


// Definir un tipo básico para los datos del formulario de producto
interface ProductFormData {
  name: string;
  slug: string;
  price: number | null;
  description: string;
  mainImage: File | null; // Usaremos File para la subida
  galleryImages: FileList | null; // Usaremos FileList para la galería
  whatsappLink: string;
  category: string;
}

export default function NewProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    price: null,
    description: '',
    mainImage: null,
    galleryImages: null,
    whatsappLink: '',
    category: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  // Usaremos un estado para mensajes de estado (éxito o error)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClientComponentClient(); // Crear instancia del cliente del lado del cliente
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
     // Limpiar el mensaje de estado al cambiar cualquier campo
    setStatusMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === 'mainImage' && files && files.length > 0) {
      setFormData({ ...formData, mainImage: files[0] });
    } else if (name === 'galleryImages' && files) {
      setFormData({ ...formData, galleryImages: files });
    }
     // Limpiar el mensaje de estado al seleccionar un archivo
    setStatusMessage(null);
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
    if (!formData.name || !formData.slug || !formData.description || !formData.whatsappLink || !formData.mainImage) {
      setStatusMessage({ text: 'Por favor, completa todos los campos obligatorios (Nombre, Slug, Descripción, Enlace WhatsApp, Imagen Principal).', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      // Subir imagen principal
      const mainImageUrl = await uploadImage(formData.mainImage, 'product-images', `${Date.now()}-${formData.mainImage.name}`);

      // Subir imágenes de galería (si existen)
      const galleryImageUrls: string[] = [];
      if (formData.galleryImages) {
        for (let i = 0; i < formData.galleryImages.length; i++) {
          const file = formData.galleryImages[i];
          const url = await uploadImage(file, 'product-images', `${Date.now()}-${file.name}`);
          galleryImageUrls.push(url);
        }
      }

      // Preparar datos para la Server Action
      const productData = {
        name: formData.name,
        slug: formData.slug,
        price: formData.price,
        description: formData.description,
        main_image_url: mainImageUrl,
        gallery_image_urls: galleryImageUrls.length > 0 ? galleryImageUrls : null,
        whatsapp_link: formData.whatsappLink,
        category: formData.category || null, // Usar null si la categoría está vacía
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

      <div className="mb-4">
        <label htmlFor="mainImage" className="block text-gray-700 text-sm font-bold mb-2">
          Imagen Principal:
        </label>
        <input
          type="file"
          id="mainImage"
          name="mainImage"
          onChange={handleFileChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          accept="image/*"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="galleryImages" className="block text-gray-700 text-sm font-bold mb-2">
          Galería de Imágenes (Opcional):
        </label>
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
