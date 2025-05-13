'use client';

import React, { useState, useEffect, useRef } from 'react'; // Añadir useRef
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

  // Hooks para el menú desplegable, movidos al inicio
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // useEffect para onAuthStateChange
  useEffect(() => {
    console.log('[AuthStatus] useEffect triggered. Subscribing to onAuthStateChange.');
    setIsLoading(true); // Iniciar como cargando

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[AuthStatus] onAuthStateChange event: ${event}`);
      console.log('[AuthStatus] Session from onAuthStateChange:', session ? { user_id: session.user.id, email: session.user.email, expires_at: session.expires_at } : null);
      
      setUser(session?.user ? { email: session.user.email } : null);
      setIsLoading(false); // Dejar de cargar una vez que se recibe el primer evento (o INITIAL_SESSION)
      
      // Si el evento es INITIAL_SESSION y no hay sesión, también es un estado final para la carga inicial.
      if (event === 'INITIAL_SESSION' && !session) {
        console.log('[AuthStatus] INITIAL_SESSION event with no session.');
      }
      if (event === 'SIGNED_IN') {
        console.log('[AuthStatus] User SIGNED_IN. Email:', session?.user?.email);
      }
      if (event === 'SIGNED_OUT') {
        console.log('[AuthStatus] User SIGNED_OUT.');
      }
    });

    return () => {
      console.log('[AuthStatus] Unsubscribing from onAuthStateChange.');
      authListener?.subscription.unsubscribe();
    };
  }, []); // El array de dependencias vacío asegura que esto se ejecute solo al montar/desmontar.

  // useEffect para cerrar menú si se hace clic fuera, movido aquí
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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

  // Asumimos que el rol del usuario y si es pro_vendor se obtendría aquí o se pasaría como prop
  // Por ahora, para el ejemplo, solo mostraremos "Panel de Vendedor" si está logueado.
  // En una implementación real, se necesitaría obtener el userProfileData.role === 'pro_vendor'
  const isProVendor = user ? true : false; // Placeholder - esto necesitaría lógica real

  return (
    <div className="relative flex items-center space-x-4 text-sm">
      {error && <ErrorMessage message={error} />}
      {user ? (
        <div ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-sky-600 hover:underline font-medium flex items-center"
          >
            Mi Perfil
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ml-1 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}>
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50">
              <Link 
                href="/perfil" 
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-sky-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Ver Mi Perfil
              </Link>
              {/* Idealmente, aquí se verificaría si el usuario es 'pro_vendor' */}
              {isProVendor && (
                <Link 
                  href="/dashboard/vendedor" 
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-sky-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Panel de Vendedor
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                disabled={isLoading}
                className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-sky-600 disabled:opacity-50"
              >
                {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <> {/* Envolver en fragmento para asegurar que sea una única expresión JSX */}
          {/* Botón "Ingresar / Registrarse" alineado con colores de marca */}
          <Link 
            href="/auth" 
            className="px-4 py-2 border border-sky-600 text-sky-600 rounded-full text-sm font-semibold hover:bg-sky-600 hover:text-white transition-colors duration-200 ease-in-out"
          >
            Ingresar / Registrarse
          </Link>
        </>
      )}
    </div>
  );
}
