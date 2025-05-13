import { checkAdmin } from '@/app/actions/utils';
import { getCategoryById } from '@/app/actions/categories';
import CategoryForm from '../../CategoryForm'; // Ruta corregida
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link';

interface EditCategoriaPageProps {
  params: {
    id: string; // El ID de la categoría viene de la URL
  };
}

export default async function EditCategoriaPage({ params }: EditCategoriaPageProps) {
  await checkAdmin(); // Protege la ruta
  const categoryId = params.id;

  const { data: category, error } = await getCategoryById(categoryId);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Editar Categoría</h1>
        <ErrorMessage message={`Error al cargar la categoría: ${error}`} />
        <Link href="/admin/categorias" className="mt-4 inline-block text-sky-600 hover:underline">
          Volver a la lista de categorías
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Editar Categoría</h1>
        <ErrorMessage message="Categoría no encontrada." />
        <Link href="/admin/categorias" className="mt-4 inline-block text-sky-600 hover:underline">
          Volver a la lista de categorías
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Editar Categoría</h1>
        <p className="text-slate-600 mt-1">
          Modificá los detalles de la categoría "{category.name}".
        </p>
      </header>
      <CategoryForm initialData={category} />
    </div>
  );
}
