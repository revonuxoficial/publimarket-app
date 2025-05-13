import React from 'react';

interface LoadingSpinnerProps {
  message?: string; // Mensaje opcional a mostrar
  size?: 'sm' | 'md' | 'lg'; // Tamaño opcional del spinner
  color?: string; // Color opcional del spinner (clase de Tailwind para el borde)
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Cargando...", 
  size = 'md',
  color = 'border-sky-500' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div className="flex flex-col justify-center items-center py-8 text-center">
      <div 
        className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]} ${color} border-t-transparent`}
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        <span className="sr-only">{message}</span> {/* Para accesibilidad */}
      </div>
      {message && <p className={`mt-3 ${textSizeClasses[size]} font-medium text-slate-600`}>{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
