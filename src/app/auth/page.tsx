import AuthForm from '@/components/AuthForm';
import React from 'react';

// Componente de la página de autenticación
export default function AuthPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* El componente AuthForm ya tiene su propio contenedor y centrado */}
      {/* Si se necesitara un contenedor adicional o estilos diferentes, se añadirían aquí */}
      <AuthForm />
    </div>
  );
}
