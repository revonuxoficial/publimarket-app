import { checkAdmin } from '@/app/actions/utils';
import CategoryForm from '../CategoryForm'; // Ajustar ruta si es necesario

export default async function NuevaCategoriaPage() {
  await checkAdmin(); // Protege la ruta

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Añadir Nueva Categoría</h1>
        <p className="text-slate-600 mt-1">
          Creá una nueva categoría para organizar los productos en PubliMarket.
        </p>
      </header>
      <CategoryForm />
    </div>
  );
}
