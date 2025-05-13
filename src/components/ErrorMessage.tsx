import React from 'react';

// Ícono de error (ejemplo)
const ExclamationTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
  </svg>
);

interface ErrorMessageProps {
  message: string;
  title?: string; // Título opcional para el mensaje de error
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, title = "¡Ups! Algo salió mal" }) => {
  if (!message) return null; // No renderizar nada si no hay mensaje

  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0 text-red-500">
          <ExclamationTriangleIcon />
        </div>
        <div className="ml-3">
          <p className="text-sm font-bold text-red-800">{title}</p>
          <p className="text-sm text-red-700 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;
