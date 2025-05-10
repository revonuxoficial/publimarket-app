'use client';

import React, { useState } from 'react';
import { handleAuth } from '@/app/actions/public'; // Importar la Server Action
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Cliente de Supabase del lado del cliente
import { useRouter } from 'next/navigation'; // Para redirigir después de añadir el producto
import LoadingSpinner from '@/components/LoadingSpinner'; // Importar componente de carga
import ErrorMessage from '@/components/ErrorMessage'; // Importar componente de error


export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Usaremos un estado para mensajes de estado (éxito o error)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);


  const router = useRouter();
  const supabase = createClientComponentClient();


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatusMessage(null); // Limpiar mensajes anteriores

    const formData = new FormData(event.currentTarget);
    formData.append('action', mode); // Añadir la acción (login/register) al FormData

    const result = await handleAuth(formData);

    if (!result.success) {
      setStatusMessage({ text: result.message || 'Ocurrió un error durante la autenticación.', type: 'error' });
    } else {
      setStatusMessage({ text: result.message || 'Operación exitosa.', type: 'success' });
      // Opcional: Redirigir al usuario después de login/registro exitoso
      // router.push('/dashboard');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>

        {/* Usar ErrorMessage para mostrar errores */}
        {statusMessage && statusMessage.type === 'error' && (
           <ErrorMessage message={statusMessage.text} />
        )}
        {/* Mostrar mensaje de éxito */}
        {statusMessage && statusMessage.type === 'success' && (
            <div className="p-4 mb-4 text-sm rounded-lg bg-green-100 text-green-800" role="alert">
                {statusMessage.text}
            </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {/* Usar LoadingSpinner dentro del botón cuando esté cargando */}
            {isLoading ? (
              <div className="flex items-center">
                 <LoadingSpinner /> {/* Ajusta el tamaño si es necesario */}
                 <span className="ml-2">Procesando...</span>
              </div>
            ) : (
              mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'
            )}
          </button>
        </form>

        {/* Eliminar manejo local de error y message */}
        {/* error && (
          <div className="mt-4 text-center text-sm text-red-600">
            {error}
          </div>
        ) */}

        {/* message && (
          <div className="mt-4 text-center text-sm text-green-600">
            {message}
          </div>
        ) */}

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-500"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
