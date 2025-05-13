'use client';

import React, { useState } from 'react';
import { addReview } from '@/app/actions/reviews'; // Importar la Server Action
import LoadingSpinner from './LoadingSpinner'; // Importar spinner
import ErrorMessage from './ErrorMessage'; // Importar mensaje de error

interface ReviewFormProps {
  vendorId: string; // ID del vendedor al que se le deja la reseña
  productId?: string | null; // ID del producto asociado (opcional)
  onReviewSubmitted?: () => void; // Callback para cuando se envía la reseña exitosamente
}

const ReviewForm: React.FC<ReviewFormProps> = ({ vendorId, productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (rating === 0) {
      setError('Por favor, selecciona una calificación.');
      setIsLoading(false);
      return;
    }

    const result = await addReview({
      vendorId,
      rating,
      comment: comment.trim() === '' ? null : comment.trim(), // Enviar null si el comentario está vacío
      productId,
    });

    if (result.success) {
      setSuccessMessage('Reseña enviada exitosamente. Estará visible una vez aprobada.');
      setRating(0); // Resetear formulario
      setComment('');
      if (onReviewSubmitted) {
        onReviewSubmitted(); // Llamar callback
      }
    } else {
      setError(result.error || 'Ocurrió un error al enviar la reseña.');
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Dejar una Reseña</h3>
      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">¡Éxito!</strong>
          <span className="block sm:inline ml-2">{successMessage}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Calificación:</label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                fill={star <= rating ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-yellow-500' : 'text-slate-300'} hover:text-yellow-400 transition-colors duration-200`}
                onClick={() => setRating(star)}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.971 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.329 1.176l1.519 4.674c.3.921-.755 1.688-1.539 1.175l-4.915-3.573a1 1 0 00-1.176 0l-4.915 3.573c-.784.513-1.838-.254-1.539-1.176l1.519-4.674a1 1 0 00-.329-1.176L2.305 9.105c-.783-.57-.383-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">Comentario (Opcional):</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || rating === 0}
        >
          {isLoading ? <LoadingSpinner /> : 'Enviar Reseña'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;