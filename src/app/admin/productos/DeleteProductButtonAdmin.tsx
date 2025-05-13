'use client';

import { useState } from 'react';
import { deleteProductAdmin } from '@/app/actions/productsAdmin';
import { useRouter } from 'next/navigation';

interface DeleteProductButtonAdminProps {
  productId: string;
  productName: string;
}

export default function DeleteProductButtonAdmin({ productId, productName }: DeleteProductButtonAdminProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el producto "${productName}"? Esta acción es irreversible.`)) {
      setIsDeleting(true);
      const result = await deleteProductAdmin(productId);
      setIsDeleting(false);

      if (result.success) {
        console.log(`Producto "${productName}" eliminado con éxito.`);
        // Revalidar la página para eliminar el producto de la lista
        router.refresh();
      } else {
        console.error(`Error al eliminar el producto "${productName}":`, result.error);
        alert(`Error al eliminar el producto: ${result.error}`);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      {isDeleting ? 'Eliminando...' : 'Eliminar'}
    </button>
  );
}