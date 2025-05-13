'use client';

import { useState } from 'react';
import { ProductAdminView, updateProductAdmin } from '@/app/actions/productsAdmin';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/ErrorMessage';
import { CategoryBasic } from '@/app/actions/public'; // Importar CategoryBasic

interface AdminEditProductFormProps {
  product: ProductAdminView;
  categories: CategoryBasic[]; // Usar CategoryBasic
}

export default function AdminEditProductForm({ product, categories }: AdminEditProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await updateProductAdmin(product.id, formData);

    setIsSaving(false);

    if (result.success) {
      console.log(`Producto actualizado con éxito: ${product.name}`);
      // Opcional: Redirigir o mostrar mensaje de éxito
      router.push('/admin/productos'); // Redirigir de vuelta a la lista de productos
    } else {
      console.error('Error al actualizar el producto:', result.error);
      setError(result.error || 'Error desconocido al actualizar el producto.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre del Producto</label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={product.name}
          required
          className="mt-1 block w-full input-class" // Reemplazar input-class con clases de Tailwind
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descripción</label>
        <textarea
          id="description"
          name="description"
          defaultValue={product.description || ''}
          rows={4}
          className="mt-1 block w-full input-class" // Reemplazar input-class con clases de Tailwind
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-slate-700">Precio</label>
        <input
          type="number"
          id="price"
          name="price"
          defaultValue={product.price || ''}
          step="0.01"
          className="mt-1 block w-full input-class" // Reemplazar input-class con clases de Tailwind
        />
      </div>

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-slate-700">Categoría</label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={product.category_id || ''}
          className="mt-1 block w-full input-class" // Reemplazar input-class con clases de Tailwind
        >
          <option value="">Seleccionar categoría</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked={product.is_active}
          className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-slate-900">Producto Activo</label>
      </div>

      {/* TODO: Añadir campos para imágenes si el admin puede cambiarlas */}
      {/* TODO: Añadir campos para variaciones si el admin puede cambiarlas */}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
}