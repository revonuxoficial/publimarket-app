'use client';

import React, { useState, useEffect } from 'react';
import { Vendor } from '@/app/actions/public'; // Importar el tipo Vendor
import { updateVendorProfile } from '@/app/actions/vendorProfile'; // Importar la Server Action de actualización
import LoadingSpinner from '@/components/LoadingSpinner'; // Importar el componente de carga
import ErrorMessage from '@/components/ErrorMessage'; // Importar el componente de error


interface VendorProfileFormProps {
  initialData: Vendor | null; // Datos iniciales del vendedor
}

export default function VendorProfileForm({ initialData }: VendorProfileFormProps) {
  const [formData, setFormData] = useState({
    store_name: '',
    slug: '', // Asumiendo que el slug es editable
    description: '',
    whatsapp_number: '',
    social_links: '', // JSON stringificado o string simple por ahora
    opening_hours: '', // JSON stringificado o string simple por ahora
    location: '',
    currentLogoUrl: '', // Para manejar la URL del logo actual
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // Usaremos ErrorMessage para mostrar tanto errores como mensajes de éxito
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Estado para manejar errores de validación

  // Cargar datos iniciales cuando se reciben
  useEffect(() => {
    if (initialData) {
      setFormData({
        store_name: initialData.store_name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        whatsapp_number: initialData.whatsapp_number || '',
        social_links: initialData.social_links ? JSON.stringify(initialData.social_links) : '', // Convertir JSONB a string
        opening_hours: initialData.opening_hours ? JSON.stringify(initialData.opening_hours) : '', // Convertir JSONB a string
        location: initialData.location || '',
        currentLogoUrl: initialData.logo_url || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar el error de validación para este campo al cambiar
    setErrors({ ...errors, [name]: '' });
     // Limpiar el mensaje de estado al cambiar cualquier campo
    setStatusMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    } else {
      setLogoFile(null);
    }
     // Limpiar el mensaje de estado al seleccionar un archivo
    setStatusMessage(null);
  };

  // Validación básica del formulario
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.store_name) {
      newErrors.store_name = 'El nombre de la tienda es obligatorio.';
    }
    if (!formData.slug) {
      newErrors.slug = 'El slug es obligatorio.';
    }
    if (!formData.whatsapp_number) {
      newErrors.whatsapp_number = 'El número de WhatsApp es obligatorio.';
    }
    // Validación básica de formato JSON para social_links y opening_hours
    if (formData.social_links) {
      try {
        JSON.parse(formData.social_links);
      } catch (e) {
        newErrors.social_links = 'Formato JSON inválido para enlaces sociales.';
      }
    }
      if (formData.opening_hours) {
      try {
        JSON.parse(formData.opening_hours);
      } catch (e) {
        newErrors.opening_hours = 'Formato JSON inválido para horarios de atención.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatusMessage({ text: 'Por favor, corrige los errores en el formulario.', type: 'error' });
      return;
    }

    setLoading(true);
    setStatusMessage(null); // Limpiar mensajes anteriores

    const data = new FormData();
    data.append('store_name', formData.store_name);
    data.append('slug', formData.slug);
    data.append('description', formData.description);
    data.append('whatsapp_number', formData.whatsapp_number);
    data.append('social_links', formData.social_links);
    data.append('opening_hours', formData.opening_hours);
    data.append('location', formData.location);
    data.append('currentLogoUrl', formData.currentLogoUrl); // Enviar URL actual para lógica de eliminación

    if (logoFile) {
      data.append('logo', logoFile);
    }


    const result = await updateVendorProfile(data);

    if (result.success) {
      setStatusMessage({ text: result.message || 'Perfil actualizado con éxito.', type: 'success' });
      // Opcional: actualizar el estado local con la nueva URL del logo si se subió uno nuevo
      // Esto requeriría que la Server Action devuelva la nueva URL
      // Por ahora, simplemente mostramos el mensaje de éxito.
    } else {
      setStatusMessage({ text: result.message || 'Error al actualizar el perfil.', type: 'error' });
    }

    setLoading(false);
  };

  // Función para manejar la eliminación del logo desde el formulario
  const handleRemoveLogo = async () => {
      setLoading(true);
      setStatusMessage(null); // Limpiar mensajes anteriores

      const data = new FormData();
      // Enviar currentLogoUrl como null para indicar eliminación
      data.append('currentLogoUrl', ''); // Enviar string vacío o null para indicar eliminación

      // Enviar los otros campos para que la Server Action no falle por campos faltantes
      // Nota: En una implementación más robusta, podrías obtener estos campos del estado inicial
      // o manejar la eliminación del logo en una acción separada.
      data.append('store_name', formData.store_name);
      data.append('slug', formData.slug);
      data.append('description', formData.description);
      data.append('whatsapp_number', formData.whatsapp_number);
      data.append('social_links', formData.social_links);
      data.append('opening_hours', formData.opening_hours);
      data.append('location', formData.location);


      const result = await updateVendorProfile(data);

      if (result.success) {
          setStatusMessage({ text: result.message || 'Logo eliminado con éxito.', type: 'success' });
          setFormData({ ...formData, currentLogoUrl: '' }); // Limpiar la URL del logo en el estado local
          setLogoFile(null); // Asegurarse de que no haya un archivo seleccionado
      } else {
          setStatusMessage({ text: result.message || 'Error al eliminar el logo.', type: 'error' });
      }

      setLoading(false);
  };


  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Personalizar Microtienda</h2>

      {/* Usar ErrorMessage para mostrar mensajes de estado (éxito o error) */}
      {statusMessage && statusMessage.type === 'error' && (
         <ErrorMessage message={statusMessage.text} />
      )}
      {/* Mostrar mensaje de éxito */}
      {statusMessage && statusMessage.type === 'success' && (
          <div className="p-4 mb-4 text-sm rounded-lg bg-green-100 text-green-800" role="alert">
              {statusMessage.text}
          </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="store_name" className="block text-sm font-medium text-gray-700">
            Nombre de la Tienda
          </label>
          <input
            type="text"
            id="store_name"
            name="store_name"
            value={formData.store_name}
            onChange={handleChange}
            required
            className={`mt-1 block w-full px-3 py-2 border ${errors.store_name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
            {errors.store_name && <p className="mt-2 text-sm text-red-600">{errors.store_name}</p>}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug (URL amigable)
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className={`mt-1 block w-full px-3 py-2 border ${errors.slug ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
            {errors.slug && <p className="mt-2 text-sm text-red-600">{errors.slug}</p>}
            <p className="mt-2 text-sm text-gray-500">Ej: publimarket.com/tienda/{formData.slug || '[tu-slug]'}</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700">
            Número de WhatsApp
          </label>
          <input
            type="text"
            id="whatsapp_number"
            name="whatsapp_number"
            value={formData.whatsapp_number}
            onChange={handleChange}
            required
            className={`mt-1 block w-full px-3 py-2 border ${errors.whatsapp_number ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
            {errors.whatsapp_number && <p className="mt-2 text-sm text-red-600">{errors.whatsapp_number}</p>}
        </div>

        {/* Campos para JSONB - Simplificados como texto por ahora */}
        <div>
          <label htmlFor="social_links" className="block text-sm font-medium text-gray-700">
            Enlaces Sociales (Formato JSON)
          </label>
          <input
            type="text"
            id="social_links"
            name="social_links"
            value={formData.social_links}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.social_links ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder='Ej: {"facebook": "url", "instagram": "url"}'
          />
            {errors.social_links && <p className="mt-2 text-sm text-red-600">{errors.social_links}</p>}
            <p className="mt-2 text-sm text-gray-500">Introduce un objeto JSON con tus enlaces sociales.</p>
        </div>

          <div>
          <label htmlFor="opening_hours" className="block text-sm font-medium text-gray-700">
            Horarios de Atención (Formato JSON)
          </label>
          <input
            type="text"
            id="opening_hours"
            name="opening_hours"
            value={formData.opening_hours}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.opening_hours ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
             placeholder='Ej: {"Lunes": "9-18", "Sábado": "9-13"}'
          />
            {errors.opening_hours && <p className="mt-2 text-sm text-red-600">{errors.opening_hours}</p>}
            <p className="mt-2 text-sm text-gray-500">Introduce un objeto JSON con tus horarios.</p>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Ubicación
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Campo para Subir Logo */}
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
            Logo de la Tienda
          </label>
          <input
            type="file"
            id="logo"
            name="logo"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
           {formData.currentLogoUrl && (
                <div className="mt-4">
                    <p className="text-sm text-gray-700 mb-2">Logo actual:</p>
                    <img src={formData.currentLogoUrl} alt="Logo actual" className="w-32 h-32 object-cover rounded-md" />
                    <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={loading}
                        className="mt-2 text-red-600 hover:text-red-900 text-sm font-semibold"
                    >
                        Eliminar Logo
                    </button>
                </div>
           )}
        </div>


        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {/* Usar LoadingSpinner dentro del botón cuando esté cargando */}
            {loading ? (
              <div className="flex items-center">
                 <LoadingSpinner /> {/* Ajusta el tamaño si es necesario */}
                 <span className="ml-2">Guardando...</span>
              </div>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
