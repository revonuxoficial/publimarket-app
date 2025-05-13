'use client';

import { useState } from 'react';
import { updateProductFeaturedStatus } from '@/app/actions/productsAdmin';
import { useRouter } from 'next/navigation';

interface FeatureProductButtonAdminProps {
  productId: string;
  initialIsFeatured: boolean;
}

export default function FeatureProductButtonAdmin({ productId, initialIsFeatured }: FeatureProductButtonAdminProps) {
  const [isFeaturing, setIsFeaturing] = useState(false);
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const router = useRouter();

  const handleFeatureToggle = async () => {
    setIsFeaturing(true);
    const result = await updateProductFeaturedStatus(productId, !isFeatured);
    setIsFeaturing(false);

    if (result.success) {
      setIsFeatured(!isFeatured);
      console.log(`Producto ${!isFeatured ? 'marcado' : 'desmarcado'} como destacado con éxito.`);
      // Opcional: Revalidar la página principal si es necesario
      // router.refresh(); // Esto revalidaría la página actual, no necesariamente la principal
    } else {
      console.error(`Error al ${!isFeatured ? 'marcar' : 'desmarcar'} producto como destacado:`, result.error);
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <button
      onClick={handleFeatureToggle}
      disabled={isFeaturing}
      className={`px-3 py-1 text-sm rounded ${
        isFeatured
          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
          : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isFeaturing ? 'Procesando...' : isFeatured ? 'Destacado' : 'Marcar Destacado'}
    </button>
  );
}