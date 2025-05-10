'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient'; // Importar el cliente de Supabase del lado del cliente
import Link from 'next/link'; // Importar Link de next/link
import { useRouter } from 'next/navigation'; // Importar useRouter para redirigir después de logout
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

// Definir un tipo básico para el usuario de Supabase (SOLUCIÓN TEMPORAL)
// La forma recomendada es usar los tipos generados por la CLI
interface SupabaseUser {
  email: string | undefined;
  // Añadir otras propiedades del usuario si son necesarias
}


export default function AuthStatus() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient(); // Crear instancia del cliente del lado del cliente

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? { email: user.email } : null);
      setIsLoading(false);
    };

    getInitialSession();

    // Configurar listener para cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email } : null);
      setIsLoading(false); // Asegurarse de que isLoading sea false después de un cambio de estado
    });

    // Limpiar listener al desmontar el componente
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router]); // Dependencias del useEffect

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);

    if (error) {
      setError('Ocurrió un error al cerrar sesión. Intenta nuevamente.');
    } else {
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <LoadingSpinner />
        <span className="text-gray-600 text-sm">Cargando estado...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 text-sm">
      {error && <ErrorMessage message={error} />}
      {user ? (
        <>
          <span className="text-gray-800">Hola, {user.email}</span>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <LoadingSpinner />
                <span className="ml-2">Cerrando sesión...</span>
              </span>
            ) : (
              'Cerrar Sesión'
            )}
          </button>
        </>
      ) : (
        <>
          <Link href="/auth" className="text-blue-600 hover:underline">
            Iniciar Sesión
          </Link>
          <span className="text-gray-600">|</span>
          <Link href="/auth" className="text-blue-600 hover:underline">
            Registrarse
          </Link>
        </>
      )}
    </div>
  );
}
