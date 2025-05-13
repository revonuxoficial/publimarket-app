'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addCategory, updateCategory, Category } from '@/app/actions/categories'; // Importar acciones y tipo
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CategoryFormProps {
  initialData?: Category | null; // Para modo edición
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // reemplazar espacios con -
      .replace(/[^\w-]+/g, '') // remover caracteres no alfanuméricos excepto -
      .replace(/--+/g, '-'); // reemplazar múltiples - con uno solo
  };

  const handleNameChangeAndGenerateSlug = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      slug: name === 'name' && !initialData?.slug ? generateSlug(value) : prev.slug, // Solo auto-generar slug si es nuevo y el campo slug no ha sido tocado manualmente (o si initialData no tiene slug)
    }));
    setError(null);
    setSuccessMessage(null);
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.name || !formData.slug) {
      setError('El nombre y el slug de la categoría son obligatorios.');
      return;
    }

    startTransition(async () => {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('slug', formData.slug);
      if (formData.description) {
        payload.append('description', formData.description);
      }

      let result;
      if (initialData?.id) {
        payload.append('id', initialData.id);
        result = await updateCategory(payload);
      } else {
        result = await addCategory(payload);
      }

      if (result.success) {
        setSuccessMessage(initialData?.id ? 'Categoría actualizada con éxito.' : 'Categoría añadida con éxito.');
        // Opcional: resetear formulario o redirigir
        if (!initialData?.id) { // Si es nueva categoría
          setFormData({ name: '', slug: '', description: '' });
        }
        router.push('/admin/categorias'); // Redirigir a la lista de categorías
        router.refresh(); // Asegurar que la lista se actualice
      } else {
        setError(result.error || 'Ocurrió un error.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          {successMessage}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Nombre de la Categoría
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleNameChangeAndGenerateSlug}
          required
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
          Slug (URL amigable)
        </label>
        <input
          type="text"
          name="slug"
          id="slug"
          value={formData.slug}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          readOnly={!!initialData?.slug && formData.name === initialData?.name} // Hacer readonly si se edita y el nombre no ha cambiado, para evitar cambios accidentales de slug
        />
         {!initialData?.slug && <p className="mt-1 text-xs text-slate-500">Se generará automáticamente a partir del nombre, o puedes personalizarlo.</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Descripción (Opcional)
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70"
      >
        {isPending && (
          <span className="mr-2">
            <LoadingSpinner size="sm" message="" /> {/* Usar props existentes, mensaje vacío para no mostrar texto */}
          </span>
        )}
        {initialData?.id ? 'Actualizar Categoría' : 'Añadir Categoría'}
      </button>
    </form>
  );
}
