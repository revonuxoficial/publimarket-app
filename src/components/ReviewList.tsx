import React from 'react';
import type { Review } from '@/app/actions/reviews'; // Importar el tipo Review
import Image from 'next/image'; // Si se muestran avatares de usuario

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8">
        <p>Aún no hay reseñas para este vendedor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <div className="flex items-center mb-4">
            {/* Si hay avatares de usuario, mostrarlos aquí */}
            {/* review.users?.avatar_url ? (
              <Image
                src={review.users.avatar_url}
                alt={`Avatar de ${review.users.name || 'Usuario Anónimo'}`}
                width={40}
                height={40}
                className="rounded-full mr-4"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center mr-4 text-white font-bold">
                {review.users?.name ? review.users.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )*/}
            <div>
              <p className="font-semibold text-slate-800">{review.users?.name || 'Usuario Anónimo'}</p>
              {/* Mostrar calificación con estrellas */}
              <div className="flex items-center text-yellow-500 text-sm">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
            </div>
          </div>
          {review.comment && (
            <p className="text-slate-700 mb-4">{review.comment}</p>
          )}
          <p className="text-xs text-slate-500">
            {new Date(review.created_at).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;