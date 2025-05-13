'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPlatformAnnouncement, updatePlatformAnnouncement, PlatformAnnouncement } from '@/app/actions/platformAdmin';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PlatformAnnouncementFormProps {
  initialData?: PlatformAnnouncement | null;
}

const targetRoles = [
  { value: 'all', label: 'Todos los Usuarios' },
  { value: 'pro_vendor', label: 'Solo Vendedores PRO' },
  { value: 'user', label: 'Solo Compradores (rol user)' },
  // Se podrían añadir más roles si existieran
];

export default function PlatformAnnouncementForm({ initialData }: PlatformAnnouncementFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    target_role: initialData?.target_role || 'all',
    is_published: initialData?.is_published || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; // Para el checkbox

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.title || !formData.content) {
      setError('El título y el contenido del anuncio son obligatorios.');
      return;
    }

    startTransition(async () => {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('content', formData.content);
      payload.append('target_role', formData.target_role);
      payload.append('is_published', formData.is_published.toString());

      let result;
      if (initialData?.id) {
        payload.append('id', initialData.id);
        result = await updatePlatformAnnouncement(payload);
      } else {
        result = await createPlatformAnnouncement(payload);
      }

      if (result.success) {
        setSuccessMessage(initialData?.id ? 'Anuncio actualizado con éxito.' : 'Anuncio creado con éxito.');
        if (!initialData?.id) {
          setFormData({ title: '', content: '', target_role: 'all', is_published: false });
        }
        router.push('/admin/platform-anuncios');
        router.refresh();
      } else {
        setError(result.error || 'Ocurrió un error.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          {successMessage}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título del Anuncio</label>
        <input
          type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-slate-700">Contenido del Anuncio</label>
        <textarea
          name="content" id="content" value={formData.content} onChange={handleChange} required rows={6}
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
        ></textarea>
      </div>

      <div>
        <label htmlFor="target_role" className="block text-sm font-medium text-slate-700">Dirigido a</label>
        <select
          name="target_role" id="target_role" value={formData.target_role} onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
        >
          {targetRoles.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="is_published" name="is_published" type="checkbox"
          checked={formData.is_published} onChange={handleChange}
          className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
        />
        <label htmlFor="is_published" className="ml-2 block text-sm text-slate-900">
          Publicar inmediatamente
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70"
      >
        {isPending && (
          <span className="mr-2">
            <LoadingSpinner size="sm" message="" color="border-white"/>
          </span>
        )}
        {initialData?.id ? 'Actualizar Anuncio' : 'Crear Anuncio'}
      </button>
    </form>
  );
}
