import { checkAdmin } from '@/app/actions/utils';
import { getProductForAdmin, updateProductAdmin } from '@/app/actions/productsAdmin';
import { getUniqueCategories } from '@/app/actions/public'; // Importar función para obtener categorías
import AdminEditProductForm from './AdminEditProductForm'; // Crearemos este componente a continuación
import ErrorMessage from '@/components/ErrorMessage';

export const metadata = {
  title: 'Editar Producto (Admin) - PubliMarket',
  description: 'Editar un producto como administrador en PubliMarket.',
};

interface AdminEditProductPageProps {
  params: {
    id: string;
  };
}

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  await checkAdmin(); // Asegura que solo los administradores puedan acceder a esta página

  const productId = params.id;

  const { data: product, error } = await getProductForAdmin(productId);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorMessage message={`Error al cargar el producto: ${error}`} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <ErrorMessage message="Producto no encontrado." />
      </div>
    );
  }

  const categories = await getUniqueCategories(); // Obtener categorías

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Editar Producto (Admin)</h1>
        <p className="text-slate-600">ID del Producto: {productId}</p>
      </header>
      
      <AdminEditProductForm product={product} categories={categories} />
    </div>
  );
}