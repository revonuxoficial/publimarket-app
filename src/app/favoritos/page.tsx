'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getUserFavoriteProductIds } from '@/app/actions/favorites';
import { getProductByIdOrSlug } from '@/app/actions/public';
import FavoriteButton from '@/components/FavoriteButton';
import ErrorMessage from '@/components/ErrorMessage';

export default async function FavoritesPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-xl">Debes iniciar sesión para ver tus favoritos.</p>
        <Link href="/auth" className="text-sky-600 hover:underline">Iniciar sesión</Link>
      </div>
    );
  }

  // Llamamos a getUserFavoriteProductIds sin argumentos
  const favoriteData = await getUserFavoriteProductIds();
  const favoriteProductIds: string[] = favoriteData.productIds ?? [];

  if (!favoriteProductIds.length) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-xl">No tienes productos favoritos.</p>
        <Link href="/productos" className="text-sky-600 hover:underline">Ver productos</Link>
      </div>
    );
  }

  const favorites = await Promise.all(
    favoriteProductIds.map(async (id: string): Promise<any> => {
      const product = await getProductByIdOrSlug(id);
      return product;
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Favoritos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((product: any, index: number) =>
          product ? (
            <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={product.main_image_url || '/placeholder-image.png'}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                <p className="text-sky-600 mb-4">
                  {product.price ? `$${product.price.toFixed(2)}` : 'Consultar precio'}
                </p>
                <Link href={`/producto/${product.slug}`} className="text-sky-600 hover:underline">
                  Ver detalles
                </Link>
                <div className="mt-2">
                  <FavoriteButton productId={product.id} initialFavorite={true} />
                </div>
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
