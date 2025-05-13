import { checkAdmin } from '@/app/actions/utils';
import { getCategories, Category } from '@/app/actions/categories';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';
import DeleteCategoryButton from './DeleteCategoryButton'; // Importar el botón de eliminar
// import CategoryFormModal from './CategoryFormModal'; // O un enlace a una página de formulario

export default async function AdminCategoriasPage() {
  await checkAdmin(); // Protege la ruta

  const { data: categories, error } = await getCategories();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Categorías</h1>
        <Link
          href="/admin/categorias/nueva" // Enlace a la página de creación
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
        >
          Añadir Nueva Categoría
        </Link>
      </div>

      {error && <ErrorMessage message={`Error al cargar categorías: ${error}`} />}

      {!error && categories && categories.length > 0 ? (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {categories.map((category: Category) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{category.slug}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={category.description || ''}>
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/categorias/editar/${category.id}`}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Editar
                    </Link>
                    <span className="text-slate-300">|</span>
                    <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && <p className="text-center text-slate-600 py-8">No hay categorías para mostrar.</p>
      )}
    </div>
  );
}
